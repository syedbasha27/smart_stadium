"""
Simulates a live crowd-density feed for each stadium zone.

In production this module would be replaced by a consumer that reads from
Pub/Sub / BigQuery streaming inserts fed by real turnstile counters, Wi-Fi
occupancy sensors, or CCTV people-counting models (e.g. Vertex AI Vision).
The simulator keeps state in memory and nudges each zone's occupancy over
time so the dashboard feels alive during a demo, while staying deterministic
enough to be readable.
"""

import random
import time

from app.core.stadium_data import ZONES

_state = {
    zone["id"]: {
        "occupancy": round(zone["capacity"] * random.uniform(0.35, 0.55)),
        "last_update": time.time(),
    }
    for zone in ZONES
}


def _tick(zone_id: str, capacity: int):
    """Advance a zone's occupancy by a small random walk, clamped to capacity."""
    state = _state[zone_id]
    elapsed = time.time() - state["last_update"]
    # Only step forward roughly once every few seconds to keep numbers stable
    if elapsed > 4:
        drift = random.randint(-int(capacity * 0.02), int(capacity * 0.035))
        state["occupancy"] = max(0, min(capacity, state["occupancy"] + drift))
        state["last_update"] = time.time()
    return state["occupancy"]


def get_zone_status() -> list[dict]:
    results = []
    for zone in ZONES:
        occupancy = _tick(zone["id"], zone["capacity"])
        pct = occupancy / zone["capacity"]
        level = "critical" if pct >= 0.9 else "high" if pct >= 0.75 else "moderate" if pct >= 0.5 else "low"
        results.append(
            {
                "id": zone["id"],
                "name": zone["name"],
                "capacity": zone["capacity"],
                "occupancy": occupancy,
                "occupancy_pct": round(pct * 100, 1),
                "level": level,
                "gates": zone["gates"],
            }
        )
    return results


def get_totals() -> dict:
    zones = get_zone_status()
    total_capacity = sum(z["capacity"] for z in zones)
    total_occupancy = sum(z["occupancy"] for z in zones)
    return {
        "total_capacity": total_capacity,
        "total_occupancy": total_occupancy,
        "total_pct": round(total_occupancy / total_capacity * 100, 1),
        "zones_at_high_or_above": sum(1 for z in zones if z["level"] in ("high", "critical")),
    }
