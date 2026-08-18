'use client';

import { useMemo, useRef } from 'react';
import { CatmullRomCurve3, Group, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '@/lib/noise';
import { makeOrganicSphere } from '@/utils/geometry';
import { useBumpTexture } from '@/utils/textures';
import { slicePlane } from '@/lib/uniforms';
import { OrganelleShell } from '../cell/OrganelleShell';
import { useDriftExplode } from '@/hooks/useFloat';
import { useCellStore } from '@/lib/store';

/**
 * Membrane trafficking.
 *
 * Transport vesicles: carriers looping ER → Golgi → plasma membrane along
 * three smooth splines (two vesicles per route, phase-offset).
 * Endosomes: cargo packages traveling inward from the membrane.
 * Vacuoles: two small, slow storage sacs.
 */

interface Route {
  curve: CatmullRomCurve3;
  vesicles: number;
}

function makeRoutes(): Route[] {
  const rand = mulberry32(131);
  const routes: [Vector3, Vector3, Vector3, Vector3][] = [
    // ER → Golgi
    [
      new Vector3(-2.3, -0.4, -0.5),
      new Vector3(-0.8, 0.7, -1.2),
      new Vector3(0.7, 1.5, -1.2),
      new Vector3(1.6, 1.7, -1.0),
    ],
    // Golgi → membrane (secretory)
    [
      new Vector3(2.1, 1.9, -0.8),
      new Vector3(3.0, 2.6, 0.2),
      new Vector3(3.7, 2.2, 1.4),
      new Vector3(4.2, 1.6, 2.2),
    ],
    // ER → Golgi (lower route)
    [
      new Vector3(-2.4, -1.0, -0.3),
      new Vector3(-0.6, -0.2, -1.6),
      new Vector3(1.0, 0.9, -1.5),
      new Vector3(1.7, 1.6, -1.1),
    ],
  ];
  return routes.map((pts) => ({
    curve: new CatmullRomCurve3(pts, false, 'centripetal', 0.5 + rand() * 0.2),
    vesicles: 2,
  }));
}

const ENDOSOME_ROUTE = new CatmullRomCurve3(
  [
    new Vector3(4.4, -0.7, -0.5),
    new Vector3(3.2, -1.1, -0.6),
    new Vector3(2.2, -1.4, -0.4),
    new Vector3(1.6, -1.6, 0.0),
  ],
  false,
  'centripetal',
  0.6,
);

export function TransportVesicles() {
  const routes = useMemo(() => makeRoutes(), []);
  const groupRef = useRef<Group>(null);
  const bump = useBumpTexture();

  const hovered = useCellStore((s) => s.hoveredId === 'vesicles');
  const selected = useCellStore((s) => s.selectedId === 'vesicles');
  const emissiveRef = useRef(0.1);

  useFrame((state, delta) => {
    const target = hovered || selected ? 0.35 : 0.1;
    emissiveRef.current += (target - emissiveRef.current) * Math.min(1, delta * 8);
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    let idx = 0;
    for (let r = 0; r < routes.length; r++) {
      for (let v = 0; v < routes[r].vesicles; v++) {
        const mesh = g.children[idx++] as import('three').Mesh;
        if (!mesh) continue;
        const u = (t * 0.055 + v / routes[r].vesicles + r * 0.37) % 1;
        routes[r].curve.getPointAt(u, mesh.position);
        // Bud & fuse: shrink at both ends of the route.
        const pop = Math.sin(u * Math.PI);
        mesh.scale.setScalar(0.06 + pop * 0.06);
        const mat = mesh.material as import('three').MeshPhysicalMaterial;
        if (mat) mat.emissiveIntensity = emissiveRef.current;
      }
    }
  });

  const total = routes.reduce((n, r) => n + r.vesicles, 0);

  return (
    <OrganelleShell id="vesicles" position={[0, 0, 0]} highlight={false}>
      <group ref={groupRef}>
        {Array.from({ length: total }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial
              color="#c98a62"
              roughness={0.35}
              clearcoat={0.8}
              transparent
              opacity={0.85}
              emissive="#5e3a1a"
              emissiveIntensity={0.1}
              clippingPlanes={[slicePlane]}
              bumpMap={bump}
              bumpScale={0.03}
            />
          </mesh>
        ))}
      </group>
    </OrganelleShell>
  );
}

export function Endosomes() {
  const groupRef = useRef<Group>(null);
  const bump = useBumpTexture();

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((child, i) => {
      const mesh = child as import('three').Mesh;
      const u = (t * 0.04 + i / 2) % 1;
      ENDOSOME_ROUTE.getPointAt(u, mesh.position);
      const pop = Math.sin(u * Math.PI);
      mesh.scale.setScalar(0.1 + pop * 0.06);
    });
  });

  return (
    <OrganelleShell id="endosomes" position={[0, 0, 0]} highlight={false}>
      <group ref={groupRef}>
        {[0, 1].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial
              color="#c87882"
              roughness={0.4}
              clearcoat={0.7}
              transparent
              opacity={0.85}
              emissive="#5e242e"
              emissiveIntensity={0.12}
              clippingPlanes={[slicePlane]}
              bumpMap={bump}
              bumpScale={0.03}
            />
          </mesh>
        ))}
      </group>
    </OrganelleShell>
  );
}

/* ------------------------------------------------------------------ */

const VACUOLES: { pos: [number, number, number]; r: number; seed: number }[] = [
  { pos: [-3.3, 1.6, 0.8], r: 0.34, seed: 21 },
  { pos: [0.4, 3.3, -1.3], r: 0.26, seed: 22 },
];

export function Vacuoles() {
  return (
    <OrganelleShell id="vacuoles" position={[0, 0, 0]} highlight={false}>
      {VACUOLES.map((v) => (
        <Vacuole key={v.seed} config={v} />
      ))}
    </OrganelleShell>
  );
}

function Vacuole({ config }: { config: { pos: [number, number, number]; r: number; seed: number } }) {
  const ref = useRef<Group>(null);
  const glow = useRef(0.06);
  const bump = useBumpTexture();
  const geo = useMemo(() => makeOrganicSphere(config.r, 40, 28, config.r * 0.08, 1.8, config.seed), [config]);
  useDriftExplode(ref, config.pos, { floatAmp: 0.07, speed: 0.3, explodeDist: 1.8, seed: config.seed });

  const hovered = useCellStore((s) => s.hoveredId === 'vacuoles');
  const selected = useCellStore((s) => s.selectedId === 'vacuoles');

  useFrame((_, delta) => {
    glow.current += ((hovered || selected ? 0.3 : 0.06) - glow.current) * Math.min(1, delta * 8);
    const g = ref.current;
    if (!g) return;
    const mesh = g.children[0] as import('three').Mesh | undefined;
    const mat = mesh?.material as import('three').MeshPhysicalMaterial | undefined;
    // eslint-disable-next-line react-hooks/immutability -- three.js materials are mutated imperatively by design
    if (mat) mat.emissiveIntensity = glow.current;
  });

  return (
    <group ref={ref} position={config.pos}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          color="#7ab0c8"
          roughness={0.2}
          clearcoat={1}
          transparent
          opacity={0.3}
          emissive="#1e4a5e"
          emissiveIntensity={0.06}
          clippingPlanes={[slicePlane]}
          bumpMap={bump}
          bumpScale={0.02}
        />
      </mesh>
    </group>
  );
}
