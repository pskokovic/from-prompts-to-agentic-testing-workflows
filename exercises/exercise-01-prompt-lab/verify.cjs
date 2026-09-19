const assert = require('node:assert/strict');
const { buildPrompt, evaluate } = require('./app.js');
const flags = ['requirement', 'criteria', 'structured', 'coverage', 'noInvent', 'assumptions', 'functional', 'trace'];
let count = 0;
for (const role of ['', 'tester', 'developer', 'analyst']) {
  for (const task of ['generic', 'conditions']) {
    for (let mask = 0; mask < 256; mask++) {
      const c = { role, task, extra: '' };
      flags.forEach((flag, i) => c[flag] = Boolean(mask & (1 << i)));
      const result = evaluate(c);
      assert.deepEqual(evaluate(c), result);
      assert.ok(Object.values(result.scores).every(v => v >= 0 && v <= 100));
      assert.equal(result.rows.some(r => r[2] === 'Unsupported assumption'), !c.noInvent);
      assert.equal(buildPrompt(c).includes('REQ-01:'), c.requirement);
      assert.equal(buildPrompt(c).includes('AC-04:'), c.criteria);
      assert.ok(result.rows.every(r => !r[2].startsWith('AC-') || c.criteria));
      assert.ok(result.rows.every(r => r[2] !== 'REQ-01' || c.requirement));
      assert.deepEqual(evaluate({ ...c, extra: '<script>example</script>' }).scores, result.scores);
      count++;
    }
  }
}
const strong = { role: 'tester', task: 'conditions', extra: '' };
flags.forEach(f => strong[f] = true);
assert.deepEqual(Object.values(evaluate(strong).scores), [100, 100, 100, 100]);
assert.deepEqual(Object.values(evaluate({}).scores), [0, 0, 0, 0]);
assert.equal(evaluate({ noInvent: true }).rows.length, 0);
const distractions = ['legacy', 'infer', 'hideGaps', 'brief', 'title'];
for (let mask = 0; mask < 32; mask++) {
  for (let base = 0; base < 256; base++) {
    const c = { role: 'tester', task: 'conditions', extra: '' };
    flags.forEach((f, i) => c[f] = Boolean(base & (1 << i)));
    distractions.forEach((f, i) => c[f] = Boolean(mask & (1 << i)));
    const r = evaluate(c);
    assert.deepEqual(evaluate(c), r);
    assert.ok(Object.values(r.scores).every(v => v >= 0 && v <= 100));
    assert.equal(r.rows.some(row => row[2] === 'Unsupported assumption'), !c.noInvent || c.infer);
    assert.equal(r.rows.some(row => row[0].includes('16 minutes')), c.legacy);
    if (c.legacy) assert.ok(!r.rows.some(row => row[2] === 'AC-02'));
    if (c.hideGaps) assert.ok(!r.effective.assumptions && !r.effective.coverage);
    if (c.brief) assert.ok(!r.effective.structured && !r.effective.trace && !r.effective.coverage);
    assert.deepEqual(evaluate({ ...c, title: !c.title }).scores, r.scores);
    count++;
  }
}
const all = { ...strong };
distractions.forEach(f => all[f] = true);
assert.ok(Object.values(evaluate(all).scores).every(v => v < 100));
for (const f of distractions.filter(f => f !== 'title')) assert.ok(evaluate({ ...strong, [f]: true }).average < 100);
console.log(`Passed: ${count} configurations, including distractor combinations, conflicting instructions, neutral choices and all-selected regression.`);
console.log('All-selected scores:', evaluate(all).scores);
