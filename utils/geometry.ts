import {
  BufferGeometry,
  CatmullRomCurve3,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
} from 'three';
import { cellNoise, mulberry32 } from '@/lib/noise';

/**
 * Procedural geometry helpers. Everything in the scene is generated here —
 * no external models are used anywhere in this project.
 */

/**
 * Displace a sphere-like geometry with two octaves of simplex noise to get
 * an organic, slightly lumpy cell surface. Displacement is baked on the CPU
 * once; small-scale motion is added later in the vertex shader.
 */
export function makeOrganicSphere(
  radius: number,
  widthSegs: number,
  heightSegs: number,
  amp: number,
  freq: number,
  seed = 0,
): SphereGeometry {
  const geo = new SphereGeometry(radius, widthSegs, heightSegs);
  const pos = geo.attributes.position;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();
    // Broad lumps + finer bumps keep the sphere readable but organic.
    const d1 = cellNoise.fbm(n.x * freq + seed, n.y * freq + seed * 1.7, n.z * freq - seed, 3);
    const d2 = cellNoise.noise(n.x * freq * 3.1 + 40 + seed, n.y * freq * 3.1, n.z * freq * 3.1);
    const offset = d1 * amp + d2 * amp * 0.35;
    v.copy(n).multiplyScalar(radius + offset);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Evenly distribute `count` points on a sphere (golden-angle spiral). */
export function fibonacciSphere(count: number, radius: number): Vector3[] {
  const pts: Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push(new Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return pts;
}

/** Random point inside a sphere shell (minR..maxR), seeded. */
export function randomInShell(rand: () => number, minR: number, maxR: number): Vector3 {
  const u = rand() * 2 - 1;
  const theta = rand() * Math.PI * 2;
  const rr = Math.sqrt(1 - u * u);
  const r = minR + (maxR - minR) * Math.cbrt(rand());
  return new Vector3(rr * Math.cos(theta) * r, u * r, rr * Math.sin(theta) * r);
}

/**
 * Random-walk curve contained inside a sphere — used for chromatin fibers.
 * Steps are smoothed by Catmull-Rom so the fiber reads as a polymer strand.
 */
export function randomWalkCurve(
  rand: () => number,
  boundRadius: number,
  steps: number,
  stepSize: number,
): CatmullRomCurve3 {
  const pts: Vector3[] = [];
  const p = randomInShell(rand, 0, boundRadius * 0.4);
  for (let i = 0; i < steps; i++) {
    pts.push(p.clone());
    const dir = randomInShell(rand, 1, 1).normalize();
    p.addScaledVector(dir, stepSize * (0.6 + rand() * 0.8));
    if (p.length() > boundRadius) p.setLength(boundRadius * (0.75 + rand() * 0.2));
  }
  return new CatmullRomCurve3(pts, false, 'centripetal', 0.6);
}

/** Smooth wandering tube curve inside a region — for smooth ER tubules. */
export function wanderingCurve(
  rand: () => number,
  center: Vector3,
  spread: number,
  points = 6,
): CatmullRomCurve3 {
  const pts: Vector3[] = [];
  for (let i = 0; i < points; i++) {
    pts.push(
      new Vector3(
        center.x + (rand() - 0.5) * spread,
        center.y + (rand() - 0.5) * spread * 0.55,
        center.z + (rand() - 0.5) * spread,
      ),
    );
  }
  return new CatmullRomCurve3(pts, false, 'centripetal', 0.7);
}

/**
 * Cristae geometry: a plane folded into deep accordion pleats, the hallmark
 * of the mitochondrial inner membrane. Folds fade toward the short edges so
 * the sheet reads as contained inside the outer membrane.
 */
export function makeCristaeGeometry(
  width: number,
  height: number,
  folds: number,
  foldAmp: number,
  phase: number,
): BufferGeometry {
  const plane = new PlaneGeometry(width, height, 72, 10);
  const pos = plane.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = x / width + 0.5;
    const edgeFade = Math.sin(Math.min(1, Math.abs(y) / (height / 2)) * Math.PI * 0.5);
    const envelope = Math.sin(u * Math.PI); // flatten at both ends
    const z =
      Math.sin(u * Math.PI * folds + phase) * foldAmp * envelope * (0.45 + 0.55 * edgeFade);
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  plane.computeVertexNormals();
  return plane;
}

export { mulberry32 };
