# GUIDE.md — Step-by-Step Setup & Deployment

This guide takes you from a fresh clone of this project to a fully running local demo, and then (optionally) to a live deployment on Google Cloud Run using the $5 GCP credit provided for this hackathon.

---

## 0. What you need before starting

| Requirement | Why | Cost |
|---|---|---|
| Python 3.11+ | Runs the FastAPI backend | Free |
| Node.js 18.18+ and npm | Runs the Next.js frontend | Free |
| A Google account | To get a Gemini API key and (optionally) a GCP project | Free |
| Gemini API key | Powers every AI feature | **Free tier** — does not use your $5 GCP credit |
| Google Cloud project (optional) | Only needed if you deploy to Cloud Run | Covered by the $5 credit |

> **Cost tip:** The app calls Gemini through the **Gemini Developer API** (Google AI Studio), which has a generous free tier (currently free requests per minute/day for `gemini-2.0-flash`). This means you can develop and demo the entire project **without touching your $5 GCP credit at all**. The credit only gets used if you choose to deploy the containers to Cloud Run in Section 5.

---

## 1. Get a free Gemini API key

1. Go to **https://aistudio.google.com/app/apikey**.
2. Sign in with your Google account.
3. Click **Create API key** → choose "Create key in new project" (or an existing project).
4. Copy the key — you'll paste it into `backend/.env` in the next step.

---

## 2. Run the backend (FastAPI)

```bash
cd backend
python -m venv .venv

# Activate the virtual environment
source .venv/bin/activate        # macOS / Linux
.venv\Scripts\activate           # Windows

pip install -r requirements.txt

cp .env.example .env
```

Open `backend/.env` and paste your key:

```
GEMINI_API_KEY=your-key-here
```

Start the server:

```bash
uvicorn app.main:app --reload
```

- API root: http://localhost:8000
- Interactive API docs (Swagger UI): **http://localhost:8000/docs** — use this to try every endpoint directly.
- If `GEMINI_API_KEY` is left blank, the API still runs in **demo mode**: every AI endpoint returns a clearly-labelled sample response instead of erroring out, so the frontend stays fully usable while you set things up.

---

## 3. Run the frontend (Next.js)

Open a **new terminal**:

```bash
cd frontend
npm install
cp .env.example .env.local
```

`frontend/.env.local` should point at your backend:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

Open **http://localhost:3000**. You should see the StadiumIQ Overview dashboard with the live "Stadium Pulse" strip animating in the header.

> **Note on fonts:** the app loads Google Fonts (Space Grotesk, Inter, IBM Plex Mono) via `next/font/google` at build time, which requires an internet connection the first time you `npm run dev` or `npm run build`. If you're on a fully offline machine, open `frontend/app/layout.tsx` and remove the `next/font/google` import/usage — the app will fall back to the system sans-serif font.

---

## 4. Walking through each module

| Page | Try this |
|---|---|
| `/` Overview | Watch the live stat cards and module grid |
| `/assistant` | Pick a language (e.g. Spanish) and ask "Where's the nearest restroom?" |
| `/navigation` | Choose "Gate C" → "Seat Z1-114", toggle "Require accessible route" |
| `/crowd` | Click **Generate insight** to get a live AI recommendation from the occupancy data |
| `/accessibility` | Click one of the quick-example needs |
| `/sustainability` | Enter a distance and group size, click **Compare options** |
| `/operations` | Submit a sample incident report, e.g. *"Long queue at Gate G, fans frustrated"* and watch it get triaged and logged |

All AI responses are generated live by Gemini once your API key is set — no responses are hardcoded.

---

## 5. Run the test suites

### Backend (pytest + ruff)

```bash
cd backend
# if you haven't already created/activated .venv, do that first (Section 2)
pip install -r requirements-dev.txt
ruff check .                                # lint
pytest -v                                   # run all 50 tests
pytest --cov=app --cov-report=term-missing  # with a coverage report (100% statement coverage)
```

The suite covers every router (chat, navigation, crowd, accessibility, sustainability, operations), the Gemini service wrapper's live and fallback code paths, the crowd simulator, and app-level middleware (security headers, rate limiting, the generic error handler) — all running against the demo-mode fallback logic, so it needs **no API key and no network access** to pass.

### Frontend (Jest + React Testing Library + jest-axe)

