/*
 * BEH4VIOR storage adapter: this device only (localStorage), example data.
 *
 * The page talks to storage through window.BEH4VIOR_STORE and nothing else:
 *   doc('settings/child').onSnapshot(next)
 *   collection('days').onSnapshot(next)
 *   collection('days').doc('YYYY-MM-DD').set(day)
 * The server serves this file as /storage.js only in demo mode (npm run demo).
 * The real adapter is storage-server.js: same calls, saved on the server
 * behind a TAKATAK-V1 session (docs/TAKATAK_V1_BRIDGE.md).
 *
 * RULE: never put a real child's name or school report in this repository.
 * The seed below is invented.
 */
(function () {
  var KEY = 'beh4vior.v0';
  function toS(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function shift(d, n) { var x = new Date(d); do { x.setDate(x.getDate() + n); } while (x.getDay() === 0 || x.getDay() === 6); return x; }
  function seed() {
    var today = new Date(); today.setHours(12, 0, 0, 0);
    var b = (today.getDay() === 0 || today.getDay() === 6) ? shift(today, -1) : today;
    var a = shift(b, -1), c = shift(b, 1), A = toS(a), B = toS(b), C = toS(c), days = {};
    days[A] = { date: A, proud: 'Great helper at tidy-up time.', notes: 'A hard morning, a much better afternoon.',
      faces: { circuit: 'sad', circle: 'ok', desk: 'ok', snack: 'happy', recessAM: 'happy', story: 'happy', lunch: 'happy', rest: 'happy', rangement: 'happy', recessPM: 'happy', dismissal: 'happy' },
      cellNotes: { circuit: 'Pushed to get the scooter first', circle: 'Needed reminders to listen' }, goals: [] };
    days[B] = { date: B, proud: 'Gentle hands all morning.', notes: '',
      faces: { circuit: 'happy', circle: 'happy', desk: 'happy', snack: 'happy', recessAM: 'sad', lunch: 'happy', rest: 'ok', rangement: 'happy', playPM: 'happy', recessPM: 'happy', dismissal: 'happy' },
      cellNotes: { recessAM: 'Did not come in when called', rest: 'Loud before rest time' }, goals: [] };
    days[C] = { date: C, proud: '', notes: '', faces: {}, cellNotes: {}, goals: [
      { period: 'recessAM', text: 'When the teacher calls, I come inside.', kind: 'fix', from: B, why: 'Did not come in when called' },
      { period: 'rest', text: 'Walking feet and a quiet voice before rest.', kind: 'fix', from: B, why: 'Loud before rest time' },
      { period: 'circuit', text: 'Gentle hands. I wait for my turn.', kind: 'keep', from: A, why: 'Pushed to get the scooter first' },
      { period: 'circle', text: 'Quiet voice and listening ears in the circle.', kind: 'keep', from: A, why: 'Needed reminders to listen' },
      { period: 'desk', text: 'I try my work at my desk.', kind: 'keep', from: A, why: '' }] };
    return { child: { name: 'Sam' }, days: days };
  }
  var state = null;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private window: keep in memory */ } }
  if (!state || !state.days) { state = seed(); persist(); }
  var subs = [];
  function snap() {
    return { metadata: { fromCache: false }, docs: Object.keys(state.days).sort().map(function (id) { return { id: id, data: function () { return state.days[id]; } }; }) };
  }
  var note = document.getElementById('note');
  if (note) note.textContent = 'Demo with invented example data. Changes are saved on this device only.';
  window.BEH4VIOR_STORE = {
    doc: function () {
      return {
        onSnapshot: function (next) { setTimeout(function () { next({ exists: !!state.child, data: function () { return state.child; } }); }, 0); return function () {}; },
        set: function (data) { state.child = { name: String(data.name || '') }; persist(); return Promise.resolve(); }
      };
    },
    collection: function () {
      return {
        onSnapshot: function (next) { subs.push(next); setTimeout(function () { next(snap()); }, 0); return function () {}; },
        doc: function (id) {
          return { set: function (data) { state.days[id] = JSON.parse(JSON.stringify(data)); persist(); var s = snap(); subs.forEach(function (f) { f(s); }); return Promise.resolve(); } };
        }
      };
    }
  };
})();
