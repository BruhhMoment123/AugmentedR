'use client';

import {
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Points,
  ShaderMaterial,
  Sprite,
  Scene,
} from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

/**
 * Color map: each shader material name → its dominant biological colour.
 *
 * Keys are matched against the material's `name` property or, when unnamed,
 * the colour uniforms it carries.  The fallback is a neutral off-white.
 */
const SHADER_COLOR_MAP: { uniform: string; color: string }[] = [
  // plasma membrane / nuclear envelope (uColor uniform)
  { uniform: '#c4745c', color: '#c4745c' }, // outer membrane
  { uniform: '#a85a46', color: '#a85a46' }, // inner membrane
  { uniform: '#6a55b0', color: '#6a55b0' }, // nuclear outer
  { uniform: '#554694', color: '#554694' }, // nuclear inner
  // cytoplasm
  { uniform: '#3a6f96', color: '#3a6f96' },
  // mitochondria cristae (uColor / uGlowColor)
  { uniform: '#8a3f14', color: '#8a3f14' },
  // chromatin (uColorA)
  { uniform: '#6d4fc2', color: '#6d4fc2' },
  // lysosomes / peroxisomes glow (uColor)
  { uniform: '#7a962e', color: '#7a962e' },
  { uniform: '#2a968a', color: '#2a968a' },
];

/**
 * Pick the best representative colour from a ShaderMaterial by inspecting
 * its uniforms in priority order.
 */
function pickColorFromShader(mat: ShaderMaterial): string {
  const candidates = ['uColor', 'uColorA', 'uCoreColor', 'uGlowColor'];
  for (const key of candidates) {
    const u = mat.uniforms[key];
    if (u?.value instanceof Color) {
      return '#' + u.value.getHexString();
    }
  }
  return '#b0a080'; // warm neutral fallback
}

/**
 * Standard glTF attributes allowed by specification.
 * Any non-standard attributes (instanceStart, instanceEnd, aSeed, etc.)
 * cause accessor count mismatches in GLTFExporter and must be stripped.
 */
const ALLOWED_GLTF_ATTRIBUTES = new Set([
  'position',
  'normal',
  'uv',
  'uv2',
  'color',
  'tangent',
  'skinIndex',
  'skinWeight',
]);

function cleanGeometryAttributes(geo: BufferGeometry): void {
  if (!geo || !geo.attributes) return;
  const keys = Object.keys(geo.attributes);
  for (const key of keys) {
    if (!ALLOWED_GLTF_ATTRIBUTES.has(key)) {
      delete geo.attributes[key];
    }
  }
}

/**
 * Build an export-safe clone of the scene with all custom ShaderMaterials
 * replaced by simple MeshStandardMaterials that glTF understands.
 *
 * - Particle clouds (Points), Selection halos (Sprites), and Leader lines (Line2)
 *   are completely removed from the clone.
 * - InstancedMesh objects are expanded into individual Mesh copies so
 *   GLTFExporter doesn't emit broken instance attributes.
 * - Non-standard attributes are stripped from all geometries.
 * - clippingPlanes are stripped (glTF has no clipping concept).
 * - The original scene is never mutated.
 */
