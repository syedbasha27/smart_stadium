"""
These tests exercise the *live* Gemini code path (as opposed to demo mode)
by monkeypatching settings and the lazily-imported `google.generativeai`
SDK, so no real network call or API key is ever needed.
"""

import sys
import types

import pytest

from app.services import gemini_service


class _FakeResponse:
    def __init__(self, text):
        self.text = text


class _FakeModel:
    def __init__(self, text="Hello, fan!", raise_error=False):
        self._text = text
        self._raise_error = raise_error

    def generate_content(self, prompt, generation_config=None):
        if self._raise_error:
            raise RuntimeError("simulated Gemini outage")
        return _FakeResponse(self._text)


@pytest.fixture(autouse=True)
def reset_model_cache(monkeypatch):
    """Ensure the module-level model cache doesn't leak between tests."""
    monkeypatch.setattr(gemini_service, "_model", None)
    yield
    monkeypatch.setattr(gemini_service, "_model", None)


@pytest.mark.asyncio
async def test_generate_calls_live_model_when_not_in_demo_mode(monkeypatch):
    monkeypatch.setattr(gemini_service.settings, "DEMO_MODE", False)
    monkeypatch.setattr(gemini_service, "_get_model", lambda: _FakeModel("Bienvenido!"))

    result = await gemini_service.generate("hola", fallback="should not be used")

    assert result == "Bienvenido!"


@pytest.mark.asyncio
async def test_generate_falls_back_when_model_unavailable(monkeypatch):
    monkeypatch.setattr(gemini_service.settings, "DEMO_MODE", False)
    monkeypatch.setattr(gemini_service, "_get_model", lambda: None)

    result = await gemini_service.generate("hola", fallback="graceful fallback")

    assert result == "graceful fallback"


@pytest.mark.asyncio
async def test_generate_falls_back_on_model_exception(monkeypatch):
    monkeypatch.setattr(gemini_service.settings, "DEMO_MODE", False)
    monkeypatch.setattr(gemini_service, "_get_model", lambda: _FakeModel(raise_error=True))

    result = await gemini_service.generate("hola", fallback="safe fallback text")

    assert result == "safe fallback text"


@pytest.mark.asyncio
async def test_generate_json_parses_plain_json_from_model(monkeypatch):
    monkeypatch.setattr(gemini_service.settings, "DEMO_MODE", False)
    monkeypatch.setattr(gemini_service, "_get_model", lambda: _FakeModel('{"severity": "high"}'))

    result = await gemini_service.generate_json("incident report")

    assert result == {"severity": "high"}


@pytest.mark.asyncio
async def test_generate_json_strips_markdown_code_fences(monkeypatch):
    monkeypatch.setattr(gemini_service.settings, "DEMO_MODE", False)
    fenced = '```json\n{"severity": "critical"}\n```'
    monkeypatch.setattr(gemini_service, "_get_model", lambda: _FakeModel(fenced))

    result = await gemini_service.generate_json("incident report")

    assert result == {"severity": "critical"}


@pytest.mark.asyncio
async def test_generate_json_returns_fallback_on_invalid_json(monkeypatch):
    monkeypatch.setattr(gemini_service.settings, "DEMO_MODE", False)
    monkeypatch.setattr(gemini_service, "_get_model", lambda: _FakeModel("not valid json at all"))

    fallback = {"severity": "medium"}
    result = await gemini_service.generate_json("incident report", fallback=fallback)

    assert result == fallback


def test_get_model_initialises_client_successfully(monkeypatch):
    monkeypatch.setattr(gemini_service.settings, "DEMO_MODE", False)
    monkeypatch.setattr(gemini_service.settings, "GEMINI_API_KEY", "fake-key")

    fake_genai = types.SimpleNamespace(
        configure=lambda api_key: None,
        GenerativeModel=lambda model_name: _FakeModel("ready"),
    )
    monkeypatch.setitem(sys.modules, "google.generativeai", fake_genai)

    model = gemini_service._get_model()

    assert model is not None


def test_get_model_returns_none_on_init_failure(monkeypatch):
    monkeypatch.setattr(gemini_service.settings, "DEMO_MODE", False)

    def _boom(api_key):
        raise RuntimeError("bad credentials")

    fake_genai = types.SimpleNamespace(configure=_boom, GenerativeModel=lambda model_name: None)
    monkeypatch.setitem(sys.modules, "google.generativeai", fake_genai)

    model = gemini_service._get_model()

    assert model is None


def test_get_model_returns_none_immediately_in_demo_mode(monkeypatch):
    monkeypatch.setattr(gemini_service.settings, "DEMO_MODE", True)
    model = gemini_service._get_model()
    assert model is None
