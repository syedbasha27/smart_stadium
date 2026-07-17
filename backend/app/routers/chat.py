import re

from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.services import gemini_service

router = APIRouter(prefix="/api/chat", tags=["Fan Assistant"])

SYSTEM_INSTRUCTION = """You are "Amiga", the official multilingual fan assistant for a FIFA World Cup 2026
host stadium. You help fans, volunteers, and staff with directions, gate information, match schedules,
ticketing basics, accessibility, sustainability and general stadium etiquette.

Rules:
- Always reply in the requested language, translating naturally (not literally).
- Keep answers short (2-4 sentences), friendly, and specific to a stadium context.
- If you don't know a specific real-time fact (like the exact current queue length), say so and suggest
  checking the live Crowd Dashboard in the app instead of inventing numbers.
- Never provide unsafe, medical, or legal advice — direct such requests to on-site staff or First Aid.
"""


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    history_txt = ""
    if payload.history:
        for turn in payload.history[-6:]:
            history_txt += f"\n{turn.get('role', 'user')}: {turn.get('content', '')}"

    prompt = (
        f"Conversation so far:{history_txt}\n\n"
        f'Fan\'s new message: "{payload.message}"\n'
        f"Reply in {payload.language}."
    )

    fallback = (
        f"[Demo mode] Thanks for your message! Once GEMINI_API_KEY is set, I'll answer "
        f"in {payload.language} with live stadium guidance. For now: head to the nearest "
        f"marshalled gate and a volunteer in a green vest can help."
    )

    reply = await gemini_service.generate(prompt, SYSTEM_INSTRUCTION, fallback=fallback)
    intent = detect_intent(payload.message)

    return ChatResponse(reply=reply, detected_intent=intent, language=payload.language)


# Checked in priority order: a message can contain words from several
# categories (e.g. "wheelchair accessible seat" mentions both accessibility
# and navigation vocabulary) — accessibility and safety-relevant intents are
# resolved first so they aren't shadowed by more generic wayfinding words.
_INTENT_KEYWORDS = [
    (
        "accessibility",
        {
            "wheelchair",
            "accessible",
            "accessibility",
            "disability",
            "disabled",
            "hearing",
            "vision",
            "sensory",
        },
    ),
    ("crowd", {"crowd", "queue", "busy", "wait", "waiting", "packed"}),
    ("transport", {"bus", "train", "metro", "parking", "transport", "shuttle", "taxi"}),
    ("navigation", {"seat", "gate", "where", "direction", "directions", "route"}),
]


def detect_intent(message: str) -> str:
    """Whole-word keyword match (avoids false hits like 'bus' inside 'busy')."""
    words = set(re.findall(r"[a-z']+", message.lower()))
    for intent, keywords in _INTENT_KEYWORDS:
        if words & keywords:
            return intent
    return "general_query"
