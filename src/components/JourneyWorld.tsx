import { useEffect, useRef } from 'react';
import * as T from 'three';
import { createGallery, galleryState } from '../scene/gallery';
import { projectArtifacts } from '../scene/projectArtifacts';
import { createDeveloperUniverse } from '../scene/developerUniverse';
import { developerComposition, type VisualRect } from '../scene/developerComposition';
import './developer-universe.css';
import { protectedLaptopSignature } from '../scene/protectedSignature';
import { installProtectedCapture } from '../scene/protectedCapture';
import { createAtelierWorld } from '../scene/atelierWorld';
import { atelier } from '../scene/atelierTokens';
import { createMacbookWorkstation } from '../scene/macbookWorkstation';
import {smooth} from '../scene/journey';
import { editorState,type TerminalCommand } from '../scene/macbookEditor';
import './macbook-workstation.css';
import './macbook-project-logos.css';
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
  const controls=useRef<HTMLDivElement>(null),terminalStatus=useRef<HTMLSpanElement>(null),runCommand=useRef<((command:TerminalCommand)=>void)|null>(null);
  live.current = props;
  useEffect(() => {
    const host = mount.current!;
    const diagnostics=new URLSearchParams(location.search).get('qa')==='1';
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch { live.current.onFail(); return; }
    const gallery = createGallery();
    const {scene, courts, key} = gallery;
    const originalObjects = [...scene.children].filter(o => !(o instanceof T.Light) && o !== key.target);
    const universe = createDeveloperUniverse(renderer);
    const atelierWorld = createAtelierWorld(universe);
    // Reuse the frozen laptop's existing reflection map for its surroundings only.
    scene.environment=((universe.laptop.children[0] as T.Mesh).material as T.MeshStandardMaterial).envMap;
    scene.environmentIntensity=.22;
    const developerCamera = new T.PerspectiveCamera(36,1,.12,100);
    const projected = new T.Vector3(), laptopBounds = new T.Box3();
    const rect = (el:Element):VisualRect => {const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};
    const obstacleNodes=[...document.querySelectorAll('.technology-field,.skill-inspector,.skills-heading,.skill-category,.project-navigation,.credential-copy,.certificate-wheel-stage')];
    const projectNodes=[...document.querySelectorAll<HTMLElement>('.project-composition')].map(el=>({el,identity:el.querySelector('.project-identity')!,logo:el.querySelector('.project-object')!}));
    const projectStage=document.querySelector<HTMLElement>('.project-stage')!;let introOffset=0;
    const frontCamera=new T.Vector3(0,3.2,10.5),startupCamera=new T.Vector3(),startupTarget=new T.Vector3(),originalTarget=new T.Vector3();
    const camera = new T.PerspectiveCamera(48, innerWidth / innerHeight, .15, 180);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(atelier.obsidian, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.dataset.world = 'spatial-gallery';
    host.appendChild(renderer.domElement);
    let disposed = false, lastP = -1, renders = 0;
    const macbook=createMacbookWorkstation(universe,()=>{lastP=-1;paint(live.current.progress.current);},renderer);
    runCommand.current=macbook.run;
    const artifacts = projectArtifacts(scene, () => { lastP = -1; paint(live.current.progress.current); },true);
    const paint = (p: number) => {
      if (disposed || document.hidden || live.current.paused || p === lastP) return;
      lastP = p;
      const pose = galleryState(p, innerWidth < 760);
      camera.position.fromArray(pose.camera);
      camera.lookAt(camera.position.x + Math.sin(pose.yaw) * 22, camera.position.y - 3.5, camera.position.z - 24);
      camera.rotateZ(pose.roll);
      camera.fov = pose.fov; camera.updateProjectionMatrix();
      const stacked=innerWidth<1000 && innerHeight>innerWidth;
      const cinematic = universe.update(p, stacked);
      const exhibition = atelierWorld.update(p, stacked);
      const hardware = macbook.update(p,stacked);
      originalObjects.forEach(o => { o.visible = cinematic.presence < .999; });
      gallery.materials.forEach(m => { m.transparent = cinematic.presence > 0; m.opacity = 1 - cinematic.presence; m.depthWrite = cinematic.presence === 0; });
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
      renderer.setViewport(0,0,innerWidth,innerHeight);renderer.setScissorTest(false);renderer.autoClear=true;
      renderer.render(scene, camera);
      let drawCalls=renderer.info.render.calls, triangles=renderer.info.render.triangles;
      let frame:ReturnType<typeof developerComposition>|null=null, laptopRect:VisualRect|null=null;
      if(cinematic.presence>0) {
        // Let the first project settle earlier on narrow screens, reserving the opening view.
        // Move its clipped presentation surface together; descriptions/logos never leave that surface.
        const offset=stacked&&!macbook.original&&p>2.3&&p<3.12?-Math.max(0,rect(projectNodes[0].el).y-introOffset-120)*smooth((p-2.3)/.35)*(1-smooth((p-3)/.12)):0;
        const shift=`${offset.toFixed(2)}px`;introOffset=Number(offset.toFixed(2));
        if(projectStage.style.getPropertyValue('--macbook-intro-offset')!==shift)projectStage.style.setProperty('--macbook-intro-offset',shift);
        const obstacles:VisualRect[]=[];
        obstacleNodes.forEach(el=>obstacles.push(rect(el)));
        projectNodes.forEach(({el,identity,logo})=>{if(Number(el.style.opacity)<.01)return;obstacles.push(rect(identity));if(!stacked||p>=2.95)obstacles.push(rect(logo));});
        frame=developerComposition(innerWidth,innerHeight,obstacles);
        if(frame.height>4) {
          developerCamera.aspect=frame.width/frame.height;
          developerCamera.position.fromArray(cinematic.camera);
          // Fit the unchanged laptop and its small satellite panels in the reserved visual field.
          if(cinematic.t<1.7)developerCamera.position.z=Math.max(developerCamera.position.z,(3.6+cinematic.awakening)/(Math.tan(T.MathUtils.degToRad(18))*developerCamera.aspect));
          originalTarget.fromArray(cinematic.target);
          if(hardware.startup&&p<3.5){const s=hardware.startup;startupCamera.set(3.8+s.side*3.7,5-s.side*2.6,7.5-s.side*2);startupCamera.lerp(frontCamera,s.front);startupCamera.z=Math.max(startupCamera.z,3.5/(Math.tan(T.MathUtils.degToRad(18))*developerCamera.aspect));startupCamera.lerp(developerCamera.position,s.handoff);developerCamera.position.copy(startupCamera);startupTarget.set(0,-.4+s.front*1.3,-.15);startupTarget.lerp(originalTarget,s.handoff);originalTarget.copy(startupTarget);}
          developerCamera.lookAt(originalTarget);developerCamera.updateProjectionMatrix();developerCamera.updateMatrixWorld();
          universe.setFrame(frame.x,innerHeight-frame.y-frame.height,frame.width,frame.height,renderer.getPixelRatio());
          atelierWorld.setFrame(frame.x,innerHeight-frame.y-frame.height,frame.width,frame.height,renderer.getPixelRatio());
          macbook.setFrame(frame.x,innerHeight-frame.y-frame.height,frame.width,frame.height,renderer.getPixelRatio());
          renderer.autoClear=false;renderer.setViewport(frame.x,innerHeight-frame.y-frame.height,frame.width,frame.height);
          renderer.setScissor(frame.x,innerHeight-frame.y-frame.height,frame.width,frame.height);renderer.setScissorTest(true);renderer.clearDepth();
          renderer.render(universe.scene,developerCamera);
          drawCalls+=renderer.info.render.calls;triangles+=renderer.info.render.triangles;
          renderer.render(atelierWorld.scene,developerCamera);
          drawCalls+=renderer.info.render.calls;triangles+=renderer.info.render.triangles;
          renderer.setScissorTest(false);renderer.setViewport(0,0,innerWidth,innerHeight);renderer.autoClear=true;
          if(cinematic.t<1.7){
            universe.group.updateMatrixWorld(true);laptopBounds.setFromObject(universe.hinge);
            let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
            for(let i=0;i<8;i++){
              projected.set(i&1?laptopBounds.max.x:laptopBounds.min.x,i&2?laptopBounds.max.y:laptopBounds.min.y,i&4?laptopBounds.max.z:laptopBounds.min.z).project(developerCamera);
              const x=frame.x+(projected.x+1)*frame.width/2,y=frame.y+(1-projected.y)*frame.height/2;
              left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
            }
            laptopRect={x:left,y:top,width:right-left,height:bottom-top};
          }
        }
      }
      renders++;
      if(controls.current){const show=!macbook.original&&hardware.ready&&p>3.1&&p<3.58&&frame!==null&&frame.height>100;if(controls.current.hidden===show)controls.current.hidden=!show;if(show){const x=`${frame!.x+8}px`,y=`${frame!.y+8}px`;if(controls.current.style.left!==x)controls.current.style.left=x;if(controls.current.style.top!==y)controls.current.style.top=y;controls.current.querySelectorAll('button').forEach(b=>{const pressed=String(b.dataset.command===hardware.command);if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);});}}
      Object.assign(window, { __journeyWorld: { progress: p, camera: (cinematic.presence>0?developerCamera:camera).position.toArray(),
        cameraType: camera.type, rotation: (cinematic.presence>0?developerCamera:camera).rotation.toArray(), fov: cinematic.presence>0?developerCamera.fov:camera.fov,
        objects: courts.map(c => ({position:c.position.toArray(), rotation:c.rotation.toArray(),scale:c.scale.toArray()})),
        light: key.intensity, drawCalls, geometries: renderer.info.memory.geometries,
        protectedLaptop:diagnostics?protectedLaptopSignature(universe.laptop):undefined, macbook:hardware, atelierStage:exhibition.stage, visualFrame:frame, laptopRect, textures:renderer.info.memory.textures, developerStage: cinematic.stage, developerPresence: cinematic.presence, developerTimeline: cinematic.t,
        triangles, renders, disposed: false } });
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
    const releaseProtectedCapture=installProtectedCapture(renderer,universe,developerCamera,()=>{lastP=-1;paint(live.current.progress.current);},macbook.setFrame);
    // Compile the optional journey before its first scroll reveal. It lives in a
    // separate scene, so this cannot draw over or alter the protected portrait.
    const cinematicWarmup=macbook.ready.then(()=>{if(disposed)return;const wasVisible=universe.group.visible;universe.group.visible=true;const compile=renderer.compileAsync(universe.scene,developerCamera);universe.group.visible=wasVisible;return compile;});
    Promise.all([renderer.compileAsync(scene, camera),cinematicWarmup,renderer.compileAsync(atelierWorld.scene,developerCamera)]).then(() => {
      if (disposed) return;
      lastP = -1; paint(live.current.progress.current);
      performance.mark('portfolio-cinematic-rendered'); live.current.onReady();
    }).catch(() => { if (!disposed) live.current.onFail(); });
    return () => {
      disposed = true; live.current.renderFrame.current = null;
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('webglcontextlost', loss);
      projectStage.style.removeProperty('--macbook-intro-offset');
      runCommand.current=null;artifacts.dispose(); macbook.dispose(); atelierWorld.dispose(); universe.dispose(); gallery.dispose();
      Object.assign(window, { __journeyWorld: { disposed: true, geometriesDisposed: gallery.geometries.length, materialsDisposed: gallery.materials.length } });
      releaseProtectedCapture();renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);
  return <><div ref={mount} className="journey-world" aria-hidden="true" /><div ref={controls} className="macbook-controls" role="group" aria-label="MacBook terminal previews" hidden>
    {(['build','test','deploy'] as const).map(command=><button key={command} type="button" data-command={command} aria-pressed="false" aria-label={`Preview ${command} sequence on MacBook`} onClick={()=>{runCommand.current?.(command);if(terminalStatus.current)terminalStatus.current.textContent=`Selected ${command} terminal preview. ${editorState(1,1,command).terminalText}`;}}>{command}</button>)}
    <a href="/assets/models/macbook-pro/credits.html" target="_blank" rel="noreferrer">Model credit ↗</a>
    <span ref={terminalStatus} className="sr-only" role="status" />
  </div></>;
}
