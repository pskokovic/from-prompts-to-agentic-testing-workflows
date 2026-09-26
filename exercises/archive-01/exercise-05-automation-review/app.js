'use strict';
(() => {
  const M=window.AutomationReview, $=id=>document.getElementById(id), form=$('builder');
  let initial=null, reviewed=null, final=false, revisionMode=false, submissionErrors=false;
  const getState=()=>{
    const data=new FormData(form), s={};
    for(const key of [...M.groups.map(g=>g.id),'request','approval','decision','disposition',...M.requiredText]) s[key]=String(data.get(key)||'').trim();
    s.validation=data.getAll('validation'); return s;
  };
  function showStep(n,focus=true) {
    document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=Number(p.dataset.panel)!==n);
    document.querySelectorAll('.step-nav button').forEach(b=>{if(Number(b.dataset.step)===n)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    if(focus)document.querySelector(`[data-panel="${n}"] h2`).focus();
  }
  function setLocked(locked) { form.querySelectorAll('input,select,textarea').forEach(el=>el.disabled=locked); $('commit').disabled=locked; }
  // FormData omits disabled controls, so retain the committed state when locked.
  const draft=()=>initial && !revisionMode ? M.snapshot(reviewed) : getState();
  function updateDescriptions() {
    $('request-description').textContent=M.requests.find(r=>r.id===$('request').value)?.text||'';
    $('approval-description').textContent=M.approvals.find(r=>r.id===$('approval').value)?.text||'';
  }
  function updateRecord() {
    if(!initial)return;
    const s=draft(), dirty=JSON.stringify(s)!==JSON.stringify(reviewed);
    $('stale').hidden=!dirty;
    $('record').textContent='EXERCISE 5 · AUTOMATION REVIEW\nAuthored simulation; no action executed or validation accepted.\n\nINITIAL REVIEW\n'+M.record(initial)+'\n\nINITIAL FEEDBACK\n'+M.feedbackText(initial)+'\n\nCURRENT '+(dirty?'UNCOMMITTED DRAFT':'COMMITTED REVIEW')+'\n'+M.record(s)+'\n\nLATEST COMMITTED FEEDBACK\n'+M.feedbackText(reviewed)+(final?'\n\nOne revision committed.':'\n\nOne revision is available.')+'\n\nNext: carry evidence needs and authority conditions into Exercise 6. No earlier browser state is required.';
  }
  function renderFeedback(s) {
    const e=M.evaluate(s);
    $('technical-result').textContent=e.disposition;
    $('permission-result').textContent=e.permission;
    $('permission-concern').textContent=e.permissionConcern; $('permission-concern').hidden=!e.permissionConcern;
    $('explanations').replaceChildren();
    for(const item of [...e.corrections.map(c=>({title:c.title+' · '+c.source,text:c.explanation})),...e.selected.map(v=>({title:v.label,text:v.explanation+' Expected: '+v.expected+' ['+v.source+']'}))]) {
      const section=document.createElement('section'); section.className='explanation';
      const heading=document.createElement('h3'),p=document.createElement('p'); heading.textContent=item.title;p.textContent=item.text;section.append(heading,p);$('explanations').append(section);
    }
    $('concerns').replaceChildren();
    for(const message of e.concerns.length?e.concerns:['No modeled correction or validation gaps in these selections. Written rationale, implementation, setup, and actual validation still require expert review.']) {const li=document.createElement('li');li.textContent=message;$('concerns').append(li);}
    $('results').hidden=false; $('record-panel').hidden=false;$('results-title').focus();
  }
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.step))));
  function onEdit() {
    if(submissionErrors){$('status').textContent='';submissionErrors=false;}
    updateDescriptions();updateRecord();
  }
  form.addEventListener('input',onEdit);
  form.addEventListener('change',onEdit);
  form.addEventListener('submit',event=>{
    event.preventDefault(); if(final || (initial&&!revisionMode))return;
    const s=getState(), gaps=M.missing(s);
    if(gaps.length){submissionErrors=true;$('status').textContent='Complete your review: '+gaps.join(' ');$('status').focus();return;}
    submissionErrors=false;
    if(!initial)initial=M.snapshot(s);else final=true;
    reviewed=M.snapshot(s);revisionMode=false;setLocked(true);
    $('status').textContent=final?'Revision committed. Both records are preserved. Reset to start a new attempt.':'Initial review committed. Read the feedback, then revise once.';
    $('revise').hidden=final;$('commit').textContent=final?'Revision committed':'Initial review committed';
    renderFeedback(s);updateRecord();
  });
  $('revise').addEventListener('click',()=>{if(final)return;revisionMode=true;setLocked(false);$('commit').textContent='Commit revision';$('revise').hidden=true;$('status').textContent='Revise your choices or retain them with a clarified rationale. One revision is available.';showStep(0);});
  $('copy').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText($('record').textContent);$('copy-status').textContent='Review record copied.';}
    catch{const range=document.createRange();range.selectNodeContents($('record'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('record').focus();$('copy-status').textContent='Clipboard unavailable. Record selected; press Ctrl+C or copy it manually.';}
  });
  $('reset-attempt').addEventListener('click',()=>{
    initial=null;reviewed=null;final=false;revisionMode=false;submissionErrors=false;setLocked(false);HTMLFormElement.prototype.reset.call(form);
    for(const id of ['results','record-panel'])$(id).hidden=true;
    for(const id of ['status','record','copy-status','explanations','concerns','permission-result','permission-concern','technical-result'])$(id).textContent='';
    $('stale').hidden=true;$('revise').hidden=false;$('commit').textContent='Commit initial review';updateDescriptions();showStep(0);
  });
  $('interactive').hidden=false;showStep(0,false);
})();
