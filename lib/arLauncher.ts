'use client';

/**
 * Launches Google Scene Viewer AR by opening Chrome system browser.
 */
export function launchAndroidAR(
  modelUrl: string = 'https://cdn.jsdelivr.net/gh/BruhhMoment123/AugmentedR@main/public/models/cell_sphere.glb',
  title: string = 'Human Cell 3D AR Model'
) {
  if (typeof window === 'undefined') return;

  const sceneViewerUrl = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
    modelUrl
  )}&title=${encodeURIComponent(title)}&mode=ar_preferred&launch-ar=true`;

  window.location.href = sceneViewerUrl;
}
