'use client';

import { Suspense, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useCellStore } from '@/lib/store';
import { useUniformClock } from '@/hooks/useFloat';
import { CellMembrane } from '../cell/CellMembrane';
import { Cytoplasm } from '../cell/Cytoplasm';
import { Labels } from '../cell/Labels';
import { SelectionHalo } from '../cell/SelectionHalo';
import { Nucleus } from '../organelles/Nucleus';
import { EndoplasmicReticulum } from '../organelles/EndoplasmicReticulum';
import { GolgiApparatus } from '../organelles/GolgiApparatus';
import { Mitochondria } from '../organelles/Mitochondria';
import { Lysosomes, Peroxisomes } from '../organelles/Lysosomes';
import { Centrioles, FreeRibosomes } from '../organelles/Centrioles';
import { TransportVesicles, Endosomes, Vacuoles } from '../organelles/Vesicles';
import { Cytoskeleton } from '../organelles/Cytoskeleton';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { Effects } from './Effects';
import { type Scene as ThreeScene, Material } from 'three';

/**
 * A module-level ref that holds the live Three.js scene.
 * Set by SceneRegistrar (inside canvas) and read by ExportGLBButton (outside).
 */
export let liveScene: ThreeScene | null = null;

/** Runs inside the R3F canvas; registers the scene so DOM components can access it. */
function SceneRegistrar() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    liveScene = scene;
    return () => { liveScene = null; };
  }, [scene]);
  return null;
}

/**
 * Everything inside the Canvas: the living cell plus its support systems.
 */
export function Scene() {
  useUniformClock();

  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const wireframe = useCellStore((s) => s.wireframe);

  // Global slicing support for built-in materials.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- renderer flags are set imperatively by design
    gl.localClippingEnabled = true;
    // Slightly pulled-down exposure for deeper, more cinematic contrast.
    gl.toneMappingExposure = 0.88;
  }, [gl]);

  // Global wireframe mode (applies to custom shaders and built-ins alike).
  useEffect(() => {
    scene.traverse((obj) => {
      const withMat = obj as unknown as { material?: Material | Material[] };
      if (!withMat.material) return;
      const mats = Array.isArray(withMat.material) ? withMat.material : [withMat.material];
      for (const m of mats) {
        if ('wireframe' in m) {
          (m as Material & { wireframe: boolean }).wireframe = wireframe;
          m.needsUpdate = true;
        }
      }
    });
  }, [wireframe, scene]);

  return (
    <>
      <Lighting />
      <CameraRig />
      <SceneRegistrar />

      <Suspense fallback={null}>
        {/* The cell body */}
        <CellMembrane />
        <Cytoplasm />

        {/* Organelles */}
        <Nucleus />
        <EndoplasmicReticulum />
        <GolgiApparatus />
        <Mitochondria />
        <Lysosomes />
        <Peroxisomes />
        <Centrioles />
        <FreeRibosomes />
        <TransportVesicles />
        <Endosomes />
        <Vacuoles />
        <Cytoskeleton />

        {/* Annotation + selection layer */}
        <Labels />
        <SelectionHalo />
      </Suspense>

      <Effects />
    </>
  );
}
