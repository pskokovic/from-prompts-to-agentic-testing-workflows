'use strict';
// Maintenance only: publish the definitions from the tutorial's source glossary.
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'tutorial-glossary.md'), 'utf8');
const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
const groups = [
  {source: 'The concept ladder', id: 'ai-workflows', title: 'AI and workflow concepts', entries: []},
  {source: 'Provider terminology alignment', id: 'tools-controls', title: 'Tools, controls, and handoffs', entries: []},
  {source: 'Testing concepts used in the exercises', id: 'testing', title: 'Testing concepts', entries: []},
  {source: 'What an LLM is', id: 'claims', title: 'Claims and uncertainty', entries: []}
];
let group;
for (const line of source.split(/\r?\n/)) {
  if (line.startsWith('## ')) group = groups.find(g => line.slice(3).startsWith(g.source));
  if (!group) continue;
  if (line.startsWith('| ') && !/^\| (Term|---)/.test(line)) {
    group.entries.push(line.split('|').slice(1, -1).map(s => s.trim()));
  }
  const definition = line.match(/^- \*\*([^*]+):\*\* (.+)$/);
  if (definition) group.entries.push([definition[1], definition[2]]);
}
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const count = groups.reduce((n, g) => n + g.entries.length, 0);
const contents = groups.map(g => `<a href="#${g.id}">${g.title}</a>`).join('\n');
const sections = groups.map(g => `<section class="glossary-section" aria-labelledby="${g.id}">
<h2 id="${g.id}">${g.title}</h2><div class="term-grid">${g.entries.map(([term, definition, example, analogy]) => `<article class="term-card" aria-labelledby="${slug(term)}">
<h3 id="${slug(term)}">${inline(term)}</h3><p>${inline(definition)}</p>${example ? `<p class="term-example"><strong>Testing example</strong>${inline(example)}</p>` : ''}${analogy ? `<details><summary>Kitchen analogy</summary><p>${inline(analogy)}</p></details>` : ''}</article>`).join('\n')}</div></section>`).join('\n');
fs.writeFileSync(path.join(__dirname, 'glossary.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Definitions, testing examples, and kitchen analogies for AI-assisted and agentic testing workflows.">
<title>Glossary · Testing Lab</title><link rel="icon" href="shared/favicon.ico"><link rel="stylesheet" href="shared/theme.css"><link rel="stylesheet" href="shared/styles.css"><link rel="stylesheet" href="shared/navigation.css"><link rel="stylesheet" href="glossary.css"></head>
<body><a class="skip-link" href="#glossary">Skip to glossary</a>
<header class="topbar page-header"><div class="header-heading"><a class="home-icon" href="index.html" aria-label="Home" title="Home"><img src="shared/home.svg" alt="" width="24" height="24"></a><span class="page-title">Glossary</span></div><nav class="exercise-nav" aria-label="Tutorial navigation"><a class="home-link requirements-link" href="requirements.html">All requirements</a><a class="home-link glossary-link" href="glossary.html" aria-current="page">Glossary</a><div class="header-actions"><span class="badge">SEETEST 2026 / TUTORIAL<span class="header-page-label">GLOSSARY</span></span></div></nav></header>
<main><section class="intro"><div class="eyebrow">SHARED TUTORIAL REFERENCE</div><h1 id="glossary" tabindex="-1">Glossary</h1><p>AI is useful in testing when we design the work around evidence and human judgment. Use these ${count} entries to revisit the terms used throughout the tutorial.</p><p>Definitions and examples from the tutorial glossary. Provider labels and implementations may differ; the loop descriptions are teaching summaries.</p></section>
<nav class="glossary-contents" aria-label="Glossary sections">${contents}</nav>
${sections}
<footer>From Prompts to Agentic Testing Workflows <span>Evidence · Judgment · Review</span></footer></main></body></html>\n`);
console.log(`Built glossary.html with ${count} entries.`);
