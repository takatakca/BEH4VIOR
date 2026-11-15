/* Print-only tracing alphabet. Simple centerline strokes, not dashed font outlines. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BEH4VIOR_TRACING = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PATHS = Object.freeze({
    A: 'M0 22 L6 2 L12 22 M2.5 15 H9.5',
    B: 'M1 2 V22 H7 Q12 22 12 17 Q12 12 7 12 H1 M7 12 Q12 12 12 7 Q12 2 7 2 H1',
    C: 'M12 5 Q6 0 2 5 Q-1 12 2 19 Q6 24 12 19',
    D: 'M1 2 V22 H6 Q13 22 13 12 Q13 2 6 2 Z',
    E: 'M12 2 H1 V22 H12 M1 12 H10',
    F: 'M1 22 V2 H12 M1 12 H10',
    G: 'M12 5 Q6 0 2 5 Q-1 12 2 19 Q6 24 12 19 V13 H7',
    H: 'M1 2 V22 M12 2 V22 M1 12 H12',
    I: 'M1 2 H11 M6 2 V22 M1 22 H11',
    J: 'M12 2 V16 Q12 23 6 23 Q1 23 1 17',
    K: 'M1 2 V22 M12 2 L1 13 M6 9 L12 22',
    L: 'M1 2 V22 H12',
    M: 'M1 22 V2 L6.5 11 L12 2 V22',
    N: 'M1 22 V2 L12 22 V2',
    O: 'M6 2 Q12 2 12 12 Q12 22 6 22 Q0 22 0 12 Q0 2 6 2 Z',
    P: 'M1 22 V2 H7 Q13 2 13 8 Q13 13 7 13 H1',
    Q: 'M6 2 Q12 2 12 12 Q12 22 6 22 Q0 22 0 12 Q0 2 6 2 Z M8 17 L13 23',
    R: 'M1 22 V2 H7 Q13 2 13 8 Q13 13 7 13 H1 M7 13 L13 22',
    S: 'M12 5 Q9 1 5 2 Q0 3 1 8 Q2 11 7 12 Q13 13 12 18 Q11 23 5 22 Q2 22 0 20',
    T: 'M0 2 H13 M6.5 2 V22',
    U: 'M1 2 V16 Q1 23 6.5 23 Q12 23 12 16 V2',
    V: 'M0 2 L6.5 22 L13 2',
    W: 'M0 2 L3 22 L6.5 10 L10 22 L13 2',
    X: 'M1 2 L12 22 M12 2 L1 22',
    Y: 'M0 2 L6.5 12 L13 2 M6.5 12 V22',
    Z: 'M0 2 H13 L0 22 H13'
  });
  function traceName(raw) {
    // A small, stroke-by-stroke alphabet, with one copy of the name only.
    const name = String(raw || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase().replace(/[^A-Z ]/g, '').trim().slice(0, 22) || 'NAME';
    const letters = [...name];
    const unitWidth = letters.length * 15 - 2;
    const scale = Math.min(2.35, 316 / unitWidth);
    const startX = (340 - unitWidth * scale) / 2;
    const y = 67 - 22 * scale;
    return {
      label: name,
      glyphs: letters.map((letter, index) => ({
        path: PATHS[letter] || '',
        transform: 'translate(' + (startX + index * 15 * scale).toFixed(2) + ' ' +
          y.toFixed(2) + ') scale(' + scale.toFixed(3) + ')'
      }))
    };
  }
  return { traceName };
});
