'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Boxes,
  Camera,
  Grid,
  Home,
  Play,
  RotateCw,
  Scan,
  Scissors,
  Tag,
  Radio,
} from 'lucide-react';
import { useCellStore } from '@/lib/store';
import { launchAndroidAR } from '@/lib/arLauncher';

/**
 * Right-side control dock: visualization modes, saved viewpoints, tour, AR launcher.
 */
export function Toolbar({ onOpenARModal }: { onOpenARModal?: () => void }) {
  const labelMode = useCellStore((s) => s.labelMode);
  const cycleLabelMode = useCellStore((s) => s.cycleLabelMode);
  const xray = useCellStore((s) => s.xray);
  const toggleXray = useCellStore((s) => s.toggleXray);
  const wireframe = useCellStore((s) => s.wireframe);
  const toggleWireframe = useCellStore((s) => s.toggleWireframe);
  const exploded = useCellStore((s) => s.exploded);
  const toggleExploded = useCellStore((s) => s.toggleExploded);
  const sliceEnabled = useCellStore((s) => s.sliceEnabled);
  const setSliceEnabled = useCellStore((s) => s.setSliceEnabled);
  const autoRotate = useCellStore((s) => s.autoRotate);
  const toggleAutoRotate = useCellStore((s) => s.toggleAutoRotate);
  const resetView = useCellStore((s) => s.resetView);
  const startTour = useCellStore((s) => s.startTour);

  const [isMobile, setIsMobile] = useState(false);
  const [viewsOpen, setViewsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  const handleARClick = () => {
    launchAndroidAR();
  };

  if (isMobile) {
    // Uncluttered, compact mobile control dock
    return (
      <div className="pointer-events-auto absolute right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2">
        <ToolButton
          icon={<Tag size={16} />}
          label={`Labels: ${labelMode}`}
          active={labelMode !== 'none'}
          onClick={cycleLabelMode}
        />
        <ToolButton icon={<Boxes size={16} />} label="Exploded view" active={exploded} onClick={toggleExploded} />
        <ToolButton icon={<Home size={16} />} label="Reset camera" onClick={resetView} />
        <ToolButton
          icon={<Radio size={18} className="animate-pulse text-emerald-400" />}
          label="Launch Camera AR"
          accent
          onClick={handleARClick}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-1.5">
      <ToolButton
        icon={<Tag size={16} />}
        label={`Labels: ${labelMode}`}
        active={labelMode !== 'none'}
        onClick={cycleLabelMode}
      />
      <ToolButton icon={<Scissors size={16} />} label="Slice mode" active={sliceEnabled} onClick={() => setSliceEnabled(!sliceEnabled)} />
      <ToolButton icon={<Boxes size={16} />} label="Exploded view" active={exploded} onClick={toggleExploded} />
      <ToolButton icon={<Scan size={16} />} label="X-ray view" active={xray} onClick={toggleXray} />
      <ToolButton icon={<Grid size={16} />} label="Wireframe" active={wireframe} onClick={toggleWireframe} />
      <Divider />
      <ToolButton icon={<RotateCw size={16} />} label="Auto-rotate" active={autoRotate} onClick={toggleAutoRotate} />
      <div className="relative">
        <ToolButton icon={<Camera size={16} />} label="Saved viewpoints" active={viewsOpen} onClick={() => setViewsOpen((v) => !v)} />
        <AnimatePresence>
          {viewsOpen && (
            <motion.ul
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="glass-panel absolute right-12 top-0 w-44 overflow-hidden rounded-xl p-1.5"
            >
              {SAVED_VIEWS.map((v) => (
                <li key={v.name}>
                  <button
                    onClick={() => {
                      useCellStore.getState().requestFlight(v.position, v.lookAt);
                      setViewsOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs text-white/80 transition-colors hover:bg-white/10"
                  >
                    {v.name}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <ToolButton icon={<Home size={16} />} label="Reset camera" onClick={resetView} />
      <Divider />
      <ToolButton
        icon={<Radio size={18} className="animate-pulse text-emerald-400" />}
        label="Launch Camera AR"
        accent
        onClick={handleARClick}
      />
      <ToolButton icon={<Play size={16} />} label="Guided tour" onClick={startTour} />
    </div>
  );
}

function ToolButton({
  icon,
  label,
  active = false,
  accent = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md transition-all ${
        accent
          ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
          : active
          ? 'border-cyan-300/50 bg-cyan-400/20 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
          : 'border-white/10 bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="my-1 h-[1px] w-6 bg-white/10" />;
}

const SAVED_VIEWS: { name: string; position: [number, number, number]; lookAt: [number, number, number] }[] = [
  { name: 'Full overview', position: [0, 2.1, 12.4], lookAt: [0, 0, 0] },
  { name: 'Nucleus core', position: [0.5, 0.4, 3.2], lookAt: [0, 0, 0] },
  { name: 'Mitochondria detail', position: [3.1, 1.2, 3.8], lookAt: [1.8, 0.6, 0.8] },
  { name: 'Golgi apparatus', position: [-2.2, 1.8, 4.2], lookAt: [-1.4, 0.8, 0.6] },
  { name: 'Cell membrane', position: [0, 0, 7.8], lookAt: [0, 0, 3.8] },
];