```bash
cd frontend
npm install
npm run lint      # ESLint
npm test          # run once
npm run test:watch # re-run on file changes
```

This covers the typed API client (`lib/api.ts`), the shared UI kit (`components/ui.tsx`), and includes automated accessibility checks (`jest-axe`) on the shared UI kit and the navigation rail.

### Continuous integration

`.github/workflows/ci.yml` lints and runs both test suites (plus a production `next build`) automatically on every push and pull request once this repo is on GitHub — no setup required beyond pushing the code.

---

## 6. (Optional) Deploy to Google Cloud Run with your $5 credit

Cloud Run bills per request and scales to zero, so a hackathon demo typically costs **well under $1** of your $5 credit. Steps below use the `gcloud` CLI.

### 5.1 One-time setup

```bash
# Install the gcloud CLI if you don't have it: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud projects create YOUR_PROJECT_ID --name="StadiumIQ"
gcloud config set project YOUR_PROJECT_ID

# Enable the services you need
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

### 5.2 Deploy the backend

```bash
cd backend
gcloud run deploy stadiumiq-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your-key-here,ALLOWED_ORIGINS=https://your-frontend-url
```

`gcloud` will build the Dockerfile with **Cloud Build** and deploy it to **Cloud Run**, printing a service URL like `https://stadiumiq-backend-xxxxx.a.run.app`. Copy this URL.

### 5.3 Deploy the frontend

```bash
cd ../frontend
gcloud run deploy stadiumiq-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://stadiumiq-backend-xxxxx.a.run.app
```

Once deployed, re-run the backend deploy command with `ALLOWED_ORIGINS` set to your live frontend URL so CORS allows it.

### 5.4 Keeping costs near zero

- Cloud Run's **free tier** includes 2 million requests/month and 360,000 GB-seconds of memory per month — a hackathon demo won't come close to this.
- Set `--min-instances 0` (the default) so nothing runs (and nothing bills) when no one is using the app.
- Check spend anytime at **console.cloud.google.com/billing**.

### 5.5 Alternative: keep it fully local for judging

If you'd rather not spend any of the $5 credit, simply run both services locally (Sections 2–3) and share your screen, or use a tunnel like `ngrok http 3000` to give judges a temporary public link.

---

## 7. Swapping in real stadium data (beyond the hackathon)

Every "mock" data source is isolated so it's easy to replace with a real feed:

- `backend/app/core/stadium_data.py` — replace with your venue's real zones/gates/amenities (or fetch from Firestore/BigQuery).
- `backend/app/services/crowd_simulator.py` — replace the random walk with a consumer of your real turnstile/IoT occupancy stream (e.g. Pub/Sub).
- `backend/app/services/gemini_service.py` — set `USE_VERTEX_AI=true` and `GCP_PROJECT_ID` in `.env` to route through **Vertex AI** instead of the public Gemini API, useful once you're inside a GCP-managed production environment with existing IAM controls.

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| Frontend shows "Live pulse offline" | The backend isn't running or `NEXT_PUBLIC_API_URL` is wrong — check `frontend/.env.local`. |
| Chat/AI replies all start with "[Demo mode]" | `GEMINI_API_KEY` isn't set in `backend/.env`, or the backend wasn't restarted after adding it. |
| `npm run build` fails fetching fonts | You're offline — see the font note in Section 3. |
| CORS errors in the browser console | Add your frontend's exact origin to `ALLOWED_ORIGINS` in `backend/.env` and restart the backend. |
| `pip install` errors on `google-generativeai` | Make sure you're using Python 3.9+ and an up-to-date `pip` (`pip install --upgrade pip`). |
| `ERROR: Failed building wheel for pydantic-core` | Usually means pip can't find a prebuilt wheel for your Python version. Run `python -m pip install --upgrade pip` first, then retry `pip install -r requirements.txt`. If it still fails, run `pip install --upgrade fastapi pydantic uvicorn python-dotenv google-generativeai` to install the latest compatible versions instead of the exact pins. |
| `uvicorn : The term 'uvicorn' is not recognized` (Windows) | This means the previous `pip install` didn't actually finish (see the row above) — the venv has no packages in it yet. Fix the install first, then `pip show uvicorn` should show it's installed before re-running `uvicorn app.main:app --reload`. |

---

You're all set — happy building! 🏟️
