from __future__ import annotations

from pathlib import Path
from typing import List

from app.schemas.fna import TranscriptSegment


class TranscriptionService:
    def __init__(self) -> None:
        self.model = None
        self.warning = ""
        try:
            from faster_whisper import WhisperModel  # type: ignore

            self.model = WhisperModel("base", compute_type="int8")
        except Exception:
            self.warning = "faster-whisper unavailable, using seeded/mock transcript mode."

    def transcribe_file(self, path: Path) -> List[TranscriptSegment]:
        if not self.model:
            return []
        segments, _ = self.model.transcribe(str(path))
        output = []
        for i, seg in enumerate(segments):
            output.append(
                TranscriptSegment(id=f"seg-{i}", speaker="unknown", text=seg.text.strip(), timestamp=float(seg.start))
            )
        return output
