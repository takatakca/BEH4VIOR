/* Make a no-server, no-network printable worksheet from the reviewed source files. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const app = path.join(root, 'app');
let html = fs.readFileSync(path.join(app, 'foldable.html'), 'utf8');
for (const file of ['foldable-core.js', 'tracing-core.js', 'foldable.js']) {
  const marker = '<script src="/' + file + '"></script>';
  if (!html.includes(marker)) throw new Error('Missing source script marker: ' + file);
  const source = fs.readFileSync(path.join(app, file), 'utf8');
  if (source.includes('</script>')) throw new Error('Unexpected script end tag in ' + file);
  html = html.replace(marker, '<script>\n' + source + '\n</script>');
}
const oldBack = '<a href="/">← Back to daily tracker</a>';
if (!html.includes(oldBack)) throw new Error('Unexpected back link');
html = html.replace(oldBack, '<span>BEH4VIOR — offline printable worksheet</span>');
const note = 'One sheet, four equal panels, three smiley choices. Stored on this device only; not sent to BEH4VIOR or TAKATAK servers.';
if (!html.includes(note)) throw new Error('Unexpected privacy note');
html = html.replace(note, 'This offline worksheet makes no network requests. Enter information only on a trusted device; local browser saving may be unavailable when opening an HTML file. Print or save as PDF before closing.');
// Restrict this exported HTML to local styles/scripts; no external calls by default.
html = html.replace('<meta name="robots" content="noindex,nofollow">',
  '<meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; connect-src \'none\'; form-action \'none\'; base-uri \'none\'">');
const dir = path.join(root, 'dist');
fs.mkdirSync(dir, {recursive: true});
const output = path.join(dir, 'BEH4VIOR-Fourfold-Offline.html');
fs.writeFileSync(output, html);
console.log(output);
