def test_crowd_status_shape(client):
    res = client.get("/api/crowd/status")
    assert res.status_code == 200
    body = res.json()
    assert len(body["zones"]) == 7
    for zone in body["zones"]:
        assert zone["level"] in {"low", "moderate", "high", "critical"}
        assert 0 <= zone["occupancy"] <= zone["capacity"]
        assert 0 <= zone["occupancy_pct"] <= 100
    totals = body["totals"]
    assert totals["total_occupancy"] <= totals["total_capacity"]
    assert 0 <= totals["total_pct"] <= 100


def test_crowd_insight_identifies_busiest_and_quietest(client):
    res = client.post("/api/crowd/insight", json={})
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body["insight"], str) and len(body["insight"]) > 0
    assert body["busiest_zone"] != ""
    assert body["quietest_zone"] != ""


def test_crowd_insight_accepts_focus_zone(client):
    res = client.post("/api/crowd/insight", json={"focus_zone": "Z1"})
    assert res.status_code == 200
