import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

export function InsightStrip({ coverage }: { coverage: Record<string, number> }) {
  const data = Object.entries(coverage).slice(0, 5).map(([name, value]) => ({ name: name.slice(0, 10), value }));
  return (
    <div className="bg-white rounded-xl2 p-4 shadow-card mt-4 h-36">
      <p className="font-medium mb-2">Coverage insight strip</p>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}><XAxis dataKey="name" /><Bar dataKey="value" fill="#17383A" radius={[8, 8, 0, 0]} /></BarChart>
      </ResponsiveContainer>
    </div>
  );
}
