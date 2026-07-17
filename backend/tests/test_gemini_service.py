import pytest

from app.services import gemini_service


@pytest.mark.asyncio
async def test_generate_returns_custom_fallback_in_demo_mode():
    reply = await gemini_service.generate("test prompt", fallback="canned reply")
    assert reply == "canned reply"


@pytest.mark.asyncio
async def test_generate_returns_generic_fallback_when_none_given():
    reply = await gemini_service.generate("hello there")
    assert "Demo mode" in reply
    assert "hello there" in reply


@pytest.mark.asyncio
async def test_generate_json_returns_dict_fallback():
    fallback = {"category": "other", "severity": "low"}
    result = await gemini_service.generate_json("some incident report", fallback=fallback)
    assert result == fallback


@pytest.mark.asyncio
async def test_generate_json_returns_empty_dict_with_no_fallback():
    result = await gemini_service.generate_json("some prompt")
    assert isinstance(result, dict)
