def test_root_returns_service_info(client):
    res = client.get("/")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "online"
    assert "service" in body
    assert "demo_mode" in body


def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}
