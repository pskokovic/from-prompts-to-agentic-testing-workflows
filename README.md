# From Prompts to Agentic Testing Workflows
Browser-based exercise simulator for practicing structured AI-assisted testing workflows.

## Project layout

Target layout (the entry page and shared assets are planned, not yet implemented):

```text
index.html                         # tutorial entry page
styles.css                         # entry-page-specific styles
shared/
  styles.css                       # common design tokens and reusable components
exercises/
  exercise-01-prompt-lab/
    index.html
    app.js
    styles.css                     # exercise-specific layout and overrides
    verify.cjs
    README.md
```

Use `shared/styles.css` for common typography, colors, spacing, controls, cards, focus states, and responsive conventions. Keep page-specific layout in each page's stylesheet. Exercise pages will load `../../shared/styles.css` before their local `styles.css`; the entry page will load `shared/styles.css` before its own stylesheet. Use relative links so the same package can work under a repository URL path and offline.

Exercise 1 currently keeps all its styles locally. Extract and verify the common styles during Task 2, using its existing design as the starting point. Shared assets must remain in the downloadable bundle; moving CSS without updating page links and packaging would break standalone exercise copies.

## Current state

Exercise 1 is present in `exercises/exercise-01-prompt-lab/`. Open its `index.html` directly to use it. It is implemented and partially verified; migration to this repository is not a new acceptance result. The root entry page, shared assets, remaining exercises, and public deployment are still pending.

GitHub Pages is the intended hosting destination. Deployment and public-access/offline verification belong to Task 3; the existence of a GitHub repository does not establish a deployed tutorial.

All internal navigation and asset references must be document-relative, without a leading `/` or a hardcoded host/repository prefix. For example, the root page links to `exercises/exercise-01-prompt-lab/index.html`, and an exercise links back with `../../index.html` once that page exists. CSS asset URLs resolve relative to the stylesheet containing them. Preserve the directory structure when publishing so links remain within the repository subpath.


## License

This repository uses a dual-license model:

- Source code is licensed under the MIT License. See [LICENSE-CODE.md](LICENSE-CODE.md).
- Exercise content, scenarios, prompts, instructional text, explanations, examples, and training materials are licensed under Creative Commons Attribution 4.0 International. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

When using or adapting the exercise content, please credit:

Based on "AI-assisted testing exercise simulator" by Predrag Skoković, licensed under CC BY 4.0.
Original project: [from-prompts-to-agentic-testing-workflows](https://github.com/pskokovic/from-prompts-to-agentic-testing-workflows)
