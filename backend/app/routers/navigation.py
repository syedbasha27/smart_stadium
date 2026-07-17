import random

from fastapi import APIRouter

from app.core.stadium_data import GATES, ZONES
from app.models.schemas import NavigationRequest, NavigationResponse
from app.services import gemini_service

router = APIRouter(prefix="/api/navigation", tags=["Navigation"])

SYSTEM_INSTRUCTION = """You are a stadium wayfinding assistant for a FIFA World Cup 2026 venue.
Given a current location and a destination inside the stadium, produce a short, numbered list of
3-5 clear walking directions using stadium vocabulary (concourse, ramp, gate, tier, stand).
If accessibility is needed, prefer ramps/lifts over stairs and mention accessible routes explicitly.
Respond ONLY as JSON with keys: "summary" (1 sentence), "steps" (array of strings), "minutes" (integer 2-15).
Reply in the requested language."""


@router.post("", response_model=NavigationResponse)
async def get_route(payload: NavigationRequest):
    prompt = (
        f"Current location: {payload.current_location}\n"
        f"Destination: {payload.destination}\n"
        f"Accessibility route required: {payload.accessibility_needed}\n"
        f"Language: {payload.language}"
    )

    fallback_minutes = random.randint(4, 11)
    fallback = {
        "summary": f"Head from {payload.current_location} toward {payload.destination} via the main concourse.",
        "steps": [
            f"Exit toward the main concourse from {payload.current_location}.",
            "Follow the illuminated wayfinding signage along the concourse ring.",
            ("Use the accessible ramp" if payload.accessibility_needed else "Take the nearest stairway")
            + " up to your tier.",
            f"Arrive at {payload.destination}; a steward will confirm the final stretch.",
        ],
        "minutes": fallback_minutes,
    }

    data = await gemini_service.generate_json(prompt, SYSTEM_INSTRUCTION, fallback=fallback)

    return NavigationResponse(
        route_summary=data.get("summary", fallback["summary"]),
        steps=data.get("steps", fallback["steps"]),
        estimated_walk_minutes=int(data.get("minutes", fallback_minutes)),
    )


@router.get("/zones")
async def list_zones():
    return {"zones": ZONES, "gates": GATES}
