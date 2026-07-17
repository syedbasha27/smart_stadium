import os

# Force demo mode for deterministic, key-free test runs regardless of the
# machine's local .env — tests assert on response *shape*, not on live
# Gemini output, so this keeps CI fast and free.
os.environ.setdefault("GEMINI_API_KEY", "")

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c
