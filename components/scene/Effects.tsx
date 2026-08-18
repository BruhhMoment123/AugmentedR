'use client';

import { useState, useEffect } from 'react';
import { EffectComposer, Bloom, Vignette, SMAA, ChromaticAberration, HueSaturation, BrightnessContrast } from '@react-three/postprocessing';
import { useCellStore } from '@/lib/store';

/**
 * Cinematic post chain. Bloom is intentionally tight — only genuinely
 * emissive details (cristae energy bands, pores, halo) may bloom, so the
 * overall image keeps deep contrast and readable color.
 */
export function Effects() {
  const bloom = useCellStore((s) => s.debug.bloom);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile GPU / touch device to turn off heavy FBO blur flickering
    if (typeof window !== 'undefined') {
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768);
    }
  }, []);

  if (isMobile) {
    // Return null on mobile GPUs to bypass offscreen FBO clearing, eliminating black screen flashes completely
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={0.55 * bloom}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.22}
        radius={0.6}
      />
      <ChromaticAberration offset={[0.00022, 0.00022]} />
      <HueSaturation saturation={0.06} />
      <BrightnessContrast contrast={0.14} brightness={-0.02} />
      <Vignette offset={0.26} darkness={0.74} />
      <SMAA />
    </EffectComposer>
  );
}
