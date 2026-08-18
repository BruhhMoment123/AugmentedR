'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Group, type ShaderMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { makeOrganicSphere, mulberry32 } from '@/utils/geometry';
import { createGlowMaterial } from '@/materials/materials';
import { OrganelleShell } from '../cell/OrganelleShell';
import { Particles } from '../cell/Particles';
import { useDriftExplode } from '@/hooks/useFloat';
import { useCellStore } from '@/lib/store';

/**
 * Lysosomes (acidic green-gold glow) and peroxisomes (cyan, with catalase
 * sparkles). Both are small single-membrane spheres whose interiors pulse
 * with enzymatic activity via the shared glow shader.
 */

const LYSOSOMES: { pos: [number, number, number]; r: number; seed: number }[] = [
  { pos: [-1.9, -2.9, 1.6], r: 0.21, seed: 1 },
  { pos: [-2.7, -1.7, 2.0], r: 0.17, seed: 2 },
  { pos: [2.2, -2.4, -0.9], r: 0.19, seed: 3 },
  { pos: [0.9, -1.6, 2.9], r: 0.16, seed: 4 },
  { pos: [-0.5, -3.4, -0.4], r: 0.22, seed: 5 },
  { pos: [3.2, -1.3, 1.3], r: 0.15, seed: 6 },
];

const PEROXISOMES: { pos: [number, number, number]; r: number; seed: number }[] = [
  { pos: [3.1, 0.9, 1.9], r: 0.17, seed: 11 },
  { pos: [-2.2, 2.8, -0.9], r: 0.15, seed: 12 },
  { pos: [1.1, -0.9, -3.1], r: 0.18, seed: 13 },
  { pos: [-3.0, -0.8, -2.2], r: 0.14, seed: 14 },
];

export function Lysosomes() {
  return (
    <OrganelleShell id="lysosomes" position={[0, 0, 0]} highlight={false}>
      <GlowPopulation id="lysosomes" configs={LYSOSOMES} color="#7a962e" coreColor="#c8e86a" />
    </OrganelleShell>
  );
}

export function Peroxisomes() {
  return (
    <OrganelleShell id="peroxisomes" position={[0, 0, 0]} highlight={false}>
      <GlowPopulation id="peroxisomes" configs={PEROXISOMES} color="#2a968a" coreColor="#7ae0d0" sparks />
    </OrganelleShell>
  );
}

/** A set of glowing spheres sharing one hover/selection state. */
function GlowPopulation({
  id,
  configs,
  color,
  coreColor,
  sparks = false,
}: {
  id: string;
  configs: typeof LYSOSOMES;
  color: string;
  coreColor: string;
  sparks?: boolean;
}) {
  const hovered = useCellStore((s) => s.hoveredId === id);
  const selected = useCellStore((s) => s.selectedId === id);
  const glow = useRef(0);
  const mats = useRef<ShaderMaterial[]>([]);

  const materials = useMemo(
    () => configs.map((c) => createGlowMaterial({ color, coreColor, seed: c.seed })),
    [configs, color, coreColor],
  );
  useEffect(() => {
    mats.current = materials;
  }, [materials]);

  const geometries = useMemo(
    () => configs.map((c) => makeOrganicSphere(c.r, 40, 28, c.r * 0.12, 2.2, c.seed)),
    [configs],
  );

  const sparkPositions = useMemo(() => {
    const rand = mulberry32(55);
    return configs.map((c) => {
      const arr = new Float32Array(14 * 3);
      for (let i = 0; i < 14; i++) {
        arr[i * 3] = (rand() - 0.5) * c.r * 1.6;
        arr[i * 3 + 1] = (rand() - 0.5) * c.r * 1.6;
        arr[i * 3 + 2] = (rand() - 0.5) * c.r * 1.6;
      }
      return arr;
    });
  }, [configs]);

  useFrame((_, delta) => {
    glow.current += ((hovered || selected ? 1 : 0) - glow.current) * Math.min(1, delta * 8);
    for (const m of mats.current) {
      // eslint-disable-next-line react-hooks/immutability -- three.js uniforms are mutated imperatively by design
      m.uniforms.uHover.value = glow.current;
    }
  });

  return (
    <>
      {configs.map((c, i) => (
        <GlowSphere key={c.seed} config={c} geometry={geometries[i]} material={materials[i]} sparks={sparks} sparkPositions={sparkPositions[i]} />
      ))}
    </>
  );
}

function GlowSphere({
  config,
  geometry,
  material,
  sparks,
  sparkPositions,
}: {
  config: { pos: [number, number, number]; r: number; seed: number };
  geometry: ReturnType<typeof makeOrganicSphere>;
  material: ShaderMaterial;
  sparks: boolean;
  sparkPositions: Float32Array;
}) {
  const ref = useRef<Group>(null);
  useDriftExplode(ref, config.pos, { floatAmp: 0.05, speed: 0.5, explodeDist: 2.0, seed: config.seed });

  return (
    <group ref={ref} position={config.pos}>
      <mesh geometry={geometry} material={material} />
      {sparks && (
        <Particles
          count={14}
          positions={sparkPositions}
          color="#a8e8dc"
          size={4}
          opacity={0.45}
          wanderAmp={0.06}
          seed={config.seed}
        />
      )}
    </group>
  );
}
