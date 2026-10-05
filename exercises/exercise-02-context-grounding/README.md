# Exercise 2 — Context / Grounding

Replacement activity, 26 September 2026. **Implemented and locally checked; timed learner/facilitator and delivery acceptance pending.** The earlier Exercise 2 remains unchanged at `../archive-01/exercise-02-context-grounding/`. Its verification record is historical and does not apply here.

Open `index.html` directly or from Testing Lab. The activity runs locally in a browser with no backend, AI service, account, network call, or persistent storage. Keep the repository structure and `shared/` when packaging. Reset or reload clears the work; the context package can be copied after review.

## Participant activity

The fixed request is to derive reviewable functional password-reset tests. Seven compact cards show source ID, one-line purpose, owner, and status; each full source is expandable. Participants make seven Include/Exclude/Defer decisions, give two short reasons linked to different excluded/deferred sources, resolve the expiry conflict in one sentence, and select two distinct unresolved questions. Four listed questions describe genuine gaps; two plausible options are already answered by AC-02 or AC-03. One selected question may instead be free text.

Review requires all structural fields, then gives choice-specific consequences. It accepts more than one defensible source package. OLD-01 may be included as explicitly superseded history; TIM-01 may be deferred or included with its integration scope clear. The page does not semantically grade reasons, the expiry sentence, or a custom question. A partner or trainer must review those. Longer source-by-source rationale and one worked package appear only in feedback and the separate take-home example. One revision is encouraged.

The script-free [worksheet](worksheet.html) mirrors the short card faces and answer fields, with full text in a separate reference section. The [worked example](worked-example.html) is kept separate for use after the first attempt. `build-worksheet.cjs` regenerates the committed worksheet from `context.js`; this is a maintenance command, not a participant prerequisite.

## Local verification — 26 September 2026

- `node verify.cjs` passed 16,384 seven-source decision configurations; required-field, duplicate, invalidated-reason, custom-question, answered-question, history-only, scoped-timing, worksheet-parity, and relative-link checks.
- `node --check` passed for `context.js`, `app.js`, and `build-worksheet.cjs`.
- `verify-browser.cjs` passed in installed Microsoft Edge via Playwright, using direct `file:` access: home navigation, compact/expandable cards, keyboard selection, incomplete-answer validation, defensible and weak choices, question distractor and custom path, revision/stale feedback, history-only selection, literal free text, copy, reset, 390px reflow, offline reload, and no-JavaScript worksheet access. No page errors or external HTTP requests were observed. Desktop and mobile initial-state screenshots were visually inspected.

Run from the repository root:

```text
node exercises/exercise-02-context-grounding/build-worksheet.cjs
node exercises/exercise-02-context-grounding/verify.cjs
node exercises/exercise-02-context-grounding/verify-browser.cjs
```

Playwright must be resolvable by Node for the browser check; set `BROWSER_CHANNEL=msedge` to use installed Edge. The browser check writes screenshots to the OS temporary directory.

## Remaining acceptance

- Time a learner/facilitator run against the 2-minute instruction, 6-minute work, 3-minute feedback, 1-minute transition split. Observe whether participants understand the cards and two reason fields without coaching and inspect full text when needed.
- Review actual path-specific explanations and free-text responses with a facilitator; check keyboard/screen-reader use, print readability, actual clipboard permissions, and any audience browsers not covered by local checks.
- Verify the final GitHub Pages deployment and a clean-extraction offline package. A direct-file check does not prove delivery readiness.

Model and browser checks establish this local implementation's behavior, not the quality of participant reasoning, a real AI response, or complete test coverage.

## Expiry requirement versions

Participant materials show AC-02 in two releases: v0 specifies 15 minutes and v1 specifies 30 minutes. Release v1 is the current functional baseline. The historical source retains `OLD-01` as an internal key for decision logic and archived-source parity, but cards, reasons, feedback, exports, and worksheets use the visible label `AC-02 · Release v0`. Source wording and the exact-boundary gap remain unchanged.
