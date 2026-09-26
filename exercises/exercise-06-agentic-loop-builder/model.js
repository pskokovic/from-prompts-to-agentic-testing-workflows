(function(r,f){const m=f();if(typeof module==='object'&&module.exports)module.exports=m;else r.LoopBuilder=m;})(globalThis,function(){
'use strict';
const blocks=[
 {id:'brief',name:'Define goal and instructions',tag:'Goal / instructions',text:'Triage runs 204, 208 and 209 within a shared budget. Report provisional groups, per-run evidence, uncertainty and next owners.',needs:[],gives:'goal'},
 {id:'sources',name:'Select context and sources',tag:'Context',text:'Use BATCH-01, CI-01, CODE-01, TIM-01, DATA-01, approval rules and current requirements. Distinguish observed behavior from the requirements that define expected behavior.',needs:[],gives:'context'},
 {id:'memory',name:'Initialize workflow state',tag:'State',text:'Track each run separately: observations, hypotheses, evidence IDs, status and next owner. Retain the queue, approvals and shared attempt count.',needs:[],gives:'state'},
 {id:'assess',name:'Assess observations',tag:'Reasoning',text:'Compare each failure with its requirement. Reassess risk, uncertainty and provisional groups without transferring evidence between runs.',needs:['goal','context','state'],gives:'assessment'},
 {id:'choose',name:'Choose the next action',tag:'Action selection',text:'Select the next run and useful evidence request. Prioritize risk or queue coverage; revisit run 204 for comparison only after all captures have been considered.',needs:['assessment'],gives:'proposal'},
 {id:'guard',name:'Check permissions and limits',tag:'Control',text:'Check the proposed action before tool execution. Read access is permitted; an isolated comparison requires approval for that action and scope.',needs:['proposal'],gives:'permission'},
 {id:'act',name:'Execute tool call',tag:'Tool use',text:'Retrieve the selected run capture or simulate an approved run-204 comparison. Each tool execution attempt counts toward the configured limit.',needs:['permission'],gives:'observation'},
 {id:'validate',name:'Validate tool output',tag:'Observation',text:'Check source, run/request identity, timing basis, scope, errors, and missing results before use.',needs:['observation'],gives:'checked'},
 {id:'update',name:'Update workflow state',tag:'State',text:'Admit checked observations, retain contradictions and gaps, and update hypotheses and action history.',needs:['checked','state'],gives:'updated'},
 {id:'decide',name:'Check stopping conditions',tag:'Stopping condition',text:'Check completion conditions and execution limits. Continue with updated state, or stop and report results or unresolved questions for human review.',needs:['updated'],gives:'ending'},
 {id:'handoff',name:'Request human review',tag:'Output',text:'Report each run, provisional group, checked evidence, uncertainty and next owner. Include escalated and uninvestigated cases.',needs:['ending'],gives:'report'},
 {id:'versions',name:'Add version context',tag:'Optional',text:'Annotate retained evidence with CHANGE-01 if available. Unchanged versions cannot establish cause.',needs:['updated'],gives:'versionNote',optional:true},
 {id:'trust',name:'Use every successful response',tag:'Evidence',text:'Treat a successful tool response as sufficient evidence, without checking run identity.',needs:['observation'],bad:'A tool can successfully return run 207 for a run 204 question. Transport success does not establish relevance. Validate identity and scope before updating state.'},
 {id:'retry',name:'Repeat until the test is green',tag:'Recovery',text:'Keep retrying the same action until a passing result appears.',needs:['observation'],bad:'An unchanged retry adds no evidence and can conceal a weak assertion. A loop needs an information goal, an enforced budget, and a no-progress ending.'},
 {id:'release',name:'Apply the fix to production',tag:'Delivery',text:'Apply the proposed change as soon as the investigation appears convincing.',needs:['ending'],bad:'A recommendation is not release permission. This workshop prohibits production writes; a prepared comparison cannot validate a real patch.'}
];
const byId=Object.fromEntries(blocks.map(b=>[b.id,b]));
const scenarios=[['normal','All captures available','TRACE-01'],['missing','Run 204 capture unavailable','GAP-01'],['mismatch','Wrong capture for run 204','CONFLICT-01'],['denied','Run 204 comparison not approved','TRACE-01']];
const defaults={limit:'4',policy:'',evidence:'',threshold:'',loopTo:'',invalid:'',authority:''};
function shuffle(ids,rng=Math.random){const a=[...ids];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function structure(ids){const have=new Set(),seen=new Set(),events=[];for(const id of ids){const b=byId[id];if(!b||seen.has(id))return {ok:false,id,reason:'Unknown or duplicate block. Each block can appear once.',events};seen.add(id);if(b.bad)return {ok:false,id,reason:b.bad,events};const missing=b.needs.filter(n=>!have.has(n));if(missing.length){const names=missing.map(n=>blocks.find(x=>x.gives===n)?.name||n);return {ok:false,id,reason:`“${b.name}” has no reviewed input from ${names.join(' and ')}. Its downstream decision would be based on missing or unchecked information. Move the step that supplies the required input before this block.`,events};}have.add(b.gives);events.push({id,kind:'pass',text:`${b.name}: required inputs are available.`});}const missing=blocks.filter(b=>!b.bad&&!b.optional&&!seen.has(b.id));if(missing.length)return {ok:false,id:null,reason:'The workflow is incomplete: '+missing.map(b=>b.name).join(', ')+'. A missing control or human-review step cannot be inferred.',events};if(ids.at(-1)!=='handoff')return {ok:false,id:ids.at(-1),reason:'The human-review step must be the final output. Place optional context before checking stopping conditions and requesting review.',events};if(ids.includes('versions')&&ids.indexOf('versions')>ids.indexOf('decide'))return {ok:false,id:'versions',reason:'Context added after the ending decision cannot inform that decision. Place it after state update and before the decision.',events};return {ok:true,events};}
function run(ids,c,scenario='normal'){
 const shape=structure(ids),events=[...shape.events];let count=0,evidence=[],outcome='';
 const runs=[204,208,209].map(run=>({run,status:'Not investigated',group:'Unresolved',evidence:[],uncertainty:'Diagnostic capture not yet checked.',nextOwner:'Triage owner: obtain the matching capture.'}));
 const fail=(id,reason)=>({ok:false,outcome:'Workflow validation failed',id,reason,count,evidence,runs,events:[...events,{id,kind:'fail',text:reason}]});
 if(!shape.ok)return fail(shape.id,shape.reason);
 const required={policy:['adaptive','coverage','fixed','green'],evidence:['identity','trust'],threshold:['bounded','comparison','green'],invalid:['escalate','request','accept'],authority:['scoped','assume']};
 for(const [key,values]of Object.entries(required))if(!values.includes(c[key]))return fail({policy:'choose',evidence:'validate',threshold:'decide',invalid:'decide',authority:'guard'}[key],'A decision is unspecified. Configure '+key+' so another person can follow this branch without guessing.');
 if(!Number.isInteger(Number(c.limit))||Number(c.limit)<1||Number(c.limit)>5)return fail('guard','Set an explicit budget of 1–5 tool execution attempts. The simulator also enforces five independently.');
 if(!ids.includes(c.loopTo))return fail('decide','Connect the continue branch to a block on your canvas. A list without a return path does not define a loop.');
 if(c.loopTo!=='assess')return fail('decide',`In this exercise, the continue branch returns to “${byId[c.loopTo].name}”. New observations must be reassessed before choosing another action. Return to the assessment stage in this teaching model; real systems may combine assessment and action selection. Preserve state and make a new decision before another tool call.`);
 if(!['adaptive','coverage'].includes(c.policy))return fail('choose',c.policy==='fixed'?'The fixed sequence ignores whether evidence is missing, mismatched, or already sufficient. This task requires observations to change the next action. Write an observation-dependent policy.':'Choosing another action only to get green invites confirmation bias. Ask what information is missing and what observation could disprove the hypothesis.');
 if(c.authority==='assume')return fail('guard','Technical confidence cannot grant execution permission. A matching task-specific approval must precede an isolated comparison. The harness blocked execution because permission was not granted; no tool executed.');
 const sc=scenarios.find(s=>s[0]===scenario);if(!sc)return fail('brief','Choose a supplied evidence scenario.');
 const event=(id,text,kind='pass')=>events.push({id,text,kind});
 const finish=(ending,reason)=>{event('handoff',reason,'stop');return {ok:true,outcome:ending,id:null,reason,count,evidence,runs,events};};
 const limit=Number(c.limit),queue=c.policy==='adaptive'?[208,209,204]:[204,208,209];
 const budgetStop=()=>finish('Limit reached','Shared tool execution limit reached. Preserve every run status, including uninvestigated cases. The triage owner must prioritize the remaining work; a safe stop does not mean triage is complete.');
 const execute=(run,card)=>{count++;event('act','Attempt '+count+': run='+run+' request=reset-'+run+' returns '+card+'.');};
 const prepare=(run,action)=>{event('assess','Reassess the queue and retained per-run state. Run '+run+' needs '+action+'.');event('choose','Select run '+run+': '+action+'.');event('guard','Read access permitted; '+(limit-count)+' shared execution attempt(s) remain.');};
 if(c.threshold==='green')return fail('decide','A passing result for one run cannot close a batch. Require per-run evidence and unresolved cases to remain visible; a passing comparison does not establish root cause.');
 for(const run of queue){
  if(count>=limit)return budgetStop();
  const row=runs.find(r=>r.run===run);prepare(run,'a matching diagnostic capture');
  const card=run===204?sc[2]:'TRACE-'+run;execute(run,card);
  if(c.evidence==='trust')return fail('validate','Retrieval success does not establish run identity. Your validation rule could assign CONFLICT-01 to run 204 and contaminate the batch groups. Check each result before updating that run.');
  if(run===204&&['missing','mismatch'].includes(scenario)){
   row.status='Escalated';row.uncertainty='Matching run-204 capture unavailable; no diagnosis established.';row.nextOwner='Test owner: obtain a matching capture.';
   event('validate',card+' cannot support a run-204 conclusion.');event('update','Retain the run-204 gap separately; other runs remain in the queue.');
   if(c.invalid==='accept')return fail('decide','Validation rejected the run-204 result. Accepting it would turn an evidence gap into a false group assignment. Preserve the gap and investigate other runs.');
   if(c.invalid==='request'){
    if(count>=limit)return budgetStop();prepare(run,'one targeted request for the missing capture');execute(run,'REQUEST-01');event('validate','REQUEST-01 is only a receipt, not a capture.');event('update','Run 204 remains escalated; do not repeat the request indefinitely.');
   }
  }else{
   evidence.push(card);row.evidence.push(card);row.status='Triaged';
   if(run===204){row.group='Likely test synchronization issue';row.uncertainty='Timing race supported; credential behavior and underlying latency cause unverified.';row.nextOwner='Automation reviewer: implement and validate bounded synchronization and AC-04 assertions.';}
   if(run===208){row.group='Observed AC-04 violation';row.uncertainty='Old password accepted in a fresh session; root cause and production exposure unknown.';row.nextOwner='Product/security owner: investigate credential invalidation promptly.';}
   if(run===209){row.group='Observed TIM-01 breach';row.uncertainty='Confirmation at 3,200 ms exceeds 3,000 ms; latency cause and credential behavior unknown.';row.nextOwner='Service owner: investigate slow completion; retain the 3,000 ms requirement.';}
   event('validate',card+' matches run '+run+', its request, isolated fixture and observation basis.');event('update','Run '+run+': '+row.group+'. '+row.uncertainty);
  }
  event('decide','Keep per-run conclusions separate. Continue to assessment while another capture needs review.');
 }
 const timing=runs.find(r=>r.run===204);
 if(ids.includes('versions'))event('versions','CHANGE-01 has not been retrieved on this route and covers only runs 201–205. Keep additional version context unresolved; do not apply it to the entire batch.');
 if(c.threshold==='comparison'&&timing.status==='Triaged'){
  if(count>=limit)return budgetStop();
  event('assess','All three captures considered. Run 204 can benefit from a discriminating comparison; 208 and 209 need owner investigations.');event('choose','Propose only the isolated run-204 comparison.');
  if(scenario==='denied'){timing.status='Escalated';timing.nextOwner='Test owner: grant scoped permission for the comparison or review the provisional finding.';event('guard','No run-204 comparison approval. Blocked before execution; no attempt counted.','stop');}
  else{event('guard','BATCH-APPROVAL permits this isolated run-204 comparison only; budget remains.');execute(204,'VALID-01');event('validate','VALID-01 is an authored discriminating comparison, not an actual patch validation.');evidence.push('VALID-01');timing.evidence.push('VALID-01');event('update','Retain comparison evidence only for run 204. Do not close runs 208/209 on its result.');}
 }
 const escalated=runs.some(r=>r.status==='Escalated');
 return finish(escalated?'Escalated':'Recommendation ready',escalated?'Batch report ready with explicit escalation. Other investigated runs retain their own findings and owners. Missing evidence or approval is not silently treated as completion.':'All three runs have evidence-based provisional classifications and next owners. These distinct observations do not establish three distinct root causes. Real fixes, production impact and implementation validation remain unverified.');
}
return {blocks,byId,scenarios,defaults,shuffle,structure,run};
});
