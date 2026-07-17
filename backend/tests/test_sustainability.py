def test_sustainability_options_listed(client):
    res = client.get("/api/sustainability/options")
    assert res.status_code == 200
    options = res.json()["transport_options"]
    assert any(o["mode"] == "Bicycle" for o in options)
    assert any(o["mode"] == "Private Car" for o in options)


def test_sustainability_plan_ranks_greenest_first(client):
    res = client.post(
        "/api/sustainability/plan",
        json={"origin": "Downtown Transit Hub", "distance_km": 14, "group_size": 2},
    )
    assert res.status_code == 200
    body = res.json()
    ranked = body["ranked_options"]
    co2_values = [o["estimated_co2_g"] for o in ranked]
    assert co2_values == sorted(co2_values)
    assert isinstance(body["recommendation"], str) and len(body["recommendation"]) > 0


def test_sustainability_plan_rejects_invalid_distance(client):
    res = client.post(
        "/api/sustainability/plan",
        json={"origin": "Somewhere", "distance_km": -5, "group_size": 1},
    )
    assert res.status_code == 422


def test_sustainability_plan_rejects_oversized_group(client):
    res = client.post(
        "/api/sustainability/plan",
        json={"origin": "Somewhere", "distance_km": 10, "group_size": 999},
    )
    assert res.status_code == 422
