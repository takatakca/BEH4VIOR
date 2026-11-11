/*
 * BEH4VIOR storage adapter: the BEH4VIOR server, behind a TAKATAK-V1 session.
 * Same three calls as storage-local.js. The page awaits BEH4VIOR_STORE_READY,
 * which resolves to the store, or to null when nobody is signed in.
 */
(function () {
  var state = { child: null, days: {} }, daySubs = [], childSubs = [];
  var note = document.getElementById('note');
  function api(method, url, body) {
    return fetch(url, { method: method, credentials: 'same-origin', cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) {
        if (r.status === 401) { var e = new Error('signed out'); e.code = 'signed_out'; throw e; }
        if (r.status === 400 || r.status === 413) { var e2 = new Error('rejected'); e2.code = 'rejected'; throw e2; }
        if (!r.ok) { var e3 = new Error('unavailable'); e3.code = 'unavailable'; throw e3; }
        return r.json();
      });
  }
  function daySnap() {
    return { metadata: { fromCache: false }, docs: Object.keys(state.days).sort().map(function (id) { return { id: id, data: function () { return state.days[id]; } }; }) };
  }
  function childSnap() { return { exists: !!state.child, data: function () { return state.child; } }; }
  function publish() { var d = daySnap(), c = childSnap(); daySubs.forEach(function (f) { f(d); }); childSubs.forEach(function (f) { f(c); }); }
  function load() { return api('GET', '/api/state').then(function (s) { state.child = s.child || null; state.days = s.days || {}; return s; }); }
  var store = {
    doc: function () {
      return {
        onSnapshot: function (next) { childSubs.push(next); setTimeout(function () { next(childSnap()); }, 0); return function () {}; },
        set: function (data) { return api('PUT', '/api/child', { name: String(data.name || '') }).then(function () { state.child = { name: String(data.name || '') }; }); }
      };
    },
    collection: function () {
      return {
        onSnapshot: function (next) { daySubs.push(next); setTimeout(function () { next(daySnap()); }, 0); return function () {}; },
        doc: function (id) {
          return { set: function (data) { return api('PUT', '/api/days/' + encodeURIComponent(id), data).then(function () { state.days[id] = JSON.parse(JSON.stringify(data)); }); } };
        }
      };
    }
  };
  window.BEH4VIOR_STORE_READY = load().then(function (s) {
    if (note) {
      note.textContent = '';
      var who = document.createElement('span'); who.textContent = 'Signed in as ' + (s.displayName || 'your TAKATAK account');
      var form = document.createElement('form'); form.method = 'post'; form.action = '/auth/logout';
      var out = document.createElement('button'); out.type = 'submit'; out.textContent = 'Sign out';
      form.appendChild(out); note.appendChild(who); note.appendChild(form);
    }
    // Pick up changes made on another device when the page comes back to the front.
    document.addEventListener('visibilitychange', function () { if (!document.hidden) load().then(publish, function () {}); });
    return store;
  }, function (e) {
    if (e.code !== 'signed_out') window.BEH4VIOR_UNAVAILABLE = 'The saved sheets could not be reached. Try again in a minute.';
    return null;
  });
})();
