# Review Prompt: Linked Potential Plotting

Review the changed files with no prior conversation context. Focus on real-space potential correctness, consistency with the Fourier-space model, plotting clarity, and whether the linked view uses one shared config.

Files to review:

- `_bmad-output/implementation-artifacts/band-structure-reference/solver.py`
- `_bmad-output/implementation-artifacts/band-structure-reference/validate_single_k.py`
- `_bmad-output/implementation-artifacts/band-structure-reference/plot_band_structure.py`
- `_bmad-output/implementation-artifacts/band-structure-reference/README.md`

Intent:

Add real-space potential visualization for the 2D square-lattice Kronig-Penney reference solver and link it with the existing band-structure plot through a shared `SquareKronigPenneyConfig`.

Expected behavior:

- `compute_real_space_potential(config)` returns one centered square-well unit cell.
- The grid uses the same `lattice_constant`, `well_depth`, and `fill_fraction` as the solver.
- Validation checks potential shape, values, and approximate well area fraction.
- `plot_band_structure.py` still writes `plots/band_structure.png` and additionally writes `plots/band_and_potential.png`.

Please report actionable findings only. Include file path, line reference, severity, and recommended fix.
