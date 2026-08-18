'use client';

import { useMemo } from 'react';
import { makeOrganicSphere } from '@/utils/geometry';
import { createCytoplasmMaterial } from '@/materials/materials';
import { pickable } from '@/lib/interaction';
import { OrganelleShell } from './OrganelleShell';
import { Particles, useShellPositions } from './Particles';

/**
 * The cytoplasm: a translucent gel shell just inside the membrane, plus
 * three GPU particle populations — cytosolic proteins, ions and micro
 * vesicular debris — all wandering via shader-side Brownian noise.
 *
 * Clicking "through" it reaches organelles thanks to the container logic
 * in lib/interaction.ts.
 */
export function Cytoplasm() {
  const gelGeo = useMemo(() => makeOrganicSphere(4.86, 96, 72, 0.14, 0.55, 3.1), []);
  const gelMat = useMemo(() => createCytoplasmMaterial(), []);

  const proteinPos = useShellPositions(900, 1.9, 4.6, 11);
  const ionPos = useShellPositions(650, 1.9, 4.6, 23);
  const debrisPos = useShellPositions(320, 1.9, 4.6, 47);

  return (
    <OrganelleShell id="cytoplasm" position={[0, 0, 0]} highlight={false} noDefaultPick>
      <group {...pickable('cytoplasm')}>
        <mesh geometry={gelGeo} material={gelMat} />
      </group>

      {/* Suspended molecular life */}
      <Particles
        count={900}
        positions={proteinPos}
        color="#7ab8d8"
        size={6}
        opacity={0.22}
        wanderAmp={0.22}
        seed={5}
      />
      <Particles
        count={650}
        positions={ionPos}
        color="#d8c878"
        size={4}
        opacity={0.26}
        wanderAmp={0.34}
        seed={6}
      />
      <Particles
        count={320}
        positions={debrisPos}
        color="#8a76c9"
        size={9}
        opacity={0.12}
        wanderAmp={0.16}
        seed={7}
      />
    </OrganelleShell>
  );
}
