/**
 * GLSL source library. All shaders are original work written for this
 * project. Shared chunks (noise, clipping) live at the top; individual
 * materials compose them below.
 */

/* ------------------------------------------------------------------ */
/* Shared chunks                                                       */
/* ------------------------------------------------------------------ */

/** Ashima / Ian McEwan simplex noise (MIT-style, widely used reference). */
export const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return sum;
}
`;

/** Declarations shared by every fragment shader that supports slicing. */
export const CLIP_PARS = /* glsl */ `
uniform vec4 uClip;
`;
/** Apply after vWorldPos is available. */
export const CLIP_APPLY = /* glsl */ `
if (dot(vWorldPos, uClip.xyz) + uClip.w < 0.0) discard;
`;

/* ------------------------------------------------------------------ */
/* Organic translucent shell (cell membrane / nuclear envelope)        */
/* ------------------------------------------------------------------ */

export const SHELL_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uBreathAmp;
uniform float uNoiseScale;
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
${NOISE_GLSL}
void main() {
  vec3 pos = position;
  // Gentle breathing: low-frequency noise swells and relaxes the surface.
  float breath = fbm(position * uNoiseScale + vec3(0.0, 0.0, uTime * 0.12));
  pos += normal * breath * uBreathAmp;
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const SHELL_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uRimColor;
uniform vec3 uLightDir;
uniform float uAlpha;
uniform float uTime;
uniform float uXray;
uniform float uFocusDim;
uniform float uHover;
uniform float uLipidPattern;
uniform float uInner;
uniform float uDim;
uniform float uBump;
uniform float uBumpFreq;
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
${NOISE_GLSL}
${CLIP_PARS}
void main() {
  ${CLIP_APPLY}
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(vViewDir);
  vec3 L = normalize(uLightDir);

  // Procedural micro-relief: perturb the normal with a noise gradient so
  // light catches millions of tiny surface bumps (bump mapping in-shader).
  if (uBump > 0.0001) {
    vec3 bp = vWorldPos * uBumpFreq;
    float be = 0.06;
    vec3 bgrad = vec3(
      snoise(bp + vec3(be, 0.0, 0.0)) - snoise(bp - vec3(be, 0.0, 0.0)),
      snoise(bp + vec3(0.0, be, 0.0)) - snoise(bp - vec3(0.0, be, 0.0)),
      snoise(bp + vec3(0.0, 0.0, be)) - snoise(bp - vec3(0.0, 0.0, be))
    );
    N = normalize(N - bgrad * uBump);
  }

  float ndv = abs(dot(N, V));
  float fresnel = pow(1.0 - ndv, 2.6);

  // Wrapped diffuse: light appears to bleed around the membrane (SSS look).
  float wrap = pow(clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0), 1.6);
  // Back-scatter: glow when the light is behind the surface.
  float back = pow(clamp(dot(V, -L + N * 0.35), 0.0, 1.0), 3.0);

  vec3 col = uColor * (0.3 + 0.7 * wrap);
  col += uRimColor * fresnel * 0.5;
  col += uColor * back * 0.35;

  // Two-scale phospholipid head speckle on the outer leaflet.
  if (uLipidPattern > 0.5) {
    vec3 sp = normalize(vWorldPos);
    float heads1 = smoothstep(0.55, 0.9, snoise(sp * 30.0 + vec3(uTime * 0.02)));
    float heads2 = smoothstep(0.6, 0.95, snoise(sp * 65.0 - vec3(uTime * 0.015)));
    col += vec3(1.0, 0.8, 0.62) * (heads1 * 0.055 + heads2 * 0.04);
  }

  // Inner leaflet renders darker to fake bilayer depth.
  col *= mix(1.0, 0.55, uInner);

  // Hover / selection shimmer.
  col += uRimColor * uHover * (0.22 + 0.12 * sin(uTime * 5.0));

  float alpha = uAlpha + fresnel * 0.22;
  alpha *= 1.0 - uXray * 0.94;
  alpha *= 1.0 - uFocusDim * 0.6;
  alpha *= 1.0 - uDim * 0.92;

  gl_FragColor = vec4(col, alpha);
}
`;

/* ------------------------------------------------------------------ */
/* Cytoplasm gel                                                       */
/* ------------------------------------------------------------------ */

export const CYTOPLASM_VERTEX = /* glsl */ `
uniform float uTime;
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
${NOISE_GLSL}
void main() {
  vec3 pos = position + normal * fbm(position * 0.5 + vec3(uTime * 0.05)) * 0.08;
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const CYTOPLASM_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uXray;
uniform float uFocusDim;
uniform float uDim;
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
${NOISE_GLSL}
${CLIP_PARS}
void main() {
  ${CLIP_APPLY}
  vec3 V = normalize(vViewDir);
  float fresnel = pow(1.0 - abs(dot(normalize(vNormalW), V)), 2.0);

  // Slow internal shimmer, like refractive density shifts in living gel.
  float shimmer = fbm(vWorldPos * 0.8 + vec3(0.0, uTime * 0.06, 0.0)) * 0.5 + 0.5;

  vec3 col = uColor * (0.4 + 0.45 * shimmer) + uColor * fresnel * 0.35;
  float alpha = (0.028 + fresnel * 0.13 + shimmer * 0.02);
  alpha *= 1.0 - uXray * 0.95;
  alpha *= 1.0 - uFocusDim * 0.6;
  alpha *= 1.0 - uDim * 0.92;
  gl_FragColor = vec4(col, alpha);
}
`;

/* ------------------------------------------------------------------ */
/* GPU particles (cytosol proteins, ions, ATP)                         */
/* ------------------------------------------------------------------ */

