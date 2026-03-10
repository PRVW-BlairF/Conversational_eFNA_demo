from __future__ import annotations

from app.rules.rules_engine import compute_completion_score, section_coverage
from app.schemas.fna import SessionState


class SummaryService:
    def build(self, session: SessionState) -> dict:
        coverage = section_coverage(session.fna)
        completion = compute_completion_score(session.fna)
        unresolved = session.missing_fields
        contradictions = session.fna.contradictions
        return {
            "session_id": session.id,
            "completion_score": completion,
            "coverage": coverage,
            "unresolved_items": unresolved,
            "contradictions": contradictions,
            "suggested_next_actions": session.next_questions[:5],
            "audit_trail": session.audit_trail,
        }
