'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('./model.js');
const dir = __dirname;
const strong = {
  extract: { input: 'current', task: 'separate', format: 'linked', review: 'grounding' },
  risk: { input: 'handoff', task: 'impact', format: 'linked', review: 'grounding' },
  tests: { input: 'handoff', task: 'oracles', format: 'linked', review: 'grounding' }
};
function withOrder(chosen) {
  let state = M.initialState();
  chosen.forEach((task, index) => { state = M.moveTask(state, task, index); });
  return M.confirmMap(state);
}
function configure(state, stage, choices) {
  for (const slot of M.slots) state = M.placeBlock(state, stage, slot, choices[slot]);
  return state;
}
function pass(state, stage, choices) {
  state = configure(state, stage, choices);
  state = M.run(state, stage);
  return M.decision(state, stage, 'pass', 'AC-04 and AC-03: inspect the response and gaps.');
}
function permutations(items) {
  if (!items.length) return [[]];
  return items.flatMap((item, index) => permutations(items.filter((_, i) => i !== index)).map(rest => [item, ...rest]));
}
assert.equal(M.notice, 'Local simulation · No AI service connected · Nothing is sent or saved');
assert.deepEqual(M.initialState().taskMap, M.order, 'default order is usable');
assert.equal(M.confirmMap(M.initialState()).mapConfirmed, true);
assert.equal(M.confirmMap(withOrder(['tests', 'risk', 'extract'])).mapConfirmed, true);
for (const stage of M.order) {
  let previewState = withOrder([stage, ...M.order.filter(id => id !== stage)]);
  assert.deepEqual(previewState.slots[stage], { input: null, task: null, format: null, review: null }, `${stage} starts without preselected blocks`);
  assert.equal(M.promptFor(previewState, stage), null);
  assert.equal((M.promptPreviewFor(previewState, stage).match(/\[Choose an option above\]/g) || []).length, 4);
  for (const slot of M.slots) {
    previewState = M.placeBlock(previewState, stage, slot, strong[stage][slot]);
    assert.match(M.promptPreviewFor(previewState, stage), new RegExp(M.blocks[stage][slot].find(block => block.id === strong[stage][slot]).text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.equal(M.promptPreviewFor(previewState, stage), M.promptFor(previewState, stage), `${stage} preview matches runnable prompt`);
  const alternateFormat = M.blocks[stage].format.find(block => block.id !== strong[stage].format).id;
  const alternateReview = M.blocks[stage].review.find(block => block.id !== strong[stage].review).id;
  const formatChanged = M.placeBlock(previewState, stage, 'format', alternateFormat);
  const reviewChanged = M.placeBlock(previewState, stage, 'review', alternateReview);
  assert.notEqual(M.promptPreviewFor(formatChanged, stage), M.promptPreviewFor(previewState, stage), `${stage} output-format choice changes prompt`);
  assert.notEqual(M.promptPreviewFor(reviewChanged, stage), M.promptPreviewFor(previewState, stage), `${stage} review-condition choice changes prompt`);
}
assert.equal(M.sources[2][1], 'The link expires 30 minutes after issue.');
assert.equal(M.sources[4][1], 'After a successful reset, the new password works and the old password does not.');
assert.throws(() => M.run(withOrder(M.order), 'extract'), /Complete/);
assert.throws(() => M.advance(withOrder(M.order)), /Pass/);

let state = configure(withOrder(M.order), 'extract', strong.extract);
assert.throws(() => M.decision(state, 'extract', 'pass', 'AC-04 review'), /Run/);
state = M.run(state, 'extract');
const same = M.run(configure(withOrder(M.order), 'extract', strong.extract), 'extract');
assert.equal(state.history[0].response.text, same.history[0].response.text);
let formatTrial = M.placeBlock(state, 'extract', 'format', 'table');
formatTrial = M.run(formatTrial, 'extract');
assert.equal(formatTrial.history.length, 2, 'format changes preserve the first run');
assert.match(formatTrial.history.at(-1).response.text, /^\| # \| Prepared response \|/);
assert.equal(formatTrial.history.at(-1).response.sourceIds.length, 0);
assert.notEqual(formatTrial.history.at(-1).response.text, formatTrial.history[0].response.text);
assert.equal(formatTrial.history.at(-1).response.presentation, 'table');
assert.equal(formatTrial.history[0].response.presentation, 'list');
assert.ok(formatTrial.history.at(-1).response.text.includes('| 1 | Registered email'));
formatTrial = M.decision(formatTrial, 'extract', 'pass', 'AC-04: table has no source IDs; review against current cards.');
assert.equal(M.inputFor(formatTrial, 'risk'), formatTrial.history.at(-1).response.text, 'table text passes forward unchanged');
const noNote = M.decision(state, 'extract', 'pass', '');
assert.equal(noNote.decisions.extract.note, '', 'blank review note is allowed');
assert.match(M.inputDetailsFor(noNote, 'risk'), /Optional review note \(for the record only\): none/);
assert.match(M.record(noNote), /REVIEW: pass — no note/);
const plainNote = M.decision(state, 'extract', 'pass', 'looks fine');
assert.equal(plainNote.decisions.extract.note, 'looks fine', 'a note needs no source ID');
assert.equal(M.inputFor(noNote, 'risk'), M.inputFor(plainNote, 'risk'));
const riskWithoutNote = M.run(configure(M.advance(noNote), 'risk', strong.risk), 'risk');
const riskWithNote = M.run(configure(M.advance(plainNote), 'risk', strong.risk), 'risk');
assert.equal(riskWithoutNote.history.at(-1).response.text, riskWithNote.history.at(-1).response.text, 'note does not affect next prepared response');
state = M.decision(state, 'extract', 'pass', 'AC-04 supports both credential outcomes; policy remains open.');
assert.equal(state.current, 0, 'passing exposes an explicit continue step');
assert.equal(M.inputFor(state, 'risk'), state.decisions.extract.payload);
assert.match(M.inputDetailsFor(state, 'risk'), /Optional review note \(for the record only\): AC-04 supports/);
state = M.advance(state);
assert.equal(state.current, 1);
state = pass(state, 'risk', strong.risk);
assert.equal(M.inputFor(state, 'tests'), state.decisions.risk.payload);
state = M.advance(state);
state = pass(state, 'tests', strong.tests);
assert.match(state.decisions.tests.payload, /new password authenticates and old password is rejected/);
assert.match(M.status(state), /Three-stage test proposal/);
assert.equal(state.firstAttempt.stages[2].decision.kind, 'pass');
assert.equal(M.comparison(state).phase, 'baseline', 'first complete chain is saved for comparison');
assert.equal(state.baseline.stages[2].run, state.runs.tests);
assert.throws(() => M.chooseComparison(state, 'checkpoint', 'revised'), /Review both/);
const firstAttempt = JSON.stringify(state.firstAttempt);
const baseline = JSON.stringify(state.baseline);
const runCount = state.history.length;
state.current = 0;
state = M.placeBlock(state, 'extract', 'input', 'suggestion');
assert.equal(state.stale.risk, true);
assert.equal(state.stale.tests, true);
assert.equal(M.inputFor(state, 'risk'), null);
assert.equal(M.comparison(state).phase, 'in-progress');
assert.equal(M.comparison(state).checkpointStage, 'risk');
state = M.run(state, 'extract');
assert.match(state.history.at(-1).response.text, /12-character minimum/);
state = M.decision(state, 'extract', 'pass', 'AC-04 does not approve a 12-character minimum.');
assert.equal(state.history.length, runCount + 1);
assert.equal(JSON.stringify(state.firstAttempt), firstAttempt);
state = M.advance(state);
assert.throws(() => M.decision(state, 'risk', 'pass', 'AC-04 reviewed'), /Run/);
state = M.run(state, 'risk');
assert.match(state.history.at(-1).response.text, /inherited 12-character claim/);
state = M.decision(state, 'risk', 'pass', 'AC-04 policy claim remains unsupported.');
assert.equal(state.stale.tests, true);
assert.ok(M.record(state).includes('NEEDS REVIEW'));
assert.equal(JSON.stringify(state.baseline), baseline, 'first complete chain remains immutable');
const checkpoint = M.comparison(state);
assert.equal(checkpoint.phase, 'checkpoint', 'first affected downstream handoff can be compared in class');
assert.equal(checkpoint.checkpoint.baseline.number, 2);
assert.equal(checkpoint.checkpoint.revised.number, state.runs.risk);
assert.equal(checkpoint.final, null, 'stale final output is not presented as a revised chain');
assert.match(M.record(state), /CHECKPOINT: Identify risks/);
state = M.chooseComparison(state, 'checkpoint', 'first');
assert.equal(M.comparison(state).checkpoint.vote, 'first');
assert.match(M.record(state), /Judgment: first/);
state = M.advance(state);
state = M.run(state, 'tests');
state = M.decision(state, 'tests', 'pass', 'AC-04: review the revised oracles.');
const completeComparison = M.comparison(state);
assert.equal(completeComparison.phase, 'complete', 'two full chains can be compared after take-home continuation');
assert.equal(completeComparison.final.baseline.number, 3);
assert.equal(completeComparison.final.revised.number, state.runs.tests);
assert.equal(JSON.stringify(state.baseline), baseline);
assert.match(M.record(state), /FINAL OUTPUT: Propose test ideas and observable oracles/);
state = M.chooseComparison(state, 'final', 'neither');
assert.equal(M.comparison(state).final.vote, 'neither');
assert.match(M.record(state), /Judgment: neither/);
let newRevision = M.clone(state); newRevision.current = 0;
newRevision = M.placeBlock(newRevision, 'extract', 'input', 'current');
assert.equal(M.comparison(newRevision).phase, 'in-progress', 'a later revision makes the old comparison non-current');
newRevision = M.run(newRevision, 'extract');
newRevision = M.decision(newRevision, 'extract', 'pass', '');
newRevision = M.advance(newRevision);
newRevision = M.run(newRevision, 'risk');
newRevision = M.decision(newRevision, 'risk', 'pass', '');
assert.equal(M.comparison(newRevision).checkpoint.vote, null, 'a vote on an older pair is not reused for new responses');

let held = configure(withOrder(M.order), 'extract', strong.extract);
held = M.run(held, 'extract');
held = M.decision(held, 'extract', 'hold', 'AC-04: clarify the handoff before continuing.');
assert.equal(M.comparison(held).phase, 'await-baseline', 'a held partial route is not a complete comparison baseline');
assert.equal(M.inputFor(held, 'risk'), null);
assert.throws(() => M.advance(held), /Pass/);
held = M.run(held, 'extract');
held = M.decision(held, 'extract', 'pass', 'AC-04: checked again after clarification.');
assert.equal(M.inputFor(held, 'risk'), held.decisions.extract.payload);
held = M.advance(held);
held = pass(held, 'risk', strong.risk);
held = M.advance(held);
held = pass(held, 'tests', strong.tests);
assert.equal(M.comparison(held).phase, 'baseline', 'a complete chain after an earlier hold becomes the comparison baseline');
assert.equal(held.firstAttempt.stages[0].decision.kind, 'hold', 'original hold remains in the first-attempt record');

for (const chosen of permutations(M.order)) {
  let route = withOrder(chosen);
  assert.deepEqual(M.sequence(route), chosen);
  for (let i = 0; i < 3; i++) {
    const stage = chosen[i];
    route = pass(route, stage, strong[stage]);
    const entry = route.history.at(-1);
    assert.equal(entry.stage, stage);
    assert.ok(entry.response.text);
    if (i > 0) assert.equal(entry.input, route.decisions[chosen[i - 1]].payload, 'exact prior response is the next input');
    if (stage === 'extract' && i > 0) assert.ok(entry.response.flags.includes('late-extraction'));
    if (i < 2) route = M.advance(route);
  }
  assert.match(M.status(route), /Three-stage/);
  if (chosen[2] !== 'tests') assert.match(M.status(route), /Test ideas appeared earlier/);
  assert.deepEqual(route.firstAttempt.taskMap, chosen);
}

const allChoices = stage => Array.from({ length: 16 }, (_, mask) => Object.fromEntries(M.slots.map((slot, i) => [slot, M.blocks[stage][slot][(mask >> i) & 1].id])));
let checked = 0;
for (const stage of M.order) {
  for (const choices of allChoices(stage)) {
    let sample = configure(withOrder([stage, ...M.order.filter(id => id !== stage)]), stage, choices);
    sample = M.run(sample, stage);
    const response = sample.history.at(-1).response;
    assert.equal(response.text, M.responseFor(sample, stage).text);
    if (choices.format === 'table') assert.equal(response.sourceIds.length, 0);
    checked++;
  }
}
for (const inherited of [
  'After reset, new password works and old password does not (AC-04).',
  'After reset, show a success confirmation.',
  'After reset, new password works and old password does not (AC-04). Enforce a 12-character minimum (AC-04).',
  'After reset, show a success confirmation. Enforce a 12-character minimum (AC-04).'
]) {
  for (const stage of M.order) {
    for (const choices of allChoices(stage)) {
      const prior = M.order.find(id => id !== stage);
      let sample = withOrder([prior, stage, M.order.find(id => id !== stage && id !== prior)]);
      sample.current = 1;
      sample.decisions[prior] = { kind: 'pass', payload: inherited, note: 'AC-04 reviewed', sourceIds: ['AC-04'], gaps: [] };
      sample.slots[stage] = choices;
      const response = M.responseFor(sample, stage);
      assert.ok(response.text);
      if (/12-character/.test(inherited)) assert.ok(response.flags.includes('inherited-policy'));
      if (stage === 'risk' && !/old password/.test(inherited)) assert.ok(response.flags.includes('missing-ac04'));
      if (stage === 'tests' && !/old password/.test(inherited)) assert.ok(response.flags.includes('weak-oracle'));
      checked++;
    }
  }
}
const generated = ['worksheet.html', 'response-cards.html', 'worked-example.html'];
const before = generated.map(name => fs.readFileSync(path.join(dir, name), 'utf8'));
require('./build-pages.cjs');
generated.forEach((name, i) => assert.equal(fs.readFileSync(path.join(dir, name), 'utf8'), before[i], `${name} should be generated reproducibly`));
for (const name of ['index.html', ...generated]) {
  const html = fs.readFileSync(path.join(dir, name), 'utf8');
  assert.ok(html.includes(M.notice));
  assert.ok(!/TIM-01|DATA-01|TRACE-01|CI-01|VALID-01/.test(html), `${name} leaks later evidence`);
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (href.startsWith('#') || /^[a-z]+:/i.test(href)) continue;
    assert.ok(fs.existsSync(path.resolve(dir, href.split('#')[0])), `${name} missing ${href}`);
  }
}
for (const [id, text] of M.sources) assert.ok(fs.readFileSync(path.join(dir, 'worksheet.html'), 'utf8').includes(text), `Missing ${id} in worksheet`);
assert.ok(fs.readFileSync(path.join(dir, 'worksheet.html'), 'utf8').includes('Use the default order or choose any other order'));
assert.ok(fs.readFileSync(path.join(dir, 'worksheet.html'), 'utf8').includes('Take-home full comparison'));
assert.equal((fs.readFileSync(path.join(dir, 'worksheet.html'), 'utf8').match(/Optional review note:/g) || []).length, 3);
assert.ok(!fs.readFileSync(path.join(dir, 'worksheet.html'), 'utf8').includes('My source-linked review note:'));
assert.ok(fs.readFileSync(path.join(dir, 'response-cards.html'), 'utf8').includes('If extraction is not first'));
assert.ok(fs.readFileSync(path.join(dir, 'response-cards.html'), 'utf8').includes('Markdown table'));
assert.ok(fs.readFileSync(path.join(dir, 'response-cards.html'), 'utf8').includes('Comparison checkpoint'));
assert.ok(fs.readFileSync(path.join(dir, 'worked-example.html'), 'utf8').includes('Compare the two chains'));
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
assert.ok(!/\.innerHTML\s*=/.test(app), 'learner text should render literally');
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(app), 'no network call');
assert.ok(app.includes("input.type = 'radio'"), 'prompt blocks use radio choices');
assert.ok(app.includes("element('table', 'result-table')"), 'table output uses a semantic table');
assert.ok(app.includes("element('ul', 'result-list')"), 'list output uses a semantic list');
assert.ok(app.includes('Compare with previous run') || fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes('Compare with previous run'), 'a changed run can be compared');
assert.ok(app.includes("event.dataTransfer.setData('text/plain', id)"), 'task cards can be dragged');
assert.ok(!fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes('Place first'), 'no redundant placement buttons');
assert.ok(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes('Optional review note (for your record; does not change the next response)'));
assert.ok(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes('Assembled prompt · live preview'));
assert.ok(app.includes('M.promptPreviewFor(state, id)'), 'radio changes render the live prompt preview');
assert.ok(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes('Compare your chains'));
assert.ok(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes('Full-chain comparison · optional take-home'));
assert.ok(app.includes('M.chooseComparison(state, scope, radio.value)'), 'comparison judgment is recorded');
assert.ok(fs.readFileSync(path.join(dir, 'styles.css'), 'utf8').includes('.output-choice:has(input:checked)'), 'use the existing exercise choice treatment');
assert.ok(M.record(state).includes('FIRST ATTEMPT'));
console.log(`Verified six task orders, ${checked} block/inheritance cases, explicit continuation, review gates, revision and offline parity.`);
