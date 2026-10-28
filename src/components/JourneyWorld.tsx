import { useEffect, useRef } from "react";
import * as T from "three";
import {
  cameraPath,
  targetPath,
  samplePath,
  smooth,
  mix,
} from "../scene/journey";
interface Props {
  progress: React.RefObject<number>;
  paused: boolean;
  onReady: () => void;
  onFail: () => void;
}
/** One persistent ribbon and shared folios; no scene mounts, orbit controls or phase clocks. */
export default function JourneyWorld(props: Props) {
  const mount = useRef<HTMLDivElement>(null),
    live = useRef(props);
  live.current = props;
  useEffect(() => {
    const host = mount.current!;
    let renderer: T.WebGLRenderer;
    try {
      const canvas = document.createElement("canvas"),
        context = canvas.getContext("webgl2", {
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
      if (!context) {
        live.current.onFail();
        return;
      }
      renderer = new T.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      live.current.onFail();
      return;
    }
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 150);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.dataset.world = "persistent";
    host.appendChild(renderer.domElement);
    scene.add(new T.HemisphereLight("#fff7eb", "#581c32", 3));
    const key = new T.DirectionalLight("#ffe4c9", 4),
      fill = new T.DirectionalLight("#c49a82", 2);
    key.position.set(-4, 5, 8);
    fill.position.set(5, -3, 2);
    scene.add(key, fill, key.target, fill.target);
    const bronze = new T.MeshStandardMaterial({
      color: "#c49a82",
      metalness: 0.73,
      roughness: 0.31,
      side: T.DoubleSide,
    });
    const wine = new T.MeshStandardMaterial({
      color: "#782d46",
      metalness: 0.35,
      roughness: 0.5,
      side: T.DoubleSide,
    });
    // A continuous, open ribbon runs through the full world height. It is never a loop.
    const segments = 640,
      positions = new Float32Array((segments + 1) * 2 * 3),
      indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const y = 10 - (i / segments) * 88,
        bend = Math.sin(y * 0.13) * 3.1 + Math.cos(y * 0.32) * 0.6;
      const twist = y * 0.17;
      for (let edge = 0; edge < 2; edge++) {
        const w = (edge - 0.5) * 1.05;
        positions.set(
          [
            bend + w * Math.cos(twist),
            y,
            -3 + w * Math.sin(twist) + Math.sin(y * 0.21) * 1.4,
          ],
          (i * 2 + edge) * 3,
        );
      }
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const ribbonGeo = new T.BufferGeometry();
    ribbonGeo.setAttribute("position", new T.BufferAttribute(positions, 3));
    ribbonGeo.setIndex(indices);
    ribbonGeo.computeVertexNormals();
    const ribbon = new T.Mesh(ribbonGeo, bronze);
    scene.add(ribbon);
    const threadGeo = new T.BufferGeometry().setFromPoints(
      Array.from({ length: 400 }, (_, i) => {
        const y = 10 - (i / 399) * 88;
        return new T.Vector3(
          Math.sin(y * 0.13) * 3.1 + Math.cos(y * 0.32) * 0.6 + 0.9,
          y,
          -3 + Math.sin(y * 0.21) * 1.4,
        );
      }),
    );
    const threadMat = new T.LineBasicMaterial({
        color: "#c49a82",
        transparent: true,
        opacity: 0.32,
      }),
      thread = new T.Line(threadGeo, threadMat);
    scene.add(thread);
    const folioBronze = bronze.clone(),
      folioWine = wine.clone();
    for (const m of [folioBronze, folioWine]) {
      m.transparent = true;
      m.opacity = 0.24;
      m.depthWrite = false;
      m.side = T.FrontSide;
    }
    const folioGeometry = new T.BoxGeometry(0.65, 1.6, 0.045);
    const folios = Array.from({ length: 14 }, (_, i) => {
      const mesh = new T.Mesh(folioGeometry, i % 3 ? folioBronze : folioWine);
      scene.add(mesh);
      return mesh;
    });
    let frame = 0,
      lastP = -1,
      lastWidth = 0,
      wasPaused = false;
    const resize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
      lastP = -1;
    };
    const loss = (e: Event) => {
      e.preventDefault();
      live.current.onFail();
    };
    renderer.domElement.addEventListener("webglcontextlost", loss);
    window.addEventListener("resize", resize);
    function render() {
      frame = requestAnimationFrame(render);
      const { progress, paused } = live.current,
        p = progress.current;
      if (document.hidden || paused) {
        wasPaused = true;
        return;
      }
      if (
        Math.abs(p - lastP) < 0.00002 &&
        lastWidth === innerWidth &&
        !wasPaused
      )
        return;
      wasPaused = false;
      lastP = p;
      lastWidth = innerWidth;
      const cp = samplePath(p, cameraPath),
        tp = samplePath(p, targetPath),
        mobile = innerWidth < 760;
      camera.position.set(cp[0], cp[1], cp[2] * (mobile ? 1.55 : 1));
      camera.lookAt(tp[0], tp[1], tp[2]);
      key.position.y = cp[1] + 5;
      key.target.position.y = cp[1];
      fill.position.y = cp[1] - 3;
      fill.target.position.y = cp[1];
      // The same fourteen folios gather into a lattice, routes, playing pieces, then paper.
      folios.forEach((m, i) => {
        const col = i % 7,
          row = Math.floor(i / 7),
          sign = i % 2 ? 1 : -1;
        const poses = [
          [
            sign * (4.5 + (i % 3) * 0.7),
            (i / 14 - 0.5) * 11,
            -4 - (i % 3),
            0.1,
            sign * 0.3,
            0.06,
            0.3,
            2.2,
          ],
          [
            sign * (3.4 + (i % 3) * 0.5),
            (i / 14 - 0.5) * 9,
            -3 - (i % 3),
            0.1,
            sign * 0.2,
            -0.1,
            0.4,
            1.8,
          ],
          [
            (col - 3) * 1.25,
            (row - 0.5) * 3,
            -2 - (i % 3),
            0.1,
            sign * 0.25,
            sign * 0.1,
            0.8,
            0.65,
          ],
          [
            (i / 14 - 0.5) * 13,
            Math.sin(i * 0.6) * 2,
            -3 - (i % 3),
            0,
            sign * 0.5,
            -0.6,
            0.2,
            2.4,
          ],
          [
            sign * (2.8 + row),
            (col - 3) * 1.1,
            -3 - (i % 2),
            0,
            sign * 0.4,
            sign * 0.3,
            0.65,
            1.8,
          ],
          [
            (col - 3) * 1.2,
            (row - 0.5) * 3,
            -3 - (i % 2),
            0.1,
            sign * 0.2,
            sign * 0.2,
            0.8,
            0.8,
          ],
          [
            2 + (i % 4) * 0.18,
            (i / 14 - 0.5) * 0.65,
            -2 - i * 0.12,
            0.1,
            -0.2,
            sign * 0.08,
            2.7,
            1.2,
          ],
          [
            sign * (3.8 + (i % 3) * 0.4),
            (i / 14 - 0.5) * 10,
            -3 - (i % 3),
            0.1,
            sign * 0.4,
            sign * 0.2,
            0.3,
            2.2,
          ],
        ];
        const q = samplePath(p, poses);
        m.position.set(q[0] * (mobile ? 0.7 : 1), -p * 9 + q[1], q[2]);
        m.rotation.set(q[3], q[4], q[5]);
        m.scale.set(q[6], q[7], 1);
      });
      ribbon.position.x = mix(0, mobile ? 0 : 1.2, smooth(p));
      renderer.render(scene, camera);
      const debug = {
        progress: p,
        camera: camera.position.toArray(),
        drawCalls: renderer.info.render.calls,
        geometries: renderer.info.memory.geometries,
      };
      Object.assign(window, { __journeyWorld: debug });
    }
    let disposed = false;
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, -1);
    renderer
      .compileAsync(scene, camera)
      .then(() => {
        if (disposed) return;
        render();
        performance.mark("portfolio-cinematic-rendered");
        live.current.onReady();
      })
      .catch(() => {
        if (!disposed) live.current.onFail();
      });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("webglcontextlost", loss);
      const geometries = new Set<T.BufferGeometry>();
      scene.traverse((o) => {
        if (o instanceof T.Mesh || o instanceof T.Line)
          geometries.add(o.geometry);
      });
      geometries.forEach((g) => g.dispose());
      bronze.dispose();
      wine.dispose();
      folioBronze.dispose();
      folioWine.dispose();
      threadMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={mount} className="journey-world" aria-hidden="true" />;
}
