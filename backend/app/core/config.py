"""
Application configuration.

All values are read from environment variables so that no secrets are ever
committed to source control. See `.env.example` for the full list of
variables and GUIDE.md for how to obtain each one (Gemini API key, GCP
project id, etc).
"""

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = "StadiumIQ API"
    ENV: str = os.getenv("ENV", "development")

    # --- Google AI / Gemini ---
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    # --- Google Cloud Project (used if deploying via Vertex AI / Cloud Run) ---
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "")
    GCP_REGION: str = os.getenv("GCP_REGION", "us-central1")
    USE_VERTEX_AI: bool = os.getenv("USE_VERTEX_AI", "false").lower() == "true"

    # --- CORS ---
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "https://smart-stadium-eight.vercel.app").split(",")

    # --- Demo / offline mode ---
    # When no Gemini key is configured, the API still runs using rule-based
    # fallback responses so the frontend can be demoed without spending
    # any GCP credit.
    DEMO_MODE: bool = GEMINI_API_KEY == ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
