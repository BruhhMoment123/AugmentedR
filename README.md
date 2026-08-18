# Human Cell — Interactive 3D Exhibit

A museum-quality, scientifically accurate interactive 3D human cell, built
entirely from procedural geometry, custom GLSL shaders and original code —
**no downloaded 3D models, textures or HDRIs**.

![Tech](https://img.shields.io/badge/Next.js-16-black) ![Tech](https://img.shields.io/badge/React%20Three%20Fiber-9-blue) ![Tech](https://img.shields.io/badge/three.js-0.185-orange)

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

## What you can do

- **Explore freely** — orbit, pan, zoom from the whole cell down to ATP
  particles inside a mitochondrion's cristae.
- **Click any organelle** — holographic highlight, camera fly-to, and a full
  biology panel (structure, function, location, facts, related organelles).
- **Slice mode** — sweep a medical-imaging cutting plane through the cell.
- **Exploded view** — every organelle glides apart with its labels intact.
- **X-ray & wireframe modes**, three label densities, and structure
  isolation filters (show only mitochondria, only nucleus, ...).
- **Search** (`/` to focus) — type "mitochondria" and the camera flies there.
- **Guided tour** — an 11-stop narrated walk through the cell.

## Everything is alive

Membrane breathing, drifting membrane proteins (fluid mosaic model), Brownian
cytosol particles, vesicles commuting ER → Golgi → membrane, budding Golgi
cisternae, energy bands sweeping along cristae, vibrating ribosomes,
treadmilling microtubules, swaying chromatin — all procedural, all
pause-able from the info panel.

## Accuracy notes

Representative organelle counts (a real cell has ~1,000–2,000 mitochondria),
slightly enlarged organelles for inspectability, and a vastly exaggerated
bilayer thickness — each simplification is documented in
`data/organelles.ts`.

## Stack

Next.js 16 · React 19 · TypeScript · React Three Fiber · three.js · drei ·
@react-three/postprocessing · zustand · framer-motion · @react-spring ·
Leva · Tailwind CSS 4 · lucide-react
