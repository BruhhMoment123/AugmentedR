'use client';

import { useEffect, useMemo, useRef } from 'react';
import { DoubleSide, Group, InstancedMesh, Object3D, TubeGeometry, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { fibonacciSphere, makeOrganicSphere, mulberry32, randomWalkCurve } from '@/utils/geometry';
import { useBumpTexture } from '@/utils/textures';
import { createShellMaterial, createChromatinMaterial } from '@/materials/materials';
import { pickable } from '@/lib/interaction';
import { OrganelleShell } from '../cell/OrganelleShell';
import { Particles } from '../cell/Particles';
import { useCellStore } from '@/lib/store';

/**
 * The nucleus and everything inside it.
 *
 * - Double nuclear envelope (outer + inner shell) with the same organic
 *   shell shader family as the plasma membrane, tinted violet.
 * - 48 nuclear pore complexes instanced on a golden-angle spiral.
 * - 14 chromatin fibers: random-walk tube polymers swaying in a shader.
 * - Nucleolus: a dense noise-displaced sphere at the core.
 * - Nucleoplasm particles drifting between the fibers.
 *
 * Sub-structures (envelope, pores, chromatin, nucleolus) are individually
 * selectable — each is registered in data/organelles.ts.
 */

export const NUCLEUS_POS: [number, number, number] = [-0.95, 0.4, 0.35];
const NUCLEUS_R = 1.7;

export function Nucleus() {
  return (
    <group position={NUCLEUS_POS}>
      <NuclearEnvelope />
      <NuclearPores />
      <Chromatin />
      <Nucleolus />
      <NucleoplasmParticles />
    </group>
  );
}

function NuclearEnvelope() {
  const outerGeo = useMemo(() => makeOrganicSphere(NUCLEUS_R, 128, 96, 0.05, 0.8, 9.4), []);
  const innerGeo = useMemo(() => makeOrganicSphere(NUCLEUS_R - 0.07, 96, 72, 0.045, 0.8, 9.4), []);
  const outerMat = useMemo(
    () =>
      createShellMaterial({
        color: '#6a55b0',
        rimColor: '#b39ee8',
        alpha: 0.2,
        breathAmp: 0.02,
        noiseScale: 0.9,
        bump: 0.16,
        bumpFreq: 5.0,
      }),
    [],
  );
  const innerMat = useMemo(
    () =>
      createShellMaterial({
        color: '#554694',
        rimColor: '#9484c9',
        alpha: 0.13,
        breathAmp: 0.016,
        noiseScale: 0.9,
        inner: true,
        bump: 0.1,
        bumpFreq: 5.0,
      }),
    [],
  );

  const hovered = useCellStore((s) => s.hoveredId === 'nuclear-envelope');
  const selected = useCellStore((s) => s.selectedId === 'nuclear-envelope');
  useFrame((_, delta) => {
    const target = hovered || selected ? 1 : 0;
    for (const m of [outerMat, innerMat]) {
      m.uniforms.uHover.value += (target - m.uniforms.uHover.value) * Math.min(1, delta * 8);
    }
  });

  return (
    <OrganelleShell id="nuclear-envelope" position={[0, 0, 0]} explodeDistance={0.9} explodeDir={[0, 1, 0]} highlight={false} noDefaultPick>
      <group {...pickable('nuclear-envelope')}>
        <mesh geometry={outerGeo} material={outerMat} />
        <mesh geometry={innerGeo} material={innerMat} />
      </group>
    </OrganelleShell>
  );
}

function NuclearPores() {
  const ref = useRef<InstancedMesh>(null);
  const COUNT = 48;

  const transforms = useMemo(() => {
    const pts = fibonacciSphere(COUNT, NUCLEUS_R + 0.01);
    const dummy = new Object3D();
    return pts.map((p) => {
      dummy.position.copy(p);
      dummy.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), p.clone().normalize());
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });
  }, []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    transforms.forEach((t, i) => mesh.setMatrixAt(i, t));
    mesh.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <OrganelleShell id="nuclear-pores" position={[0, 0, 0]} explodeDistance={1.2} explodeDir={[0, -1, 0]} highlight={false} noDefaultPick>
      <instancedMesh
        ref={ref}
        args={[undefined, undefined, COUNT]}
        {...pickable('nuclear-pores')}
      >
        <cylinderGeometry args={[0.05, 0.062, 0.14, 10, 1, true]} />
        <meshPhysicalMaterial
          color="#a894e0"
          roughness={0.3}
          metalness={0.1}
          emissive="#4a3596"
          emissiveIntensity={0.35}
          transparent
          opacity={0.95}
          side={DoubleSide}
        />
      </instancedMesh>
    </OrganelleShell>
  );
}

function Chromatin() {
  const groupRef = useRef<Group>(null);

  const fibers = useMemo(() => {
    const rand = mulberry32(31);
    return Array.from({ length: 14 }, (_, i) => {
      const curve = randomWalkCurve(rand, NUCLEUS_R * 0.82, 26, 0.32);
      return {
        geometry: new TubeGeometry(curve, 72, 0.028 + rand() * 0.02, 7, false),
        key: i,
      };
    });
  }, []);

  const material = useMemo(() => createChromatinMaterial(), []);

  const hovered = useCellStore((s) => s.hoveredId === 'chromatin');
  const selected = useCellStore((s) => s.selectedId === 'chromatin');
  useFrame((_, delta) => {
    const target = hovered || selected ? 1 : 0;
    const u = material.uniforms.uHover;
    // eslint-disable-next-line react-hooks/immutability -- three.js uniforms are mutated imperatively by design
    u.value += (target - u.value) * Math.min(1, delta * 8);
  });

  return (
    <OrganelleShell id="chromatin" position={[0, 0, 0]} explodeDistance={0.6} explodeDir={[1, 0, 0]} highlight={false} noDefaultPick>
      <group ref={groupRef} {...pickable('chromatin')}>
        {fibers.map((f) => (
          <mesh key={f.key} geometry={f.geometry} material={material} />
        ))}
      </group>
    </OrganelleShell>
  );
}

function Nucleolus() {
  const meshRef = useRef<Group>(null);
  const geometry = useMemo(() => makeOrganicSphere(0.52, 64, 48, 0.07, 1.4, 5.5), []);
  const bump = useBumpTexture();

  return (
    <OrganelleShell id="nucleolus" position={[0.28, -0.18, 0.22]} explodeDistance={0.7} explodeDir={[-1, 0.3, 0]}>
      <group ref={meshRef}>
        <mesh geometry={geometry}>
          <meshPhysicalMaterial
            color="#6848b0"
            roughness={0.45}
            clearcoat={0.7}
            clearcoatRoughness={0.3}
            emissive="#2e1a5e"
            emissiveIntensity={0.25}
            transparent
            opacity={0.96}
            bumpMap={bump}
            bumpScale={0.05}
          />
        </mesh>
      </group>
    </OrganelleShell>
  );
}

function NucleoplasmParticles() {
  const positions = useMemo(() => {
    const rand = mulberry32(91);
    const arr = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i++) {
      const v = new Vector3().randomDirection().multiplyScalar(Math.cbrt(rand()) * NUCLEUS_R * 0.9);
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = v.z;
    }
    return arr;
  }, []);

  return (
    <Particles
      count={160}
      positions={positions}
      color="#a894e0"
      size={5}
      opacity={0.3}
      wanderAmp={0.12}
      seed={9}
    />
  );
}
