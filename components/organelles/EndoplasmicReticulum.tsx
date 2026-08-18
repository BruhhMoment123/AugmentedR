'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  DoubleSide,
  Group,
  InstancedMesh,
  Matrix4,
  Object3D,
  PlaneGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { useFrame } from '@react-three/fiber';
import { cellNoise, mulberry32 } from '@/lib/noise';
import { wanderingCurve } from '@/utils/geometry';
import { useBumpTexture } from '@/utils/textures';
import { slicePlane } from '@/lib/uniforms';
import { pickable } from '@/lib/interaction';
import { OrganelleShell } from '../cell/OrganelleShell';
import { Particles } from '../cell/Particles';
import { useCellStore } from '@/lib/store';

/**
 * The endoplasmic reticulum — both morphologies.
 *
 * Rough ER: six stacked, noise-rumpled cisternae sheets studded with ~700
 * instanced ribosomes placed by sampling the same displacement function
 * that builds the sheets (so dots sit exactly on the surface).
 *
 * Smooth ER: eight anastomosing membrane tubules with Ca²⁺ sparkles.
 */

const RER_POS: [number, number, number] = [-3.1, -0.7, -0.6];
const SER_POS: [number, number, number] = [2.5, -1.9, 1.1];

export function EndoplasmicReticulum() {
  return (
    <>
      <RoughER />
      <SmoothER />
    </>
  );
}

/* ------------------------------------------------------------------ */

const SHEET_COUNT = 6;
const RIBOSOMES_PER_SHEET = 120;

/** Shared sheet displacement so ribosomes can sit exactly on the surface. */
function sheetHeight(x: number, y: number, sheetIndex: number): number {
  const n = cellNoise.fbm(x * 1.1 + sheetIndex * 7, y * 1.1, sheetIndex * 3.1, 2) * 0.09;
  const edge = Math.pow(Math.abs(y) / 0.5, 3) * 0.12; // curled rims
  return n + edge;
}

function RoughER() {
  const riboRef = useRef<InstancedMesh>(null);
  const groupRef = useRef<Group>(null);
  const bump = useBumpTexture();

  const sheets = useMemo(() => {
    return Array.from({ length: SHEET_COUNT }, (_, i) => {
      const geo = new PlaneGeometry(3.0, 1.0, 56, 20);
      const pos = geo.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        pos.setZ(v, sheetHeight(pos.getX(v), pos.getY(v), i));
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      return {
        geometry: geo,
        y: -0.55 + i * 0.22,
        rotZ: (i - SHEET_COUNT / 2) * 0.05,
      };
    });
  }, []);

  // Ribosomes: sample each sheet's parametric surface + sheet transform.
  const riboTransforms = useMemo(() => {
    const rand = mulberry32(53);
    const dummy = new Object3D();
    const sheetObj = new Object3D();
    const out: Matrix4[] = [];
    for (let s = 0; s < SHEET_COUNT; s++) {
      sheetObj.position.set(0, sheets[s].y, 0);
      sheetObj.rotation.set(0, 0, sheets[s].rotZ);
      sheetObj.updateMatrix();
      for (let r = 0; r < RIBOSOMES_PER_SHEET; r++) {
        const x = (rand() - 0.5) * 2.9;
        const y = (rand() - 0.5) * 0.95;
        const z = sheetHeight(x, y, s) + (rand() > 0.5 ? 0.055 : -0.055);
        dummy.position.set(x, y, z);
        dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, 0);
        dummy.updateMatrix();
        out.push(sheetObj.matrix.clone().multiply(dummy.matrix));
      }
    }
    return out;
  }, [sheets]);

  useEffect(() => {
    const mesh = riboRef.current;
    if (!mesh) return;
    riboTransforms.forEach((t, i) => mesh.setMatrixAt(i, t));
    mesh.instanceMatrix.needsUpdate = true;
  }, [riboTransforms]);

  // Ribosome vibration (they're alive!) — subtle group-level tremble.
  // (The parent OrganelleShell already sits at RER_POS; oscillate around 0.)
  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.y = Math.sin(t * 0.5) * 0.04;
  });

  return (
    <>
      <OrganelleShell id="rer" position={RER_POS} explodeDistance={1.7} highlight={false} noDefaultPick>
        <group ref={groupRef} position={[0, 0, 0]}>
          <group {...pickable('rer')}>
            {sheets.map((s, i) => (
              <mesh key={i} geometry={s.geometry} position={[0, s.y, 0]} rotation={[0, 0, s.rotZ]}>
                <meshPhysicalMaterial
                  color="#6a8cb8"
                  roughness={0.6}
                  clearcoat={0.3}
                  transparent
                  opacity={0.85}
                  side={DoubleSide}
                  clippingPlanes={[slicePlane]}
                  bumpMap={bump}
                  bumpScale={0.03}
                />
              </mesh>
            ))}
          </group>
        </group>
      </OrganelleShell>

      {/* Ribosomes bound to the RER surface (separately selectable) */}
      <OrganelleShell id="ribosomes" position={RER_POS} explodeDistance={1.7} highlight={false} noDefaultPick>
        <instancedMesh
          ref={riboRef}
          args={[undefined, undefined, SHEET_COUNT * RIBOSOMES_PER_SHEET]}
          {...pickable('ribosomes')}
        >
          <dodecahedronGeometry args={[0.042, 0]} />
          <meshPhysicalMaterial
            color="#c9b078"
            roughness={0.5}
            emissive="#5e4e1e"
            emissiveIntensity={0.1}
            clippingPlanes={[slicePlane]}
          />
        </instancedMesh>
      </OrganelleShell>
    </>
  );
}

