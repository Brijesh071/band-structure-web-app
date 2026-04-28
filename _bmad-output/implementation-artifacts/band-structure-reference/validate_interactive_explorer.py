"""Validation checks for the optional Jupyter interactive explorer."""

from __future__ import annotations

from interactive_explorer import (
    config_from_controls,
    create_interactive_explorer,
    render_linked_views,
    x_point_gap,
)


def test_config_from_controls() -> None:
    config = config_from_controls(
        well_depth=2.0,
        lattice_constant=1.0,
        fill_fraction=0.5,
        n_max=2,
        points_per_segment=20,
    )
    assert config.well_depth == 2.0
    assert config.lattice_constant == 1.0
    assert config.fill_fraction == 0.5
    assert config.n_max == 2
    assert config.points_per_segment == 20


def test_gap_responds_to_well_depth() -> None:
    free_config = config_from_controls(
        well_depth=0.0,
        lattice_constant=1.0,
        fill_fraction=0.5,
        n_max=2,
        points_per_segment=12,
    )
    finite_config = config_from_controls(
        well_depth=2.0,
        lattice_constant=1.0,
        fill_fraction=0.5,
        n_max=2,
        points_per_segment=12,
    )
    if abs(x_point_gap(free_config)) > 1e-12:
        raise AssertionError("Expected zero X-point gap for V0 = 0")
    if x_point_gap(finite_config) <= 0.5:
        raise AssertionError("Expected visible X-point gap for finite V0")


def test_render_linked_views() -> None:
    config = config_from_controls(
        well_depth=2.0,
        lattice_constant=1.0,
        fill_fraction=0.5,
        n_max=1,
        points_per_segment=8,
    )
    figure = render_linked_views(config, bands_to_plot=4, grid_size=40)
    if len(figure.axes) != 3:
        raise AssertionError("Expected band axis, potential axis, and colorbar axis")


def test_widget_construction() -> None:
    controls = create_interactive_explorer()
    if len(controls.children) != 2:
        raise AssertionError("Expected two rows of controls")
    descriptions = [[widget.description for widget in row.children] for row in controls.children]
    expected = [["V0", "a", "fill"], ["n_max", "k-res", "bands"]]
    if descriptions != expected:
        raise AssertionError(f"Unexpected widget layout: {descriptions}")


def main() -> None:
    test_config_from_controls()
    test_gap_responds_to_well_depth()
    test_render_linked_views()
    test_widget_construction()
    print("Interactive explorer validation passed.")


if __name__ == "__main__":
    main()
