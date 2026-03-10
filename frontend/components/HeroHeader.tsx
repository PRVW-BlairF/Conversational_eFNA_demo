'use client';

import { motion } from 'framer-motion';
import { Mic, Square, Upload, FileDown } from 'lucide-react';

export function HeroHeader({ completion, onGuidedDemo }: { completion: number; onGuidedDemo: () => void }) {
  return (
    <div className="rounded-xl2 bg-copilot-teal text-copilot-inverse p-6 shadow-card">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-semibold">AI Fact Find Copilot</h1>
          <p className="text-copilot-soft mt-1">Live conversation mapping into a structured financial fact find</p>
          <div className="flex gap-2 mt-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-copilot-lime text-copilot-teal font-medium">Demo</span>
            <span className="px-3 py-1 rounded-full border border-copilot-border">Ready for review</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-copilot-soft">Completion</div>
          <div className="text-3xl font-bold">{completion}%</div>
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button className="px-4 py-2 rounded-full bg-copilot-lime text-copilot-teal font-medium flex items-center gap-2"><Mic size={16} />Start listening</button>
        <button className="px-4 py-2 rounded-full bg-copilot-tealDark border border-copilot-border flex items-center gap-2"><Square size={16} />Stop listening</button>
        <button className="px-4 py-2 rounded-full bg-copilot-tealDark border border-copilot-border flex items-center gap-2"><Upload size={16} />Upload recording</button>
        <button onClick={onGuidedDemo} className="px-4 py-2 rounded-full bg-white text-copilot-teal font-medium flex items-center gap-2"><FileDown size={16} />Run guided demo</button>
      </div>
      <motion.div className="h-1 bg-copilot-lime/40 rounded-full mt-5 overflow-hidden" initial={{ width: 0 }} animate={{ width: '100%' }}>
        <motion.div className="h-full bg-copilot-lime" initial={{ width: 0 }} animate={{ width: `${completion}%` }} />
      </motion.div>
    </div>
  );
}
