import { useEffect, useRef } from 'react';
import * as T from 'three';
import { createGallery, galleryState } from '../scene/gallery';
import { projectArtifacts } from '../scene/projectArtifacts';
interface Props {
  progress: React.RefObject<number>;
  renderFrame: React.RefObject<((p: number) => void) | null>;
  paused: boolean;
  onReady: () => void;
  onFail: () => void;
}
/** Persistent world; the native document coordinate controls every camera and court transform. */
export default function JourneyWorld(props: Props) {
  const mount = useRef<HTMLDivElement>(null), live = useRef(props);
  live.current = props;
  useEffect(() => {
    const host = mount.current!;
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch { live.current.onFail(); return; }
    const gallery = createGallery();
    const {scene, courts, key} = gallery;
    const camera = new T.PerspectiveCamera(48, innerWidth / innerHeight, .15, 180);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor('#f7f0e6', 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.dataset.world = 'spatial-gallery';
    host.appendChild(renderer.domElement);
    let disposed = false, lastP = -1, renders = 0;
    const artifacts = projectArtifacts(scene, () => { lastP = -1; paint(live.current.progress.current); });
    const paint = (p: number) => {
      if (disposed || document.hidden || live.current.paused || p === lastP) return;
      lastP = p;
      const pose = galleryState(p, innerWidth < 760);
      camera.position.fromArray(pose.camera);
      camera.lookAt(camera.position.x + Math.sin(pose.yaw) * 22, camera.position.y - 3.5, camera.position.z - 24);
      camera.rotateZ(pose.roll);
      camera.fov = pose.fov; camera.updateProjectionMatrix();
      courts.forEach((court, i) => {
        court.rotation.y = pose.courts[i].rotation;
        court.position.y = -2 + pose.courts[i].rise;
        court.scale.setScalar(pose.courts[i].scale);
      });
      key.intensity = pose.light;
      key.position.set(camera.position.x - 18, 30, camera.position.z + 12);
      key.target.position.set(camera.position.x, 0, camera.position.z - 12);
      key.target.updateMatrixWorld();
      artifacts.update(camera, p);
      renderer.render(scene, camera); renders++;
      Object.assign(window, { __journeyWorld: { progress: p, camera: camera.position.toArray(),
        cameraType: camera.type, rotation: camera.rotation.toArray(), fov: camera.fov,
        objects: courts.map(c => ({position:c.position.toArray(), rotation:c.rotation.toArray(),scale:c.scale.toArray()})),
        light: key.intensity, drawCalls: renderer.info.render.calls, geometries: renderer.info.memory.geometries,
        triangles: renderer.info.render.triangles, renders, disposed: false } });
    };
    const resize = () => {
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
      const shadowSize = innerWidth < 760 ? 512 : 1024;
      if (key.shadow.mapSize.x !== shadowSize) {
        key.shadow.mapSize.set(shadowSize, shadowSize);
        key.shadow.map?.dispose(); key.shadow.map = null;
      }
      renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1 : 1.5));
      renderer.setSize(innerWidth, innerHeight); lastP = -1; paint(live.current.progress.current);
    };
    const loss = (event: Event) => { event.preventDefault(); live.current.onFail(); };
    renderer.domElement.addEventListener('webglcontextlost', loss);
    window.addEventListener('resize', resize); resize();
    live.current.renderFrame.current = paint;
    renderer.compileAsync(scene, camera).then(() => {
      if (disposed) return;
      lastP = -1; paint(live.current.progress.current);
      performance.mark('portfolio-cinematic-rendered'); live.current.onReady();
    }).catch(() => { if (!disposed) live.current.onFail(); });
    return () => {
      disposed = true; live.current.renderFrame.current = null;
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('webglcontextlost', loss);
      artifacts.dispose(); gallery.dispose();
      Object.assign(window, { __journeyWorld: { disposed: true, geometriesDisposed: gallery.geometries.length, materialsDisposed: gallery.materials.length } });
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);
  return <div ref={mount} className="journey-world" aria-hidden="true" />;
}
