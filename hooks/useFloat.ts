import { useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { useCellStore } from '@/lib/store';
import { sharedUniforms, slicePlane } from '@/lib/uniforms';

/**
 * Gentle procedural drift + rotation for an organelle group.
 * Runs entirely inside the frame loop so it costs no React re-renders.
 *
 * @param ref   group to animate
 * @param amp   drift amplitude in world units
 * @param speed drift speed multiplier
 * @param rotSpeed continuous spin (radians per frame) around Y
 * @param phase decorrelates groups sharing the same speed
 */
export function useFloat(
  ref: React.RefObject<{ position: Vector3; rotation: { x: number; y: number; z: number } } | null>,
  amp = 0.05,
  speed = 0.5,
  rotSpeed = 0.002,
  phase = 0,
) {
  const base = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const obj = ref.current;
    if (!obj) return;
    if (base.lengthSq() === 0) base.copy(obj.position);
    const t = state.clock.elapsedTime;
    obj.position.set(
      base.x + Math.sin(t * speed + phase) * amp,
      base.y + Math.sin(t * speed * 0.83 + phase * 1.7) * amp * 0.8,
      base.z + Math.cos(t * speed * 0.91 + phase * 2.3) * amp,
    );
    obj.rotation.y += rotSpeed;
    obj.rotation.x = Math.sin(t * speed * 0.4 + phase) * rotSpeed * 1.5;
  });
}

/**
 * Combined drift + exploded-view offset for satellite organelles
 * (mitochondria, lysosomes, peroxisomes, vacuoles...). The group floats
 * gently around its base position; when the store's exploded flag is set it
 * also slides outward along its radial direction.
 */
export function useDriftExplode(
  ref: React.RefObject<{ position: Vector3 } | null>,
  base: Vec3Tuple,
  {
    floatAmp = 0.06,
    speed = 0.4,
    explodeDist = 1.9,
    seed = 0,
  }: { floatAmp?: number; speed?: number; explodeDist?: number; seed?: number } = {},
) {
  const baseV = useMemo(() => new Vector3(...base), [base]);
  const dir = useMemo(() => baseV.clone().normalize(), [baseV]);
  const explodeF = useRef(0);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const exploded = useCellStore.getState().exploded;
    explodeF.current += ((exploded ? 1 : 0) - explodeF.current) * Math.min(1, delta * 3);
    const t = state.clock.elapsedTime;
    const s = seed * 10;
    g.position.set(
      baseV.x + Math.sin(t * speed + s) * floatAmp + dir.x * explodeF.current * explodeDist,
      baseV.y + Math.sin(t * speed * 0.83 + s * 1.3) * floatAmp * 0.8 + dir.y * explodeF.current * explodeDist,
      baseV.z + Math.cos(t * speed * 0.91 + s * 1.7) * floatAmp + dir.z * explodeF.current * explodeDist,
    );
  });
}

type Vec3Tuple = [number, number, number];

/**
 * Accumulates scene time (frozen while animations are paused) and pushes
 * global state — clip plane, X-ray fade, focus dim — into the shared
 * uniforms. Mounted once inside the Canvas by <Scene/>.
 */
export function useUniformClock() {
  useFrame((_, delta) => {
    const s = useCellStore.getState();
    if (!s.animationsPaused) sharedUniforms.uTime.value += delta;

    // X-ray + focus-dim ease toward their targets for soft transitions.
    sharedUniforms.uXray.value +=
      ((s.xray ? 1 : 0) - sharedUniforms.uXray.value) * Math.min(1, delta * 5);
    const dimTarget = s.selectedId ? 1 : 0;
    sharedUniforms.uFocusDim.value +=
      (dimTarget - sharedUniforms.uFocusDim.value) * Math.min(1, delta * 5);

    // Slice plane: when disabled, park it far away (keeps shaders branchless).
    const target = s.sliceEnabled ? s.slicePosition : 1e7;
    const next = sharedUniforms.uClip.value.w + (target - sharedUniforms.uClip.value.w) * Math.min(1, delta * 6);
    sharedUniforms.uClip.value.set(-1, 0, 0, next);
    slicePlane.constant = Math.min(next, 1e6);
  });
}
