'use strict';
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const { createApp } = require('../server');

const TOKEN = 'test-service-token-0123456789';
const ID_A = '11111111-1111-4111-8111-111111111111', ID_B = '22222222-2222-4222-8222-222222222222';

function listen(handler) { return new Promise(r => { const s = http.createServer(handler); s.listen(0, '127.0.0.1', () => r(s)); }); }

async function setup(t) {
  // Fake TAKATAK-V1 exchange: one-time codes -> identity.
  const codes = new Map();
  const v1 = await listen((req, res) => {
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      const send = (s, j) => { res.writeHead(s, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(j)); };
      if (req.headers.authorization !== 'Bearer ' + TOKEN) return send(403, { ok: false });
      const { code } = JSON.parse(body); const id = codes.get(code); codes.delete(code);
      if (!id) return send(403, { ok: false });
      send(200, { ok: true, session: { masterIdentityId: id, displayName: 'Parent ' + id.slice(0, 1), productCode: id === 'wrong' ? 'academy' : 'beh4vior', entitlements: ['beh4vior_free'], expiresAt: new Date(Date.now() + 3600e3).toISOString() } });
    });
  });
  const v1Origin = 'http://127.0.0.1:' + v1.address().port;
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'b4-')), 'db.json');
  const app = createApp({ TAKATAK_BEH4VIOR_LAUNCH_URL: v1Origin + '/api/experiences/beh4vior/launch', TAKATAK_BEH4VIOR_EXCHANGE_URL: v1Origin + '/api/experiences/beh4vior/exchange',
    TAKATAK_BEH4VIOR_SERVICE_TOKEN: TOKEN, BEH4VIOR_SESSION_SECRET: 'x'.repeat(40), BEH4VIOR_DATA_FILE: file });
  const srv = await listen(app.handler);
  const origin = 'http://127.0.0.1:' + srv.address().port;
  t.after(() => { v1.close(); srv.close(); });
  const code = id => { const c = Buffer.from(require('node:crypto').randomBytes(32)).toString('base64url'); codes.set(c, id); return c; };
  async function signIn(id) {
    const start = await fetch(origin + '/auth/start', { redirect: 'manual' });
    assert.strictEqual(start.status, 303);
    const stateCookie = start.headers.getSetCookie()[0].split(';')[0];
    const state = new URL(start.headers.get('location')).searchParams.get('state');
    assert.match(state, /^[A-Za-z0-9_-]{43}$/);
    const cb = await fetch(origin + '/auth/callback?code=' + code(id) + '&state=' + state, { redirect: 'manual', headers: { cookie: stateCookie } });
    return { cb, cookie: (cb.headers.getSetCookie().find(c => c.startsWith('b4s=') && !c.includes('Max-Age=0')) || '').split(';')[0] };
  }
  return { origin, signIn, code };
}
const DAY = { faces: { recessAM: 'sad', circle: 'happy', bogus: 'happy', desk: 'purple' }, cellNotes: { recessAM: 'x'.repeat(999) }, proud: 'p', notes: '', extra: 1,
  goals: [{ period: 'recessAM', text: 'Come inside', kind: 'fix', from: '2026-11-10', why: '' }, { period: 'nope', text: 'x' }] };

test('API refuses anyone who is not signed in', async t => {
  const { origin } = await setup(t);
  assert.strictEqual((await fetch(origin + '/api/state')).status, 401);
  const put = await fetch(origin + '/api/days/2026-11-10', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: origin }, body: '{}' });
  assert.strictEqual(put.status, 401);
  assert.strictEqual((await fetch(origin + '/api/state', { headers: { cookie: 'b4s=forged.forged' } })).status, 401);
});

