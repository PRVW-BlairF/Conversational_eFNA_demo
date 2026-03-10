'use client';

import { useMemo } from 'react';
import { useSession } from '@/hooks/useSession';
import { HeroHeader } from '@/components/HeroHeader';
import { JourneyStrip } from '@/components/JourneyStrip';
import { ConversationPanel } from '@/components/ConversationPanel';
import { FnaPanel } from '@/components/FnaPanel';
import { CopilotPanel } from '@/components/CopilotPanel';
import { InsightStrip } from '@/components/InsightStrip';

export default function Page() {
  const { session, guided } = useSession();
  const coverage = useMemo(() => {
    if (!session) return {};
    const result: Record<string, number> = {};
    Object.entries(session.fna.sections).forEach(([name, section]) => {
      const values = Object.values(section.fields);
      const complete = values.filter((f) => f.status === 'confirmed' || f.status === 'inferred').length;
      result[name] = Math.round((complete / values.length) * 100);
    });
    return result;
  }, [session]);

  return (
    <div className="space-y-4">
      <HeroHeader completion={session?.fna.completion_score ?? 0} onGuidedDemo={() => session && guided(session.id)} />
      <JourneyStrip progress={(session?.fna.completion_score ?? 0) > 70 ? 4 : 2} />
      {session?.warnings?.length ? <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-sm">Setup warning: {session.warnings.join(' | ')}</div> : null}
      <div className="grid grid-cols-3 gap-4">
        <ConversationPanel segments={session?.transcript ?? []} />
        <FnaPanel sections={session?.fna.sections ?? {}} />
        <CopilotPanel missing={session?.missing_fields ?? []} questions={session?.next_questions ?? []} contradictions={session?.fna.contradictions ?? []} />
      </div>
      <InsightStrip coverage={coverage} />
    </div>
  );
}
