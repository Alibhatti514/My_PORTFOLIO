import { useEffect, useRef } from "react";
import * as T from "three";
import { skills } from "../data/skills";
import { projects } from "../data/portfolio";
import certificates from "../data/certificates.json";
import {
  smooth,
  mix,
  samplePath,
  cameraPath,
  targetPath,
} from "../scene/journey";
const programs = certificates.filter((c) => c.featured);
interface Props {
  progress: React.RefObject<number>;
  skill: number;
  credential: number;
  paused: boolean;
  onSkill: (n: number) => void;
  onCredential: (n: number) => void;
  onReady: () => void;
  onFail: () => void;
  onInspect: () => void;
}
export default function JourneyWorld(props: Props) {
  const mount = useRef<HTMLDivElement>(null),
    live = useRef(props);
  live.current = props;
  useEffect(() => {
    const host = mount.current!;
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        alpha: true,
        antialias: innerWidth > 700,
        powerPreference: "high-performance",
      });
    } catch {
      live.current.onFail();
      return;
    }
    let disposed = false,
      frame = 0,
      visible = true,
      ready = false;
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, innerWidth < 700 ? 1.35 : 1.7),
    );
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.dataset.world = "persistent";
    host.appendChild(renderer.domElement);
    scene.add(new T.AmbientLight("#9bafff", 1.5));
    const blue = new T.PointLight("#4776ff", 65, 35),
      violet = new T.PointLight("#985bff", 80, 30),
      pearl = new T.PointLight("#d4eaff", 35, 30);
    blue.position.set(-5, 4, 5);
    violet.position.set(5, 0, 3);
    pearl.position.set(0, 6, 2);
    scene.add(blue, violet, pearl);
    const root = new T.Group();
    scene.add(root);
    const metal = new T.MeshStandardMaterial({
      color: "#838bad",
      metalness: 0.92,
      roughness: 0.28,
    });
    const darkMetal = new T.MeshStandardMaterial({
      color: "#1c2858",
      metalness: 0.8,
      roughness: 0.25,
    });
    const trace = new T.MeshBasicMaterial({
      color: "#7b9cff",
      transparent: true,
      opacity: 0.32,
    });
    const loader = new T.TextureLoader(),
      textures = new Set<T.Texture>();
    const load = (path: string, cb?: (t: T.Texture) => void) =>
      loader.load(
        path,
        (t) => {
          if (disposed) {
            t.dispose();
            return;
          }
          t.colorSpace = T.SRGBColorSpace;
          t.anisotropy = 4;
          textures.add(t);
          cb?.(t);
        },
        undefined,
        () => {},
      );
    const environmentReady = new Promise<void>((resolve) => {
      loader.load(
        "/assets/environment/studio-pmrem.png",
        (t) => {
          if (disposed) {
            t.dispose();
            resolve();
            return;
          }
          t.mapping = T.CubeUVReflectionMapping;
          t.colorSpace = T.LinearSRGBColorSpace;
          t.generateMipmaps = false;
          t.minFilter = T.LinearFilter;
          scene.environment = t;
          textures.add(t);
          resolve();
        },
        undefined,
        () => resolve(),
      );
    });
    function glow(color: string) {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const x = c.getContext("2d")!;
      const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, color);
      g.addColorStop(0.4, color + "66");
      g.addColorStop(1, color + "00");
      x.fillStyle = g;
      x.fillRect(0, 0, 256, 256);
      const t = new T.CanvasTexture(c);
      textures.add(t);
      return t;
    }
    const aura = new T.Mesh(
      new T.PlaneGeometry(17, 17),
      new T.MeshBasicMaterial({
        map: glow("#4938b3"),
        transparent: true,
        depthWrite: false,
        blending: T.AdditiveBlending,
      }),
    );
    aura.position.set(0, 0, -4);
    scene.add(aura);
    const rings = new T.Group();
    root.add(rings);
    const ringMeshes: T.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const r = new T.Mesh(
        new T.TorusGeometry(
          2.9 + i * 0.28,
          i === 0 ? 0.022 : 0.013,
          innerWidth < 700 ? 6 : 10,
          innerWidth < 700 ? 100 : 180,
        ),
        i % 2 ? metal : trace,
      );
      r.rotation.set(0.23 + i * 0.41, 0.2 + i * 0.55, i * 0.4);
      rings.add(r);
      ringMeshes.push(r);
    }
    const ticks = new T.Group();
    rings.add(ticks);
    const tickGeo = new T.BoxGeometry(0.018, 0.12, 0.022);
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const m = new T.Mesh(tickGeo, i % 4 ? darkMetal : metal);
      m.position.set(Math.cos(a) * 3.5, Math.sin(a) * 3.5, 0);
      m.rotation.z = a - Math.PI / 2;
      ticks.add(m);
    }
    const satellites: T.Mesh[] = [];
    const satGeo = new T.OctahedronGeometry(0.14, 0);
    for (let i = 0; i < 12; i++) {
      const m = new T.Mesh(satGeo, i % 2 ? metal : darkMetal);
      root.add(m);
      satellites.push(m);
    }
    const portraitGroup = new T.Group();
    root.add(portraitGroup);
    const portraitMat = new T.ShaderMaterial({
      uniforms: { map: { value: null }, opacity: { value: 1 } },
      transparent: true,
      depthWrite: false,
      vertexShader:
        "varying vec2 uvp;void main(){uvp=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "uniform sampler2D map;uniform float opacity;varying vec2 uvp;void main(){vec4 c=texture2D(map,uvp);gl_FragColor=vec4(c.rgb,c.a*opacity*smoothstep(.04,.3,uvp.y));#include <colorspace_fragment>\n}",
    });
    // No depth displacement or invented facial geometry: the supplied cutout stays intact.
    portraitMat.fragmentShader = portraitMat.fragmentShader.replace(
      ";#include",
      ";\n#include",
    );
    const portrait = new T.Mesh(new T.PlaneGeometry(7.6, 7.6), portraitMat);
    portrait.position.set(0, -0.5, 0.65);
    portraitGroup.add(portrait);
    load("/assets/ali-bhatti-portrait.png", (t) => {
      portraitMat.uniforms.map.value = t;
    });
    const base = new T.Mesh(
      new T.CylinderGeometry(2.15, 2.35, 0.08, 90),
      darkMetal,
    );
    base.position.set(0, -3.7, -1.5);
    root.add(base);
    base.visible = false;
    const baseTrace = new T.Mesh(new T.TorusGeometry(2.3, 0.01, 6, 120), trace);
    baseTrace.rotation.x = Math.PI / 2;
    baseTrace.position.set(0, -3.65, -1.5);
    root.add(baseTrace);
    baseTrace.visible = false;
    const grid = new T.GridHelper(50, 50, "#303971", "#131a38");
    grid.position.y = -3.3;
    grid.material.transparent = true;
    grid.material.opacity = 0.08;
    scene.add(grid);
    const pCount = innerWidth < 700 ? 200 : 650,
      positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const seed = (n: number) => {
        const v = Math.sin(n * 127.1) * 43758.5453;
        return v - Math.floor(v);
      };
      positions.set(
        [
          (seed(i + 1) - 0.5) * 35,
          (seed(i + 872) - 0.5) * 22,
          (seed(i + 1244) - 0.5) * 28 - 7,
        ],
        i * 3,
      );
    }
    const starGeo = new T.BufferGeometry();
    starGeo.setAttribute("position", new T.BufferAttribute(positions, 3));
    const stars = new T.Points(
      starGeo,
      new T.PointsMaterial({
        size: 0.025,
        color: "#aebcff",
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
      }),
    );
    scene.add(stars);
    const technology = new T.Group();
    root.add(technology);
    const tiles: T.Group[] = [];
    const pickable: T.Object3D[] = [];
    const tileGeo = new T.BoxGeometry(0.82, 0.92, 0.12),
      tileSurface = new T.PlaneGeometry(0.76, 0.85);
    skills.forEach((s, i) => {
      const group = new T.Group();
      const body = new T.Mesh(
        tileGeo,
        new T.MeshStandardMaterial({
          color: i % 2 ? "#1d2c69" : "#20244f",
          metalness: 0.65,
          roughness: 0.25,
        }),
      );
      group.add(body);
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 288;
      const ctx = c.getContext("2d")!;
      const paint = (img?: HTMLImageElement) => {
        ctx.clearRect(0, 0, 256, 288);
        if (img) {
          ctx.drawImage(img, 78, 45, 100, 100);
          ctx.globalCompositeOperation = "source-in";
          ctx.fillStyle = "#dce6ff";
          ctx.fillRect(0, 0, 256, 180);
          ctx.globalCompositeOperation = "source-over";
        } else {
          ctx.fillStyle = "#b5a4ff";
          ctx.font = "500 60px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(s.name.split(" / ")[0].slice(0, 3), 128, 125);
        }
        ctx.fillStyle = "#f5f6ff";
        ctx.textAlign = "center";
        ctx.font = "500 24px sans-serif";
        const words = s.name.split(" / ");
        words.forEach((w, j) => ctx.fillText(w, 128, 208 + j * 28, 238));
        texture.needsUpdate = true;
      };
      const texture = new T.CanvasTexture(c);
      texture.colorSpace = T.SRGBColorSpace;
      textures.add(texture);
      paint();
      if (s.icon) {
        const img = new Image();
        img.onload = () => {
          if (!disposed) paint(img);
        };
        img.src = `/assets/brands/${s.icon}.svg`;
      }
      const front = new T.Mesh(
        tileSurface,
        new T.MeshBasicMaterial({ map: texture, transparent: true }),
      );
      front.position.z = 0.065;
      group.add(front);
      body.userData = { skill: i };
      pickable.push(body);
      tiles.push(group);
      technology.add(group);
    });
    const connectionsGeo = new T.BufferGeometry();
    const connArray = new Float32Array(skills.length * 6);
    connectionsGeo.setAttribute(
      "position",
      new T.BufferAttribute(connArray, 3),
    );
    const connections = new T.LineSegments(
      connectionsGeo,
      new T.LineBasicMaterial({
        color: "#6984d9",
        transparent: true,
        opacity: 0.23,
      }),
    );
    technology.add(connections);
    const displays: T.Group[] = [];
    projects.forEach((p, i) => {
      const g = new T.Group();
      const casing = new T.Mesh(new T.BoxGeometry(5.4, 3.7, 0.22), metal);
      g.add(casing);
      const inner = new T.Mesh(new T.BoxGeometry(5.25, 3.55, 0.23), darkMetal);
      inner.position.z = 0.015;
      g.add(inner);
      const c = document.createElement("canvas");
      c.width = 1200;
      c.height = 800;
      const ctx = c.getContext("2d")!;
      const texture = new T.CanvasTexture(c);
      texture.colorSpace = T.SRGBColorSpace;
      textures.add(texture);
      const img = new Image();
      img.onload = () => {
        if (disposed) return;
        ctx.fillStyle = "#edf0fa";
        ctx.fillRect(0, 0, 1200, 800);
        ctx.fillStyle = "#354579";
        ctx.font = "22px monospace";
        ctx.fillText("SELECTED WORK / 0" + (i + 1), 55, 65);
        const ratio = Math.min(900 / img.width, 470 / img.height);
        ctx.drawImage(
          img,
          (1200 - img.width * ratio) / 2,
          (800 - img.height * ratio) / 2,
          img.width * ratio,
          img.height * ratio,
        );
        ctx.fillStyle = "#354579";
        ctx.font = "20px monospace";
        ctx.fillText("ORIGINAL PROJECT ARTWORK", 55, 755);
        texture.needsUpdate = true;
      };
      img.src = p.logo;
      const screen = new T.Mesh(
        new T.PlaneGeometry(5.1, 3.4),
        new T.MeshBasicMaterial({ map: texture }),
      );
      screen.position.z = 0.145;
      g.add(screen);
      const stand = new T.Mesh(
        new T.CylinderGeometry(0.035, 0.035, 1.6, 8),
        metal,
      );
      stand.position.set(0, -2.6, 0);
      g.add(stand);
      const light = new T.Mesh(new T.BoxGeometry(4.8, 0.018, 0.035), trace);
      light.position.set(0, -1.9, 0.16);
      g.add(light);
      root.add(g);
      displays.push(g);
    });
    const credentialGroup = new T.Group();
    root.add(credentialGroup);
    const plaques: T.Group[] = [];
    programs.forEach((c, i) => {
      const g = new T.Group();
      const backing = new T.Mesh(new T.BoxGeometry(3.7, 2.9, 0.1), metal);
      g.add(backing);
      const map = load(c.preview);
      const mat = new T.MeshBasicMaterial({ map, color: "#ffffff" });
      const surface = new T.Mesh(new T.PlaneGeometry(3.62, 2.8), mat);
      surface.position.z = 0.06;
      surface.userData = { credential: i };
      pickable.push(surface);
      g.add(surface);
      credentialGroup.add(g);
      plaques.push(g);
    });
    const pointer = new T.Vector2(10, 10),
      ray = new T.Raycaster();
    let interactiveStart = false,
      downX = 0,
      downY = 0,
      hover = -1,
      rotation = 0,
      lastTime = 0;
    const move = (e: PointerEvent) => {
      pointer.set(
        (e.clientX / innerWidth) * 2 - 1,
        (-e.clientY / innerHeight) * 2 + 1,
      );
    };
    const down = (e: PointerEvent) => {
      interactiveStart = e.target === renderer.domElement;
      downX = e.clientX;
      downY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (live.current.paused || !interactiveStart) return;
      const dx = e.clientX - downX,
        dy = e.clientY - downY;
      const p = live.current.progress.current;
      if (
        p > 5.65 &&
        p < 6.75 &&
        Math.abs(dx) > 45 &&
        Math.abs(dx) > Math.abs(dy) * 1.3
      ) {
        live.current.onCredential(
          (live.current.credential + (dx < 0 ? 1 : -1) + programs.length) %
            programs.length,
        );
        return;
      }
      if (Math.hypot(dx, dy) > 12) return;
      ray.setFromCamera(pointer, camera);
      const hit = ray
        .intersectObjects(
          pickable.filter((o) =>
            p < 3
              ? o.userData.skill !== undefined
              : o.userData.credential !== undefined,
          ),
        )
        .find((h) => h.object.parent?.visible && h.object.parent.scale.x > 0.5);
      if (hit && p > 1.5 && p < 2.7 && hit.object.userData.skill !== undefined)
        live.current.onSkill(hit.object.userData.skill);
      if (
        hit &&
        p > 5.6 &&
        p < 6.75 &&
        hit.object.userData.credential !== undefined
      ) {
        if (hit.object.userData.credential === live.current.credential)
          live.current.onInspect();
        else live.current.onCredential(hit.object.userData.credential);
      }
    };
    const resize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(
        Math.min(devicePixelRatio, innerWidth < 700 ? 1.35 : 1.7),
      );
    };
    const loss = (e: Event) => {
      e.preventDefault();
      live.current.onFail();
    };
    const visibility = () => {
      visible = !document.hidden;
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("visibilitychange", visibility);
    renderer.domElement.addEventListener("webglcontextlost", loss);
    const v = new T.Vector3();
    let ringSelection = 0;
    function render(ms: number) {
      frame = requestAnimationFrame(render);
      const dt = Math.min((ms - lastTime) / 1000, 0.05);
      lastTime = ms;
      if (!visible || live.current.paused) return;
      const p = live.current.progress.current,
        mobile = innerWidth < 1001,
        time = ms / 1000;
      const cp = samplePath(p, cameraPath),
        target = samplePath(p, targetPath);
      camera.position.set(cp[0], cp[1], cp[2] * (mobile ? 1.1 : 1));
      camera.lookAt(target[0], target[1], target[2]);
      const entry = smooth(ms / 1700);
      root.scale.setScalar((mobile ? 0.77 : 1) * mix(0.9, 1, entry));
      // The same orbital sculpture travels through every waypoint.
      rings.rotation.set(
        0.1 + Math.sin(p * 0.8) * 0.3,
        p * 0.46 + time * 0.025,
        p * 0.21,
      );
      rings.scale.setScalar(mix(0.95, 1.15, smooth(p - 1)));
      const rp = samplePath(p, [
        [0, 0, -5.5],
        [-2.6, 0.4, -5.5],
        [-1.8, 0, -5.5],
        [1.7, 0, -5.5],
        [1.7, 0, -5.5],
        [1.7, 0, -5.5],
        [1.6, 0, -8.5],
        [0, 0, -5.5],
      ]);
      rings.position.set(mobile ? rp[0] * 0.1 : rp[0], rp[1], rp[2]);
      ringMeshes.forEach((r, i) => {
        r.rotation.x = 0.23 + i * 0.41 + p * 0.22;
        r.rotation.y = 0.2 + i * 0.55 + Math.sin(p) * 0.5;
      });
      ticks.rotation.z = -p * 0.3 - time * 0.015;
      const about = smooth(p),
        away = smooth((p - 1.05) / 0.9),
        returning = smooth((p - 6.35) / 0.65);
      portraitGroup.position.set(
        mix(mix(0, mobile ? -0.1 : -2.5, about), 0, returning),
        mix(mix(0, mobile ? 1.9 : -0.2, about), -0.9, returning),
        mix(-away * 5, 0, returning),
      );
      portraitGroup.rotation.y = mix(-about * 0.16, 0, returning);
      const portraitScale =
        mix(mix(1, 0.7, about), 0.78, returning) *
        (1 - away * 0.8 * (1 - returning));
      portraitGroup.scale.setScalar(portraitScale);
      portraitMat.uniforms.opacity.value = 1 - away * (1 - returning);
      portraitGroup.visible = portraitMat.uniforms.opacity.value > 0.001;
      base.rotation.y = p * 0.3;
      base.scale.setScalar(1 + Math.sin(p * 0.7) * 0.15);
      baseTrace.scale.copy(base.scale);
      stars.rotation.y = p * 0.065 + time * 0.005;
      stars.rotation.z = Math.sin(p * 0.5) * 0.12;
      aura.material.opacity = 0.24 + Math.sin(p * 0.6) * 0.08;
      blue.intensity = 65 + Math.sin(p * 0.8) * 25;
      violet.intensity = 70 + Math.cos(p * 0.9) * 25;
      const skillOn =
        smooth((p - 0.95) / 0.85) * (1 - smooth((p - 2.35) / 0.9));
      technology.scale.setScalar(Math.max(0.001, skillOn));
      technology.position.set(mobile ? 0 : -2.05, mobile ? 1.6 : 0, 0);
      technology.visible = skillOn > 0.001;
      const transition = smooth((p - 2.2) / 0.8);
      tiles.forEach((g, i) => {
        const band = i < 8 ? 0 : 1,
          a =
            ((i % 8) / 8) * Math.PI * 2 +
            p * 0.22 +
            time * 0.025 * (band ? 1 : -1),
          r = band ? 3.2 : 1.95;
        g.position.set(
          mix(Math.cos(a) * r, Math.cos(a) * 3.5, transition),
          mix(Math.sin(a) * r * 0.75, Math.sin(a) * 3.5, transition),
          mix(Math.sin(a + 0.8) * 1.4, -2, transition),
        );
        g.rotation.set(
          Math.sin(a) * 0.12,
          -Math.cos(a) * 0.2,
          Math.sin(a) * 0.08,
        );
        const selected = i === live.current.skill || i === hover;
        g.scale.setScalar(selected ? 1.24 : 1);
        (
          g.children[0] as T.Mesh<T.BoxGeometry, T.MeshStandardMaterial>
        ).material.emissive.set(selected ? "#21327a" : "#000000");
        connArray.set(
          [g.position.x, g.position.y, g.position.z, 0, 0, -1],
          i * 6,
        );
      });
      connectionsGeo.attributes.position.needsUpdate = true;
      displays.forEach((g, i) => {
        const d = p - (3 + i);
        const visibility = 1 - smooth((Math.abs(d) - 0.18) / 0.9);
        g.visible = visibility > 0.001;
        g.scale.setScalar(Math.max(0.001, visibility) * (mobile ? 0.78 : 1));
        g.position.set(
          (mobile ? 0 : 2.35) + d * (mobile ? -3 : 1.3),
          mobile ? 1.5 : 0.25,
          -Math.abs(d) * 4,
        );
        g.rotation.set(-0.055, d * 0.45 - 0.09, -0.03 + d * 0.1);
      });
      const certOn = smooth((p - 5.05) / 0.8) * (1 - smooth((p - 6.5) / 0.5));
      credentialGroup.visible = certOn > 0.001;
      credentialGroup.scale.setScalar(
        Math.max(0.001, certOn) * (mobile ? 0.7 : 1),
      );
      credentialGroup.position.set(mobile ? 0 : 3.1, mobile ? 1.1 : 0.1, -0.5);
      let desired = (-live.current.credential * Math.PI * 2) / programs.length;
      desired +=
        Math.round((ringSelection - desired) / (Math.PI * 2)) * Math.PI * 2;
      if (Math.abs(desired - ringSelection) > Math.PI * 2)
        ringSelection = desired;
      ringSelection += (desired - ringSelection) * (1 - Math.exp(-dt * 8));
      rotation = ringSelection;
      plaques.forEach((g, i) => {
        const a = (i / programs.length) * Math.PI * 2 + rotation;
        g.position.set(
          Math.sin(a) * 4.7,
          Math.cos(a) * 0.18,
          Math.cos(a) * 2.4 - 2.4,
        );
        g.rotation.y = a;
        const front = (Math.cos(a) + 1) / 2;
        g.scale.setScalar(0.63 + front * 0.4);
      });
      satellites.forEach((m, i) => {
        const a = (i / 12) * Math.PI * 2 + p * 0.44 + time * 0.035;
        m.position.set(
          Math.cos(a) * (4.8 + Math.sin(p) * 0.3),
          Math.sin(a) * 3.3,
          Math.sin(a + p) * 2 - 3,
        );
        m.rotation.set(time * 0.2 + i, p * 0.5 + i, time * 0.12);
        m.scale.setScalar(1 + Math.sin(p + i) * 0.3);
      });
      ray.setFromCamera(pointer, camera);
      const hit = ray
        .intersectObjects(pickable)
        .find((h) => h.object.userData.skill !== undefined);
      hover = p > 1.6 && p < 2.6 && hit ? hit.object.userData.skill : -1;
      host.style.cursor =
        hover >= 0 ? "pointer" : p > 5.7 && p < 6.7 ? "grab" : "default";
      renderer.render(scene, camera);
      if (!ready) {
        ready = true;
        live.current.onReady();
      }
      v.copy(camera.position);
      renderer.domElement.dataset.camera = v
        .toArray()
        .map((x) => x.toFixed(3))
        .join(",");
      renderer.domElement.dataset.progress = p.toFixed(4);
      renderer.domElement.dataset.objects = String(scene.children.length);
      renderer.domElement.dataset.credential = String(live.current.credential);
    }
    environmentReady.then(async () => {
      if (disposed) return;
      try {
        await renderer.compileAsync(scene, camera);
      } catch {
        /* Render normally on drivers without parallel compilation. */
      }
      if (!disposed) frame = requestAnimationFrame(render);
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", loss);
      const geometries = new Set<T.BufferGeometry>(),
        materials = new Set<T.Material>();
      scene.traverse((o) => {
        if (
          o instanceof T.Mesh ||
          o instanceof T.Points ||
          o instanceof T.Line
        ) {
          geometries.add(o.geometry);
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(
            (m: T.Material) => materials.add(m),
          );
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      host.replaceChildren();
    };
  }, []);
  return <div ref={mount} className="world-canvas" />;
}
