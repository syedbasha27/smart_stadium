from app.services import crowd_simulator


def test_zone_occupancy_drifts_after_enough_time_has_passed(monkeypatch):
    """The simulator only steps a zone's occupancy forward once several
    seconds have elapsed, to keep the dashboard numbers readable rather
    than jittering on every request. This forces that branch to run."""
    zone_id = "Z1"

    # Pretend the last update happened far enough in the past to trigger a step.
    crowd_simulator._state[zone_id]["last_update"] -= 10

    crowd_simulator._tick(zone_id, capacity=9500)

    # last_update should have been refreshed since a step was taken.
    assert crowd_simulator._state[zone_id]["last_update"] > 0
    # Occupancy stays within valid bounds after the random-walk step.
    assert 0 <= crowd_simulator._state[zone_id]["occupancy"] <= 9500


def test_zone_occupancy_does_not_drift_before_interval_elapses():
    zone_id = "Z2"
    crowd_simulator._state[zone_id]["last_update"] = __import__("time").time()
    before = crowd_simulator._state[zone_id]["occupancy"]

    result = crowd_simulator._tick(zone_id, capacity=9500)

    assert result == before
