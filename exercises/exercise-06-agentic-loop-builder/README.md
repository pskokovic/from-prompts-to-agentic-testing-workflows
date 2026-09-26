# Exercise 6 — Loop Workshop

**Batch triage implemented and locally verified; learner acceptance pending — 25 September 2026.** The current Exercise 6 triages password-reset runs 204, 208 and 209. The earlier single-run Exercise 6 is retained under `../archive-01/exercise-06-agentic-loop/`.

Open `index.html` directly or from Testing Lab. One page, local HTML/CSS/JavaScript; no backend, dependencies, account, AI connection, persistent storage, or real tool calls. Keep the shared theme/favicon directory when packaging.

## Interaction and teaching model

- Shuffled library of 15 blocks: 11 essential capabilities, one optional annotation, and three plausible weak actions. Shuffle affects only unused blocks; reset starts a new attempt history.
- Native drag-and-drop inserts blocks into explicit gaps, reorders them, or returns them to the bank. Add / up / down / return controls support keyboard and touch users without dragging.
- Dependency checks allow all six orderings of the independent setup blocks. Required reviewed handoffs must precede their consumers; optional context belongs before the ending decision. This is a bounded teaching model, not a universal agent architecture validator.
- Students configure action policy, evidence admission, completion threshold, invalid-evidence response, authority, budget, and continue target. A visible return connector retains per-run workflow state and the shared budget while returning to assessment.
- Runtime triages runs 204, 208 and 209 under either priority policy; missing/mismatched capture and unavailable-approval variants affect run 204. A structural/control fault highlights the broken block, dims its dependents, and explains the consequence and repair. Physical card movement is illustrative; no real system fails.
- Recommendation-ready, escalation, and limit-reached are valid controlled outcomes. Every result retains per-run classifications, evidence, uncertainties and next owners; uninvestigated cases remain explicit. A passing comparison never verifies a real fix or global service health. Different evidence thresholds and invalid-evidence policies have different costs and valid endings.
- First and subsequent attempts remain in the copied record with their design/configuration/results. Changes mark displayed feedback stale. Copy failure exposes a selectable text record. Reset/reload clears in-memory work.
- Written reviewer/rationale/reflection fields need human review; they are not semantically graded. The assessment is about modeled design choices, not student competence or live AI behavior.

The version-context card only annotates already obtained metadata; these short routes do not fetch CHANGE-01. Its absence stays explicit. Mission-only cards are displayed on their corresponding simulated action. Bundled source text is inspectable; reveal separation is a teaching convention, not a security boundary.

## Files and checks

`model.js` holds block contracts, dependency checks, scenario transitions, and explanations. `app.js` handles the page and interaction. `sources.js` preserves every original Exercise 6 evidence card and adds BATCH-01, BATCH-APPROVAL, TRACE-208 and TRACE-209; original card content is checked for parity. `build-worksheet.cjs` generates the script-free `worksheet.html` with shuffled printable cards, rules, separate result reveals, and feedback. No build step is needed to use the activity.

From the repository root:

```text
node exercises/exercise-06-agentic-loop-builder/build-worksheet.cjs
node exercises/exercise-06-agentic-loop-builder/verify.cjs
node exercises/exercise-06-agentic-loop-builder/verify-browser.cjs
```

Playwright must be on the Node module path; browser checks use installed Edge by default (`BROWSER_CHANNEL` can override). Screenshots/PDF export go to the OS temporary directory.

## Verification — 24 September 2026

- All six setup orders, missing essential blocks, unsafe cards, guard/execution order, optional context, return paths, source parity, and worksheet/link consistency checked.
- Configuration/scenario matrix checks evidence, authority, budgets, safe endings, and explanations. Exact counts are emitted by `verify.cjs`; these are simulator checks, not proof of educational effectiveness.
- Edge 153.0.4234.48: real native drag add/reorder/return, keyboard reordering, touch-friendly add controls, collapse highlighting, corrected loop, four-situation suite, budget stop, immutable attempt history, stale feedback, copy success/denial stubs, literal text, reset, 390px reflow, no-JS/offline worksheet, and PDF print export passed. No page errors or external requests observed.
- Desktop workbench, populated canvas, collapse feedback, and mobile screenshots inspected. A stuck drag-target highlight found during visual review was corrected.

## Remaining acceptance

Terminology alignment on 25 September renamed the block labels and Section 03 to match the tutorial glossary and shared provider concepts. See [terminology and official references](terminology.md). The worksheet uses the same names. The eleven-block decomposition, specific return target, and visual failure feedback are explicitly exercise-specific. The subsequent batch-triage extension adds new cases and outcome rules as described below.

Timed learner/facilitator trial, clarity of distractors and causal explanations, real touch-device dragging (use buttons where native drag is unsupported), screen reader testing, actual clipboard permissions, actual 200% zoom, broader browsers, paginated print inspection, deployed access, and clean-extraction package verification. The activity occupies the existing 28-minute final-mission slot.

## Batch triage verification — 25 September 2026

The exercise now includes a three-run queue, two adaptive priority policies, per-run reports, shared execution budget, and run-specific escalation. Model coverage includes 31,680 configuration/scenario cases, priority order at budget one, partial reports, continued work after gaps, request receipt handling, approval denial without execution, and comparison evidence isolation. The printable worksheet and private trainer notes describe matching routes and costs. Human instructional acceptance remains pending. Earlier single-run verification above is historical.
