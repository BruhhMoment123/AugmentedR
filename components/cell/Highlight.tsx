'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { BackSide, Group, Mesh, MeshBasicMaterial } from 'three';

/**
 * Holographic hover/selection outline.
 *
 * Clones the geometry of every mesh inside the target group into:
 *  - a slightly enlarged wireframe copy (the "scan line" outline)
 *  - a slightly larger back-side shell (soft glow halo)
 * Both are emissive, depth-tested but not depth-writing, so the effect
 * reads as an X-ray overlay without hiding surface detail.
 */
export function Highlight({ target, color }: { target: RefObject<Group | null>; color: string }) {
  const ref = useRef<Group>(null);

  const wireMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      }),
    [color],
  );
  const haloMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.07,
        side: BackSide,
        depthWrite: false,
      }),
    [color],
  );

  useEffect(() => {
    const host = ref.current;
    const source = target.current;
    if (!host || !source) return;
    source.updateWorldMatrix(true, true);
    const inverse = source.matrixWorld.clone().invert();
    source.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!(mesh as unknown as { isMesh?: boolean }).isMesh || !mesh.geometry) return;
      // Convert the mesh's world transform into the highlight group's space.
      const local = inverse.clone().multiply(mesh.matrixWorld);
      for (const [mat, scale] of [
        [wireMat, 1.015],
        [haloMat, 1.05],
      ] as const) {
        const clone = new Mesh(mesh.geometry, mat);
        local.decompose(clone.position, clone.quaternion, clone.scale);
        clone.scale.multiplyScalar(scale);
        host.add(clone);
      }
    });
    return () => {
      host.clear();
    };
  }, [target, wireMat, haloMat]);

  return <group ref={ref} />;
}
