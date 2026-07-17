# StadiumIQ — GenAI Stadium Operations Platform

**Built for:** hack2skill × Google GenAI Hackathon
**Theme:** Enhancing stadium operations and fan experience for FIFA World Cup 2026

StadiumIQ is a full-stack, Generative-AI-powered platform that helps **fans**, **volunteers**, **organizers**, and **venue staff** navigate a World Cup host stadium safely and smoothly. It layers Google's **Gemini** models over live (simulated) stadium data to provide real-time, multilingual, decision-ready guidance across six operational areas.

---

## The problem

A 70,000-seat World Cup stadium is one of the hardest live environments to run: fans speak dozens of languages, crowd surges happen in minutes, accessibility needs are easy to overlook under pressure, and control-room staff have seconds — not hours — to decide what to do next. Static signage and generic apps don't adapt to what's actually happening on the ground right now.

## Live deployment

- **Frontend (Vercel):** https://smart-stadium-9u4n5kj8d-syedbasha27s-projects.vercel.app
- **Backend (Render):** https://smart-stadium-2.onrender.com — the free Render tier spins down when idle, so the first request after a period of inactivity can take 30–50 seconds to respond while it wakes up.

## Problem statement alignment

The brief asked for a GenAI solution improving **navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, or real-time decision support** for **fans, organizers, volunteers, or venue staff**. StadiumIQ addresses every one of those areas directly:

| Requirement from the brief | Where it's addressed |
|---|---|
| Navigation | Smart Wayfinding module — AI-generated turn-by-turn directions |
| Crowd management | Crowd Control Room — live occupancy + AI redistribution recommendations |
| Accessibility | Accessibility Concierge module, plus WCAG-conscious UI (see Accessibility section below) |
| Transportation | Sustainable Travel Planner — compares transport modes for a trip |
| Sustainability | Same module — CO2-per-trip estimates and greenest-option recommendation |
| Multilingual assistance | Fan Assistant — Gemini replies fluently in the fan's chosen language |
| Operational intelligence | Operations Intelligence module — AI incident triage for stewards/duty managers |
| Real-time decision support | Live "Stadium Pulse" strip (auto-refreshing zone occupancy) + on-demand AI crowd insight |
| Built with hack2skill × Google / GCP | Google Gemini API for every AI feature; Cloud Run deployment path documented in `GUIDE.md` |

## The solution

StadiumIQ gives every stakeholder an AI layer suited to their moment:

| Module | Who it's for | What Generative AI does |
|---|---|---|
| **Multilingual Fan Assistant** | Fans | Gemini answers stadium questions fluently in the fan's own language, understanding stadium-specific context (gates, seating, transport). |
| **Smart Wayfinding** | Fans | Generates clear, step-by-step indoor directions between any two points, with an accessible-route mode. |
| **Crowd Control Room** | Organizers / venue staff | Reads live zone-occupancy data and generates one concrete redistribution recommendation for the duty manager. |
| **Accessibility Concierge** | Fans with access needs | Turns a free-text need ("I use a wheelchair...") into the nearest suitable facility and plain-language guidance. |
| **Sustainable Travel Planner** | Fans | Compares transport modes and estimates CO2 impact per trip, recommending the greenest realistic option. |
| **Operations Intelligence** | Volunteers / stewards | Triages a raw radio/text incident report into category, severity, and a recommended next action — logged instantly to a shared incident feed. |

A live **Stadium Pulse** strip (visible on every page) shows all seven stadium zones' occupancy at a glance and doubles as navigation into the Crowd Control Room.

---

## Tech stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Python FastAPI (async, auto-documented via `/docs`)
- **Generative AI:** Google Gemini API (`gemini-2.0-flash` by default) via `google-generativeai`, with an optional Vertex AI routing path for GCP deployment
- **Deployment target:** Google Cloud Run (containerized, fits comfortably inside a $5 free-tier credit — see `GUIDE.md`)

The backend runs in a safe **demo mode** with clearly-labelled fallback responses whenever `GEMINI_API_KEY` isn't set yet, so the UI is fully explorable before any credentials are configured.

---

## Project structure

```
stadiumiq/
├── backend/                 FastAPI service
│   ├── app/
│   │   ├── main.py          App entrypoint, CORS, router registration
│   │   ├── core/             config.py (env settings), stadium_data.py (mock reference data)
│   │   ├── services/         gemini_service.py (AI wrapper), crowd_simulator.py (live-feed simulator)
│   │   ├── models/            schemas.py (Pydantic request/response models)
│   │   └── routers/           chat, navigation, crowd, accessibility, sustainability, operations
│   ├── tests/                 pytest suite — 50 tests, 100% statement coverage
│   ├── pyproject.toml         ruff (lint + format) configuration
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── requirements-dev.txt   pytest, httpx, pytest-cov, ruff
│   ├── Dockerfile
│   └── .env.example
├── frontend/                 Next.js app
│   ├── app/                   one route per module + shared layout
│   ├── components/            AppShell, NavRail, StadiumPulse, shared UI kit (ui.tsx)
│   ├── lib/api.ts             typed API client
│   ├── __tests__/             Jest + RTL + jest-axe suite (API client, UI kit, automated a11y checks)
│   ├── .eslintrc.json
│   ├── jest.config.js
│   ├── Dockerfile
│   └── .env.example
├── .github/workflows/ci.yml  GitHub Actions: lint + test both apps + a production build on every push
├── docker-compose.yml         run both services together locally
├── README.md                  you are here
├── SECURITY.md                 security measures + reporting a vulnerability
└── GUIDE.md                   step-by-step setup, GCP resources, and deployment
```

## Running the tests

```bash
# Backend — 50 tests, 100% statement coverage
cd backend
pip install -r requirements-dev.txt
ruff check .                              # lint
pytest --cov=app --cov-report=term-missing

# Frontend — API client, shared UI kit, and jest-axe accessibility tests
cd frontend
npm install
npm run lint
npm test
```

Both suites, both linters, and a production build run automatically via GitHub Actions on every push (see `.github/workflows/ci.yml`).

## Security

See **`SECURITY.md`** for the full list. In short: no secrets committed, strict CORS allow-list, per-IP rate limiting on every endpoint, security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production) on both apps, Pydantic-validated input everywhere, and a global handler that never leaks internal error details to the client.

## Accessibility

- Every icon-only control (nav items, the chat send button) has a real accessible name — verified with automated `jest-axe` tests, not just visual inspection.
- A "Skip to main content" link is available to keyboard users on every page.
- The chat log is an `aria-live` region so new assistant replies are announced to screen readers.
- Muted/secondary text colors were checked against WCAG AA's 4.5:1 contrast ratio on the app's background and adjusted where they fell short.
- `prefers-reduced-motion` is respected — Framer Motion animations are disabled for users who request it at the OS level.

## Quick start

See **`GUIDE.md`** for full step-by-step instructions (getting a free Gemini API key, running locally, and deploying to Cloud Run within the $5 credit). In short:

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # then paste your Gemini API key into .env
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Then open **http://localhost:3000**.

## Design notes

The UI intentionally avoids bright/neon or pure-dark themes: a calm off-white background, deep-navy text, a single pitch-green accent (with a muted gold used sparingly for AI-generated insights) — built to feel like a professional operations tool a stadium would actually run on match day, not a hackathon demo.
