/* Authored teaching content and pure review rules. No model or external service. */
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.AutomationReview = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const sources = [
    {id:'ACs', title:'Current functional baseline', owner:'Product owner · approved v1', text:'REQ-01: A registered user can request a password-reset link using their email address.\nAC-01: For a registered email, send a reset link.\nAC-02: The link expires 30 minutes after issue.\nAC-03: A successfully used link cannot be used again.\nAC-04: After a successful reset, the new password works and the old password does not.', note:'Password composition/length, exact behavior at precisely 30 minutes, session invalidation, and delivery-time guarantees remain unspecified.'},
    {id:'TIM-01', title:'Integration timing contract', owner:'Product and test owners · current v1', text:'For a valid, unused, unexpired token and an accepted password fixture in the isolated integration environment, reset submission must complete successfully and show a success confirmation within 3,000 ms of submission. The confirmation is created only after a successful reset response. A response/confirmation earlier or later than one second can satisfy this contract. A response error or confirmation after 3,000 ms requires investigation; it must not be normalized away by extending the timeout. This contract does not assert whole-service health, production performance, or email delivery time.'},
    {id:'DATA-01', title:'Fixture description', owner:'Test owner · current v1', text:'Each run creates a distinct registered account, old/new accepted-password fixtures, and a fresh unused token. Submission occurs 60 seconds after token issue. No other test uses this account or token. The negative-policy probe uses a separate fresh fixture. Authentication checks use fresh unauthenticated sessions; cleanup follows each run. Fixture acceptance is test setup evidence, not a general password-policy specification.'},
    {id:'CODE-01', title:'Original test snapshot', owner:'Test repository · test-t17 · pseudocode', code:true, text:'01 test reset_completion:\n02   account, token, acceptedNewPassword = isolatedResetFixture()\n03   openResetForm(token)\n04   submitNewPassword(acceptedNewPassword)  // asynchronous request\n05   sleep(1000 milliseconds)\n06   assert existsNow("reset-confirmation")\n07   cleanup(account)\n\n08 test proposed_password_policy:\n09   account, token = separateResetFixture()\n10   submitNewPassword("short-example", token)\n11   assert result == rejected_because_length_below_12\n12   cleanup(account)', note:'existsNow is an immediate snapshot without implicit wait. Diagnostics continue for three seconds after submission even if an assertion fails. The policy probe is a separate test. Cleanup must also run after failures.'}
  ];
  const proposal = 'PROPOSED PATCH · authored AI-response example\n\n01 use the isolated reset fixture from DATA-01\n02 start deadline at reset submission\n03 wait for successful confirmation, or explicit reset error,\n   until submission + 3,000 ms\n04 fail on error or if confirmation misses that deadline\n05 sign in with the new password; assert signedIn == true\n06 in that SAME session, submit the old password;\n   assert signedIn == false\n07 keep the separate test: reject passwords shorter than 12\n08 always clean up fixtures, including after failure';
  const groups = [
    {id:'wait', title:'Synchronization · proposal lines 02–04', source:'TIM-01 / CODE-01', options:[
      {id:'sleep', label:'Replace with a 3,000 ms sleep and immediate confirmation check.', good:false, explanation:'A longer sleep retains the snapshot approach and does not identify explicit errors promptly. TIM-01 defines a deadline from submission, not a reason to delay every check. Retain the bounded observable wait instead.'},
      {id:'retain', label:'Retain the success/error wait and deadline measured from submission.', good:true, explanation:'This matches TIM-01 and handles explicit errors. It removes the one-second snapshot race without extending the contract. Implementation still needs validation for timely, late, missing, and error outcomes; the proposal is not proof of a fix.'},
      {id:'restart', label:'Use a 3,000 ms timeout starting when the wait helper is entered.', good:false, explanation:'If work occurs between submission and entering the helper, this can extend the total allowed completion time beyond TIM-01. Preserve the submission timestamp and remaining deadline instead.'}
    ]},
    {id:'credentials', title:'Credential checks · proposal lines 05–06', source:'AC-04 / DATA-01', options:[
      {id:'fresh', label:'Revise: independently authenticate each credential in a fresh unauthenticated session.', good:true, explanation:'AC-04 requires new-password success and old-password rejection. DATA-01 requires fresh unauthenticated sessions. Check authentication results, not inherited signed-in state. This catches credential faults that a confirmation proxy misses; validate both failure directions.'},
      {id:'retain', label:'Retain the two checks in sequence in the same session.', good:false, explanation:'A signed-in session can carry state across the checks and obscure whether a credential was accepted. Two assertion lines do not establish two independent authentication outcomes. Revise both checks to use fresh unauthenticated sessions (DATA-01).'},
      {id:'newOnly', label:'Keep a fresh-session new-password check; use confirmation as evidence for the old password.', good:false, explanation:'New-password success and confirmation do not establish old-password rejection. AC-04 requires both. Add an independent old-password check; otherwise the old credential could still work while this test passes.'}
    ]},
    {id:'policy', title:'Password policy · proposal line 07', source:'Current ACs / DATA-01', options:[
      {id:'defer', label:'Defer this policy test; record a clarification request and continue supported reset checks.', good:true, explanation:'No supplied requirement defines a length threshold. Keep the policy question visible without treating it as a product failure. Supported reset work can continue; an approved policy and its validation are prerequisites for restoring this test.'},
      {id:'eight', label:'Revise the minimum to eight characters, a common baseline.', good:false, explanation:'Replacing 12 with another familiar threshold still invents an expected result. Neither the current ACs nor DATA-01 defines a length policy. Remove the oracle or defer the policy test for clarification.'},
      {id:'remove', label:'Remove the unsupported assertion from this proposal; track policy coverage as an open question.', good:true, explanation:'Removing an unsupported oracle avoids a false defect claim. This does not prove password-policy compliance or remove the need for a product-owner clarification. Preserve the open coverage question and continue supported reset checks.'}
    ]}
  ];
  const validation = [
    {id:'delay', label:'Successful confirmation at 2,000 ms; valid fixtures and both credential outcomes correct.', expected:'Synchronization passes within the submission deadline; the full test passes only after both credential checks.', source:'TIM-01 / AC-04', good:true, explanation:'Exercises a compliant completion that the original one-second snapshot could miss. An ordinary fast success alone would not expose that difference.'},
    {id:'repeat', label:'Repeat the normal test until one attempt passes.', expected:'Use that pass as the acceptance evidence.', source:'Proposed shortcut', good:false, explanation:'A selected passing retry does not distinguish a repaired synchronization rule from a masked failure. Retain all outcomes and use controlled cases; one eventual pass cannot establish acceptance.'},
    {id:'deadline', label:'Withhold confirmation, then separately schedule it after 3,000 ms.', expected:'Fail at the submission deadline in both cases; retain timing and diagnostic evidence.', source:'TIM-01', good:true, explanation:'Checks that the proposed wait remains bounded and does not normalize late or missing completion. Passing timely examples alone would not test that boundary.'},
    {id:'error', label:'Return an explicit reset error before the deadline.', expected:'Fail with the error recorded; a completed response is not automatically success.', source:'TIM-01', good:true, explanation:'Checks the failure branch of the proposed wait. A generic response-complete signal could otherwise be mistaken for successful reset.'},
    {id:'newFails', label:'Show confirmation, but make new-password authentication fail in a fresh session.', expected:'Fail the new-password assertion.', source:'AC-04 / DATA-01', good:true, explanation:'Tests whether the assertion detects loss of access despite a success message. A confirmation-only oracle would miss this fault.'},
    {id:'screenshot', label:'Capture the confirmation screenshot as the complete credential-validation package.', expected:'Accept AC-04 once the message is visible.', source:'Proposed proxy', good:false, explanation:'A screenshot can supplement diagnostics but cannot establish either authentication outcome. It is insufficient as the complete credential-validation package.'},
    {id:'oldWorks', label:'Show confirmation and accept the new password, but also accept the old password in a separate fresh session.', expected:'Fail the old-password rejection assertion.', source:'AC-04 / DATA-01', good:true, explanation:'Checks that the test detects the credential-protection fault even when confirmation and new-password authentication succeed.'}
  ];
  const requests = [
    {id:'patch', label:'Apply the reviewed patch', text:'Apply this reviewed draft to a test-only branch in the isolated tutorial repository. No merge, CI trigger, or production access.', needs:'patch'},
    {id:'comparison', label:'Run an isolated comparison', text:'Run the reviewed validation cases once in isolated integration with DATA-01 fixtures, retaining all outcomes and diagnostics. No production access or merge.', needs:'comparison'},
    {id:'production', label:'Try the change on production accounts', text:'Apply the patch and reset real customer credentials to check it against production data.', needs:null}
  ];
  const approvals = [
    {id:'none', label:'No approval recorded', text:'The designated reviewer has not approved an action.'},
    {id:'patch', label:'Scoped approval: test-branch patch only', text:'The designated automation reviewer approves applying the reviewed draft to the test-only branch; no run, merge, or production access.'},
    {id:'comparison', label:'Scoped approval: isolated comparison only', text:'The designated automation reviewer approves one isolated comparison of the reviewed cases with DATA-01 fixtures and retained diagnostics; no patch application, merge, or production access.'},
    {id:'broad', label:'General encouragement to proceed', text:'A colleague said “go ahead and fix it” without naming the action, environment, or approving role.'}
  ];
  const dispositions = [
    {id:'review',label:'Ready for expert review; validation still required'},
    {id:'partial',label:'Supported reset proposal ready for review; policy work deferred'},
    {id:'stop',label:'Stop for missing setup evidence or clarification'}
  ];
  const decisions = [{id:'allow',label:'Allow this scoped simulated action'},{id:'block',label:'Block the request'},{id:'defer',label:'Defer pending prerequisites or approval'}];
  const requiredText = ['rationale','evidence','reviewer','conditions','permissionReason'];
  function missing(s) {
    const gaps=[];
    for (const g of groups) if (!g.options.some(o=>o.id===s[g.id])) gaps.push('Choose a correction for '+g.title+'.');
    if (!Array.isArray(s.validation) || !s.validation.length) gaps.push('Choose at least one validation case.');
    for (const [key,items] of Object.entries({request:requests,approval:approvals,decision:decisions,disposition:dispositions})) if (!items.some(x=>x.id===s[key])) gaps.push('Choose '+key+'.');
    for (const key of requiredText) if (!String(s[key]||'').trim()) gaps.push('Complete '+({rationale:'your source-based review rationale',evidence:'evidence to retain',reviewer:'the designated reviewer',conditions:'outstanding conditions / setup gaps',permissionReason:'the action decision rationale'}[key])+'.');
    return gaps;
  }
  function evaluate(s) {
    const corrections=groups.map(g=>({title:g.title,source:g.source,...g.options.find(o=>o.id===s[g.id])}));
    const selected=validation.filter(v=>(s.validation||[]).includes(v.id));
    const omitted=validation.filter(v=>v.good && !(s.validation||[]).includes(v.id));
    const concerns=[];
    for (const c of corrections) if (!c.good) concerns.push(c.title+': revise the selected correction.');
    if (omitted.length) concerns.push('Validation gaps: '+omitted.map(v=>v.label).join(' '));
    for (const v of selected) if (!v.good) concerns.push('Insufficient validation: '+v.label);
    const complete=missing(s).length===0;
    const technicalReady=complete && concerns.length===0;
    const req=requests.find(r=>r.id===s.request);
    const authorized=Boolean(req && req.needs && req.needs===s.approval && String(s.reviewer||'').trim());
    const prohibited=Boolean(req && !req.needs);
    let permission;
    if (prohibited) permission='BLOCKED · Production changes are prohibited by this workshop policy; approval cannot override that boundary.';
    else if (!authorized) permission='BLOCKED · No matching scoped approval. Read and propose remain allowed; this requested action has no execution authority.';
    else if (s.decision==='block') permission='BLOCKED BY REVIEWER · Scoped authority exists, but you declined this request. Explain the unresolved risk.';
    else if (s.decision==='defer' || s.disposition==='stop') permission='DEFERRED · Scoped authority exists; your review holds the action pending the recorded prerequisites.';
    else if (!technicalReady) permission='HELD FOR CORRECTION · Scoped authority exists, but this review has technical gaps. Repair and re-review before allowing this action.';
    else permission='ALLOWED IN SIMULATION · Matching scoped approval and reviewed prerequisites are recorded. Nothing is applied or run; no comparison result is revealed.';
    const permissionConcern = s.decision==='allow' && (!authorized || prohibited) ? 'Your allow decision exceeds the supplied authority. The simulation blocks it.' : s.decision==='allow' && (s.disposition==='stop' || !technicalReady) ? 'Your allow decision conflicts with unresolved review prerequisites. The simulation holds it.' : prohibited && s.decision==='defer' ? 'This production request must be blocked, not deferred for approval under this policy.' : '';
    const disposition=s.disposition==='stop' ? 'Stopped for clarification · unresolved' : technicalReady ? s.disposition==='partial' ? 'Supported reset proposal ready for review · policy work deferred' : 'Proposal ready for expert review · validation still required' : 'Needs correction before review readiness';
    return {complete,technicalReady,corrections,selected,omitted,concerns,authorized,prohibited,permission,permissionConcern,disposition,accepted:false};
  }
  function snapshot(s) { return JSON.parse(JSON.stringify(s)); }
  function record(s) {
    const e=evaluate(s);
    return [
      ...groups.map(g=>g.title+': '+(g.options.find(o=>o.id===s[g.id])?.label||'Unselected')+' ['+g.source+']'),
      'Review rationale: '+(s.rationale||''),'Validation plan (not executed):',
      ...e.selected.map(v=>'- '+v.label+' Expected: '+v.expected+' ['+v.source+']'),
      'Evidence to retain: '+(s.evidence||''),
      'Requested action: '+(requests.find(r=>r.id===s.request)?.text||'Unselected'),
      'Approval: '+(approvals.find(a=>a.id===s.approval)?.text||'Unselected'),
      'Designated reviewer: '+(s.reviewer||''),'Decision: '+(decisions.find(d=>d.id===s.decision)?.label||'Unselected'),
      'Action rationale: '+(s.permissionReason||''),'Requested disposition: '+(dispositions.find(d=>d.id===s.disposition)?.label||'Unselected'),
      'Outstanding conditions: '+(s.conditions||'')
    ].join('\n');
  }
  function feedbackText(s) {
    const e=evaluate(s);
    return [e.disposition,e.permission,e.permissionConcern,...e.corrections.map(c=>c.title+' ['+c.source+']: '+c.explanation),...e.selected.map(v=>v.label+': '+v.explanation),...e.concerns,'Not accepted after validation: no tests were executed. Written reasoning needs human review.'].filter(Boolean).join('\n\n');
  }
  return {sources,proposal,groups,validation,requests,approvals,decisions,dispositions,requiredText,missing,evaluate,snapshot,record,feedbackText};
});
