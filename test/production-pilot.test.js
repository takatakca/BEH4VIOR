'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const { createApp } = require('../server');

const ACCOUNT_1 = '11111111-1111-4111-8111-111111111111';
const ACCOUNT_2 = '22222222-2222-4222-8222-222222222222';
const SECRET = 's'.repeat(64);
const baseEnv = {
  NODE_ENV: 'production',
  BEH4VIOR_PUBLIC_ORIGIN: 'https://beh4vior.takatak.ca',
  TAKATAK_BEH4VIOR_LAUNCH_URL: 'https://takatak.ca/api/experiences/beh4vior/launch',
  TAKATAK_BEH4VIOR_EXCHANGE_URL: 'https://takatak.ca/api/experiences/beh4vior/exchange',
  TAKATAK_BEH4VIOR_SERVICE_TOKEN: 't'.repeat(48),
  BEH4VIOR_SESSION_SECRET: SECRET,
};
const storage = {
  kind: 'postgres', ping: async () => {}, getState: async () => ({child:null,days:{}}),
  putDay: async () => {}, putChild: async () => {}, deleteAll: async () => {}
};
function listen(app) {
  return new Promise(resolve => {
    const server = http.createServer(app.handler);
    server.listen(0,'127.0.0.1', () => resolve({server,origin:'http://127.0.0.1:'+server.address().port}));
  });
}
function fakeExchange(account) {
  return async () => ({
    ok:true,
    json:async () => ({ok:true,session:{
      masterIdentityId:account,displayName:'Invented Test Parent',productCode:'beh4vior',
      entitlements:['beh4vior_free'],expiresAt:new Date(Date.now()+600000).toISOString()
    }})
  });
}
async function exchange(origin, account, server) {
  const start = await fetch(origin+'/auth/start',{redirect:'manual'});
  assert.equal(start.status,303);
  const state = new URL(start.headers.get('location')).searchParams.get('state');
  const cookie = start.headers.getSetCookie()[0].split(';')[0];
  const code = crypto.randomBytes(32).toString('base64url');
  const callback = await fetch(origin+'/auth/callback?code='+code+'&state='+state,
    {redirect:'manual',headers:{cookie}});
  return {callback,cookie:(callback.headers.getSetCookie().find(x=>x.startsWith('__Host-b4s='))||'').split(';')[0]};
}
test('production refuses missing and malformed pilot allowlists even with DB and V1 configured', async t => {
  for (const ids of [undefined, '', 'invalid', ACCOUNT_1+',oops', ACCOUNT_1+','.repeat(22)]) {
    const env = {...baseEnv,BEH4VIOR_PILOT_MASTER_IDS:ids};
    const {server,origin} = await listen(createApp(env,{storage,fetch:fakeExchange(ACCOUNT_1)}));
    try {
      assert.equal((await fetch(origin+'/healthz')).status,503);
      assert.equal((await fetch(origin+'/auth/start',{redirect:'manual'})).status,503);
    } finally { server.close(); }
  }
});
test('only explicitly listed identity can enter private pilot in production', async t => {
  const env = {...baseEnv,BEH4VIOR_PILOT_MASTER_IDS:ACCOUNT_1};
  const allowed = await listen(createApp(env,{storage,fetch:fakeExchange(ACCOUNT_1)}));
  try {
    assert.equal((await fetch(allowed.origin+'/healthz')).status,200);
    const a = await exchange(allowed.origin, ACCOUNT_1);
    assert.equal(a.callback.status,303);
    assert.ok(a.cookie.startsWith('__Host-b4s='));
    const state = await fetch(allowed.origin+'/api/state',{headers:{cookie:a.cookie}});
    assert.equal(state.status,200);
  } finally { allowed.server.close(); }
  const denied = await listen(createApp(env,{storage,fetch:fakeExchange(ACCOUNT_2)}));
  try {
    const b = await exchange(denied.origin,ACCOUNT_2);
    assert.equal(b.callback.status,403);
    assert.equal(b.cookie,'');
    assert.equal((await fetch(denied.origin+'/api/state')).status,401);
  } finally { denied.server.close(); }
});
test('pilot access can be revoked immediately without accepting old signed cookies', async t => {
  const env = {...baseEnv,BEH4VIOR_PILOT_MASTER_IDS:ACCOUNT_1};
  const allowed = await listen(createApp(env,{storage,fetch:fakeExchange(ACCOUNT_1)}));
  const a = await exchange(allowed.origin,ACCOUNT_1);
  allowed.server.close();
  const revoked = await listen(createApp({...baseEnv,BEH4VIOR_PILOT_MASTER_IDS:ACCOUNT_2},
    {storage,fetch:fakeExchange(ACCOUNT_1)}));
  try {
    assert.equal((await fetch(revoked.origin+'/api/state',{headers:{cookie:a.cookie}})).status,401);
  } finally { revoked.server.close(); }
});
