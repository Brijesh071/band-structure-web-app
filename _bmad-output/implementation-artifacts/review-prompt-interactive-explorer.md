# Review Prompt: Interactive Explorer

Review the changed files with no prior conversation context. Focus on interactive API design, dependency handling, correctness of linked rendering, and whether the controls support dynamic band-emergence exploration.

Files to review:

- `_bmad-output/implementation-artifacts/band-structure-reference/interactive_explorer.py`
- `_bmad-output/implementation-artifacts/band-structure-reference/validate_interactive_explorer.py`
- `_bmad-output/implementation-artifacts/band-structure-reference/interactive_explorer_demo.ipynb`
- `_bmad-output/implementation-artifacts/band-structure-reference/README.md`

Intent:

Add a Jupyter-friendly interactive explorer with sliders for well depth `V0`, lattice constant `a`, fill fraction, `n_max`, k-path resolution, and number of plotted bands. The widget should render linked band-structure and real-space potential views from the same validated solver config.

Expected behavior:

- Keep Jupyter and `ipywidgets` as optional dependencies through lazy imports.
- Reuse existing solver APIs rather than duplicating numerical logic.
- Show linked band and potential views that update when parameters change.
- Include a basic explanatory cue for X-point gap opening.
- Provide repeatable validation and a demo notebook for launching the explorer.
- Preserve existing static validation and plotting scripts.

Please report actionable findings only. Include file path, line reference, severity, and recommended fix.
