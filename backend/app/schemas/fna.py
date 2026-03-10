from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class FieldStatus(str, Enum):
    confirmed = "confirmed"
    inferred = "inferred"
    missing = "missing"
    conflicting = "conflicting"


class Evidence(BaseModel):
    transcript_snippet: str = ""
    speaker: str = "unknown"
    timestamp: float = 0
    source_segment_id: str = ""


class FactField(BaseModel):
    value: Optional[Any] = None
    status: FieldStatus = FieldStatus.missing
    confidence: float = 0
    evidence_snippet: str = ""
    speaker: str = "unknown"
    timestamp: float = 0
    source_segment_id: str = ""
    manually_edited: bool = False


class Section(BaseModel):
    name: str
    fields: Dict[str, FactField]


class FNAState(BaseModel):
    session_id: str
    sections: Dict[str, Section]
    unresolved_questions: List[str] = Field(default_factory=list)
    contradictions: List[str] = Field(default_factory=list)
    adviser_notes: str = ""
    completion_score: float = 0


class TranscriptSegment(BaseModel):
    id: str
    speaker: str
    text: str
    timestamp: float
    entities: List[str] = Field(default_factory=list)


class SessionState(BaseModel):
    id: str
    status: str = "ready"
    transcript: List[TranscriptSegment] = Field(default_factory=list)
    fna: FNAState
    next_questions: List[str] = Field(default_factory=list)
    missing_fields: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    audit_trail: List[str] = Field(default_factory=list)
