/* Pure, browser-local worksheet rules. Also tested in Node. No child data leaves the device. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BEH4VIOR_FOLDABLE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX = [10, 30, 30, 30];
  const MAX_THREE = [34, 33, 33]; // rounding keeps the total at exactly 100
  const THREE_GOALS = [
    'Before I become upset, I can use words to say how I feel.',
    'When a grown-up answers, I listen to the response.',
    'When I want to explain, I wait for my turn to speak.'
  ];
  const DEFAULT_GOALS = [
    'I tell a grown-up how I feel and understand what happened.',
    'I share and let others take turns.',
    'I use gentle hands and a calm body.',
    'I listen and come inside when asked.'
  ];
  const DEFAULT_MOTIVATION = 'Calm hands, kind words, and listening help me be ready to play with my friends.';
  const rating = value => ['sad', 'ok', 'happy'].includes(value) ? value : null;
  const clamp = (text, max) => String(text ?? '').slice(0, max);
  function newDay(date, mode = 'four') {
    const selected = mode === 'three' ? 'three' : 'four';
    const weights = selected === 'three' ? MAX_THREE : MAX;
    const defaults = selected === 'three' ? THREE_GOALS : DEFAULT_GOALS;
    return { date, mode: selected, name: '', previous: '', motivation: DEFAULT_MOTIVATION,
      goals: defaults.map((text, i) => ({ text, max: weights[i], rating: null })) };
  }
  function normalize(value, date) {
    const v = value && typeof value === 'object' ? value : {};
    const base = newDay(date, v.mode === 'three' ? 'three' : 'four');
    const p = v.previous === '' || v.previous === null || v.previous === undefined
      ? '' : Number(v.previous);
    base.name = clamp(v.name, 40).trim();
    base.previous = p === '' || !Number.isFinite(p) ? '' : Math.max(0, Math.min(100, Math.round(p)));
    base.motivation = clamp(v.motivation === undefined ? base.motivation : v.motivation, 200);
    base.goals = base.goals.map((defaultGoal, i) => {
      const g = Array.isArray(v.goals) && v.goals[i] && typeof v.goals[i] === 'object' ? v.goals[i] : {};
      return { text: clamp(g.text === undefined ? defaultGoal.text : g.text, 110),
        max: defaultGoal.max, rating: base.mode === 'four' && i === 0 && g.rating === 'ok' ? null : rating(g.rating) };
    });
    return base;
  }
  function points(goal, i, mode = 'four') {
    const value = goal && rating(goal.rating);
    const weights = mode === 'three' ? MAX_THREE : MAX;
    if (i >= weights.length) return 0;
    if (value === 'happy') return weights[i];
    if (value === 'ok' && (mode === 'three' || i !== 0)) return weights[i] / 2;
    return 0;
  }
  function score(day) {
    const mode = day.mode === 'three' ? 'three' : 'four';
    return Math.round((day.goals || []).slice(0, mode === 'three' ? 3 : 4)
      .reduce((sum, goal, i) => sum + points(goal, i, mode), 0));
  }
  return { MAX, MAX_THREE, DEFAULT_GOALS, THREE_GOALS, DEFAULT_MOTIVATION, newDay, normalize, points, score };
});
