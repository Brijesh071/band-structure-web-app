# Review Prompt: Full k-Path Reference Solver

Review the changed files with no prior conversation context. Focus on correctness bugs, numerical issues, API clarity, and missing validation.

Files to review:

- `_bmad-output/implementation-artifacts/band-structure-reference/solver.py`
- `_bmad-output/implementation-artifacts/band-structure-reference/validate_single_k.py`
- `_bmad-output/implementation-artifacts/band-structure-reference/README.md`

Intent:

Extend the existing single-k 2D square-lattice Kronig-Penney Python/NumPy reference solver to compute band structures along the canonical square-lattice path `Gamma -> X -> M -> Gamma`.

Expected behavior:

- Generate square-lattice high-symmetry points.
- Interpolate the `Gamma -> X -> M -> Gamma` k-path without duplicate segment endpoints.
- Solve sorted eigenvalues at each k-point.
- Provide a notebook-friendly `compute_band_structure(config)` API.
- Validate path shape, labels, monotonic path distances, result shapes, and free-electron agreement across the full k-path when `well_depth = 0`.

Please report findings only if they are actionable. Include file path, line reference, severity, and recommended fix.
