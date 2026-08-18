global.window = global;
global.self = global;

class NodeFileReader {
  readAsArrayBuffer(blob) {
    if (blob instanceof ArrayBuffer) {
      this.result = blob;
      if (this.onload) this.onload({ target: this });
      return;
    }
    if (Buffer.isBuffer(blob)) {
      this.result = blob.buffer.slice(blob.byteOffset, blob.byteOffset + blob.byteLength);
      if (this.onload) this.onload({ target: this });
      return;
    }
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
    });
  }
}
global.FileReader = NodeFileReader;

const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');
const fs = require('fs');
const path = require('path');

async function main() {
  const scene = new THREE.Scene();

  // 1. Cell Membrane
  const membraneGeo = new THREE.SphereGeometry(2.5, 32, 32);
  const membraneMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    roughness: 0.2,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const membrane = new THREE.Mesh(membraneGeo, membraneMat);
  membrane.name = "Cell Membrane";
  scene.add(membrane);

  // 2. Nucleus
  const nucleusGeo = new THREE.SphereGeometry(0.85, 32, 32);
  const nucleusMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3, metalness: 0.1 });
  const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
  nucleus.name = "Nucleus";
  scene.add(nucleus);

  // 3. Nucleolus
  const nucleolusGeo = new THREE.SphereGeometry(0.35, 24, 24);
  const nucleolusMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.1 });
  const nucleolus = new THREE.Mesh(nucleolusGeo, nucleolusMat);
  nucleolus.name = "Nucleolus";
  scene.add(nucleolus);

  // 4. Mitochondria
  const mitoGeo = new THREE.CapsuleGeometry(0.2, 0.5, 16, 16);
  const mitoMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
  const mitoPositions = [
    [1.4, 0.6, 0.8], [-1.2, -0.8, 0.9], [0.8, -1.3, -0.7], [-1.5, 0.7, -0.8], [0.4, 1.5, -0.9]
  ];
  mitoPositions.forEach(([x, y, z], i) => {
    const m = new THREE.Mesh(mitoGeo, mitoMat);
    m.position.set(x, y, z);
    m.rotation.set(0.4, 0.8, 0.2);
    m.name = `Mitochondrion ${i+1}`;
    scene.add(m);
  });

  // 5. Golgi Apparatus
  const golgiMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
  for (let i = 0; i < 5; i++) {
    const tGeo = new THREE.TorusGeometry(0.45 + i * 0.08, 0.04, 12, 32, Math.PI * 0.85);
    const tm = new THREE.Mesh(tGeo, golgiMat);
    tm.rotation.x = Math.PI / 3;
    tm.position.set(0.9, 0.2 + i * 0.07, -0.3);
    tm.name = `Golgi Cisternae ${i+1}`;
    scene.add(tm);
  }

  // 6. Endoplasmic Reticulum
  const erMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) {
    const erGeo = new THREE.TorusGeometry(0.85 + i * 0.12, 0.03, 12, 32, Math.PI * 1.2);
    const erMesh = new THREE.Mesh(erGeo, erMat);
    erMesh.rotation.y = Math.PI / 4 + i * 0.2;
    erMesh.rotation.x = 0.3;
    erMesh.name = `Endoplasmic Reticulum ${i+1}`;
    scene.add(erMesh);
  }

  // 7. Lysosomes & Peroxisomes
  const lysGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const lysMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2 });
  const peroxMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2 });
  const lysPositions = [[0.5, -1.5, 0.8], [-0.8, 1.4, 0.6], [1.6, -0.5, -0.6], [-1.4, -1.1, -0.5]];
  lysPositions.forEach(([x, y, z], idx) => {
    const m = new THREE.Mesh(lysGeo, idx % 2 === 0 ? lysMat : peroxMat);
    m.position.set(x, y, z);
    m.name = idx % 2 === 0 ? `Lysosome ${idx+1}` : `Peroxisome ${idx+1}`;
    scene.add(m);
  });

  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(scene, { binary: true });
  const outputDir = path.join(process.cwd(), 'public', 'models');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'cell.glb');
  const buf = Buffer.from(result);
  fs.writeFileSync(outputPath, buf);
  console.log(`🎉 SUCCESS! Generated ${outputPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);
