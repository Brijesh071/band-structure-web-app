"""Physics-level validation checks for the reference band-structure solver."""

from __future__ import annotations

import numpy as np

from solver import (
    SquareKronigPenneyConfig,
    compute_band_structure,
    free_electron_energies,
    solve_single_k,
    square_lattice_high_symmetry_points,
)


def assert_close(actual: np.ndarray, expected: np.ndarray, *, tolerance: float, label: str) -> None:
    if not np.allclose(actual, expected, atol=tolerance, rtol=0):
        raise AssertionError(f"{label} failed\nactual={actual}\nexpected={expected}")


def test_free_electron_limit_across_path() -> None:
    config = SquareKronigPenneyConfig(well_depth=0.0, n_max=2, points_per_segment=8)
    result = compute_band_structure(config)
    expected = np.array([free_electron_energies(config, k_point) for k_point in result["k_points"]])
    assert_close(result["eigenvalues"], expected, tolerance=1e-12, label="free-electron path")


def test_gap_opens_at_x_as_potential_increases() -> None:
    points = square_lattice_high_symmetry_points(lattice_constant=1.0)
    x_point = points["X"]

    free_config = SquareKronigPenneyConfig(well_depth=0.0, fill_fraction=0.5, n_max=3)
    finite_config = SquareKronigPenneyConfig(well_depth=2.0, fill_fraction=0.5, n_max=3)

    free_values, _ = solve_single_k(free_config, x_point)
    finite_values, _ = solve_single_k(finite_config, x_point)

    free_boundary_gap = free_values[1] - free_values[0]
    finite_boundary_gap = finite_values[1] - finite_values[0]

    if abs(free_boundary_gap) > 1e-12:
        raise AssertionError(f"Expected degenerate free-electron boundary states, got gap {free_boundary_gap}")
    if finite_boundary_gap < 0.5:
        raise AssertionError(f"Expected visible X-point gap for finite potential, got {finite_boundary_gap}")


def test_low_band_convergence_for_n_max_increase() -> None:
    lower = SquareKronigPenneyConfig(well_depth=1.0, fill_fraction=0.5, n_max=1, points_per_segment=8)
    higher = SquareKronigPenneyConfig(well_depth=1.0, fill_fraction=0.5, n_max=2, points_per_segment=8)

    lower_values = compute_band_structure(lower)["eigenvalues"][:, :4]
    higher_values = compute_band_structure(higher)["eigenvalues"][:, :4]

    max_abs_delta = float(np.max(np.abs(lower_values - higher_values)))
    if max_abs_delta > 0.01:
        raise AssertionError(
            "Expected first four bands to be stable under n_max increase; "
            f"max absolute change was {max_abs_delta}"
        )


def main() -> None:
    test_free_electron_limit_across_path()
    test_gap_opens_at_x_as_potential_increases()
    test_low_band_convergence_for_n_max_increase()
    print("Physics validation passed.")


if __name__ == "__main__":
    main()
