def test_log_incident_returns_triaged_entry(client):
    res = client.post(
        "/api/operations/incident",
        json={"zone": "Z2", "report_text": "Fan collapsed near section 214, requesting medical"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["zone"] == "Z2"
    assert body["category"] in {
        "medical",
        "crowd_safety",
        "facilities",
        "security",
        "lost_property",
        "weather",
        "other",
    }
    assert body["severity"] in {"low", "medium", "high", "critical"}
    assert body["id"].startswith("INC-")


def test_incident_appears_in_log(client):
    client.post(
        "/api/operations/incident",
        json={"zone": "Z3", "report_text": "Spilled drink near Gate D, minor slip hazard"},
    )
    res = client.get("/api/operations/incidents")
    assert res.status_code == 200
    incidents = res.json()["incidents"]
    assert len(incidents) > 0
    assert incidents[0]["zone"] in {"Z2", "Z3"}


def test_operations_dashboard_totals(client):
    res = client.get("/api/operations/dashboard")
    assert res.status_code == 200
    body = res.json()
    assert "totals" in body
    assert body["staff_on_duty"] > 0
    assert body["volunteers_on_duty"] > 0


def test_log_incident_rejects_short_report(client):
    res = client.post("/api/operations/incident", json={"zone": "Z1", "report_text": "hi"})
    assert res.status_code == 422
