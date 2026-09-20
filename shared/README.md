# Shared tutorial design

Exercise 1 is the visual baseline for the whole tutorial. Reuse these files to keep future exercises consistent.

- **theme.css**: shared colors and font family. Change these variables to update the tutorial theme.
- **styles.css**: base typography, page shell, cards, notices, labels, buttons, navigation, focus states, and common responsive rules.
- **forms.css**: optional labels, selects, textareas, fieldsets, checkbox choices, and field notes for interactive exercises.

## Load order

From an exercise folder under exercises/, load:

```html
<link rel="stylesheet" href="../../shared/theme.css">
<link rel="stylesheet" href="../../shared/styles.css">
<link rel="stylesheet" href="../../shared/forms.css">
<link rel="stylesheet" href="styles.css">
```

The home page uses shared/ paths and omits forms.css. Keep page-specific grids, scenarios, results, and layout overrides in the local stylesheet.

## Reusable components

Use .topbar, .brand, .exercise-nav, and .home-link for navigation; .intro, .eyebrow, .notice, and .dot for introductions; .card and .section-head for panels; and .label for small labels.

Use an anchor with class="primary exercise-button" and a relative href for navigation. For an unavailable exercise, use a button with the same classes, type="button", and disabled, with no href or click handler. The shared disabled style supplies its appearance.

Keep navigation and page content in HTML so they work without JavaScript. Shared JavaScript should be introduced only when multiple exercises actually need the same behavior. Prompt building and scoring remain local to Exercise 1.

Preserve the entire shared/ directory when deploying or packaging the tutorial. Browser restrictions can affect direct file access; GitHub Pages verification and visual checks remain separate from source checks.
