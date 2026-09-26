const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const G = require('./context.js');
const good = G.empty();
for (const [id, d] of Object.entries(good.decisions)) {
  d.choice = ['REQ-01', 'AC-01–04'].includes(id) ? 'include' : ['TIM-01', 'CI-01'].includes(id) ? 'defer' : 'exclude';
  d.reason = 'Scope and authority reviewed.';
}
good.conflict = 'AC-02 supersedes OLD-01: 30 minutes.';
good.questions = ['What happens for unregistered email?', 'What happens at exactly 30 minutes?'];
assert.equal(G.evaluate(good).concerns.length, 0);
assert.equal(G.evaluate(good).examples.length, 4);
const historical = structuredClone(good);
historical.decisions['OLD-01'].choice = 'include'; historical.history = 'history';
assert.equal(G.evaluate(historical).concerns.length, 0);
historical.history = 'authority';
assert(G.evaluate(historical).concerns.some(s => s.includes('15-minute')));
const none = G.evaluate(G.empty());
assert.equal(none.examples.length, 0);
assert(none.next.some(s => s.includes('7 source')));
const all = structuredClone(good);
Object.values(all.decisions).forEach(d => { d.choice = 'include'; });
assert(G.evaluate(all).concerns.length >= 4);
assert(G.evaluate(all).next.some(s => s.includes('two exclusion')));
const irrelevant = G.empty(); irrelevant.decisions['NOISE-01'].choice = 'include';
assert.equal(G.evaluate(irrelevant).examples.length, 0);
const suggest = structuredClone(good); suggest.decisions['SUGGEST-01'].choice = 'include';
assert(G.evaluate(suggest).concerns.some(s => s.includes('unsupported policy')));
const copied = G.packageText(historical);
assert(copied.includes('30 minutes')); assert(copied.includes('15 minutes')); assert(copied.includes('not bounded as history'));
assert(!G.packageText(good).includes('CSV export should retain'));
assert(G.packageText(good).includes('NOISE-01: exclude'));
// Every combination of seven decisions must remain evaluable; all-source choices cannot hide hazards.
let count = 0;
for (let n = 0; n < 4 ** G.sources.length; n++) {
  const s = G.empty(); let digits = n;
  for (const source of G.sources) { s.decisions[source.id].choice = ['', 'include', 'exclude', 'defer'][digits % 4]; digits = Math.floor(digits / 4); }
  const result = G.evaluate(s);
  assert(!result.examples.some(row => row.includes('15 minutes') || row.includes('12 characters')));
  if (s.decisions['AC-01–04'].choice !== 'include') assert(!result.examples.some(row => row.includes('[AC-02]')));
  count++;
}
const worksheet = fs.readFileSync(path.join(__dirname, 'worksheet.html'), 'utf8');
for (const s of G.sources) assert(worksheet.includes(s.text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')), `Worksheet source mismatch: ${s.id}`);
for (const file of ['index.html', 'worksheet.html', 'worked-example.html']) {
  for (const [, link] of fs.readFileSync(path.join(__dirname, file), 'utf8').matchAll(/(?:href|src)="([^"#]+)"/g)) assert(fs.existsSync(path.resolve(__dirname, link)), `Broken local link: ${link}`);
}
console.log(`Passed: ${count} decision combinations, core teaching paths, package boundaries, worksheet parity, and local links.`);
