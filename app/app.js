(async function () {
  const PERIODS = [
    ['circuit', 'Morning Circuit', 'Gentle hands. I wait for my turn.'],
    ['circle', 'Circle Time', 'Quiet voice and listening ears in the circle.'],
    ['desk', 'Work at Desk', 'I try my work at my desk.'],
    ['snack', 'Snack', 'I eat my snack. My juice waits for lunch.'],
    ['physed', 'Phys. Ed', 'I follow the rules of the game in the gym.'],
    ['recessAM', 'Recess (AM)', 'When the teacher calls, I come inside.'],
    ['story', 'Story Time', 'I sit and listen to the story.'],
    ['playAM', 'Play Time (AM)', 'I listen the first time.'],
    ['lunch', 'Lunch', 'I stay at my place and eat my lunch.'],
    ['recessLunch', 'Recess (Lunch)', 'Water stays in the sink. Kind hands with friends.'],
    ['rest', 'Rest Time', 'Walking feet and a quiet voice before rest.'],
    ['rangement', 'Rangement', 'I put my things away.'],
    ['playPM', 'Play Time (PM)', 'I share and take turns.'],
    ['recessPM', 'Recess (PM)', 'I help a friend.'],
    ['dismissal', 'Dismissal', 'I walk calmly to the bus.'],
    ['special', 'Special Activity', 'I join in and listen.']
  ];
  const LABEL = Object.fromEntries(PERIODS.map(p => [p[0], p[1]]));
  const TEXT = Object.fromEntries(PERIODS.map(p => [p[0], p[2]]));
  const POINTS = { happy: 20, ok: 10 };
  const FACE_NAME = { happy: 'Good', ok: 'Needed reminders', sad: 'Hard time', missed: 'Did not get it' };

  const main = document.getElementById('main');
  const statusEl = document.getElementById('status');
  let db = null, days = {}, child = '', loaded = false, sel = null, dirty = false, armed = false;
  const pend = {};

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  const toS = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const shift = (s, n) => { const d = toD(s); do { d.setDate(d.getDate() + n); } while (d.getDay() === 0 || d.getDay() === 6); return toS(d); };
  const longDate = s => toD(s).toLocaleDateString('en-CA', { weekday: 'long', month: 'short', day: 'numeric' });
  const weekday = s => toD(s).toLocaleDateString('en-CA', { weekday: 'long' });
  const blank = date => ({ date, faces: {}, cellNotes: {}, proud: '', notes: '', goals: [] });
  const getDay = date => days[date] || blank(date);
  const ensure = date => (days[date] = days[date] || blank(date));
  const route = () => ['today', 'report', 'week'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'today';
  const score = d => (d.goals || []).reduce((n, g) => n + (POINTS[(d.faces || {})[g.period]] || 0), 0);
  const say = t => { statusEl.textContent = t; };

  function face(t) {
    const mouth = { happy: '<path d="M8 14.2c1.7 2.6 6.3 2.6 8 0"/>', ok: '<path d="M8.5 15.3h7"/>', sad: '<path d="M8 16.6c1.7-2.6 6.3-2.6 8 0"/>', missed: '<path d="M5.5 18.5 18.5 5.5"/>' }[t];
    const eyes = t === 'missed' ? '' : '<circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>';
    return '<svg class="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.2"/>' + eyes + mouth + '</svg>';
  }
  function faceButtons(period, current, kinds) {
    return '<div class="faces">' + kinds.map(k =>
      '<button type="button" class="face" data-face="' + k + '" data-period="' + period + '" aria-pressed="' + (current === k) + '" aria-label="' + FACE_NAME[k] + ', ' + esc(LABEL[period]) + '" title="' + FACE_NAME[k] + '">' + face(k) + '</button>').join('') + '</div>';
  }
  const STAR = '<path d="M12 2.6l2.9 6 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.5l6.5-.9z"/>';

  function viewToday(d) {
    if (!d.goals || !d.goals.length) {
      return '<div class="empty"><h2>No five set for ' + esc(weekday(d.date)) + ' yet</h2><p>Fill in the school sheet for the day before, then build the five from it.</p></div>';
    }
    const pct = score(d), C = 2 * Math.PI * 50, rated = d.goals.filter(g => d.faces[g.period]).length;
    const stars = d.goals.map(g => { const f = d.faces[g.period]; return '<svg viewBox="0 0 24 24" class="' + (f === 'happy' ? 'full' : f === 'ok' ? 'half' : '') + '">' + STAR + '</svg>'; }).join('');
    const hint = rated === 0 ? 'Each smiley from school fills a star. Five stars make 100%.'
      : pct === 100 ? 'All five. A full day of good choices.'
      : rated + ' of 5 marked so far. A smiley is 20%, a straight face is 10%.';
    return '<section class="score"><div class="ring"><svg viewBox="0 0 116 116"><circle cx="58" cy="58" r="50" fill="none" stroke="var(--pen-soft)" stroke-width="11"/>' +
      '<circle class="fill" cx="58" cy="58" r="50" fill="none" stroke="var(--star)" stroke-width="11" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + (C * (1 - pct / 100)) + '"/></svg><b>' + pct + '%</b></div>' +
      '<div class="score-text"><h1>' + (child ? esc(child) + '’s five good things' : 'My five good things') + '</h1><div class="stars" aria-label="' + pct + ' percent">' + stars + '</div><p class="muted">' + hint + '</p></div></section>' +
      '<ol class="goals">' + d.goals.map((g, i) =>
        '<li class="goal"><div class="goal-head"><span>' + esc(LABEL[g.period] || g.period) + '</span><span class="tag ' + (g.kind === 'fix' ? 'fix' : 'keep') + '">' + (g.kind === 'fix' ? 'Catch up' : 'Keep it up') + '</span></div>' +
        '<textarea id="goal-' + i + '" data-goal="' + i + '" rows="1" aria-label="Goal ' + (i + 1) + '">' + esc(g.text) + '</textarea>' +
        '<div class="goal-foot"><span class="why">' + (g.why ? esc(weekday(g.from)) + ': ' + esc(g.why) : '') + '</span>' + faceButtons(g.period, d.faces[g.period], ['happy', 'ok', 'sad']) + '</div></li>').join('') + '</ol>' +
      '<p class="muted">Tap a face when the sheet comes home, or let the teacher tap it. The goal wording can be changed by typing on it.</p>';
  }

  function viewReport(d) {
    const next = shift(d.date, 1), has = (getDay(next).goals || []).length > 0;
    return '<h1>School sheet</h1><div class="legend">' + ['happy', 'ok', 'sad', 'missed'].map(k => '<span>' + FACE_NAME[k] + '</span>').join('<span aria-hidden="true">·</span>') + '</div>' +
      '<div class="sheet">' + PERIODS.map(([k, label]) =>
        '<div class="row"><strong>' + label + '</strong>' + faceButtons(k, d.faces[k], ['happy', 'ok', 'sad', 'missed']) +
        '<input type="text" id="note-' + k + '" data-note="' + k + '" value="' + esc((d.cellNotes || {})[k]) + '" placeholder="Teacher’s note" aria-label="Note for ' + label + '"></div>').join('') + '</div>' +
      '<div class="notes"><label for="proud">I am proud of<textarea id="proud" data-field="proud">' + esc(d.proud) + '</textarea></label>' +
      '<label for="notes">Notes<textarea id="notes" data-field="notes">' + esc(d.notes) + '</textarea></label></div>' +
      '<button type="button" class="primary" id="build">' + (armed ? 'Replace the five already set for ' + esc(weekday(next)) + '? Tap again' : (has ? 'Rebuild ' : 'Build ') + esc(weekday(next)) + '’s five from this sheet') + '</button>' +
      '<p class="muted">The five come from the hard moments on this sheet first, then from things that went wrong earlier in the week and are now going well.</p>';
  }

  function viewWeek() {
    const keys = Object.keys(days).sort().reverse();
    if (!keys.length) return '<div class="empty"><h2>No days yet</h2><p>Open School sheet and tap the faces from the first sheet that comes home.</p></div>' + childField();
    return '<h1>Days</h1><div class="week">' + keys.map(k => {
      const d = days[k], hasGoals = (d.goals || []).length > 0, rated = hasGoals && d.goals.some(g => d.faces[g.period]);
      const strip = PERIODS.filter(p => d.faces[p[0]]).map(p => face(d.faces[p[0]])).join('');
      return '<button type="button" class="dayrow" data-go="' + k + '"><span class="dayrow-top"><span>' + esc(longDate(k)) + '</span><span>' + (hasGoals ? (rated ? score(d) + '%' : 'Five set') : 'Sheet only') + '</span></span>' +
        (hasGoals ? '<span class="bar"><i style="width:' + score(d) + '%"></i></span>' : '') + (strip ? '<span class="strip">' + strip + '</span>' : '') + '</button>';
    }).join('') + '</div>' + childField();
  }
  function childField() {
    return '<div class="notes" style="margin-top:20px"><label for="child-name">Child’s first name<input type="text" id="child-name" data-child value="' + esc(child) + '" maxlength="40" autocomplete="off"></label></div>';
  }
  let childTimer = null;
  function queueChild() {
    clearTimeout(childTimer);
    childTimer = setTimeout(() => {
      db.doc('settings/child').set({ name: child.trim() }).then(() => say('Saved'), () => say('Could not save the name. Try again.'));
    }, 600);
  }

  function render() {
    const r = route();
    document.querySelectorAll('[data-tab]').forEach(a => a.dataset.tab === r ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    document.getElementById('daynav').hidden = r === 'week' || !loaded;
    if (!loaded) return;
    document.getElementById('daylabel').textContent = longDate(sel);
    const d = getDay(sel);
    main.innerHTML = r === 'week' ? viewWeek() : r === 'report' ? viewReport(d) : viewToday(d);
    dirty = false;
  }
  function softRender() {
    const a = document.activeElement;
    if (a && /INPUT|TEXTAREA/.test(a.tagName) && main.contains(a)) { dirty = true; return; }
    render();
  }

  function queueSave(date) {
    const p = pend[date] = pend[date] || {};
    clearTimeout(p.timer);
    p.timer = setTimeout(() => flush(date), 500);
  }
  async function flush(date) {
    const p = pend[date]; p.timer = null;
    if (p.busy) { p.again = true; return; }
    p.busy = true;
    try { await db.collection('days').doc(date).set(JSON.parse(JSON.stringify(days[date]))); say('Saved'); }
    catch (e) { say(e && e.code === 'signed_out' ? 'Your session ended. Open the page again to sign in; the last change was not saved.' : e && e.code === 'invalid_argument' ? 'You can look at this tracker but not change it. Ask the owner for Contributor access.' : 'Could not save. Check the connection and make the change again.'); }
    p.busy = false;
    if (p.again) { p.again = false; flush(date); }
  }
  const busy = date => pend[date] && (pend[date].timer || pend[date].busy);

  function buildGoals(date) {
    const cur = days[date], sev = { sad: 3, ok: 2 }, out = [], has = p => out.some(g => g.period === p);
    const keys = Object.keys(days).filter(k => k <= date && Object.keys(days[k].faces || {}).length).sort().reverse().slice(0, 5);
    keys.forEach((k, i) => {
      const f = days[k].faces;
      PERIODS.map(p => p[0]).filter(p => sev[f[p]] && !has(p) && (i === 0 || !sev[cur.faces[p]]))
        .sort((a, b) => sev[f[b]] - sev[f[a]])
        .forEach(p => out.push({ period: p, text: TEXT[p], kind: i === 0 ? 'fix' : 'keep', from: k, why: (days[k].cellNotes || {})[p] || '' }));
    });
    PERIODS.forEach(([p]) => { if (cur.faces[p] === 'happy' && !has(p)) out.push({ period: p, text: TEXT[p], kind: 'keep', from: date, why: '' }); });
    return out.slice(0, 5);
  }

  main.addEventListener('click', e => {
    const fb = e.target.closest('[data-face]');
    if (fb) {
      const d = ensure(sel), p = fb.dataset.period;
      if (d.faces[p] === fb.dataset.face) delete d.faces[p]; else d.faces[p] = fb.dataset.face;
      queueSave(sel); render(); return;
    }
    const go = e.target.closest('[data-go]');
    if (go) { sel = go.dataset.go; location.hash = 'today'; render(); return; }
    if (e.target.closest('#build')) {
      const d = ensure(sel), next = shift(sel, 1);
      if (!Object.keys(d.faces).length) { say('Tap the faces from the sheet first, so there is something to build from.'); return; }
      if ((getDay(next).goals || []).length && !armed) { armed = true; render(); return; }
      armed = false;
      const goals = buildGoals(sel);
      if (goals.length < 5) { say('Only ' + goals.length + ' rated periods so far. Rate at least five to build a full set.'); }
      ensure(next).goals = goals;
      queueSave(sel); queueSave(next);
      sel = next; location.hash = 'today'; render();
    }
  });
  main.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.child !== undefined) { child = t.value; queueChild(); return; }
    const d = ensure(sel);
    if (t.dataset.note) { d.cellNotes = d.cellNotes || {}; d.cellNotes[t.dataset.note] = t.value; }
    else if (t.dataset.field) d[t.dataset.field] = t.value;
    else if (t.dataset.goal) d.goals[+t.dataset.goal].text = t.value;
    else return;
    queueSave(sel);
  });
  main.addEventListener('focusout', () => setTimeout(() => { if (dirty) softRender(); }, 0));
  document.getElementById('daynav').addEventListener('click', e => {
    const b = e.target.closest('[data-nav]'); if (!b || !sel) return;
    sel = shift(sel, +b.dataset.nav); armed = false; render();
  });
  addEventListener('hashchange', () => { armed = false; render(); });
  render();

  db = await (window.BEH4VIOR_STORE_READY || window.BEH4VIOR_STORE || null); // storage adapter: storage-server.js or storage-local.js
  if (!db) {
    say('');
    main.innerHTML = window.BEH4VIOR_UNAVAILABLE
      ? '<div class="empty"><h2>The tracker can’t be opened right now</h2><p>' + esc(window.BEH4VIOR_UNAVAILABLE) + '</p></div>'
      : '<div class="empty"><h2>Sign in to open the tracker</h2><p>BEH4VIOR uses your TAKATAK account. Your child’s sheets are visible only to you.</p><p style="margin-top:14px"><a class="primary" href="/auth/start">Sign in with TAKATAK</a></p></div>';
    return;
  }
  const slow = setTimeout(() => say('The saved days can’t be reached yet. Still trying…'), 10000);
  db.doc('settings/child').onSnapshot(s => { child = s.exists ? (s.data().name || '') : ''; softRender(); }, () => {});
  db.collection('days').onSnapshot(snap => {
    const fresh = {};
    snap.docs.forEach(doc => {
      const v = JSON.parse(JSON.stringify(doc.data()));
      v.date = doc.id; v.faces = v.faces || {}; v.cellNotes = v.cellNotes || {}; v.goals = v.goals || [];
      fresh[doc.id] = v;
    });
    Object.keys(days).forEach(k => { if (busy(k)) fresh[k] = days[k]; });
    days = fresh;
    if (!snap.metadata.fromCache) { clearTimeout(slow); if (!loaded || /reached|Opening/.test(statusEl.textContent)) say(''); }
    if (!sel) {
      const keys = Object.keys(days).sort().reverse();
      sel = keys.find(k => days[k].goals.length) || keys[0] || shift(toS(new Date(Date.now() - 864e5)), 1);
    }
    loaded = true;
    softRender();
  }, () => { clearTimeout(slow); say('The saved days could not be opened. Close this page and open it again.'); });
})();
