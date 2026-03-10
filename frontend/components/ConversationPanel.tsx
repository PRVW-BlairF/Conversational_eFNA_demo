import { TranscriptSegment } from '@/types/session';

export function ConversationPanel({ segments }: { segments: TranscriptSegment[] }) {
  return (
    <div className="bg-white rounded-xl2 p-4 shadow-card h-[560px] overflow-auto">
      <h3 className="font-semibold mb-3">Conversation stream</h3>
      <div className="space-y-3">
        {segments.map((s) => (
          <div key={s.id} className="p-3 rounded-2xl border border-copilot-border bg-copilot-bg">
            <div className="flex justify-between text-xs text-slate-500"><span className="uppercase">{s.speaker}</span><span>{Math.round(s.timestamp)}s</span></div>
            <p className="text-sm mt-1 text-copilot-text">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
