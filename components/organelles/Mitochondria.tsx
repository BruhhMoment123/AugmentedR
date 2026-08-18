'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { DoubleSide, Group, Vector3, type ShaderMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { makeCristaeGeometry, makeOrganicSphere, mulberry32 } from '@/utils/geometry';
import { useBumpTexture } from '@/utils/textures';
import { createCristaeMaterial } from '@/materials/materials';
import { usePhysicalMaterial } from '@/materials/usePhysicalMaterial';
import { OrganelleShell } from '../cell/OrganelleShell';
import { Particles } from '../cell/Particles';
import { useCellStore } from '@/lib/store';

/**
 * Mitochondria — seven representative organelles (a real human cell hosts
 * ~1,000–2,000; see data/organelles.ts for accuracy notes).
 *
 * Each has:
 *  - a translucent outer membrane (physical material, wet clearcoat)
 *  - five accordion-folded cristae sheets with a custom emissive shader
 *    whose energy bands sweep along the folds (electron transport chain)
 *  - ATP particles streaming through the matrix
 *  - gentle independent drift, rotation and exploded-view offsets
 */

interface MitoConfig {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  seed: number;
}

const MITOS: MitoConfig[] = [
  { pos: [2.9, -0.4, -2.0], rot: [0.3, 0.8, 0.2], scale: 1.0, seed: 1 },
  { pos: [-2.6, 2.2, 1.3], rot: [1.2, 0.2, 0.6], scale: 0.85, seed: 2 },
  { pos: [3.4, 1.8, 0.2], rot: [0.4, 1.9, 1.1], scale: 0.92, seed: 3 },
  { pos: [-1.8, -2.6, -1.8], rot: [2.1, 0.5, 0.3], scale: 1.05, seed: 4 },
  { pos: [0.6, -3.1, 1.9], rot: [0.8, 2.6, 1.5], scale: 0.8, seed: 5 },
  { pos: [-3.4, 0.6, 1.6], rot: [1.5, 1.1, 0.9], scale: 0.9, seed: 6 },
  { pos: [1.5, 2.6, 1.7], rot: [0.2, 2.2, 2.0], scale: 0.88, seed: 7 },
];

export function Mitochondria() {
  // Class-level hover: any mitochondrion lights up the whole population.
  const hovered = useCellStore((s) => s.hoveredId === 'mitochondria');
  const selected = useCellStore((s) => s.selectedId === 'mitochondria');
  const glowRef = useRef(0);
  const cristaeMats = useRef<ShaderMaterial[]>([]);

  const registerCristae = useCallback((mats: ShaderMaterial[], add: boolean) => {
    cristaeMats.current = add
      ? [...cristaeMats.current, ...mats]
      : cristaeMats.current.filter((m) => !mats.includes(m));
  }, []);

  useFrame((_, delta) => {
    glowRef.current += ((hovered || selected ? 1 : 0) - glowRef.current) * Math.min(1, delta * 8);
    for (const m of cristaeMats.current) {
      // eslint-disable-next-line react-hooks/immutability -- three.js uniforms are mutated imperatively by design
      m.uniforms.uHover.value = glowRef.current;
    }
  });

  return (
    <OrganelleShell id="mitochondria" position={[0, 0, 0]} highlight={false}>
      {MITOS.map((cfg) => (
        <Mitochondrion key={cfg.seed} config={cfg} registerCristae={registerCristae} />
      ))}
    </OrganelleShell>
  );
}

function Mitochondrion({
  config,
  registerCristae,
}: {
  config: MitoConfig;
  registerCristae: (mats: ShaderMaterial[], add: boolean) => void;
}) {
  const groupRef = useRef<Group>(null);
  const explodeF = useRef(0);
  const bump = useBumpTexture();

  const outerGeo = useMemo(
    () => makeOrganicSphere(0.8, 64, 48, 0.045, 1.1, config.seed * 3.3),
    [config.seed],
  );
  const outerMat = usePhysicalMaterial({
    color: '#b85f3a',
    roughness: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.25,
    transparent: true,
    opacity: 0.5,
    emissive: '#7a2e10',
    emissiveIntensity: 0.07,
    side: DoubleSide,
    bumpMap: bump,
    bumpScale: 0.04,
  });

  const cristae = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        geometry: makeCristaeGeometry(1.45, 0.78, 5, 0.17, i * 1.3 + config.seed),
        material: createCristaeMaterial(i * 1.7 + config.seed * 2.1),
        y: -0.26 + i * 0.13,
      })),
    [config.seed],
  );

  // Share cristae materials upward so class-level hover can drive uHover.
  const cristaeMatList = useMemo(() => cristae.map((c) => c.material), [cristae]);
  useEffect(() => {
    registerCristae(cristaeMatList, true);
    return () => registerCristae(cristaeMatList, false);
  }, [cristaeMatList, registerCristae]);

  const atpPositions = useMemo(() => {
    const rand = mulberry32(config.seed * 91);
    const arr = new Float32Array(46 * 3);
    for (let i = 0; i < 46; i++) {
      const v = new Vector3().randomDirection().multiplyScalar(Math.cbrt(rand()) * 0.55);
      arr[i * 3] = v.x * 0.8;
      arr[i * 3 + 1] = v.y * 0.5;
      arr[i * 3 + 2] = v.z * 0.5;
    }
    return arr;
  }, [config.seed]);

  const base = useMemo(() => new Vector3(...config.pos), [config.pos]);
  const dir = useMemo(() => base.clone().normalize(), [base]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const exploded = useCellStore.getState().exploded;
    explodeF.current += ((exploded ? 1 : 0) - explodeF.current) * Math.min(1, delta * 3);
    const t = state.clock.elapsedTime;
    const s = config.seed * 10;
    g.position.set(
      base.x + Math.sin(t * 0.42 + s) * 0.07 + dir.x * explodeF.current * 1.9,
      base.y + Math.sin(t * 0.36 + s * 1.3) * 0.055 + dir.y * explodeF.current * 1.9,
      base.z + Math.cos(t * 0.39 + s * 1.7) * 0.07 + dir.z * explodeF.current * 1.9,
    );
    g.rotation.y = config.rot[1] + t * 0.06;
    g.rotation.x = config.rot[0] + Math.sin(t * 0.25 + s) * 0.06;
  });

  return (
    <group ref={groupRef} position={config.pos} rotation={config.rot} scale={config.scale}>
      {/* Outer membrane */}
      <mesh geometry={outerGeo} material={outerMat} scale={[1.15, 0.62, 0.62]} />
      {/* Cristae folds + ATP, compressed to fit inside the outer membrane */}
      <group scale={[1, 0.58, 0.72]}>
        {cristae.map((c, i) => (
          <mesh key={i} geometry={c.geometry} material={c.material} position={[0, c.y, 0]} />
        ))}
        {/* ATP streaming through the matrix (fades before reaching the caps) */}
        <Particles
          count={46}
          positions={atpPositions}
          color="#e8b86a"
          size={6}
          opacity={0.55}
          speed={0.1}
          wanderAmp={0.05}
          flow={new Vector3(1, 0, 0)}
          flowBounds={new Vector3(1.1, 0, 0)}
          seed={config.seed * 13}
        />
      </group>
    </group>
  );
}
