'use strict';
/*
 * BEH4VIOR server. Serves the tracker page and a small JSON API.
 * Sign-in belongs to TAKATAK-V1 (docs/TAKATAK_V1_BRIDGE.md):
 *   /auth/start     -> V1 /api/experiences/beh4vior/launch?state=...
 *   /auth/callback  <- V1 redirects back with a one-time code; we exchange it
 *                      server-to-server and set our own signed session cookie.
 * Every row is scoped by the adult's master identity id. No child data is sent to V1.
 */
const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { createStorage } = require('./lib/storage');
const { cleanDay, cleanChild, isDate } = require('./lib/validate');

const APP_DIR = path.join(__dirname, 'app');
const SESSION_MAX_MS = 12 * 60 * 60 * 1000;
const STATE_MAX_S = 600;
const BODY_LIMIT = 64 * 1024;

function b64url(buf) { return Buffer.from(buf).toString('base64url'); }
function safeEqual(a, b) { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); }
function httpsUrl(raw, prod) {
  try {
    const u = new URL(raw);
    if (u.username || u.password) return null;
    if (u.protocol === 'https:') return u;
    if (!prod && u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname)) return u;
  } catch { /* not a URL */ }
  return null;
}

function createApp(env = process.env, deps = {}) {
  const prod = env.NODE_ENV === 'production';
  const cfg = {
    launch: httpsUrl(env.TAKATAK_BEH4VIOR_LAUNCH_URL || '', prod),
    exchange: httpsUrl(env.TAKATAK_BEH4VIOR_EXCHANGE_URL || '', prod),
    token: (env.TAKATAK_BEH4VIOR_SERVICE_TOKEN || '').trim(),
    secret: env.BEH4VIOR_SESSION_SECRET || '',
    origin: (httpsUrl(env.BEH4VIOR_PUBLIC_ORIGIN || '', prod) || {}).origin || null,
    demo: !prod && env.BEH4VIOR_DEMO === '1',
    devLogin: !prod && env.BEH4VIOR_DEV_LOGIN === '1',
  };
  if (!prod && !cfg.secret) cfg.secret = crypto.randomBytes(32).toString('hex'); // local runs only
  const authReady = !!(cfg.launch && cfg.exchange && cfg.token.length >= 20 && cfg.secret.length >= 32);
  const storage = deps.storage || createStorage(env);
  const fetchImpl = deps.fetch || fetch;
  const cookieName = prod ? '__Host-b4s' : 'b4s';
  const stateName = prod ? '__Host-b4state' : 'b4state';
  const secure = prod ? '; Secure' : '';

  const sign = payload => {
    const body = b64url(JSON.stringify(payload));
    return body + '.' + b64url(crypto.createHmac('sha256', cfg.secret).update(body).digest());
  };
  const verify = token => {
    if (!token || !cfg.secret) return null;
    const [body, mac] = String(token).split('.');
    if (!body || !mac || !safeEqual(mac, b64url(crypto.createHmac('sha256', cfg.secret).update(body).digest()))) return null;
    try {
      const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      return p && typeof p.id === 'string' && p.exp > Date.now() ? p : null;
    } catch { return null; }
  };
  const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p.length === 2));
  const send = (res, status, body, headers = {}) => {
    const isJson = typeof body === 'object' && !Buffer.isBuffer(body);
    const data = isJson ? JSON.stringify(body) : body || '';
    res.writeHead(status, {
      'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      ...(prod ? { 'Strict-Transport-Security': 'max-age=31536000' } : {}),
      ...headers,
    });
    res.end(data);
  };
  const redirect = (res, to, headers = {}) => send(res, 303, '', { Location: to, ...headers });
  const sameOrigin = req => {
    const origin = req.headers.origin;
    if (!origin) return false;
    const expected = cfg.origin || ((req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim() + '://' + req.headers.host);
    return origin === expected;
  };
  const readJson = req => new Promise((resolve, reject) => {
    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return reject(Object.assign(new Error('json'), { status: 415 }));
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > BODY_LIMIT) { reject(Object.assign(new Error('large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(Object.assign(new Error('bad json'), { status: 400 })); } });
    req.on('error', reject);
  });
  const sessionCookie = (id, name, exp) =>
    `${cookieName}=${sign({ id, name, exp })}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(1, Math.floor((exp - Date.now()) / 1000))}${secure}`;
  const clear = name => `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;

  const STATIC = {
    '/': ['index.html', 'text/html; charset=utf-8'],
    '/index.html': ['index.html', 'text/html; charset=utf-8'],
    '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
    '/storage.js': [cfg.demo ? 'storage-local.js' : 'storage-server.js', 'text/javascript; charset=utf-8'],
  };

  async function handler(req, res) {
    const url = new URL(req.url, 'http://local');
    const p = url.pathname;
    try {
      if (req.method === 'GET' && p === '/healthz') {
        let db = storage ? storage.kind : 'not_configured';
        if (storage) { try { await storage.ping(); } catch { db = 'unreachable'; } }
        const ok = cfg.demo || (authReady || cfg.devLogin) && storage && db !== 'unreachable';
        return send(res, ok ? 200 : 503, { ok: !!ok, mode: cfg.demo ? 'demo' : 'app', signIn: authReady ? 'takatak-v1' : cfg.devLogin ? 'dev' : 'not_configured', storage: db });
      }
      if (req.method === 'GET' && p === '/favicon.ico') return send(res, 204, '');
      if (req.method === 'GET' && STATIC[p]) {
        const [file, type] = STATIC[p];
        return send(res, 200, fs.readFileSync(path.join(APP_DIR, file)), { 'Content-Type': type, 'Cache-Control': 'no-cache' });
      }

      if (req.method === 'GET' && p === '/auth/start') {
        if (cfg.demo) return redirect(res, '/');
        if (cfg.devLogin && !authReady) return redirect(res, '/', { 'Set-Cookie': sessionCookie('dev-local', 'Local test', Date.now() + SESSION_MAX_MS) });
        if (!authReady) return send(res, 503, 'Sign-in is not configured yet.');
        const state = b64url(crypto.randomBytes(32)); // 43 characters, as V1 requires
        const to = new URL(cfg.launch); to.searchParams.set('state', state);
        return redirect(res, to.toString(), { 'Set-Cookie': `${stateName}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${STATE_MAX_S}${secure}` });
      }
      if (req.method === 'GET' && p === '/auth/callback') {
        if (!authReady) return send(res, 503, 'Sign-in is not configured yet.');
        const code = url.searchParams.get('code') || '', state = url.searchParams.get('state') || '';
        const expected = cookies(req)[stateName] || '';
        if (!/^[A-Za-z0-9_-]{43}$/.test(code) || !/^[A-Za-z0-9_-]{43}$/.test(state) || !expected || !safeEqual(state, expected)) {
          return send(res, 400, 'This sign-in link is not valid any more. Open BEH4VIOR again to sign in.', { 'Set-Cookie': clear(stateName) });
        }
        let session = null;
        try {
          const r = await fetchImpl(cfg.exchange, { method: 'POST', signal: AbortSignal.timeout(8000),
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.token }, body: JSON.stringify({ code }) });
          const j = r.ok ? await r.json() : null;
          if (j && j.ok === true) session = j.session;
        } catch { session = null; }
        const until = session ? Date.parse(session.expiresAt) : NaN;
        if (!session || session.productCode !== 'beh4vior' || !Array.isArray(session.entitlements) || !session.entitlements.includes('beh4vior_free') ||
          typeof session.masterIdentityId !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(session.masterIdentityId) || !(until > Date.now())) {
          return send(res, 403, 'TAKATAK could not confirm this sign-in. Open BEH4VIOR again to retry.', { 'Set-Cookie': clear(stateName) });
        }
        const exp = Math.min(until, Date.now() + SESSION_MAX_MS);
        const name = typeof session.displayName === 'string' ? session.displayName.slice(0, 80) : '';
        return redirect(res, '/', { 'Set-Cookie': [clear(stateName), sessionCookie(session.masterIdentityId, name, exp)] });
      }
      if (req.method === 'POST' && p === '/auth/logout') {
        if (!sameOrigin(req)) return send(res, 403, { ok: false });
        return redirect(res, '/', { 'Set-Cookie': clear(cookieName) });
      }

      if (p.startsWith('/api/')) {
        if (cfg.demo) return send(res, 404, { ok: false });
        const me = verify(cookies(req)[cookieName]);
        if (!me) return send(res, 401, { ok: false, message: 'Sign in required.' });
        if (!storage) return send(res, 503, { ok: false, message: 'Storage is not configured.' });
        if (req.method === 'GET' && p === '/api/state') {
          const s = await storage.getState(me.id);
          return send(res, 200, { ok: true, displayName: me.name || '', child: s.child, days: s.days });
        }
        if (req.method !== 'GET' && !sameOrigin(req)) return send(res, 403, { ok: false, message: 'Cross-site request refused.' });
        const dayMatch = /^\/api\/days\/([^/]+)$/.exec(p);
        if (req.method === 'PUT' && dayMatch) {
          const date = decodeURIComponent(dayMatch[1]);
          const day = isDate(date) ? cleanDay(date, await readJson(req)) : null;
          if (!day) return send(res, 400, { ok: false, message: 'Invalid day.' });
          await storage.putDay(me.id, date, day);
          return send(res, 200, { ok: true });
        }
        if (req.method === 'PUT' && p === '/api/child') {
          const child = cleanChild(await readJson(req));
          if (!child) return send(res, 400, { ok: false, message: 'Invalid name.' });
          await storage.putChild(me.id, child);
          return send(res, 200, { ok: true });
        }
        if (req.method === 'DELETE' && p === '/api/everything') { // the parent's own delete path
          await storage.deleteAll(me.id);
          return send(res, 200, { ok: true });
        }
        return send(res, 404, { ok: false });
      }
      return send(res, 404, 'Not found.');
    } catch (e) {
      if (e && e.status) return send(res, e.status, { ok: false });
      console.error('request failed', req.method, p, e && e.message); // never log bodies: they hold a child's sheet
      return send(res, 500, { ok: false });
    }
  }
  return { handler, storage, authReady, cfg };
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT || 3000);
  (async () => {
    if (app.storage) await app.storage.init();
    http.createServer(app.handler).listen(port, '0.0.0.0', () => {
      console.log(`BEH4VIOR listening on ${port} | sign-in: ${app.authReady ? 'takatak-v1' : app.cfg.devLogin ? 'dev' : app.cfg.demo ? 'demo' : 'NOT CONFIGURED'} | storage: ${app.storage ? app.storage.kind : 'NOT CONFIGURED'}`);
    });
  })().catch(e => { console.error('startup failed:', e.message); process.exit(1); });
}

module.exports = { createApp };
