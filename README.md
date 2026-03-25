# AI Fact Find Copilot (Demo)

A local-first demo web application for financial advisers that turns conversation transcripts into a structured, auditable Financial Needs Analysis (FNA) draft.

## Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, lucide-react
- **Backend**: FastAPI, WebSocket streaming, Pydantic models, local storage + in-memory repository (SQLite-ready structure)
- **AI Local**:
  - `faster-whisper` for STT (fallback-safe)
  - `pyannote` for diarisation (optional; fallback to heuristic labels)
  - `ollama` for extraction/question generation model (`qwen2.5:7b-instruct` recommended)

## Features
- Live/demo session creation
- Audio upload endpoint
- Transcript segment processing with extraction + merge logic
- Deterministic rules engine for mandatory fields and follow-up gaps
- Field statuses: `confirmed`, `inferred`, `missing`, `conflicting`
- Evidence metadata per extracted field
- Guided demo mode with seeded realistic conversation
- Session review page with unresolved items, audit trail, and export payload
- Graceful fallback warnings when local model dependencies are missing

## Project Structure

```
frontend/
  app/
  components/
  hooks/
  lib/
  types/
backend/
  app/
    api/
    services/
    schemas/
    rules/
    storage/
    utils/
```

## Setup

### 1) Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` and expects API at `http://localhost:8000`.
Set `NEXT_PUBLIC_API_URL` if needed.

## Local model setup

### faster-whisper
```bash
pip install faster-whisper
```

### pyannote (optional)
```bash
pip install pyannote.audio
```

If unavailable, the app still runs and uses fallback speaker assignment.

### Ollama
Install Ollama from https://ollama.com and pull a model:
```bash
ollama pull qwen2.5:7b-instruct
```

If Ollama is unavailable, the app uses heuristic extraction and deterministic question generation.

## Guided demo mode
1. Start a demo session.
2. Click **Run guided demo** in the header.
3. The seeded transcript simulates adviser-client dialogue and updates transcript/FNA/gaps.

## API Endpoints
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
- Demo persistence is in-memory (repository pattern prepared for SQLite/Postgres upgrade).
- Diarisation integration is stubbed unless a full pyannote pipeline/token setup is provided.
- Extraction prompt is lightweight for demo speed and local reliability.
- Audio upload storage is local and non-production hardened.