/* ------------------------------------------------------------------ */

function SmoothER() {
  const groupRef = useRef<Group>(null);
  const bump = useBumpTexture();

  const tubules = useMemo(() => {
    const rand = mulberry32(67);
    const center = new Vector3(0, 0, 0);
    return Array.from({ length: 8 }, (_, i) => {
      const curve = wanderingCurve(rand, center, 2.4, 6);
      return {
        geometry: new TubeGeometry(curve, 40, 0.05 + rand() * 0.02, 8, false),
        key: i,
      };
    });
  }, []);

  const hovered = useCellStore((s) => s.hoveredId === 'ser');
  const selected = useCellStore((s) => s.selectedId === 'ser');
  const emissiveRef = useRef(0.06);

  useFrame((state, delta) => {
    const target = hovered || selected ? 0.3 : 0.06;
    emissiveRef.current += (target - emissiveRef.current) * Math.min(1, delta * 8);
    const g = groupRef.current;
    if (!g) return;
    g.traverse((obj) => {
      const mat = (obj as { material?: { emissiveIntensity?: number } }).material;
      if (mat && mat.emissiveIntensity !== undefined) mat.emissiveIntensity = emissiveRef.current;
    });
    // Slow peristaltic sway of the tubular network.
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
  });

  const caPositions = useMemo(() => {
    const rand = mulberry32(71);
    const arr = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      arr[i * 3] = (rand() - 0.5) * 2.4;
      arr[i * 3 + 1] = (rand() - 0.5) * 1.3;
      arr[i * 3 + 2] = (rand() - 0.5) * 2.4;
    }
    return arr;
  }, []);

  return (
    <OrganelleShell id="ser" position={SER_POS} explodeDistance={1.7} highlight={false} noDefaultPick>
      <group ref={groupRef} {...pickable('ser')}>
        {tubules.map((t) => (
          <mesh key={t.key} geometry={t.geometry}>
            <meshPhysicalMaterial
              color="#b87a96"
              roughness={0.4}
              clearcoat={0.6}
              transparent
              opacity={0.9}
              emissive="#5e2a44"
              emissiveIntensity={0.06}
              clippingPlanes={[slicePlane]}
              bumpMap={bump}
              bumpScale={0.02}
            />
          </mesh>
        ))}
        {/* Ca²⁺ sparkles released from the tubules */}
        <Particles
          count={120}
          positions={caPositions}
          color="#e8a8c8"
          size={4}
          opacity={0.35}
          wanderAmp={0.2}
          seed={8}
        />
      </group>
    </OrganelleShell>
  );
}
