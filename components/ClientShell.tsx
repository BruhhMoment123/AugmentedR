'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { LoadingScreen } from './ui/LoadingScreen';
import { Header, Hints } from './ui/Chrome';
import { SearchBar } from './ui/SearchBar';
import { Toolbar } from './ui/Toolbar';
import { FilterMenu } from './ui/FilterMenu';
import { InfoPanel } from './ui/InfoPanel';
import { SliceControl } from './ui/SliceControl';
import { TourOverlay } from './ui/TourOverlay';
import { Tooltip } from './ui/Tooltip';
import { Hints as HintsComponent } from './ui/Chrome';
import { DebugPanel } from './ui/DebugPanel';
import { ModelViewerARModal } from './ui/ModelViewerARModal';
import { exportCellGLB } from '@/lib/exportGLB';
import { liveScene } from './scene/Scene';

const CellCanvas = dynamic(
  () => import('../components/scene/CellCanvas').then((m) => m.CellCanvas),
  { ssr: false },
);

/** Dev-only button — lives in DOM, safely outside the R3F canvas. */
function ExportGLBButton() {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <button
      onClick={() => {
        if (liveScene) exportCellGLB(liveScene, 'cell.glb');
        else alert('Scene not ready yet — wait for the cell to finish loading.');
      }}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        padding: '10px 22px',
        background: 'linear-gradient(135deg,#1a6b3a,#0e4a28)',
        color: '#a8f0c4',
        border: '1px solid #2aaa60',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(0,200,100,0.25)',
        fontFamily: 'system-ui,sans-serif',
      }}
    >
      📦 Export Cell GLB
    </button>
  );
}

export function ClientShell() {
  const [ready, setReady] = useState(false);
  const [arModalOpen, setArModalOpen] = useState(false);

  return (
    <div
      className="relative h-dvh w-full touch-none overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 40%, #0c182c 0%, #060a14 60%, #020306 100%)',
      }}
    >
      {/* 3D Cell WebGL Canvas Layer */}
      <div className="absolute inset-0 z-10 pointer-events-auto">
        <CellCanvas onCreated={() => setReady(true)} />
      </div>

      {/* HUD Overlays (z-30 over canvas) */}
      <LoadingScreen done={ready} />
      <Header />
      <SearchBar />
      <Toolbar onOpenARModal={() => setArModalOpen(true)} />
      <FilterMenu />
      <InfoPanel />
      <SliceControl />
      <TourOverlay />
      <Tooltip />
      <HintsComponent />
      <ModelViewerARModal isOpen={arModalOpen} onClose={() => setArModalOpen(false)} />
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
      <ExportGLBButton />
    </div>
  );
}
