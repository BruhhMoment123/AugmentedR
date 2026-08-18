'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import { ORGANELLES } from '@/data/organelles';
import { pickable } from '@/lib/interaction';
import { useCellStore, type FilterKey, type Vec3 } from '@/lib/store';
import { Highlight } from './Highlight';

/**
 * OrganelleShell — the shared interaction wrapper used by every organelle.
 *
 * Responsibilities:
 *  - raycast picking with "click-through" priority (membrane/cytoplasm only
 *    win when no organelle lies beneath the cursor)
 *  - hover cursor + holographic highlight
 *  - flying the camera to the organelle when it becomes selected
 *  - exploded-view offset and filter-based visibility (critically damped)
 */

interface OrganelleShellProps {
  id: string;
  /** Base world position of the organelle. */
  position?: Vec3;
  /** Exploded view pushes the group this far away from the cell center. */
  explodeDistance?: number;
  /** Direction of the explode offset (defaults to normalized `position`). */
  explodeDir?: Vec3;
  /** Additional filter categories (besides its own) that keep it visible. */
  alsoShowFor?: FilterKey[];
  children: React.ReactNode;
  /** Skip wrapping children in the pickable group (custom picking inside). */
  noDefaultPick?: boolean;
  /** Set false to hide the holographic highlight (e.g. huge shells). */
  highlight?: boolean;
}

export function OrganelleShell({
  id,
  position = [0, 0, 0],
  explodeDistance = 1.4,
  explodeDir,
  alsoShowFor,
  children,
  noDefaultPick = false,
  highlight = true,
}: OrganelleShellProps) {
  const groupRef = useRef<Group>(null);
  const dimF = useRef(0);
  const explodeF = useRef(0);
  const info = ORGANELLES[id];

  const hovered = useCellStore((s) => s.hoveredId === id);
  const selected = useCellStore((s) => s.selectedId === id);
  const filter = useCellStore((s) => s.filter);
  useCursor(hovered);

  const visible =
    filter === null || info?.filterKey === filter || (alsoShowFor?.includes(filter) ?? false);

  const len = Math.hypot(position[0], position[1], position[2]) || 1;
  const dir: Vec3 = explodeDir ?? [position[0] / len, position[1] / len, position[2] / len];

  // Damp explode + dim factors; apply position/visibility imperatively.
  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const k = Math.min(1, delta * 3.2);
    const exploded = useCellStore.getState().exploded;
    explodeF.current += ((exploded ? 1 : 0) - explodeF.current) * k;
    dimF.current += ((visible ? 0 : 1) - dimF.current) * k;
    g.position.set(
      position[0] + dir[0] * explodeF.current * explodeDistance,
      position[1] + dir[1] * explodeF.current * explodeDistance,
      position[2] + dir[2] * explodeF.current * explodeDistance,
    );
    g.visible = dimF.current < 0.98;
  });

  // Camera flight triggered by selection — flies to the curated anchor
  // point from the biology database (world space).
  const flying = useRef(false);
  useEffect(() => {
    if (selected && info) flying.current = true;
  }, [selected, info]);

  const scratchTarget = useMemo(() => new Vector3(), []);
  const scratchDir = useMemo(() => new Vector3(), []);

  useFrame(({ camera }) => {
    if (!flying.current || !info) return;
    scratchTarget.set(info.anchor[0], info.anchor[1], info.anchor[2]);
    scratchDir
      .copy(camera.position)
      .sub(scratchTarget)
      .normalize()
      .multiplyScalar(info.cameraDistance)
      .add(scratchTarget);
    useCellStore
      .getState()
      .requestFlight(
        [scratchDir.x, scratchDir.y, scratchDir.z],
        [scratchTarget.x, scratchTarget.y, scratchTarget.z],
      );
    flying.current = false;
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        <Dimmer dimF={dimF}>
          {noDefaultPick ? children : <group {...pickable(id)}>{children}</group>}
        </Dimmer>
        {highlight && (hovered || selected) && <Highlight target={groupRef} color={info?.color ?? '#fff'} />}
      </group>
    </group>
  );
}

/**
 * Walks descendants once per frame and fades every material that carries a
 * `uDim` uniform (our custom shaders); built-in materials fade via opacity
 * (base value cached in userData on first sight).
 */
function Dimmer({ dimF, children }: { dimF: React.RefObject<number>; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const root = ref.current;
    if (!root) return;
    const d = dimF.current ?? 0;
    root.traverse((obj) => {
      const withMat = obj as unknown as { material?: unknown };
      if (!withMat.material) return;
      const mats = Array.isArray(withMat.material) ? withMat.material : [withMat.material];
      for (const m of mats) {
        const mat = m as {
          opacity: number;
          transparent: boolean;
          userData: Record<string, unknown>;
          uniforms?: Record<string, { value: number }>;
        };
        if (mat.uniforms?.uDim) {
          mat.uniforms.uDim.value = d;
        } else if ('opacity' in mat) {
          if (mat.userData.baseOpacity === undefined) {
            mat.userData.baseOpacity = mat.opacity;
            mat.transparent = true;
          }
          mat.opacity = (mat.userData.baseOpacity as number) * (1 - d * 0.92);
        }
      }
    });
  });
  return <group ref={ref}>{children}</group>;
}
