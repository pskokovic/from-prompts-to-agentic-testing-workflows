'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  let state = Grounding.empty(), first = null, reviewed = null;
  const explanations = {
    'REQ-01': 'This current product-owner requirement defines the registered-user request scope. Include it for functional test design, then use acceptance criteria for detailed outcomes.',
    'AC-01–04': 'These current product-owner criteria are the functional oracles. AC-02 (release v1) sets 30-minute expiry; AC-03 rules out reuse; AC-04 covers new and old password behavior.',
    'OLD-01': 'AC-02 (release v0) is the superseded 15-minute version of the same criterion. Exclude it from current expectations, or include it explicitly as history of the conflict. It cannot override AC-02 (release v1).',
    'TIM-01': 'This current 3,000 ms integration contract is valid within its own scope. It can be deferred for synchronization work or included with that limited role; it does not set token expiry or email-delivery time.',
    'CI-01': 'The run records an absent confirmation at one snapshot. It is useful for later investigation, but it neither defines expected product behavior nor proves the service is unstable.',
    'NOISE-01': 'This issue is current but concerns CSV export. Current status alone does not make it relevant to reset tests.',
    'SUGGEST-01': 'The 12-character rule is an unreviewed AI proposal. Raise password policy as an open question; do not use this card as an approved oracle.'
  };
  Grounding.sources.forEach((source, index) => {
    const card = document.createElement('section');
    card.className = 'source';
    card.setAttribute('aria-labelledby', `source-${index}`);
    card.innerHTML = `<h3 id="source-${index}"></h3><p class="purpose"></p><p class="metadata"></p><details><summary>Read full source</summary><p class="source-text"></p></details><label>Decision<select id="decision-${index}"><option value="">Choose…</option><option value="include">Include</option><option value="exclude">Exclude</option><option value="defer">Defer</option></select></label>`;
    card.querySelector('h3').textContent = `${Grounding.sourceLabel(source.id)} · ${source.title}`;
    card.querySelector('.purpose').textContent = source.purpose;
    card.querySelector('.metadata').textContent = `${source.owner} · ${source.status}`;
    card.querySelector('.source-text').textContent = source.text;
    if (source.id === 'OLD-01') {
      const label = document.createElement('label');
      label.id = 'history-field'; label.hidden = true;
      label.className = 'history-field';
      label.innerHTML = '<input id="history" type="checkbox"> If included, use as superseded history only';
      card.append(label);
    }
    $('sources').append(card);
  });
  for (const slot of [1, 2]) {
    const reason = $(`reason-source-${slot}`);
    reason.append(new Option('Choose an excluded or deferred source…', ''));
    Grounding.sources.forEach(s => reason.append(new Option(Grounding.sourceLabel(s.id), s.id)));
    const question = $(`question-${slot}`);
    question.append(new Option('Choose a question…', ''));
    Grounding.questionOptions.forEach(o => question.append(new Option(o.text, o.id)));
    question.append(new Option('Write my own question…', 'custom'));
  }
  function read() {
    Grounding.sources.forEach((s, i) => { state.decisions[s.id] = $(`decision-${i}`).value; });
    state.reasons = [1, 2].map(i => ({ source: $(`reason-source-${i}`).value, text: $(`reason-text-${i}`).value }));
    state.history = $('history').checked;
    state.conflict = $('conflict').value;
    state.questions = [1, 2].map(i => ({ key: $(`question-${i}`).value, custom: $(`custom-${i}`).value }));
    state.reflection = $('reflection').value;
  }
  function update() {
    read();
    $('history-field').hidden = state.decisions['OLD-01'] !== 'include';
    for (const i of [1, 2]) $('custom-field-' + i).hidden = state.questions[i - 1].key !== 'custom';
    const count = Grounding.sources.filter(s => state.decisions[s.id]).length;
    $('progress').textContent = `${count} of 7 sources classified.`;
    Grounding.sources.forEach((s, i) => $('decision-' + i).closest('.source').classList.toggle('undecided', !state.decisions[s.id]));
    $('stale').hidden = !reviewed || JSON.stringify(state) === JSON.stringify(reviewed);
    if (!$('validation').hidden) $('validation').hidden = true;
  }
  function list(id, items, fallback) {
    $(id).replaceChildren();
    (items.length ? items : [fallback]).forEach(message => { const li = document.createElement('li'); li.textContent = message; $(id).append(li); });
  }
  function showValidation(check) {
    const errors = [];
    if (check.missing.length) errors.push(`Classify ${check.missing.map(Grounding.sourceLabel).join(', ')}.`);
    if (check.reasonErrors.length) errors.push(`Complete reason ${check.reasonErrors.join(' and ')} with an excluded or deferred source.`);
    if (check.reasonDuplicate) errors.push('Use two different sources for the reasons.');
    if (check.conflictMissing) errors.push('Write one sentence resolving the expiry conflict.');
    if (check.questionErrors.length) errors.push(`Complete question ${check.questionErrors.join(' and ')}.`);
    if (check.questionDuplicate) errors.push('Choose two different questions; write at most one of your own.');
    $('validation').textContent = errors.join(' ');
    $('validation').hidden = false;
    $('validation').focus();
  }
  function rationale() {
    $('rationale').replaceChildren();
    const lead = document.createElement('p');
    lead.textContent = 'One defensible package includes REQ-01 and AC-01–04, excludes AC-02 (release v0), NOISE-01, and SUGGEST-01, and defers TIM-01 and CI-01. Scoped alternatives can also be justified.';
    $('rationale').append(lead);
    Grounding.sources.forEach(s => { const p = document.createElement('p'); const strong = document.createElement('strong'); strong.textContent = `${Grounding.sourceLabel(s.id)}: `; p.append(strong, document.createTextNode(explanations[s.id])); $('rationale').append(p); });
    const closing = document.createElement('p');
    closing.textContent = 'AC-02 (release v1) governs expiry at 30 minutes. Unregistered-email behavior and the exact 30-minute boundary are two open questions; password policy and rate limits are also valid gaps.';
    $('rationale').append(closing);
  }
  $('builder').addEventListener('input', update);
  $('builder').addEventListener('change', update);
  $('builder').addEventListener('submit', event => {
    event.preventDefault(); update();
    const check = Grounding.validate(state);
    if (!check.complete) { showValidation(check); return; }
    if (!first) first = clone(state);
    reviewed = clone(state);
    const feedback = Grounding.evaluate(state);
    list('strengths', feedback.strengths, 'No modeled source-selection strengths yet.');
    list('concerns', feedback.concerns, 'No modeled concern from the selected choices. Written reasoning still needs review.');
    list('next', feedback.next, 'Review your reasoning with a partner or trainer.');
    const changed = Grounding.sources.filter(s => first.decisions[s.id] !== state.decisions[s.id]).map(s => Grounding.sourceLabel(s.id));
    $('comparison').textContent = changed.length ? `Source decisions changed since first review: ${changed.join(', ')}. Explain whether the changes improved grounding.` : 'No source decisions changed since first review. You can still revise your reasons or questions.';
    $('package').textContent = Grounding.packageText(state);
    rationale();
    $('results').hidden = false; $('stale').hidden = true; $('validation').hidden = true;
    $('results-title').focus();
  });
  $('revise').addEventListener('click', () => $('decision-0').focus());
  $('reset').addEventListener('click', () => {
    HTMLFormElement.prototype.reset.call($('builder'));
    $('reflection').value = '';
    state = Grounding.empty(); first = null; reviewed = null;
    $('builder').querySelectorAll('details').forEach(d => { d.open = false; });
    $('results').hidden = true; $('validation').hidden = true;
    $('status').textContent = 'Answer and review history reset.';
    update(); $('decision-0').focus();
  });
  $('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('package').textContent); $('status').textContent = 'Context package copied.'; }
    catch {
      const range = document.createRange(); range.selectNodeContents($('package'));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); $('package').focus();
      $('status').textContent = 'Clipboard unavailable. The package is selected; press Ctrl+C (Command+C on Mac) to copy.';
    }
  });
  $('interactive').hidden = false;
  update();
})();
