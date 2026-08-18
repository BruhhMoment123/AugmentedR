'use client';

import { useMemo, useRef } from 'react';
import { DoubleSide, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '@/lib/noise';
import { useBumpTexture } from '@/utils/textures';
import { slicePlane } from '@/lib/uniforms';
import { OrganelleShell } from '../cell/OrganelleShell';
import { useCellStore } from '@/lib/store';

/**
 * The Golgi apparatus: six curved cisternae stacked cis→trans, colored from
 * gold (receiving) to copper (shipping), with vesicles visibly budding off
 * the trans face — each bud swells, detaches and drifts away in a loop.
 */

const GOLGI_POS: [number, number, number] = [1.9, 1.8, -0.9];
const CISTERNAE = 6;
const BUDS = 5;

export function GolgiApparatus() {
  const groupRef = useRef<Group>(null);
  const budsRef = useRef<Group>(null);
  const bump = useBumpTexture();

  const cisternae = useMemo(() => {
    const rand = mulberry32(101);
    return Array.from({ length: CISTERNAE }, (_, i) => {
      const t = i / (CISTERNAE - 1);
      return {
        radius: 0.42 + i * 0.12,
        tube: 0.075 + rand() * 0.015,
        arc: Math.PI * (0.75 + rand() * 0.2),
        y: -0.42 + i * 0.17,
        rotX: Math.PI / 2 + (rand() - 0.5) * 0.16,
        rotZ: -0.5 + i * 0.22,
        // cis (gold) → trans (copper) gradient
        color: `rgb(${Math.round(196 - t * 50)}, ${Math.round(158 - t * 50)}, ${Math.round(92 + t * 18)})`,
      };
    });
  }, []);

  const budSeeds = useMemo(() => {
    const rand = mulberry32(103);
    return Array.from({ length: BUDS }, (_, i) => ({
      phase: rand(),
      speed: 0.12 + rand() * 0.08,
      dir: [Math.cos(i * 2.1), 0.4 + rand() * 0.5, Math.sin(i * 2.1)] as const,
      tipRadius: 0.42 + (CISTERNAE - 1) * 0.12 + 0.1,
      y: -0.42 + rand() * 0.85,
    }));
  }, []);

  const hovered = useCellStore((s) => s.hoveredId === 'golgi');
  const selected = useCellStore((s) => s.selectedId === 'golgi');
  const emissiveRef = useRef(0.05);

  useFrame((state, delta) => {
    const target = hovered || selected ? 0.25 : 0.05;
    emissiveRef.current += (target - emissiveRef.current) * Math.min(1, delta * 8);
    const g = groupRef.current;
    if (g) {
      g.traverse((obj) => {
        const mat = (obj as { material?: { emissiveIntensity?: number } }).material;
        if (mat && mat.emissiveIntensity !== undefined) mat.emissiveIntensity = emissiveRef.current;
      });
      g.rotation.y = Math.sin(state.clock.elapsedTime * 0.16) * 0.1;
    }

    // Budding cycle: swell at the rim → drift off → respawn small.
    const buds = budsRef.current;
    if (buds) {
      const t = state.clock.elapsedTime;
      buds.children.forEach((bud, i) => {
        const s = budSeeds[i];
        const cycle = (t * s.speed + s.phase) % 1;
        const travel = Math.max(0, (cycle - 0.35) / 0.65); // 0 while swelling
        const swell = Math.min(1, cycle / 0.35);
        bud.position.set(
          s.dir[0] * (s.tipRadius + travel * 1.1),
          s.y + s.dir[1] * travel * 0.8,
          s.dir[2] * (s.tipRadius + travel * 1.1),
        );
        const scale = swell * (1 - travel * 0.35) * 0.11;
        bud.scale.setScalar(Math.max(0.001, scale));
      });
    }
  });

  return (
    <OrganelleShell id="golgi" position={GOLGI_POS} explodeDistance={1.6}>
      <group ref={groupRef}>
        {cisternae.map((c, i) => (
          <mesh key={i} position={[0, c.y, 0]} rotation={[c.rotX, 0, c.rotZ]}>
            <torusGeometry args={[c.radius, c.tube, 14, 40, c.arc]} />
            <meshPhysicalMaterial
              color={c.color}
              roughness={0.45}
              clearcoat={0.5}
              transparent
              opacity={0.92}
              emissive={c.color}
              emissiveIntensity={0.05}
              side={DoubleSide}
              clippingPlanes={[slicePlane]}
              bumpMap={bump}
              bumpScale={0.025}
            />
          </mesh>
        ))}
        {/* Budding vesicles */}
        <group ref={budsRef}>
          {budSeeds.map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[1, 14, 10]} />
              <meshPhysicalMaterial
                color="#c98862"
                roughness={0.4}
                clearcoat={0.7}
                transparent
                opacity={0.85}
                emissive="#6a3a1a"
                emissiveIntensity={0.1}
                clippingPlanes={[slicePlane]}
                bumpMap={bump}
                bumpScale={0.02}
              />
            </mesh>
          ))}
        </group>
      </group>
    </OrganelleShell>
  );
}
