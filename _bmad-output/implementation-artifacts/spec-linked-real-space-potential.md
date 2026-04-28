---
title: 'Linked Real-Space Potential Visualization'
type: 'feature'
created: '2026-04-23'
status: 'done'
route: 'one-shot'
---

# Linked Real-Space Potential Visualization

## Intent

**Problem:** The reference artifact could plot the band structure but did not show the corresponding real-space square-well potential, so the first linked-view milestone was missing.

**Approach:** Add a real-space potential grid API and a combined plot that renders bands and `V(x,y)` from the same `SquareKronigPenneyConfig`.

## Suggested Review Order

- [solver.py](band-structure-reference/solver.py) -- verify `compute_real_space_potential` matches the centered square-well model and shared config semantics.
- [validate_single_k.py](band-structure-reference/validate_single_k.py) -- check potential grid contract and area-fraction validation.
- [plot_band_structure.py](band-structure-reference/plot_band_structure.py) -- confirm the linked figure uses one config and preserves standalone band plotting.
- [README.md](band-structure-reference/README.md) -- confirm documented commands and output paths are accurate.
- [review-prompt-linked-potential-plotting.md](review-prompt-linked-potential-plotting.md) -- optional standalone prompt for adversarial review.
