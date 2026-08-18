<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Human Cell — Interactive 3D Exhibit

Museum-quality interactive 3D human cell built with Next.js 16 + React 19 +
React Three Fiber. **Every mesh is procedurally generated** — no downloaded
models, textures or HDRIs anywhere (the loading-screen sprite and the
environment map are generated at runtime).

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build (must stay green)
- `npm run lint` — ESLint (must stay green)
- `npx tsc --noEmit` — type check (must stay green)

## Architecture

- `app/` — Next.js App Router shell. `page.tsx` is a Server Component that
  renders `components/ClientShell.tsx`; the R3F canvas is loaded with
  `next/dynamic` + `ssr: false` (allowed only inside Client Components).
- `components/scene/` — Canvas root, `Scene` (assembly), `CameraRig`
  (orbit + damped fly-to), `Lighting` (procedural Lightformer environment),
  `Effects` (bloom/SMAA/vignette post chain).
- `components/cell/` — membrane, cytoplasm, GPU particles, labels,
  `OrganelleShell` (shared interaction wrapper), `Highlight`.
- `components/organelles/` — one module per organelle system.
- `components/ui/` — HUD: info panel, toolbar, filter menu, search, slice
  control, tour, tooltip, loader, Leva debug panel (dev only).
- `shaders/glsl.ts` — all GLSL (simplex noise + fbm chunk shared by every
  shader). `materials/` — ShaderMaterial factories.
- `lib/` — zustand store, shared uniforms (`uTime/uClip/uXray/uFocusDim`),
  click-through picking logic, seeded simplex noise.
- `data/organelles.ts` — biological content DB (positions, descriptions,
  facts) incl. documented accuracy simplifications.
- `hooks/` — `useFloat`, `useDriftExplode`, `useUniformClock` (drives the
  shared uniforms from the store each frame).

## Conventions (follow them when editing)

- **Selection**: every pickable mesh carries `userData.organelleId` and uses
  `pickable(id)` from `lib/interaction.ts`. Membrane/cytoplasm are
  "containers" that yield to organelles behind them on the same ray.
- **Animation**: imperative, inside `useFrame` only — never setState per
  frame. Shader time comes from the shared `uTime` uniform (pause-safe).
- **Custom shaders** must accept `uClip` (global slice plane), `uDim`
  (filter fade), and read `sharedUniforms` by reference.
- **Built-in materials** must pass `clippingPlanes={[slicePlane]}`.
- New organelles need: an entry in `data/organelles.ts` (drives labels,
  search, info panel, filters), an `OrganelleShell`-wrapped component, and
  registration in `components/scene/Scene.tsx`.
- The strict `react-hooks/immutability` and `react-hooks/refs` rules flag
  idiomatic three.js mutations — suppress them case-by-case with
  `eslint-disable-next-line` + a short justification, never globally.
