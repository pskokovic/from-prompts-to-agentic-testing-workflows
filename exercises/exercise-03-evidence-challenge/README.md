# Exercise 3 — Evidence Challenge

Version 1.0 implementation, 21 September 2026. **Implemented, partially verified; final acceptance pending.**

Open [index.html](index.html) directly or through a static web server. No installation, build, account, backend, API key, AI service, or CI connection is required. Retain the complete tutorial directory, including `../../shared/`, for offline use. Inputs and history live only in page memory; copy the decision record before reset/reload.

## Participant flow

Inspect CI-01, CODE-01, and HIST-01 → identify observations → choose a claim decision and provisional category → state two distinct hypotheses and evidence that supports or could weaken them → commit one next action → review and revise. Allow 12 minutes: 2 instruction, 6 work, 3 feedback/debrief, 1 transition.

The claim is “The password-reset service is unstable”. Prepared feedback checks modeled selections and field presence, not the meaning of participant prose. No overall score is shown. A peer or facilitator must judge written reasoning. Different evidence requests and provisional categories can be justified.

One committed action preserves the initial decision and its available evidence. TIM-01 can be revealed; TRACE-01 remains a pending request for Exercise 6. A longer sleep or unplanned rerun is recorded as a proposal only, never executed. Reset clears the attempt and its reveal. Prior reading of TIM-01 in Exercise 2 can be cited explicitly; it is not treated as a new reveal.

The copyable record separates initial, current, and latest reviewed decisions, committed action, source availability, pending evidence, and revision. Edits mark feedback stale. Participant text is rendered literally, never as HTML. Clipboard failure selects the record for manual copying.

## Offline and prepared materials

- [Source cards and blank worksheet](worksheet.html): script-free initial evidence, current requirement reference, and the same decision fields.
- [Requested evidence](requested-evidence.html): separate TIM-01 card and instructions for pending trace requests or proposed actions. Consult only after writing the initial decision and rationale.
- [Worked example](worked-example.html): one defensible investigation, qualified rejection and pending-request alternatives, and self-review prompts. Open after attempting the activity.

These are teaching boundaries, not security controls; all files are local. Fictional logs and history do not verify a real service, a patch, or this application.

## Maintenance

`evidence.js` contains scenario sources and pure decision/state/export functions. `app.js` handles controls and rendering. Shared theme/base/form CSS are unchanged; `styles.css` holds the local layout. `build-worksheet.cjs` generates the worksheet, request page, and initial source markup in `index.html` from the same data. The worked example is authored separately.

After editing sources, run from this directory:

```text
node build-worksheet.cjs
node verify.cjs
node --check app.js
node verify-browser.cjs
```

Browser checks require maintainer-provided Playwright. Set `BROWSER_CHANNEL=msedge` or `chrome` to use an installed browser; otherwise bundled Chromium is used. This is not a participant dependency. Screenshots are written to the OS temporary directory.

## Verification record — 21 September 2026

- `verify.cjs` passed 2,160 decision/category/hypothesis/action combinations, plus empty/incomplete attempts, duplicate hypotheses, qualified and unsupported rejection, all-observation concerns, ungraded free text, one-action enforcement, initial snapshot preservation, export boundaries, prior knowledge, generated-file parity, and relative links.
- Sources CI-01, CODE-01, HIST-01, current requirements, and TIM-01 were checked against the parent `tutorial-scenario.md` v1.0. This optional maintainer check reports when that file is absent from a standalone package.
- JavaScript syntax checks passed. Existing Exercise 1 and 2 verification scripts also passed 10,240 and 16,384 configurations respectively.
- `verify-browser.cjs` passed in installed Microsoft Edge 153.0.4234.48 through Playwright using direct-file access: home navigation and Exercise 1–2 entry points, empty and complete attempts, duplicate hypotheses, TIM-01 reveal, TRACE-01 pending status, initial-decision preservation, stale feedback/review/revision, wrong choices, reset, a keyboard selection path, and literal HTML-like text. No page errors or external HTTP requests occurred in the monitored interactive flow.
- Both clipboard branches passed with controlled browser stubs, including full-record selection on rejection. Actual OS clipboard permissions remain a manual check.
- Checked 390px layout and 720 CSS-pixel reflow (equivalent available width to 200% zoom at 1440px). Direct-file offline reload and JavaScript-disabled worksheet/request/example navigation passed.
- Desktop, reviewed, mobile, and worksheet print-media screenshots were visually inspected. These checks do not establish actual browser zoom behavior, printed pagination, a full accessibility audit, or participant usability.

## Remaining acceptance

- Timed participant trial: complete the two hypotheses, discriminator, justified request, and revision within the 12-minute slot without coaching. Assess whether the six-minute working period allows enough time for the written fields.
- Facilitator content review, including free-text reasoning, alternate defensible categories/requests, and the limited meaning of rejecting the claim; record an explicit acceptance decision.
- Manual actual-clipboard, 200% browser zoom, print pagination/readability, full keyboard/screen-reader, and additional supported-browser checks as appropriate for the audience.
- Task 3: public GitHub Pages and clean-extraction downloadable-bundle verification. A passing direct-file check is not a production or packaged-release acceptance result.
