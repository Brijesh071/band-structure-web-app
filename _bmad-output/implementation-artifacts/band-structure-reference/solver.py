"""Reference solver for a 2D square-lattice Kronig-Penney model.

Units are dimensionless with hbar^2 / 2m = 1, so kinetic energy is |k + G|^2.
The periodic potential is a centered square well in each unit cell:

    V(x, y) = -V0 inside a square of side fill_fraction * a, otherwise 0.

This module is intentionally small and explicit so it can serve as the
correctness reference before porting the solver to a browser implementation.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np


Array = np.ndarray


@dataclass(frozen=True)
class SquareKronigPenneyConfig:
    """Physical and numerical parameters for the square-lattice model."""

    lattice_constant: float = 1.0
    well_depth: float = 1.0
    fill_fraction: float = 0.5
    n_max: int = 1
    points_per_segment: int = 40

    def validate(self) -> None:
        if self.lattice_constant <= 0:
            raise ValueError("lattice_constant must be positive")
        if self.well_depth < 0:
            raise ValueError("well_depth must be non-negative")
        if not 0 < self.fill_fraction <= 1:
            raise ValueError("fill_fraction must be in (0, 1]")
        if self.n_max < 0:
            raise ValueError("n_max must be non-negative")
        if self.points_per_segment < 2:
            raise ValueError("points_per_segment must be at least 2")


def plane_wave_indices(n_max: int) -> Array:
    """Return integer reciprocal-basis indices (nx, ny)."""

    if n_max < 0:
        raise ValueError("n_max must be non-negative")
    return np.array(
        [(nx, ny) for nx in range(-n_max, n_max + 1) for ny in range(-n_max, n_max + 1)],
        dtype=int,
    )


def reciprocal_vectors(indices: Array, lattice_constant: float) -> Array:
    """Map integer indices to reciprocal vectors G = 2*pi/a * (nx, ny)."""

    if lattice_constant <= 0:
        raise ValueError("lattice_constant must be positive")
    return (2.0 * np.pi / lattice_constant) * np.asarray(indices, dtype=float)


def _sinc_unnormalized(x: Array | float) -> Array | float:
    """Return sin(x) / x with the removable singularity handled at x = 0."""

    x_arr = np.asarray(x, dtype=float)
    result = np.ones_like(x_arr, dtype=float)
    mask = np.abs(x_arr) > 1e-14
    result[mask] = np.sin(x_arr[mask]) / x_arr[mask]
    if np.isscalar(x):
        return float(result)
    return result


def square_well_fourier_coefficient(
    delta_g: Array,
    *,
    lattice_constant: float,
    well_depth: float,
    fill_fraction: float,
) -> float:
    """Return V_Q for Q = delta_g.

    For a centered square well of side w = fill_fraction * a:

        V_Q = -V0 * (w/a)^2 * sinc(Qx*w/2) * sinc(Qy*w/2)

    where sinc(z) = sin(z) / z.
    """

    if lattice_constant <= 0:
        raise ValueError("lattice_constant must be positive")
    if well_depth < 0:
        raise ValueError("well_depth must be non-negative")
    if not 0 < fill_fraction <= 1:
        raise ValueError("fill_fraction must be in (0, 1]")

    qx, qy = np.asarray(delta_g, dtype=float)
    width = fill_fraction * lattice_constant
    return float(
        -well_depth
        * fill_fraction**2
        * _sinc_unnormalized(qx * width / 2.0)
        * _sinc_unnormalized(qy * width / 2.0)
    )


def build_hamiltonian(config: SquareKronigPenneyConfig, k_point: Iterable[float]) -> Array:
    """Build the Hermitian plane-wave Hamiltonian at one k-point."""

    config.validate()
    k = np.asarray(k_point, dtype=float)
    if k.shape != (2,):
        raise ValueError("k_point must contain exactly two components")

    indices = plane_wave_indices(config.n_max)
    g_vectors = reciprocal_vectors(indices, config.lattice_constant)
    matrix_size = len(indices)
    hamiltonian = np.zeros((matrix_size, matrix_size), dtype=float)

    for row, g_row in enumerate(g_vectors):
        kinetic = float(np.dot(k + g_row, k + g_row))
        hamiltonian[row, row] = kinetic

        for col, g_col in enumerate(g_vectors):
            delta_g = g_row - g_col
            hamiltonian[row, col] += square_well_fourier_coefficient(
                delta_g,
                lattice_constant=config.lattice_constant,
                well_depth=config.well_depth,
                fill_fraction=config.fill_fraction,
            )

    return hamiltonian


def solve_single_k(config: SquareKronigPenneyConfig, k_point: Iterable[float]) -> tuple[Array, Array]:
    """Return sorted eigenvalues and eigenvectors for one k-point."""

    hamiltonian = build_hamiltonian(config, k_point)
    eigenvalues, eigenvectors = np.linalg.eigh(hamiltonian)
    order = np.argsort(eigenvalues)
    return eigenvalues[order], eigenvectors[:, order]


def free_electron_energies(config: SquareKronigPenneyConfig, k_point: Iterable[float]) -> Array:
    """Return sorted free-electron energies |k + G|^2 for the configured basis."""

    config.validate()
    k = np.asarray(k_point, dtype=float)
    if k.shape != (2,):
        raise ValueError("k_point must contain exactly two components")
    indices = plane_wave_indices(config.n_max)
    g_vectors = reciprocal_vectors(indices, config.lattice_constant)
    energies = np.einsum("ij,ij->i", k + g_vectors, k + g_vectors)
    return np.sort(energies)


def compute_real_space_potential(
    config: SquareKronigPenneyConfig,
    *,
    grid_size: int = 160,
) -> dict[str, Array]:
    """Return one unit cell of the centered square-well potential on a grid."""

    config.validate()
    if grid_size < 2:
        raise ValueError("grid_size must be at least 2")

    half_cell = config.lattice_constant / 2.0
    coordinates = np.linspace(-half_cell, half_cell, grid_size, endpoint=False)
    x_grid, y_grid = np.meshgrid(coordinates, coordinates, indexing="xy")
    half_well = config.fill_fraction * config.lattice_constant / 2.0
    inside_well = (np.abs(x_grid) < half_well) & (np.abs(y_grid) < half_well)
    potential = np.where(inside_well, -config.well_depth, 0.0)

    return {
        "x": coordinates,
        "y": coordinates,
        "x_grid": x_grid,
        "y_grid": y_grid,
        "potential": potential,
    }


def square_lattice_high_symmetry_points(lattice_constant: float) -> dict[str, Array]:
    """Return canonical square-lattice high-symmetry points.

    The first Brillouin zone spans [-pi/a, pi/a] in each reciprocal direction.
    """

    if lattice_constant <= 0:
        raise ValueError("lattice_constant must be positive")
    boundary = np.pi / lattice_constant
    return {
        "Gamma": np.array([0.0, 0.0], dtype=float),
        "X": np.array([boundary, 0.0], dtype=float),
        "M": np.array([boundary, boundary], dtype=float),
    }


def interpolate_k_path(
    path_points: list[tuple[str, Array]],
    points_per_segment: int,
) -> dict[str, Array | list[str] | list[tuple[str, float]]]:
    """Interpolate a piecewise-linear k-path.

    Segment endpoints are de-duplicated so adjacent segments do not repeat the
    same k-point. The returned distances are cumulative path lengths for plots.
    """

    if points_per_segment < 2:
        raise ValueError("points_per_segment must be at least 2")
    if len(path_points) < 2:
        raise ValueError("path_points must contain at least two points")

    k_points: list[Array] = []
    distances: list[float] = []
    labels: list[tuple[str, float]] = []
    cumulative_distance = 0.0

    for segment_index, ((start_label, start), (end_label, end)) in enumerate(
        zip(path_points[:-1], path_points[1:])
    ):
        start = np.asarray(start, dtype=float)
        end = np.asarray(end, dtype=float)
        if start.shape != (2,) or end.shape != (2,):
            raise ValueError("each path point must contain exactly two components")

        if segment_index == 0:
            labels.append((start_label, cumulative_distance))

        segment = end - start
        segment_length = float(np.linalg.norm(segment))
        start_step = 0 if segment_index == 0 else 1

        for step in range(start_step, points_per_segment):
            fraction = step / (points_per_segment - 1)
            if k_points:
                previous = k_points[-1]
                current = start + fraction * segment
                cumulative_distance += float(np.linalg.norm(current - previous))
            else:
                current = start
            k_points.append(current)
            distances.append(cumulative_distance)

        labels.append((end_label, cumulative_distance))

    return {
        "k_points": np.array(k_points, dtype=float),
        "distances": np.array(distances, dtype=float),
        "labels": labels,
    }


def square_lattice_k_path(config: SquareKronigPenneyConfig) -> dict[str, Array | list[tuple[str, float]]]:
    """Return the canonical Gamma -> X -> M -> Gamma path for the config."""

    config.validate()
    points = square_lattice_high_symmetry_points(config.lattice_constant)
    return interpolate_k_path(
        [
            ("Gamma", points["Gamma"]),
            ("X", points["X"]),
            ("M", points["M"]),
            ("Gamma", points["Gamma"]),
        ],
        config.points_per_segment,
    )


def solve_k_path(config: SquareKronigPenneyConfig) -> dict[str, Array | list[tuple[str, float]]]:
    """Solve eigenvalues across the canonical square-lattice k-path."""

    path = square_lattice_k_path(config)
    k_points = path["k_points"]
    if not isinstance(k_points, np.ndarray):
        raise TypeError("k_points should be an ndarray")

    eigenvalues = []
    for k_point in k_points:
        values, _ = solve_single_k(config, k_point)
        eigenvalues.append(values)

    return {
        **path,
        "eigenvalues": np.array(eigenvalues, dtype=float),
    }


def compute_single_k(config: SquareKronigPenneyConfig, k_point: Iterable[float]) -> dict[str, Array]:
    """Notebook-friendly API for the Milestone 1 single-k calculation."""

    indices = plane_wave_indices(config.n_max)
    hamiltonian = build_hamiltonian(config, k_point)
    eigenvalues, eigenvectors = solve_single_k(config, k_point)
    return {
        "basis_indices": indices,
        "hamiltonian": hamiltonian,
        "eigenvalues": eigenvalues,
        "eigenvectors": eigenvectors,
    }


def compute_band_structure(config: SquareKronigPenneyConfig) -> dict[str, Array | list[tuple[str, float]]]:
    """Notebook-friendly API for the full Gamma -> X -> M -> Gamma calculation."""

    indices = plane_wave_indices(config.n_max)
    result = solve_k_path(config)
    return {
        "basis_indices": indices,
        **result,
    }
