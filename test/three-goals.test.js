'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { newDay, normalize, score, points } = require('../app/foldable-core');

test('three communication goals total exactly 100, all happy', () => {
  const d = newDay('2026-11-18','three');
  assert.equal(d.mode, 'three');
  assert.equal(d.goals.length, 3);
  assert.deepEqual(d.goals.map(g => g.max), [34,33,33]);
  d.goals.forEach(g => { g.rating = 'happy'; });
  assert.equal(score(d), 100);
});

test('three neutral faces earn exactly 50, sad 0', () => {
  const d = newDay('2026-11-18','three');
  d.goals.forEach(g => { g.rating = 'ok'; });
  assert.equal(score(d), 50);
  d.goals.forEach(g => { g.rating = 'sad'; });
  assert.equal(score(d), 0);
});

test('three-goal first choice supports neutral, unlike four-goal first binary choice', () => {
  const three = newDay('2026-11-18','three');
  three.goals[0].rating = 'ok';
  assert.equal(score(three), 17);
  const saved = normalize(three,'2026-11-18');
  assert.equal(saved.goals[0].rating,'ok');
  const old = normalize({goals:[{rating:'ok'}]}, '2026-11-18');
  assert.equal(old.mode,'four');
  assert.equal(old.goals[0].rating,null);
});

test('bad mode or spoofed weights cannot modify the 100-point scoring model', () => {
  const normalized = normalize({mode:'three',goals:[
    {text:'I wait',max:9999,rating:'happy'},
    {text:'I listen',max:9999,rating:'happy'},
    {text:'I explain',max:9999,rating:'happy'},
    {text:'Extra',max:9999,rating:'happy'}
  ]}, '2026-11-18');
  assert.equal(normalized.goals.length,3);
  assert.equal(score(normalized),100);
  assert.deepEqual(normalized.goals.map(g=>g.max), [34,33,33]);
  assert.equal(newDay('2026-11-18','unknown').mode,'four');
});

test('existing stored four-goal days retain old scores and names on load', () => {
  const legacy = normalize({name:'Example',previous:75,goals:[{rating:'happy'}, {rating:'ok'}, {rating:'sad'}, {rating:'happy'}]},'2026-11-17');
  assert.equal(legacy.mode,'four');
  assert.equal(legacy.name,'Example');
  assert.equal(legacy.previous,75);
  assert.equal(score(legacy), 50);
});
