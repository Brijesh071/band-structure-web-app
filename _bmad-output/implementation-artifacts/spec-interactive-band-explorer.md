---
title: 'Interactive Band Emergence Explorer'
type: 'feature'
created: '2026-04-23'
status: 'done'
route: 'one-shot'
---

# Interactive Band Emergence Explorer

## Intent

**Problem:** The reference artifact had validated static linked plots, but users could not dynamically adjust parameters to explore band emergence.

**Approach:** Add a notebook-friendly interactive module with optional Jupyter widget dependencies, sliders for the core MVP controls, and linked band/potential rendering through the existing solver APIs.

## Suggested Review Order

- [interactive_explorer.py](band-structure-reference/interactive_explorer.py) -- verify lazy widget imports, slider controls, linked rendering, and explanatory cue behavior.
- [validate_interactive_explorer.py](band-structure-reference/validate_interactive_explorer.py) -- verify repeatable checks for widget construction, linked rendering, and X-point gap response.
- [interactive_explorer_demo.ipynb](band-structure-reference/interactive_explorer_demo.ipynb) -- confirm the notebook launches the explorer with one cell.
- [README.md](band-structure-reference/README.md) -- confirm optional dependency and notebook usage instructions are accurate.
- [review-prompt-interactive-explorer.md](review-prompt-interactive-explorer.md) -- optional standalone prompt for adversarial review.
