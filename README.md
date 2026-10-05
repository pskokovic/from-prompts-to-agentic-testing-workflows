# From Prompts to Agentic Testing Workflows
Browser-based exercise simulator for practicing structured AI-assisted testing workflows.

## Project layout

Current layout:

```text
index.html                         # tutorial entry page
styles.css                         # entry-page-specific styles
shared/
  theme.css                        # shared colors and font family
  styles.css                       # base styles and reusable components
  forms.css                        # reusable exercise form controls
  README.md                        # usage and load order
exercises/
  exercise-01-prompt-lab/
    index.html
    app.js
    styles.css                     # exercise-specific layout and overrides
    verify.cjs
    README.md
  exercise-02-context-grounding/
    index.html                    # compact seven-source activity
    context.js                    # source and feedback model
    worksheet.html                # script-free fallback
    worked-example.html           # take-home rationale
    README.md
  exercise-03-evidence-challenge/
    index.html                    # compact evidence judgment
    evidence.js                   # sources, rules, and request state
    worksheet.html                # script-free fallback
    requested-evidence.html       # separate request card
    worked-example.html           # take-home rationale
    README.md
  exercise-04-prompt-chain-builder/
    index.html                    # active three-stage prompt-block builder
    model.js                      # prepared responses, review gate, handoff, revision state
    worksheet.html                # script-free block and decision record
    response-cards.html           # deterministic response construction cards
    worked-example.html           # separate feedback after an attempt
    README.md                     # verification and acceptance record
  exercise-05-automation-review/
    index.html                    # compact three-stage review
    review.js                    # sources, prepared cases, and authority model
    worksheet-A.html             # assigned script-free card A
    worksheet-B.html             # assigned script-free card B
    worksheet-C.html             # assigned script-free card C
    feedback.html                # reveal after initial review
    README.md                    # verification and remaining acceptance
  exercise-06-agentic-loop-builder/
    index.html
    model.js                       # workflow rules and outcomes
    sources.js                     # fictional evidence cards
    app.js
    worksheet.html
    README.md
  archive-01/
    exercise-02-context-grounding/
    exercise-03-evidence-challenge/
    exercise-04-prompt-chain/
    exercise-05-automation-review/
    exercise-06-agentic-loop/
  archive-02/
    exercise-04-prompt-chain/    # former compact six-stage choice-chain
```

Use `shared/styles.css` for common typography, colors, spacing, controls, cards, focus states, and responsive conventions. Keep page-specific layout in each page's stylesheet. Load `shared/theme.css` first, then `shared/styles.css`, optional `shared/forms.css`, and finally the local stylesheet. Active exercise pages use the `../../shared/` prefix; archived pages use `../../../shared/`. See [shared design guidance](shared/README.md) for usage. Use relative links so the same package can work under a repository URL path and offline.

The home page and active exercises share typography, colors, cards, controls, and focus styles extracted from Exercise 1. Keep the complete directory structure, including `shared/`, when copying or packaging the tutorial; an exercise folder alone no longer contains all required styles.

## Current state

Open `index.html` for the tutorial home page. Exercises 1–5 and the current Exercise 6 Loop Workshop are available. The previous Exercise 5 remains under `exercises/archive-01/`.

Exercise 1 remains implemented and partially verified. The replacement [Exercise 2 Context Lab](exercises/exercise-02-context-grounding/index.html) and [Exercise 3 Evidence Challenge](exercises/exercise-03-evidence-challenge/index.html) are implemented and locally checked; timed learner/facilitator and delivery acceptance remain pending. See their [Exercise 2](exercises/exercise-02-context-grounding/README.md) and [Exercise 3](exercises/exercise-03-evidence-challenge/README.md) verification records. The active [Exercise 4 Prompt Chain Builder](exercises/exercise-04-prompt-chain-builder/index.html) is implemented and model-checked; sampled browser interaction passed, while broader browser, offline-package, timed learner/facilitator, and delivery acceptance remain pending. It builds prompts from prepared blocks and propagates the exact reviewed response. See its [verification record](exercises/exercise-04-prompt-chain-builder/README.md). The current [Exercise 6 Loop Workshop](exercises/exercise-06-agentic-loop-builder/index.html) is locally verified; learner/facilitator and delivery acceptance remain pending. See its [verification record](exercises/exercise-06-agentic-loop-builder/README.md).

The active [Exercise 5 Automation Review](exercises/exercise-05-automation-review/index.html) is implemented and model-checked. It uses nearby source excerpts, one delayed valid success plus two chosen faulty cases, and a preassigned action/approval card. Sampled browser interaction passed; timed learner/facilitator, broader browser/accessibility, print, hosted, and clean offline-package acceptance remain pending. See its [verification record](exercises/exercise-05-automation-review/README.md).

The archived exercises preserve their previous implementations and verification records: [Exercise 2](exercises/archive-01/exercise-02-context-grounding/README.md), [Exercise 3](exercises/archive-01/exercise-03-evidence-challenge/README.md), [Exercise 4 version 3.1](exercises/archive-01/exercise-04-prompt-chain/README.md), [Exercise 5](exercises/archive-01/exercise-05-automation-review/README.md), and the earlier [Exercise 6](exercises/archive-01/exercise-06-agentic-loop/README.md) in `archive-01`; the [compact Exercise 4 choice-chain](exercises/archive-02/exercise-04-prompt-chain/README.md) is in `archive-02`. The earlier Exercise 6 is outside the current tutorial path.

GitHub Pages is the intended hosting destination. Deployment and public-access/offline verification belong to Task 3; the existence of a GitHub repository does not establish a deployed tutorial.

All internal navigation and asset references must be document-relative, without a leading `/` or a hardcoded host/repository prefix. Active exercises link home with `../../index.html`; archived exercises use `../../../index.html`. Keep `shared/` and the complete directory structure when publishing or packaging.

## License

This repository uses a dual-license model:

- Source code is licensed under the MIT License. See [LICENSE-CODE.md](LICENSE-CODE.md).
- Exercise content, scenarios, prompts, instructional text, explanations, examples, and training materials are licensed under Creative Commons Attribution 4.0 International. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

When using or adapting the exercise content, please credit:

Based on "AI-assisted testing exercise simulator" by Predrag Skoković, licensed under CC BY 4.0.
Original project: [from-prompts-to-agentic-testing-workflows](https://github.com/pskokovic/from-prompts-to-agentic-testing-workflows)
