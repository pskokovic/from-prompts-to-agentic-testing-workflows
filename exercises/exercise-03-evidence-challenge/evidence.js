'use strict';
/* Fictional authored evidence transcribed from scenario v1.0. */
const Evidence = (() => {
  const sources = [
  {
    "id": "CI-01",
    "title": "Initial failure",
    "meta": "CI runner · Run 204 · app-a42 / test-t17",
    "text": "run=204 application=app-a42 tests=test-t17 test=reset_completion\nenvironment=isolated-integration fixture=account-204 request=reset-204\nrelative time origin: reset submission (same runner monotonic clock)\nt+0000ms submit reset-204\nt+1000ms fixed delay completes\nt+1002ms existsNow(reset-confirmation) -> false\nt+1003ms assertion failed; diagnostics continue until t+3000ms"
  },
  {
    "id": "CODE-01",
    "title": "Test snapshot",
    "meta": "Test repository · test-t17 · Framework-independent pseudocode",
    "text": "01 test reset_completion:\n02   account, token, acceptedNewPassword = isolatedResetFixture()\n03   openResetForm(token)\n04   submitNewPassword(acceptedNewPassword)  // asynchronous request\n05   sleep(1000 milliseconds)\n06   assert existsNow(\"reset-confirmation\")\n07   cleanup(account)\n\n08 test proposed_password_policy:\n09   account, token = separateResetFixture()\n10   submitNewPassword(\"short-example\", token)\n11   assert result == rejected_because_length_below_12\n12   cleanup(account)",
    "note": "existsNow is an immediate snapshot with no implicit wait. Diagnostics continue for three seconds after submission even if the assertion fails. The password-policy probe is a separate test, not a later line after the failed assertion."
  },
  {
    "id": "HIST-01",
    "title": "Five supplied runs",
    "meta": "CI result export · Same app/test versions and configured environment",
    "text": "| Run | Response completed | Confirmation created | Snapshot | Test outcome |\n| --- | --- | --- | --- | --- |\n| 201 | 620 ms | 660 ms | 1002 ms | Pass |\n| 202 | 1320 ms | 1360 ms | 1002 ms | Fail |\n| 203 | 810 ms | 850 ms | 1002 ms | Pass |\n| 204 | 1420 ms | 1460 ms | 1002 ms | Fail |\n| 205 | 730 ms | 770 ms | 1002 ms | Pass |",
    "note": "Each run uses an isolated fixture. This report derives timestamps from captured run events; it is not independent corroboration of those events. The sample is not a production reliability estimate."
  }
];
  const requirements = "- REQ-01: A registered user can request a password-reset link using their email address.\n- AC-01: For a registered email, send a reset link.\n- AC-02: The link expires 30 minutes after issue.\n- AC-03: A successfully used link cannot be used again.\n- AC-04: After a successful reset, the new password works and the old password does not.";
  const timing = "For a valid, unused, unexpired token and an accepted password fixture in the isolated integration environment, reset submission must complete successfully and show a success confirmation within 3,000 ms of submission. The confirmation is created only after a successful reset response. A response/confirmation earlier or later than one second can satisfy this contract. A response error or confirmation after 3,000 ms requires investigation; it must not be normalized away by extending the timeout. This contract does not assert whole-service health, production performance, or email delivery time.";
  const claim = 'The password-reset service is unstable';
  const decisions = { investigate: 'Investigate', reject: 'Reject', accept: 'Accept' };
  const categories = { synchronization: 'Test synchronization', product: 'Product / reset behavior', environment: 'Environment / runtime variation', correlation: 'Evidence correlation', unknown: 'Insufficient evidence to categorize' };
  const hypotheses = { synchronization: 'The snapshot precedes a valid confirmation.', product: 'The reset genuinely fails or exceeds its timing contract in some runs.', environment: 'Runtime variation affects completion timing.', correlation: 'Evidence has been matched to the wrong run or request.', policy: 'The separate password-policy probe caused this reset_completion failure.', other: 'Another explanation (describe below)' };
  const observations = {
    snapshot: 'CI-01: confirmation absent at the 1,002 ms snapshot.',
    association: 'HIST-01: supplied runs fail when confirmation is later than the snapshot.',
    sleep: 'CODE-01: fixed 1,000 ms sleep followed by an immediate existence check.',
    independent: 'HIST-01 independently corroborates the same captured CI events.',
    failure: 'CI-01 proves that the password reset failed.'
  };
  const actions = { timing: 'Request TIM-01: accepted integration timing', trace: 'Request TRACE-01: correlated run 204 capture', patch: 'Extend the sleep immediately', rerun: 'Rerun CI without a diagnostic question' };
  const fields = ['decision', 'rejection', 'rationale', 'category', 'hypothesis1', 'hypothesis2', 'other', 'support', 'contradiction', 'weakener', 'action', 'actionReason', 'missing', 'revision'];
  const clone = value => JSON.parse(JSON.stringify(value));
  function empty() { return { ...Object.fromEntries(fields.map(k => [k, ''])), observations: [], priorTiming: false, request: null, initial: null }; }
  function available(s) { return ['REQ-01 / AC-01–04 reference', 'CI-01', 'CODE-01', 'HIST-01', ...(s.request?.action === 'timing' ? ['TIM-01 (requested and revealed)'] : []), ...(s.priorTiming ? ['TIM-01 (participant reports prior reading in Exercise 2; not a new reveal)'] : [])]; }
  function gaps(s) {
    const missing = [];
    for (const [key, label] of Object.entries({ decision:'claim decision', rationale:'decision rationale', category:'provisional category', hypothesis1:'first hypothesis', hypothesis2:'second hypothesis', support:'supporting evidence with source IDs', contradiction:'contradicting evidence or an explicit gap', weakener:'observation that would weaken the preferred explanation', action:'next action', actionReason:'action rationale', missing:'remaining evidence needs' })) {
      if (!s[key]?.trim()) missing.push(label);
    }
    if (!s.observations.length) missing.push('at least one observed statement');
    if (s.decision === 'reject' && !s.rejection) missing.push('meaning of rejection');
    if ([s.hypothesis1, s.hypothesis2].includes('other') && !s.other.trim()) missing.push('alternative hypothesis description');
    if (s.hypothesis1 && s.hypothesis1 === s.hypothesis2) missing.push('two distinct hypotheses');
    return missing;
  }
  function commit(s) {
    if (s.request) return { state: clone(s), error: 'One action is already committed. Reset for a new attempt.' };
    const missing = gaps(s);
    if (missing.length) return { state: clone(s), error: 'Before committing, complete: ' + missing.join('; ') + '.' };
    const state = clone(s);
    state.initial = clone(s);
    state.request = { action: s.action, rationale: s.actionReason, status: s.action === 'timing' ? 'TIM-01 revealed' : s.action === 'trace' ? 'TRACE-01 pending for Exercise 6; no trace revealed' : 'Proposed only; no change or run executed' };
    return { state, error: '' };
  }
  function evaluate(s) {
    const concerns = [], guidance = [];
    if (s.decision === 'accept') concerns.push('The supplied observations do not establish global service instability. Retain it as a hypothesis rather than an accepted cause.');
    if (s.decision === 'reject') {
      if (s.rejection === 'healthy') concerns.push('Rejecting this claim does not establish that the service is healthy.');
      else if (s.rejection === 'certainty') guidance.push('Rejecting unsupported certainty is defensible. Retain service instability as a possible explanation.');
    }
    if (s.decision === 'investigate') guidance.push('Investigation is defensible. Explain the uncertainty and how your request could change the decision.');
    if (s.observations.includes('independent')) concerns.push('HIST-01 derives from the captured events. It is not independent corroboration of those same events.');
    if (s.observations.includes('failure')) concerns.push('CI-01 shows an absent element at one snapshot, not a failed password reset.');
    if ([s.hypothesis1, s.hypothesis2].includes('policy')) concerns.push('The password-policy probe is a separate test. It did not cause the recorded reset_completion assertion failure.');
    if (s.action === 'patch') concerns.push('A longer sleep changes the test before resolving the evidence question; it could hide a timing defect. No patch was applied.');
    if (s.action === 'rerun') concerns.push('A rerun without a diagnostic question may repeat the result without explaining it. No CI call was made.');
    if (s.action === 'trace') guidance.push('A correlated run/request capture can distinguish the snapshot from the later response and confirmation. TRACE-01 remains pending for Exercise 6.');
    if (s.action === 'timing') guidance.push(s.request?.action === 'timing' ? 'TIM-01 is now available. Judge the supplied timing against its narrow integration scope; this does not establish AC-04 authentication outcomes or global health.' : 'TIM-01 can supply the expected timing bound. It has not been revealed in this attempt.');
    if (s.priorTiming) guidance.push('You report prior reading of TIM-01 in Exercise 2. Cite it as prior knowledge, not as a new evidence reveal.');
    guidance.push('A provisional category is not a root-cause finding. Check source IDs and the meaning of your written reasons with a peer or facilitator.');
    guidance.push('An observation that would weaken a hypothesis is a proposed discriminator, not evidence already observed.');
    const missing = gaps(s);
    if (!s.request) missing.push('commit one next action to preserve the initial decision');
    else if (!s.revision.trim()) missing.push('explain what changed or why the decision stayed the same');
    return { concerns, guidance, missing };
  }
  function decisionText(s) {
    return [
      'Available evidence: ' + available(s).join('; '),
      'Claim decision: ' + (decisions[s.decision] || '(not chosen)') + (s.decision === 'reject' ? ' / ' + ({ certainty:'unsupported certainty', healthy:'service is healthy' }[s.rejection] || 'meaning not chosen') : ''),
      'Rationale: ' + s.rationale,
      'Provisional category: ' + (categories[s.category] || '(not chosen)'),
      'Selected observations:\n' + s.observations.map(id => '- ' + observations[id]).join('\n'),
      'Preferred hypothesis: ' + (hypotheses[s.hypothesis1] || '(not chosen)'),
      'Competing hypothesis: ' + (hypotheses[s.hypothesis2] || '(not chosen)'),
      'Other hypothesis: ' + s.other,
      'Supporting observations / source IDs: ' + s.support,
      'Contradicting observations or explicit gap: ' + s.contradiction,
      'Proposed observation that would weaken the preferred explanation (not yet observed): ' + s.weakener,
      'Next action: ' + (actions[s.action] || '(not chosen)'),
      'Action rationale: ' + s.actionReason,
      'Missing evidence: ' + s.missing,
      'Revision / why unchanged: ' + s.revision
    ].join('\n');
  }
  function packageText(s, reviewed) {
    return ['EVIDENCE CHALLENGE — fictional teaching record', 'Claim: ' + claim,
      s.initial ? '\nINITIAL DECISION — before committed action\n' + decisionText(s.initial) : '\nINITIAL DECISION — not yet committed',
      '\nCOMMITTED ACTION\n' + (s.request ? actions[s.request.action] + '\nRationale: ' + s.request.rationale + '\nStatus: ' + s.request.status : 'None'),
      '\nCURRENT DRAFT\n' + decisionText(s),
      '\nLATEST REVIEWED DECISION\n' + (reviewed ? decisionText(reviewed) : 'Not reviewed'),
      s.request?.action === 'timing' ? '\nREVEALED SOURCE — TIM-01\n' + timing : '',
      '\nPrepared feedback checks choices and field presence only. Written reasoning requires human review. No real service was tested.'
    ].filter(Boolean).join('\n');
  }
  return { sources, requirements, timing, claim, decisions, categories, hypotheses, observations, actions, fields, empty, available, gaps, commit, evaluate, packageText, clone };
})();
if (typeof module !== 'undefined') module.exports = Evidence;
