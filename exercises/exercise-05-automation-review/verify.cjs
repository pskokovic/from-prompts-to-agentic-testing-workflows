'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),M=require('./review.js');
const base={wait:'retain',credentials:'fresh',policy:'defer',rationale:'TIM-01 supports the bounded wait; AC-04 and DATA-01 require fresh sessions. No AC defines a length rule.',successOutcome:'pass',faultIds:['late','oldWorks'],faultOutcomes:{late:'fail',oldWorks:'fail'},cardId:'A',decision:'allow',permissionReason:'The designated reviewer approved the test-branch patch only.'};
assert.deepEqual(M.missing(base),[]);
assert(M.evaluate(base).reviewReady);
assert.match(M.evaluate(base).permission,/ALLOWED IN SIMULATION/);
assert.equal(M.evaluate(base).accepted,false);
assert.deepEqual(M.evaluate(base).outstanding.map(item=>item.id),['error','newFails']);
const pairs=[];for(let i=0;i<M.faults.length;i++)for(let j=i+1;j<M.faults.length;j++)pairs.push([M.faults[i],M.faults[j]]);
let checked=0,ready=0;
for(const wait of M.groups[0].options)for(const credentials of M.groups[1].options)for(const policy of M.groups[2].options)
for(const pair of pairs)for(const success of M.success.outcomes)for(const first of pair[0].outcomes)for(const second of pair[1].outcomes)
for(const card of M.cards)for(const decision of M.decisions){
  const s={...base,wait:wait.id,credentials:credentials.id,policy:policy.id,successOutcome:success.id,faultIds:pair.map(item=>item.id),faultOutcomes:{[pair[0].id]:first.id,[pair[1].id]:second.id},cardId:card.id,decision:decision.id};
  const result=M.evaluate(s),expectReady=wait.good&&credentials.good&&policy.good&&success.good&&first.good&&second.good;
  assert.deepEqual(M.missing(s),[]);assert.equal(result.reviewReady,expectReady);assert.equal(result.accepted,false);
  assert.equal(result.outstanding.length,2);assert(result.outstanding.every(item=>!s.faultIds.includes(item.id)));
  assert.equal(result.authorized,card.id==='A');assert.equal(result.prohibited,card.id==='C');
  assert.equal(result.permission.startsWith('ALLOWED'),card.id==='A'&&decision.id==='allow'&&expectReady);
  if(card.id==='C')assert.match(result.permission,/^BLOCKED/);
  if(card.id==='B'&&decision.id==='allow')assert.match(result.permission,/^BLOCKED NOW/);
  if(card.id==='A'&&decision.id==='allow'&&!expectReady)assert.match(result.permission,/HELD FOR CORRECTION/);
  checked++;if(expectReady)ready++;
}
assert.equal(checked,11664);
for(const key of ['wait','credentials','policy','rationale','successOutcome','decision','permissionReason'])assert(M.missing({...base,[key]:''}).length);
for(const faults of [[],['late'],['late','late'],['late','error','oldWorks'],['bogus','late']])assert(M.missing({...base,faultIds:faults}).length);
assert(M.missing({...base,faultOutcomes:{late:'fail'}}).length);
assert(M.missing({...base,faultOutcomes:{late:'pass',oldWorks:'bogus'}}).length);
assert.equal(M.cardFor('missing').id,'A');
const copy=M.snapshot(base);copy.faultIds.push('error');copy.rationale='changed';assert.equal(base.faultIds.length,2);assert.notEqual(base.rationale,'changed');
assert.match(M.record(base),/Outstanding checks for later acceptance/);assert.match(M.record(base),/Accepted after validation: No/);
assert.match(M.feedbackText(base),/No patch or comparison ran/);
execFileSync(process.execPath,[path.join(__dirname,'build-pages.cjs'),'--check']);
const scenario=fs.readFileSync(path.resolve(__dirname,'../../../tutorial-scenario.md'),'utf8');
for(const id of ['TIM-01','DATA-01'])assert(scenario.includes(M.sources.find(source=>source.id===id).text),id+' differs from scenario');
assert(scenario.includes(M.sources.find(source=>source.id==='CODE-01').text));
assert(M.sources[0].text.includes('AC-02 (release v1):'));
// Compare canonical wording while requiring the visible current-version label.
for(const line of M.sources[0].text.split('\n')){const [id,...words]=line.replace('AC-02 (release v1):','AC-02:').split(': ');assert(scenario.includes('**'+id+':** '+words.join(': ')),id+' differs from scenario');}
const files=['index.html','worksheet.html','worksheet-A.html','worksheet-B.html','worksheet-C.html','feedback.html','worked-example.html'];
for(const name of files){
  const html=fs.readFileSync(path.join(__dirname,name),'utf8');
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const target=match[1].split('#')[0];if(!target)continue;
    assert(!/^https?:|^\//.test(target),'External/root-relative link: '+target);
    assert(fs.existsSync(path.resolve(__dirname,target)),name+' missing '+target);
  }
  assert(html.includes(M.notice));
  assert(!html.includes('TRACE-01')&&!html.includes('VALID-01')&&!html.includes('1420ms')&&!html.includes('1460ms'),name+' leaks later mission evidence');
  if(name.startsWith('worksheet'))assert(!html.includes('<script'));
}
const index=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
assert(!index.includes('name="request"')&&!index.includes('name="approval"'));
assert(index.includes('id="card-id"')&&index.includes('name="faultIds"'));
for(const group of M.groups){assert(index.includes(group.excerpt.replaceAll('&','&amp;')));for(const option of group.options)assert(index.includes(option.label.replaceAll('&','&amp;')));}
for(const card of M.cards){const html=fs.readFileSync(path.join(__dirname,'worksheet-'+card.id+'.html'),'utf8');assert(html.includes(card.request));assert(html.includes(card.approval));for(const other of M.cards.filter(item=>item!==card))assert(!html.includes(other.request));}
assert.equal(fs.readFileSync(path.join(__dirname,'worksheet.html'),'utf8'),fs.readFileSync(path.join(__dirname,'worksheet-A.html'),'utf8'));
console.log(`${checked} review/validation/authority combinations (${ready} review-ready), six fault pairs, source parity, assigned-card fallback, generated pages, links, and reveal boundary passed.`);
