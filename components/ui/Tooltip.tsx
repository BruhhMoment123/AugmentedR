'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ORGANELLES } from '@/data/organelles';
import { useCellStore } from '@/lib/store';

/**
 * Cursor-following tooltip showing the hovered organelle's name.
 * Position is tracked on the app shell (pointermove) and kept in local
 * state — only this tiny component re-renders.
 */
export function Tooltip() {
  const hoveredId = useCellStore((s) => s.hoveredId);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const info = hoveredId ? ORGANELLES[hoveredId] : null;

  return (
    <AnimatePresence>
      {info && (
        <motion.div
          key={info.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.12 }}
          className="pointer-events-none fixed z-50"
          style={{ left: pos.x + 16, top: pos.y + 14 }}
        >
          <div className="glass-chip flex items-center gap-2 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: info.color }} />
            <span className="text-xs font-medium text-white/90">{info.name}</span>
            <span className="text-[10px] text-white/40">click to explore</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
