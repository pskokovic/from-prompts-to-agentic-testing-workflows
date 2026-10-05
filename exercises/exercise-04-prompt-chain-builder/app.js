(function () {
  'use strict';
  const M = window.PromptChainBuilder;
  let state = M.initialState();
  let draggedTask = null;
  const $ = id => document.getElementById(id);
  const names = { input: 'Input', task: 'Task', format: 'Output format', review: 'Review condition' };
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  const currentStage = () => M.sequence(state)[state.current];

  function mapRender() {
    const list = $('task-map'); list.replaceChildren();
    M.sequence(state).forEach((id, index) => {
      const item = element('li', 'task-row'); item.draggable = true;
      item.dataset.task = id;
      const handle = element('span', 'drag-handle', '⋮⋮'); handle.setAttribute('aria-hidden', 'true');
      const content = element('div', 'task-copy');
      content.append(element('strong', '', M.stages[id].title), element('span', '', M.stages[id].handoff));
      const arrows = element('div', 'reorder-actions');
      for (const [symbol, offset, description] of [['↑', -1, 'Move earlier'], ['↓', 1, 'Move later']]) {
        const button = element('button', 'arrow-button', symbol); button.type = 'button';
        button.setAttribute('aria-label', `${description}: ${M.stages[id].title}`);
        button.disabled = index + offset < 0 || index + offset > 2;
        button.addEventListener('click', () => {
          state = M.moveTask(state, id, index + offset); render();
          const moved = $('task-map').querySelector(`[data-task="${id}"]`);
          moved?.querySelector(`button[aria-label^="${description}"]`)?.focus();
        });
        arrows.append(button);
      }
      item.append(handle, content, arrows);
      item.addEventListener('dragstart', event => {
        draggedTask = id;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => { draggedTask = null; item.classList.remove('dragging'); list.querySelectorAll('.drop-target').forEach(node => node.classList.remove('drop-target')); });
      item.addEventListener('dragover', event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; item.classList.add('drop-target'); });
      item.addEventListener('dragleave', event => { if (!item.contains(event.relatedTarget)) item.classList.remove('drop-target'); });
      item.addEventListener('drop', event => {
        event.preventDefault(); item.classList.remove('drop-target');
        const source = event.dataTransfer.getData('text/plain') || draggedTask;
        if (source && source !== id && M.stages[source]) { state = M.moveTask(state, source, index); render(); }
        draggedTask = null;
      });
      list.append(item);
    });
    $('map-feedback').textContent = M.mapFeedback(state.taskMap);
    $('confirm-map').disabled = state.taskMap.length !== 3;
  }

  function progressRender() {
    const list = $('chain-status'); list.replaceChildren();
    M.sequence(state).forEach((id, index) => {
      const item = element('li');
      const button = element('button', 'path-button', `Stage ${index + 1}: ${M.stages[id].title}`);
      button.type = 'button';
      button.disabled = index > 0 && !M.inputFor(state, id) && !state.runs[id];
      button.addEventListener('click', () => { state.current = index; render(); $('stage-title').focus(); });
      const status = state.stale[id] ? 'Needs review' : state.decisions[id]?.kind === 'hold' ? 'Held' : state.decisions[id]?.kind === 'pass' ? 'Passed as reviewed' : state.runs[id] ? 'Review response' : 'Not run';
      item.append(button, document.createTextNode(` — ${status}`));
      if (state.stale[id]) item.className = 'needs-review';
      if (index === state.current) item.classList.add('current-stage');
      list.append(item);
    });
  }

  function choicesRender(id) {
    const target = $('choices'); target.replaceChildren();
    M.slots.forEach(slot => {
      const group = element('fieldset', 'choice-group');
      group.append(element('legend', '', names[slot]));
      const options = element('div', 'options');
      M.blocks[id][slot].forEach(block => {
        const label = element('label', 'output-choice');
        const input = element('input'); input.type = 'radio'; input.name = `block-${slot}`; input.value = block.id;
        input.checked = state.slots[id][slot] === block.id;
        input.addEventListener('change', () => {
          state = M.placeBlock(state, id, slot, block.id);
          render();
          $('choices').querySelector(`input[name="block-${slot}"][value="${block.id}"]`)?.focus();
        });
        label.append(input, element('span', '', block.text));
        options.append(label);
      });
      group.append(options); target.append(group);
    });
  }

  function renderPrepared(target, response) {
    target.replaceChildren();
    if (response.presentation === 'table') {
      const table = element('table', 'result-table');
      const head = element('thead');
      const header = element('tr');
      for (const title of ['#', 'Prepared response']) {
        const cell = element('th', '', title); cell.scope = 'col'; header.append(cell);
      }
      head.append(header);
      const body = element('tbody');
      response.items.forEach((line, index) => {
        const row = element('tr');
        const number = element('th', '', String(index + 1)); number.scope = 'row';
        row.append(number, element('td', '', line));
        body.append(row);
      });
      table.append(head, body);
      target.append(table);
    } else {
      const list = element('ul', 'result-list');
      response.items.forEach(line => list.append(element('li', '', line)));
      target.append(list);
    }
  }

  function responseRender(id) {
    const entry = state.history.find(item => item.number === state.runs[id]);
    const visible = Boolean(entry && !state.stale[id]);
    $('response-panel').hidden = !visible;
    if (!visible) return;
    renderPrepared($('response-display'), entry.response);
    $('response-meta').textContent = `Run ${entry.number} · ${entry.response.presentation === 'list' ? 'Source-linked list' : 'Compact table without source IDs'}`;
    const prior = state.history.filter(item => item.stage === id && item.number < entry.number).at(-1);
    $('response-comparison').hidden = !prior;
    $('previous-response').replaceChildren();
    if (prior) {
      renderPrepared($('previous-response'), prior.response);
      $('previous-response').prepend(element('p', 'field-note', `Run ${prior.number} · ${prior.response.presentation === 'list' ? 'Source-linked list' : 'Compact table without source IDs'}`));
    }
    $('review-note').value = entry.review?.note || '';
    $('review-note').disabled = Boolean(entry.review);
    $('pass').disabled = Boolean(entry.review);
    $('hold').disabled = Boolean(entry.review);
    $('review-help').textContent = entry.review ? `${entry.review.kind === 'pass' ? 'Passed' : 'Held'} as reviewed. Rerun this prompt to make a new decision.` : 'Pass, hold, or change a choice and rerun. Passing carries this exact text.';
    const details = $('feedback-details'); details.hidden = !entry.review;
    const list = $('feedback-list'); list.replaceChildren();
    if (entry.review) M.feedback(state, id).forEach(line => list.append(element('li', '', line)));
  }

  function stageRender() {
    progressRender();
    const id = currentStage();
    $('stage-count').textContent = `STAGE ${state.current + 1} OF 3`;
    $('stage-title').textContent = M.stages[id].title;
    $('stage-input').textContent = M.inputFor(state, id) || 'No current reviewed input. Return to the preceding stage.';
    $('handoff-note').textContent = M.inputDetailsFor(state, id);
    const previous = M.sequence(state)[state.current - 1];
    $('prior-feedback').hidden = !previous || !state.decisions[previous] || state.stale[previous];
    const previousList = $('prior-feedback-list'); previousList.replaceChildren();
    if (!$('prior-feedback').hidden) M.feedback(state, previous).forEach(line => previousList.append(element('li', '', line)));
    choicesRender(id);
    const prompt = M.promptFor(state, id);
    const selectedCount = M.slots.filter(slot => state.slots[id][slot]).length;
    $('prompt-progress').textContent = `${selectedCount} of ${M.slots.length} prompt parts selected${selectedCount === M.slots.length ? ' · ready to run' : ' · choose the remaining parts'}`;
    $('assembled-prompt').textContent = M.promptPreviewFor(state, id);
    $('run').disabled = !prompt;
    $('run-help').textContent = prompt ? (state.runs[id] && state.stale[id] ? 'Prompt changed. Run again to see a new response; earlier runs stay in the record.' : 'Ready to run.') : 'Choose one option in each prompt part.';
    responseRender(id);
    const passed = state.decisions[id]?.kind === 'pass' && !state.stale[id];
    $('next-step').hidden = !passed;
    if (passed) {
      if (state.current < 2) {
        const next = M.sequence(state)[state.current + 1];
        const checkpointReached = M.comparison(state).phase === 'checkpoint';
        $('next-message').textContent = checkpointReached
          ? `Live comparison checkpoint reached. Compare the two ${M.stages[id].title.toLowerCase()} responses below. Continue to Stage ${state.current + 2} at home for a full-chain comparison.`
          : `Stage ${state.current + 1} is reviewed. Continue to Stage ${state.current + 2}; it will receive the exact response above.`;
        $('continue').textContent = `Continue to Stage ${state.current + 2}: ${M.stages[next].title} →`;
        $('continue').hidden = false;
      } else {
        $('next-message').textContent = M.comparison(state).phase === 'complete'
          ? 'Both chains are complete. Compare their final outputs below.'
          : 'All three responses have been reviewed. Inspect the final output and try an upstream revision below.';
        $('continue').hidden = true;
      }
    }
  }

  function comparisonRender() {
    const compare = M.comparison(state);
    $('comparison-panel').hidden = compare.phase === 'await-baseline';
    if (compare.phase === 'await-baseline') return;
    const route = $('comparison-route'); route.replaceChildren();
    compare.route.forEach((item, index) => {
      const current = item.currentRun === item.baselineRun ? 'same run' : item.currentRun ? `Run ${item.currentRun}` : 'no run';
      route.append(element('li', item.state === 'Needs review' ? 'needs-review' : '', `Stage ${index + 1}: ${M.stages[item.stage].title} · first Run ${item.baselineRun} → ${current} · ${item.state}`));
    });
    const label = stage => M.stages[stage].title.toLowerCase();
    if (compare.phase === 'baseline') $('comparison-status').textContent = 'First complete chain saved. In class: change Stage 1, run and review it, then rerun and review Stage 2. Compare those two Stage 2 handoffs here.';
    else if (compare.phase === 'in-progress') $('comparison-status').textContent = `Revised chain in progress. Review the changed response and the first affected downstream stage (${label(compare.checkpointStage)}) before comparing. Later stages still need review.`;
    else if (compare.phase === 'checkpoint') $('comparison-status').textContent = `Live checkpoint ready: compare the two ${label(compare.checkpointStage)} responses below. A final-output comparison needs the remaining stages reviewed; finish them at home if the tutorial time is up.`;
    else $('comparison-status').textContent = 'Both chains are complete. Compare their final outputs below; decide which is better supported and explain the remaining limits.';
    const showPair = (prefix, pair) => {
      $(`${prefix}-first-run`).textContent = `· Run ${pair.baseline.number}`;
      $(`${prefix}-revised-run`).textContent = `· Run ${pair.revised.number}`;
      renderPrepared($(`${prefix}-first`), pair.baseline.response);
      renderPrepared($(`${prefix}-revised`), pair.revised.response);
      document.querySelectorAll(`input[name="${prefix}-judgment"]`).forEach(radio => { radio.checked = radio.value === pair.vote; });
      $(`${prefix}-judgment-status`).textContent = pair.vote ? 'Judgment recorded for these two responses. Discuss which evidence supports it.' : 'Choose a judgment for these two responses; there is no automatic score.';
    };
    $('comparison-checkpoint').hidden = !compare.checkpoint;
    if (compare.checkpoint) {
      $('checkpoint-title').textContent = `Live checkpoint · ${M.stages[compare.checkpointStage].title}`;
      showPair('checkpoint', compare.checkpoint);
    }
    $('comparison-final').hidden = !compare.final;
    if (compare.final) {
      $('final-title').textContent = `Full-chain comparison · ${M.stages[M.sequence(state).at(-1)].title}`;
      showPair('final', compare.final);
    }
  }

  function outcomeRender() {
    const hasAttempt = Boolean(state.firstAttempt || M.sequence(state).some(id => state.decisions[id]?.kind === 'hold'));
    $('outcome-panel').hidden = !hasAttempt;
    if (!hasAttempt) return;
    $('outcome-status').textContent = M.status(state);
    $('history').textContent = M.record(state);
    const actions = $('revision-actions'); actions.replaceChildren();
    M.sequence(state).forEach((id, index) => {
      if (!state.runs[id]) return;
      const button = element('button', 'text-button', `Revisit Stage ${index + 1}: ${M.stages[id].title}`);
      button.type = 'button';
      button.addEventListener('click', () => { state.current = index; render(); $('stage-title').focus(); });
      actions.append(button);
    });
    comparisonRender();
  }

  function render() {
    $('activity').hidden = false;
    mapRender();
    $('map-panel').hidden = state.mapConfirmed;
    $('chain-panel').hidden = !state.mapConfirmed;
    if (state.mapConfirmed) stageRender();
    outcomeRender();
    $('record').textContent = M.record(state);
  }

  $('confirm-map').addEventListener('click', () => { try { state = M.confirmMap(state); render(); $('stage-title').focus(); } catch (error) { $('map-feedback').textContent = error.message; } });
  $('run').addEventListener('click', () => { try { state = M.run(state, currentStage()); render(); $('run-help').textContent = `Run ${state.history.at(-1).number} generated. Review the response below; previous runs are retained.`; $('response-display').focus(); } catch (error) { $('run-help').textContent = error.message; } });
  for (const kind of ['pass', 'hold']) {
    $(kind).addEventListener('click', () => {
      try { state = M.decision(state, currentStage(), kind, $('review-note').value); render(); if (kind === 'pass' && ['checkpoint', 'complete'].includes(M.comparison(state).phase)) $('comparison-title').focus(); else if (kind === 'pass') $('next-message').focus(); else $('outcome-status').focus(); }
      catch (error) { $('review-help').textContent = error.message; }
    });
  }
  for (const scope of ['checkpoint', 'final']) {
    document.querySelectorAll(`input[name="${scope}-judgment"]`).forEach(radio => radio.addEventListener('change', () => {
      try { state = M.chooseComparison(state, scope, radio.value); render(); }
      catch (error) { $(`${scope}-judgment-status`).textContent = error.message; }
    }));
  }
  $('continue').addEventListener('click', () => { try { state = M.advance(state); render(); $('stage-title').focus(); } catch (error) { $('next-message').textContent = error.message; } });
  $('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(M.record(state)); $('copy-status').textContent = 'Record copied.'; }
    catch (_) { $('copy-status').textContent = 'Copy was blocked. Select the record below and copy it manually.'; }
  });
  $('reset').addEventListener('click', () => { state = M.initialState(); render(); $('title').focus(); });
  render();
})();
