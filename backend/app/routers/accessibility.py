from fastapi import APIRouter

from app.core.stadium_data import AMENITIES
from app.models.schemas import AccessibilityRequest
from app.services import gemini_service

router = APIRouter(prefix="/api/accessibility", tags=["Accessibility"])

SYSTEM_INSTRUCTION = """You are an accessibility concierge for a FIFA World Cup 2026 stadium, supporting
fans with mobility, sensory, or other access needs. Given a free-text need and current location, list the
nearest relevant facilities (from the provided amenities list) and give warm, practical, non-patronising
guidance in 3-4 sentences. Reply in the requested language."""


@router.get("/amenities")
async def list_amenities():
    return {"amenities": AMENITIES}


@router.post("/assist")
async def assist(payload: AccessibilityRequest):
    relevant = [a for a in AMENITIES if a["type"] == "accessibility"] or AMENITIES

    prompt = (
        f"Fan's need: {payload.need}\n"
        f"Current location: {payload.current_location}\n"
        f"Available amenities: {relevant}\n"
        f"Language: {payload.language}"
    )

    fallback = (
        f"Thanks for letting us know. The nearest accessible facilities to {payload.current_location} "
        f"are the Wheelchair Seating Platform and Accessible Restroom in the East Stand (Gate C), both "
        f"step-free from the main concourse. A steward in a green vest can escort you there at any time."
    )

    reply = await gemini_service.generate(prompt, SYSTEM_INSTRUCTION, fallback=fallback)
    return {"reply": reply, "suggested_amenities": relevant[:4]}
