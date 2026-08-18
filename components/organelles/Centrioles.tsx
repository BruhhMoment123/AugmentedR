'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Group, InstancedMesh, Object3D, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32, randomInShell } from '@/utils/geometry';
import { slicePlane } from '@/lib/uniforms';
import { pickable } from '@/lib/interaction';
import { OrganelleShell } from '../cell/OrganelleShell';
import { NUCLEUS_POS } from './Nucleus';

/**
 * Centrioles: two perpendicular barrels, each a "9×3" ring of microtubule
 * triplets (54 instanced cylinders total) — the classic centrosome core.
 *
 * Free ribosomes: 350 instanced subunits drifting through the cytosol with
 * a per-instance vibration, skipping the volume occupied by the nucleus.
 */

const CENTRIOLES_POS: [number, number, number] = [1.0, 1.3, 1.6];

export function Centrioles() {
  const meshRef = useRef<InstancedMesh>(null);
  const groupRef = useRef<Group>(null);

  const transforms = useMemo(() => {
    const dummy = new Object3D();
    const out: import('three').Matrix4[] = [];
    for (let barrel = 0; barrel < 2; barrel++) {
      for (let triplet = 0; triplet < 9; triplet++) {
        const angle = (triplet / 9) * Math.PI * 2;
        for (let tube = 0; tube < 3; tube++) {
          const a = angle + tube * 0.09;
          dummy.position.set(Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16);
          dummy.rotation.set(0, 0, 0);
          // Tilt each triplet slightly inward (barrel "pinwheel" twist).
          dummy.rotateZ(Math.cos(a) * 0.22);
          dummy.rotateX(-Math.sin(a) * 0.22);
          if (barrel === 1) {
            dummy.rotateZ(Math.PI / 2);
            dummy.position.set(0, Math.cos(a) * 0.16, Math.sin(a) * 0.16);
          }
          dummy.updateMatrix();
          out.push(dummy.matrix.clone());
        }
      }
    }
    return out;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    transforms.forEach((t, i) => mesh.setMatrixAt(i, t));
    mesh.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <OrganelleShell id="centrioles" position={CENTRIOLES_POS} explodeDistance={1.8} highlight={false} noDefaultPick>
      <group ref={groupRef}>
        <instancedMesh ref={meshRef} args={[undefined, undefined, 54]} {...pickable('centrioles')}>
          <cylinderGeometry args={[0.028, 0.028, 0.5, 8]} />
          <meshPhysicalMaterial
            color="#6aa8b0"
            roughness={0.4}
            clearcoat={0.5}
            emissive="#1a4a52"
            emissiveIntensity={0.18}
            clippingPlanes={[slicePlane]}
          />
        </instancedMesh>
      </group>
    </OrganelleShell>
  );
}

/* ------------------------------------------------------------------ */

const FREE_RIBOSOME_COUNT = 350;

export function FreeRibosomes() {
  const meshRef = useRef<InstancedMesh>(null);

  const { transforms, seeds } = useMemo(() => {
    const rand = mulberry32(29);
    const dummy = new Object3D();
    const mats: import('three').Matrix4[] = [];
    const sd: number[] = [];
    const nucleus = new Vector3(...NUCLEUS_POS);
    let placed = 0;
    while (placed < FREE_RIBOSOME_COUNT) {
      const p = randomInShell(rand, 2.1, 4.5);
      if (p.distanceTo(nucleus) < 2.3) continue; // keep the nucleus clear
      dummy.position.copy(p);
      dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, 0);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
      sd.push(rand() * 100);
      placed++;
    }
    return { transforms: mats, seeds: sd };
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    transforms.forEach((t, i) => mesh.setMatrixAt(i, t));
    mesh.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  // Brownian vibration: rebuild matrices each frame from base + jitter.
  const dummy = useMemo(() => new Object3D(), []);
  const basePositions = useMemo(() => {
    const v = new Vector3();
    return transforms.map((m) => v.clone().setFromMatrixPosition(m));
  }, [transforms]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < FREE_RIBOSOME_COUNT; i++) {
      const b = basePositions[i];
      const s = seeds[i];
      dummy.position.set(
        b.x + Math.sin(t * 1.7 + s) * 0.02,
        b.y + Math.sin(t * 1.3 + s * 1.7) * 0.02,
        b.z + Math.cos(t * 1.5 + s * 2.3) * 0.02,
      );
      dummy.rotation.set(s, s * 1.7, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <OrganelleShell id="ribosomes" position={[0, 0, 0]} highlight={false} noDefaultPick>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, FREE_RIBOSOME_COUNT]}
        {...pickable('ribosomes')}
      >
        <dodecahedronGeometry args={[0.045, 0]} />
        <meshPhysicalMaterial
          color="#b8a468"
          roughness={0.55}
          emissive="#4e421e"
          emissiveIntensity={0.08}
          clippingPlanes={[slicePlane]}
        />
      </instancedMesh>
    </OrganelleShell>
  );
}
