"""Plot bands and the linked real-space potential for the square-lattice model."""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

from solver import SquareKronigPenneyConfig, compute_band_structure, compute_real_space_potential


def plot_band_structure(
    config: SquareKronigPenneyConfig,
    *,
    bands_to_plot: int = 8,
    output_path: str | Path = "plots/band_structure.png",
) -> Path:
    """Compute and save a band-structure plot for the configured model."""

    result = compute_band_structure(config)
    distances = result["distances"]
    eigenvalues = result["eigenvalues"]
    labels = result["labels"]

    if bands_to_plot < 1:
        raise ValueError("bands_to_plot must be positive")

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    figure, axis = plt.subplots(figsize=(8, 5), constrained_layout=True)
    max_band = min(bands_to_plot, eigenvalues.shape[1])

    for band_index in range(max_band):
        axis.plot(distances, eigenvalues[:, band_index], color="#1f5eff", linewidth=1.4)

    tick_positions = [position for _, position in labels]
    tick_labels = [label for label, _ in labels]

    for position in tick_positions:
        axis.axvline(position, color="#bbbbbb", linewidth=0.8, zorder=0)

    axis.set_xticks(tick_positions)
    axis.set_xticklabels(tick_labels)
    axis.set_xlim(float(distances[0]), float(distances[-1]))
    axis.set_xlabel("k-path")
    axis.set_ylabel("Energy (dimensionless)")
    axis.set_title(
        "2D Square-Lattice Kronig-Penney Bands\n"
        f"V0={config.well_depth}, a={config.lattice_constant}, "
        f"fill={config.fill_fraction}, n_max={config.n_max}"
    )
    axis.grid(axis="y", alpha=0.25)

    figure.savefig(output, dpi=160)
    plt.close(figure)
    return output


def plot_linked_band_and_potential(
    config: SquareKronigPenneyConfig,
    *,
    bands_to_plot: int = 8,
    grid_size: int = 160,
    output_path: str | Path = "plots/band_and_potential.png",
) -> Path:
    """Save a linked band-structure and real-space potential figure.

    Both panels are generated from the same config, which is the first static
    version of the linked-view contract planned for the interactive UI.
    """

    if bands_to_plot < 1:
        raise ValueError("bands_to_plot must be positive")

    band_result = compute_band_structure(config)
    potential_result = compute_real_space_potential(config, grid_size=grid_size)
    distances = band_result["distances"]
    eigenvalues = band_result["eigenvalues"]
    labels = band_result["labels"]
    potential = potential_result["potential"]
    coordinates = potential_result["x"]

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

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

    figure.suptitle(
        "Linked 2D Kronig-Penney Views\n"
        f"V0={config.well_depth}, a={config.lattice_constant}, "
        f"fill={config.fill_fraction}, n_max={config.n_max}"
    )
    figure.savefig(output, dpi=160)
    plt.close(figure)
    return output


def main() -> None:
    config = SquareKronigPenneyConfig(
        lattice_constant=1.0,
        well_depth=2.0,
        fill_fraction=0.5,
        n_max=2,
        points_per_segment=60,
    )
    band_output = plot_band_structure(config)
    linked_output = plot_linked_band_and_potential(config)
    print(f"Saved band-structure plot to {band_output}")
    print(f"Saved linked band/potential plot to {linked_output}")


if __name__ == "__main__":
    main()
