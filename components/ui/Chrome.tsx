'use client';

import { useRouter } from 'next/navigation';
import { Dna, MousePointer2, Move3d, ZoomIn, ArrowLeft } from 'lucide-react';

/** Top-left header with back button + brand chip. */
export function Header() {
  const router = useRouter();

  return (
    <header className="absolute left-3 top-3 z-40 flex items-center gap-2 select-none">
      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard')}
        aria-label="Back to lessons"
        className="pointer-events-auto flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-black/60 px-3 text-xs font-bold text-white/90 backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 shadow-lg"
      >
        <ArrowLeft size={14} className="text-cyan-400" />
        <span>Back</span>
      </button>

      {/* Title Chip */}
      <div className="glass-panel flex items-center gap-2 rounded-xl px-3 py-1.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/30 to-violet-500/30">
          <Dna size={14} className="text-cyan-300" />
        </div>
        <div>
          <h1 className="text-xs font-bold leading-none text-white">Human Cell</h1>
          <p className="text-[8px] uppercase tracking-[0.18em] text-white/40 mt-0.5">3D Exhibit</p>
        </div>
      </div>
    </header>
  );
}

/** Bottom-left interaction hints (auto-hidden on small screens). */
export function Hints() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-40 hidden select-none gap-3 text-[10px] text-white/35 md:flex">
      <span className="flex items-center gap-1.5">
        <Move3d size={11} /> drag · rotate
      </span>
      <span className="flex items-center gap-1.5">
        <ZoomIn size={11} /> scroll · zoom
      </span>
      <span className="flex items-center gap-1.5">
        <MousePointer2 size={11} /> click organelle · explore
      </span>
    </div>
  );
}
