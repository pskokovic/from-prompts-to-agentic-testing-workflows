/* Authored teaching data and pure review rules. No AI or test execution. */
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.AutomationReview = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const notice='Local simulation · No AI service connected · Nothing is sent or saved';
  const sources=[
    {id:'ACs',title:'Current functional baseline',owner:'Product owner · approved v1',text:'REQ-01: A registered user can request a password-reset link using their email address.\nAC-01: For a registered email, send a reset link.\nAC-02 (release v1): The link expires 30 minutes after issue.\nAC-03: A successfully used link cannot be used again.\nAC-04: After a successful reset, the new password works and the old password does not.',note:'Password composition/length, exact behavior at precisely 30 minutes, session invalidation, and delivery-time guarantees remain unspecified.'},
    {id:'TIM-01',title:'Integration timing contract',owner:'Product and test owners · current v1',text:'For a valid, unused, unexpired token and an accepted password fixture in the isolated integration environment, reset submission must complete successfully and show a success confirmation within 3,000 ms of submission. The confirmation is created only after a successful reset response. A response/confirmation earlier or later than one second can satisfy this contract. A response error or confirmation after 3,000 ms requires investigation; it must not be normalized away by extending the timeout. This contract does not assert whole-service health, production performance, or email delivery time.'},
    {id:'DATA-01',title:'Fixture description',owner:'Test owner · current v1',text:'Each run creates a distinct registered account, old/new accepted-password fixtures, and a fresh unused token. Submission occurs 60 seconds after token issue. No other test uses this account or token. The negative-policy probe uses a separate fresh fixture. Authentication checks use fresh unauthenticated sessions; cleanup follows each run. Fixture acceptance is test setup evidence, not a general password-policy specification.'},
    {id:'CODE-01',title:'Original test snapshot',owner:'Test repository · test-t17 · pseudocode',code:true,text:'01 test reset_completion:\n02   account, token, acceptedNewPassword = isolatedResetFixture()\n03   openResetForm(token)\n04   submitNewPassword(acceptedNewPassword)  // asynchronous request\n05   sleep(1000 milliseconds)\n06   assert existsNow("reset-confirmation")\n07   cleanup(account)\n\n08 test proposed_password_policy:\n09   account, token = separateResetFixture()\n10   submitNewPassword("short-example", token)\n11   assert result == rejected_because_length_below_12\n12   cleanup(account)',note:'existsNow is an immediate snapshot without implicit wait. Diagnostics continue for three seconds after submission even if an assertion fails. The policy probe is a separate test. Cleanup must also run after failures.'}
  ];
  const proposal='PROPOSED PATCH · authored AI-response example\n\n01 use the isolated reset fixture from DATA-01\n02 start deadline at reset submission\n03 wait for successful confirmation, or explicit reset error,\n   until submission + 3,000 ms\n04 fail on error or if confirmation misses that deadline\n05 sign in with the new password; assert signedIn == true\n06 in that SAME session, submit the old password;\n   assert signedIn == false\n07 keep the separate test: reject passwords shorter than 12\n08 always clean up fixtures, including after failure';
  const groups=[
    {id:'wait',title:'Synchronization · proposal lines 02–04',source:'TIM-01 / CODE-01',excerpt:'TIM-01: for a valid, unused, unexpired token and accepted fixture, success confirmation is due within 3,000 ms of submission; an explicit error or late confirmation needs investigation. CODE-01 sleeps 1,000 ms, then takes an immediate snapshot.',options:[
      {id:'sleep',label:'Replace it with a 3,000 ms sleep and immediate check.',good:false,explanation:'A longer fixed sleep remains an immediate snapshot and does not handle explicit errors promptly. TIM-01 defines a deadline, not a required wait duration.'},
      {id:'retain',label:'Retain the success/error wait with the deadline measured from submission.',good:true,explanation:'TIM-01 supports an observable bounded wait from submission. It can avoid CODE-01’s one-second snapshot race without extending the contract. The implementation still needs validation.'},
      {id:'restart',label:'Start a fresh 3,000 ms timeout when the wait helper begins.',good:false,explanation:'Starting the clock after submission could extend the allowed completion time beyond TIM-01. Preserve the submission timestamp.'}
    ]},
    {id:'credentials',title:'Credential checks · proposal lines 05–06',source:'AC-04 / DATA-01',excerpt:'AC-04: after a successful reset, the new password works and the old password does not. DATA-01: authentication checks use fresh unauthenticated sessions.',options:[
      {id:'retain',label:'Retain both checks in sequence in the same session.',good:false,explanation:'Two assertion lines in one signed-in session do not establish two independent authentication outcomes. Use fresh unauthenticated sessions.'},
      {id:'fresh',label:'Revise: check each password independently in a fresh unauthenticated session.',good:true,explanation:'AC-04 requires both outcomes; DATA-01 requires fresh unauthenticated sessions. Carried signed-in state can hide whether the old credential still works.'},
      {id:'newOnly',label:'Check only the new password; treat confirmation as evidence for the old one.',good:false,explanation:'A confirmation and new-password success do not prove the old password is rejected. AC-04 requires an independent old-password check.'}
    ]},
    {id:'policy',title:'Password policy · proposal line 07',source:'Current ACs / DATA-01',excerpt:'The approved ACs specify reset behaviour but no password-length threshold. DATA-01: fixture acceptance is setup evidence, not a general password-policy specification.',options:[
      {id:'defer',label:'Defer the policy test and request an approved policy; continue supported reset checks.',good:true,explanation:'No supplied source defines a length threshold. Deferral keeps the policy question visible without making an invented oracle authoritative.'},
      {id:'eight',label:'Change the minimum length from 12 to eight characters.',good:false,explanation:'A familiar threshold is still invented. Neither the current ACs nor DATA-01 approves an eight-character rule.'},
      {id:'remove',label:'Remove the unsupported assertion and track policy coverage as an open question.',good:true,explanation:'Removal avoids a false defect claim while preserving the need for a product-owner clarification.'}
    ]}
  ];
  const success={id:'delay',title:'Delayed valid success',condition:'With valid DATA-01 fixtures, reset succeeds and confirmation appears 2,000 ms after submission. New-password sign-in succeeds and old-password sign-in fails, each in a fresh unauthenticated session.',source:'TIM-01 / AC-04 / DATA-01',outcomes:[
    {id:'pass',label:'Pass after both credential checks; retain submission, confirmation, and authentication observations.',good:true,explanation:'Two seconds is within TIM-01’s submission-based limit. The full test passes only when both AC-04 credential outcomes hold.'},
    {id:'fail1000',label:'Fail because confirmation came after the original one-second snapshot.',good:false,explanation:'The original snapshot is the weakness under review; TIM-01 permits this delayed success.'}
  ]};
  const faults=[
    {id:'late',title:'Missing or late confirmation',condition:'Keep confirmation absent, or create it only after 3,000 ms from submission.',source:'TIM-01',outcomes:[
      {id:'fail',label:'Fail at the submission deadline; retain submission/confirmation times and diagnostics.',good:true,explanation:'This tests the documented bound and keeps a late or missing result visible.'},
      {id:'pass',label:'Extend the wait and pass when confirmation eventually appears.',good:false,explanation:'Extending the bound would normalize a TIM-01 breach.'}
    ]},
    {id:'error',title:'Explicit reset error',condition:'Return an explicit reset error before the deadline; no successful reset occurs.',source:'TIM-01',outcomes:[
      {id:'fail',label:'Fail and retain the error and timing evidence.',good:true,explanation:'A completed error response is not successful reset confirmation.'},
      {id:'pass',label:'Pass because the request completed before 3,000 ms.',good:false,explanation:'TIM-01 requires success, not merely a completed response.'}
    ]},
    {id:'newFails',title:'New password fails',condition:'Show confirmation, but make new-password authentication fail in a fresh session.',source:'AC-04 / DATA-01',outcomes:[
      {id:'fail',label:'Fail the new-password assertion; retain the fresh-session authentication result.',good:true,explanation:'This fault violates AC-04 even though confirmation appeared.'},
      {id:'pass',label:'Pass because a success message appeared.',good:false,explanation:'Confirmation alone cannot establish the new credential works.'}
    ]},
    {id:'oldWorks',title:'Old password still works',condition:'Show confirmation and accept the new password, but also accept the old password in a separate fresh session.',source:'AC-04 / DATA-01',outcomes:[
      {id:'fail',label:'Fail the old-password rejection assertion; retain the fresh-session authentication result.',good:true,explanation:'This detects the credential-protection fault even when the new password works.'},
      {id:'pass',label:'Pass because confirmation and new-password sign-in succeeded.',good:false,explanation:'AC-04 also requires the old password to stop working.'}
    ]}
  ];
  const cards=[
    {id:'A',request:'Apply the reviewed change to a test-only branch. Do not run it, merge it, or access production.',approval:'The designated automation reviewer approved applying this reviewed change to that test-only branch only.',requestType:'patch',approvalType:'patch'},
    {id:'B',request:'Run one isolated comparison using DATA-01 fixtures and retain diagnostics. Do not merge or access production.',approval:'The designated automation reviewer approved applying a reviewed patch to a test-only branch only; no comparison run was approved.',requestType:'comparison',approvalType:'patch'},
    {id:'C',request:'Apply the change to production accounts and try password resets for real customers.',approval:'A colleague said “go ahead and fix it”; no action, environment, scope, or approving role was recorded.',requestType:'prohibited',approvalType:'broad'}
  ];
  const policy='Reading supplied evidence and drafting a proposal are allowed. Applying a test-branch patch or running an isolated comparison requires recorded approval from the designated automation reviewer for that exact action and scope. Neither grants merge or production access. Production changes and changes intended to hide failures are prohibited.';
  const decisions=[{id:'allow',label:'Allow the requested action in this simulation'},{id:'block',label:'Block the request'},{id:'defer',label:'Defer pending a named prerequisite'}];
  const cardFor=id=>cards.find(card=>card.id===id)||cards[0];
  function missing(s){
    const gaps=[];
    for(const group of groups)if(!group.options.some(option=>option.id===s[group.id]))gaps.push('Treat '+group.title+'.');
    if(!String(s.rationale||'').trim())gaps.push('Give a brief source-based explanation.');
    if(!success.outcomes.some(option=>option.id===s.successOutcome))gaps.push('Choose the delayed-success outcome.');
    if(!Array.isArray(s.faultIds)||s.faultIds.length!==2||new Set(s.faultIds).size!==2||s.faultIds.some(id=>!faults.some(fault=>fault.id===id)))gaps.push('Choose exactly two distinct faulty cases.');
    for(const id of s.faultIds||[]){const fault=faults.find(item=>item.id===id);if(fault&&!fault.outcomes.some(option=>option.id===s.faultOutcomes?.[id]))gaps.push('Choose an expected outcome for '+fault.title+'.');}
    if(!decisions.some(decision=>decision.id===s.decision))gaps.push('Decide whether to allow, block, or defer the assigned request.');
    if(!String(s.permissionReason||'').trim())gaps.push('Explain the action decision briefly.');
    return gaps;
  }
  function evaluate(s){
    const card=cardFor(s.cardId),complete=missing(s).length===0;
    const corrections=groups.map(group=>({group,choice:group.options.find(option=>option.id===s[group.id])}));
    const successChoice=success.outcomes.find(option=>option.id===s.successOutcome);
    const selectedFaults=(s.faultIds||[]).filter((id,index,ids)=>ids.indexOf(id)===index).map(id=>{const fault=faults.find(item=>item.id===id);return fault&&{fault,choice:fault.outcomes.find(option=>option.id===s.faultOutcomes?.[id])};}).filter(Boolean);
    const outstanding=faults.filter(fault=>!selectedFaults.some(item=>item.fault.id===fault.id));
    const concerns=[];
    for(const item of corrections)if(item.choice&&!item.choice.good)concerns.push(item.group.title+': '+item.choice.explanation);
    if(successChoice&&!successChoice.good)concerns.push('Delayed success: '+successChoice.explanation);
    for(const item of selectedFaults)if(item.choice&&!item.choice.good)concerns.push(item.fault.title+': '+item.choice.explanation);
    const reviewReady=complete&&concerns.length===0;
    const authorized=card.requestType!=='prohibited'&&card.requestType===card.approvalType,prohibited=card.requestType==='prohibited';
    let permission;
    if(prohibited)permission='BLOCKED · Production action is prohibited under the workshop policy.';
    else if(!authorized)permission=s.decision==='defer'?'DEFERRED · Matching scoped approval is needed before this action.':'BLOCKED NOW · The supplied approval is for a different action.';
    else if(s.decision==='block')permission='BLOCKED BY REVIEWER · Matching authority exists, but the learner declined the request.';
    else if(s.decision==='defer')permission='DEFERRED BY REVIEWER · Matching authority exists, but prerequisites remain.';
    else if(!reviewReady)permission='HELD FOR CORRECTION · Matching authority exists, but the review still has technical concerns.';
    else permission='ALLOWED IN SIMULATION · The named action has matching scope and a review-ready proposal. Nothing is applied or run.';
    const permissionConcern=prohibited&&s.decision!=='block'?'A production request requires a block; approval or delay cannot make it permitted.':!authorized&&s.decision==='allow'?'An allow decision exceeds the supplied approval.':authorized&&s.decision==='allow'&&!reviewReady?'Matching approval does not compensate for unresolved technical concerns.':'';
    return {complete,card,corrections,successChoice,selectedFaults,outstanding,concerns,reviewReady,authorized,prohibited,permission,permissionConcern,accepted:false};
  }
  const snapshot=s=>JSON.parse(JSON.stringify(s));
  function record(s){
    const e=evaluate(s),lines=['EXERCISE 5 · AUTOMATION REVIEW',notice,'','Proposal review:'];
    for(const item of e.corrections)lines.push('- '+item.group.title+': '+(item.choice?.label||'Unselected')+' ['+item.group.source+']');
    lines.push('Source-based explanation: '+(s.rationale||''),'','Validation plan · not executed:','- '+success.title+': '+(e.successChoice?.label||'Unselected')+' ['+success.source+']');
    for(const item of e.selectedFaults)lines.push('- '+item.fault.title+': '+(item.choice?.label||'Unselected')+' ['+item.fault.source+']');
    lines.push('Outstanding checks for later acceptance: '+(e.outstanding.map(item=>item.title).join('; ')||'none of the supplied fault cards')+'; actual results, fixture/session evidence, diagnostics, and policy clarification remain.');
    lines.push('','Assigned authority card: '+e.card.id,'Requested action: '+e.card.request,'Approval record: '+e.card.approval,'Decision: '+(decisions.find(item=>item.id===s.decision)?.label||'Unselected'),'Reason: '+(s.permissionReason||''),'Technical status: '+(e.reviewReady?'Proposal ready for expert review; validation still required':'Needs correction or completion before expert review'),'Authority status: '+e.permission,'Accepted after validation: No; no checks executed.');
    return lines.join('\n');
  }
  function feedbackText(s){
    const e=evaluate(s),parts=[e.reviewReady?'Proposal ready for expert review; validation still required.':'Needs correction or completion before expert review.',e.permission,e.permissionConcern];
    for(const item of e.corrections)if(item.choice)parts.push(item.group.title+' ['+item.group.source+']: '+item.choice.explanation);
    if(e.successChoice)parts.push(success.title+': '+e.successChoice.explanation);
    for(const item of e.selectedFaults)if(item.choice)parts.push(item.fault.title+': '+item.choice.explanation);
    parts.push('Remaining fault checks: '+(e.outstanding.map(item=>item.title).join('; ')||'none from this card set')+'. Actual execution, retained diagnostics, and human review remain outstanding.');
    parts.push('No patch or comparison ran. Written reasoning needs human review. This activity cannot establish acceptance or diagnose run 204.');
    return parts.filter(Boolean).join('\n\n');
  }
  return {notice,sources,proposal,groups,success,faults,cards,policy,decisions,cardFor,missing,evaluate,snapshot,record,feedbackText};
});
