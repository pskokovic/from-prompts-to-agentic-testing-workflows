const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const G = require('./context.js');
const archived = require('../archive-01/exercise-02-context-grounding/context.js');
assert.equal(G.sources.length, 7);
assert.equal(G.sourceLabel('OLD-01'), 'AC-02 · Release v0');
assert.equal(G.sourceLabel('AC-01–04'), 'AC-01–04 · Release v1');
for (const source of G.sources) assert.equal(source.text, archived.sources.find(s => s.id === source.id)?.text, `Archived source text changed: ${source.id}`);
assert.equal(G.questionOptions.filter(q => q.open).length, 4);
assert.equal(G.questionOptions.filter(q => !q.open).length, 2);
const good = G.empty();
for (const s of G.sources) good.decisions[s.id] = ['REQ-01', 'AC-01–04'].includes(s.id) ? 'include' : ['TIM-01', 'CI-01'].includes(s.id) ? 'defer' : 'exclude';
good.reasons = [{ source: 'OLD-01', text: 'Superseded by AC-02.' }, { source: 'CI-01', text: 'Observation for later diagnosis.' }];
good.conflict = 'AC-02 (release v1) says 30 minutes and supersedes release v0’s 15-minute rule.';
good.questions = [{ key: 'unregistered', custom: '' }, { key: 'boundary', custom: '' }];
assert(G.validate(good).complete);
assert.equal(G.evaluate(good).concerns.length, 0);
assert(G.packageText(good).includes('TWO REASONS'));
assert(G.packageText(good).includes('AC-02 · Release v0: exclude'));
assert(!G.packageText(good).includes('OLD-01'));
assert(!G.packageText(good).includes('CSV export should retain'));
const incomplete = G.empty();
assert.equal(G.validate(incomplete).missing.length, 7);
assert(!G.validate(incomplete).complete);
const duplicateReasons = structuredClone(good); duplicateReasons.reasons[1].source = 'OLD-01';
assert(G.validate(duplicateReasons).reasonDuplicate);
const invalidReason = structuredClone(good); invalidReason.decisions['OLD-01'] = 'include';
assert.deepEqual(G.validate(invalidReason).reasonErrors, [1]);
const duplicateQuestions = structuredClone(good); duplicateQuestions.questions[1].key = 'unregistered';
assert(G.validate(duplicateQuestions).questionDuplicate);
const ownQuestion = structuredClone(good); ownQuestion.questions[1] = { key: 'custom', custom: 'What happens with multiple outstanding links?' };
assert(G.validate(ownQuestion).complete);
assert(G.packageText(ownQuestion).includes('multiple outstanding links'));
ownQuestion.questions[1].custom = '';
assert.deepEqual(G.validate(ownQuestion).questionErrors, [2]);
const history = structuredClone(good); history.decisions['OLD-01'] = 'include'; history.history = true; history.reasons[0].source = 'NOISE-01';
assert(G.validate(history).complete);
assert.equal(G.evaluate(history).concerns.length, 0);
history.history = false;
assert(G.evaluate(history).concerns.some(s => s.includes('15-minute')));
const timing = structuredClone(good); timing.decisions['TIM-01'] = 'include'; timing.reasons[1].source = 'NOISE-01';
assert(G.validate(timing).complete);
assert(G.evaluate(timing).next.some(s => s.includes('3,000 ms')));
const answered = structuredClone(good); answered.questions = [{ key: 'duration', custom: '' }, { key: 'reuse', custom: '' }];
assert(G.validate(answered).complete);
assert.equal(G.evaluate(answered).concerns.filter(s => s.includes('already answered')).length, 2);
let count = 0;
for (let n = 0; n < 4 ** G.sources.length; n++) {
  const state = G.empty(); let digits = n;
  for (const s of G.sources) { state.decisions[s.id] = ['', 'include', 'exclude', 'defer'][digits % 4]; digits = Math.floor(digits / 4); }
  G.validate(state); G.evaluate(state); G.packageText(state); count++;
}
const worksheet = fs.readFileSync(path.join(__dirname, 'worksheet.html'), 'utf8');
for (const s of G.sources) {
  const escaped = s.text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  assert(worksheet.includes(escaped), `Worksheet source mismatch: ${s.id}`);
  assert(worksheet.includes(s.purpose), `Worksheet purpose mismatch: ${s.id}`);
}
for (const q of G.questionOptions) assert(worksheet.includes(q.text));
for (const file of ['index.html', 'worksheet.html', 'worked-example.html']) {
  for (const [, link] of fs.readFileSync(path.join(__dirname, file), 'utf8').matchAll(/(?:href|src)="([^"#]+)"/g)) assert(fs.existsSync(path.resolve(__dirname, link)), `Broken local link: ${file} → ${link}`);
}
console.log(`Passed: ${count} decision configurations; short-answer, alternative-package, question, source-parity and link checks.`);
