# Exercise 1: Prompt Lab

A guided prompt-builder simulation for a password-reset testing scenario.

## Run

Open `index.html` in a modern browser. No installation, build, backend, API key, or internet connection is required. All fonts and assets are local or system-provided.

Select controls to assemble the prompt, then choose **Run simulation**. Change selections and run again to compare the scores and response. **Reset** restores the weak starting prompt. **Copy** copies the assembled prompt; browsers that restrict clipboard access get a manual selection fallback.

## Suggested exercise

1. Run the starting prompt and inspect the unsupported password rule.
2. Add the requirement and acceptance criteria. Identify which test conditions now have support.
3. Add output structure, constraints and source references. Run again.
4. Try the earlier-release note, gap-filling, definitive-answer or summary-only choices. Inspect the changed response and feedback.
5. Select every checkbox: explain why this is weaker than a focused selection. Try the descriptive heading to identify a neutral choice.
6. Review the open questions and discuss why even a fully scored prompt does not guarantee complete or correct testing.

### Distractors and conflicting choices

Choices are presented with the same styling. Feedback appears after running. A descriptive heading is neutral and changes presentation without awarding points.

Harmful instructions override conflicting helpful instructions in this deterministic teaching model; this precedence is not a prediction of real AI behavior. Overridden selections lose their credit. Additional deductions, clamped at zero:

- Earlier-release expiry authority: Grounding −45, Hallucination Resistance −20. Uses a 15-minute expiry instead of current AC-02.
- Fill gaps as facts: Resistance −30; Clarity −20 if no-invention was also selected. Introduces the unsupported password rule.
- Hide caveats/questions: Resistance −20; Clarity −15 if assumptions or coverage were requested. Suppresses assumptions and questions.
- Summary only: Output Control −20; Clarity −15 if a table or references were requested. Removes table, references and coverage sections.

Selecting all choices scores 50 / 55 / 0 / 0. Selecting the focused helpful choices still scores 100 in each dimension.

## Simulation model

All output is deterministic and generated locally from selected controls. It is a teaching model, not a language model. Optional free text is included verbatim in the preview and copy output, but is not interpreted, executed or scored. Inputs are not persisted or transmitted.

Scores (0–100 each):

| Dimension | Fixed weights |
| --- | --- |
| Clarity | Role 20; specific task 50; functional scope 30 |
| Grounding | Requirement 40; acceptance criteria 60 |
| Output Control | Table 50; coverage/questions 25; references 25 |
| Hallucination Resistance | No invention 40; separate assumptions 30; references with a supplied source 30 |

Average score labels: below 40 Limited; 40–74 Developing; 75–100 Strong structure. Scores describe prompt structure only. The response uses supplied source selections, output options and constraints directly; it is not merely selected by an overall score. Roles receive equal credit. Role, task and scope affect clarity and feedback, not separate response templates.

The intentionally unsupported 12-character password rule appears without the no-invention constraint. The assumptions option moves it into a separate unverified proposal. The no-invention constraint removes it. Missing sources never receive fabricated source citations. Representative AC coverage is not exhaustive, and the exact 30-minute boundary remains an open question.

## Files

- `index.html` — semantic page and controls
- `styles.css` — responsive presentation, no external dependencies
- `app.js` — prompt assembly, scoring, simulation and UI
- `verify.cjs` — optional deterministic model checks (`node verify.cjs`)

## Repository delivery

This exercise lives at `exercises/exercise-01-prompt-lab/` within the tutorial repository. The planned root entry page will link here. Preserve this directory layout when deploying or packaging the complete tutorial, including any future `shared/` dependencies.

GitHub Pages is the intended hosting destination. Deployment and public access will be verified under Task 3; the repository's presence on GitHub does not imply GitHub Pages has been enabled. Keep internal links and assets document-relative, with no leading `/` or hardcoded repository prefix.

All asset paths are relative, so repository subpaths work. No environment variables or routing rewrites are needed.

## Extend

Edit the source constants, `buildPrompt` and `evaluate` in `app.js` to change the scenario or scoring. Keep source material in `index.html` in sync. Extend response rendering for additional behaviors. Participant text is inserted using `textContent`, never interpreted as HTML.
