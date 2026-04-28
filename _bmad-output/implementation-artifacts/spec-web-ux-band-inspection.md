---
title: 'Web Band Inspection UX'
type: 'feature'
created: '2026-04-23'
status: 'done'
route: 'one-shot'
---

# Web Band Inspection UX

## Intent

**Problem:** The web app rendered bands and potential, but the X-point gap and individual band values were not easy to inspect, and the controls were visually flat.

**Approach:** Highlight the X-point and gap region in the band canvas, add hover readouts for nearest band points, group controls by conceptual area, add parameter tooltips, and provide a reset button.

## Suggested Review Order

- [app.js](band-structure-web/app.js) -- verify X-point highlighting, gap shading, hover hit-testing, and reset behavior.
- [index.html](band-structure-web/index.html) -- confirm grouped controls and tooltip text match the requested UX.
- [styles.css](band-structure-web/styles.css) -- inspect the minimal layout and tooltip styling.
- [README.md](band-structure-web/README.md) -- confirm documented feature list is accurate.
