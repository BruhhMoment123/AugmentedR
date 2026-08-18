import { Color, ShaderMaterial, Vector3, DoubleSide, FrontSide, AdditiveBlending, NormalBlending } from 'three';
import { sharedUniforms } from '@/lib/uniforms';
import {
  SHELL_VERTEX,
  SHELL_FRAGMENT,
  CYTOPLASM_VERTEX,
  CYTOPLASM_FRAGMENT,
  PARTICLE_VERTEX,
  PARTICLE_FRAGMENT,
  CRISTAE_VERTEX,
  CRISTAE_FRAGMENT,
  CHROMATIN_VERTEX,
  CHROMATIN_FRAGMENT,
  GLOW_VERTEX,
  GLOW_FRAGMENT,
} from '@/shaders/glsl';

/**
 * Factories for the scene's ShaderMaterials.
 *
 * Every factory spreads `sharedUniforms` into the material's uniform map,
 * so uTime / uClip / uXray / uFocusDim are shared *by reference* and a
 * single per-frame update reaches every material at once.
 */

export interface ShellOptions {
  color: string;
  rimColor: string;
  alpha: number;
  breathAmp?: number;
  noiseScale?: number;
  lipidPattern?: boolean;
  inner?: boolean;
  side?: typeof FrontSide | typeof DoubleSide;
  lightDir?: Vector3;
  /** In-shader bump mapping: 0 disables, ~0.3 = strong micro-relief. */
  bump?: number;
  bumpFreq?: number;
}

/** Translucent organic shell — used for the plasma membrane and nuclear envelope. */
export function createShellMaterial(opts: ShellOptions): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: SHELL_VERTEX,
    fragmentShader: SHELL_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: opts.side ?? FrontSide,
    uniforms: {
      ...sharedUniforms,
      uColor: { value: new Color(opts.color) },
      uRimColor: { value: new Color(opts.rimColor) },
      uLightDir: { value: opts.lightDir ?? new Vector3(0.5, 0.8, 0.35).normalize() },
      uAlpha: { value: opts.alpha },
      uBreathAmp: { value: opts.breathAmp ?? 0.05 },
      uNoiseScale: { value: opts.noiseScale ?? 0.55 },
      uLipidPattern: { value: opts.lipidPattern ? 1 : 0 },
      uInner: { value: opts.inner ? 1 : 0 },
      uHover: { value: 0 },
      uDim: { value: 0 },
      uBump: { value: opts.bump ?? 0 },
      uBumpFreq: { value: opts.bumpFreq ?? 3.5 },
    },
  });
}

export function createCytoplasmMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: CYTOPLASM_VERTEX,
    fragmentShader: CYTOPLASM_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: FrontSide,
    uniforms: {
      ...sharedUniforms,
      uColor: { value: new Color('#3a6f96') },
      uDim: { value: 0 },
    },
  });
}

export interface ParticleOptions {
  color: string;
  size: number;
  opacity: number;
  speed?: number;
  wanderAmp?: number;
  flow?: Vector3;
  flowBounds?: Vector3;
}

/** Soft additive point sprites with GPU Brownian motion / directional flow. */
export function createParticleMaterial(opts: ParticleOptions): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: PARTICLE_VERTEX,
    fragmentShader: PARTICLE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      ...sharedUniforms,
      uColor: { value: new Color(opts.color) },
      uSize: { value: opts.size },
      uOpacity: { value: opts.opacity },
      uSpeed: { value: opts.speed ?? 0.12 },
      uWanderAmp: { value: opts.wanderAmp ?? 0.25 },
      uFlow: { value: opts.flow ?? new Vector3(0, 0, 0) },
      uFlowBounds: { value: opts.flowBounds ?? new Vector3(1, 1, 1) },
      uDim: { value: 0 },
    },
  });
}

export function createCristaeMaterial(phase: number): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: CRISTAE_VERTEX,
    fragmentShader: CRISTAE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: NormalBlending,
    uniforms: {
      ...sharedUniforms,
      uColor: { value: new Color('#8a3f14') },
      uGlowColor: { value: new Color('#ff9a3e') },
      uPhase: { value: phase },
      uHover: { value: 0 },
      uDim: { value: 0 },
    },
  });
}

export function createChromatinMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: CHROMATIN_VERTEX,
    fragmentShader: CHROMATIN_FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      ...sharedUniforms,
      uColorA: { value: new Color('#6d4fc2') },
      uColorB: { value: new Color('#b79cf0') },
      uHover: { value: 0 },
      uDim: { value: 0 },
    },
  });
}

export interface GlowOptions {
  color: string;
  coreColor: string;
  seed: number;
}

/** Pulsing enzymatic interior for lysosomes and peroxisomes. */
export function createGlowMaterial(opts: GlowOptions): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: GLOW_VERTEX,
    fragmentShader: GLOW_FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      ...sharedUniforms,
      uColor: { value: new Color(opts.color) },
      uCoreColor: { value: new Color(opts.coreColor) },
      uSeed: { value: opts.seed },
      uHover: { value: 0 },
      uDim: { value: 0 },
    },
  });
}
