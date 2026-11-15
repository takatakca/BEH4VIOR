'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { traceName } = require('../app/tracing-core.js');

const app = file => fs.readFileSync(path.join(__dirname, '..', 'app', file), 'utf8');

test('name is traced once using real pen-stroke paths', () => {
  const result = traceName('Matthys');
  assert.equal(result.label, 'MATTHYS');
  assert.equal(result.glyphs.length, 7);
  assert.ok(result.glyphs.every(g => g.path.startsWith('M') && g.transform.includes('scale(')));
  assert.ok(result.glyphs.every(g => !g.path.includes('<')));
});

test('accented letters are converted to printable strokes, no HTML injection', () => {
  assert.equal(traceName('Éloïse').label, 'ELOISE');
  assert.equal(traceName('<script>').label, 'SCRIPT');
  assert.equal(traceName('').label, 'NAME');
});

test('print layout uses four equal portrait panels and center fold guides', () => {
  const html = app('foldable.html');
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const count = (html.match(/<div class="panel">/g) || []).length;
  assert.equal(count, 4);
  assert.match(html, /@page\{size:letter portrait;margin:\.3in\}/);
  assert.match(html, /grid-template-columns:1fr 1fr;grid-template-rows:5\.2in 5\.2in/);
  assert.match(html, /nth-child\(odd\).*border-right/);
  assert.match(html, /nth-child\(-n\+2\).*border-bottom/);
  assert.match(html, /<g id="print-trace" aria-hidden="true"><\/g>/);
  assert.match(html, /<script src="\/tracing-core\.js"><\/script>/);
  assert.match(server, /'\/tracing-core\.js'/);
});

test('four distinct challenges, special yes/no face and no user content as markup', () => {
  const js = app('foldable.js');
  assert.match(js, /if \(index !== 0\) buttons\.append\(makeChoice\(index, 'ok'\)\)/);
  assert.match(js, /blocked\.textContent = 'N\/A'/);
  assert.match(js, /words\.textContent = goal\.text/);
  assert.match(js, /traceRoot\.replaceChildren\(\)/);
});
