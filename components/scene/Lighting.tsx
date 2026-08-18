'use client';

import { Environment, Lightformer } from '@react-three/drei';

/**
 * Cinematic three-point lighting + a fully procedural HDRI-style
 * environment (Lightformers baked into a PMREM env map — no network HDRIs).
 *
 * Deliberately restrained: the scene relies on material color and texture,
 * with lights shaping form instead of washing it out.
 */
export function Lighting() {
  return (
    <>
      {/* Very low base fill — keeps shadows readable */}
      <ambientLight intensity={0.14} color="#6a7aa8" />

      {/* Key light — cool, from upper right */}
      <directionalLight position={[6, 8, 4]} intensity={1.15} color="#d4e6ff" />

      {/* Rim light — warm, from behind left (membrane edge definition) */}
      <directionalLight position={[-7, -3, -6]} intensity={0.5} color="#ff9d76" />

      {/* Internal fill — subtle luminous center */}
      <pointLight position={[0, 0.5, 0]} intensity={9} distance={18} decay={2} color="#5f8fd8" />

      {/* Procedural environment reflections (soft, low intensity) */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#04060c']} />
        <Lightformer intensity={1.4} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} color="#a8c4e8" />
        <Lightformer intensity={0.7} position={[-6, 1, -2]} rotation={[0, Math.PI / 2, 0]} scale={[7, 3, 1]} color="#e8a884" />
        <Lightformer intensity={0.5} position={[6, -1, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[7, 3, 1]} color="#7ab8d8" />
        <Lightformer intensity={0.35} position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[8, 8, 1]} color="#5a4ab8" />
      </Environment>
    </>
  );
}
