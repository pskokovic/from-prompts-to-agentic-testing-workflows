'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('./evidence.js');
const archived = require('../archive-01/exercise-03-evidence-challenge/evidence.js');
const generated = require('./build-worksheet.cjs');
function sound() {
  return { ...E.empty(), decision:'investigate', category:'synchronization', hypothesis1:'synchronization', hypothesis2:'product', observations:['snapshot','association','sleep'], evidenceLimit:'CI-01 shows absence at 1,002 ms, not service instability.', weakener:'A correlated reset error would weaken the valid-confirmation explanation.', action:'timing', actionResolve:'Establish the accepted integration timing bound.' };
}
for (const source of E.sources) {
  const original = archived.sources.find(s => s.id === source.id);
  assert.equal(source.text, original?.text, `${source.id} source text changed`);
  assert.equal(source.note, original.note, `${source.id} note changed`);
  assert(E.summaries[source.id], `${source.id} lacks a compact summary`);
}
assert(E.commit(E.empty()).error.includes('claim decision'));
assert(E.commit({ ...sound(), observations:[] }).error.includes('observed statement'));
assert(E.commit({ ...sound(), evidenceLimit:'' }).error.includes('cited evidence'));
assert(E.commit({ ...sound(), weakener:'' }).error.includes('future observation'));
assert(E.commit({ ...sound(), actionResolve:'' }).error.includes('what the action'));
let count = 0;
for (const decision of Object.keys(E.decisions)) for (const category of Object.keys(E.categories)) for (const h1 of Object.keys(E.hypotheses)) for (const h2 of Object.keys(E.hypotheses)) for (const action of Object.keys(E.actions)) {
  const s = { ...sound(), decision, category, hypothesis1:h1, hypothesis2:h2, action, other:'A distinct fixture issue.', rejection:'certainty' };
  const before = E.clone(s), result = E.commit(s);
  assert.deepEqual(s,before,'Commit must not mutate its input');
  if (h1 === h2) assert(result.error.includes('distinct')); else {
    assert.equal(result.error,'');
    assert.deepEqual(result.state.initial,before);
    assert.equal(result.state.request.action,action);
    assert.equal(E.available(result.state).some(x => x.includes('requested and revealed')),action === 'timing');
    const second = E.commit({...result.state,action:action === 'timing' ? 'trace':'timing'});
    assert(second.error.includes('already committed'));
    assert.deepEqual(second.state.request,result.state.request);
  }
  const feedback = E.evaluate(s);
  assert.equal(feedback.concerns.some(x => x.includes('global service instability')),decision === 'accept');
  assert.equal(feedback.concerns.some(x => x.includes('separate test')),h1 === 'policy' || h2 === 'policy');
  assert.equal(feedback.concerns.some(x => x.includes('longer sleep')),action === 'patch');
  assert.equal(feedback.concerns.some(x => x.includes('rerun without')),action === 'rerun');
  count++;
}
assert(E.commit({...sound(),decision:'reject'}).error.includes('meaning of rejection'));
assert(E.evaluate({...sound(),decision:'reject',rejection:'healthy'}).concerns.some(x=>x.includes('healthy')));
assert.equal(E.evaluate({...sound(),decision:'reject',rejection:'certainty'}).concerns.length,0);
assert.equal(E.evaluate({...sound(),observations:Object.keys(E.observations)}).concerns.length,2);
assert(E.commit({...sound(),hypothesis1:'other'}).error.includes('description'));
const unusual = {...sound(),evidenceLimit:'<img src=x onerror=alert(1)>'};
assert.equal(E.evaluate(unusual).concerns.length,0,'Free text is not semantically graded');
assert(E.packageText(unusual,null).includes(unusual.evidenceLimit));
const initial = sound(), committed = E.commit(initial).state;
assert(!E.packageText(initial,null).includes(E.timing));
assert(E.packageText(committed,null).includes(E.timing));
const trace = E.commit({...sound(),action:'trace'}).state;
assert(trace.request.status.includes('pending'));
assert(!E.packageText(trace,null).includes(E.timing));
assert(!E.available(trace).some(x => x.includes('TRACE')));
const prior = E.commit({...sound(),action:'trace',priorTiming:true}).state;
assert(E.available(prior.initial).some(x=>x.includes('prior reading')));
assert(!E.packageText(prior,null).includes(E.timing));
committed.decision = 'reject'; committed.rejection = 'certainty'; committed.revision = 'Reject the unsupported certainty.';
assert.equal(committed.initial.decision,'investigate');
assert.equal(E.evaluate(committed).missing.length,0);
assert(E.packageText(committed,initial).includes('LATEST REVIEWED DECISION'));
for (const [name,content] of Object.entries(generated.generated())) assert.equal(fs.readFileSync(path.join(__dirname,name),'utf8'),content,`${name} must be regenerated`);
const index = fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
assert(index.includes(generated.cards()));
assert(!index.includes(E.timing));
assert(!fs.readFileSync(path.join(__dirname,'worksheet.html'),'utf8').includes(E.timing));
for (const name of fs.readdirSync(__dirname).filter(x=>x.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(__dirname,name),'utf8');
  if (name !== 'index.html') assert(!/<script\b/i.test(html));
  for (const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    assert(!/^(?:\/|https?:|data:)/.test(href),`${name}: non-local link ${href}`);
    if (!href.startsWith('#')) assert(fs.existsSync(path.resolve(__dirname,href.split('#')[0])),`${name}: missing ${href}`);
  }
}
const scenarioPath = path.resolve(__dirname,'../../../tutorial-scenario.md');
if (fs.existsSync(scenarioPath)) {
  const scenario = fs.readFileSync(scenarioPath,'utf8').replace(/\r/g,'');
  E.sources.forEach(s => assert(scenario.includes(s.text),`${s.id} differs from scenario`));
  assert(scenario.includes(E.timing));
  assert(E.requirements.includes('AC-02 (release v1):'));
  // Version labels qualify identity; compare the unchanged requirement wording.
  for (const line of E.requirements.split('\n')) assert(scenario.replace(/\*\*/g,'').includes(line.replace('AC-02 (release v1):', 'AC-02:')));
  console.log('Scenario v1.0 source text, requirements and timing parity passed.');
}
console.log(`Passed ${count} decision/category/hypothesis/action combinations; short-answer, reveal, snapshot, source, worksheet and link checks.`);
