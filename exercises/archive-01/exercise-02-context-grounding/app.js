'use strict';
(() => {
  const $ = id => document.getElementById(id);
  let state = Grounding.empty(), first = null, latest = null;
  Grounding.sources.forEach((source, index) => {
    const card = document.createElement('section');
    card.className = 'source';
    card.innerHTML = `<h3 id="source-${index}"></h3><p class="metadata"></p><p class="source-text"></p><label>Decision for ${source.id}<select id="decision-${index}"><option value="">Choose a decision…</option><option value="include">Include now</option><option value="exclude">Exclude from this task</option><option value="defer">Defer for later</option></select></label><details><summary>Add a rationale for ${source.id}</summary><label>Why does this decision fit the task?<textarea id="reason-${index}" rows="2" maxlength="700"></textarea></label></details>`;
    card.setAttribute('aria-labelledby', `source-${index}`);
    card.querySelector('h3').textContent = `${source.id} · ${source.title}`;
    card.querySelector('.metadata').textContent = source.meta;
    card.querySelector('.source-text').textContent = source.text;
    if (source.id === 'OLD-01') {
      const label = document.createElement('label');
      label.id = 'history-field'; label.hidden = true;
      label.innerHTML = 'How should the included earlier-release note be used?<select id="history"><option value="">Choose its role…</option><option value="authority">As an expected behaviour rule</option><option value="history">As superseded history only</option></select>';
      card.append(label);
    }
    $('sources').append(card);
  });
  function read() {
    Grounding.sources.forEach((s, i) => { state.decisions[s.id] = { choice: $(`decision-${i}`).value, reason: $(`reason-${i}`).value }; });
    state.history = $('history').value;
    state.conflict = $('conflict').value;
    state.questions = [$('question-1').value, $('question-2').value];
    state.reflection = $('reflection').value;
  }
  function update() {
    read();
    $('history-field').hidden = state.decisions['OLD-01'].choice !== 'include';
    $('package').textContent = Grounding.packageText(state);
    $('progress').textContent = `${Object.values(state.decisions).filter(d => d.choice).length} of ${Grounding.sources.length} sources classified. Review at any point, including an incomplete package.`;
    $('stale').hidden = !latest || JSON.stringify(state) === JSON.stringify(latest);
  }
  function list(id, items, fallback) {
    $(id).replaceChildren();
    (items.length ? items : [fallback]).forEach(text => { const li = document.createElement('li'); li.textContent = text; $(id).append(li); });
  }
  $('builder').addEventListener('submit', event => event.preventDefault());
  $('builder').addEventListener('input', update);
  $('builder').addEventListener('change', update);
  $('review').addEventListener('click', () => {
    update();
    if (!first) first = JSON.parse(JSON.stringify(state));
    latest = JSON.parse(JSON.stringify(state));
    const result = Grounding.evaluate(state);
    list('strengths', result.strengths, 'No authoritative functional sources have been included yet.');
    list('concerns', result.concerns, 'No modeled source-selection problems found. This does not validate your written reasoning or prove complete coverage.');
    list('next', result.next, 'Review your reasoning.');
    list('examples', result.examples, 'No functional test expectations can be established from the selected sources. Bring in authoritative functional evidence.');
    $('first-package').textContent = Grounding.packageText(first);
    const changed = Grounding.sources.filter(s => first.decisions[s.id].choice !== latest.decisions[s.id].choice || (s.id === 'OLD-01' && first.history !== latest.history)).map(s => s.id);
    $('comparison').textContent = changed.length ? `Source decisions changed since first review: ${changed.join(', ')}. Compare the original below with your current preview above; explain why the changes help.` : 'No source decisions changed since the first review. Compare your explanations and questions too; their meaning is not evaluated automatically.';
    $('results').hidden = false; $('reflection-field').hidden = false; $('stale').hidden = true;
    $('results-title').focus();
  });
  $('revise').addEventListener('click', () => $('decision-0').focus());
  $('reset').addEventListener('click', () => {
    $('builder').reset(); state = Grounding.empty(); first = null; latest = null;
    $('builder').querySelectorAll('details').forEach(d => { d.open = false; });
    $('results').querySelectorAll('details').forEach(d => { d.open = false; });
    $('results').hidden = true; $('reflection-field').hidden = true;
    $('status').textContent = 'Package and review history reset.';
    update(); $('decision-0').focus();
  });
  $('copy').addEventListener('click', async () => {
    const snapshot = $('package').textContent;
    try { await navigator.clipboard.writeText(snapshot); $('status').textContent = 'Context package copied.'; }
    catch {
      const range = document.createRange(); range.selectNodeContents($('package'));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); $('package').focus();
      $('status').textContent = 'Clipboard unavailable. The package is selected; press Ctrl+C (Command+C on Mac) to copy.';
    }
  });
  $('interactive').hidden = false;
  update();
})();
