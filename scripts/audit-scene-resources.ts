/**
 * Source-only scene census. Run: node --import tsx scripts/audit-scene-resources.ts
 *
 * Calls the real installation factory with a no-op canvas context. This does not
 * create a browser, WebGL context, raster backing store, or network request.
 * Texel byte estimates below are arithmetic, not measured CPU/GPU memory.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { chapters } from '../src/data/chapters.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputPath = resolve(root, 'docs/performance-baseline/scene-source-audit.json');
type TextDraw = { text: string; font: string; x: number; y: number; maxWidth?: number };
type CanvasRecord = {
  width: number;
  height: number;
  draws: TextDraw[];
  getContext: (kind: string) => object;
};
const canvases: CanvasRecord[] = [];

function makeCanvas(): CanvasRecord {
  const canvas: CanvasRecord = { width: 300, height: 150, draws: [], getContext };
  const context = {
    fillStyle: '', font: '', textAlign: '', textBaseline: '',
    fillRect() { /* Deliberately no raster allocation. */ },
    fillText(text: string, x: number, y: number, maxWidth?: number) {
      canvas.draws.push({ text, font: this.font, x, y, maxWidth });
    },
  };
  function getContext(kind: string) {
    if (kind !== '2d') throw new Error(`Source census prohibits ${kind} contexts.`);
    return context;
  }
  canvases.push(canvas);
  return canvas;
}

function rgbaMipChainBytes(width: number, height: number) {
  let bytes = 0;
  for (;;) {
    bytes += width * height * 4;
    if (width === 1 && height === 1) return bytes;
    width = Math.max(1, Math.floor(width / 2));
    height = Math.max(1, Math.floor(height / 2));
  }
}

function geometryBytes(geometries: Iterable<THREE.BufferGeometry>) {
  const buffers = new Set<ArrayBufferLike>();
  for (const geometry of geometries) {
    const attributes = [...Object.values(geometry.attributes),
      ...Object.values(geometry.morphAttributes).flat(), ...(geometry.index ? [geometry.index] : [])];
    for (const attribute of attributes) {
      const array = attribute instanceof THREE.InterleavedBufferAttribute
        ? attribute.data.array : attribute.array;
      buffers.add(array.buffer);
    }
  }
  return [...buffers].reduce((total, buffer) => total + buffer.byteLength, 0);
}

function census(group: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const canvasTextures = new Set<THREE.CanvasTexture>();
  const imageReferences: string[] = [];
  let objects = 0, meshCount = 0, shadowCasters = 0, shadowReceivers = 0;
  let trianglesAcrossMeshReferences = 0;
  group.traverse(object => {
    objects++;
    if (!(object instanceof THREE.Mesh)) return;
    meshCount++;
    shadowCasters += Number(object.castShadow);
    shadowReceivers += Number(object.receiveShadow);
    const geometry = object.geometry;
    geometries.add(geometry);
    trianglesAcrossMeshReferences += (geometry.index?.count ?? geometry.getAttribute('position')?.count ?? 0) / 3;
    const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of meshMaterials) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
        if (value instanceof THREE.CanvasTexture) canvasTextures.add(value);
      }
    }
    if (object.userData.assetPath) imageReferences.push(String(object.userData.assetPath));
  });
  const labels = [...canvasTextures].map(texture => {
    const canvas = texture.image as CanvasRecord;
    if (!canvases.includes(canvas)) throw new Error('Unexpected canvas texture outside the controlled shim.');
    return {
      text: canvas.draws.map(draw => draw.text).join('\n'),
      draws: canvas.draws,
      width: canvas.width,
      height: canvas.height,
      estimatedBaseRgbaBytes: canvas.width * canvas.height * 4,
      generateMipmaps: texture.generateMipmaps,
      estimatedFullMipChainRgbaBytes: texture.generateMipmaps
        ? rgbaMipChainBytes(canvas.width, canvas.height) : canvas.width * canvas.height * 4,
    };
  });
  return {
    objectsIncludingGroup: objects,
    meshes: meshCount,
    shadowCastingMeshes: shadowCasters,
    shadowReceivingMeshes: shadowReceivers,
    uniqueGeometries: geometries.size,
    uniqueMaterials: materials.size,
    uniqueTexturesAlreadyConstructed: textures.size,
    geometryTypedArrayBytes: geometryBytes(geometries),
    trianglesAcrossMeshReferences,
    labelCanvasCount: labels.length,
    estimatedLabelBaseRgbaBytes: labels.reduce((sum, label) => sum + label.estimatedBaseRgbaBytes, 0),
    estimatedLabelFullMipChainRgbaBytes: labels.reduce((sum, label) => sum + label.estimatedFullMipChainRgbaBytes, 0),
    deferredImagePlaneCount: imageReferences.length,
    deferredUniqueImagePaths: [...new Set(imageReferences)],
    labels,
  };
}

