export function JourneyStrip({ progress = 3 }: { progress?: number }) {
  const stages = ['Listen', 'Extract', 'Structure', 'Govern', 'Complete'];
  return (
    <div className="mt-4">
      <div className="grid grid-cols-5 gap-1">
        {stages.map((stage, i) => (
          <div key={stage} className={`py-2 px-3 text-center text-sm font-medium ${i <= progress ? 'bg-copilot-lime text-copilot-teal' : 'bg-copilot-teal text-copilot-inverse'} [clip-path:polygon(0_0,95%_0,100%_50%,95%_100%,0_100%,5%_50%)]`}>
            {stage}
          </div>
        ))}
      </div>
      <p className="text-xs text-copilot-text mt-2">Structured AI reduces manual fact-find effort while preserving adviser oversight.</p>
    </div>
  );
}
