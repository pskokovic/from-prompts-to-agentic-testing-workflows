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
```

Use `shared/styles.css` for common typography, colors, spacing, controls, cards, focus states, and responsive conventions. Keep page-specific layout in each page's stylesheet. Load `shared/theme.css` first, then `shared/styles.css`, optional `shared/forms.css`, and finally the local stylesheet. Exercise pages use the `../../shared/` prefix. See [shared design guidance](shared/README.md) for usage. Use relative links so the same package can work under a repository URL path and offline.

The home page and Exercise 1 share typography, colors, cards, controls, and focus styles extracted from Exercise 1. Keep the complete directory structure, including `shared/`, when copying or packaging the tutorial; the exercise folder alone no longer contains all required styles.

## Current state

Open the root `index.html` for the tutorial home page. It links to Exercise 1 (Prompt Lab) and shows disabled Open exercise buttons for Exercises 2–6, with no destinations. Exercise 1 includes Home navigation in the header and an All exercises link in the footer. Both pages work without a build step or external assets.

Exercise 1 remains implemented and partially verified; adding navigation and shared styles is not a new acceptance result. The remaining exercises and public deployment are still pending. Browser visual verification of the home page and shared-style extraction is also pending.

GitHub Pages is the intended hosting destination. Deployment and public-access/offline verification belong to Task 3; the existence of a GitHub repository does not establish a deployed tutorial.

All internal navigation and asset references must be document-relative, without a leading `/` or a hardcoded host/repository prefix. For example, the root page links to `exercises/exercise-01-prompt-lab/index.html`, and an exercise links back with `../../index.html`. CSS asset URLs resolve relative to the stylesheet containing them. Preserve the directory structure when publishing so links remain within the repository subpath.


## License

This repository uses a dual-license model:

- Source code is licensed under the MIT License. See [LICENSE-CODE.md](LICENSE-CODE.md).
- Exercise content, scenarios, prompts, instructional text, explanations, examples, and training materials are licensed under Creative Commons Attribution 4.0 International. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

When using or adapting the exercise content, please credit:

Based on "AI-assisted testing exercise simulator" by Predrag Skoković, licensed under CC BY 4.0.
Original project: [from-prompts-to-agentic-testing-workflows](https://github.com/pskokovic/from-prompts-to-agentic-testing-workflows)
