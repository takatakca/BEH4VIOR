'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {newDay, normalize, points, score} = require('../app/foldable-core.js');

// Invented examples only: never use actual child or school records in public tests.
test('legacy worksheet without mode remains four weighted goals after reload', () => {
  const stored = {name: 'Sample', previous: 65, motivation: 'Keep trying!',
    goals: [{text: 'Use words', rating: 'happy'}, {text: 'Take turns', rating: 'ok'},
      {text: 'Listen', rating: 'sad'}, {text: 'Ask for help', rating: 'happy'}]};
  const day = normalize(JSON.parse(JSON.stringify(stored)), '2026-11-19');
  assert.equal(day.mode, 'four');
  assert.deepEqual(day.goals.map(g => g.max), [10, 30, 30, 30]);
  assert.equal(score(day), 55);
  assert.equal(day.previous, 65);
  assert.equal(day.motivation, 'Keep trying!');
  assert.equal(normalize(JSON.parse(JSON.stringify(day)), day.date).mode, 'four');
});

test('three-goal worksheet survives JSON round-trip without changing historic four-goal score', () => {
  const old = newDay('2026-11-18');
  old.goals.forEach(g => { g.rating = 'ok'; });
  assert.equal(score(old), 45); // first binary goal cannot earn half-credit
  const three = newDay('2026-11-20', 'three');
  three.goals.forEach(g => { g.rating = 'happy'; });
  assert.equal(score(normalize(JSON.parse(JSON.stringify(three)), three.date)), 100);
  assert.equal(score(normalize(JSON.parse(JSON.stringify(old)), old.date)), 45);
});

test('child-selected neutral face remains valid for all three-goal challenges', () => {
  const day = newDay('2026-11-20', 'three');
  day.goals.forEach(g => { g.rating = 'ok'; });
  const restored = normalize(JSON.parse(JSON.stringify(day)), day.date);
  assert.deepEqual(restored.goals.map(g => g.max), [34, 33, 33]);
  assert.equal(score(restored), 50);
  assert.equal(points(restored.goals[0], 0, 'three'), 17);
});

test('invalid neutral face for first binary goal is cleared without changing other ratings', () => {
  const day = newDay('2026-11-20');
  day.goals[0].rating = 'ok';
  day.goals[1].rating = 'ok';
  const restored = normalize(JSON.parse(JSON.stringify(day)), day.date);
  assert.equal(restored.goals[0].rating, null);
  assert.equal(restored.goals[1].rating, 'ok');
  assert.equal(score(restored), 15);
});
