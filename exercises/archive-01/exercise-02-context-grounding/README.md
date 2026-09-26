# Exercise 2 — Context / Grounding

Version 1.0 implementation, 20 September 2026. **Implemented, partially verified; final acceptance pending.**

Open `index.html` directly or through a static web server. No backend, API keys, model service, dependency install, or build is required to participate. The page uses `../../../shared/`; retain the complete tutorial directory when copying it. Inputs and first-review history live only in page memory and disappear on reset/reload. Copy the package to retain work.

## Participant flow

Read the fixed functional-test request → classify seven source cards → add two exclusion/defer rationales → resolve expiry and record two questions → review → revise and explain. Allow 12 minutes: 2 instruction, 6 work, 3 feedback/debrief, 1 transition. The optional external-AI comparison replaces the prepared-response comparison.

Selections drive deterministic feedback and representative supported test conditions. Free text is copied verbatim, checked only for presence where required, and never interpreted or scored. No overall score is shown. The original reviewed package remains available for comparison; later edits mark feedback stale until reviewed again.

`context.js` holds the authored scenario sources and review rules. Requirements and ACs preserve scenario v1.0. Distractors include superseded expiry, an unrelated export issue, and an unreviewed policy suggestion. TIM-01 and CI-01 are legitimate later-stage evidence whose role differs from functional requirements. History-only OLD-01 inclusion is accepted; TIM-01 inclusion prompts scope review rather than categorical rejection. The worked example is one defensible package, not a single answer key.

## Offline / no-JavaScript fallback

Use [source cards and worksheet](worksheet.html), recording decisions on paper or in a local text document. Compare with the separate [worked example and facilitator guidance](worked-example.html) after the first attempt. These files contain all source text without scripts or network requests. They preserve the same decisions, output, revision and debrief as the interactive page.

The worksheet is committed HTML generated from the same source data. After changing sources, run `node build-worksheet.cjs`, then `node verify.cjs`. This is a maintenance step, never a participant prerequisite.

## Verification record — 20 September 2026

- `node verify.cjs` passed all 16,384 combinations of the seven source decisions, plus explicit valid/minimal, empty, all-included, historical-authority, historical-only, unsupported-policy and irrelevant-source cases. Checks also cover copied source boundaries, source parity in the worksheet, and relative file links.
- `node --check app.js` passed.
- `verify-browser.cjs` passed in installed Microsoft Edge (Chromium), using Playwright and direct `file:` access: home navigation, all controls, a keyboard selection/rationale path, empty and sound packages, revisions/stale feedback, first-review comparison, historical variants, all-source concerns, literal rendering of HTML-like free text, reset, 390px layout, offline reload, fallback navigation, and JavaScript-disabled worksheet access. No external HTTP requests or page errors occurred.
- Clipboard success and rejection paths were tested with a controlled browser clipboard stub; rejection selected the full package for manual copying. Actual OS clipboard permission behaviour still needs a manual check.
- Desktop (1440px) and mobile (390px) full-page screenshots were visually inspected for the initial builder layout. This is not a full accessibility audit or participant usability trial.

To repeat browser checks, make Playwright available to Node and run `node verify-browser.cjs`. Set `BROWSER_CHANNEL=msedge` or `chrome` to use an installed browser; otherwise the script uses Playwright's bundled Chromium. Screenshots go to the OS temporary directory, not the repository. Local verification used bundled dependencies without adding runtime packages to this project.

## Remaining acceptance

- Timed participant trial: instructions understood without coaching, meaningful rationales/questions, one revision, completion within 12 minutes.
- Facilitator review of feedback wording and alternative justified packages; explicit acceptance decision.
- Manual OS clipboard check, wider browser/accessibility checks as required for the audience, and printed worksheet readability check.
- Task 3: public GitHub Pages checks and clean-extraction offline bundle verification. Direct-file offline checks do not establish deployment or packaged-release readiness.

Do not treat source selection feedback as proof of correct tests, complete coverage, real AI performance, or participant competence.
