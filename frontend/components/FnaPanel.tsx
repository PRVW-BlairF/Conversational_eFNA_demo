import { Section } from '@/types/session';

const colors = { confirmed: 'bg-emerald-100 text-emerald-700', inferred: 'bg-amber-100 text-amber-700', missing: 'bg-rose-100 text-rose-700', conflicting: 'bg-red-200 text-red-800' };

export function FnaPanel({ sections }: { sections: Record<string, Section> }) {
  return (
    <div className="bg-white rounded-xl2 p-4 shadow-card h-[560px] overflow-auto">
      <h3 className="font-semibold mb-3">Fact find form</h3>
      <div className="space-y-4">
        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className="border border-copilot-border rounded-2xl p-3">
            <h4 className="font-medium mb-2">{section.name}</h4>
            <div className="space-y-2">
              {Object.entries(section.fields).slice(0, 5).map(([fieldName, field]) => (
                <div key={fieldName} className="text-xs flex justify-between items-center gap-2">
                  <div>
                    <div className="font-medium">{fieldName.replaceAll('_', ' ')}</div>
                    <div className="text-slate-500">{String(field.value ?? '—')}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full ${colors[field.status]}`}>{field.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
