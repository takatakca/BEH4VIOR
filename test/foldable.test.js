'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {newDay, normalize, points, score} = require('../app/foldable-core.js');

test('four goals use 10 + 30 + 30 + 30, maximum 100', () => {
  const d = newDay('2026-11-16');
  d.goals.forEach(g => { g.rating = 'happy'; });
  assert.equal(score(d), 100);
  assert.equal(d.goals.length, 4);
});
test('reflection is yes/no; partial points apply only to the three larger goals', () => {
  const d = newDay('2026-11-16');
  d.goals[0].rating = 'ok';
  d.goals[1].rating = 'ok';
  d.goals[2].rating = 'sad';
  d.goals[3].rating = 'happy';
  assert.equal(points(d.goals[0], 0), 0);
  assert.equal(score(d), 45);
});
test('bad or excessive stored data is normalized without changing point weights', () => {
  const d = normalize({ name: 'A'.repeat(99), previous: 300, goals: [
    {text: 'X'.repeat(300), max: 500, rating: 'ok'},
    {text: 'Take turns', max: 1000, rating: 'happy'}
  ] }, '2026-11-16');
  assert.equal(d.name.length, 40);
  assert.equal(d.previous, 100);
  assert.equal(d.goals[0].text.length, 110);
  assert.equal(d.goals[0].max, 10);
  assert.equal(d.goals[0].rating, null);
  assert.equal(d.goals[1].max, 30);
  assert.equal(score(d), 30);
});
test('blank day and partial day are valid', () => {
  const d = normalize(null, '2026-11-16');
  assert.equal(score(d), 0);
  assert.equal(d.name, '');
  assert.equal(d.previous, '');
});
