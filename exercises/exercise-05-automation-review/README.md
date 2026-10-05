# Exercise 5 — Automation Review, Tools and Permissions

Compact replacement implemented on 28 September 2026. **Model and generated-page checks pass; sampled local browser interaction passes. Timed learner/facilitator, broader accessibility/browser, print, hosted, and clean offline-package acceptance remain pending.** The former simulator and its checks remain in `../archive-01/exercise-05-automation-review/`; those results do not validate this version.

Open `index.html` through Testing Lab or with the complete tutorial folder, including `shared/`. The exercise is a local authored simulation. It makes no AI, network, repository, test-run, or storage calls. Copy the review record before closing or reloading.

## Participant flow

1. Review the authored patch. For synchronization, credential checks, and unsupported password policy, a short relevant source excerpt sits beside the treatment choices. The full ACs, TIM-01, DATA-01, and CODE-01 are expandable. Choose a treatment for all three and give one brief source-based explanation.
2. Plan a delayed valid success with its expected outcome, then choose exactly two distinct deliberately faulty cases and an expected outcome/observation for each. The remaining fault cases, actual results, fixture/session evidence, diagnostics, and policy clarification appear as outstanding conditions after commitment. These cases are not executed.
3. Judge a **preassigned** action request and approval record. Choose allow, block, or defer and give a short reason. The action and approval are read-only; learners cannot choose a favorable scenario. Technical review, authority, and acceptance after validation remain separate. No action executes, even when the simulation says allowed.

The first review is preserved before prepared feedback. One revision may change treatments, validation cases, or the authority decision without erasing the first record. Written explanations are retained but not semantically graded; a facilitator or peer must review them.

## Assigning cards and offline delivery

The facilitator assigns neutral card A, B, or C to each participant or pair. Use `index.html?case=A`, `index.html?case=B`, or `index.html?case=C` for interactive delivery; a direct launch with no parameter receives A. The worksheet link on the interactive page follows the assigned card. For script-free or printed delivery, distribute `worksheet-A.html`, `worksheet-B.html`, or `worksheet-C.html` directly. `worksheet.html` is an alias for A. The participant page contains no selector for request or approval. Query parameters are a classroom distribution mechanism, not an authorization/security control.

The worksheet contains the same source excerpts, full source pack, patch, choices, and fixed card. `feedback.html` and `worked-example.html` are separate reveal material; open them only after the initial review. The private trainer guide stays outside this repository.

## Files and maintenance

- `review.js`: scenario sources, proposal, excerpts, choice cards, assigned authority records, pure assessment rules, and record formatting.
- `app.js`: three-stage UI, fixed card display, two-fault control, commitment, one revision, feedback, copy fallback, and reset.
- `build-pages.cjs`: generates the interactive page, assigned worksheets, separate feedback, worked alternatives, and editable template. Edit the model and generator rather than generated pages.
- `verify.cjs`: model combinations, source parity, generated-page reproducibility, relative links, and reveal boundaries.

Run from this folder:

```text
node build-pages.cjs
node verify.cjs
node --check review.js
node --check app.js
node --check build-pages.cjs
```

## Verification and remaining acceptance

The model check covers 11,664 review/validation/authority combinations, including all six two-fault pairs, three assigned cards, allow/block/defer decisions, outstanding-check calculation, source parity, generated content, and relative links. The `accepted after validation` state remains false because no validation runs. Sampled local HTTP browser interaction covered cards A/B/C, stage navigation, exactly-two-fault enforcement, outcome selection, first commitment, retained revision, changed fault choice, feedback/record updates, and reset. These are implementation checks, not evidence that students can finish in the timebox.

Before final acceptance, check copy and keyboard paths in a browser; inspect narrow/zoom and paginated print layouts; check script-free card variants and a clean offline package; verify hosted navigation; and time the 4/3/3 participant work and four-minute feedback/revision with learners and a facilitator. Review whether excerpts are easy to scan and free-text reasons are sound. Exercise 6 keeps TRACE-01, VALID-01, and the run-204 investigation; this exercise must not reveal them.
