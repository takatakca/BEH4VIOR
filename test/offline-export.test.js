'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.join(__dirname, '..');

test('bundled offline worksheet includes all scripts and keeps four print panels', () => {
  execFileSync(process.execPath, [path.join(root, 'scripts', 'build-offline.cjs')], {cwd: root});
  const output = fs.readFileSync(path.join(root, 'dist', 'BEH4VIOR-Fourfold-Offline.html'), 'utf8');
  assert.equal((output.match(/<div class="panel">/g) || []).length, 4);
  assert.match(output, /BEH4VIOR_FOLDABLE/);
  assert.match(output, /BEH4VIOR_TRACING/);
  assert.match(output, /\bwindow\.print\(\)/);
  assert.match(output, /@page\{size:letter portrait;margin:\.3in\}/);
  assert.ok(!output.includes('<script src="/foldable'));
  assert.ok(!output.includes('<a href="/">'));
  assert.match(output, /connect-src 'none'/);
});