test('sign-in through the V1 exchange, save and read back, cleaned', async t => {
  const { origin, signIn } = await setup(t);
  const { cb, cookie } = await signIn(ID_A);
  assert.strictEqual(cb.status, 303); assert.ok(cookie);
  const h = { cookie, 'Content-Type': 'application/json', Origin: origin };
  assert.strictEqual((await fetch(origin + '/api/days/2026-11-10', { method: 'PUT', headers: h, body: JSON.stringify(DAY) })).status, 200);
  assert.strictEqual((await fetch(origin + '/api/child', { method: 'PUT', headers: h, body: JSON.stringify({ name: '  Sam  ' }) })).status, 200);
  const s = await (await fetch(origin + '/api/state', { headers: { cookie } })).json();
  assert.strictEqual(s.child.name, 'Sam');
  const d = s.days['2026-11-10'];
  assert.deepStrictEqual(d.faces, { circle: 'happy', recessAM: 'sad' });
  assert.strictEqual(d.cellNotes.recessAM.length, 300);
  assert.strictEqual(d.goals.length, 1); assert.strictEqual(d.extra, undefined);
  assert.strictEqual((await fetch(origin + '/api/days/not-a-date', { method: 'PUT', headers: h, body: '{}' })).status, 400);
});

test('one account never sees another account', async t => {
  const { origin, signIn } = await setup(t);
  const a = await signIn(ID_A), b = await signIn(ID_B);
  await fetch(origin + '/api/days/2026-11-10', { method: 'PUT', headers: { cookie: a.cookie, 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(DAY) });
  const sb = await (await fetch(origin + '/api/state', { headers: { cookie: b.cookie } })).json();
  assert.deepStrictEqual(sb.days, {}); assert.strictEqual(sb.child, null);
});

test('bad state, reused code, wrong product and cross-site writes are refused', async t => {
  const { origin, signIn, code } = await setup(t);
  const start = await fetch(origin + '/auth/start', { redirect: 'manual' });
  const stateCookie = start.headers.getSetCookie()[0].split(';')[0];
  const other = 'A'.repeat(43);
  assert.strictEqual((await fetch(origin + '/auth/callback?code=' + code(ID_A) + '&state=' + other, { redirect: 'manual', headers: { cookie: stateCookie } })).status, 400);
  assert.strictEqual((await fetch(origin + '/auth/callback?code=' + code(ID_A) + '&state=' + other, { redirect: 'manual' })).status, 400);
  const state = new URL(start.headers.get('location')).searchParams.get('state');
  const c = code(ID_A);
  assert.strictEqual((await fetch(origin + '/auth/callback?code=' + c + '&state=' + state, { redirect: 'manual', headers: { cookie: stateCookie } })).status, 303);
  assert.strictEqual((await fetch(origin + '/auth/callback?code=' + c + '&state=' + state, { redirect: 'manual', headers: { cookie: stateCookie } })).status, 403);
  assert.strictEqual((await signIn('wrong')).cb.status, 403);
  const { cookie } = await signIn(ID_A);
  const evil = await fetch(origin + '/api/days/2026-11-10', { method: 'PUT', headers: { cookie, 'Content-Type': 'application/json', Origin: 'https://evil.example' }, body: JSON.stringify(DAY) });
  assert.strictEqual(evil.status, 403);
  const noOrigin = await fetch(origin + '/api/days/2026-11-10', { method: 'PUT', headers: { cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(DAY) });
  assert.strictEqual(noOrigin.status, 403);
});

test('production refuses to run half-configured', async () => {
  const app = createApp({ NODE_ENV: 'production', BEH4VIOR_DEMO: '1', BEH4VIOR_DEV_LOGIN: '1' });
  assert.strictEqual(app.authReady, false); assert.strictEqual(app.storage, null);
  assert.strictEqual(app.cfg.demo, false); assert.strictEqual(app.cfg.devLogin, false);
  const srv = await listen(app.handler); const origin = 'http://127.0.0.1:' + srv.address().port;
  try {
    assert.strictEqual((await fetch(origin + '/healthz')).status, 503);
    assert.strictEqual((await fetch(origin + '/auth/start', { redirect: 'manual' })).status, 503);
    assert.strictEqual((await fetch(origin + '/api/state')).status, 401);
    const page = await fetch(origin + '/'); assert.strictEqual(page.status, 200);
    assert.match(page.headers.get('content-security-policy'), /default-src 'self'/);
  } finally { srv.close(); }
});
