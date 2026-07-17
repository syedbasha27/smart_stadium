def test_list_amenities(client):
    res = client.get("/api/accessibility/amenities")
    assert res.status_code == 200
    amenities = res.json()["amenities"]
    assert len(amenities) > 0
    assert all("name" in a and "zone" in a and "type" in a for a in amenities)


def test_accessibility_assist_returns_amenities(client):
    res = client.post(
        "/api/accessibility/assist",
        json={
            "need": "I use a wheelchair and need step-free access",
            "current_location": "Main Concourse",
            "language": "English",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body["reply"], str) and len(body["reply"]) > 0
    assert isinstance(body["suggested_amenities"], list)
    assert len(body["suggested_amenities"]) <= 4


def test_accessibility_assist_rejects_empty_need(client):
    res = client.post(
        "/api/accessibility/assist",
        json={"need": "", "current_location": "Main Concourse"},
    )
    assert res.status_code == 422
