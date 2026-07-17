from fastapi import APIRouter

from app.core.stadium_data import TRANSPORT_OPTIONS
from app.models.schemas import SustainabilityRequest
from app.services import gemini_service

router = APIRouter(prefix="/api/sustainability", tags=["Sustainability"])

SYSTEM_INSTRUCTION = """You are a sustainability advisor for FIFA World Cup 2026 fan travel. Given a list of
transport options with CO2-per-km figures, the fan's distance and group size, recommend the best option and
briefly explain the estimated CO2 saved versus driving alone, in 2-3 encouraging sentences. Be specific with
numbers using the data given."""


@router.get("/options")
async def options():
    return {"transport_options": TRANSPORT_OPTIONS}


@router.post("/plan")
async def plan(payload: SustainabilityRequest):
    estimates = []
    for opt in TRANSPORT_OPTIONS:
        total_g = opt["co2_g_per_km"] * payload.distance_km
        # Shared/group modes benefit from splitting emissions per person
        if opt["mode"] in ("Shared Ride / Carpool", "Private Car"):
            total_g = total_g / max(1, payload.group_size if opt["mode"] == "Shared Ride / Carpool" else 1)
        estimates.append({**opt, "estimated_co2_g": round(total_g, 1)})

    estimates.sort(key=lambda e: e["estimated_co2_g"])
    best = estimates[0]
    car_baseline = next(e for e in estimates if e["mode"] == "Private Car")

    prompt = (
        f"Fan origin: {payload.origin}, distance: {payload.distance_km} km, group size: {payload.group_size}.\n"
        f"Ranked options with estimated CO2 (grams) for this trip: {estimates}"
    )

    fallback = (
        f"For a {payload.distance_km:.0f} km trip, {best['mode']} is the greenest choice at about "
        f"{best['estimated_co2_g']:.0f}g CO2 versus {car_baseline['estimated_co2_g']:.0f}g for driving alone — "
        f"roughly {round((1 - best['estimated_co2_g'] / max(1, car_baseline['estimated_co2_g'])) * 100)}% lower emissions."
    )

    reply = await gemini_service.generate(prompt, SYSTEM_INSTRUCTION, fallback=fallback)

    return {"recommendation": reply, "ranked_options": estimates}
