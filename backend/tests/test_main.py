from fastapi.testclient import TestClient

import app.main as main_module


def test_security_headers_present_on_every_response(client):
    res = client.get("/health")
    assert res.headers["x-content-type-options"] == "nosniff"
    assert res.headers["x-frame-options"] == "DENY"
    assert res.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "permissions-policy" in res.headers


def test_hsts_header_only_set_in_production(client, monkeypatch):
    monkeypatch.setattr(main_module.settings, "ENV", "production")
    res = client.get("/health")
    assert "strict-transport-security" in res.headers
    monkeypatch.setattr(main_module.settings, "ENV", "development")


def test_hsts_header_absent_outside_production(client):
    res = client.get("/health")
    assert "strict-transport-security" not in res.headers


def test_unhandled_exception_returns_generic_message_without_leaking_details(monkeypatch):
    def _boom():
        raise RuntimeError("some internal secret detail")

    monkeypatch.setattr("app.routers.crowd.crowd_simulator.get_zone_status", _boom)

    # raise_server_exceptions=False lets us inspect the HTTP response the
    # client would actually receive, instead of pytest re-raising the error.
    with TestClient(main_module.app, raise_server_exceptions=False) as unsafe_client:
        res = unsafe_client.get("/api/crowd/status")

    assert res.status_code == 500
    body = res.json()
    assert body == {"detail": "Internal server error. Please try again."}
    assert "some internal secret detail" not in res.text
