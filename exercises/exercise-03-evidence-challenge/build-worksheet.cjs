'use strict';
// Maintenance only: regenerate the committed script-free material and source panels.
const fs = require('node:fs');
const path = require('node:path');
const E = require('./evidence.js');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
function rawBody(source) {
  if (source.id !== 'HIST-01') return `<pre>${escape(source.text)}</pre>${source.note ? `<p class="source-note">${escape(source.note)}</p>` : ''}`;
  const rows = source.text.split('\n').filter((_, i) => i !== 1).map(row => row.split('|').slice(1, -1).map(cell => cell.trim()));
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="History for runs 201 to 205"><table><caption>HIST-01 · Time since submission</caption><thead><tr>${rows[0].map(c => `<th scope="col">${escape(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row => `<tr>${row.map(c => `<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="source-note">${escape(source.note)}</p>`;
}
function summaryCards() {
  return `<div class="summary-grid">${E.sources.map(s => `<section class="summary-card"><h3>${escape(s.id)} · ${escape(s.title)}</h3><p>${escape(E.summaries[s.id])}</p><p class="metadata">${escape(s.meta)}</p></section>`).join('')}</div>`;
}
function rawCards(expandable = true) {
  return E.sources.map(s => expandable
    ? `<details class="source"><summary>${escape(s.id)} · Read the complete ${escape(s.title.toLowerCase())}</summary><p class="metadata">${escape(s.meta)}</p>${rawBody(s)}</details>`
    : `<section class="source"><h3>${escape(s.id)} · ${escape(s.title)}</h3><p class="metadata">${escape(s.meta)}</p>${rawBody(s)}</section>`).join('\n');
}
function cards() {
  return summaryCards() + `<h3 class="raw-title">Complete source evidence</h3><p class="field-note">Open any source to verify exact wording, timing, and provenance.</p>` + rawCards() + `<details class="source"><summary>Current functional requirements — reference</summary><pre>${escape(E.requirements)}</pre><p class="source-note">The exact 30-minute boundary and password policy remain unspecified. Reset confirmation alone does not establish AC-04 authentication behavior.</p></details>`;
}
function page(title, body) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>E3 · ${escape(title)}</title><link rel="icon" href="../../shared/favicon.ico" sizes="any"><link rel="stylesheet" href="../../shared/theme.css"><link rel="stylesheet" href="../../shared/styles.css"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="../../shared/navigation.css"></head>
<body><header class="topbar page-header"><div class="header-heading"><a class="home-icon" href="../../index.html" aria-label="Home" title="Home"><img src="../../shared/home.svg" alt="" width="24" height="24"></a><span class="page-title">${escape(title)}</span></div><nav class="exercise-nav" aria-label="Tutorial navigation"><a class="home-link" href="index.html">Back to exercise</a><a class="home-link requirements-link" href="../../requirements.html">All requirements</a><a class="home-link glossary-link" href="../../glossary.html">Glossary</a><div class="header-actions"><span class="badge">SEETEST 2026 / TUTORIAL<span class="header-page-label">EXERCISE 03</span></span></div></nav></header><main><div class="intro"><div class="eyebrow">EXERCISE 03 / OFFLINE MATERIAL</div><h1>${escape(title)}</h1><p>Fictional teaching evidence. No AI service or real CI execution.</p></div>${body}<footer>Observation → hypothesis → evidence request</footer></main></body></html>\n`;
}
function choices(values) { return `<ul class="choice-list">${Object.values(values).map(v => `<li>□ ${escape(v)}</li>`).join('')}</ul>`; }
function field(label) { return `<div class="worksheet-field"><strong>${escape(label)}</strong></div>`; }
function generated() {
  const worksheet = page('Sources and decision worksheet', `<section class="card"><h2>Prepared AI-assistant conclusion for review</h2><blockquote>“${escape(E.claim)}”</blockquote><p>This is a scripted example, not a live AI output. Check whether the supplied evidence supports the claim. Aim to complete your initial decision in six minutes. First use the summary; inspect complete sources when needed. Keep your first answer visible when revising.</p>${summaryCards()}</section><section class="card"><h2>Structured choices</h2><h3>Observed facts (select at least one; some options are interpretations)</h3>${choices(E.observations)}<h3>Claim decision</h3>${choices(E.decisions)}<p>If rejecting: □ Claim not established &nbsp; □ Service is healthy</p><h3>Provisional category</h3>${choices(E.categories)}<h3>Preferred hypothesis</h3>${choices(E.hypotheses)}<h3>Different competing hypothesis</h3>${choices(E.hypotheses)}${field('If other, describe it briefly:')}<h3>One next action</h3>${choices(E.actions)}<p>□ I already read TIM-01 in Exercise 2; cite it as prior knowledge.</p><h2>Three brief statements</h2>${field('1. What does cited evidence show, and what does it not establish?')}${field('2. What future observation would weaken the preferred hypothesis?')}${field('3. What uncertainty would the chosen action resolve?')}<p><strong>Commit the initial answer here:</strong> ____________________</p><p>Only after commitment, consult the <a href="requested-evidence.html">separate request card</a>. TRACE-01 stays pending for Exercise 6; no patch or rerun executes.</p>${field('After feedback: what changed, or why does the judgment remain?')}<p>Compare with the <a href="worked-example.html">worked example</a> after your own attempt.</p></section><section class="card"><h2>Complete source evidence</h2><p>These are the three sources summarized above. Verify exact facts and provenance here.</p>${rawCards(false)}<h3>Current functional requirements — reference</h3><pre>${escape(E.requirements)}</pre></section>`);
  const request = page('Requested evidence', `<section class="card"><h2>Stop before opening the card</h2><p>First record the observed facts, claim decision, category, two different hypotheses, three brief statements, and one next action on the <a href="worksheet.html">worksheet</a>. Only one request/action is committed per attempt. These separate files support facilitation; they are not access controls.</p><h3>If you requested TRACE-01</h3><p>Record: TRACE-01 pending for Exercise 6; no trace revealed. The correlated run 204 capture is reserved for the longer investigation.</p><h3>If you chose a patch or rerun</h3><p>Record a proposal only. No code change or CI run occurs. Explain what evidence should be read first.</p><details><summary>If you requested TIM-01: open the timing contract</summary><h3>TIM-01 · Current integration contract v1</h3><p>${escape(E.timing)}</p><p>Product and test owners · Scenario v1.0. If already read in Exercise 2, cite it as prior knowledge rather than a new independent reveal.</p></details><p>Revise your judgment without erasing the first answer. Then consult the <a href="worked-example.html">worked example</a>.</p></section>`);
  return { 'worksheet.html': worksheet, 'requested-evidence.html': request };
}
function build() {
  for (const [name, html] of Object.entries(generated())) fs.writeFileSync(path.join(__dirname, name), html);
  const index = path.join(__dirname, 'index.html');
  fs.writeFileSync(index, fs.readFileSync(index, 'utf8').replace(/<!-- SOURCES START -->[\s\S]*?<!-- SOURCES END -->/, '<!-- SOURCES START -->\n' + cards() + '\n<!-- SOURCES END -->'));
}
if (require.main === module) build();
module.exports = { cards, generated };
