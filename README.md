# Band Structure Web Sandbox

Static browser version of the square-lattice 2D Kronig-Penney MVP, now with square, Gaussian, and muffin-tin periodic potentials.

## Run

From this directory:

```bash
python3 -m http.server 8080
```

Open:

```text
http://127.0.0.1:8080
```

The app has no build step and no external runtime dependency. It uses vanilla JavaScript modules and Canvas.

## Features

- Potential type selector for `square`, `gaussian`, and `muffin-tin`.
- Sliders for `V0`, lattice constant `a`, fill fraction, Gaussian width `σ`, muffin-tin radius `R`, `n_max`, k-path resolution, and number of bands.
- Browser-side Hamiltonian construction and Jacobi diagonalization.
- Band plot along `Γ -> X -> M -> Γ`.
- Real-space square, Gaussian, or muffin-tin periodic potential view generated from the same config.
- Free-electron overlay toggle.
- Dynamic physics notes for Bragg-reflection gap opening and low-basis convergence warnings.
- Derived quantities: X-point gap, lowest band minimum, and first-band bandwidth.
- True emergence mode with `λ` from `0 → 1`, where the effective potential is `λ × V0`.
- Play/pause control for smooth band-formation animation from the free-electron limit.
- X-point vertical highlight and shaded gap region.
- Hover readout for nearest band point `(k, energy)`.
- Grouped controls with parameter tooltips.
- Reset-to-default control.
- X-point gap readout and runtime readout.

## Validate

```bash
node validate-web-solver.mjs
```
