import time

from fastapi import APIRouter

from app.models.schemas import IncidentRequest
from app.services import crowd_simulator, gemini_service

router = APIRouter(prefix="/api/operations", tags=["Operations Intelligence"])

SYSTEM_INSTRUCTION = """You are an incident-triage assistant in a FIFA World Cup 2026 stadium control room.
Given a raw radio/text report from a steward or volunteer, produce a JSON object with:
"category" (one of: medical, crowd_safety, facilities, security, lost_property, weather, other),
"severity" (low, medium, high, critical),
"summary" (one crisp sentence for the ops log),
"recommended_action" (one concrete next step for the duty manager).
Be conservative: if in doubt about severity, round up."""

_incident_log: list[dict] = []


@router.post("/incident")
async def log_incident(payload: IncidentRequest):
    prompt = f"Zone: {payload.zone}\nReport: {payload.report_text}\nSeverity hint: {payload.severity_hint or 'none'}"

    fallback = {
        "category": "other",
        "severity": payload.severity_hint or "medium",
        "summary": payload.report_text[:120],
        "recommended_action": "Duty manager to review and dispatch nearest available steward.",
    }

    data = await gemini_service.generate_json(prompt, SYSTEM_INSTRUCTION, fallback=fallback)

    entry = {
        "id": f"INC-{int(time.time() * 1000) % 100000}",
        "zone": payload.zone,
        "category": data.get("category", "other"),
        "severity": data.get("severity", "medium"),
        "summary": data.get("summary", payload.report_text[:120]),
        "recommended_action": data.get("recommended_action", fallback["recommended_action"]),
        "timestamp": time.time(),
    }
    _incident_log.insert(0, entry)
    _incident_log[:] = _incident_log[:50]
    return entry


@router.get("/incidents")
async def get_incidents():
    return {"incidents": _incident_log}


@router.get("/dashboard")
async def dashboard():
    totals = crowd_simulator.get_totals()
    return {
        "totals": totals,
        "open_incidents": len(_incident_log),
        "critical_incidents": sum(1 for i in _incident_log if i["severity"] == "critical"),
        "staff_on_duty": 214,
        "volunteers_on_duty": 386,
    }
