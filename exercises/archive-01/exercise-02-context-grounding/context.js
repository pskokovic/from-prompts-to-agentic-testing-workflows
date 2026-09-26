/* Authored teaching evidence; no network or model calls. */
const Grounding = (() => {
  const task = 'Derive reviewable functional password-reset test conditions and expected results. Cite supplied source IDs. Do not invent requirements; separate supported expectations from open questions.';
  const sources = [
    { id: 'REQ-01', title: 'Password-reset requirement', meta: 'Product owner · Current functional baseline v1', text: 'A registered user can request a password-reset link using their email address.' },
    { id: 'OLD-01', title: 'Earlier-release expiry note', meta: 'Release archive · Release v0 · Superseded', text: 'Reset links expire after 15 minutes.' },
    { id: 'TIM-01', title: 'Reset-confirmation timing', meta: 'Product and test owners · Current integration contract v1', text: 'For a valid, unused, unexpired token and an accepted password fixture in the isolated integration environment, reset submission must complete successfully and show a success confirmation within 3,000 ms of submission. The confirmation is created only after a successful reset response. A response/confirmation earlier or later than one second can satisfy this contract. A response error or confirmation after 3,000 ms requires investigation; it must not be normalized away by extending the timeout. This contract does not assert whole-service health, production performance, or email delivery time.' },
    { id: 'AC-01–04', title: 'Acceptance criteria', meta: 'Product owner · Current functional baseline v1', text: 'AC-01: For a registered email, send a reset link.\nAC-02: The link expires 30 minutes after issue.\nAC-03: A successfully used link cannot be used again.\nAC-04: After a successful reset, the new password works and the old password does not.' },
    { id: 'CI-01', title: 'Reset-completion run', meta: 'CI runner · Run 204 · Application app-a42 / tests test-t17 · Observation', text: 'run=204 application=app-a42 tests=test-t17 test=reset_completion\nenvironment=isolated-integration fixture=account-204 request=reset-204\nrelative time origin: reset submission (same runner monotonic clock)\nt+0000ms submit reset-204\nt+1000ms fixed delay completes\nt+1002ms existsNow(reset-confirmation) -> false\nt+1003ms assertion failed; diagnostics continue until t+3000ms' },
    { id: 'NOISE-01', title: 'Export column order', meta: 'Issue tracker · Current issue · Export feature', text: 'CSV export should retain the selected column order.' },
    { id: 'SUGGEST-01', title: 'Password-policy proposal', meta: 'AI-generated suggestion · Unreviewed · No approved requirement reference', text: 'Reject passwords shorter than 12 characters.' }
  ];
  const empty = () => ({ decisions: Object.fromEntries(sources.map(s => [s.id, { choice: '', reason: '' }])), history: '', conflict: '', questions: ['', ''], reflection: '' });
  function evaluate(state) {
    const chosen = id => state.decisions[id].choice;
    const strengths = [], concerns = [], next = [], examples = [];
    if (chosen('REQ-01') === 'include') {
      strengths.push('REQ-01 supplies the registered-user request scope.');
      examples.push('Request a reset link for a registered email → send a reset link. [REQ-01' + (chosen('AC-01–04') === 'include' ? ', AC-01]' : '; confirm the detailed oracle against AC-01]'));
    } else concerns.push('REQ-01 is missing from the included package. Retain the requirement so the task has an explicit registered-user scope.');
    if (chosen('AC-01–04') === 'include') {
      strengths.push('AC-01–04 supply the current functional expectations, including 30-minute expiry.');
      examples.push('Use an unused link at 31 minutes → reject it as expired. [AC-02]', 'Reuse a successfully used link → reject reuse. [AC-03]', 'After a successful reset, authenticate in fresh sessions → new password works; old password does not. [AC-04]');
    } else concerns.push('The current ACs are missing. The package cannot establish expiry, reuse, and post-reset authentication expectations.');
    if (chosen('OLD-01') === 'include') {
      if (state.history === 'history') strengths.push('OLD-01 is explicitly retained as superseded history, not an expected result. Check that your expiry explanation preserves current AC-02.');
      else concerns.push('OLD-01 is included without a history-only boundary. Its 15-minute rule must not compete with current AC-02 (30 minutes).');
    } else if (chosen('OLD-01')) strengths.push('The archived rule is outside the active context. Still explain why current AC-02 governs expiry.');
    if (chosen('SUGGEST-01') === 'include') concerns.push('The unreviewed 12-character suggestion adds an unsupported policy. Move it to an open question; it cannot define a test oracle.');
    if (chosen('NOISE-01') === 'include') concerns.push('The export issue adds no evidence for functional password-reset tests. Being current does not make it relevant.');
    if (chosen('CI-01') === 'include') concerns.push('CI-01 records an absent element at one snapshot. It cannot define expected behaviour or establish service instability; defer diagnosis to the evidence exercise.');
    if (chosen('TIM-01') === 'include') next.push('TIM-01 is authoritative only for its integration scope. Explain its purpose here; 3,000 ms is not token expiry or email-delivery time. Deferring synchronization work is also defensible.');
    if (chosen('TIM-01') === 'defer') strengths.push('Deferring TIM-01 keeps this package focused while preserving it for synchronization review.');
    const undecided = sources.filter(s => !chosen(s.id)).length;
    if (undecided) next.push(`${undecided} source decision(s) remain open. Classify every card before finishing.`);
    const reasons = sources.filter(s => ['exclude', 'defer'].includes(chosen(s.id)) && state.decisions[s.id].reason.trim()).length;
    if (reasons < 2) next.push('Record at least two exclusion/defer rationales. Explain authority or relevance, not just your selection.');
    if (!state.conflict.trim()) next.push('Explain which expiry rule governs and what happens to the other version.');
    if (state.questions.some(q => !q.trim())) next.push('Record two unresolved requirements questions without supplying invented answers.');
    next.push('Review your written reasoning with a partner or the worked example. This simulation checks choices and field completion, not the meaning or correctness of free text.');
    return { strengths, concerns, next, examples };
  }
  function packageText(state) {
    const included = sources.filter(s => state.decisions[s.id].choice === 'include');
    return ['TASK (unchanged)', task, '', 'INCLUDED SOURCES', ...included.map(s => `${s.id} — ${s.meta}${s.id === 'OLD-01' ? '\nUse: ' + (state.history === 'history' ? 'superseded history only; not an expected result' : 'not bounded as history') : ''}\n${s.text}\nRationale: ${state.decisions[s.id].reason || '(not recorded)'}`), ...(included.length ? [] : ['(none selected)']), '', 'OTHER SOURCE DECISIONS', ...sources.filter(s => state.decisions[s.id].choice !== 'include').map(s => `${s.id}: ${state.decisions[s.id].choice || 'undecided'} — ${state.decisions[s.id].reason || '(no rationale)'}`), '', 'EXPIRY CONFLICT', state.conflict || '(not recorded)', '', 'OPEN QUESTIONS', ...state.questions.map((q, i) => `${i + 1}. ${q || '(not recorded)'}`), '', 'REVISION REFLECTION', state.reflection || '(not recorded)'].join('\n\n');
  }
  return { task, sources, empty, evaluate, packageText };
})();
if (typeof module !== 'undefined') module.exports = Grounding;
