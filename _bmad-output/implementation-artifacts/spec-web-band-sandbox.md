---
title: 'Web Band Structure Sandbox'
type: 'feature'
created: '2026-04-23'
status: 'done'
route: 'one-shot'
---

# Web Band Structure Sandbox

## Intent

**Problem:** The project had a validated Python/Jupyter reference implementation but no browser version for direct web-based interaction.

**Approach:** Add a self-contained static web app that ports the square-lattice Kronig-Penney MVP solver to JavaScript, renders linked band/potential canvases, and exposes sliders for dynamic exploration.

## Suggested Review Order

- [solver.js](band-structure-web/solver.js) -- verify the JavaScript port of basis generation, Fourier coefficients, Hamiltonian construction, k-path generation, and Jacobi eigenvalue solve.
- [app.js](band-structure-web/app.js) -- verify slider wiring, linked rendering, gap readout, and free-electron overlay behavior.
- [index.html](band-structure-web/index.html) -- confirm controls and content match the MVP scope.
- [styles.css](band-structure-web/styles.css) -- inspect responsive layout and visual clarity.
- [validate-web-solver.mjs](band-structure-web/validate-web-solver.mjs) -- verify numerical smoke tests cover basis size, free-electron limit, path shape, and gap opening.
