import pytest


def test_chat_returns_reply_in_requested_language(client):
    res = client.post(
        "/api/chat",
        json={"message": "Where is the nearest restroom?", "language": "Spanish"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["language"] == "Spanish"
    assert isinstance(body["reply"], str) and len(body["reply"]) > 0
    assert body["detected_intent"] in {
        "general_query",
        "navigation",
        "accessibility",
        "transport",
        "crowd",
    }


@pytest.mark.parametrize(
    "message,expected_intent",
    [
        ("Where is gate C?", "navigation"),
        ("I need a wheelchair accessible seat", "accessibility"),
        ("Is there a shuttle bus?", "transport"),
        ("How busy is the queue right now?", "crowd"),
    ],
)
def test_chat_intent_detection(client, message, expected_intent):
    res = client.post("/api/chat", json={"message": message, "language": "English"})
    assert res.status_code == 200
    assert res.json()["detected_intent"] == expected_intent


def test_chat_rejects_empty_message(client):
    res = client.post("/api/chat", json={"message": "", "language": "English"})
    assert res.status_code == 422


def test_chat_accepts_conversation_history(client):
    history = [
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello! How can I help?"},
    ]
    res = client.post(
        "/api/chat",
        json={"message": "What time do gates open?", "language": "English", "history": history},
    )
    assert res.status_code == 200
