---
title: 'Web Physics Explanation Layer'
type: 'feature'
created: '2026-04-23'
status: 'done'
route: 'one-shot'
---

# Web Physics Explanation Layer

## Intent

**Problem:** The web app had interactive plots, but the physics interpretation and derived quantities were too thin for users learning band emergence.

**Approach:** Add short dynamic physics notes, convergence warning text, derived quantity readouts, explicit free-electron comparison labeling, and an emergence animation that sweeps effective `V0` from zero to the selected value.

## Suggested Review Order

- [app.js](band-structure-web/app.js) -- verify derived quantity calculations, dynamic explanation logic, and emergence animation state.
- [index.html](band-structure-web/index.html) -- confirm the explanation panel and controls are concise.
- [styles.css](band-structure-web/styles.css) -- inspect the warning and quantity layout.
- [README.md](band-structure-web/README.md) -- confirm feature documentation matches behavior.
