/* Fictional teaching evidence. No network, AI, or persistence. */
const Grounding = (() => {
  const task = 'Derive reviewable functional password-reset test conditions and expected results. Cite supplied source IDs. Do not invent requirements; separate supported expectations from open questions.';
  const sources = [
    { id: 'REQ-01', title: 'Password-reset requirement', purpose: 'Defines the password-reset request scope.', owner: 'Product owner', status: 'Current functional requirement', text: 'A registered user can request a password-reset link using their email address.' },
    { id: 'AC-01–04', label: 'AC-01–04 · Release v1', title: 'Acceptance criteria', purpose: 'Defines functional expected results for release v1, including AC-02.', owner: 'Product owner', status: 'Current acceptance criteria · Release v1', text: 'AC-01: For a registered email, send a reset link.\nAC-02: The link expires 30 minutes after issue.\nAC-03: A successfully used link cannot be used again.\nAC-04: After a successful reset, the new password works and the old password does not.' },
    { id: 'OLD-01', label: 'AC-02 · Release v0', title: 'Reset-link expiry', purpose: 'Defines the expiry rule for release v0 of the same criterion.', owner: 'Product owner / release archive', status: 'Superseded release v0', text: 'Reset links expire after 15 minutes.' },
    { id: 'TIM-01', title: 'Reset-confirmation timing', purpose: 'Defines reset-completion timing in the integration environment.', owner: 'Product and test owners', status: 'Current integration contract v1', text: 'For a valid, unused, unexpired token and an accepted password fixture in the isolated integration environment, reset submission must complete successfully and show a success confirmation within 3,000 ms of submission. The confirmation is created only after a successful reset response. A response/confirmation earlier or later than one second can satisfy this contract. A response error or confirmation after 3,000 ms requires investigation; it must not be normalized away by extending the timeout. This contract does not assert whole-service health, production performance, or email delivery time.' },
    { id: 'CI-01', title: 'Reset-completion run', purpose: 'Records one failed test run.', owner: 'CI runner', status: 'Run 204 observation; not a requirement', text: 'run=204 application=app-a42 tests=test-t17 test=reset_completion\nenvironment=isolated-integration fixture=account-204 request=reset-204\nrelative time origin: reset submission (same runner monotonic clock)\nt+0000ms submit reset-204\nt+1000ms fixed delay completes\nt+1002ms existsNow(reset-confirmation) -> false\nt+1003ms assertion failed; diagnostics continue until t+3000ms' },
    { id: 'NOISE-01', title: 'Export column order', purpose: 'Describes a CSV export issue.', owner: 'Issue tracker', status: 'Current; unrelated export feature', text: 'CSV export should retain the selected column order.' },
    { id: 'SUGGEST-01', title: 'Password-policy proposal', purpose: 'Proposes a minimum password length.', owner: 'AI-generated suggestion', status: 'Unreviewed; no approved requirement', text: 'Reject passwords shorter than 12 characters.' }
  ];
  const questionOptions = [
    { id: 'unregistered', text: 'What happens when an email is not registered?', open: true },
    { id: 'boundary', text: 'What happens at exactly 30 minutes after link issue?', open: true },
    { id: 'policy', text: 'What password composition or length rules apply?', open: true },
    { id: 'rate', text: 'Are reset requests rate-limited?', open: true },
    { id: 'duration', text: 'Does the link expire after 15 or 30 minutes?', open: false, answer: 'AC-02 (release v1) resolves this at 30 minutes; the release v0 version is superseded.' },
    { id: 'reuse', text: 'Can a successfully used link be used again?', open: false, answer: 'Current AC-03 says a successfully used link cannot be reused.' }
  ];
  const sourceLabel = id => { const source = sources.find(s => s.id === id); return source?.label || id; };
  const empty = () => ({ decisions: Object.fromEntries(sources.map(s => [s.id, ''])), reasons: [{ source: '', text: '' }, { source: '', text: '' }], history: false, conflict: '', questions: [{ key: '', custom: '' }, { key: '', custom: '' }], reflection: '' });
  const questionText = q => q.key === 'custom' ? q.custom.trim() : questionOptions.find(o => o.id === q.key)?.text || '';
  function validate(state) {
    const missing = sources.filter(s => !state.decisions[s.id]).map(s => s.id);
    const eligible = new Set(sources.filter(s => ['exclude', 'defer'].includes(state.decisions[s.id])).map(s => s.id));
    const reasonErrors = state.reasons.map((r, i) => !eligible.has(r.source) || !r.text.trim() ? i + 1 : null).filter(Boolean);
    const reasonDuplicate = !!state.reasons[0].source && state.reasons[0].source === state.reasons[1].source;
    const questionErrors = state.questions.map((q, i) => !q.key || (q.key === 'custom' && !q.custom.trim()) ? i + 1 : null).filter(Boolean);
    const questionDuplicate = !!state.questions[0].key && state.questions[0].key === state.questions[1].key;
    return { missing, reasonErrors, reasonDuplicate, conflictMissing: !state.conflict.trim(), questionErrors, questionDuplicate, complete: !missing.length && !reasonErrors.length && !reasonDuplicate && !!state.conflict.trim() && !questionErrors.length && !questionDuplicate };
  }
  function evaluate(state) {
    const chosen = id => state.decisions[id];
    const strengths = [], concerns = [], next = [];
    if (chosen('REQ-01') === 'include') strengths.push('REQ-01 supplies the registered-user request scope.');
    else concerns.push('Without REQ-01, the package lacks the registered-user request scope.');
    if (chosen('AC-01–04') === 'include') strengths.push('AC-01–04 (release v1) supply the current functional expected results, including AC-02’s 30-minute expiry.');
    else concerns.push('Without AC-01–04, the package cannot ground expiry, reuse, or post-reset authentication expectations.');
    if (chosen('OLD-01') === 'include') {
      if (state.history) strengths.push('AC-02 (release v0) is labeled superseded history. Keep it out of current expected results.');
      else concerns.push('AC-02 (release v0) is included without a history-only boundary; its 15-minute rule must not compete with release v1’s 30-minute rule.');
    } else strengths.push('AC-02 (release v0) does not enter the current expected-results package.');
    if (chosen('TIM-01') === 'include') next.push('TIM-01 can be included only for its integration timing scope: 3,000 ms is neither token expiry nor email delivery. Deferral is also defensible.');
    if (chosen('TIM-01') === 'defer') strengths.push('TIM-01 is reserved for later synchronization review.');
    if (chosen('CI-01') === 'include') concerns.push('CI-01 is a test-run observation, not an expected-behaviour rule; keep diagnosis for the next exercise.');
    if (chosen('NOISE-01') === 'include') concerns.push('NOISE-01 is current but concerns CSV export, not password reset.');
    if (chosen('SUGGEST-01') === 'include') concerns.push('SUGGEST-01 is unreviewed; the 12-character proposal cannot become a password-policy oracle.');
    next.push('Check your expiry sentence: AC-02 (release v1) says 30 minutes and supersedes release v0’s 15 minutes. This page cannot judge the meaning of your sentence.');
    state.questions.forEach((q, i) => {
      if (q.key === 'custom') next.push(`Question ${i + 1} is free text. Check with a partner or trainer that it names a genuine unresolved requirement.`);
      else { const option = questionOptions.find(o => o.id === q.key); if (option && !option.open) concerns.push(`Question ${i + 1} is already answered. ${option.answer}`); }
    });
    next.push('Review the two short reasons with a partner or trainer: field completion does not establish good reasoning.');
    return { strengths, concerns, next };
  }
  function packageText(state) {
    const included = sources.filter(s => state.decisions[s.id] === 'include');
    return ['TASK', task, '', 'SOURCE DECISIONS', ...sources.map(s => `${sourceLabel(s.id)}: ${state.decisions[s.id] || 'unanswered'}${s.id === 'OLD-01' && state.decisions[s.id] === 'include' ? ` (${state.history ? 'superseded history only' : 'history-only use not marked'})` : ''}`), '', 'INCLUDED SOURCE TEXT', ...(included.length ? included.map(s => `${sourceLabel(s.id)} — ${s.owner}; ${s.status}\n${s.text}`) : ['(none)']), '', 'TWO REASONS', ...state.reasons.map((r, i) => `${i + 1}. ${sourceLabel(r.source) || '(source missing)'}: ${r.text.trim() || '(reason missing)'}`), '', 'EXPIRY CONFLICT', state.conflict.trim() || '(not recorded)', '', 'UNRESOLVED QUESTIONS', ...state.questions.map((q, i) => `${i + 1}. ${questionText(q) || '(not selected)'}`), '', 'REVISION NOTE', state.reflection.trim() || '(not recorded)'].join('\n\n');
  }
  return { task, sources, sourceLabel, questionOptions, empty, validate, evaluate, questionText, packageText };
})();
if (typeof module !== 'undefined') module.exports = Grounding;
