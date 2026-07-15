from app.coverage_gate_probe import coverage_probe_ready


def test_coverage_probe_is_available() -> None:
    assert coverage_probe_ready() is True
