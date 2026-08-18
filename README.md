# Human Cell 3D — Interactive Exhibit & AR Experience

A scientifically accurate, interactive 3D human cell experience built with **Next.js 16**, **React 19**, **React Three Fiber**, and **Capacitor**. **Every organelle and structure is procedurally generated using code and GLSL shaders** — no external downloaded 3D assets or HDRIs are used anywhere in the web engine.

Includes a custom **Procedural Scene-to-glTF Exporter** and **Google Scene Viewer AR Integration** for augmented reality visualization on Android devices.

---

## 🏗️ Architecture & Project Structure

```
human-cell-3d/
├── app/                        # Next.js 16 App Router (pages & server components)
│   ├── cell/                   # Fullscreen 3D cell exhibit page
│   ├── dashboard/              # Student learning dashboard
│   ├── courses/                # Biology curriculum modules
│   └── leaderboard/            # Student quiz leaderboard
├── components/
│   ├── scene/                  # WebGL Canvas root, Scene assembly, CameraRig, Lighting, Post-effects
│   ├── cell/                   # Plasma membrane, cytoplasm, GPU particle clouds, organelle shells
│   ├── organelles/             # Nucleus, Mitochondria, Golgi Apparatus, ER, Cytoskeleton, Lysosomes, etc.
│   └── ui/                     # Interactive HUD (Info panel, search bar, slice slider, tour overlay, toolbar)
├── lib/
│   ├── exportGLB.ts            # 📦 Procedural GLB Exporter (converts live Three.js scene to glTF 2.0)
│   ├── arLauncher.ts           # 📱 Android AR Launcher (launches Google Scene Viewer via Chrome Intents)
│   ├── store.ts                # Zustand global state (selection, camera flights, slicing, visualization modes)
│   └── interaction.ts          # Raycasting, organelle picking logic, and container yielding
├── materials/                  # ShaderMaterial factories (spreading shared uTime / uClip / uXray uniforms)
├── shaders/                    # Custom GLSL shaders (simplex noise, fbm, breath motion, energy waves)
├── data/                       # Scientific biology content database (organelle positions, facts, accuracy notes)
├── android/                    # Capacitor native Android app wrapper
│   └── app/src/main/java/.../MainActivity.java # Native Intent router for Google Scene Viewer & Chrome
└── scripts/
    └── install-apk.sh          # Helper script to deploy built debug APK to connected Android devices
```

---

## 🔬 Key Technical Features

### 1. Interactive 3D Exhibit (`components/scene/`, `components/organelles/`)
- **Procedural Geometry**: Organelles (nucleus, double membrane envelope, cristae folds, cisternae stack, chromatin tubes) generated via noise-displaced spheres and Catmull-Rom splines.
- **Custom Shaders (`shaders/glsl.ts`)**: Plasma membrane SSS translucency, mitochondria energy band sweeps, chromatin swaying, and enzymatic glow shaders.
- **Interactive Mechanics**: Click-to-focus camera flights, slice plane cutting slider, exploded view expansion, X-ray mode, wireframe mode, and an 11-stop guided biology tour.

### 2. AR Export Pipeline (`lib/exportGLB.ts`)
Google Scene Viewer and WebXR AR engines cannot render custom web GLSL shaders or unconstrained scene scales. `lib/exportGLB.ts` bridges this gap:
- **Material Translation**: Deep-clones the live scene and converts custom `ShaderMaterial` and `MeshPhysicalMaterial` instances into clean `MeshStandardMaterial` PBR instances.
- **Geometry Optimization**: Merges `InstancedMesh` populations (pores, channels, receptors, pumps) using `BufferGeometryUtils.mergeGeometries` to reduce node count from **1,500+ down to ~25 nodes**.
- **AR Scale Bounding**: Scales the 10-meter web view model down to **0.7 meters (70 cm)** — optimal tabletop/floor AR size for Google Scene Viewer (< 2.5m limit).
- **Attribute & Light Stripping**: Removes non-standard buffer attributes and scene lights to produce a **pure glTF 2.0 binary file (`cell_sphere.glb`) with 0 glTF validation errors**.

### 3. Native Android AR Integration (`lib/arLauncher.ts` & `MainActivity.java`)
- **Android Intent Router**: `MainActivity.java` intercepts AR requests and dispatches an Android `Intent` targeting Google Chrome (`com.android.chrome`) with `package=com.google.ar.core`.
- **CDN Fallback**: Uses jsDelivr CDN (`cdn.jsdelivr.net`) to serve `.glb` models with strict `model/gltf-binary` MIME headers and CORS headers required by Android ARCore.

---

## 🛠️ Commands & Scripts

### Development & Web Server
```bash
npm run dev
# Launches Next.js dev server at http://localhost:3000
```

### TypeScript Validation
```bash
npx tsc --noEmit
# Runs strict TypeScript type-checker across the entire codebase
```

### Native Android APK Build & Install
```bash
# 1. Build the native Android APK
npm run build:apk

# 2. Deploy APK to connected Android smartphone via ADB
./scripts/install-apk.sh
```

---

## 📚 Science & Accuracy Notes

Representational organelle counts (e.g., 7 representative mitochondria out of ~1,000 in a living cell), slightly enlarged organelles for visibility, and exaggerated membrane bilayer thickness are documented in `data/organelles.ts`.
