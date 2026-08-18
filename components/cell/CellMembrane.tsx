'use client';

import { useEffect, useMemo, useRef } from 'react';
import { InstancedMesh, Matrix4, Object3D, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { CELL_RADIUS } from '@/data/organelles';
import { fibonacciSphere, makeOrganicSphere, mulberry32 } from '@/utils/geometry';
import { createShellMaterial } from '@/materials/materials';
import { pickable } from '@/lib/interaction';
import { OrganelleShell } from './OrganelleShell';

/**
 * The plasma membrane.
 *
 * Geometry: an organically-displaced sphere (baked simplex noise) with a
 * smaller concentric inner leaflet, suggesting the phospholipid bilayer.
 * Material: custom shell shader — fresnel rim, wrapped diffuse (fake SSS),
 * back-scatter, lipid speckle, breathing vertex motion.
 *
 * Embedded: instanced channel proteins (toroids), receptor "lollipops"
 * (capsules) and pumps (half-buried spheres) that slowly drift with the
 * fluid mosaic.
 */

const CHANNEL_COUNT = 26;
const RECEPTOR_COUNT = 22;
const PUMP_COUNT = 16;

export function CellMembrane() {
  const proteinsRef = useRef<InstancedMesh>(null);
  const receptorsRef = useRef<InstancedMesh>(null);
  const pumpsRef = useRef<InstancedMesh>(null);
  const driftRef = useRef(0);

  const outerGeo = useMemo(
    () => makeOrganicSphere(CELL_RADIUS, 160, 120, 0.16, 0.55, 3.1),
    [],
  );
  const innerGeo = useMemo(
    () => makeOrganicSphere(CELL_RADIUS - 0.09, 96, 72, 0.14, 0.55, 3.1),
    [],
  );

  const outerMat = useMemo(
    () =>
      createShellMaterial({
        color: '#c4745c',
        rimColor: '#f0a884',
        alpha: 0.22,
        breathAmp: 0.055,
        lipidPattern: true,
        bump: 0.34,
        bumpFreq: 4.2,
      }),
    [],
  );
  const innerMat = useMemo(
    () =>
      createShellMaterial({
        color: '#a85a46',
        rimColor: '#d89a82',
        alpha: 0.14,
        breathAmp: 0.045,
        inner: true,
        bump: 0.2,
        bumpFreq: 4.2,
      }),
    [],
  );

  // Static protein placement on the (approximately spherical) surface.
  const { channelXf, receptorXf, pumpXf } = useMemo(() => {
    const rand = mulberry32(77);
    const dummy = new Object3D();
    const place = (pts: Vector3[], sink: number) =>
      pts.map((p) => {
        const normal = p.clone().normalize();
        dummy.position.copy(normal).multiplyScalar(CELL_RADIUS - sink);
        dummy.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), normal);
        dummy.rotateY(rand() * Math.PI * 2);
        dummy.updateMatrix();
        return dummy.matrix.clone();
      });
    return {
      channelXf: place(fibonacciSphere(CHANNEL_COUNT * 3, 1).filter(() => rand() > 0.66).slice(0, CHANNEL_COUNT), 0.02),
      receptorXf: place(fibonacciSphere(RECEPTOR_COUNT * 3, 1).filter(() => rand() > 0.66).slice(0, RECEPTOR_COUNT), -0.14),
      pumpXf: place(fibonacciSphere(PUMP_COUNT * 3, 1).filter(() => rand() > 0.66).slice(0, PUMP_COUNT), 0.06),
    };
  }, []);

  // Slow lateral drift of the whole protein population (fluid mosaic model).
  const scratchRot = useMemo(() => new Matrix4(), []);
  const scratchMat = useMemo(() => new Matrix4(), []);
  useFrame((_, delta) => {
    driftRef.current += delta * 0.004;
    scratchRot.makeRotationY(driftRef.current);
    for (const [ref, xf] of [
      [proteinsRef, channelXf],
      [receptorsRef, receptorXf],
      [pumpsRef, pumpXf],
    ] as const) {
      const mesh = ref.current;
      if (!mesh) continue;
      for (let i = 0; i < xf.length; i++) {
        scratchMat.copy(scratchRot).multiply(xf[i]);
        mesh.setMatrixAt(i, scratchMat);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  // Instanced meshes need their matrices seeded once on mount.
  useEffect(() => {
    for (const [ref, xf] of [
      [proteinsRef, channelXf],
      [receptorsRef, receptorXf],
      [pumpsRef, pumpXf],
    ] as const) {
      const mesh = ref.current;
      if (!mesh) continue;
      for (let i = 0; i < xf.length; i++) mesh.setMatrixAt(i, xf[i]);
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [channelXf, receptorXf, pumpXf]);

  return (
    <OrganelleShell id="membrane" position={[0, 0, 0]} highlight={false} noDefaultPick>
      <group {...pickable('membrane')}>
        <mesh geometry={outerGeo} material={outerMat} />
        <mesh geometry={innerGeo} material={innerMat} />
      </group>

      {/* Channel proteins: toroidal pores spanning the bilayer */}
      <instancedMesh
        ref={proteinsRef}
        args={[undefined, undefined, CHANNEL_COUNT]}
        userData={{ organelleId: 'membrane' }}
      >
        <torusGeometry args={[0.085, 0.038, 10, 18]} />
        <meshPhysicalMaterial
          color="#5f96b8"
          roughness={0.35}
          clearcoat={0.8}
          emissive="#1a4a66"
          emissiveIntensity={0.15}
        />
      </instancedMesh>

      {/* Surface receptors: capsule "lollipops" protruding outward */}
      <instancedMesh
        ref={receptorsRef}
        args={[undefined, undefined, RECEPTOR_COUNT]}
        userData={{ organelleId: 'membrane' }}
      >
        <capsuleGeometry args={[0.045, 0.22, 6, 12]} />
        <meshPhysicalMaterial
          color="#c9a87a"
          roughness={0.45}
          clearcoat={0.6}
          emissive="#6a521e"
          emissiveIntensity={0.12}
        />
      </instancedMesh>

      {/* Ion pumps: half-buried protein globes */}
      <instancedMesh
        ref={pumpsRef}
        args={[undefined, undefined, PUMP_COUNT]}
        userData={{ organelleId: 'membrane' }}
      >
        <sphereGeometry args={[0.11, 16, 12]} />
        <meshPhysicalMaterial
          color="#a86ab8"
          roughness={0.4}
          clearcoat={0.7}
          emissive="#521e66"
          emissiveIntensity={0.12}
        />
      </instancedMesh>
    </OrganelleShell>
  );
}
