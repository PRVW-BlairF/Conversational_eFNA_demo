export function CopilotPanel({ missing, questions, contradictions }: { missing: string[]; questions: string[]; contradictions: string[] }) {
  return (
    <div className="bg-white rounded-xl2 p-4 shadow-card h-[560px] overflow-auto">
      <h3 className="font-semibold">Copilot gaps</h3>
      <div className="mt-3 p-3 rounded-2xl bg-copilot-teal text-copilot-inverse">
        <p className="text-xs text-copilot-soft">Best next question</p>
        <p className="font-medium mt-1">{questions[0] || 'Run guided demo to generate question suggestions.'}</p>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium">Missing required fields</p>
        <ul className="mt-2 space-y-2 text-sm">
          {missing.slice(0, 8).map((m) => <li key={m} className="p-2 rounded-xl bg-copilot-bg">{m}</li>)}
        </ul>
      </div>
      {contradictions.length > 0 && <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm">Detected contradictions: {contradictions.join(', ')}</div>}
    </div>
  );
}
