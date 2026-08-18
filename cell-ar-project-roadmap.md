# Project Brief: Human Cell AR Viewer

## Context
This is a student project. A senior team member has already built an interactive
3D human cell model (with organelles) as a **web app**. My job is to extend that
existing web app with an **Augmented Reality (AR) mode**, optimized to run
smoothly on **low-end Android phones**.

## Existing setup (already built by senior)
- **Framework:** Next.js 16, React 19, TypeScript
- **3D rendering:** React Three Fiber, three.js, drei
- **Post-processing:** @react-three/postprocessing
- **State management:** zustand
- **Animation:** framer-motion, @react-spring
- **Dev tooling:** Leva (debug GUI — dev only, must be excluded from production/AR builds)
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react
- **Data source:** organelle data/config centralized in `data/organelles.ts`
- **Accuracy notes:** organelle counts/sizes are intentionally simplified/exaggerated
  for inspectability (e.g. real cells have ~1,000–2,000 mitochondria; counts and
  scale here are representative, not literal). This is documented in `data/organelles.ts`.

## Scope decisions (finalized)
- **Platform target: Android only** (via Chrome). iOS was considered but dropped —
  iOS Safari does not support WebXR natively, and supporting it would require a
  paid/third-party bridge (e.g. 8th Wall). Not worth the complexity for this project.
- **Budget constraint: $0.** No paid services, SDKs, or subscriptions of any kind.
  Everything in this plan is open-source / free-tier-sufficient (npm packages,
  browser-native APIs, free hosting tier for testing).
- **AR approach: native WebXR via `@react-three/xr`**, not 8th Wall, not a native
  (Kotlin/Swift) rewrite, not Unity. This integrates directly into the existing
  React Three Fiber scene with minimal architectural change.

## AR library choice: `@react-three/xr`
- Open source, MIT-licensed, npm package (`npm install @react-three/xr`)
- Built specifically for React Three Fiber — interoperates with existing drei,
  postprocessing, and zustand setup without a separate renderer
- Provides hit-testing, plane/mesh detection, and anchors out of the box —
  needed for placing the cell model on a real-world surface (floor/table) and
  keeping it tracked in place
- No account, no usage limits, no cost

## Roadmap

### Phase 1 — Audit the existing scene
- Get access to the current Three.js/R3F project
- Check `renderer.info` for current triangle count, draw calls, texture sizes
- Identify whether models are loaded as glTF/GLB already, and current file sizes
- Determine if the project uses plain R3F or has any SSR-related quirks with
  Next.js (Canvas/WebGL must be client-only)

### Phase 2 — Wrap existing scene in AR
- `npm install @react-three/xr`
- Wrap current `<Canvas>` content in `<XR store={store}>`
- Add an "Enter AR" button calling `store.enterAR()`
- Goal: get the existing cell model appearing in the phone camera view with no
  other changes yet — validate the integration works before optimizing

### Phase 3 — Real-world placement
- Implement hit-testing so the user taps their floor/table and the model
  anchors there, instead of floating at a fixed point
- Add tap-to-place and pinch-to-scale (real-world scale varies per user)

### Phase 4 — Wire up existing interactions to AR
- Reuse existing tap/click logic for organelle selection where possible —
  changing the camera/presentation layer shouldn't require rebuilding
  interaction logic
- IMPORTANT: disable `OrbitControls`/`CameraControls` (from drei) during an
  active XR session — WebXR controls the camera transform directly and will
  conflict with orbit controls if both are active at once

### Phase 5 — Performance optimization pass (core of the "low-end phone" goal)
- **Compression:** run models through Draco (geometry) and KTX2/Basis Universal
  (textures) using free tools (`gltf-transform`, `toktx`) if not already applied
- **Texture sizing:** downscale any 4K textures to 1K–2K depending on inspection
  distance
- **Postprocessing:** strip or gate `@react-three/postprocessing` effects
  (bloom, DOF, etc.) for the AR build — test frame rate with/without on a real
  low-end device
- **LOD strategy:** load a low-poly whole-cell view first; stream in higher
  detail per-organelle only when the user taps/zooms into it
- **Draw call budget:** target roughly <50k triangles and <30 draw calls
  visible at once as a starting benchmark for low-end Android
- **Build hygiene:** confirm Leva and any dev-only tooling is excluded from the
  production/AR build (typically via `NODE_ENV` check)

### Phase 6 — Test on real hardware
- Test on an actual low-end/mid-range Android phone (Chrome) throughout, not
  just a dev laptop
- SLAM/plane-detection overhead is often the real bottleneck, not model
  polycount — profile accordingly

## Immediate next step (spike/prototype)
Before doing the full optimization pass, validate feasibility with a small spike:
1. Take one real organelle model from the existing scene
2. Wrap the existing `<Canvas>` in `<XR>`, add a basic `store.enterAR()` button
   and hit-test placement
3. Run it on a real Android device (Chrome) and check `renderer.info` for
   triangle count/frame rate

This single spike will show concretely whether the existing models need
serious decimation/compression before AR, or whether they're already close.

## Explicit non-goals for this project
- No iOS support (dropped by design, not an oversight)
- No paid services, SDKs, or subscriptions of any kind
- No native (Kotlin/Swift) or Unity rewrite — staying within the existing
  Next.js/React Three Fiber codebase
