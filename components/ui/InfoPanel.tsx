'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Crosshair, Pause, Play, Sparkles, BookOpen, Dna, MapPin, Cog } from 'lucide-react';
import { ORGANELLES } from '@/data/organelles';
import { useCellStore } from '@/lib/store';

/**
 * The floating encyclopedia panel for the selected organelle.
 * Glassmorphism card with structured biology content and related links.
 */
export function InfoPanel() {
  const selectedId = useCellStore((s) => s.selectedId);
  const select = useCellStore((s) => s.select);
  const animationsPaused = useCellStore((s) => s.animationsPaused);
  const toggleAnimationsPaused = useCellStore((s) => s.toggleAnimationsPaused);

  const info = selectedId ? ORGANELLES[selectedId] : null;

  return (
    <AnimatePresence>
      {info && (
        <motion.aside
          key={info.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="glass-panel pointer-events-auto absolute right-4 top-24 z-40 flex max-h-[calc(100dvh-8rem)] w-[21rem] flex-col overflow-hidden rounded-2xl"
        >
          {/* Header */}
          <div className="relative shrink-0 border-b border-white/10 p-4" style={{ background: `linear-gradient(135deg, ${info.color}22, transparent)` }}>
            <button
              onClick={() => select(null)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close panel"
            >
              <X size={15} />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: info.color }}>
              <Dna size={12} />
              Organelle
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white">{info.name}</h2>
            <p className="text-[11px] italic text-white/45">{info.scientificName}</p>
            <p className="mt-1.5 text-xs text-white/70">{info.tagline}</p>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[13px] leading-relaxed text-white/75">
            <Section icon={<BookOpen size={12} />} title="Overview">
              {info.description}
            </Section>
            <Section icon={<Cog size={12} />} title="Primary function">
              {info.function}
            </Section>
            <Section icon={<Dna size={12} />} title="Structure">
              {info.structure}
            </Section>
            <Section icon={<MapPin size={12} />} title="Location">
              {info.location}
            </Section>

            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                <Sparkles size={12} />
                Did you know
              </div>
              <ul className="space-y-2">
                {info.facts.map((f, i) => (
                  <li key={i} className="flex gap-2 rounded-lg bg-white/[0.04] p-2.5 text-xs text-white/70">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: info.color }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {info.related.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  Related organelles
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {info.related.map((rid) => {
                    const rel = ORGANELLES[rid];
                    if (!rel) return null;
                    return (
                      <button
                        key={rid}
                        onClick={() => select(rid)}
                        className="rounded-full border px-2.5 py-1 text-[11px] transition-colors hover:bg-white/10"
                        style={{ borderColor: `${rel.color}55`, color: rel.color }}
                      >
                        {rel.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="flex shrink-0 items-center gap-2 border-t border-white/10 p-3">
            <button
              onClick={() => {
                const { requestFlight } = useCellStore.getState();
                const a = info.anchor;
                const len = Math.hypot(a[0], a[1], a[2]) || 1;
                const d = info.cameraDistance;
                requestFlight(
                  [a[0] + (a[0] / len) * d, a[1] + (a[1] / len) * d + d * 0.3, a[2] + (a[2] / len) * d],
                  a,
                );
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              <Crosshair size={13} />
              Refocus camera
            </button>
            <button
              onClick={toggleAnimationsPaused}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/10"
              title={animationsPaused ? 'Resume molecular motion' : 'Pause molecular motion'}
            >
              {animationsPaused ? <Play size={13} /> : <Pause size={13} />}
              {animationsPaused ? 'Resume' : 'Freeze'}
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
        {icon}
        {title}
      </div>
      <p>{children}</p>
    </div>
  );
}
