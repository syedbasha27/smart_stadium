"""
Static reference data describing a representative FIFA World Cup 2026 host
stadium (modelled loosely on a generic 70,000-seat venue). This stands in
for a real facilities/IoT database. Swap `ZONES`, `GATES`, and `AMENITIES`
for live data feeds (turnstile counters, BLE beacons, CCTV analytics, etc.)
in a production deployment — the rest of the app is agnostic to the source.
"""

ZONES = [
    {"id": "Z1", "name": "North Stand (Lower Bowl)", "capacity": 9500, "gates": ["A", "B"]},
    {"id": "Z2", "name": "South Stand (Lower Bowl)", "capacity": 9500, "gates": ["G", "H"]},
    {"id": "Z3", "name": "East Stand (Family Zone)", "capacity": 8000, "gates": ["C", "D"]},
    {"id": "Z4", "name": "West Stand (Premium)", "capacity": 6000, "gates": ["E", "F"]},
    {"id": "Z5", "name": "Upper Tier North", "capacity": 11000, "gates": ["A", "K"]},
    {"id": "Z6", "name": "Upper Tier South", "capacity": 11000, "gates": ["G", "L"]},
    {"id": "Z7", "name": "Concourse & Fan Zone", "capacity": 15000, "gates": ["A", "C", "E", "G"]},
]

GATES = [
    {"id": "A", "name": "Gate A - North", "type": "General", "accessible": True},
    {"id": "B", "name": "Gate B - North East", "type": "General", "accessible": False},
    {"id": "C", "name": "Gate C - East", "type": "Family", "accessible": True},
    {"id": "D", "name": "Gate D - South East", "type": "General", "accessible": True},
    {"id": "E", "name": "Gate E - West", "type": "Premium", "accessible": True},
    {"id": "F", "name": "Gate F - South West", "type": "Premium", "accessible": True},
    {"id": "G", "name": "Gate G - South", "type": "General", "accessible": True},
    {"id": "H", "name": "Gate H - South", "type": "General", "accessible": False},
    {"id": "K", "name": "Gate K - Upper North", "type": "General", "accessible": True},
    {"id": "L", "name": "Gate L - Upper South", "type": "General", "accessible": True},
]

AMENITIES = [
    {"name": "Accessible Restroom", "zone": "Z1", "type": "accessibility"},
    {"name": "Accessible Restroom", "zone": "Z3", "type": "accessibility"},
    {"name": "Wheelchair Seating Platform", "zone": "Z3", "type": "accessibility"},
    {"name": "Sensory Room", "zone": "Z7", "type": "accessibility"},
    {"name": "First Aid Post", "zone": "Z1", "type": "medical"},
    {"name": "First Aid Post", "zone": "Z2", "type": "medical"},
    {"name": "First Aid Post", "zone": "Z7", "type": "medical"},
    {"name": "Prayer Room", "zone": "Z7", "type": "wellbeing"},
    {"name": "Baby Care Room", "zone": "Z3", "type": "wellbeing"},
    {"name": "EV Charging & E-Bike Dock", "zone": "Z4", "type": "sustainability"},
    {"name": "Recycling & Compost Station", "zone": "Z7", "type": "sustainability"},
    {"name": "Reusable Cup Return", "zone": "Z7", "type": "sustainability"},
]

TRANSPORT_OPTIONS = [
    {
        "mode": "Metro Rail",
        "co2_g_per_km": 41,
        "avg_speed_kmh": 32,
        "notes": "Dedicated match-day express service",
    },
    {
        "mode": "Shuttle Bus (Electric)",
        "co2_g_per_km": 25,
        "avg_speed_kmh": 22,
        "notes": "Free with match ticket",
    },
    {
        "mode": "Shared Ride / Carpool",
        "co2_g_per_km": 55,
        "avg_speed_kmh": 28,
        "notes": "3+ occupancy recommended",
    },
    {"mode": "Bicycle", "co2_g_per_km": 0, "avg_speed_kmh": 16, "notes": "Secure valet parking at Gate C"},
    {"mode": "Walking", "co2_g_per_km": 0, "avg_speed_kmh": 5, "notes": "Best for fans within 2 km"},
    {
        "mode": "Private Car",
        "co2_g_per_km": 120,
        "avg_speed_kmh": 25,
        "notes": "Limited match-day parking, pre-booking required",
    },
]

MATCHES = [
    {
        "id": "M-2026-014",
        "teams": "Host Nation vs Group Opponent",
        "kickoff": "2026-06-18T19:00:00",
        "expected_attendance": 68500,
    },
]
