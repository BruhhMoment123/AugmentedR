import * as THREE from 'three';
import fs from 'fs';
import path from 'path';

// Construct a 3D Human Cell scene
const scene = new THREE.Scene();

// 1. Cell Membrane (Sky blue outer sphere)
const membraneGeo = new THREE.SphereGeometry(2.5, 32, 32);
const membraneMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.4,
  roughness: 0.2,
  metalness: 0.1,
  side: THREE.DoubleSide
});
scene.add(new THREE.Mesh(membraneGeo, membraneMat));

// 2. Nucleus (Purple center sphere)
const nucleusGeo = new THREE.SphereGeometry(0.85, 32, 32);
const nucleusMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 });
scene.add(new THREE.Mesh(nucleusGeo, nucleusMat));

// 3. Nucleolus (Pink dense core)
const nucleolusGeo = new THREE.SphereGeometry(0.35, 24, 24);
const nucleolusMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.1 });
scene.add(new THREE.Mesh(nucleolusGeo, nucleolusMat));

// 4. Mitochondria (Orange-red capsules)
const mitoGeo = new THREE.CapsuleGeometry(0.2, 0.5, 16, 16);
const mitoMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
const mitoPositions = [
  [1.4, 0.6, 0.8], [-1.2, -0.8, 0.9], [0.8, -1.3, -0.7], [-1.5, 0.7, -0.8], [0.4, 1.5, -0.9]
];
mitoPositions.forEach(([x, y, z]) => {
  const m = new THREE.Mesh(mitoGeo, mitoMat);
  m.position.set(x, y, z);
  m.rotation.set(0.4, 0.8, 0.2);
  scene.add(m);
});

// 5. Golgi Apparatus (Emerald green stacked rings)
const golgiMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
for (let i = 0; i < 4; i++) {
  const tGeo = new THREE.TorusGeometry(0.5 + i * 0.08, 0.04, 12, 32, Math.PI * 0.8);
  const tm = new THREE.Mesh(tGeo, golgiMat);
  tm.rotation.x = Math.PI / 3;
  tm.position.set(0.9, 0.2 + i * 0.07, -0.3);
  scene.add(tm);
}

// 6. Endoplasmic Reticulum (Royal blue folds)
const erMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, side: THREE.DoubleSide });
for (let i = 0; i < 3; i++) {
  const erGeo = new THREE.TorusGeometry(0.9 + i * 0.12, 0.03, 12, 32, Math.PI * 1.2);
  const erMesh = new THREE.Mesh(erGeo, erMat);
  erMesh.rotation.y = Math.PI / 4 + i * 0.2;
  erMesh.rotation.x = 0.3;
  scene.add(erMesh);
}

// 7. Lysosomes & Peroxisomes (Yellow & Cyan spheres)
const lysGeo = new THREE.SphereGeometry(0.12, 16, 16);
const lysMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2 });
const peroxMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2 });
const lysPositions = [[0.5, -1.5, 0.8], [-0.8, 1.4, 0.6], [1.6, -0.5, -0.6], [-1.4, -1.1, -0.5]];
lysPositions.forEach(([x, y, z], idx) => {
  const m = new THREE.Mesh(lysGeo, idx % 2 === 0 ? lysMat : peroxMat);
  m.position.set(x, y, z);
  scene.add(m);
});

// Convert Three.js scene to Object JSON
const sceneJson = JSON.stringify(scene.toJSON());
const outputDir = path.join(process.cwd(), 'public', 'models');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
fs.writeFileSync(path.join(outputDir, 'human_cell.json'), sceneJson);
console.log('✅ Generated public/models/human_cell.json successfully!');
