---
title: 'Band Structure Plotting'
type: 'feature'
created: '2026-04-23'
status: 'done'
route: 'one-shot'
---

# Band Structure Plotting

## Intent

**Problem:** The validated reference solver could compute bands along `Gamma -> X -> M -> Gamma`, but there was no visual artifact to inspect the band structure.

**Approach:** Add a minimal plotting script that uses the existing `compute_band_structure(config)` API, marks high-symmetry points, and saves a PNG plot for review and notebook-style iteration.

## Suggested Review Order

- [plot_band_structure.py](band-structure-reference/plot_band_structure.py) -- verify plotting uses solver output directly, labels high-symmetry ticks, and writes the expected PNG.
- [README.md](band-structure-reference/README.md) -- confirm the plotting command and generated output path are documented.
- [review-prompt-band-plotting.md](review-prompt-band-plotting.md) -- optional standalone prompt for adversarial review.
