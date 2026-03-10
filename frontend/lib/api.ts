import { SessionState } from '@/types/session';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function startSession(mode: 'demo' | 'live' = 'demo') {
  const res = await fetch(`${API}/session/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode }) });
  return res.json();
}

export async function runGuidedDemo(sessionId: string) {
  return fetch(`${API}/session/${sessionId}/guided-demo`, { method: 'POST' });
}

export async function getState(sessionId: string): Promise<SessionState> {
  const res = await fetch(`${API}/session/${sessionId}/state`, { cache: 'no-store' });
  return res.json();
}

export async function getSummary(sessionId: string) {
  const res = await fetch(`${API}/session/${sessionId}/summary`, { cache: 'no-store' });
  return res.json();
}
