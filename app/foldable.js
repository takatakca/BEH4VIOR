/* Local-only, editable, print-ready four-fold worksheet. Never makes network requests. */
(function () {
  'use strict';
  const core = window.BEH4VIOR_FOLDABLE;
  const $ = id => document.getElementById(id);
  const key = day => 'beh4vior:foldable:v1:' + day;
  const today = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  };
  const faceSvg = kind => {
    const mouth = {
      sad: '<path d="M8 17 Q12 12 16 17"/>',
      ok: '<path d="M8 15 H16"/>',
      happy: '<path d="M8 14 Q12 19 16 14"/>'
    }[kind];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>' + mouth + '</svg>';
  };
  const kinds = ['sad', 'ok', 'happy'];
  let day = today();
  let state = core.newDay(day);

  function load(date) {
    let raw = null;
    try { raw = localStorage.getItem(key(date)); } catch { $('status').textContent = 'Browser storage is unavailable. You can still print, but changes may not be saved.'; }
    try { return raw ? core.normalize(JSON.parse(raw), date) : core.newDay(date, new URLSearchParams(location.search).get('mode') === 'three' ? 'three' : 'four'); }
    catch { return core.newDay(date); }
  }
  function save() {
    try { localStorage.setItem(key(day), JSON.stringify(state)); $('status').textContent = 'Saved on this device only.'; }
    catch { $('status').textContent = 'Could not save on this device. Print or save a PDF before closing.'; }
  }
  function dayLabel(date) {
    const d = new Date(date + 'T12:00:00');
    return Number.isNaN(d.getTime()) ? 'Daily' : d.toLocaleDateString('en-CA', {weekday: 'long'});
  }
  function selectRating(index, kind) {
    if (state.mode !== 'three' && index === 0 && kind === 'ok') return;
    state.goals[index].rating = state.goals[index].rating === kind ? null : kind;
    save();
    drawGoals();
    drawPreview();
  }
  function makeChoice(index, kind) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice';
    const n = core.points({rating: kind}, index, state.mode);
    button.innerHTML = faceSvg(kind) + '<span>' + n + ' points</span>';
    button.setAttribute('aria-pressed', state.goals[index].rating === kind ? 'true' : 'false');
    button.setAttribute('aria-label', (kind === 'sad' ? 'Not yet' : kind === 'ok' ? 'I tried' : 'I did it') + ', goal ' + (index + 1) + ', ' + n + ' points');
    button.addEventListener('click', () => selectRating(index, kind));
    return button;
  }
  function drawGoals() {
    const holder = $('goals-editor');
    holder.replaceChildren();
    state.goals.forEach((goal, index) => {
      const wrap = document.createElement('div');
      const label = document.createElement('label');
      label.className = 'goal-input';
      label.textContent = 'Goal ' + (index + 1) + ' ';
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 110;
      input.value = goal.text;
      input.setAttribute('aria-label', 'Goal ' + (index + 1) + ' text');
      input.addEventListener('input', () => {
        state.goals[index].text = input.value;
        save();
        drawPreview();
      });
      const value = document.createElement('strong');
      value.textContent = goal.max + ' pts';
      label.append(input, value);
      const buttons = document.createElement('div');
      buttons.className = 'rating-controls';
      buttons.setAttribute('role', 'group');
      buttons.setAttribute('aria-label', 'Score goal ' + (index + 1));
      buttons.append(makeChoice(index, 'sad'));
      if (state.mode === 'three' || index !== 0) buttons.append(makeChoice(index, 'ok'));
      buttons.append(makeChoice(index, 'happy'));
      wrap.append(label, buttons);
      holder.append(wrap);
    });
  }
  function printFace(kind, picked) {
    const span = document.createElement('span');
    span.className = 'face-picture' + (picked === kind ? ' selected' : '');
    span.innerHTML = faceSvg(kind);
    return span;
  }
  function drawPrintGoals() {
    const holder = $('print-goals');
    holder.replaceChildren();
    state.goals.forEach((goal, i) => {
      const row = document.createElement('div');
      row.className = 'print-goal';
      const number = document.createElement('strong');
      number.textContent = (i + 1) + '.';
      const words = document.createElement('div');
      words.textContent = goal.text || 'My goal';
      const max = document.createElement('div');
      max.className = 'max-label';
      max.textContent = goal.max + ' pts';
      words.append(document.createElement('br'), max);
      const faces = document.createElement('div');
      faces.className = 'faces';
      faces.append(printFace('sad', goal.rating));
      if (state.mode === 'four' && i === 0) {
        const blocked = document.createElement('span');
        blocked.className = 'notapplicable';
        blocked.textContent = 'N/A';
        faces.append(blocked);
      } else faces.append(printFace('ok', goal.rating));
      faces.append(printFace('happy', goal.rating));
      row.append(number, words, faces);
      holder.append(row);
    });
  }
  function drawPreview() {
    $('cover-name').textContent = state.name ? state.name + ',' : 'My name,';
    $('print-motivation').textContent = state.motivation || 'I can learn, try, and make better choices.';
    $('print-previous').textContent = state.previous === '' ? 'Not scored' : state.previous + '% / 100';
    $('challenge-title').textContent = 'My ' + dayLabel(day) + ' challenges';
    $('print-score').textContent = state.goals.some(g => g.rating) ? core.score(state) + ' / 100' : '— / 100';
    const trace = window.BEH4VIOR_TRACING.traceName(state.name);
    const traceRoot = $('print-trace');
    traceRoot.replaceChildren();
    traceRoot.setAttribute('aria-label', 'Trace ' + trace.label);
    for (const glyph of trace.glyphs) {
      if (!glyph.path) continue;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', glyph.path);
      path.setAttribute('transform', glyph.transform);
      traceRoot.append(path);
    }
    drawPrintGoals();
  }
  function drawLegend() {
    const holder = $('legend');
    holder.replaceChildren();
    [['happy', 'I did it (full points)'], ['ok', state.mode === 'three' ? 'I tried (half points)' : 'I tried (half points on big goals)'], ['sad', 'Still working on it (0 points)']].forEach(([kind, label]) => {
      const p = document.createElement('p');
      p.innerHTML = faceSvg(kind);
      const span = document.createElement('span');
      span.textContent = label;
      p.append(span);
      holder.append(p);
    });
  }
  function populate() {
    $('day').value = day;
    $('mode').value = state.mode;
    $('goals-title').textContent = state.mode === 'three' ? 'Three challenges - each goal is one third of 100 points' : 'Four challenges - 10 + 30 + 30 + 30 = 100 points';
    $('scoring-help').textContent = state.mode === 'three' ? 'Choose a sad, straight, or happy face for every goal (0, half, or full points). All three goals count equally, with 100 as the maximum.' : 'Choose a face for each goal. Goal 1 is Yes/No (0 or 10). Goals 2-4 earn 0, 15, or 30. A blank face is unscored.';
    $('name').value = state.name;
    $('previous').value = state.previous;
    $('motivation').value = state.motivation;
    drawGoals();
    drawPreview();
    drawLegend();
  }
  $('mode').addEventListener('change', e => {
    const requested = e.target.value === 'three' ? 'three' : 'four';
    if (requested === state.mode) return;
    if (!window.confirm('Switching the goal style replaces today\'s goals and ratings. Continue?')) {
      e.target.value = state.mode; return;
    }
    const before = state;
    state = core.newDay(day, requested);
    state.name = before.name;
    state.previous = before.previous;
    state.motivation = before.motivation;
    save(); populate();
  });
  $('day').addEventListener('change', e => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) return;
    day = e.target.value;
    state = load(day);
    populate();
  });
  $('name').addEventListener('input', e => { state.name = e.target.value.slice(0, 40); save(); drawPreview(); });
  $('previous').addEventListener('input', e => {
    state.previous = e.target.value === '' ? '' : Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
    save(); drawPreview();
  });
  $('motivation').addEventListener('input', e => { state.motivation = e.target.value.slice(0, 200); save(); drawPreview(); });
  $('print').addEventListener('click', () => window.print());
  $('clear').addEventListener('click', () => {
    if (!window.confirm('Clear this day\'s locally saved worksheet?')) return;
    try { localStorage.removeItem(key(day)); } catch {}
    state = core.newDay(day, state.mode);
    populate();
    $('status').textContent = 'This day was cleared from this browser.';
  });
  drawLegend();
  state = load(day);
  populate();
})();
