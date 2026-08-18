import { Plane, Vector3, Vector4 } from 'three';

/**
 * Uniform objects shared by every custom ShaderMaterial in the scene.
 * Because all materials reference the *same* uniform objects, a single
 * update per frame (see <UniformUpdater/>) propagates everywhere —
 * time, the global slicing plane and X-ray fade stay perfectly in sync.
 */
export const sharedUniforms = {
  /** Seconds since the scene started (frozen when animations are paused). */
  uTime: { value: 0 },
  /**
   * Global clipping plane packed as (normal.xyz, constant).
   * Fragments where dot(worldPos, normal) + constant < 0 are discarded.
   * A huge positive constant effectively disables slicing.
   */
  uClip: { value: new Vector4(1, 0, 0, 1e7) },
  /** 0 = normal view, 1 = full X-ray (membrane/cytoplasm almost invisible). */
  uXray: { value: 0 },
  /** Dims the "container" shells while an organelle is focused (0..1). */
  uFocusDim: { value: 0 },
};

/**
 * The same slicing plane as a THREE.Plane, assigned to every built-in
 * (MeshPhysicalMaterial etc.) material via `clippingPlanes` so standard
 * and custom-shader geometry slice identically.
 */
export const slicePlane = new Plane(new Vector3(-1, 0, 0), 1e7);
