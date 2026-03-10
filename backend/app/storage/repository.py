from __future__ import annotations

from pathlib import Path
from typing import Dict, Optional

from app.schemas.fna import SessionState


class SessionRepository:
    def __init__(self, db_path: str = "backend_demo.sqlite") -> None:
        self.db_path = Path(db_path)
        self.sessions: Dict[str, SessionState] = {}

    def save(self, session: SessionState) -> None:
        self.sessions[session.id] = session

    def get(self, session_id: str) -> Optional[SessionState]:
        return self.sessions.get(session_id)
