'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Layers, X } from 'lucide-react';
import { FILTER_LABELS, ORGANELLE_LIST } from '@/data/organelles';
import { useCellStore, type FilterKey } from '@/lib/store';

/**
 * Left dock: isolate a single structural system (e.g. show only
 * mitochondria). Everything else fades to a ghost.
 */
export function FilterMenu() {
  const filter = useCellStore((s) => s.filter);
  const setFilter = useCellStore((s) => s.setFilter);
  // Default to collapsed on mobile screens so the 3D exhibit isn't cluttered
  const [open, setOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : false);

  const counts = ORGANELLE_LIST.reduce<Partial<Record<FilterKey, number>>>((acc, o) => {
    acc[o.filterKey] = (acc[o.filterKey] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="pointer-events-auto absolute left-4 top-1/2 z-40 -translate-y-1/2">
      <div className="flex items-start gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          title="Isolate structure"
          aria-label="Toggle filter menu"
          className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md transition-all ${
            filter
              ? 'border-cyan-300/50 bg-cyan-400/20 text-cyan-200'
              : 'border-white/10 bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Filter size={16} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="glass-panel w-52 overflow-hidden rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  <Layers size={11} />
                  Isolate structure
                </span>
                {filter && (
                  <button onClick={() => setFilter(null)} className="text-white/40 hover:text-white" aria-label="Clear filter">
                    <X size={12} />
                  </button>
                )}
              </div>
              <ul className="max-h-72 overflow-y-auto p-1.5">
                <li>
                  <FilterRow
                    active={filter === null}
                    label="Everything"
                    count={ORGANELLE_LIST.length}
                    onClick={() => setFilter(null)}
                  />
                </li>
                {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
                  <li key={key}>
                    <FilterRow
                      active={filter === key}
                      label={FILTER_LABELS[key]}
                      count={counts[key] ?? 0}
                      onClick={() => setFilter(filter === key ? null : key)}
                    />
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterRow({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
        active ? 'bg-cyan-400/20 text-cyan-100' : 'text-white/70 hover:bg-white/[0.07] hover:text-white'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${active ? 'bg-cyan-300/20 text-cyan-200' : 'bg-white/[0.07] text-white/40'}`}>
        {count}
      </span>
    </button>
  );
}
