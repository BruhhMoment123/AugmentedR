'use client';

/**
 * Launches Google Scene Viewer AR by opening Chrome system browser.
 */
export function launchAndroidAR(
  modelUrl: string = 'https://cdn.jsdelivr.net/gh/BruhhMoment123/AugmentedR@main/public/models/cell_sphere.glb',
  title: string = 'Human Cell 3D AR Model'
) {
  if (typeof window === 'undefined') return;

  const fallbackWebUrl = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
    modelUrl
  )}&title=${encodeURIComponent(title)}&mode=ar_preferred`;

  // Standard Google Scene Viewer Intent URL format for Android Chrome
  const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
    modelUrl
  )}&title=${encodeURIComponent(
    title
  )}&mode=ar_preferred#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
    fallbackWebUrl
  )};end;`;

  // Navigate to intent URL (triggers Chrome / Android intent handler)
  window.location.href = intentUrl;
}

