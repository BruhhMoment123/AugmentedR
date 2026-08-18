'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Scissors } from 'lucide-react';
import { useCellStore } from '@/lib/store';

/**
 * Bottom-center slicing plane control (visible when slice mode is on).
 * Drag to sweep a medical-imaging-style cutting plane through the cell.
 */
export function SliceControl() {
  const sliceEnabled = useCellStore((s) => s.sliceEnabled);
  const slicePosition = useCellStore((s) => s.slicePosition);
  const setSlicePosition = useCellStore((s) => s.setSlicePosition);

  return (
    <AnimatePresence>
      {sliceEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-panel pointer-events-auto absolute bottom-6 left-1/2 z-40 flex w-[19rem] -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3"
        >
          <Scissors size={14} className="shrink-0 text-cyan-300" />
          <input
            type="range"
            min={-5.5}
            max={5.5}
            step={0.05}
            value={slicePosition}
            onChange={(e) => setSlicePosition(parseFloat(e.target.value))}
            className="cell-slider w-full"
            aria-label="Slice plane position"
          />
          <span className="w-12 shrink-0 text-right font-mono text-[10px] text-white/50">
            {slicePosition.toFixed(1)} µm
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
