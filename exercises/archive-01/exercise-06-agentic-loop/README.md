# Exercise 6 — Design, Test, and Revise an Agentic AI Loop

**Implemented; partially verified — 24 September 2026.** Timed learner/facilitator review, final acceptance, and hosted/package delivery remain pending.

Open `index.html` from Testing Lab or directly from a local copy. Preserve `shared/` and the full repository structure. There are no runtime dependencies, model connections, network calls, storage, or real tool executions.

## Participant flow

1. Read the compact handoff and expand supplied sources as needed. Write goal, controller input/output, state, tool contracts, hypotheses, recovery/endings, and approving/reviewing roles. Choose strategies and write rules for missing correlation, valid correlation, invalid evidence, and sufficient evidence. Peer/self-review before committing.
2. Propose an action from current observations. The simulator compares its action ID with the chosen rule; deviations require a recorded design gap. Free-text policies and reasons are **not executed or semantically graded**. A person must judge whether the actual decision follows the written policy.
3. Review the returned observation before it enters the ledger. Invalid evidence cannot be admitted even with a weak selected gate. Approval, budget, and evidence integrity are enforced independently of the student's proposed design.
4. End with a limited recommendation, escalation, or limit reached. At least two decisions are encouraged on the normal route; a justified early ending is valid.
5. Challenge an initial/trace checkpoint with missing or mismatched evidence. The separate counterfactual counts the substituted retrieval. Revise the invalid-evidence rule and describe its handoff consequence, then replay that decision without changing the original evidence, trace, or action count.
6. Record a final handoff and copy the full record before reset/reload. Changed handoff drafts are marked stale. Initial design and committed revision remain distinct.

The action cap is 1–5 (omitted defaults to five). Dispatched errors/repeats count; approvals and blocked requests do not. Two consecutive denied requests or no-progress results escalate. VALID-01 requires a mission-specific isolated-comparison approval; prior or mismatched approvals do not count. Production/failure-hiding actions are prohibited. No approval selection represents real authorization.

Prepared evidence is fictional. A green comparison does not establish a cause, a real fix, global health, or learner competence. All source data is bundled locally; reveal separation is a teaching convention, not a security boundary.

## Files and regeneration

- `model.js`: design options/explanations, immutable run transitions, independent controls, and counterfactual logic.
- `app.js`: forms, reveals, initial/revised records, copy fallback, stale draft, and reset.
- `styles.css`: local presentation; shared files unchanged.
- `build-pages.cjs`: generates `sources.js`, interactive page, script-free worksheet, separate evidence cards/feedback/examples, investigation template, and own-context canvas. Reads the parent scenario at **build time only**; runtime is self-contained.
- `verify.cjs`, `verify-browser.cjs`: model/content and Edge browser verification.

From the repository root:

```text
node exercises/archive-01/exercise-06-agentic-loop/build-pages.cjs
node exercises/archive-01/exercise-06-agentic-loop/build-pages.cjs --check
node exercises/archive-01/exercise-06-agentic-loop/verify.cjs
node exercises/archive-01/exercise-06-agentic-loop/verify-browser.cjs
```

Browser verification requires Playwright on the Node module path and installed Edge (`BROWSER_CHANNEL` may override `msedge`). Screenshots and a worksheet PDF go to the OS temporary directory, outside participant downloads.

## Verification record — 24 September 2026

- 648 strategy/budget/trace-variant combinations and 12 action/approval combinations passed. 3,530 bounded action-sequence transitions checked authority, retained evidence, counts, and recommendation invariants.
- Pending evidence must be reviewed before another dispatch, including the first observation at index zero. This edge case was found and fixed during verification.
- Completion audit also fixed counterfactual retrieval accounting, permission checks in replay, and stale challenge-input revision prevention. A distinct sufficient-evidence rule supports an explicit ending decision. Counterfactual production/failure-hiding actions and unapproved comparisons are blocked independently of the student's rule.
- Checked missing/mismatched/error outputs, denied/prior/wrong approval, repeat/no-progress escalation, premature completion, last-action completion, caps/default cap, early endings, immutable original history, separate counterfactual budget, and revised-rule replay.
- Selected strategy explanations are checked for relevant limitations; source text is generated directly from scenario sections. Generated-page parity, initial reveal exclusions, and relative asset/resource links pass. Written rationale quality still needs human review.
- Edge 153.0.4234.48 passed design commitment, normal trace/comparison/recommendation, scoped/prior approval, invalid evidence acceptance prevention, cap ending, counterfactual/revision history, handoff stale state, copy success/denial stubs, literal text, reset, native keyboard selection, 390px/720px reflow, direct-file use, home-to-Exercise-6 navigation, and no-JS offline fallback. No page errors or external requests observed.
- Desktop/mobile screenshots visually inspected; worksheet print-media export generated. These do not establish paginated print readability, actual OS clipboard behavior, or hosted operation.

## Remaining acceptance

Run a timed 28-minute learner trial, particularly the eight-minute design and three-minute challenge/revision. Review whether students can explain branch value, state handoffs, approval gates, recovery, and ending quality. The form's free text is checked for presence only. Check screen reader behavior, actual 200% zoom, broader browsers, actual clipboard permissions, paginated print readability, final facilitator acceptance, public deployment, and clean-extraction offline package delivery. The included transfer canvas is a usable draft; its separate ten-minute review and final acceptance remain pending.
