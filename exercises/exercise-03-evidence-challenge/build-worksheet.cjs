'use strict';
const fs = require('node:fs');
const path = require('node:path');
const E = require('./evidence.js');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
function cards() {
  return E.sources.map(s => {
    let body = `<pre>${escape(s.text)}</pre>`;
    if (s.id === 'HIST-01') {
      const rows = s.text.split('\n').filter((_, i) => i !== 1).map(row => row.split('|').slice(1,-1).map(cell => cell.trim()));
      body = `<div class="table-wrap" tabindex="0" role="region" aria-label="History for runs 201 to 205"><table><caption>HIST-01 · Time since submission</caption><thead><tr>${rows[0].map(c => `<th scope="col">${escape(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row => `<tr>${row.map(c => `<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    return `<section class="source"><h3>${escape(s.id)} · ${escape(s.title)}</h3><p class="metadata">${escape(s.meta)}</p>${body}${s.note ? `<p class="source-note">${escape(s.note)}</p>` : ''}</section>`;
  }).join('\n') + `<details><summary>Current functional requirements — reference</summary><pre>${escape(E.requirements)}</pre><p class="source-note">The exact 30-minute boundary and password policy remain unspecified. Reset confirmation alone does not establish AC-04 authentication behavior.</p></details>`;
}
function page(title, body) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} · Evidence Challenge</title><link rel="icon" href="../../shared/favicon.ico"><link rel="stylesheet" href="../../shared/theme.css"><link rel="stylesheet" href="../../shared/styles.css"><link rel="stylesheet" href="styles.css"></head>
<body><header class="topbar"><a class="brand" href="../../index.html">Testing <span>Lab</span></a><a class="home-link" href="index.html">Evidence Challenge</a></header><main><div class="intro"><div class="eyebrow">EXERCISE 03 / OFFLINE MATERIAL</div><h1>${escape(title)}</h1><p>Fictional teaching evidence. No AI service or real CI execution. Keep the complete tutorial folder for offline use.</p></div>${body}<footer>From Prompts to Agentic Testing Workflows</footer></main></body></html>\n`;
}
function generated() {
  const fields = ['Observed facts (select above and cite IDs)', 'Initial claim decision: accept / reject / investigate. If rejecting, explain whether you reject the certainty or assert service health.', 'Decision rationale and provisional category', 'Preferred hypothesis and a distinct competing hypothesis', 'Supporting observations and source IDs for the hypotheses', 'Contradicting observations, or explicitly state that none are supplied and explain the gap', 'What future observation would weaken the preferred explanation?', 'Prior knowledge: have you already read TIM-01 in Exercise 2? Cite it if used.', 'One next action and the uncertainty it should resolve', 'Missing evidence', 'After committing: action status / source actually revealed (or pending)', 'Revised decision and explanation of what changed or why it stayed the same'];
  const worksheet = page('Sources and decision worksheet', `<section class="card"><h2>Claim: “${escape(E.claim)}”</h2><p>12 minutes: 2 instruction, 6 work, 3 review/debrief, 1 transition. Read the initial sources, record two hypotheses, and choose one next action. Record your answers on paper or in a local text document. Preserve the initial answer when revising.</p></section><section class="card">${cards().replace('<details>', '<details open>')}</section><section class="card"><h2>Which statements describe observed facts?</h2><ul>${Object.values(E.observations).map(t => `<li>□ ${escape(t)}</li>`).join('')}</ul><h2>Decision worksheet</h2><p>Categories: ${escape(Object.values(E.categories).join('; '))}.</p><p>Possible hypotheses: ${escape(Object.values(E.hypotheses).join(' / '))}.</p><p>Available actions: ${escape(Object.values(E.actions).join('; '))}.</p>${fields.map(t => `<div class="worksheet-field"><strong>${escape(t)}</strong></div>`).join('')}<p>Write the initial decision and action rationale before consulting the <a href="requested-evidence.html">separate request instructions/card</a>. Only TIM-01 can be revealed here. TRACE-01 stays pending for Exercise 6. A patch or rerun is only a proposal; nothing is executed.</p><p>After revising, compare with the <a href="worked-example.html">worked example</a>. Review the written reasoning with a peer or facilitator.</p><p>Debrief: What is observed? What remains a hypothesis? What could change your mind?</p></section>`);
  const request = page('Requested evidence', `<section class="card"><h2>Stop before opening the card</h2><p>First record your initial decision, two hypotheses, one next action, and its rationale on the <a href="worksheet.html">worksheet</a>. Choose one action per attempt. These separate files support facilitation; they are not an access-control system.</p><h3>If you requested TRACE-01</h3><p>Record: TRACE-01 pending for Exercise 6; no trace revealed. The correlated run 204 capture is reserved for the longer investigation. A justified pending request is a valid result.</p><h3>If you chose a patch or rerun</h3><p>Record your proposal only. No code change or CI run occurs. Explain which evidence should be read first and why the proposed action may be premature.</p><details><summary>If you requested TIM-01: open the timing contract</summary><h3>TIM-01 · Current integration contract v1</h3><p>${escape(E.timing)}</p><p>Product and test owners · Scenario v1.0. If you read this in Exercise 2, cite it as prior knowledge; it is not new independent evidence.</p></details><p>Revise your record without erasing the initial answer. Review it against the <a href="worked-example.html">worked example</a> after your attempt.</p></section>`);
  return { 'worksheet.html': worksheet, 'requested-evidence.html': request };
}
function build() {
  for (const [name, html] of Object.entries(generated())) fs.writeFileSync(path.join(__dirname, name), html);
  const index = path.join(__dirname, 'index.html');
  fs.writeFileSync(index, fs.readFileSync(index, 'utf8').replace(/<!-- SOURCES START -->[\s\S]*?<!-- SOURCES END -->/, '<!-- SOURCES START -->\n' + cards() + '\n<!-- SOURCES END -->'));
}
if (require.main === module) build();
module.exports = { cards, generated };
