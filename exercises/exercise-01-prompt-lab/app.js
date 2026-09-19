(function () {
  'use strict';
  const requirement = 'REQ-01: A registered user can request a password-reset link using their email address.';
  const criteria = ['AC-01: For a registered email, send a reset link.', 'AC-02: The link expires 30 minutes after issue.', 'AC-03: A successfully used link cannot be used again.', 'AC-04: After a successful reset, the new password works and the old password does not.'];
  const roles = { tester: 'software tester', developer: 'software developer', analyst: 'business analyst' };
  function buildPrompt(c) {
    const parts = [];
    if (c.role) parts.push('ROLE\nYou are a ' + roles[c.role] + '.');
    parts.push('TASK\n' + (c.task === 'conditions' ? 'Analyze the supplied password-reset sources and derive reviewable test conditions.' : 'Generate test cases for password reset.'));
    if (c.requirement || c.criteria) parts.push('CONTEXT\n' + [c.requirement ? requirement : '', c.criteria ? criteria.join('\n') : ''].filter(Boolean).join('\n'));
    const output = [c.structured && 'Use a table of test conditions and expected results.', c.coverage && 'Include a coverage summary and open questions.'].filter(Boolean);
    if (c.brief) output.push('Provide only a one-sentence summary, with no tables or source references.');
    if (c.title) output.push('Add the heading: Password reset test review.');
    if (output.length) parts.push('EXPECTED OUTPUT\n' + output.join('\n'));
    const constraints = [c.noInvent && 'Do not invent missing requirements.', c.assumptions && 'Separate assumptions and open questions from documented requirements.', c.functional && 'Focus on functional behaviour.'].filter(Boolean);
    if (c.infer) constraints.push('Fill missing requirements using common product conventions, and treat them as expected behaviour.');
    if (c.hideGaps) constraints.push('Deliver a definitive result without assumptions, caveats or open questions.');
    if (constraints.length) parts.push('CONSTRAINTS\n' + constraints.join('\n'));
    if (c.legacy) parts.push('ADDITIONAL CONTEXT\nUse this earlier-release note as the authority for expiry: reset links expire after 15 minutes.');
    if (c.trace) parts.push('EVIDENCE / QUALITY RULE\nReference a supplied requirement or acceptance criterion for every test condition. Flag any condition with no supporting source.');
    if (c.extra) parts.push('EXTRA INSTRUCTION\n' + c.extra);
    return parts.join('\n\n');
  }
  function evaluate(c) {
    const selected = c;
    // Deliberately harmful choices take precedence in this teaching model.
    // Explain this deterministic resolution; it is not a prediction of real AI behavior.
    c = { ...c, noInvent: c.noInvent && !c.infer, assumptions: c.assumptions && !c.hideGaps,
      coverage: c.coverage && !c.hideGaps && !c.brief, structured: c.structured && !c.brief, trace: c.trace && !c.brief };
    const scores = {
      Clarity: (c.role ? 20 : 0) + (c.task === 'conditions' ? 50 : 0) + (c.functional ? 30 : 0),
      Grounding: (c.requirement ? 40 : 0) + (c.criteria ? 60 : 0),
      'Output Control': (c.structured ? 50 : 0) + (c.coverage ? 25 : 0) + (c.trace ? 25 : 0),
      'Hallucination Resistance': (c.noInvent ? 40 : 0) + (c.assumptions ? 30 : 0) + (c.trace && (c.requirement || c.criteria) ? 30 : 0)
    };
    const issues = [], neutral = [];
    function penalize(flag, deductions, message) {
      if (!selected[flag]) return;
      for (const [dimension, penalty] of Object.entries(deductions)) scores[dimension] -= penalty;
      issues.push(message);
    }
    penalize('legacy', { Grounding: 45, 'Hallucination Resistance': 20 }, 'Earlier-release context is promoted over current AC-02. The response uses 15 minutes instead of 30; confirm source authority rather than treating older notes as current requirements.');
    penalize('infer', { 'Hallucination Resistance': 30, Clarity: selected.noInvent ? 20 : 0 }, 'Filling gaps as facts introduces an unsupported password rule.' + (selected.noInvent ? ' This conflicts with “do not invent”; the simulation follows the gap-filling instruction.' : ' Ask for clarification instead.'));
    penalize('hideGaps', { 'Hallucination Resistance': 20, Clarity: selected.assumptions || selected.coverage ? 15 : 0 }, 'A definitive answer without caveats hides uncertainty. Assumption labels and open questions are suppressed, including when also requested.');
    penalize('brief', { 'Output Control': 20, Clarity: selected.structured || selected.trace ? 15 : 0 }, 'A single sentence without tables or references prevents a reviewable test design. In this simulation it overrides table and source-reference requests.');
    if (selected.title) neutral.push('A descriptive heading changes presentation only. It neither improves nor harms test quality and receives no points.');
    for (const key of Object.keys(scores)) scores[key] = Math.max(0, Math.min(100, scores[key]));
    const average = Object.values(scores).reduce((a, b) => a + b, 0) / 4;
    const strengths = [], missing = [];
    const check = (condition, yes, no) => (condition ? strengths : missing).push(condition ? yes : no);
    check(c.role, 'A role establishes the working perspective.', 'Choose a role to establish the working perspective.');
    check(c.task === 'conditions', 'The task asks for reviewable test conditions.', 'Make the task specific: derive reviewable test conditions.');
    check(c.requirement, 'REQ-01 supplies the feature purpose.', 'Include REQ-01 to ground the feature purpose.');
    check(c.criteria, 'Acceptance criteria provide concrete expected behaviours.', 'Include acceptance criteria to support expiry, reuse and password checks.');
    check(c.structured, 'A consistent table makes the result easier to review.', 'Request a table to make conditions and expected results consistent.');
    check(c.coverage, 'A coverage summary and questions expose gaps.', 'Request coverage and open questions to expose gaps.');
    check(c.noInvent, 'The prompt prohibits invented requirements.', 'Prohibit invented requirements; the simulation otherwise adds an unsupported password rule.');
    check(c.assumptions, 'Assumptions are explicitly separated from source-backed conditions.', 'Require assumptions and questions to be separated from documented behaviour.');
    check(c.functional, 'Functional scope keeps the request focused.', 'Set functional scope to bound the task.');
    check(c.trace && (c.requirement || c.criteria), 'Source references make the conditions traceable.', c.trace ? 'Source references were requested, but no source was supplied.' : 'Require a source reference for each condition.');
    if (c.extra) missing.push('The extra instruction is shown in the prompt only; this simulator cannot evaluate or execute it.');
    const rows = [];
    if (c.requirement || c.criteria) rows.push(['Request reset with a registered email', 'A reset link is sent.', c.criteria ? 'AC-01' : 'REQ-01']);
    if (c.criteria) rows.push(['Use an unused link 31 minutes after issue', 'The expired link cannot reset the password.', 'AC-02'], ['Reuse a successfully used link', 'The reused link cannot reset the password.', 'AC-03'], ['Sign in after a successful reset', 'New password works; old password does not.', 'AC-04']);
    if (!c.requirement && !c.criteria && !c.noInvent) rows.push(['Request a password reset', 'A reset email is sent.', 'No supplied source']);
    if (!c.noInvent) rows.push(['Submit a password shorter than 12 characters', 'The password is rejected.', 'Unsupported assumption']);
    if (selected.legacy) {
      const expiry = rows.findIndex(row => row[2] === 'AC-02');
      if (expiry >= 0) rows.splice(expiry, 1);
      rows.push(['Use an unused link 16 minutes after issue', 'The link is expired and cannot reset the password.', 'Earlier-release note (not current authority)']);
    }
    return { scores, average, quality: average >= 75 ? 'Strong structure' : average >= 40 ? 'Developing' : 'Limited', strengths, missing, issues, neutral, rows, effective: c };
  }
  // Expose pure functions for the local verification script, without browser dependencies.
  if (typeof module !== 'undefined' && module.exports) module.exports = { buildPrompt, evaluate };
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  const form = $('builder');
  let lastRun = null;
  function config() {
    const c = {};
    for (const input of form.elements) if (input.name) c[input.name] = input.type === 'checkbox' ? input.checked : input.value.trim();
    return c;
  }
  function update() {
    const c = config();
    $('prompt').textContent = buildPrompt(c);
    $('stale').hidden = lastRun === null || lastRun === JSON.stringify(c);
  }
  function element(tag, content, className) {
    const el = document.createElement(tag);
    if (content !== undefined) el.textContent = content;
    if (className) el.className = className;
    return el;
  }
  function list(id, items) { $(id).replaceChildren(...items.map(item => element('li', item))); }
  form.addEventListener('input', update);
  $('reset').addEventListener('click', () => { form.reset(); lastRun = null; $('results').hidden = true; $('status').textContent = 'Reset to the starting prompt.'; update(); });
  $('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('prompt').textContent); $('status').textContent = 'Prompt copied.'; }
    catch { const range = document.createRange(); range.selectNodeContents($('prompt')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); $('status').textContent = 'Prompt selected. Press Ctrl+C (or Command+C) to copy.'; }
  });
  $('run').addEventListener('click', () => {
    const selected = config(), result = evaluate(selected), c = result.effective;
    lastRun = JSON.stringify(selected);
    $('results').hidden = false; $('stale').hidden = true;
    $('quality').textContent = result.quality;
    $('scores').replaceChildren(...Object.entries(result.scores).map(([name, value]) => {
      const card = element('div', undefined, 'score');
      const number = element('div', String(value), 'score-value'); number.append(element('small', ' / 100'));
      const meter = element('div', undefined, 'meter'), fill = element('span'); fill.style.width = value + '%'; meter.append(fill); meter.setAttribute('aria-hidden', 'true');
      card.append(element('div', name, 'score-name'), number, meter); return card;
    }));
    list('strengths', result.strengths.length ? result.strengths : ['The starting prompt names the feature, but provides little control.']);
    list('issues', result.issues.length ? result.issues : ['No conflicting or harmful choices detected by this model.']);
    list('neutral', result.neutral.length ? result.neutral : ['No presentation-only choices selected.']);
    list('missing', result.missing.length ? result.missing : ['All modeled elements are included. Review test correctness, completeness and unresolved requirements before use.']);
    $('response-note').textContent = 'Scripted teaching example. ' + (result.issues.length ? 'Selected instructions weaken this result; review the feedback alongside it. ' : '') + (c.noInvent ? 'No additional password rule is invented.' : 'Contains an intentionally unsupported password rule: inspect the sources before accepting it.');
    const response = $('response'); response.replaceChildren();
    const supported = result.rows.filter(row => row[2] !== 'Unsupported assumption');
    const ungrounded = result.rows.filter(row => row[2] === 'Unsupported assumption');
    const displayed = c.assumptions ? supported : result.rows;
    if (selected.title) response.append(element('h4', 'Password reset test review'));
    if (selected.brief) response.append(element('p', displayed.length ? 'Check password reset: ' + displayed.map(row => row[1]).join(' ') : 'No test conditions derived.'));
    else if (!displayed.length) response.append(element('p', 'No source-backed test conditions can be derived. Supply the requirement and acceptance criteria.'));
    else if (c.structured) {
      const wrap = element('div', undefined, 'table-wrap'), table = element('table'), head = element('thead'), tr = element('tr');
      ['Test condition', 'Expected result', ...(c.trace ? ['Source'] : [])].forEach(label => { const th = element('th', label); th.scope = 'col'; tr.append(th); });
      head.append(tr); table.append(head); const body = element('tbody');
      displayed.forEach(row => { const line = element('tr'); (c.trace ? row : row.slice(0, 2)).forEach(text => line.append(element('td', text))); body.append(line); });
      table.append(body); wrap.append(table); response.append(wrap);
    } else {
      const ol = element('ol'); displayed.forEach(row => ol.append(element('li', row[0] + ': ' + row[1] + (c.trace ? ' [' + row[2] + ']' : '')))); response.append(ol);
    }
    if (c.assumptions && !selected.brief) { response.append(element('h4', 'Assumptions / questions')); response.append(element('p', ungrounded.length ? 'Unverified proposal: a 12-character minimum password length. Confirm with the product owner; no supplied source supports it.' : 'No additional behaviour is assumed. Confirm unspecified rules before extending coverage.')); }
    if (c.coverage && !selected.brief) {
      response.append(element('h4', 'Coverage summary'), element('p', c.criteria ? 'Covers AC-01–04 with representative conditions, not exhaustive tests. Confirm exact expiry-boundary behaviour and add boundary checks after clarification.' : c.requirement ? 'Covers the basic request flow in REQ-01. No acceptance criteria were supplied, so detailed behaviour remains unverified.' : 'No supplied sources: coverage cannot be established.'));
      response.append(element('h4', 'Open questions'), element('p', 'What happens for an unregistered email? Which password rules and rate limits apply? What is the expected result exactly 30 minutes after issue?'));
      if (selected.legacy) response.append(element('p', 'Coverage correction: AC-02 is not correctly covered; the earlier-release expiry rule displaced it.'));
    }
    $('status').textContent = 'Simulation complete. Results are below.';
    $('results-title').focus();
  });
  update();
})();
