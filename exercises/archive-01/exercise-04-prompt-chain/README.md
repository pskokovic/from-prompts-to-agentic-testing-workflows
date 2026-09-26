# Exercise 4 — Build a prompt-chain path

Version 3.1 — 23 September 2026. **Implemented and partially verified; final acceptance pending.** This is a fresh implementation after removal of the earlier complete-chain comparison. Previous version test counts are not evidence for this version.

Open `index.html` via Testing Lab or directly. Initial input contains authoritative requirements and known gaps only. Each stage offers three different outputs; the selected output changes later candidate text and structured state. Requirements/gaps → risks → tests → priorities → automation → expert review.

## Content and decision contract

The goal is a small credential-protection regression proposal, at most three test ideas, source-backed expectations, and explicit unconfirmed setup. Two locally defensible candidates offer trade-offs; one introduces or propagates a flaw. Under faulty input, defensible candidates explicitly challenge or contain the inherited fault.

- Requirement scope and policy assumptions affect risk options.
- Risk emphasis and inherited policy/proxy claims affect test options; full credential candidates explicitly correct unsupported input.
- Test oracles/coverage affect priority, setup/maintenance, and final review content.
- A conditional review returns unresolved defects instead of silently repairing them. Early stopping never reports readiness.
- Source/oracle defects, convenience-as-protection, assumed setup, and approval-by-completion cannot be offset by other features. No numerical score is used.
- Focused source-backed credential proposals with conditional setup fit this brief best. Broader three-test proposals are defensible with extra token/time-control effort. Equivalent paths can tie.

All observed cases are authored E4 fixtures, not actual tests. The cases discriminate full credential checks from confirmation-only and unsupported policy checks. They do not establish that token controls or the application were executed/validated. Free-text judgments are checked for presence, not meaning.

## Files

- `model.js`: requirements, authored transformations, option order, dependency state, profile and fixture outcomes, revision/snapshot rules.
- `app.js`, `styles.css`: stage selection, explicit inputs, path/revision UI, literal record rendering, copy/reset and local styles.
- `build-pages.cjs`: generates runtime shell, worksheet, script-free branching fallback, worked examples, and editable template from the same model.
- `fallback.html`: 1,457 anchored sections covering 364 intermediate paths, 729 complete paths, and 364 stop outcomes. Only the selected fragment is shown/printed; no JavaScript is required. Use `fallback.html#path-start`. This generated file is intentionally larger than the runtime.
- `worksheet.html`: source cards and blank record. A facilitator can print the current fallback branch for the learner's actual upstream path. Print the worksheet and selected branches rather than a universal fixed chain.
- `worked-example.html`, `workflow-template.md`: strongest-fit and broader alternative plus blank authoring template.
- `verify.cjs`, `verify-browser.cjs`: model/state/content and browser checks.

Run from the repository root:

```text
node exercises/archive-01/exercise-04-prompt-chain/build-pages.cjs
node exercises/archive-01/exercise-04-prompt-chain/verify.cjs
node exercises/archive-01/exercise-04-prompt-chain/verify-browser.cjs
```

`build-pages.cjs --check` detects stale generated content. Browser checks require Playwright on the Node module path and installed Edge (default `msedge`, overridable through `BROWSER_CHANNEL`). Runtime has no external dependencies. Keep `shared/` and all exercise files together for offline use.

## Verification performed — 22 September 2026

- All 729 complete paths, 364 early-stop states, and 4,374 upstream revision transitions checked. Model outcomes: 450 stopped for review, 243 needing correction, 18 strongest-fit, 18 defensible with trade-offs. These are configuration classifications, not effectiveness or competence measurements.
- Verified three distinct candidates per reachable stage; dependency changes; explicit inherited-fault correction; source and fixture-ID parity; non-compensable faults; equivalent-path ties; immutable first attempt and first completed path; invalidation of downstream choices/results.
- Generated fallback parity, all internal fragment/file links, and absence of consequence fixtures in initial runtime/worksheet HTML passed.
- Headless Edge 153.0.4234.48: flawed and reference paths, consequence differences, upstream revision, first-attempt preservation, idempotent review, whitespace/incomplete gates, explicit stop, reset, literal HTML-like text, clipboard success/denial mocks, and native radio keyboard navigation passed.
- Desktop initial and mobile stage layouts inspected. No horizontal overflow at 390px or 720px reflow; no unexpected HTTP requests or page errors. This is not actual 200% browser zoom or screen-reader validation.
- Script-free offline fallback followed the reference route and a policy/proxy branch with matching conditional text. Selected-branch print export (two pages) and the compact worksheet print export (two pages) were rendered for visual inspection. Other fallback routes and worked-example pagination have not all been visually inspected.
- Existing Exercise 1 (10,240), Exercise 2 (16,384), and Exercise 3 (2,160) logic checks passed. Home links 1–4 smoke-checked; shared styles unchanged.

## Explanation improvement — 23 September 2026

The earlier path tests verified rules and transitions, not every educational explanation. A review found that 243 confirmation-only paths incorrectly received the broader-token-coverage trade-off message. This branch is corrected: confirmation-only feedback now states that it misses credential faults and adds no replay/expiry coverage; unsupported policy checks are called out separately.

Results now include an explained overall assessment, explicit corrections made along the path, and an expandable explanation for every selected stage: selected output, source-based justification or flaw, benefit, limitation, downstream effect, later outcome, and when an alternative helps. These explanations are included in copied records, worked paths, and generated offline feedback. Earlier mistakes remain visible even if corrected later. Explanations appear after evaluation or an explicit stop, not as an advance answer key.

`node exercises/archive-01/exercise-04-prompt-chain/verify-explanations.cjs` checks all 729 complete and 364 stopped-path explanations, all 18 option types, the corrected 243 confirmation-only cases, state-dependent corrections, and assessment rationale. It checks explanation/state consistency and specific source/oracle expectations; it does not establish instructional effectiveness or automate judgment of prose quality. Existing 4,374 revision checks still pass.

Edge checks additionally cover stage-explanation expansion, corrected-mistake disclosure, copied explanation text, and matching script-free explanation content. Facilitator review of pedagogical validity, subtlety, and learner comprehension remains pending.

## Remaining acceptance

Timed participant trial (five minutes build, two observe, two revise); facilitator review of choice subtlety/fairness, ranking explanations, risk trade-offs and worksheet burden; actual clipboard permissions, screen reader, actual 200% zoom, wider browsers; complete print/release packaging review. Public hosting and clean-extraction offline bundle remain Task 3 gates.

No final learner/facilitator acceptance or production deployment is claimed. Source-code access can expose prepared answers; separation is a teaching convention, not a security boundary.
