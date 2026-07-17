from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.routers import accessibility, chat, crowd, navigation, operations, sustainability

settings = get_settings()

# Docs are only exposed outside production so internal schema details aren't
# handed to anonymous clients on a public deployment.
docs_enabled = settings.ENV != "production"

app = FastAPI(
    title=settings.APP_NAME,
    description="GenAI-powered stadium operations & fan experience platform for FIFA World Cup 2026.",
    version="1.0.0",
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
)

# --- Rate limiting -----------------------------------------------------
# Protects every endpoint (especially the Gemini-backed ones) from abuse
# and accidental runaway clients. Limits are generous for normal fan/staff
# use but stop a single client from hammering the API or exhausting quota.
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


# --- Security headers ----------------------------------------------------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    if settings.ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Never leak internal stack traces / exception details to clients."""
    return JSONResponse(status_code=500, content={"detail": "Internal server error. Please try again."})


app.include_router(chat.router)
app.include_router(navigation.router)
app.include_router(crowd.router)
app.include_router(accessibility.router)
app.include_router(sustainability.router)
app.include_router(operations.router)


@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "status": "online",
        "demo_mode": settings.DEMO_MODE,
        "docs": "/docs" if docs_enabled else "disabled in production",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
