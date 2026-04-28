"""Basic Milestone 1 checks for the single-k reference solver."""

from __future__ import annotations

import numpy as np

from solver import (
    SquareKronigPenneyConfig,
    build_hamiltonian,
    compute_band_structure,
    compute_real_space_potential,
    compute_single_k,
    free_electron_energies,
    plane_wave_indices,
    solve_single_k,
    square_lattice_high_symmetry_points,
    square_lattice_k_path,
    square_well_fourier_coefficient,
)


def assert_close(actual: np.ndarray, expected: np.ndarray, *, tolerance: float, label: str) -> None:
    if not np.allclose(actual, expected, atol=tolerance, rtol=0):
        raise AssertionError(f"{label} failed\nactual={actual}\nexpected={expected}")


def test_basis_size() -> None:
    assert len(plane_wave_indices(0)) == 1
    assert len(plane_wave_indices(1)) == 9
    assert len(plane_wave_indices(2)) == 25


def test_fourier_zero_component() -> None:
    config = SquareKronigPenneyConfig(well_depth=4.0, fill_fraction=0.25)
    value = square_well_fourier_coefficient(
        np.array([0.0, 0.0]),
        lattice_constant=config.lattice_constant,
        well_depth=config.well_depth,
        fill_fraction=config.fill_fraction,
    )
    expected_average_potential = -config.well_depth * config.fill_fraction**2
    if not np.isclose(value, expected_average_potential):
        raise AssertionError(f"V_G=0 mismatch: {value} != {expected_average_potential}")


def test_hamiltonian_is_symmetric() -> None:
    config = SquareKronigPenneyConfig(well_depth=2.5, fill_fraction=0.4, n_max=1)
    hamiltonian = build_hamiltonian(config, [0.2, -0.1])
    assert_close(hamiltonian, hamiltonian.T, tolerance=1e-12, label="Hamiltonian symmetry")


def test_free_electron_limit() -> None:
    config = SquareKronigPenneyConfig(well_depth=0.0, n_max=1)
    k_point = np.array([0.37, 0.21])
    eigenvalues, _ = solve_single_k(config, k_point)
    expected = free_electron_energies(config, k_point)
    assert_close(eigenvalues, expected, tolerance=1e-12, label="Free-electron eigenvalues")


def test_compute_single_k_contract() -> None:
    config = SquareKronigPenneyConfig(well_depth=1.0, fill_fraction=0.5, n_max=1)
    result = compute_single_k(config, [0.0, 0.0])
    matrix_size = (2 * config.n_max + 1) ** 2
    assert result["basis_indices"].shape == (matrix_size, 2)
    assert result["hamiltonian"].shape == (matrix_size, matrix_size)
    assert result["eigenvalues"].shape == (matrix_size,)
    assert result["eigenvectors"].shape == (matrix_size, matrix_size)


def test_high_symmetry_points() -> None:
    points = square_lattice_high_symmetry_points(lattice_constant=2.0)
    boundary = np.pi / 2.0
    assert_close(points["Gamma"], np.array([0.0, 0.0]), tolerance=1e-12, label="Gamma point")
    assert_close(points["X"], np.array([boundary, 0.0]), tolerance=1e-12, label="X point")
    assert_close(points["M"], np.array([boundary, boundary]), tolerance=1e-12, label="M point")


def test_k_path_contract() -> None:
    config = SquareKronigPenneyConfig(points_per_segment=5)
    path = square_lattice_k_path(config)
    expected_points = 3 * config.points_per_segment - 2
    assert path["k_points"].shape == (expected_points, 2)
    assert path["distances"].shape == (expected_points,)
    assert len(path["labels"]) == 4
    assert [label for label, _ in path["labels"]] == ["Gamma", "X", "M", "Gamma"]
    assert np.all(np.diff(path["distances"]) >= 0)


def test_band_structure_contract() -> None:
    config = SquareKronigPenneyConfig(well_depth=1.0, fill_fraction=0.5, n_max=1, points_per_segment=4)
    result = compute_band_structure(config)
    matrix_size = (2 * config.n_max + 1) ** 2
    expected_points = 3 * config.points_per_segment - 2
    assert result["basis_indices"].shape == (matrix_size, 2)
    assert result["k_points"].shape == (expected_points, 2)
    assert result["distances"].shape == (expected_points,)
    assert result["eigenvalues"].shape == (expected_points, matrix_size)


def test_real_space_potential_contract() -> None:
    config = SquareKronigPenneyConfig(lattice_constant=1.0, well_depth=3.0, fill_fraction=0.5)
    result = compute_real_space_potential(config, grid_size=100)
    potential = result["potential"]
    assert result["x"].shape == (100,)
    assert result["y"].shape == (100,)
    assert result["x_grid"].shape == (100, 100)
    assert result["y_grid"].shape == (100, 100)
    assert potential.shape == (100, 100)
    assert set(np.unique(potential)) == {-config.well_depth, 0.0}

    well_fraction = float(np.mean(potential == -config.well_depth))
    expected_fraction = config.fill_fraction**2
    if abs(well_fraction - expected_fraction) > 0.02:
        raise AssertionError(f"well area fraction mismatch: {well_fraction} != {expected_fraction}")


def test_free_electron_limit_across_k_path() -> None:
    config = SquareKronigPenneyConfig(well_depth=0.0, n_max=1, points_per_segment=4)
    result = compute_band_structure(config)
    expected = np.array([free_electron_energies(config, k_point) for k_point in result["k_points"]])
    assert_close(result["eigenvalues"], expected, tolerance=1e-12, label="Free-electron k-path")


def main() -> None:
    test_basis_size()
    test_fourier_zero_component()
    test_hamiltonian_is_symmetric()
    test_free_electron_limit()
    test_compute_single_k_contract()
    test_high_symmetry_points()
    test_k_path_contract()
    test_band_structure_contract()
    test_real_space_potential_contract()
    test_free_electron_limit_across_k_path()
    print("Reference solver validation passed.")


if __name__ == "__main__":
    main()
