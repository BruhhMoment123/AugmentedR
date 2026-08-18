'use client';

import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping } from 'three';
import { SimplexNoise3D } from '@/lib/noise';

/**
 * Procedurally generated grayscale fBm texture, used as a bump map on the
 * physical (PBR) materials so organelle surfaces catch light with realistic
 * micro-relief. Generated once on a canvas at runtime — no image assets.
 */

let cached: CanvasTexture | null = null;

/** Lazy singleton getter (assignment happens outside render, on first call). */
function getFbmTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (!cached) cached = makeFbmTexture();
  return cached;
}

function makeFbmTexture(size = 256, seed = 7): CanvasTexture {
  const noise = new SimplexNoise3D(seed);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const data = img.data;
  const scale = 5.5 / size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Tileable-ish: sample noise on a torus via two phased fields blended.
      const u = x * scale;
      const v = y * scale;
      let n = noise.fbm(u, v, 3.7, 4, 2.1, 0.55);
      // Boost mid-frequency detail for a grainier biological surface.
      n += noise.noise(u * 3.1 + 40, v * 3.1, 9.2) * 0.25;
      const g = Math.max(0, Math.min(255, Math.round(128 + n * 140)));
      const i = (y * size + x) * 4;
      data[i] = g;
      data[i + 1] = g;
      data[i + 2] = g;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

/** Shared bump texture hook (singleton — one texture serves all materials). */
export function useBumpTexture(): CanvasTexture | null {
  return useMemo(() => getFbmTexture(), []);
}
