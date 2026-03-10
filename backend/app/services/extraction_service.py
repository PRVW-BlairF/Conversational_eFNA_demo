from __future__ import annotations

import json
import re
from typing import Dict

from app.schemas.fna import FieldStatus, TranscriptSegment


class ExtractionService:
    def __init__(self, model_name: str = "qwen2.5:7b-instruct") -> None:
        self.model_name = model_name
        self.ollama_available = False
        self.warning = ""
        try:
            import ollama  # noqa: F401

            self.ollama_available = True
        except Exception:
            self.warning = "Ollama unavailable, heuristic extraction fallback enabled."

    def extract(self, segment: TranscriptSegment) -> Dict[str, Dict]:
        if self.ollama_available:
            return self._extract_with_ollama(segment)
        return self._extract_heuristic(segment)

    def _extract_with_ollama(self, segment: TranscriptSegment) -> Dict[str, Dict]:
        import ollama  # type: ignore

        prompt = f"""
Extract financial fact-find fields from this segment as JSON object keyed by section.field.
Use status confirmed or inferred only.
Segment: {segment.speaker}: {segment.text}
"""
        try:
            response = ollama.generate(model=self.model_name, prompt=prompt, format="json")
            raw = response.get("response", "{}")
            data = json.loads(raw)
            return data if isinstance(data, dict) else {}
        except Exception:
            return self._extract_heuristic(segment)

    def _extract_heuristic(self, segment: TranscriptSegment) -> Dict[str, Dict]:
        text = segment.text.lower()
        out: Dict[str, Dict] = {}

        if "married" in text:
            out["personal_details.marital_status"] = self._fact("married", FieldStatus.confirmed, 0.88, segment)
        if "children" in text:
            m = re.search(r"(\d+)\s+children", text)
            value = int(m.group(1)) if m else 2
            out["household_and_dependants.number_of_dependants"] = self._fact(value, FieldStatus.confirmed, 0.86, segment)
        if "mortgage" in text:
            out["expenses_and_liabilities.mortgage"] = self._fact("has mortgage", FieldStatus.confirmed, 0.83, segment)
        if "risk" in text and "moderate" in text:
            out["risk_and_investing.risk_appetite"] = self._fact("moderate", FieldStatus.confirmed, 0.82, segment)
        if "retire" in text:
            out["goals_and_priorities.retirement_goal"] = self._fact("Retirement planning", FieldStatus.inferred, 0.74, segment)
        if "education" in text:
            out["goals_and_priorities.education_goal"] = self._fact("Children education funding", FieldStatus.inferred, 0.78, segment)
        if "salary" in text or "income" in text:
            amount = re.search(r"(\d{2,3}[,\d]{0,6})", segment.text)
            if amount:
                out["employment_and_income.annual_income"] = self._fact(amount.group(1), FieldStatus.inferred, 0.69, segment)

        return out

    def _fact(self, value, status: FieldStatus, confidence: float, segment: TranscriptSegment) -> Dict:
        return {
            "value": value,
            "status": status.value,
            "confidence": confidence,
            "evidence_snippet": segment.text,
            "speaker": segment.speaker,
            "timestamp": segment.timestamp,
            "source_segment_id": segment.id,
            "manually_edited": False,
        }
