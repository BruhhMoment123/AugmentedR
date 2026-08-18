'use client';

import { useMemo } from 'react';
import { Color, MeshPhysicalMaterial, type MeshPhysicalMaterialParameters } from 'three';
import { slicePlane } from '@/lib/uniforms';

/**
 * Creates a MeshPhysicalMaterial wired into the app's global slicing plane.
 * (Wireframe mode is applied globally by a scene traversal in <Scene/>;
 * filter dimming is handled centrally by <Dimmer/> through material.opacity.)
 */
export function usePhysicalMaterial(
  params: MeshPhysicalMaterialParameters & { color: string },
): MeshPhysicalMaterial {
  return useMemo(() => {
    const m = new MeshPhysicalMaterial({
      ...params,
      color: new Color(params.color),
      clippingPlanes: [slicePlane],
    });
    m.userData.baseOpacity = params.opacity ?? 1;
    return m;
    // Params are treated as immutable configuration for the material's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
