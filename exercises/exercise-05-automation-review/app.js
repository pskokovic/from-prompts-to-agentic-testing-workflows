'use strict';
(() => {
  const M=window.AutomationReview,$=id=>document.getElementById(id),form=$('builder');
  const requestedCard=(new URLSearchParams(location.search).get('case')||'A').toUpperCase();
  const card=M.cardFor(requestedCard);
  let initial=null,reviewed=null,final=false,revisionMode=false,submissionErrors=false;
  $('card-id').textContent=card.id;
  $('request-text').textContent=card.request;
  $('approval-text').textContent=card.approval;
  $('worksheet-link').href='worksheet-'+card.id+'.html';

  function state(){
    const data=new FormData(form),s={cardId:card.id,faultIds:data.getAll('faultIds'),faultOutcomes:{}};
    for(const group of M.groups)s[group.id]=String(data.get(group.id)||'');
    for(const id of s.faultIds)s.faultOutcomes[id]=String(data.get('faultOutcome_'+id)||'');
    for(const key of ['rationale','successOutcome','decision','permissionReason'])s[key]=String(data.get(key)||'').trim();
    return s;
  }
  function showStep(index,focus=true){
    document.querySelectorAll('[data-panel]').forEach(panel=>panel.hidden=Number(panel.dataset.panel)!==index);
    document.querySelectorAll('.step-nav button').forEach(button=>{
      if(Number(button.dataset.step)===index)button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
    if(focus)document.querySelector(`[data-panel="${index}"] h2`).focus();
  }
  function setLocked(locked){
    form.querySelectorAll('input,textarea').forEach(control=>control.disabled=locked);
    $('commit').disabled=locked;
    if(!locked)syncFaultControls();
  }
  function syncFaultControls(){
    const selected=[...form.querySelectorAll('[name="faultIds"]:checked')].map(input=>input.value);
    for(const fault of M.faults){
      const cardElement=form.querySelector(`[data-fault="${fault.id}"]`);
      const selector=cardElement.querySelector('[name="faultIds"]');
      const choices=cardElement.querySelector('.fault-outcomes');
      const active=selected.includes(fault.id);
      cardElement.classList.toggle('selected',active);
      choices.hidden=!active;
      choices.disabled=!active || (initial&&!revisionMode) || final;
      if(!active)choices.querySelectorAll('input').forEach(input=>{input.checked=false;});
      selector.disabled=(initial&&!revisionMode)||final||(!active&&selected.length>=2);
    }
    $('fault-help').textContent=`${selected.length} of 2 selected. ${selected.length===2?'Choose an expected outcome for each, or uncheck one to try another.':'Choose two different faults.'}`;
  }
  const currentDraft=()=>initial&&!revisionMode?M.snapshot(reviewed):state();
  function updateRecord(){
    if(!initial)return;
    const current=currentDraft(),dirty=JSON.stringify(current)!==JSON.stringify(reviewed);
    $('stale').hidden=!dirty;
    $('record').textContent='INITIAL REVIEW\n'+M.record(initial)+'\n\nINITIAL FEEDBACK\n'+M.feedbackText(initial)+'\n\nCURRENT '+(dirty?'UNCOMMITTED DRAFT':'COMMITTED REVIEW')+'\n'+M.record(current)+'\n\nLATEST COMMITTED FEEDBACK\n'+M.feedbackText(reviewed)+(final?'\n\nOne revision committed.':'\n\nOne revision remains available.');
  }
  function renderFeedback(s){
    const result=M.evaluate(s);
    $('technical-result').textContent=result.reviewReady?'Proposal ready for expert review · validation still required':'Needs correction before expert review';
    $('permission-result').textContent=result.permission;
    $('permission-concern').textContent=result.permissionConcern;
    $('permission-concern').hidden=!result.permissionConcern;
    $('explanations').replaceChildren();
    const explanations=[...result.corrections.map(item=>({title:item.group.title+' · '+item.group.source,text:item.choice.explanation})),{title:M.success.title,text:result.successChoice.explanation},...result.selectedFaults.map(item=>({title:item.fault.title+' · '+item.fault.source,text:item.choice.explanation}))];
    for(const item of explanations){
      const section=document.createElement('section'),heading=document.createElement('h3'),paragraph=document.createElement('p');
      section.className='explanation';heading.textContent=item.title;paragraph.textContent=item.text;section.append(heading,paragraph);$('explanations').append(section);
    }
    $('outstanding').replaceChildren();
    for(const fault of result.outstanding){const li=document.createElement('li');li.textContent=fault.title+' ['+fault.source+']';$('outstanding').append(li);}
    for(const message of ['Actual execution results and retained diagnostics','Fixture and fresh-session setup evidence','Approved policy clarification before any length oracle']){const li=document.createElement('li');li.textContent=message;$('outstanding').append(li);}
    $('results').hidden=false;$('record-panel').hidden=false;$('results-title').focus();
  }
  function firstIncompleteStep(s){
    if(M.groups.some(group=>!s[group.id])||!s.rationale)return 0;
    if(!s.successOutcome||s.faultIds.length!==2||s.faultIds.some(id=>!s.faultOutcomes[id]))return 1;
    return 2;
  }
  document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>showStep(Number(button.dataset.step))));
  form.addEventListener('change',event=>{
    if(event.target.name==='faultIds')syncFaultControls();
    if(submissionErrors){$('status').textContent='';submissionErrors=false;}
    updateRecord();
  });
  form.addEventListener('input',()=>{if(submissionErrors){$('status').textContent='';submissionErrors=false;}updateRecord();});
  form.addEventListener('submit',event=>{
    event.preventDefault();if(final||(initial&&!revisionMode))return;
    const s=state(),gaps=M.missing(s);
    if(gaps.length){submissionErrors=true;showStep(firstIncompleteStep(s));$('status').textContent='Complete your review: '+gaps.join(' ');$('status').focus();return;}
    submissionErrors=false;
    if(!initial)initial=M.snapshot(s);else final=true;
    reviewed=M.snapshot(s);revisionMode=false;setLocked(true);
    $('status').textContent=final?'Revision committed. Both records are preserved. Reset for a new attempt.':'Initial review committed. Read feedback, then revise once.';
    $('revise').hidden=final;$('commit').textContent=final?'Revision committed':'Initial review committed';
    renderFeedback(s);updateRecord();
  });
  $('revise').addEventListener('click',()=>{
    if(final)return;
    revisionMode=true;setLocked(false);$('commit').textContent='Commit revision';$('revise').hidden=true;
    $('status').textContent='Revise a treatment, validation outcome, or authority decision. Your initial review remains preserved.';
    showStep(0);
  });
  $('copy').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText($('record').textContent);$('copy-status').textContent='Review record copied.';}
    catch{const range=document.createRange();range.selectNodeContents($('record'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('record').focus();$('copy-status').textContent='Clipboard unavailable. Record selected; press Ctrl+C or copy manually.';}
  });
  $('reset-attempt').addEventListener('click',()=>{
    initial=null;reviewed=null;final=false;revisionMode=false;submissionErrors=false;setLocked(false);
    HTMLFormElement.prototype.reset.call(form);syncFaultControls();
    $('results').hidden=true;$('record-panel').hidden=true;$('stale').hidden=true;$('revise').hidden=false;$('commit').textContent='Commit initial review';
    for(const id of ['status','record','copy-status','technical-result','permission-result','permission-concern'])$(id).textContent='';
    $('permission-concern').hidden=true;$('explanations').replaceChildren();$('outstanding').replaceChildren();showStep(0);
  });
  syncFaultControls();$('interactive').hidden=false;showStep(0,false);
})();
