from app.services import crowd_simulator


def test_get_zone_status_covers_all_zones():
    zones = crowd_simulator.get_zone_status()
    assert len(zones) == 7
    ids = {z["id"] for z in zones}
    assert ids == {"Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"}


def test_zone_occupancy_never_exceeds_capacity():
    zones = crowd_simulator.get_zone_status()
    for z in zones:
        assert 0 <= z["occupancy"] <= z["capacity"]


def test_zone_level_matches_occupancy_percentage():
    zones = crowd_simulator.get_zone_status()
    for z in zones:
        pct = z["occupancy_pct"]
        if pct >= 90:
            assert z["level"] == "critical"
        elif pct >= 75:
            assert z["level"] == "high"
        elif pct >= 50:
            assert z["level"] == "moderate"
        else:
            assert z["level"] == "low"


def test_get_totals_aggregates_zones():
    totals = crowd_simulator.get_totals()
    zones = crowd_simulator.get_zone_status()
    assert totals["total_capacity"] == sum(z["capacity"] for z in zones)
    assert totals["zones_at_high_or_above"] == sum(1 for z in zones if z["level"] in ("high", "critical"))
