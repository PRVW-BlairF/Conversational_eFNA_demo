'use client';

import { useEffect, useState } from 'react';
import { getState, runGuidedDemo, startSession } from '@/lib/api';
import { SessionState } from '@/types/session';

export function useSession() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(false);

  async function init(mode: 'demo' | 'live' = 'demo') {
    setLoading(true);
    const created = await startSession(mode);
    const sessionId = created.session_id;
    const ws = new WebSocket(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace('http', 'ws')}/api/session/${sessionId}/stream`);
    ws.onmessage = async () => setSession(await getState(sessionId));
    setSession(await getState(sessionId));
    setLoading(false);
    return sessionId;
  }

  async function guided(sessionId: string) {
    await runGuidedDemo(sessionId);
    setSession(await getState(sessionId));
  }

  useEffect(() => {
    void init();
  }, []);

  return { session, loading, init, guided, refresh: async () => session && setSession(await getState(session.id)) };
}
