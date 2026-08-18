'use client';

import { useMemo, useRef } from 'react';
import { CatmullRomCurve3, Group, TubeGeometry, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32, randomInShell } from '@/utils/geometry';
import { slicePlane } from '@/lib/uniforms';
import { pickable } from '@/lib/interaction';
import { OrganelleShell } from '../cell/OrganelleShell';
import { NUCLEUS_POS } from './Nucleus';
import { useCellStore } from '@/lib/store';

/**
 * The cytoskeleton — three fiber systems, each separately selectable.
 *
 *  - Microtubules: 13 hollow tubes radiating from the centrosome, with a
 *    slow "treadmilling" sway (dynamic instability is hinted by growth /
 *    shrink cycles of a few representative fibers).
 *  - Actin filaments: a thin, dense cortical mesh just under the membrane.
 *  - Intermediate filaments: slack ropes caging the nucleus.
 *
 * All fibers are TubeGeometry along seeded Catmull-Rom splines.
 */

const CENTROSOME = new Vector3(1.0, 1.3, 1.6);

export function Cytoskeleton() {
  return (
    <>
      <Microtubules />
      <ActinFilaments />
      <IntermediateFilaments />
    </>
  );
}

function Microtubules() {
  const groupRef = useRef<Group>(null);

  const fibers = useMemo(() => {
    const rand = mulberry32(139);
    return Array.from({ length: 13 }, (_, i) => {
      const dir = randomInShell(rand, 1, 1).normalize();
      // Fan fibers outward, biasing away from the nucleus volume.
      if (dir.distanceTo(new Vector3(...NUCLEUS_POS).sub(CENTROSOME).normalize()) < 0.4) {
        dir.applyAxisAngle(new Vector3(0, 1, 0), 0.8);
      }
      const end = CENTROSOME.clone().addScaledVector(dir, 3.0 + rand() * 1.4);
      const mid1 = CENTROSOME.clone().addScaledVector(dir, 1.1).add(randomInShell(rand, 0, 0.35));
      const mid2 = CENTROSOME.clone().addScaledVector(dir, 2.2).add(randomInShell(rand, 0, 0.45));
      const curve = new CatmullRomCurve3([CENTROSOME.clone(), mid1, mid2, end], false, 'centripetal', 0.6);
      return { geometry: new TubeGeometry(curve, 40, 0.03, 6, false), key: i };
    });
  }, []);

  const hovered = useCellStore((s) => s.hoveredId === 'microtubules');
  const selected = useCellStore((s) => s.selectedId === 'microtubules');
  const emissiveRef = useRef(0.12);

  useFrame((state, delta) => {
    const target = hovered || selected ? 0.4 : 0.12;
    emissiveRef.current += (target - emissiveRef.current) * Math.min(1, delta * 8);
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.1) * 0.03;
    // Treadmilling pulse on a few fibers (scale from the centrosome end).
    g.children.forEach((child, i) => {
      if (i % 4 !== 0) return;
      const grow = 0.9 + 0.1 * Math.sin(t * 0.45 + i * 2.1);
      child.scale.setScalar(grow);
    });
    g.traverse((obj) => {
      const mat = (obj as { material?: { emissiveIntensity?: number } }).material;
      if (mat && mat.emissiveIntensity !== undefined) mat.emissiveIntensity = emissiveRef.current;
    });
  });

  return (
    <OrganelleShell id="microtubules" position={[0, 0, 0]} highlight={false} noDefaultPick>
      <group ref={groupRef} {...pickable('microtubules')}>
        {fibers.map((f) => (
          <mesh key={f.key} geometry={f.geometry}>
            <meshPhysicalMaterial
              color="#4f9aa6"
              roughness={0.45}
              emissive="#163e46"
              emissiveIntensity={0.12}
              transparent
              opacity={0.92}
              clippingPlanes={[slicePlane]}
            />
          </mesh>
        ))}
      </group>
    </OrganelleShell>
  );
}

function ActinFilaments() {
  const fibers = useMemo(() => {
    const rand = mulberry32(149);
    return Array.from({ length: 20 }, (_, i) => {
      const center = randomInShell(rand, 3.6, 4.35);
      const tangent = randomInShell(rand, 1, 1).normalize().cross(center.clone().normalize()).normalize();
      const pts = [-1, -0.3, 0.4, 1].map((t, j) =>
        center
          .clone()
          .addScaledVector(tangent, t * (0.3 + rand() * 0.25))
          .add(randomInShell(rand, 0, 0.12))
          .add(new Vector3(0, (j % 2) * 0.05, 0)),
      );
      const curve = new CatmullRomCurve3(pts, false, 'centripetal', 0.5);
      return { geometry: new TubeGeometry(curve, 24, 0.013, 5, false), key: i };
    });
  }, []);

  return <FiberGroup id="actin-filaments" fibers={fibers} color="#b85e80" emissive="#4e1e32" baseGlow={0.1} />;
}

function IntermediateFilaments() {
  const fibers = useMemo(() => {
    const rand = mulberry32(157);
    const nucleus = new Vector3(...NUCLEUS_POS);
    return Array.from({ length: 9 }, (_, i) => {
      const radius = 2.15 + rand() * 0.55;
      const tilt = rand() * Math.PI;
      const pts = Array.from({ length: 8 }, (_, j) => {
        const a = (j / 8) * Math.PI * 2;
        return nucleus
          .clone()
          .add(
            new Vector3(Math.cos(a) * radius, Math.sin(a * 2 + tilt) * 0.5, Math.sin(a) * radius)
              .applyAxisAngle(new Vector3(1, 0, 0), tilt),
          );
      });
      const curve = new CatmullRomCurve3(pts, true, 'centripetal', 0.5);
      return { geometry: new TubeGeometry(curve, 64, 0.02, 5, true), key: i };
    });
  }, []);

  return <FiberGroup id="intermediate-filaments" fibers={fibers} color="#8a76b8" emissive="#2e1e56" baseGlow={0.1} />;
}

/** Shared renderer for the thin fiber populations. */
function FiberGroup({
  id,
  fibers,
  color,
  emissive,
  baseGlow,
}: {
  id: string;
  fibers: { geometry: TubeGeometry; key: number }[];
  color: string;
  emissive: string;
  baseGlow: number;
}) {
  const groupRef = useRef<Group>(null);
  const hovered = useCellStore((s) => s.hoveredId === id);
  const selected = useCellStore((s) => s.selectedId === id);
  const glow = useRef(baseGlow);

  useFrame((_, delta) => {
    const target = hovered || selected ? baseGlow + 0.25 : baseGlow;
    glow.current += (target - glow.current) * Math.min(1, delta * 8);
    const g = groupRef.current;
    if (!g) return;
    g.traverse((obj) => {
      const mat = (obj as { material?: { emissiveIntensity?: number } }).material;
      if (mat && mat.emissiveIntensity !== undefined) mat.emissiveIntensity = glow.current;
    });
  });

  return (
    <OrganelleShell id={id} position={[0, 0, 0]} highlight={false} noDefaultPick>
      <group ref={groupRef} {...pickable(id)}>
        {fibers.map((f) => (
          <mesh key={f.key} geometry={f.geometry}>
            <meshPhysicalMaterial
              color={color}
              roughness={0.45}
              emissive={emissive}
              emissiveIntensity={baseGlow}
              transparent
              opacity={0.85}
              clippingPlanes={[slicePlane]}
            />
          </mesh>
        ))}
      </group>
    </OrganelleShell>
  );
}
