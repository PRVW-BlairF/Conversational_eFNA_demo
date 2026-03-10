from __future__ import annotations

from collections import defaultdict
from typing import Dict, List

from fastapi import WebSocket


class WSManager:
    def __init__(self) -> None:
        self._connections: Dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, session_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[session_id].append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket) -> None:
        if websocket in self._connections[session_id]:
            self._connections[session_id].remove(websocket)

    async def broadcast(self, session_id: str, event: str, payload: dict) -> None:
        for ws in list(self._connections.get(session_id, [])):
            await ws.send_json({"event": event, "payload": payload})
