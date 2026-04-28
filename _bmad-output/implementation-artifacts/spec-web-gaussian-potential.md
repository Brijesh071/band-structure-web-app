---
title: 'Web Gaussian Potential Support'
type: 'feature'
created: '2026-04-23'
status: 'done'
route: 'one-shot'
---

# Web Gaussian Potential Support

## Intent

**Problem:** The browser solver only supported the square Kronig-Penney potential, so the app could not compare a smooth periodic Gaussian potential.

**Approach:** Extend the web solver config with `type: "square" | "gaussian"` and `sigma`, implement analytic Gaussian Fourier coefficients in the Hamiltonian path, add Gaussian real-space rendering, and expose a potential-type selector plus sigma control without changing square-mode behavior.

## Suggested Review Order

- [solver.js](band-structure-web/solver.js) -- verify config validation, Gaussian Fourier coefficients, Hamiltonian coefficient selection, and real-space Gaussian rendering.
- [validate-web-solver.mjs](band-structure-web/validate-web-solver.mjs) -- confirm square mode still passes and Gaussian smoke tests cover the new path.
- [app.js](band-structure-web/app.js) -- check UI config wiring and square/gaussian control visibility.
- [index.html](band-structure-web/index.html) -- confirm the dropdown and sigma slider are added cleanly.
- [README.md](band-structure-web/README.md) -- confirm documented features match behavior.
