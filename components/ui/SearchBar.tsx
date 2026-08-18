'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { ORGANELLE_LIST } from '@/data/organelles';
import { useCellStore } from '@/lib/store';

/**
 * Search bar: type an organelle name, pick a result, and the camera flies
 * there with the organelle selected. Press "/" anywhere to focus it.
 */
export function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const select = useCellStore((s) => s.select);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ORGANELLE_LIST.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.scientificName.toLowerCase().includes(q) ||
        o.tagline.toLowerCase().includes(q),
    ).slice(0, 7);
  }, [query]);

  const go = (id: string) => {
    select(id);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="pointer-events-auto absolute left-1/2 top-[4.2rem] z-40 w-[88vw] max-w-xs -translate-x-1/2 sm:top-4 sm:w-[22rem]">
      <div className="glass-panel flex items-center gap-2 rounded-full px-3.5 py-2">
        <Search size={15} className="shrink-0 text-white/40" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search organelles…  ( / )"
          className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-white/40 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="glass-panel mt-2 overflow-hidden rounded-xl p-1.5"
          >
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => go(r.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{r.name}</span>
                    <span className="block truncate text-[11px] text-white/40">{r.tagline}</span>
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
