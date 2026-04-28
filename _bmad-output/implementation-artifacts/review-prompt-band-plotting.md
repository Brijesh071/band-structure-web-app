# Review Prompt: Band Structure Plotting

Review the changed files with no prior conversation context. Focus on correctness, plotting API clarity, reproducibility, and whether the visualization represents the `Gamma -> X -> M -> Gamma` path accurately.

Files to review:

- `_bmad-output/implementation-artifacts/band-structure-reference/plot_band_structure.py`
- `_bmad-output/implementation-artifacts/band-structure-reference/README.md`

Intent:

Add a minimal plotting script for the existing Python/NumPy 2D square-lattice Kronig-Penney reference solver. The plot should compute bands using `compute_band_structure(config)` and save a PNG image of selected bands along the canonical `Gamma -> X -> M -> Gamma` path.

Expected behavior:

- Use the validated solver API rather than duplicating solver logic.
- Plot cumulative k-path distance on the x-axis and dimensionless energy on the y-axis.
- Mark high-symmetry points with labeled ticks and vertical guides.
- Save output to `plots/band_structure.png`.

Please report actionable findings only. Include file path, line reference, severity, and recommended fix.
