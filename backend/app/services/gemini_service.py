"""
Thin wrapper around Google's Gemini API (via the `google-generativeai` SDK).

Design notes
------------
* Uses the Gemini Developer API (Google AI Studio key) by default, since it
  has a free tier that does not draw down the $5 GCP credit. Set
  USE_VERTEX_AI=true + GCP_PROJECT_ID in `.env` to instead route calls
  through Vertex AI on Google Cloud (useful once deployed on Cloud Run).
* If no API key is configured at all, `DEMO_MODE` kicks in and every method
  returns a clearly-labelled, deterministic fallback string instead of
  raising an error — this keeps the frontend fully demoable before any
  credentials are wired up.
"""

import json
import logging

from app.core.config import get_settings

logger = logging.getLogger("stadiumiq.gemini")
settings = get_settings()

_model = None


def _get_model():
    """Lazily initialise the Gemini client so import never fails offline."""
    global _model
    if _model is not None or settings.DEMO_MODE:
        return _model

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel(settings.GEMINI_MODEL)
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("Gemini client failed to initialise: %s", exc)
        _model = None
    return _model


async def generate(
    prompt: str, system_instruction: str | None = None, json_mode: bool = False, fallback: str = ""
) -> str:
    """
    Generate a single text completion from Gemini.

    Falls back to a canned response (prefixed so it's obvious in the UI)
    when running in DEMO_MODE or if the live call fails for any reason —
    the product must always feel responsive during a live demo.
    """
    if settings.DEMO_MODE:
        return fallback or _generic_fallback(prompt)

    model = _get_model()
    if model is None:
        return fallback or _generic_fallback(prompt)

    try:
        full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
        generation_config = {"response_mime_type": "application/json"} if json_mode else {}
        response = model.generate_content(full_prompt, generation_config=generation_config)
        return response.text.strip()
    except Exception as exc:  # pragma: no cover - defensive
        logger.error("Gemini generation failed: %s", exc)
        return fallback or _generic_fallback(prompt)


async def generate_json(
    prompt: str, system_instruction: str | None = None, fallback: dict | None = None
) -> dict:
    """Convenience wrapper that guarantees a parsed dict is returned."""
    raw = await generate(prompt, system_instruction, json_mode=True, fallback=json.dumps(fallback or {}))
    try:
        cleaned = raw.strip().strip("`").replace("json\n", "", 1) if raw.startswith("```") else raw
        return json.loads(cleaned)
    except Exception:
        return fallback or {}


def _generic_fallback(prompt: str) -> str:
    return (
        "[Demo mode] Gemini API key not configured yet — showing a sample "
        "response so you can preview the interface. Add GEMINI_API_KEY to "
        "backend/.env to enable live AI answers. Your request was: "
        f'"{prompt[:120]}"'
    )
