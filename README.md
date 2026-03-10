# AI Fact Find Copilot (Demo)

A polished, local-first demo for financial advisers that maps conversations into a structured, auditable Financial Needs Analysis (FNA) draft.

## What changed for deployment
This repo is now structured so **GitHub Pages can run the demo UI without a backend**:
- Next.js is configured for static export (`output: export`).
- The frontend includes a full guided-demo simulator with seeded transcript + live FNA updates.
- If `NEXT_PUBLIC_API_URL` is not set, the app runs in static local demo mode automatically.

## Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, lucide-react
- **Backend (optional for local full stack)**: FastAPI, WebSocket streaming, Pydantic models
- **AI Local integrations (optional)**: faster-whisper, pyannote, Ollama (`qwen2.5:7b-instruct`)

## Run as static demo (recommended for GitHub Pages parity)
```bash
cd frontend
npm install
npm run build
npm run start
```

## Run full stack locally
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (with backend)
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000/api npm run dev
```


## GitHub Pages quick fix (README issue)
If your Pages site was showing the repository README, this repo now includes:
- `index.html` at repo root (entrypoint)
- `docs/index.html` static demo app
- `.nojekyll` to ensure static assets are served directly

So Pages source can be set to **Deploy from branch** (`main` / `/root`) and it will load the demo immediately.

## GitHub Pages deployment
Use GitHub Actions to build and publish `frontend/out`.
`frontend/next.config.mjs` auto-detects repository base path in Actions:
- `basePath` and `assetPrefix` are set from `GITHUB_REPOSITORY`.
- output is static and route-safe with trailing slashes.

## Guided demo behaviour
- Click **Advance guided demo** repeatedly to simulate a meeting progression.
- Transcript, extracted FNA fields, completion score, missing fields, and next questions update as the session progresses.
- Click **Reset** to restart.

## API Endpoints (for full-stack mode)
- `POST /api/session/start`
- `POST /api/session/upload-audio`
- `WS /api/session/{id}/stream`
- `POST /api/session/{id}/process-chunk`
- `POST /api/session/{id}/guided-demo`
- `GET /api/session/{id}/state`
- `POST /api/session/{id}/confirm-field`
- `POST /api/session/{id}/edit-field`
- `GET /api/session/{id}/summary`
- `GET /api/session/{id}/export`

## Known limitations
- Static mode is a deterministic simulator (no live microphone capture in Pages).
- Backend persistence is currently in-memory.
- Optional model integrations gracefully fall back when unavailable.
