# Security

## Reporting a vulnerability

This is a hackathon project (hack2skill × Google, FIFA World Cup 2026 track). If you find a security issue,
please open a GitHub issue on the repository rather than disclosing it publicly with exploit details.

## Practices already in place

- **Secrets never committed.** `GEMINI_API_KEY` and all other credentials are read from environment
  variables (`.env`, gitignored) — only `.env.example` templates are checked in.
- **Input validation.** Every API request body is validated with Pydantic models (`app/models/schemas.py`)
  with explicit length/range constraints, rejecting malformed input with `422` before it reaches any handler.
- **Rate limiting.** All endpoints are rate-limited (`slowapi`, 120 requests/minute per client by default) to
  prevent abuse and to protect the Gemini API quota from a single runaway client.
- **CORS is explicit.** `ALLOWED_ORIGINS` is an allow-list read from configuration — the API does not accept
  requests from arbitrary origins, and only `GET`/`POST` methods are permitted.
- **Security headers.** Both the FastAPI backend and the Next.js frontend send `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` on every response; HSTS is added automatically
  in production.
- **No leaked internals.** A global exception handler ensures unexpected server errors return a generic
  `500` message instead of a stack trace or exception details.
- **API docs are disabled in production** (`ENV=production`) so the OpenAPI schema isn't exposed to
  anonymous internet clients on a public deployment.
- **Dependencies are pinned** in `requirements.txt` / `package-lock.json` for reproducible, auditable builds.

## Recommended for a real production deployment (beyond hackathon scope)

- Add authentication/authorization (e.g. Firebase Auth, OAuth) for the staff-facing Operations Intelligence
  module, since incident data and control-room recommendations shouldn't be publicly writable.
- Move the in-memory incident log (`app/routers/operations.py`) to a real, access-controlled datastore.
- Add a Web Application Firewall / managed DDoS protection (e.g. Cloud Armor) in front of Cloud Run.
- Rotate the Gemini API key periodically and scope it with Google Cloud's API key restrictions.