function buildExportClone(source: Scene | Object3D): Object3D {
  const clone = source.clone(true); // deep clone

  const toRemove: Object3D[] = [];
  const toExpand: { instanced: InstancedMesh; parent: Object3D }[] = [];

  // Pass 1: Identify non-cell objects to remove, and InstancedMesh objects to expand
  clone.traverse((obj) => {
    // Drop particle clouds and glowing selection sprites
    if (obj instanceof Points || obj instanceof Sprite) {
      toRemove.push(obj);
      return;
    }

    // Drop Drei leader lines (Line2 / LineSegments2 / Line) which attach instanceStart/End
    const withGeo = obj as unknown as { geometry?: { isLineSegmentsGeometry?: boolean; isLineGeometry?: boolean } };
    if (
      obj.type === 'Line2' ||
      obj.type === 'LineSegments2' ||
      obj.type === 'Line' ||
      obj.type === 'LineSegments' ||
      (withGeo.geometry && (withGeo.geometry.isLineSegmentsGeometry || withGeo.geometry.isLineGeometry))
    ) {
      toRemove.push(obj);
      return;
    }

    // Collect InstancedMesh references for expansion
    if (obj instanceof InstancedMesh) {
      if (obj.parent) toExpand.push({ instanced: obj, parent: obj.parent });
    }
  });

  // Remove unwanted non-cell objects from the clone
  for (const obj of toRemove) {
    if (obj.parent) {
      obj.parent.remove(obj);
    }
  }

  // Pass 2: Clean up materials and geometry attributes on remaining meshes
  clone.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;

    // Clean non-standard attributes from geometry
    if (obj.geometry) {
      cleanGeometryAttributes(obj.geometry);
    }

    // Strip clipping planes — glTF has no support for them
    if (obj.material) {
      const stripClip = (mat: Material) => {
        if ('clippingPlanes' in mat) {
          (mat as Material & { clippingPlanes: null }).clippingPlanes = null;
        }
      };
      if (Array.isArray(obj.material)) obj.material.forEach(stripClip);
      else stripClip(obj.material);
    }

    const replaceMaterial = (original: Material): Material => {
      if (!(original instanceof ShaderMaterial)) return original;

      const color = pickColorFromShader(original);
      const std = new MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: 0.05,
        transparent: original.transparent,
        opacity: Math.max(
          original.uniforms?.uAlpha?.value ?? original.uniforms?.uOpacity?.value ?? 1,
          0.25, // keep semi-transparent parts visible in AR
        ),
        side: original.side ?? DoubleSide,
      });
      return std;
    };

    if (Array.isArray(obj.material)) {
      // eslint-disable-next-line react-hooks/immutability -- operating on export clone, not live scene
      obj.material = obj.material.map(replaceMaterial);
    } else {
      // eslint-disable-next-line react-hooks/immutability -- operating on export clone, not live scene
      obj.material = replaceMaterial(obj.material);
    }
  });

  // Expand each InstancedMesh into individual Mesh objects
  const dummy = new Object3D();
  for (const { instanced, parent } of toExpand) {
    const mat = Array.isArray(instanced.material)
      ? instanced.material[0]
      : instanced.material;

    const cleanGeo = instanced.geometry.clone();
    cleanGeometryAttributes(cleanGeo);

    for (let i = 0; i < instanced.count; i++) {
      instanced.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

      const mesh = new Mesh(cleanGeo, mat);
      mesh.position.copy(dummy.position);
      mesh.quaternion.copy(dummy.quaternion);
      mesh.scale.copy(dummy.scale);
      // inherit parent world transform
      mesh.applyMatrix4(instanced.matrixWorld);
      parent.add(mesh);
    }

    // Remove the original InstancedMesh from the clone
    parent.remove(instanced);
  }

  return clone;
}



/**
 * Export the live Three.js scene as a .glb file and trigger a browser
 * download.  Call this from a dev-only button inside the R3F canvas.
 *
 * @param scene   The Three.js Scene object (from `useThree(s => s.scene)`).
 * @param filename Desired filename, defaults to `cell.glb`.
 */
export function exportCellGLB(scene: Scene, filename = 'cell.glb'): void {
  const exportClone = buildExportClone(scene);

  const exporter = new GLTFExporter();
  exporter.parse(
    exportClone,
    (result) => {
      let blob: Blob;
      if (result instanceof ArrayBuffer) {
        blob = new Blob([result], { type: 'model/gltf-binary' });
      } else {
        blob = new Blob([JSON.stringify(result)], { type: 'model/gltf+json' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    (error) => {
      console.error('[exportCellGLB] GLTFExporter error:', error);
    },
    { binary: true }, // output .glb (binary), not .gltf+JSON
  );
}
