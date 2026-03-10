from __future__ import annotations

from typing import List

from app.schemas.fna import TranscriptSegment


class DiarisationService:
    def __init__(self) -> None:
        self.available = False
        self.warning = ""
        try:
            import pyannote  # noqa: F401

            self.available = True
        except Exception:
            self.warning = "pyannote unavailable, speaker diarisation fallback active."

    def annotate(self, segments: List[TranscriptSegment]) -> List[TranscriptSegment]:
        if self.available:
            # Stub for demo: alternate labels if diarisation pipeline not fully configured
            for i, seg in enumerate(segments):
                seg.speaker = "client" if i % 2 else "adviser"
            return segments

        for i, seg in enumerate(segments):
            if seg.speaker == "unknown":
                seg.speaker = "client" if i % 2 else "adviser"
        return segments
