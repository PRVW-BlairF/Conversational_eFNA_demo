'use client';

import { useEffect, useState } from 'react';
import { SessionState } from '@/types/session';
import { buildDemoState, seedLength } from '@/lib/demoSession';

const API = process.env.NEXT_PUBLIC_API_URL;
const STORAGE_KEY = 'ai-fact-find-copilot-state';

export function useSession() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  async function init() {
    setLoading(true);
    if (!API) {
      const fromStorage = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const restored = fromStorage ? (JSON.parse(fromStorage) as SessionState) : buildDemoState(0);
      setSession(restored);
      setStep(restored.transcript.length);
      setLoading(false);
      return restored.id;
    }

    const res = await fetch(`${API}/session/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'demo' }) });
    const created = await res.json();
    const stateRes = await fetch(`${API}/session/${created.session_id}/state`, { cache: 'no-store' });
    const state = (await stateRes.json()) as SessionState;
    setSession(state);
    setLoading(false);
    return created.session_id;
  }

  async function guided() {
    if (!session) return;
    if (!API) {
      const next = buildDemoState(Math.min(step + 1, seedLength));
      setStep(Math.min(step + 1, seedLength));
      setSession(next);
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return;
    }

    await fetch(`${API}/session/${session.id}/guided-demo`, { method: 'POST' });
    const stateRes = await fetch(`${API}/session/${session.id}/state`, { cache: 'no-store' });
    setSession((await stateRes.json()) as SessionState);
  }

  async function resetDemo() {
    const next = buildDemoState(0);
    setStep(0);
    setSession(next);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  useEffect(() => {
    void init();
  }, []);

  return { session, loading, guided, resetDemo };
}
