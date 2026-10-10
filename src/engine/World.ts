import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BEAM_COUNT, beamPoses, cameras } from '../scene/poses';
import { createInstallations } from '../scene/installations';
import type { Installation } from '../scene/installations';
import { Portrait } from '../scene/Portrait';
import { prepareTextures } from '../scene/primitives';
import { getScrollState, smooth } from './scroll';
import { FrameProfiler } from './Profile';

export interface WorldMetrics { chapter:number;progress:number;drawCalls:number;triangles:number;points:number;fps:number;ready:boolean;quality:string }
declare global { interface Window { __portfolio?: WorldMetrics } }

export class World {
  private renderer: THREE.WebGLRenderer;
  private environmentTarget:THREE.WebGLRenderTarget;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40,1,.1,120);
  private stage = new THREE.Group();
  private beams: THREE.InstancedMesh;
  private portrait: Portrait;
  private installations: Installation[]=[];
  private frame = 0;
  private disposed=false;
  private mobile=false;
  private reduced=false;
  private pointer=new THREE.Vector2();
  private hover: string|null=null;
  private interactions: Record<number,number>={};
  private dummy=new THREE.Object3D();
  private color=new THREE.Color();
  private cameraFrom=new THREE.Vector3();
  private cameraTo=new THREE.Vector3();
  private point=new THREE.Vector3();
  private metrics:WorldMetrics={chapter:0,progress:0,drawCalls:0,triangles:0,points:0,fps:60,ready:false,quality:'high'};
  private previousTime=-1;
  private sampleTime=0;
  private frames=0;
  private unsubscribe:()=>void;
  private onState:(chapter:number,progress:number)=>void;
  private profiler?: FrameProfiler;
  constructor(canvas:HTMLCanvasElement, onState:(chapter:number,progress:number)=>void, onReady:()=>void, onError:()=>void) {
    this.onState=onState;
    this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    if(new URLSearchParams(location.search).get('profile')==='1')this.profiler=new FrameProfiler();
    this.renderer.setClearColor('#f7f9ff',0);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.05;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.scene.fog=new THREE.Fog('#f2f4fc',16,48);
    const pmrem=new THREE.PMREMGenerator(this.renderer);const room=new RoomEnvironment();
    this.environmentTarget=pmrem.fromScene(room,.04);this.scene.environment=this.environmentTarget.texture;room.dispose();pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight('#ffffff','#a1a2bc',1.15));
    const key=new THREE.DirectionalLight('#ffffff',2.4);key.position.set(-4,9,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);
    Object.assign(key.shadow.camera,{left:-13,right:13,top:11,bottom:-10,near:.1,far:35});key.shadow.bias=-.0003;key.shadow.normalBias=.025;this.scene.add(key);
    const rim=new THREE.DirectionalLight('#b7c6ff',1.65);rim.position.set(6,4,-3);this.scene.add(rim);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#f3f5fc',roughness:.57,metalness:.1}));
    floor.rotation.x=-Math.PI/2;floor.position.y=-3.42;floor.receiveShadow=true;this.scene.add(floor);
    // A quiet floor grid gives a spatial horizon, not a floating decorative backdrop.
    const grid=new THREE.GridHelper(160,64,'#d9dfef','#e1e5f1');grid.position.y=-3.415;grid.material.transparent=true;grid.material.opacity=.48;this.scene.add(grid);
    this.scene.add(this.stage);
    const beamMaterial=new THREE.MeshStandardMaterial({roughness:.3,metalness:.48});
    this.beams=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),beamMaterial,BEAM_COUNT);this.beams.castShadow=true;this.beams.receiveShadow=true;this.beams.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.beams.frustumCulled=false;this.stage.add(this.beams);
    this.mobile=innerWidth<700;
    this.portrait=new Portrait(this.mobile?2600:6200);this.scene.add(this.portrait.group);
    const resize=()=>this.resize();const pointer=(e:PointerEvent)=>{this.pointer.set(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5);};
    const contextLost=(event:Event)=>{event.preventDefault();onError();};
    window.addEventListener('resize',resize);window.addEventListener('pointermove',pointer,{passive:true});canvas.addEventListener('webglcontextlost',contextLost);
    this.unsubscribe=()=>{window.removeEventListener('resize',resize);window.removeEventListener('pointermove',pointer);canvas.removeEventListener('webglcontextlost',contextLost);};
    this.resize();
    Promise.all([this.portrait.ready,document.fonts.ready]).then(()=>{
      if(this.disposed)return;
      const setupStart=this.profiler?performance.now():0;
      this.installations=createInstallations();this.installations.forEach(s=>this.stage.add(s.group));
      this.profiler?.event('installations-created',`${performance.now()-setupStart} ms CPU; canvas rasterization/setup included`);
      this.metrics.ready=true;this.animate(0);onReady();
    }).catch(()=>{if(!this.disposed)onError();});
  }
  setReduced(value:boolean){this.reduced=value;}
  setHover(value:string|null){this.hover=value;}
  interact(chapter:number){this.interactions[chapter]=(this.interactions[chapter]??0)+1;}
  private resize(){
    this.mobile=innerWidth<700;this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth,innerHeight,false);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.mobile?1.35:1.65));
    this.metrics.quality=this.mobile?'mobile':'high';
  }
  private animate=(time:number)=>{
    if(this.disposed)return;
    this.frame=requestAnimationFrame(this.animate);
    if(document.hidden)return;
    if(!this.sampleTime&&time>0)this.sampleTime=time;
    const updateStart=this.profiler?performance.now():0;
    const {raw,progress,chapter}=getScrollState(this.reduced);const a=Math.floor(progress),b=Math.min(12,a+1),t=progress-a;
    const tablet=!this.mobile&&innerWidth/innerHeight<1.15;
    this.stage.scale.set(this.mobile?.49:tablet?.72:1,this.mobile?.75:tablet?.88:1,this.mobile?.85:1);
    this.stage.position.y=this.mobile?-.48:0;
    for(let i=0;i<BEAM_COUNT;i++){
      const from=beamPoses[a][i],to=beamPoses[b][i];
      this.dummy.position.lerpVectors(from.position,to.position,t);
      this.dummy.scale.lerpVectors(from.scale,to.scale,t);
      // Slender profiles leave breathing room as tall and flat structures interleave.
      const bridge=Math.sin(t*Math.PI);
      this.dummy.scale.x*=1-bridge*.32;this.dummy.scale.z*=1-bridge*.4;
      if(a===7||a===8)this.dummy.position.z-=bridge*2.6;
      this.dummy.quaternion.slerpQuaternions(from.quaternion,to.quaternion,t);
      this.dummy.updateMatrix();this.beams.setMatrixAt(i,this.dummy.matrix);
      this.beams.setColorAt(i,this.color.copy(from.color).lerp(to.color,t));
    }
    this.beams.instanceMatrix.needsUpdate=true;if(this.beams.instanceColor)this.beams.instanceColor.needsUpdate=true;
    this.installations.forEach((installation,i)=>{
      const delta=progress-i,dist=Math.abs(delta),visible=dist<.9999;
      if(dist<1.7)prepareTextures(installation.group);
      installation.group.visible=visible;
      if(!visible)return;
      installation.group.traverse(object=>{
        if(object.userData.hideOnMobile)object.visible=!this.mobile;
        if(object.userData.storyLabel)object.scale.setScalar(1-smooth((dist-.10)/.34));
      });
      const scale=1-dist*.82;
      installation.group.scale.setScalar(scale);
      installation.group.position.set(delta*2.2,-dist*1.8,-dist*2.2);
      installation.group.rotation.y=-delta*.45;
      installation.update(delta,this.hover,this.reduced,this.interactions[i]??0,time);
    });
    this.portrait.update(progress,this.mobile);
    this.portrait.group.position.y=this.mobile?-.55:0;
    this.portrait.group.position.x=this.mobile?.28*Math.min(1,progress):0;
    if(this.mobile)this.portrait.group.scale.set(.74-.13*Math.min(1,progress),.74,.74);
    else if(tablet){this.portrait.group.scale.setScalar(.87);this.portrait.group.position.y=-.35;}
    this.cameraFrom.fromArray(cameras[a]);this.cameraTo.fromArray(cameras[b]);this.camera.position.lerpVectors(this.cameraFrom,this.cameraTo,t);
    if(!this.mobile&&!this.reduced)this.camera.position.z-=Math.sin(t*Math.PI)*(a===0?1.65:.42);
    if(this.mobile){this.camera.position.x*=.15;this.camera.position.y=.7;this.camera.position.z=13.6;}
    if(this.reduced){this.camera.position.set(0,this.mobile?.7:1.4,this.mobile?13.6:13);}
    else{this.camera.position.x+=this.pointer.x*.18;this.camera.position.y-=this.pointer.y*.08;}
    this.camera.lookAt(0,this.mobile?-.2:-.25,0);
    if(chapter===12){
      this.stage.updateMatrixWorld(true);
      this.installations[12].anchors.forEach((anchor,id)=>{
        this.point.set(0,.05,.27);anchor.localToWorld(this.point);this.point.project(this.camera);
        const element=document.querySelector<HTMLElement>(`[data-social="${id}"]`);
        if(element){element.style.left=`${(this.point.x*.5+.5)*innerWidth}px`;element.style.top=`${(-this.point.y*.5+.5)*innerHeight}px`;}
      });
    }
    const renderStart=this.profiler?performance.now():0;
    this.renderer.render(this.scene,this.camera);
    this.profiler?.record(time,renderStart-updateStart,performance.now()-renderStart,raw,progress,chapter,this.camera,this.renderer);
    if(time>0)this.frames++;
    if(time-this.sampleTime>1000){
      this.metrics.fps=Math.round(this.frames*1000/(time-this.sampleTime));this.frames=0;this.sampleTime=time;
      if(this.metrics.fps<34&&time>4000&&this.renderer.getPixelRatio()>1.05){this.renderer.setPixelRatio(1);this.metrics.quality='adaptive';}
    }
    this.metrics.chapter=chapter;this.metrics.progress=progress;this.metrics.drawCalls=this.renderer.info.render.calls;this.metrics.triangles=this.renderer.info.render.triangles;this.metrics.points=this.renderer.info.render.points;
    window.__portfolio=this.metrics;
    if(chapter!==Math.round(this.previousTime)||Math.abs(progress-this.previousTime)>.0005){this.onState(chapter,progress);this.previousTime=progress;}
  };
  dispose(){
    this.disposed=true;cancelAnimationFrame(this.frame);this.unsubscribe();this.portrait.dispose();this.profiler?.dispose();
    const geometries=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
    this.scene.traverse(o=>{o.userData.disposed=true;const light=o as THREE.DirectionalLight;if(light.shadow)light.shadow.dispose();const mesh=o as THREE.Mesh;if(mesh.geometry)geometries.add(mesh.geometry);if(mesh.material){for(const mat of Array.isArray(mesh.material)?mesh.material:[mesh.material]){mats.add(mat);for(const v of Object.values(mat))if(v instanceof THREE.Texture)textures.add(v);if(mat instanceof THREE.ShaderMaterial)for(const v of Object.values(mat.uniforms))if(v.value instanceof THREE.Texture)textures.add(v.value);}}});
    geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());this.environmentTarget.dispose();this.renderer.dispose();
  }
}
