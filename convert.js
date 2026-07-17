const THREE = require('three');
const path = require('path');
const fs = require('fs');

// Load MMDParser from Three.js bundled module
const mmdParserPath = path.join(__dirname, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'mmdparser.module.js');
const mmdCode = fs.readFileSync(mmdParserPath, 'utf8');
const vm = require('vm');
const sandbox = { module: { exports: {} } };
vm.runInNewContext(mmdCode.replace(/^export \{.*\};?$/m, 'module.exports = { MMDParser: MMDParser, CharsetEncoder, Parser };'), sandbox);
const { Parser: MMDParser } = sandbox.module.exports;

async function convert() {
  const pmxPath = path.resolve(__dirname, 'models/Veronica_MMD_Model_v2/Veronica_Character_MMD_Model/Veronica_Character.pmx');
  const texDir = path.dirname(pmxPath);

  console.log('Reading PMX from:', pmxPath);
  const pmxBuffer = fs.readFileSync(pmxPath);
  const parser = new MMDParser();
  const pmxData = parser.parsePmx(pmxBuffer.buffer, true);

  console.log('✅ PMX parsed!', pmxData.vertices.length, 'verts,', pmxData.faces.length, 'faces,', pmxData.materials.length, 'materials');

  const scene = new THREE.Scene();
  const group = new THREE.Group();

  // Build a per-material face index array
  let faceStart = 0;
  pmxData.materials.forEach((mat, matIdx) => {
    const faceCount = mat.faceCount;
    if (faceCount === 0) return;

    // Collect faces for this material
    const vertPositions = [];
    const vertNormals = [];
    const vertUVs = [];

    for (let f = faceStart; f < faceStart + faceCount && f < pmxData.faces.length; f++) {
      const face = pmxData.faces[f];
      if (!face || !face.indices) continue;
      // Each face has 3 vertex indices
      for (let vi = 0; vi < 3; vi++) {
        const idx = face.indices[vi];
        if (idx === undefined || idx >= pmxData.vertices.length) continue;
        const v = pmxData.vertices[idx];
        if (!v) continue;
        vertPositions.push(v.position[0], v.position[1], v.position[2]);
        if (v.normal) vertNormals.push(v.normal[0], v.normal[1], v.normal[2]);
        else vertNormals.push(0, 1, 0);
        if (v.uv) vertUVs.push(v.uv[0], v.uv[1]);
        else vertUVs.push(0, 0);
      }
    }
    faceStart += faceCount;

    if (vertPositions.length === 0) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertPositions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(vertNormals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(vertUVs, 2));

    // Material
    const color = mat.diffuse || [0.8, 0.8, 0.8];
    const matParams = {
      color: new THREE.Color(color[0], color[1], color[2]),
      roughness: 0.4,
      metalness: 0.0,
      side: THREE.DoubleSide,
    };

    // Try to load texture
    if (mat.textureIndex >= 0 && mat.textureIndex < pmxData.textures.length) {
      const texName = pmxData.textures[mat.textureIndex];
      const texPath = path.join(texDir, texName);
      if (fs.existsSync(texPath)) {
        try {
          const imgData = fs.readFileSync(texPath);
          const ext = path.extname(texName).toLowerCase();
          const mimeType = (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : 'image/png';
          const base64 = imgData.toString('base64');
          const dataUri = `data:${mimeType};base64,${base64}`;

          // Create a texture from data URI using THREE.TextureLoader
          // In Node.js we can use a Canvas-less approach: create a DataTexture
          const img = new THREE.Image();
          img.src = dataUri;
          
          const texture = new THREE.Texture(img);
          texture.colorSpace = 'srgb';
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          matParams.map = texture;
          console.log(`  Loaded texture: ${texName}`);
        } catch (e) {
          console.log(`  Texture load error for ${texName}: ${e.message}`);
        }
      }
    }

    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial(matParams));
    group.add(mesh);
    console.log(`  Material ${matIdx}: ${mat.name || 'unnamed'}, ${faceCount} faces, color:${color.map(c => Math.round(c*255)).join(',')}`);
  });

  scene.add(group);

  // Auto-center the model
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);

  // Export to GLB
  const { GLTFExporter } = require('three/addons/exporters/GLTFExporter.js');
  const exporter = new GLTFExporter();

  console.log('\nExporting to GLB...');
  exporter.parse(
    scene,
    (result) => {
      const outPath = path.join(__dirname, 'models', 'veronica.glb');
      fs.writeFileSync(outPath, Buffer.from(result));
      const size = fs.statSync(outPath).size;
      console.log(`✅ Exported! ${(size/1024/1024).toFixed(1)} MB at models/veronica.glb`);
    },
    (err) => {
      console.error('❌ Export error:', err);
    },
    { binary: true }
  );
}

convert().catch(err => console.error('❌', err.stack));
