import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function mountSystem(host: HTMLElement, fail: () => void) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 760 ? 1.25 : 1.6),
  );
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(7, 5.7, 8.5);
  camera.lookAt(0, 0.1, 0);
  scene.add(new THREE.AmbientLight("#bfcfc7", 2));
  const key = new THREE.DirectionalLight("#ffffff", 4);
  key.position.set(3, 7, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#c7f36b", 5);
  rim.position.set(-5, 2, -3);
  scene.add(rim);
  const group = new THREE.Group();
  group.rotation.y = -0.25;
  scene.add(group);
  const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.05);
  const dark = new THREE.MeshStandardMaterial({
    color: "#26332f",
    metalness: 0.7,
    roughness: 0.28,
  });
  const edge = new THREE.MeshStandardMaterial({
    color: "#95aaa0",
    metalness: 0.8,
    roughness: 0.2,
  });
  const lime = new THREE.MeshStandardMaterial({
    color: "#d3ff75",
    emissive: "#95d335",
    emissiveIntensity: 0.6,
    roughness: 0.35,
    metalness: 0.3,
  });
  const black = new THREE.MeshStandardMaterial({
    color: "#091410",
    roughness: 0.4,
    metalness: 0.4,
  });
  const layers: THREE.Group[] = [];
  function box(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    mat: THREE.Material,
  ) {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    return m;
  }
  for (let j = 0; j < 4; j++) {
    const layer = new THREE.Group();
    layers.push(layer);
    group.add(layer);
    box(layer, 0, 0, 0, 3.9, 0.12, 3.2, j === 3 ? edge : dark);
    box(layer, 0, 0.075, 0, 3.6, 0.025, 2.9, black);
    for (let k = 0; k < 4; k++) {
      box(
        layer,
        k % 2 ? 1.7 : -1.7,
        0.12,
        k < 2 ? 1.32 : -1.32,
        0.1,
        0.08,
        0.1,
        lime,
      );
    }
    if (j === 0) {
      for (let i = 0; i < 7; i++)
        box(
          layer,
          -0.5 + i * 0.16,
          0.11,
          -0.65,
          0.07,
          0.025,
          1.1,
          i % 2 ? edge : lime,
        );
      box(layer, 0.9, 0.12, 0.35, 0.9, 0.05, 0.9, dark);
      for (let k = 0; k < 3; k++)
        box(
          layer,
          -0.6,
          0.11,
          0.35 + k * 0.22,
          1.5 - k * 0.25,
          0.025,
          0.07,
          edge,
        );
    } else if (j === 1) {
      for (let i = 0; i < 4; i++)
        for (let k = 0; k < 3; k++)
          box(
            layer,
            (i - 1.5) * 0.65,
            0.19,
            (k - 1) * 0.65,
            0.4,
            0.2,
            0.4,
            i === k ? lime : dark,
          );
    } else if (j === 2) {
      for (let i = 0; i < 7; i++)
        box(
          layer,
          (i - 3) * 0.42,
          0.2,
          0,
          0.22,
          0.2,
          2.2,
          i === 3 ? lime : edge,
        );
    } else {
      box(layer, 0, 0.17, 0, 1.7, 0.15, 1.7, lime);
      box(layer, 0, 0.28, 0, 1.3, 0.1, 1.3, black);
      for (let i = 0; i < 8; i++)
        for (const s of [-1, 1])
          box(layer, (i - 3.5) * 0.17, 0.22, s * 0.96, 0.06, 0.04, 0.35, edge);
    }
  }
  const wireGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1.7, -2, 1.3),
    new THREE.Vector3(-1.7, 2, 1.3),
  ]);
  const wireMaterial = new THREE.LineBasicMaterial({
    color: "#badb8d",
    transparent: true,
    opacity: 0.3,
  });
  for (const x of [-1.7, 1.7])
    for (const z of [-1.3, 1.3]) {
      const l = new THREE.Line(wireGeometry, wireMaterial);
      l.position.set(x + 1.7, 0, z - 1.3);
      group.add(l);
    }
  let previousFrame = 0;
  let frame = 0,
    visible = true,
    disposed = false,
    pointerX = 0,
    pointerY = 0;
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  intersection.observe(host);
  const pointer = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    pointerX = (e.clientX - r.left) / r.width - 0.5;
    pointerY = (e.clientY - r.top) / r.height - 0.5;
  };
  host.addEventListener("pointermove", pointer);
  const lost = (e: Event) => {
    e.preventDefault();
    fail();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  const animate = (time = 0) => {
    if (disposed) return;
    frame = requestAnimationFrame(animate);
    if (!visible || document.hidden || time - previousFrame < 32) return;
    previousFrame = time;
    const progress = Math.min(1, Math.max(0, scrollY / innerHeight));
    group.rotation.y +=
      (-0.25 + pointerX * 0.25 + progress * 0.45 - group.rotation.y) * 0.06;
    group.rotation.z += (pointerY * 0.06 - group.rotation.z) * 0.06;
    layers.forEach((l, i) => {
      l.position.y = (1.5 - i) * (0.87 + progress * 0.45);
      l.rotation.y = progress * (i - 1.5) * 0.08;
    });
    renderer.render(scene, camera);
  };
  resize();
  animate();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    intersection.disconnect();
    host.removeEventListener("pointermove", pointer);
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    geometry.dispose();
    wireGeometry.dispose();
    [dark, edge, lime, black, wireMaterial].forEach((m) => m.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
