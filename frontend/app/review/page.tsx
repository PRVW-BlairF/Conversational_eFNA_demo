'use client';

import { useSession } from '@/hooks/useSession';

export default function ReviewPage() {
  const { session } = useSession();
  const summaryText = session ? JSON.stringify({ fna: session.fna, unresolved: session.missing_fields, audit: session.audit_trail }, null, 2) : '';
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Session summary / review</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl2 p-4 shadow-card">
          <h3 className="font-medium">Unresolved items</h3>
          <ul className="mt-2 text-sm space-y-2">{session?.missing_fields.map((m) => <li key={m}>{m}</li>)}</ul>
          <h3 className="font-medium mt-4">Contradictions</h3>
          <p className="text-sm">{session?.fna.contradictions.join(', ') || 'None detected'}</p>
          <h3 className="font-medium mt-4">Suggested next actions</h3>
          <ul className="mt-2 text-sm space-y-2">{session?.next_questions.map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
        <div className="bg-white rounded-xl2 p-4 shadow-card">
          <h3 className="font-medium">Audit trail</h3>
          <ul className="mt-2 text-sm space-y-1 max-h-48 overflow-auto">{session?.audit_trail.map((a) => <li key={a}>{a}</li>)}</ul>
          <h3 className="font-medium mt-4">Export JSON / summary</h3>
          <textarea className="w-full h-64 border rounded-xl p-2 text-xs" value={summaryText} readOnly />
        </div>
      </div>
    </div>
  );
}
