# Exercise 3 — Evidence Challenge

Compact replacement, 26 September 2026. **Implemented and locally checked; timed learner/facilitator and delivery acceptance pending.** The earlier exercise is unchanged at `../archive-01/exercise-03-evidence-challenge/`; its verification is historical and does not apply here.

Open `index.html` directly or from Testing Lab. No account, backend, API key, model service, CI connection, or build is needed to participate. The exercise keeps state in page memory only. Reset or reload clears the attempt; copy the record to retain it. Keep the full tutorial folder, including `shared/`, for offline use.

## Participant flow

The exact claim is “The password-reset service is unstable”. It is labeled as a prepared, scripted AI-assistant conclusion for review, not a live model output. Participants check whether the supplied evidence supports it before accepting it or choosing a next action. A compact, source-labeled summary precedes expandable CI-01, CODE-01, and HIST-01 raw evidence. Participants select observed facts, an Accept/Reject/Investigate decision, a provisional category, two different hypotheses, and one next action. They write three brief statements: cited evidence and its limit; an observation that would weaken the preferred hypothesis; and what the action could resolve. The longer source analysis and worked investigation are deferred to feedback and take-home material.

The complete first answer is committed before requested evidence or substantive feedback appears. The initial snapshot records the evidence then available. One action/request is allowed per attempt: TIM-01 is revealed if explicitly requested; TRACE-01 remains pending for Exercise 6; a longer sleep or rerun remains a proposal, with no change or CI execution. Prior reading of TIM-01 in Exercise 2 can be declared separately. After feedback, participants write a short revision or explain why the judgment remains. The copyable record distinguishes the initial, current, and latest reviewed decisions; edits mark feedback stale.

The script-free [worksheet](worksheet.html) mirrors the compact summary and answer choices, with full raw evidence in a separate section. The [requested-evidence card](requested-evidence.html) and [worked example](worked-example.html) are separate so participants can make a first judgment before reading them. These are teaching reveal boundaries, not access controls. `build-worksheet.cjs` regenerates the committed worksheet, request card, and initial page source panels from `evidence.js`; this is a maintainer step only.

## Local verification — 26 September 2026

- `verify.cjs` passed 2,160 decision/category/hypothesis/action combinations, plus required-field, duplicate-hypothesis, qualified-rejection, weak-fact, one-action, initial-snapshot, TIM/TRACE boundary, prior-knowledge, source/worksheet parity, and relative-link checks. CI-01, CODE-01, HIST-01, requirements, and TIM-01 match the authoritative fictional scenario; source text and notes match the archive.
- JavaScript syntax checks passed for the model, page controller, and worksheet generator.
- `verify-browser.cjs` passed in installed Microsoft Edge 153.0.4234.48 via Playwright and direct `file:` access: home navigation, compact/expandable sources, keyboard selection, incomplete and complete commitment, duplicate hypotheses, TIM reveal and TRACE pending status, weak-choice feedback, revision/stale state, literal free text, copy, reset, 390/720px reflow, offline reload, and no-JavaScript worksheet/request/example navigation. No page errors or external HTTP requests were observed. Desktop, mobile, and continuous worksheet print-media screenshots were visually inspected.

Run from the repository root:

```text
node exercises/exercise-03-evidence-challenge/build-worksheet.cjs
node exercises/exercise-03-evidence-challenge/verify.cjs
node exercises/exercise-03-evidence-challenge/verify-browser.cjs
```

Playwright must be resolvable by Node for browser checks; set `BROWSER_CHANNEL=msedge` for installed Edge. Screenshots go to the OS temporary directory.

## Remaining acceptance

- Time the activity with learners and a facilitator against the 2-minute instruction, 6-minute work, 3-minute feedback/revision, 1-minute transition split. Check whether the summary helps without hiding the need to inspect raw sources, and whether the three statements are understood without coaching.
- Review path-specific explanations and written statements with a facilitator. Check actual clipboard permission behavior, paginated print readability, screen-reader and broader keyboard/browser use, and real 200% zoom as needed for the audience.
- Verify public GitHub Pages delivery and a clean-extraction offline package. Direct-file checks are not production acceptance.

This authored simulation checks selections and field presence. It does not establish a real service cause, validate a patch, semantically grade prose, or prove participant competence.
