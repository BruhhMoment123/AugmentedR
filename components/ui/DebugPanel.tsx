'use client';

import { Leva, useControls } from 'leva';
import { useEffect } from 'react';
import { useCellStore } from '@/lib/store';

/**
 * Leva debug panel (collapsed by default) — engineering controls for
 * tuning the render without touching code.
 */
export function DebugPanel() {
  const setDebug = useCellStore((s) => s.setDebug);

  const { bloom } = useControls('Render', {
    bloom: { value: 1.0, min: 0, max: 2.5, step: 0.05, label: 'Bloom intensity' },
  });

  useEffect(() => {
    setDebug({ bloom });
  }, [bloom, setDebug]);

  return (
    <div className="absolute bottom-4 right-4 z-40 opacity-80">
      <Leva collapsed titleBar={{ title: 'Debug', filter: false }} />
    </div>
  );
}
