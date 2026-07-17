from fastapi import APIRouter

from app.models.schemas import CrowdInsightRequest
from app.services import crowd_simulator, gemini_service

router = APIRouter(prefix="/api/crowd", tags=["Crowd Management"])

SYSTEM_INSTRUCTION = """You are an operations-intelligence assistant for stadium crowd management during
a FIFA World Cup 2026 match. You are given live zone occupancy data (as JSON). Identify the biggest risk
and recommend ONE concrete, actionable step control-room staff can take in the next 10 minutes
(e.g. reroute fans from Gate X to Gate Y, open an extra concourse lane, deploy stewards).
Respond in 2-3 sentences, plain and operational, no bullet points."""


@router.get("/status")
async def crowd_status():
    zones = crowd_simulator.get_zone_status()
    totals = crowd_simulator.get_totals()
    return {"zones": zones, "totals": totals}


@router.post("/insight")
async def crowd_insight(payload: CrowdInsightRequest):
    zones = crowd_simulator.get_zone_status()
    totals = crowd_simulator.get_totals()

    busiest = max(zones, key=lambda z: z["occupancy_pct"])
    quietest = min(zones, key=lambda z: z["occupancy_pct"])

    prompt = (
        f"Live zone data: {zones}\n"
        f"Stadium totals: {totals}\n"
        f"Focus zone requested: {payload.focus_zone or 'none, use judgement'}"
    )

    fallback = (
        f"{busiest['name']} is at {busiest['occupancy_pct']}% capacity — the highest of any zone. "
        f"Recommend directing arriving fans toward {quietest['name']} "
        f"(currently {quietest['occupancy_pct']}%) via gate signage and 2 additional stewards for the next 10 minutes."
    )

    insight = await gemini_service.generate(prompt, SYSTEM_INSTRUCTION, fallback=fallback)

    return {
        "insight": insight,
        "busiest_zone": busiest["name"],
        "quietest_zone": quietest["name"],
    }
