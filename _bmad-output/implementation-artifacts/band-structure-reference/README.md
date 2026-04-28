# 2D Band Structure Reference Solver

Reference solver artifact for the brainstorming session:

- Build a plane-wave basis for the square lattice.
- Construct the single-k Hamiltonian for the 2D square-lattice Kronig-Penney model.
- Solve eigenvalues and eigenvectors with NumPy.
- Compute bands along the canonical `Gamma -> X -> M -> Gamma` path.
- Compute and plot the square-well real-space potential over one unit cell.
- Validate the free-electron limit and basic Hamiltonian/path properties.

## Model

Units are dimensionless with `hbar^2 / 2m = 1`, so the kinetic term is:

```text
T_G(k) = |k + G|^2
```

The potential is a centered square well in each unit cell:

```text
V(x, y) = -V0 inside a square of side fill_fraction * a, otherwise 0
```

Hamiltonian matrix:

```text
H_G,G'(k) = |k + G|^2 delta_G,G' + V_(G-G')
```

## Usage

```bash
python validate_single_k.py
python validate_physics.py
python plot_band_structure.py
```

Optional interactive notebook dependency:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install ipywidgets notebook matplotlib numpy
```

Notebook-friendly API:

```python
from solver import (
    SquareKronigPenneyConfig,
    compute_band_structure,
    compute_real_space_potential,
    compute_single_k,
)

config = SquareKronigPenneyConfig(
    lattice_constant=1.0,
    well_depth=2.0,
    fill_fraction=0.5,
    n_max=1,
    points_per_segment=40,
)

single_k = compute_single_k(config, k_point=[0.0, 0.0])
bands = compute_band_structure(config)
potential = compute_real_space_potential(config)
bands["eigenvalues"]
```

Interactive notebook usage:

```python
from interactive_explorer import create_interactive_explorer

create_interactive_explorer()
```

Or open `interactive_explorer_demo.ipynb` from this directory with the local environment:

```bash
.venv/bin/jupyter notebook interactive_explorer_demo.ipynb
```

## Validation Coverage

`validate_single_k.py` checks API contracts, matrix symmetry, path construction, and the free-electron limit.

`validate_physics.py` checks the milestone-level physics behavior:

- `V0 = 0` matches free-electron energies across the full k-path.
- A visible gap opens at `X` when `V0` increases.
- The first four bands are stable under a simple `n_max = 1` to `n_max = 2` convergence comparison for the default validation case.

`plot_band_structure.py` writes a PNG band plot for the canonical `Gamma -> X -> M -> Gamma` path:

```text
plots/band_structure.png
plots/band_and_potential.png
```

`interactive_explorer.py` provides Jupyter sliders for `V0`, lattice constant `a`, fill fraction, `n_max`, k-path resolution, and number of plotted bands. It renders the linked band/potential views dynamically from the same config and includes a context cue for X-point gap opening.

`validate_interactive_explorer.py` checks widget construction, linked rendering, and X-point gap response. Run it with the environment that has `ipywidgets` installed:

```bash
.venv/bin/python validate_interactive_explorer.py
```
