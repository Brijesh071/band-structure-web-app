# Review Prompt: Physics Validation

Review the changed files with no prior conversation context. Focus on scientific correctness, validation adequacy, threshold reasonableness, and misleading assumptions.

Files to review:

- `_bmad-output/implementation-artifacts/band-structure-reference/validate_physics.py`
- `_bmad-output/implementation-artifacts/band-structure-reference/README.md`

Intent:

Add explicit physics-level validation for the 2D square-lattice Kronig-Penney reference solver before UI or frontend work.

Expected validation behavior:

- Confirm the `V0 = 0` free-electron limit across the full `Gamma -> X -> M -> Gamma` path.
- Confirm a visible Brillouin-zone-boundary gap opens at `X` when well depth increases.
- Confirm low-band convergence is stable for a simple `n_max = 1` to `n_max = 2` comparison in the default validation case.

Please report actionable findings only. Include file path, line reference, severity, and recommended fix.
