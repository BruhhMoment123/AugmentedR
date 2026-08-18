'use client';

import { useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Points, Vector3 } from 'three';
import { mulberry32, randomInShell } from '@/utils/geometry';
import { createParticleMaterial, type ParticleOptions } from '@/materials/materials';

/**
 * GPU-driven point cloud. Particles are static in the buffer; all motion
 * (Brownian wander, directional flow, pulsing) happens in the vertex shader
 * from per-particle seeds, so thousands of particles cost one draw call.
 */
interface ParticlesProps extends ParticleOptions {
  count: number;
  /** Distribution radius (particles fill a sphere of this radius). */
  radius?: number;
  /** Explicit positions override (particles then wander around these). */
  positions?: Float32Array;
  seed?: number;
}

export function Particles({
  count,
  radius = 4.5,
  positions,
  seed = 1,
  ...materialOpts
}: ParticlesProps) {
  const ref = useRef<Points>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(seed);
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      if (positions) {
        pos[i * 3] = positions[i * 3];
        pos[i * 3 + 1] = positions[i * 3 + 1];
        pos[i * 3 + 2] = positions[i * 3 + 2];
      } else {
        const p = randomInShell(rand, 0, radius);
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
      }
      seeds[i] = rand();
      scales[i] = 0.5 + rand();
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    geo.setAttribute('aScale', new BufferAttribute(scales, 1));
    // Static geometry + shader-driven motion: skip frustum culling so
    // wandering particles don't pop out at the view edge.
    geo.boundingSphere = null;
    return geo;
  }, [count, radius, positions, seed]);

  const material = useMemo(() => createParticleMaterial(materialOpts), []); // eslint-disable-line react-hooks/exhaustive-deps

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

/** Convenience: deterministic positions scattered inside a shell. */
export function useShellPositions(count: number, minR: number, maxR: number, seed: number) {
  return useMemo(() => {
    const rand = mulberry32(seed);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const p: Vector3 = randomInShell(rand, minR, maxR);
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    }
    return pos;
  }, [count, minR, maxR, seed]);
}
