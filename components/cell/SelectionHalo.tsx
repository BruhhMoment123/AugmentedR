'use client';

import { useMemo, useRef } from 'react';
import { AdditiveBlending, Sprite, SpriteMaterial, Texture } from 'three';
import { useFrame } from '@react-three/fiber';
import { ORGANELLES } from '@/data/organelles';
import { useCellStore } from '@/lib/store';

/**
 * Pulsing halo that marks the currently selected organelle.
 * Uses a procedural radial-gradient sprite (generated on a canvas at
 * runtime — no image assets).
 */
function useGlowTexture(): Texture {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.35)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.08)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new Texture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

export function SelectionHalo() {
  const selectedId = useCellStore((s) => s.selectedId);
  const spriteRef = useRef<Sprite>(null);
  const tex = useGlowTexture();

  const material = useMemo(
    () =>
      new SpriteMaterial({
        map: tex,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        opacity: 0.55,
      }),
    [tex],
  );

  const info = selectedId ? ORGANELLES[selectedId] : null;

  useFrame((state) => {
    const s = spriteRef.current;
    if (!s || !info) return;
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 3) * 0.12;
    const base = Math.max(1.4, info.cameraDistance * 0.45);
    s.scale.setScalar(base * pulse);
    material.color.set(info.color);
  });

  if (!info) return null;

  return <sprite ref={spriteRef} material={material} position={info.anchor} renderOrder={999} />;
}
