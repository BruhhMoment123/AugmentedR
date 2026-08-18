'use client';

import { useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { damp3 } from 'maath/easing';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useCellStore } from '@/lib/store';

/**
 * OrbitControls + smooth camera flights.
 *
 * When the store carries a flight request (organelle selected, search hit,
 * tour stop, saved viewpoint, reset), the camera position and the controls
 * target are critically-damped toward it. The request clears on arrival so
 * the user can immediately take over with the mouse.
 */
export function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const autoRotate = useCellStore((s) => s.autoRotate);
  const flying = useCellStore((s) => s.flight !== null);

  const targetPos = useMemo(() => new Vector3(), []);
  const targetLook = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const flight = useCellStore.getState().flight;
    if (flight) {
      targetPos.set(...flight.position);
      targetLook.set(...flight.lookAt);
      damp3(state.camera.position, targetPos, 0.6, delta);
      damp3(controls.target, targetLook, 0.6, delta);
      controls.update();
      const arrived =
        state.camera.position.distanceTo(targetPos) < 0.08 &&
        controls.target.distanceTo(targetLook) < 0.05;
      if (arrived) useCellStore.getState().clearFlight();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.85}
      panSpeed={0.7}
      zoomSpeed={0.9}
      autoRotate={autoRotate && !flying}
      autoRotateSpeed={0.55}
      minDistance={1.05}
      maxDistance={30}
    />
  );
}
