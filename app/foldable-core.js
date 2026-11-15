/* Pure, browser-local worksheet rules. Also tested in Node. No child data leaves the device. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BEH4VIOR_FOLDABLE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX = [10, 30, 30, 30];
  const DEFAULT_GOALS = [
    'I tell a grown-up how I feel and understand what happened.',
    'I share and let others take turns.',
    'I use gentle hands and a calm body.',
    'I listen and come inside when asked.'
  ];
  const DEFAULT_MOTIVATION = 'Calm hands, kind words, and listening help me be ready to play with my friends.';
  const rating = value => ['sad', 'ok', 'happy'].includes(value) ? value : null;
  const clamp = (text, max) => String(text ?? '').slice(0, max);
  function newDay(date) {
    return { date, name: '', previous: '', motivation: DEFAULT_MOTIVATION,
      goals: DEFAULT_GOALS.map((text, i) => ({ text, max: MAX[i], rating: null })) };
  }
  function normalize(value, date) {
    const base = newDay(date), v = value && typeof value === 'object' ? value : {};
    const p = v.previous === '' || v.previous === null || v.previous === undefined
      ? '' : Number(v.previous);
    base.name = clamp(v.name, 40).trim();
    base.previous = p === '' || !Number.isFinite(p) ? '' : Math.max(0, Math.min(100, Math.round(p)));
    base.motivation = clamp(v.motivation === undefined ? base.motivation : v.motivation, 200);
    base.goals = base.goals.map((defaultGoal, i) => {
      const g = Array.isArray(v.goals) && v.goals[i] && typeof v.goals[i] === 'object' ? v.goals[i] : {};
      return { text: clamp(g.text === undefined ? defaultGoal.text : g.text, 110),
        max: MAX[i], rating: i === 0 && g.rating === 'ok' ? null : rating(g.rating) };
    });
    return base;
  }
  function points(goal, i) {
    const value = goal && rating(goal.rating);
    return value === 'happy' ? MAX[i] : value === 'ok' && i !== 0 ? 15 : 0;
  }
  function score(day) {
    return (day.goals || []).slice(0, 4).reduce((sum, goal, i) => sum + points(goal, i), 0);
  }
  return { MAX, DEFAULT_GOALS, DEFAULT_MOTIVATION, newDay, normalize, points, score };
});
