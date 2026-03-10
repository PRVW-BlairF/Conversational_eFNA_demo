export type FieldStatus = 'confirmed' | 'inferred' | 'missing' | 'conflicting';

export interface FactField {
  value: string | number | null;
  status: FieldStatus;
  confidence: number;
  evidence_snippet: string;
  speaker: string;
  timestamp: number;
  source_segment_id: string;
  manually_edited: boolean;
}

export interface Section {
  name: string;
  fields: Record<string, FactField>;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: number;
}

export interface SessionState {
  id: string;
  status: string;
  transcript: TranscriptSegment[];
  fna: {
    sections: Record<string, Section>;
    completion_score: number;
    contradictions: string[];
  };
  next_questions: string[];
  missing_fields: string[];
  warnings: string[];
  audit_trail: string[];
}
