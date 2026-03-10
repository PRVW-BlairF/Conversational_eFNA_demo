from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.rules.rules_engine import compute_completion_score, find_missing_required
from app.schemas.fna import FactField, FieldStatus
from app.services.diarisation_service import DiarisationService
from app.services.extraction_service import ExtractionService
from app.services.merge_service import MergeService
from app.services.question_service import QuestionService
from app.services.session_factory import create_empty_session
from app.services.summary_service import SummaryService
from app.services.transcription_service import TranscriptionService
from app.services.ws_manager import WSManager
from app.storage.repository import SessionRepository
from app.utils.seed_data import guided_demo_segments

router = APIRouter(prefix="/api")
repo = SessionRepository()
ws_manager = WSManager()
transcriber = TranscriptionService()
diariser = DiarisationService()
extractor = ExtractionService()
merger = MergeService()
question_service = QuestionService()
summary_service = SummaryService()


class SessionStartBody(BaseModel):
    mode: str = "demo"


class FieldUpdateBody(BaseModel):
    section: str
    field: str
    value: str


async def _recompute(session):
    session.missing_fields = find_missing_required(session.fna)
    session.next_questions = question_service.generate(session.fna, session.missing_fields)
    session.fna.completion_score = compute_completion_score(session.fna)
    await ws_manager.broadcast(session.id, "fna_update", session.fna.model_dump())
    await ws_manager.broadcast(session.id, "gaps_update", {"missing_fields": session.missing_fields})
    await ws_manager.broadcast(session.id, "question_update", {"questions": session.next_questions})


@router.post("/session/start")
async def start_session(body: SessionStartBody):
    session_id = str(uuid.uuid4())
    session = create_empty_session(session_id)
    session.status = "live" if body.mode == "live" else "demo"
    for warning in [transcriber.warning, diariser.warning, extractor.warning]:
        if warning:
            session.warnings.append(warning)
    repo.save(session)
    return {"session_id": session_id, "warnings": session.warnings}


@router.post("/session/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    target = Path("backend/app/storage/uploads")
    target.mkdir(parents=True, exist_ok=True)
    path = target / file.filename
    path.write_bytes(await file.read())
    return {"file_path": str(path)}


@router.post("/session/{session_id}/process-chunk")
async def process_chunk(session_id: str, segment: dict):
    session = repo.get(session_id)
    if not session:
        raise HTTPException(404, "session not found")

    from app.schemas.fna import TranscriptSegment

    seg = TranscriptSegment(**segment)
    segs = diariser.annotate([seg])
    session.transcript.extend(segs)
    for item in segs:
        extracted = extractor.extract(item)
        for key, payload in extracted.items():
            merger.merge_fact(session.fna, key, payload)
    session.audit_trail.append(f"Processed segment {seg.id}")
    repo.save(session)
    await ws_manager.broadcast(session_id, "transcript_update", {"segments": [s.model_dump() for s in segs]})
    await ws_manager.broadcast(session_id, "extraction_update", {"facts_detected": len(extracted)})
    await _recompute(session)
    return {"ok": True}


@router.post("/session/{session_id}/guided-demo")
async def run_guided_demo(session_id: str):
    session = repo.get(session_id)
    if not session:
        raise HTTPException(404, "session not found")
    for seg in guided_demo_segments():
        await process_chunk(session_id, seg.model_dump())
    session.status = "ready_for_review"
    repo.save(session)
    await ws_manager.broadcast(session_id, "session_status", {"status": session.status})
    return {"ok": True, "segments": len(session.transcript)}


@router.get("/session/{session_id}/state")
async def get_state(session_id: str):
    session = repo.get(session_id)
    if not session:
        raise HTTPException(404, "session not found")
    return session


@router.post("/session/{session_id}/confirm-field")
async def confirm_field(session_id: str, body: FieldUpdateBody):
    session = repo.get(session_id)
    if not session:
        raise HTTPException(404, "session not found")
    field = session.fna.sections[body.section].fields[body.field]
    field.status = FieldStatus.confirmed
    session.audit_trail.append(f"Confirmed {body.section}.{body.field}")
    await _recompute(session)
    return {"ok": True}


@router.post("/session/{session_id}/edit-field")
async def edit_field(session_id: str, body: FieldUpdateBody):
    session = repo.get(session_id)
    if not session:
        raise HTTPException(404, "session not found")
    field = session.fna.sections[body.section].fields[body.field]
    field.value = body.value
    field.status = FieldStatus.confirmed
    field.manually_edited = True
    field.confidence = 1
    session.audit_trail.append(f"Edited {body.section}.{body.field}")
    await _recompute(session)
    return {"ok": True}


@router.get("/session/{session_id}/summary")
async def summary(session_id: str):
    session = repo.get(session_id)
    if not session:
        raise HTTPException(404, "session not found")
    return summary_service.build(session)


@router.get("/session/{session_id}/export")
async def export(session_id: str):
    session = repo.get(session_id)
    if not session:
        raise HTTPException(404, "session not found")
    return {"fna": session.fna.model_dump(), "transcript": [s.model_dump() for s in session.transcript], "audit": session.audit_trail}


@router.websocket("/session/{session_id}/stream")
async def stream(session_id: str, websocket: WebSocket):
    await ws_manager.connect(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(session_id, websocket)
