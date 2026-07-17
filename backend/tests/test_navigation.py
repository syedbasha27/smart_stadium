def test_get_route_returns_steps_and_eta(client):
    res = client.post(
        "/api/navigation",
        json={
            "current_location": "Gate C",
            "destination": "Seat Z1-114",
            "accessibility_needed": False,
            "language": "English",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body["steps"], list) and len(body["steps"]) > 0
    assert isinstance(body["route_summary"], str) and body["route_summary"]
    assert 1 <= body["estimated_walk_minutes"] <= 20


def test_get_route_accessible_mode(client):
    res = client.post(
        "/api/navigation",
        json={
            "current_location": "Gate A",
            "destination": "Nearest restroom",
            "accessibility_needed": True,
            "language": "English",
        },
    )
    assert res.status_code == 200
    assert res.json()["estimated_walk_minutes"] > 0


def test_list_zones_includes_reference_data(client):
    res = client.get("/api/navigation/zones")
    assert res.status_code == 200
    body = res.json()
    assert len(body["zones"]) == 7
    assert len(body["gates"]) >= 5
    assert all("id" in z and "capacity" in z for z in body["zones"])


def test_navigation_rejects_missing_fields(client):
    res = client.post("/api/navigation", json={"current_location": "Gate A"})
    assert res.status_code == 422
