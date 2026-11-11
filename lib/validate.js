'use strict';
// Shape and size limits for everything a browser may store. Unknown fields are dropped.

const PERIODS = ['circuit', 'circle', 'desk', 'snack', 'physed', 'recessAM', 'story', 'playAM', 'lunch',
  'recessLunch', 'rest', 'rangement', 'playPM', 'recessPM', 'dismissal', 'special'];
const FACES = ['happy', 'ok', 'sad', 'missed'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(v, max) { return typeof v === 'string' ? v.slice(0, max) : ''; }
function isDate(s) { return typeof s === 'string' && DATE.test(s) && !Number.isNaN(Date.parse(s + 'T12:00:00Z')); }

function cleanDay(date, input) {
  if (!isDate(date) || !input || typeof input !== 'object' || Array.isArray(input)) return null;
  const faces = {}, cellNotes = {};
  for (const p of PERIODS) {
    const f = input.faces && input.faces[p];
    if (FACES.includes(f)) faces[p] = f;
    const n = text(input.cellNotes && input.cellNotes[p], 300);
    if (n) cellNotes[p] = n;
  }
  const goals = (Array.isArray(input.goals) ? input.goals : []).slice(0, 5)
    .filter(g => g && typeof g === 'object' && PERIODS.includes(g.period))
    .map(g => ({ period: g.period, text: text(g.text, 200), kind: g.kind === 'fix' ? 'fix' : 'keep',
      from: isDate(g.from) ? g.from : date, why: text(g.why, 300) }));
  return { date, faces, cellNotes, proud: text(input.proud, 2000), notes: text(input.notes, 2000), goals };
}

function cleanChild(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  return { name: text(input.name, 40).trim() };
}

module.exports = { cleanDay, cleanChild, isDate, PERIODS, FACES };
