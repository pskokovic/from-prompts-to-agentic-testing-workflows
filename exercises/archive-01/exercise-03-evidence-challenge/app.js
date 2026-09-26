'use strict';
(() => {
  const $ = id => document.getElementById(id);
  let state = Evidence.empty(), reviewed = null;
  function options(id, values) {
    $(id).append(new Option('Choose…', ''));
    Object.entries(values).forEach(([value, label]) => $(id).append(new Option(label, value)));
  }
  options('decision', Evidence.decisions); options('category', Evidence.categories);
  options('hypothesis1', Evidence.hypotheses); options('hypothesis2', Evidence.hypotheses); options('action', Evidence.actions);
  Object.entries(Evidence.observations).forEach(([id, text]) => {
    const label = document.createElement('label'); label.className = 'choice';
    const input = document.createElement('input'); input.type = 'checkbox'; input.value = id; input.name = 'observation';
    label.append(input, document.createTextNode(text)); $('observation-options').append(label);
  });
  function read() {
    Evidence.fields.forEach(k => { state[k] = $(k).value; });
    state.observations = Array.from(document.querySelectorAll('[name="observation"]:checked'), el => el.value);
    state.priorTiming = $('priorTiming').checked;
  }
  function update() {
    read();
    $('rejection-field').hidden = state.decision !== 'reject';
    $('other-field').hidden = ![state.hypothesis1, state.hypothesis2].includes('other');
    ['hypothesis1', 'hypothesis2'].forEach(id => { $(id + '-text').textContent = Evidence.hypotheses[state[id]] || ''; });
    $('stale').hidden = !reviewed || JSON.stringify(state) === JSON.stringify(reviewed);
    $('record').textContent = Evidence.packageText(state, reviewed);
  }
  function list(id, values, emptyText) {
    $(id).replaceChildren();
    (values.length ? values : [emptyText]).forEach(text => { const item = document.createElement('li'); item.textContent = text; $(id).append(item); });
  }
  $('builder').addEventListener('submit', event => event.preventDefault());
  $('builder').addEventListener('input', update); $('builder').addEventListener('change', update);
  $('commit').addEventListener('click', () => {
    update();
    const result = Evidence.commit(state);
    if (result.error) { $('commit-status').textContent = result.error; $('commit-status').focus(); return; }
    state = result.state;
    $('action').disabled = true; $('actionReason').readOnly = true; $('priorTiming').disabled = true; $('commit').disabled = true;
    $('revision-field').hidden = false;
    $('reveal').hidden = state.request.action !== 'timing';
    $('timing-text').textContent = state.request.action === 'timing' ? Evidence.timing : '';
    $('commit-status').textContent = state.request.status + '. Initial decision preserved. Review your decision and explain what changed or why it stayed the same.';
    update(); $('commit-status').focus();
  });
  $('review').addEventListener('click', () => {
    update(); reviewed = Evidence.clone(state);
    const result = Evidence.evaluate(state);
    list('concerns', result.concerns, 'No modeled claim-choice concerns found. This does not validate your written reasoning.');
    list('guidance', result.guidance, 'Check your evidence and reasoning.');
    list('gaps', result.missing, 'All required fields are present. A person still needs to assess the reasoning.');
    $('results').hidden = false; update(); $('results-title').focus();
  });
  $('revise').addEventListener('click', () => $('decision').focus());
  $('reset').addEventListener('click', () => {
    HTMLFormElement.prototype.reset.call($('builder')); state = Evidence.empty(); reviewed = null;
    $('action').disabled = false; $('actionReason').readOnly = false; $('priorTiming').disabled = false; $('commit').disabled = false;
    ['results', 'reveal', 'revision-field'].forEach(id => { $(id).hidden = true; });
    $('timing-text').textContent = ''; $('commit-status').textContent = ''; $('copy-status').textContent = 'Attempt and review history reset.';
    $('results').querySelectorAll('details').forEach(el => { el.open = false; });
    update(); $('decision').focus();
  });
  $('copy').addEventListener('click', async () => {
    update();
    try { await navigator.clipboard.writeText($('record').textContent); $('copy-status').textContent = 'Decision record copied.'; }
    catch {
      const range = document.createRange(); range.selectNodeContents($('record'));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); $('record').focus();
      $('copy-status').textContent = 'Clipboard unavailable. Record selected; press Ctrl+C (Command+C on Mac) to copy.';
    }
  });
  $('interactive').hidden = false; $('record-panel').hidden = false; update();
})();
