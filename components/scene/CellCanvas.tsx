'use client';

import { Canvas } from '@react-three/fiber';
import { useCellStore } from '@/lib/store';
import { Scene } from './Scene';


/**
 * The WebGL canvas for the 3D Human Cell exhibit.
 */
export function CellCanvas({ onCreated }: { onCreated?: () => void }) {
  const select = useCellStore((s) => s.select);
  const resetView = useCellStore((s) => s.resetView);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.1, 12.4], fov: 42, near: 0.1, far: 120 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      onCreated={onCreated}
      onPointerMissed={(e) => {
        if (e.type === 'click') select(null);
        else if (e.type === 'dblclick') resetView();
      }}
    >
      <color attach="background" args={['#04060d']} />
      <fog attach="fog" args={['#04060d', 16, 40]} />
      <Scene />
    </Canvas>
  );
}
