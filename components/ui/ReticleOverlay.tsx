'use client';

import { useState, useEffect } from 'react';
import { Target, Scan, CheckCircle2, Sparkles } from 'lucide-react';
import { launchAndroidAR } from '@/lib/arLauncher';

/**
 * Holographic 3D Surface Placement Reticle HUD Overlay.
 * Displays interactive target reticle, coordinate ticks, plane detection status,
 * and quick-anchor triggers for native AR placement.
 */
export function ReticleOverlay() {
  const [active, setActive] = useState(false);
  const [planeLocked, setPlaneLocked] = useState(false);

  useEffect(() => {
    if (!active) return;
    // Simulate surface plane target locking after camera scan
    const timer = setTimeout(() => {
      setPlaneLocked(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <>
      {/* Reticle Toggle Button on right dock */}
      <button
        onClick={() => {
          setActive((v) => !v);
          setPlaneLocked(false);
        }}
        title="Toggle Surface Placement Reticle"
        aria-label="Toggle Placement Reticle"
        className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md transition-all shadow-lg ${
          active
            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-emerald-500/20 ring-2 ring-emerald-400/40'
            : 'border-white/10 bg-black/60 text-white/70 hover:bg-white/20'
        }`}
      >
        <Target size={18} className={active ? 'animate-pulse text-emerald-400' : ''} />
      </button>

      {/* Futuristic Holographic Placement Reticle */}
      {active && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center select-none">
          {/* Status Badge */}
          <div className="absolute top-16 flex items-center gap-2 rounded-full border border-emerald-400/30 bg-black/70 px-4 py-1.5 backdrop-blur-md shadow-xl animate-fade-in">
            {planeLocked ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-400 animate-bounce" />
                <span className="text-xs font-bold text-emerald-300 tracking-wide uppercase">
                  Surface Plane Locked · Tap to Anchor
                </span>
              </>
            ) : (
              <>
                <Scan size={15} className="text-cyan-400 animate-spin" />
                <span className="text-xs font-bold text-cyan-200 tracking-wide uppercase">
                  Scanning Surface · Move Phone Slowly
                </span>
              </>
            )}
          </div>

          {/* Animated Holographic Target Reticle */}
          <div className="relative flex h-56 w-56 items-center justify-center">
            {/* Outer Rotating Ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-dashed transition-colors duration-500 ${
                planeLocked ? 'border-emerald-400/80 animate-spin-slow' : 'border-cyan-400/40 animate-spin-fast'
              }`}
              style={{ animationDuration: planeLocked ? '12s' : '4s' }}
            />

            {/* Inner Pulsing Target Circle */}
            <div
              className={`h-40 w-40 rounded-full border-2 transition-all duration-500 ${
                planeLocked
                  ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.4)] scale-105'
                  : 'border-cyan-300/40 bg-cyan-500/5 animate-pulse'
              }`}
            />

            {/* Center Crosshair Ticks */}
            <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            {/* Center Focal Point Dot */}
            <div
              className={`h-4 w-4 rounded-full transition-all ${
                planeLocked ? 'bg-emerald-400 shadow-[0_0_15px_#34d399] scale-125' : 'bg-cyan-300 animate-ping'
              }`}
            />

            {/* Corner Bracket Markers */}
            <div className="absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2 border-cyan-300" />
            <div className="absolute -right-2 -top-2 h-4 w-4 border-r-2 border-t-2 border-cyan-300" />
            <div className="absolute -bottom-2 -left-2 h-4 w-4 border-b-2 border-l-2 border-cyan-300" />
            <div className="absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-cyan-300" />
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={() => launchAndroidAR()}
            className="pointer-events-auto mt-8 flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-5 py-3 text-xs font-extrabold text-emerald-200 backdrop-blur-md transition-all hover:bg-emerald-500/30 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Sparkles size={16} className="text-emerald-300 animate-pulse" />
            <span>PROJECT CELL ON RETICLE TARGET</span>
          </button>
        </div>
      )}
    </>
  );
}
