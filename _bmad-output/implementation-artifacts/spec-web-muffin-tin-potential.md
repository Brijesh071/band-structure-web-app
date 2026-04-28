---
title: 'Web Muffin-Tin Potential Support'
type: 'feature'
created: '2026-04-23'
status: 'done'
route: 'one-shot'
---

# Web Muffin-Tin Potential Support

## Intent

**Problem:** The browser solver still lacked a circular well model, so it could not represent the standard muffin-tin periodic potential.

**Approach:** Add a `muffin-tin` potential type with radius `R`, implement the analytic Bessel-based Fourier coefficient with a safe `G = 0` branch, render a circular real-space well, and expose a radius slider while preserving the square and Gaussian modes.

## Suggested Review Order

- [solver.js](band-structure-web/solver.js) -- verify Bessel-based muffin-tin coefficients, `G = 0` handling, and circular real-space rendering.
- [validate-web-solver.mjs](band-structure-web/validate-web-solver.mjs) -- confirm muffin-tin coefficient and band-structure smoke tests.
- [app.js](band-structure-web/app.js) -- check radius control wiring and caption/explanation updates.
- [index.html](band-structure-web/index.html) -- confirm the muffin-tin option and radius slider are added cleanly.
- [README.md](band-structure-web/README.md) -- confirm documented feature coverage matches behavior.