export const PARTICLE_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uSpeed;
uniform float uWanderAmp;
uniform vec3 uFlow;
uniform vec3 uFlowBounds;
attribute float aSeed;
attribute float aScale;
varying float vFade;
${NOISE_GLSL}
void main() {
  vec3 p = position;
  // Brownian-style wander: three decorrelated noise fields, one per axis.
  vec3 seed = vec3(aSeed * 12.9, aSeed * 78.2, aSeed * 37.7);
  p += vec3(
    snoise(seed + vec3(uTime * 0.22, 0.0, 0.0)),
    snoise(seed + vec3(0.0, uTime * 0.19, 4.7)),
    snoise(seed + vec3(9.3, 0.0, uTime * 0.24))
  ) * uWanderAmp;

  // Optional directional flow (ATP streaming through the matrix, etc).
  if (length(uFlow) > 0.001) {
    float t = fract(aSeed + uTime * uSpeed);
    p += uFlow * t * uFlowBounds;
    vFade = sin(t * 3.14159); // fade in/out along the path
  } else {
    vFade = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed) + aSeed * 40.0);
  }

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * aScale * (160.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

export const PARTICLE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uDim;
varying float vFade;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float alpha = smoothstep(0.5, 0.04, d) * uOpacity * vFade * (1.0 - uDim * 0.92);
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`;

/* ------------------------------------------------------------------ */
/* Mitochondrial cristae — emissive folds with flowing energy          */
/* ------------------------------------------------------------------ */

export const CRISTAE_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const CRISTAE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uGlowColor;
uniform float uTime;
uniform float uHover;
uniform float uPhase;
uniform float uDim;
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
${NOISE_GLSL}
${CLIP_PARS}
void main() {
  ${CLIP_APPLY}
  vec3 V = normalize(vViewDir);
  float fresnel = pow(1.0 - abs(dot(normalize(vNormalW), V)), 1.8);

  // Electron transport chain: bands of energy sweeping along the folds.
  float flow = 0.55 + 0.45 * sin(vUv.x * 26.0 - uTime * 2.6 + uPhase);
  float pulse = 0.75 + 0.25 * sin(uTime * 1.4 + uPhase);

  vec3 col = uColor * 0.42;
  col += uGlowColor * flow * 0.5 * pulse;
  col += uGlowColor * fresnel * 0.45;

  // ATP synthase knobs: dense protein bumps studding the cristae surface.
  float knob = smoothstep(0.72, 0.95, snoise(vWorldPos * 24.0));
  col += uGlowColor * knob * 0.22;

  col += uGlowColor * uHover * 0.3;

  float alpha = 0.72 + fresnel * 0.15;
  alpha *= 1.0 - uDim * 0.92;
  gl_FragColor = vec4(col, alpha);
}
`;

/* ------------------------------------------------------------------ */
/* Chromatin fiber — gentle molecular sway inside the nucleus          */
/* ------------------------------------------------------------------ */

export const CHROMATIN_VERTEX = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vViewDir;
${NOISE_GLSL}
void main() {
  vUv = uv;
  vec3 pos = position + normal * snoise(position * 1.8 + vec3(uTime * 0.25)) * 0.02;
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const CHROMATIN_FRAGMENT = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uHover;
uniform float uDim;
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vViewDir;
${CLIP_PARS}
void main() {
  ${CLIP_APPLY}
  float t = 0.5 + 0.5 * sin(vUv.x * 14.0 + uTime * 0.5);
  vec3 col = mix(uColorA, uColorB, t);
  // Nucleosome beading: the "beads-on-a-string" texture of real chromatin.
  float bead = 0.5 + 0.5 * sin(vUv.x * 70.0);
  col *= 0.82 + bead * 0.32;
  float rim = pow(1.0 - abs(dot(normalize(vViewDir), vec3(0.0, 0.0, 1.0))), 2.0);
  col += uColorB * rim * 0.12;
  col += uColorB * uHover * 0.25;
  gl_FragColor = vec4(col, 0.85 * (1.0 - uDim * 0.92));
}
`;

/* ------------------------------------------------------------------ */
/* Glowing organelle sphere (lysosome / peroxisome interiors)          */
/* ------------------------------------------------------------------ */

export const GLOW_VERTEX = /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
varying vec3 vLocalPos;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  vLocalPos = position;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const GLOW_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uCoreColor;
uniform float uTime;
uniform float uSeed;
uniform float uHover;
uniform float uDim;
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
varying vec3 vLocalPos;
${NOISE_GLSL}
${CLIP_PARS}
void main() {
  ${CLIP_APPLY}
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(vViewDir);
  float facing = abs(dot(N, V));
  float fresnel = pow(1.0 - facing, 2.0);
  float pulse = 0.6 + 0.4 * sin(uTime * 2.2 + uSeed * 17.0);

  // Bright enzymatic core, glowing rim.
  vec3 col = mix(uCoreColor, uColor, fresnel);
  col += uCoreColor * pow(facing, 2.0) * 0.32 * pulse;
  col += uColor * fresnel * 0.45;

  // Swirling liquid interior — domain-warped noise churns like enzyme soup.
  vec3 lp = normalize(vLocalPos);
  float warp = fbm(lp * 2.2 + vec3(0.0, uTime * 0.05, uSeed));
  float swirl = fbm(lp * 2.2 + warp + vec3(uSeed * 3.0));
  col = mix(col, uCoreColor, smoothstep(0.15, 0.75, swirl) * 0.4);

  col += uColor * uHover * 0.3;

  gl_FragColor = vec4(col, (0.8 + fresnel * 0.15) * (1.0 - uDim * 0.92));
}
`;
