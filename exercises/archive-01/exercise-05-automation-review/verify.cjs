'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), {execFileSync}=require('node:child_process'), M=require('./review.js');
const base={wait:'retain',credentials:'fresh',policy:'defer',validation:['delay','deadline','error','newFails','oldWorks'],rationale:'TIM-01 / AC-04 / DATA-01',evidence:'Timestamps, fixture IDs, fresh session authentication outcomes, diagnostics.',reviewer:'Designated automation reviewer',conditions:'Actual implementation validation and policy clarification remain.',permissionReason:'Scoped approval covers this action only.',request:'patch',approval:'patch',decision:'allow',disposition:'partial'};
assert.deepEqual(M.missing(base),[]);assert.equal(M.evaluate(base).technicalReady,true);assert.match(M.evaluate(base).permission,/ALLOWED IN SIMULATION/);assert.equal(M.evaluate(base).accepted,false);
let count=0, ready=0;
for(const w of M.groups[0].options)for(const c of M.groups[1].options)for(const p of M.groups[2].options)for(let mask=0;mask<2**M.validation.length;mask++) {
  const selected=M.validation.filter((v,i)=>mask & (1<<i)).map(v=>v.id);
  const s={...base,wait:w.id,credentials:c.id,policy:p.id,validation:selected};
  const e=M.evaluate(s), expected=w.good&&c.good&&p.good&&M.validation.every(v=>selected.includes(v.id)===v.good);
  assert.equal(e.technicalReady,expected);assert.equal(e.accepted,false);assert.equal(e.corrections.length,3);
  assert.equal(e.permission.startsWith('ALLOWED'),Boolean(expected));
  assert(e.corrections.every(item=>item.explanation&&item.source));count++;if(e.technicalReady)ready++;
}
let authorityCount=0;
for(const request of M.requests)for(const approval of M.approvals)for(const decision of M.decisions)for(const disposition of M.dispositions)for(const technical of [true,false]) {
  const s={...base,request:request.id,approval:approval.id,decision:decision.id,disposition:disposition.id,credentials:technical?'fresh':'retain'};
  const e=M.evaluate(s), auth=Boolean(request.needs&&request.needs===approval.id);
  assert.equal(e.authorized,auth);assert.equal(e.accepted,false);
  assert.equal(e.permission.startsWith('ALLOWED'),auth&&decision.id==='allow'&&disposition.id!=='stop'&&technical);
  if(request.id==='production')assert.match(e.permission,/^BLOCKED/);
  if(disposition.id==='stop')assert.match(e.disposition,/unresolved/);
  authorityCount++;
}
for(const key of M.requiredText){const s={...base,[key]:'  '};assert(M.missing(s).length);assert(!M.evaluate(s).technicalReady);}
assert(M.missing({...base,wait:'bogus'}).length);assert(M.missing({...base,validation:[]}).length);
const original=M.snapshot(base),draft=M.snapshot(original);draft.validation.push('repeat');draft.rationale='changed';assert.deepEqual(original,base);
assert.match(M.record(base),/not executed/);assert.match(M.feedbackText(base),/no tests were executed/i);
assert.match(M.evaluate({...base,approval:'comparison'}).permission,/No matching/);
assert.match(M.evaluate({...base,decision:'block'}).permission,/BLOCKED BY REVIEWER/);
assert.match(M.evaluate({...base,decision:'defer'}).permission,/DEFERRED/);
execFileSync(process.execPath,[path.join(__dirname,'build-pages.cjs'),'--check'],{stdio:'pipe'});
const scenario=fs.readFileSync(path.resolve(__dirname,'../../../../tutorial-scenario.md'),'utf8');
for(const id of ['TIM-01','DATA-01'])assert(scenario.includes(M.sources.find(s=>s.id===id).text),id+' differs from authoritative scenario');
assert(scenario.includes(M.sources.find(s=>s.id==='CODE-01').text));
for(const line of M.sources[0].text.split('\n'))assert(scenario.includes('**'+line.split(': ')[0]+':** '+line.split(': ').slice(1).join(': ')));
for(const file of ['index.html','worksheet.html','feedback.html','worked-example.html']) {
  const html=fs.readFileSync(path.join(__dirname,file),'utf8');
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target=match[1];assert(!/^https?:|^\//.test(target),'External or root-relative asset');
    if(!target.startsWith('#'))assert(fs.existsSync(path.resolve(__dirname,target.split('#')[0])),file+' missing '+target);
  }
  assert(!html.includes('1420ms')&&!html.includes('1460ms')&&!html.includes('prepared controlled comparison;'),'Mission evidence leak');
  assert(html.includes('Local simulation · No AI service connected · Nothing is sent or saved'));
}
const worksheet=fs.readFileSync(path.join(__dirname,'worksheet.html'),'utf8'),index=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
assert(!worksheet.includes('<script'));assert(!index.includes('Worked review alternatives'));
for(const item of [...M.groups.flatMap(g=>g.options),...M.validation]) {const text=item.label.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');assert(worksheet.includes(text));assert(index.includes(text));}
console.log(`${count} correction/validation packages (${ready} technically defensible), ${authorityCount} authority combinations, source parity, snapshot, generated-content, fallback-choice, link, and reveal-boundary checks passed.`);
