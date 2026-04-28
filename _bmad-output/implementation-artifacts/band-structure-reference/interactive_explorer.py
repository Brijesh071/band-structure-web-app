"""Jupyter widget explorer for dynamic band-emergence experiments.

The widget dependencies are imported lazily so the validated solver and static
plotting scripts keep working in environments without Jupyter or ipywidgets.
"""

from __future__ import annotations

import matplotlib.pyplot as plt

from solver import (
    SquareKronigPenneyConfig,
    compute_band_structure,
    compute_real_space_potential,
    solve_single_k,
    square_lattice_high_symmetry_points,
)


def config_from_controls(
    *,
    well_depth: float,
    lattice_constant: float,
    fill_fraction: float,
    n_max: int,
    points_per_segment: int,
) -> SquareKronigPenneyConfig:
    """Create a validated solver config from UI control values."""

    config = SquareKronigPenneyConfig(
        lattice_constant=lattice_constant,
        well_depth=well_depth,
        fill_fraction=fill_fraction,
        n_max=n_max,
        points_per_segment=points_per_segment,
    )
    config.validate()
    return config


def x_point_gap(config: SquareKronigPenneyConfig) -> float:
    """Return the first zone-boundary gap at X for the current config."""

    x_point = square_lattice_high_symmetry_points(config.lattice_constant)["X"]
    eigenvalues, _ = solve_single_k(config, x_point)
    return float(eigenvalues[1] - eigenvalues[0])


def render_linked_views(
    config: SquareKronigPenneyConfig,
    *,
    bands_to_plot: int = 8,
    grid_size: int = 120,
) -> plt.Figure:
    """Render linked band and real-space potential views for notebooks."""

    if bands_to_plot < 1:
        raise ValueError("bands_to_plot must be positive")

    band_result = compute_band_structure(config)
    potential_result = compute_real_space_potential(config, grid_size=grid_size)
    distances = band_result["distances"]
    eigenvalues = band_result["eigenvalues"]
    labels = band_result["labels"]
    potential = potential_result["potential"]
    coordinates = potential_result["x"]

    figure, (band_axis, potential_axis) = plt.subplots(
        1,
        2,
        figsize=(12, 5),
        constrained_layout=True,
        gridspec_kw={"width_ratios": [1.35, 1.0]},
    )

    max_band = min(bands_to_plot, eigenvalues.shape[1])
    for band_index in range(max_band):
        band_axis.plot(distances, eigenvalues[:, band_index], color="#1f5eff", linewidth=1.35)

    tick_positions = [position for _, position in labels]
    tick_labels = [label for label, _ in labels]
    for position in tick_positions:
        band_axis.axvline(position, color="#bbbbbb", linewidth=0.8, zorder=0)

    band_axis.set_xticks(tick_positions)
    band_axis.set_xticklabels(tick_labels)
    band_axis.set_xlim(float(distances[0]), float(distances[-1]))
    band_axis.set_xlabel("k-path")
    band_axis.set_ylabel("Energy (dimensionless)")
    band_axis.set_title("Bands: Gamma -> X -> M -> Gamma")
    band_axis.grid(axis="y", alpha=0.25)

    extent = [
        float(coordinates[0]),
        float(coordinates[-1]),
        float(coordinates[0]),
        float(coordinates[-1]),
    ]
    image = potential_axis.imshow(
        potential,
        origin="lower",
        extent=extent,
        cmap="viridis",
        interpolation="nearest",
        aspect="equal",
    )
    potential_axis.set_title("Real-space potential V(x, y)")
    potential_axis.set_xlabel("x")
    potential_axis.set_ylabel("y")
    colorbar = figure.colorbar(image, ax=potential_axis, shrink=0.82)
    colorbar.set_label("Potential energy")

    gap = x_point_gap(config)
    figure.suptitle(
        "Interactive 2D Kronig-Penney Explorer\n"
        f"V0={config.well_depth:.2f}, a={config.lattice_constant:.2f}, "
        f"fill={config.fill_fraction:.2f}, n_max={config.n_max}, "
        f"X gap={gap:.4f}"
    )
    return figure


def create_interactive_explorer():
    """Return a Jupyter widget UI for dynamic parameter exploration.

    Example notebook usage:

        from interactive_explorer import create_interactive_explorer
        create_interactive_explorer()
    """

    try:
        import ipywidgets as widgets
        from IPython.display import clear_output, display
    except ImportError as exc:
        raise RuntimeError(
            "Interactive explorer requires Jupyter dependencies. Install with: "
            "python3 -m pip install ipywidgets"
        ) from exc

    well_depth = widgets.FloatSlider(
        value=2.0,
        min=0.0,
        max=6.0,
        step=0.1,
        description="V0",
        continuous_update=False,
    )
    lattice_constant = widgets.FloatSlider(
        value=1.0,
        min=0.5,
        max=3.0,
        step=0.05,
        description="a",
        continuous_update=False,
    )
    fill_fraction = widgets.FloatSlider(
        value=0.5,
        min=0.1,
        max=0.9,
        step=0.05,
        description="fill",
        continuous_update=False,
    )
    n_max = widgets.IntSlider(
        value=2,
        min=0,
        max=4,
        step=1,
        description="n_max",
        continuous_update=False,
    )
    points_per_segment = widgets.IntSlider(
        value=40,
        min=8,
        max=80,
        step=4,
        description="k-res",
        continuous_update=False,
    )
    bands_to_plot = widgets.IntSlider(
        value=8,
        min=1,
        max=16,
        step=1,
        description="bands",
        continuous_update=False,
    )

    output = widgets.Output()

    def update(
        well_depth: float,
        lattice_constant: float,
        fill_fraction: float,
        n_max: int,
        points_per_segment: int,
        bands_to_plot: int,
    ) -> None:
        config = config_from_controls(
            well_depth=well_depth,
            lattice_constant=lattice_constant,
            fill_fraction=fill_fraction,
            n_max=n_max,
            points_per_segment=points_per_segment,
        )
        with output:
            clear_output(wait=True)
            figure = render_linked_views(config, bands_to_plot=bands_to_plot)
            display(figure)
            plt.close(figure)
            print(
                "Cue: the X-point gap opens because the periodic potential "
                "couples degenerate free-electron states at the zone boundary."
            )

    controls = widgets.VBox(
        [
            widgets.HBox([well_depth, lattice_constant, fill_fraction]),
            widgets.HBox([n_max, points_per_segment, bands_to_plot]),
        ]
    )
    interactive_output = widgets.interactive_output(
        update,
        {
            "well_depth": well_depth,
            "lattice_constant": lattice_constant,
            "fill_fraction": fill_fraction,
            "n_max": n_max,
            "points_per_segment": points_per_segment,
            "bands_to_plot": bands_to_plot,
        },
    )

    display(controls, interactive_output, output)
    return controls
