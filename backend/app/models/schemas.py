from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    language: str = Field(
        default="English", description="Target reply language, e.g. 'Spanish', 'Hindi', 'Arabic'"
    )
    history: list[dict] | None = Field(default=None, description="Prior turns: [{role, content}]")


class ChatResponse(BaseModel):
    reply: str
    detected_intent: str
    language: str


class NavigationRequest(BaseModel):
    current_location: str = Field(..., description="e.g. 'Gate C' or 'Parking Lot 3'")
    destination: str = Field(..., description="e.g. 'Seat Z1-114' or 'Nearest restroom'")
    accessibility_needed: bool = False
    language: str = "English"


class NavigationResponse(BaseModel):
    route_summary: str
    steps: list[str]
    estimated_walk_minutes: int


class CrowdInsightRequest(BaseModel):
    focus_zone: str | None = None


class AccessibilityRequest(BaseModel):
    need: str = Field(
        ..., min_length=1, max_length=500, description="Free text describing the accessibility requirement"
    )
    current_location: str = "Main Concourse"
    language: str = "English"


class SustainabilityRequest(BaseModel):
    origin: str
    distance_km: float = Field(..., gt=0, le=500)
    group_size: int = Field(default=1, ge=1, le=20)


class IncidentRequest(BaseModel):
    zone: str
    report_text: str = Field(..., min_length=3, max_length=2000)
    severity_hint: str | None = None
