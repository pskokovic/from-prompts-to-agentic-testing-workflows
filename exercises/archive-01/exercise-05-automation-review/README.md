# Exercise 5 — Automation Review, Tools and Permissions

**Implemented; partially verified — 23 September 2026.** Timed learner trial, facilitator acceptance, and release verification remain pending.

Open `index.html` through the tutorial home page or directly from a local copy. Keep `shared/` and the repository's directory structure. There are no runtime dependencies, network calls, model connections, storage, repository writes, or actual test executions.

## Participant flow

1. Review the prepared patch against CODE-01, current ACs, TIM-01, and DATA-01. Choose treatments for synchronization, credential assertions, and unsupported policy; justify them with source IDs.
2. Select validation conditions and their expected outcomes. Record evidence to retain. Five discriminating case types are offered alongside two plausible but insufficient packages.
3. Choose a requested action and a hypothetical approval record, name the reviewing role, and decide allow/block/defer with scope and prerequisites. Record a technical disposition and outstanding conditions.
4. Commit the initial review before feedback. Technical readiness and execution authority are assessed independently. Preserve the initial record, revise once, and copy the complete record before reset/reload.

The approval selector defines a hypothetical workshop situation, not real authority. Matching scoped approval never compensates for a faulty correction. No request can access production under the workshop policy. “Allowed in simulation” records a decision only; it neither applies a patch nor reveals an execution result. The activity cannot award acceptance after validation or establish the cause of run 204. Written rationale is checked for presence only and needs human review.

## Files and maintenance

- `review.js`: fictional sources, proposal, options, explanations, pure validation/permission rules, and record formatting; CommonJS and browser compatible.
- `app.js`: three-part UI, commitment, one revision, stale-feedback indication, safe text rendering, copy fallback, and reset.
- `styles.css`: local layout, mobile/reflow, and print styling; shared styles unchanged.
- `build-pages.cjs`: generates `index.html`, `worksheet.html`, `feedback.html`, `worked-example.html`, and `workflow-template.md` from the same content model. Edit the model/generator rather than generated pages.
- `verify.cjs`, `verify-browser.cjs`: model/content and Edge browser checks.

Run from the repository root:

```text
node exercises/archive-01/exercise-05-automation-review/build-pages.cjs
node exercises/archive-01/exercise-05-automation-review/build-pages.cjs --check
node exercises/archive-01/exercise-05-automation-review/verify.cjs
node exercises/archive-01/exercise-05-automation-review/verify-browser.cjs
```

Browser verification requires Playwright on the Node module path and installed Microsoft Edge; default channel is `msedge`, overridable with `BROWSER_CHANNEL`. The script writes screenshots and a worksheet PDF to the OS temporary directory, outside participant materials.

## Verification performed

- 3,456 correction/validation combinations checked. Two meet the modeled full technical package (remove or defer the unsupported policy oracle); other choices can still lead to a justified unresolved stop. These counts do not measure learner competence or instructional effectiveness.
- 216 authority combinations checked across requests, approval scope, allow/block/defer decisions, review/partial/stop dispositions, and sound/flawed credential corrections. Authority cannot compensate for technical gaps; technical quality cannot grant authority; production remains prohibited.
- Exact TIM-01, DATA-01, CODE-01 and current requirement parity checked against the parent scenario. Generated pages are current; fallback choices and relative links checked. No mission trace or controlled-comparison payload is supplied.
- Edge 153.0.4234.48: empty initial state, incomplete submission and warning cleanup on edit, correction and one-revision flow, first-record preservation, stale feedback, literal HTML-like input, clipboard success/denial stubs, reset, native radio keyboard interaction, mismatched approval, production denial, and deferred stop passed. Home navigation to Exercises 1–5 passed; Exercise 6 remains disabled. No page errors or external HTTP requests observed.
- Direct-file offline runtime and JavaScript-disabled worksheet → feedback → worked-alternative navigation passed. Desktop, 390px mobile, and 720px reflow checked. Desktop/mobile screenshots and a continuous print-media worksheet screenshot inspected; worksheet PDF exported. This does not establish paginated print readability or actual 200% browser zoom.

## Remaining acceptance

Timed 17-minute participant trial (including ten minutes work and four minutes feedback/revision); facilitator review of distractor subtlety, rationale quality, trade-offs, and reading burden; actual OS clipboard permissions; screen reader and broader browser/accessibility checks; actual zoom; paginated worksheet and worked-example print review; final facilitator acceptance; hosted and clean-extraction offline package verification.

Prepared feedback is separate from the initial worksheet. Source-code access or following feedback links can expose answers; this is a teaching convention, not a security boundary. Private trainer notes remain outside this repository and participant downloads.
