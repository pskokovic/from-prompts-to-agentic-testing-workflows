(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PromptChainBuilder = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const notice = 'Local simulation · No AI service connected · Nothing is sent or saved';
  const sources = [
    ['REQ-01', 'A registered user can request a password-reset link using their email address.'],
    ['AC-01', 'For a registered email, send a reset link.'],
    ['AC-02', 'The link expires 30 minutes after issue.'],
    ['AC-03', 'A successfully used link cannot be used again.'],
    ['AC-04', 'After a successful reset, the new password works and the old password does not.']
  ];
  const gaps = 'Unregistered-email behaviour; password composition/length; rate limits; the exact 30-minute boundary; multiple outstanding links; session invalidation; delivery-time guarantees.';
  const order = ['extract', 'risk', 'tests'];
  const stages = {
    extract: { title: 'Extract supported behaviour and gaps', handoff: 'A source-linked summary of what is specified and what remains open.' },
    risk: { title: 'Identify risks', handoff: 'Risk statements with source basis and unknown likelihood.' },
    tests: { title: 'Propose test ideas and observable oracles', handoff: 'A small test proposal with an observable result for each supported expectation.' }
  };
  const slots = ['input', 'task', 'format', 'review'];
  const blocks = {
    extract: {
      input: [
        { id: 'current', text: 'Use REQ-01 and AC-01–04 as current requirements; list the known gaps separately.' },
        { id: 'suggestion', text: 'Use the current requirements and assume a 12-character minimum is approved.' }
      ],
      task: [
        { id: 'separate', text: 'Extract supported behaviours; separate open questions from expected results.' },
        { id: 'complete', text: 'Complete the specification by filling in unspecified policy details.' }
      ],
      format: [
        { id: 'linked', text: 'Return a source-linked list of behaviours and open gaps.' },
        { id: 'table', text: 'Return a compact table of behaviours and gaps without source IDs.' }
      ],
      review: [
        { id: 'grounding', text: 'Check each expected result against its source; flag unsupported claims and omissions before handoff.' },
        { id: 'readable', text: 'Check that the summary reads smoothly before handoff.' }
      ]
    },
    risk: {
      input: [
        { id: 'handoff', text: 'Use current source cards and any reviewed handoff below; retain citations and open gaps.' },
        { id: 'shortcut', text: 'Treat the supplied input as complete policy; skip open gaps.' }
      ],
      task: [
        { id: 'impact', text: 'Identify plausible credential-protection risks; distinguish impact from unknown likelihood.' },
        { id: 'likelihood', text: 'Rank risks by measured likelihood from the supplied material.' }
      ],
      format: [
        { id: 'linked', text: 'Return a source-linked list of risks, impacts, and uncertainty.' },
        { id: 'table', text: 'Return a compact risk table without source IDs.' }
      ],
      review: [
        { id: 'grounding', text: 'Check inherited claims and whether any likelihood is actually measured.' },
        { id: 'readable', text: 'Check that the list sounds decisive before handoff.' }
      ]
    },
    tests: {
      input: [
        { id: 'handoff', text: 'Use current source cards and any reviewed handoff below; retain links and uncertainty.' },
        { id: 'shortcut', text: 'Treat the supplied input as fully confirmed policy.' }
      ],
      task: [
        { id: 'oracles', text: 'Propose up to three test ideas, including both AC-04 credential outcomes where supported.' },
        { id: 'confirmation', text: 'Treat a reset confirmation as sufficient evidence of credential protection.' }
      ],
      format: [
        { id: 'linked', text: 'Return a source-linked list of test ideas and observable oracles.' },
        { id: 'table', text: 'Return a compact test-idea table without source IDs.' }
      ],
      review: [
        { id: 'grounding', text: 'Check every oracle against sources and confirm both new- and old-password outcomes.' },
        { id: 'readable', text: 'Check that the proposal is concise before handoff.' }
      ]
    }
  };

  function initialState() {
    return {
      taskMap: order.slice(), mapConfirmed: false, current: 0,
      slots: {
        extract: { input: null, task: null, format: null, review: null },
        risk: { input: null, task: null, format: null, review: null },
        tests: { input: null, task: null, format: null, review: null }
      },
      runs: { extract: null, risk: null, tests: null },
      decisions: { extract: null, risk: null, tests: null },
      stale: { extract: false, risk: false, tests: false },
      history: [], firstAttempt: null, baseline: null, comparisonVotes: { checkpoint: null, final: null }, revisionStarted: false
    };
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function sequence(state) { return state.taskMap; }
  function block(stage, slot, id) { return (blocks[stage][slot] || []).find(item => item.id === id); }
  function moveTask(state, task, index) {
    if (!stages[task] || index < 0 || index > 2) throw Error('Invalid task placement');
    const next = clone(state);
    next.taskMap = next.taskMap.filter(id => id !== task);
    next.taskMap.splice(index, 0, task);
    next.mapConfirmed = false;
    return next;
  }
  function mapFeedback(taskMap) {
    if (taskMap.length !== 3) return 'Place all three tasks, then inspect the handoffs.';
    if (taskMap.join('|') === order.join('|')) return 'This default order passes supported behaviours and gaps to risk analysis, then risks to test design. You can use it or try another order.';
    const first = taskMap[0];
    return `You can start with ${stages[first].title.toLowerCase()}. The current source cards remain available; each later prompt receives your exact reviewed response. Watch for work that happens before its useful input arrives.`;
  }
  function confirmMap(state) {
    if (state.taskMap.length !== 3 || new Set(state.taskMap).size !== 3 || state.taskMap.some(id => !stages[id])) throw Error('Place all three distinct tasks before continuing.');
    const next = clone(state); next.mapConfirmed = true; return next;
  }
  const sourceText = () => 'Current product-owner requirements: ' + sources.map(([id, text]) => `${id}: ${text}`).join(' ') + ' Known gaps: ' + gaps;
  function inputFor(state, stage) {
    const index = sequence(state).indexOf(stage);
    if (index === 0) return sourceText();
    if (index < 0) return null;
    const prior = sequence(state)[index - 1];
    const decision = state.decisions[prior];
    if (!decision || decision.kind !== 'pass' || state.stale[prior]) return null;
    return decision.payload;
  }
  function inputDetailsFor(state, stage) {
    const index = sequence(state).indexOf(stage);
    if (index === 0) return 'Authority: product-owner current requirements. Known gaps are open questions, not expected results.';
    const prior = sequence(state)[index - 1];
    const decision = state.decisions[prior];
    if (!decision || decision.kind !== 'pass' || state.stale[prior]) return 'No current reviewed handoff.';
    return `Reviewed as: pass. Claimed source IDs: ${decision.sourceIds.join(', ') || 'none'}. Optional review note (for the record only): ${decision.note || 'none'}. Noted response flags: ${decision.gaps.join(', ') || 'none'}.`;
  }
  function invalidateFrom(next, stage) {
    const chain = sequence(next);
    const start = chain.indexOf(stage);
    for (let i = start; i < chain.length; i++) {
      const key = chain[i];
      if (next.runs[key] || next.decisions[key]) next.stale[key] = true;
      if (i > start && next.decisions[key]) next.stale[key] = true;
    }
    if (next.firstAttempt) next.revisionStarted = true;
    next.current = start;
  }
  function placeBlock(state, stage, slot, id) {
    if (!state.mapConfirmed || !slots.includes(slot) || !block(stage, slot, id)) throw Error('Invalid block');
    const next = clone(state);
    if (next.slots[stage][slot] === id) return next;
    next.slots[stage][slot] = id;
    invalidateFrom(next, stage);
    return next;
  }
  function removeBlock(state, stage, slot) {
    if (!state.mapConfirmed || !slots.includes(slot)) throw Error('Invalid slot');
    const next = clone(state);
    if (next.slots[stage][slot] === null) return next;
    next.slots[stage][slot] = null;
    invalidateFrom(next, stage);
    return next;
  }
  function assemblePrompt(state, stage, allowIncomplete) {
    const config = state.slots[stage];
    if (!config || (!allowIncomplete && !slots.every(slot => config[slot]))) return null;
    const input = inputFor(state, stage);
    if (!input && !allowIncomplete) return null;
    const reference = sequence(state).indexOf(stage) > 0 ? `CURRENT SOURCE CARDS — ${sourceText()}\n\n` : '';
    const selected = slot => config[slot] ? block(stage, slot, config[slot]).text : '[Choose an option above]';
    return `INPUT — ${selected('input')}\n\nTASK — ${selected('task')}\n\nOUTPUT FORMAT — ${selected('format')}\n\nREVIEW CONDITION — ${selected('review')}\n\n${reference}SUPPLIED INPUT — ${input || '[Awaiting reviewed previous response]'}\n\nHANDOFF REVIEW — ${inputDetailsFor(state, stage)}`;
  }
  function promptFor(state, stage) { return assemblePrompt(state, stage, false); }
  function promptPreviewFor(state, stage) { return assemblePrompt(state, stage, true); }
  function sourceIds(text) {
    return [...new Set((text.match(/\b(?:REQ-01|AC-0[1-4])\b/g) || []))];
  }
  function responseFor(state, stage) {
    const c = state.slots[stage];
    const linked = c.format === 'linked';
    const ids = linked ? true : false;
    const ref = id => ids ? ` (${id})` : '';
    const input = inputFor(state, stage);
    const hasPrior = sequence(state).indexOf(stage) > 0;
    const inheritedPolicy = hasPrior && /12.character|12 characters/i.test(input);
    const inheritedMissing = hasPrior && !/old password/i.test(input);
    const lines = [];
    let flags = [];
    if (stage === 'extract') {
      lines.push(`Registered email → reset link${ref('REQ-01, AC-01')}.`);
      lines.push(`Link expires 30 minutes after issue${ref('AC-02')}; a used link cannot be reused${ref('AC-03')}.`);
      if (c.task === 'separate' && c.input === 'current') lines.push(`After reset, new password works and old password does not${ref('AC-04')}.`);
      else { lines.push('After reset, show a success confirmation.'); flags.push('missing-ac04'); }
      if (c.input === 'suggestion' || c.task === 'complete') { lines.push(`Enforce a 12-character minimum${ref('AC-04')}.`); flags.push('unsupported-policy'); }
      if (c.input === 'current' && c.task === 'separate') lines.push('Open: password policy, exact 30-minute boundary, unregistered email, rate limits, multiple links, sessions, delivery time.');
      else lines.push('Open: exact 30-minute boundary; other policy details treated as complete.');
      if (hasPrior) {
        lines.push('This extraction comes after an earlier task; review whether that earlier task relied on unextracted requirements.');
        flags.push('late-extraction');
        if (inheritedPolicy) { lines.push('The preceding handoff carried a 12-character claim; it still needs product-owner clarification.'); flags.push('inherited-policy'); }
        if (inheritedMissing) { lines.push(`The preceding handoff did not state the old-password outcome; check earlier decisions against the credential requirement${ref('AC-04')}.`); flags.push('inherited-omission'); }
      }
    } else if (stage === 'risk') {
      lines.push(`Replay of a successfully used link could permit unintended access${ref('AC-03')}.`);
      if (!inheritedMissing) lines.push(`Old password remaining valid or new password failing could undermine access control${ref('AC-04')}.`);
      else { lines.push('Credential outcome is unresolved because the reviewed input omitted the old-password condition.'); flags.push('missing-ac04'); }
      if (inheritedPolicy) {
        lines.push(c.input === 'shortcut' ? `A password under 12 characters creates a confirmed policy risk${ref('AC-04')}.` : 'The inherited 12-character claim needs product-owner clarification before it becomes an oracle.');
        flags.push('inherited-policy');
      }
      if (c.task === 'likelihood') { lines.push('Likelihood: high, based on the supplied material.'); flags.push('invented-likelihood'); }
      else lines.push('Impact may be high; likelihood is not measured here.');
      if (c.input === 'shortcut') flags.push('gap-shortcut');
    } else {
      lines.push(`Use a fresh valid link, complete reset, and inspect the observable result${ref('REQ-01, AC-01')}.`);
      if (c.task === 'oracles' && !inheritedMissing) lines.push(`In fresh unauthenticated sessions, new password authenticates and old password is rejected${ref('AC-04')}.`);
      else { lines.push('Success confirmation alone is the credential oracle.'); flags.push('weak-oracle'); }
      lines.push(`Attempt to reuse the successfully used link; it must fail${ref('AC-03')}.`);
      if (inheritedPolicy) {
        lines.push(c.input === 'shortcut' ? `Reject passwords shorter than 12 characters${ref('AC-04')}.` : 'Hold the inherited 12-character claim for clarification; no policy oracle yet.');
        flags.push('inherited-policy');
      }
      if (c.task === 'confirmation') flags.push('weak-oracle');
      if (c.input === 'shortcut') flags.push('gap-shortcut');
    }
    const text = linked
      ? lines.map(line => `- ${line}`).join('\n')
      : ['| # | Prepared response |', '| --- | --- |', ...lines.map((line, index) => `| ${index + 1} | ${line.replace(/\|/g, '\\|')} |`)].join('\n');
    if (!linked) flags.push('missing-links');
    if (c.review === 'readable') flags.push('weak-review');
    return { text, presentation: linked ? 'list' : 'table', items: lines, flags: [...new Set(flags)], sourceIds: sourceIds(text) };
  }
  function run(state, stage) {
    if (!state.mapConfirmed || sequence(state)[state.current] !== stage || !promptFor(state, stage)) throw Error('Complete the current prompt and its reviewed input before running.');
    const next = clone(state);
    invalidateFrom(next, stage);
    const response = responseFor(next, stage);
    const entry = { number: next.history.length + 1, stage, config: clone(next.slots[stage]), prompt: promptFor(next, stage), input: inputFor(next, stage), response, review: null };
    next.history.push(entry);
    next.runs[stage] = entry.number;
    next.decisions[stage] = null;
    next.stale[stage] = false;
    return next;
  }
  function decision(state, stage, kind, note) {
    if (!['pass', 'hold'].includes(kind) || sequence(state)[state.current] !== stage || !state.runs[stage] || state.stale[stage]) throw Error('Run the current prompt before review.');
    const trimmed = String(note || '').trim();
    const next = clone(state);
    const entry = next.history.find(item => item.number === next.runs[stage]);
    if (entry.review) throw Error('This run was already reviewed. Rerun to change it.');
    const payload = entry.response.text;
    entry.review = { kind, note: trimmed };
    next.decisions[stage] = { kind, note: trimmed, run: entry.number, payload, sourceIds: entry.response.sourceIds, gaps: entry.response.flags };
    next.stale[stage] = false;
    if (kind === 'hold' || next.current === 2) {
      if (!next.firstAttempt) next.firstAttempt = snapshot(next);
    }
    if (kind === 'pass' && next.current === 2 && !next.baseline && sequence(next).every(id => next.decisions[id]?.kind === 'pass' && !next.stale[id])) {
      next.baseline = snapshot(next);
    }
    return next;
  }
  function advance(state) {
    const stage = sequence(state)[state.current];
    if (state.current >= 2 || state.decisions[stage]?.kind !== 'pass' || state.stale[stage]) throw Error('Pass the current response as reviewed before continuing.');
    const next = clone(state); next.current++; return next;
  }
  function snapshot(state) {
    return {
      taskMap: state.taskMap.slice(),
      stages: sequence(state).map(stage => ({ stage, config: clone(state.slots[stage]), run: state.runs[stage], decision: clone(state.decisions[stage]), stale: state.stale[stage] })),
      status: status(state)
    };
  }
  function status(state) {
    if (!state.mapConfirmed) return 'Map the tasks';
    for (const stage of sequence(state)) {
      if (state.stale[stage]) return `Needs review from ${stages[stage].title}`;
      if (state.decisions[stage]?.kind === 'hold') return `Held at ${stages[stage].title}`;
      if (state.decisions[stage]?.kind !== 'pass') return `In progress: ${stages[stage].title}`;
    }
    const finalStage = sequence(state)[2];
    return finalStage === 'tests'
      ? 'Three-stage test proposal reviewed for handoff; human judgment still required'
      : `Three-stage chain reviewed. Final output: ${stages[finalStage].title}. Test ideas appeared earlier in the chain.`;
  }
  function comparison(state) {
    if (!state.baseline) return { phase: 'await-baseline' };
    const chain = sequence(state);
    const baselineStages = state.baseline.stages;
    const entryFor = run => state.history.find(item => item.number === run) || null;
    const changedIndex = chain.findIndex((id, index) => state.runs[id] !== baselineStages[index].run || slots.some(slot => state.slots[id][slot] !== baselineStages[index].config[slot]));
    const route = chain.map((id, index) => ({
      stage: id, baselineRun: baselineStages[index].run, currentRun: state.runs[id],
      state: state.stale[id] ? 'Needs review' : state.decisions[id]?.kind === 'pass' ? 'Passed as reviewed' : state.decisions[id]?.kind === 'hold' ? 'Held' : 'Not reviewed'
    }));
    if (changedIndex < 0) return { phase: 'baseline', route };
    const checkpointIndex = Math.min(changedIndex + 1, chain.length - 1);
    const checkpointStage = chain[checkpointIndex];
    const checkpointDecision = state.decisions[checkpointStage];
    const checkpointReady = Boolean(checkpointDecision && !state.stale[checkpointStage] && state.runs[checkpointStage] !== baselineStages[checkpointIndex].run);
    const fullReady = chain.every(id => state.decisions[id]?.kind === 'pass' && !state.stale[id]) && state.runs[chain.at(-1)] !== baselineStages.at(-1).run;
    const lastIndex = chain.length - 1;
    const pairFor = (scope, baselineRun, revisedRun) => {
      const vote = state.comparisonVotes[scope];
      return { baseline: entryFor(baselineRun), revised: entryFor(revisedRun), vote: vote?.baselineRun === baselineRun && vote?.revisedRun === revisedRun ? vote.choice : null };
    };
    return {
      phase: fullReady ? 'complete' : checkpointReady ? 'checkpoint' : 'in-progress', route,
      changedStage: chain[changedIndex], checkpointStage,
      checkpoint: checkpointReady ? pairFor('checkpoint', baselineStages[checkpointIndex].run, state.runs[checkpointStage]) : null,
      final: fullReady ? pairFor('final', baselineStages[lastIndex].run, state.runs[chain[lastIndex]]) : null
    };
  }
  function chooseComparison(state, scope, choice) {
    if (!['checkpoint', 'final'].includes(scope) || !['first', 'revised', 'neither', 'unclear'].includes(choice)) throw Error('Choose a valid comparison judgment.');
    const pair = comparison(state)[scope];
    if (!pair) throw Error('Review both responses before comparing them.');
    const next = clone(state);
    next.comparisonVotes[scope] = { baselineRun: pair.baseline.number, revisedRun: pair.revised.number, choice };
    return next;
  }
  function feedback(state, stage) {
    const runNumber = state.runs[stage];
    if (!runNumber) return [];
    const entry = state.history.find(item => item.number === runNumber);
    const result = [];
    if (entry.config.input === 'suggestion' || entry.config.task === 'complete') result.push('The prompt treated an unstated 12-character rule as approved. AC-04 does not define password length.');
    if (entry.response.flags.includes('inherited-policy')) result.push('The 12-character claim came from the reviewed upstream response. Carrying it does not make it an approved requirement.');
    if (entry.response.flags.includes('missing-ac04') || entry.response.flags.includes('weak-oracle')) result.push('A confirmation does not establish both AC-04 credential outcomes. Check new-password success and old-password rejection.');
    if (entry.response.flags.includes('invented-likelihood')) result.push('The supplied sources describe possible impact, not measured likelihood.');
    if (entry.response.flags.includes('missing-links')) result.push('This output omits source links, making the next review harder even if some claims are sound.');
    if (entry.response.flags.includes('gap-shortcut')) result.push('Treating gaps as complete policy can promote an inherited assumption into a test oracle.');
    if (entry.response.flags.includes('weak-review')) result.push('A readability check alone cannot catch an unsupported claim or a missing oracle.');
    if (entry.response.flags.includes('late-extraction')) result.push('Extraction after another task cannot retroactively ground that earlier work. Revisit the earlier stage if it depended on missing requirements.');
    if (entry.response.flags.includes('inherited-omission')) result.push('The earlier handoff omitted the old-password condition. This later extraction exposes that gap but does not revise the earlier decision.');
    if (stage === 'tests') result.push('Even a source-linked response from a careful prompt leaves AC-02 expiry checks outside this three-idea credential-protection proposal. Record that scope limit rather than calling the proposal complete coverage.');
    if (!result.length) result.push('The prompt asks for source-linked work, but its prepared response still needs review: source IDs do not prove every statement, and a polished answer is not validation.');
    if (entry.review?.kind === 'pass') result.push('Your exact reviewed response was passed onward, including any flaw or omission. An optional note is recorded for discussion but does not change the prepared response.');
    if (entry.review?.kind === 'hold') result.push('You stopped this handoff for clarification. No downstream response is current.');
    return result;
  }
  function record(state) {
    const lines = ['EXERCISE 4 · PROMPT CHAIN BUILDER', notice, '', 'Task map: ' + (state.taskMap.map(id => stages[id].title).join(' → ') || 'not complete'), 'Status: ' + status(state), ''];
    if (state.firstAttempt) lines.push('FIRST ATTEMPT: ' + JSON.stringify(state.firstAttempt, null, 2), '');
    const compare = comparison(state);
    if (state.baseline) {
      lines.push('FIRST COMPLETE CHAIN: ' + JSON.stringify(state.baseline, null, 2), 'COMPARISON STATUS: ' + compare.phase, '');
      if (compare.checkpoint) lines.push(`CHECKPOINT: ${stages[compare.checkpointStage].title}`, `First chain · Run ${compare.checkpoint.baseline.number}`, compare.checkpoint.baseline.response.text, `Revised chain · Run ${compare.checkpoint.revised.number}`, compare.checkpoint.revised.response.text, `Judgment: ${compare.checkpoint.vote || 'not recorded'}`, '');
      if (compare.final) lines.push(`FINAL OUTPUT: ${stages[sequence(state).at(-1)].title}`, `First chain · Run ${compare.final.baseline.number}`, compare.final.baseline.response.text, `Revised chain · Run ${compare.final.revised.number}`, compare.final.revised.response.text, `Judgment: ${compare.final.vote || 'not recorded'}`, '');
    }
    for (const stage of sequence(state)) {
      lines.push(stages[stage].title.toUpperCase() + (state.stale[stage] ? ' — NEEDS REVIEW' : ''));
      const current = state.history.find(item => item.number === state.runs[stage]);
      if (current) lines.push(`Run ${current.number}`, current.prompt, 'PREPARED RESPONSE', current.response.text, 'REVIEW: ' + (current.review ? `${current.review.kind} — ${current.review.note || 'no note'}` : 'not reviewed'), 'SOURCE IDS IN RESPONSE: ' + current.response.sourceIds.join(', '), '');
      else lines.push('No current run', '');
    }
    lines.push('RUN HISTORY');
    for (const entry of state.history) lines.push(`Run ${entry.number} · ${entry.stage} · ${entry.review ? `${entry.review.kind}: ${entry.review.note || 'no note'}` : 'not reviewed'}\n${entry.prompt}\n${entry.response.text}`);
    return lines.join('\n');
  }
  return { notice, sources, gaps, order, stages, slots, blocks, initialState, clone, sequence, moveTask, mapFeedback, confirmMap, inputFor, inputDetailsFor, placeBlock, removeBlock, promptFor, promptPreviewFor, responseFor, run, decision, advance, status, comparison, chooseComparison, feedback, record, sourceIds };
});