const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: {
    createElement(tag: string) {
      if (tag !== 'canvas') throw new Error(`Source census prohibits creating ${tag}.`);
      return makeCanvas();
    },
    createElementNS() { throw new Error('Source census prohibits image/network loading.'); },
  },
});

try {
  const { createInstallations } = await import('../src/scene/installations.ts');
  const installations = createInstallations();
  if (installations.length !== chapters.length) throw new Error('Chapter and installation counts differ.');
  const perChapter = installations.map(({ group }, index) => ({
    index, id: chapters[index].id, ...census(group),
  }));
  const all = new THREE.Group();
  installations.forEach(installation => all.add(installation.group));
  const { labels: allLabels, ...totals } = census(all);
  if (allLabels.length !== canvases.length) throw new Error('Canvas count does not reconcile with scene labels.');
  const inputPaths = ['src/scene/installations.ts', 'src/scene/primitives.ts', 'src/data/chapters.ts',
    'package-lock.json', 'scripts/audit-scene-resources.ts'];
  const sourceInputs = await Promise.all(inputPaths.map(async path => ({
    path, sha256: createHash('sha256').update(await readFile(resolve(root, path))).digest('hex'),
  })));
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    command: 'node --import tsx scripts/audit-scene-resources.ts',
    runtime: { node: process.version, platform: process.platform, arch: process.arch, threeRevision: THREE.REVISION },
    method: {
      actualFactory: 'src/scene/installations.ts:createInstallations',
      canvasShim: 'Records dimensions and fillText calls only; fillRect is a no-op. No pixel backing stores or font rasterization.',
      browserUsed: false,
      networkUsed: false,
      webglContextCreated: false,
      measurements: 'Object/resource counts and existing geometry TypedArray byte lengths from the actual installation objects.',
      estimates: 'RGBA8 texel storage uses width × height × 4; the full mip-chain estimate sums successively halved dimensions down to 1 × 1.',
      limitations: [
        'No browser loading, rasterization, compilation, frame timing, CPU heap, GPU residency, or GPU-memory measurement is performed.',
        'Texture estimates exclude canvas backing-store implementation, decoded images, duplicate copies, allocation alignment, driver overhead, and render targets.',
        'Only createInstallations() is instantiated. Portrait, shared 72-beam mesh, lights, floor, grid, shadow map, environment/PMREM, and HTML are excluded.',
        'Image planes remain deferred without calling prepareTextures(); their image bytes, decoded pixels, and future textures are excluded.',
        'Unique resources are deduplicated by identity within each chapter and across totals; summing chapter resource counts/bytes can double-count resources shared across chapters.',
        'trianglesAcrossMeshReferences assumes each installation mesh geometry is drawn once, without visibility, camera/frustum/occlusion, shadow passes, or material grouping. It is not an observed frame triangle or draw-call count.',
        'Canvas textures are constructed eagerly by this factory, but browser GPU upload normally occurs when rendered. Allocated source canvases do not establish simultaneous GPU residency.',
        'No CPU microbenchmark is included because the shim omits real canvas work and would not establish a rendering bottleneck.',
      ],
    },
    sourceInputs,
    totals,
    perChapter,
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output: outputPath, ...totals }, null, 2));
} finally {
  if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
  else Reflect.deleteProperty(globalThis, 'document');
}
