import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { developerTimeline } from './developerTimeline';
import { atelier } from './atelierTokens';

/** Procedural workstation and software architecture. All resources belong to this instance. */
export function createDeveloperUniverse(renderer: T.WebGLRenderer) {
  const cream = '#F6EFE4', wine = '#4B1832', rose = '#C6A18D', dark = '#2B0D1D';
  const scene = new T.Scene();
  scene.fog = new T.Fog(cream, 35, 80);
  const group = new T.Group(); group.name = 'developers-universe-v12';scene.add(group);
  const geometries = new Set<T.BufferGeometry>(), materials = new Set<T.Material>(), textures = new Set<T.Texture>();
  const pmrem = new T.PMREMGenerator(renderer), room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04); room.dispose(); pmrem.dispose();
  // V13 laptop finish only: keep the original meshes, hierarchy and timeline intact.
  const metal = new T.MeshPhysicalMaterial({color:atelier.titanium, metalness:.88, roughness:.34, anisotropy:.35, anisotropyRotation:0, clearcoat:.12, clearcoatRoughness:.4, envMapIntensity:.8, envMap:environment.texture});
  const shell = new T.MeshStandardMaterial({color:atelier.graphite, metalness:.45, roughness:.38, envMap:environment.texture});
  const ivory = new T.MeshStandardMaterial({color:atelier.porcelain, metalness:.15, roughness:.42, envMap:environment.texture});
  const glass = new T.MeshPhysicalMaterial({color:wine, metalness:.18, roughness:.24, clearcoat:.8, envMap:environment.texture, transparent:true, opacity:.86});
  const glow = new T.MeshBasicMaterial({color:rose, transparent:true, opacity:.65});
  const box = new RoundedBoxGeometry(1,1,1,2,.08); geometries.add(box);
  const mesh = (parent:T.Object3D, geo:T.BufferGeometry, mat:T.Material, pos:number[], scale=[1,1,1]) => {
    geometries.add(geo); materials.add(mat);
    const m = new T.Mesh(geo,mat); m.position.fromArray(pos);m.scale.fromArray(scale);parent.add(m);return m;
  };
  const slab = (parent:T.Object3D, mat:T.Material, pos:number[], scale:number[]) => mesh(parent,box,mat,pos,scale);
  // One shared text atlas, sampled by UVs. No per-frame canvas painting or text downloads.
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1536;
  const c=canvas.getContext('2d')!;c.fillStyle=dark;c.fillRect(0,0,768,1536);
  const labels=[
    ['ALI / workspace.tsx','export async function Application() {','  const data = await prisma.project.findMany();','  return <ProjectGrid projects={data} />;','}','// React · TypeScript · Next.js'],
    ['TERMINAL / production','$ npm run build','✓ TypeScript compiled','$ npm run test','✓ API · auth · data · interface','$ deploy --production'],
    ['01 / INTERFACE','React + Next.js','<ProjectGrid />','<AccessibleNavigation />'],
    ['02 / SERVICE','NestJS + Node.js','GET /api/projects','JWT · role-based access'],
    ['03 / DATA','PostgreSQL + Prisma','project.findMany()','schema → migration → query'],
    ['04 / QUALITY','typecheck → build → test','✓ interface    ✓ API','✓ auth         ✓ schema'],
    ['05 / DELIVERY','artifact → release','production / healthy','✓ deployment complete'],
    ['{ }     </>     [ ]','type Project = {','  id: string;','  status: "ready";','}'],
  ];
  labels.forEach((lines,i)=>{const y=i*192;c.fillStyle=rose;c.fillRect(18,y+14,3,162);lines.forEach((line,j)=>{c.font=j===0?'600 19px "IBM Plex Mono", monospace':'19px "IBM Plex Mono", monospace';c.fillStyle=j===0?rose:cream;c.fillText(line,38,y+34+j*27);});});
  const atlas=new T.CanvasTexture(canvas);atlas.colorSpace=T.SRGBColorSpace;atlas.anisotropy=4;textures.add(atlas);
  const textMat=new T.MeshBasicMaterial({map:atlas,toneMapped:false});materials.add(textMat);
  const text = (parent:T.Object3D,index:number,pos:number[],w=3.5,h=.94) => {
    const geo=new T.PlaneGeometry(w,h), uv=geo.getAttribute('uv');
    for(let i=0;i<uv.count;i++)uv.setY(i,1-(index+1-uv.getY(i))/8);
    return mesh(parent,geo,textMat,pos);
  };
  const laptop=new T.Group(); group.add(laptop);laptop.position.set(0,-.7,0);
  slab(laptop,metal,[0,0,0],[5,.16,3.15]).castShadow=true;slab(laptop,shell,[0,.09,-.15],[4.75,.035,2.7]);
  slab(laptop,metal,[0,.12,.95],[1.55,.018,.65]);
  const keyMaterial=new T.MeshStandardMaterial({color:atelier.graphite,metalness:.12,roughness:.52});materials.add(keyMaterial);
  const keys=new T.InstancedMesh(box,keyMaterial,60), dummy=new T.Object3D();materials.add(shell);
  for(let i=0;i<60;i++){dummy.position.set((i%12-5.5)*.35,.14,-.97+Math.floor(i/12)*.28);dummy.scale.set(.28,.04,.20);dummy.updateMatrix();keys.setMatrixAt(i,dummy.matrix);}laptop.add(keys);
  const legends=new T.InstancedMesh(box,ivory,60);laptop.add(legends);
  for(let i=0;i<60;i++){dummy.position.set((i%12-5.5)*.35,.164,-.97+Math.floor(i/12)*.28);dummy.scale.set(.045,.004,.018);dummy.updateMatrix();legends.setMatrixAt(i,dummy.matrix);}
  const hinge=new T.Group();hinge.position.set(0,.12,-1.43);laptop.add(hinge);
  slab(hinge,metal,[0,1.52,0],[5,3.04,.13]).castShadow=true;slab(hinge,shell,[0,1.52,.075],[4.83,2.88,.04]);
  const editorCanvas=document.createElement('canvas');editorCanvas.width=1024;editorCanvas.height=640;
  const ec=editorCanvas.getContext('2d')!;ec.fillStyle=atelier.obsidian;ec.fillRect(0,0,1024,640);
  ec.fillStyle=atelier.graphite;ec.fillRect(0,0,1024,48);ec.fillRect(0,48,185,550);
  ec.font='18px "IBM Plex Mono", monospace';ec.fillStyle=atelier.copper;
  ec.fillText('ALI / WORKSPACE',22,30);ec.fillText('workspace.tsx    ×',215,30);
  ['EXPLORER','src/','  app/','  api/','  components/','  lib/','prisma/','package.json'].forEach((v,i)=>ec.fillText(v,18,87+i*34));
  const source=['// A typed, accessible application','import { prisma } from "./lib/db";','','export async function Application() {','  const projects =','    await prisma.project.findMany();','','  return (','    <ProjectGrid','      projects={projects}','    />','  );','}'];
  source.forEach((v,i)=>{ec.fillStyle=atelier.copper;ec.fillText(String(i+1).padStart(2,' '),204,92+i*34);ec.fillStyle=i===0?atelier.teal:atelier.porcelain;ec.fillText(v,252,92+i*34);});
  ec.fillStyle=atelier.graphite;ec.fillRect(0,603,1024,37);ec.fillStyle=atelier.teal;ec.fillText('main*     TypeScript / React                    UTF-8   ✓',22,628);
  const editorTexture=new T.CanvasTexture(editorCanvas);editorTexture.colorSpace=T.SRGBColorSpace;textures.add(editorTexture);
  const screenMaterial=new T.MeshBasicMaterial({map:editorTexture,toneMapped:false});
  const display=mesh(hinge,new T.PlaneGeometry(4.53,2.56),screenMaterial,[0,1.53,.103]);
  // Reveal editor lines with an opaque screen cover; terminal and side panels emerge on scroll.
  const shutter=mesh(hinge,new T.PlaneGeometry(1,1),shell,[0,1.52,.112],[4.55,2.57,1]);
  const terminal=new T.Group();laptop.add(terminal);slab(terminal,glass,[0,0,0],[3.7,1.5,.06]);text(terminal,1,[0,0,.04],3.5,1.3);
  const satellites=[2,3,4].map(row=>{const g=new T.Group();laptop.add(g);slab(g,glass,[0,0,0],[2.6,1.12,.07]);text(g,row,[0,0,.045],2.45,.94);return g;});
  const symbols=Array.from({length:3},()=>text(laptop,7,[0,0,0],1.2,.6));
  const portal=new T.Group();portal.position.set(0,.95,-1.25);group.add(portal);
  const ringGeo=new T.TorusGeometry(1,.016,6,80);geometries.add(ringGeo);
  const rings=Array.from({length:7},(_,i)=>{const ring=mesh(portal,ringGeo,i%2?metal:glow,[0,0,-i*2.2]);ring.scale.set(2.8,1.75,1);return ring;});
  const architecture=new T.Group();architecture.position.set(0,0,-27);group.add(architecture);
  // A bounded set of meaningful modules, distributed over foreground, middle and background.
  const nodes=Array.from({length:12},(_,i)=>{
    const g=new T.Group();architecture.add(g);
    slab(g,shell,[0,0,0],[3.05,1.55,.32]);slab(g,metal,[0,-.78,0],[3.12,.035,.4]);
    text(g,2+i%5,[0,.05,.17],2.84,1.15);
    const column=i%3,row=Math.floor(i/3);
    return {g, from:new T.Vector3((column-1)*4.7+Math.sin(i*2)*.7,(row-1.5)*2.65,Math.cos(i*1.7)*3),
      to:new T.Vector3((column-1)*4.2,(row-1.5)*2.1,(column===1?-1:0))};
  });
  const db=new T.Group();architecture.add(db);
  const cylinder=new T.CylinderGeometry(1.05,1.05,.30,32);geometries.add(cylinder);
  for(let i=0;i<4;i++){mesh(db,cylinder,i%2?metal:shell,[0,i*.38,0]);const ring=mesh(db,ringGeo,glow,[0,i*.38+.16,0]);ring.rotation.x=Math.PI/2;}
  const connectionGeo=new T.CylinderGeometry(.015,.015,1,6);geometries.add(connectionGeo);
  const links=new T.InstancedMesh(connectionGeo,glow,17);architecture.add(links);
  const pulses=new T.InstancedMesh(box,ivory,17);architecture.add(pulses);materials.add(ivory);
  const axis=new T.Vector3(0,1,0),dir=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3();
  const status=new T.Group();architecture.add(status);slab(status,glass,[0,0,0],[4.5,1.8,.1]);const statusText=text(status,6,[0,0,.07],4.3,1.55);
  const infrastructure=new T.Group();architecture.add(infrastructure);
  for(let i=0;i<3;i++) {
    slab(infrastructure,shell,[0,i*.48,0],[2.4,.4,1.3]);
    slab(infrastructure,metal,[0,i*.48,.66],[2.1,.04,.02]);
    slab(infrastructure,ivory,[.9,i*.48+.1,.67],[.09,.07,.02]);
  }
  const checks=new T.InstancedMesh(box,ivory,5);architecture.add(checks);
  const floor=slab(group,shell,[0,-1.65,0],[7,.12,4.6]);floor.receiveShadow=true;
  scene.add(new T.HemisphereLight(atelier.porcelain,atelier.graphite,1.8));
  const key=new T.DirectionalLight(atelier.porcelain,2.4);key.position.set(-4,8,6);key.castShadow=true;
  key.shadow.mapSize.set(512,512);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-6,near:1,far:25});key.shadow.normalBias=.025;scene.add(key);
  const rim=new T.DirectionalLight(atelier.copper,.9);rim.position.set(5,3,-8);scene.add(rim);
  const spot=new T.SpotLight(atelier.porcelain,85,35,.7,.8,1.5);spot.position.set(1,9,5);spot.target=laptop;group.add(spot);
  // Soft contact shadow is a small procedural texture, not a full-screen postprocess.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const sc=shadowCanvas.getContext('2d')!,gradient=sc.createRadialGradient(64,64,5,64,64,64);gradient.addColorStop(0,atelier.obsidian);gradient.addColorStop(1,'transparent');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
  const shadowTexture=new T.CanvasTexture(shadowCanvas);textures.add(shadowTexture);
  const shadow=mesh(group,new T.PlaneGeometry(9,6),new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.5}),[0,-1.57,0]);shadow.rotation.x=-Math.PI/2;
  const frameUniform={value:new T.Vector4()}, featherUniform={value:20};
  const baseOpacity=new Map<T.Material,number>();materials.forEach(mat=>{
    baseOpacity.set(mat,mat.opacity);mat.transparent=true;
    mat.onBeforeCompile=shader=>{
      shader.uniforms.uVisualFrame=frameUniform;shader.uniforms.uFeather=featherUniform;
      shader.fragmentShader='uniform vec4 uVisualFrame; uniform float uFeather;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
        'vec2 edge=min(gl_FragCoord.xy-uVisualFrame.xy,uVisualFrame.xy+uVisualFrame.zw-gl_FragCoord.xy); diffuseColor.a *= smoothstep(0.,uFeather,min(edge.x,edge.y));\n#include <opaque_fragment>');
    };
  });
  let disposed=false;
  return {scene, group, geometries, materials, textures, laptop, hinge,
    setFrame(x:number,y:number,width:number,height:number,dpr:number){frameUniform.value.set(x*dpr,y*dpr,width*dpr,height*dpr);featherUniform.value=18*dpr;},
    update(p:number,mobile:boolean){
      const s=developerTimeline(p,mobile),w=s.presence;group.visible=w>0;
      materials.forEach(mat=>{mat.opacity=baseOpacity.get(mat)!*w;mat.depthWrite=w>.98;});
      if(!group.visible)return s;
      laptop.rotation.set(.03, .22*(1-s.portal)-s.lid*.15, -.025*(1-s.portal));
      laptop.position.set(0,-.7,-s.portal*1.5);
      hinge.rotation.x=T.MathUtils.lerp(Math.PI/2,-.10,s.lid);
      display.visible=s.boot>0;screenMaterial.opacity=w*s.boot;floor.scale.set(7*(1-s.portal),.12,4.6*(1-s.portal));floor.visible=s.portal<.999;shadow.visible=s.portal<.999;
      shutter.scale.y=2.57*(1-s.typing);shutter.position.y=1.52-2.57*s.typing/2;shutter.visible=s.typing<.999;
      terminal.position.set(3.2,.7+s.awakening*.5,-2.2);terminal.scale.setScalar(Math.max(.001,s.awakening*.64));
      satellites.forEach((g,i)=>{g.position.set((i===1?-1:1)*(3.0+s.awakening*.2),2.7-i*1.0,-2-i*.35);g.rotation.y=(i===1?1:-1)*.17;g.scale.setScalar(Math.max(.001,s.awakening*.68));});
      symbols.forEach((symbol,i)=>{symbol.visible=!mobile||i===0;const angle=i*Math.PI*2/3+s.awakening*.5;symbol.position.set(Math.cos(angle)*3,3.3+Math.sin(angle)*.25,-2+Math.sin(angle));symbol.scale.setScalar(.001+s.awakening);symbol.rotation.y=-angle*.12;});
      portal.position.x=0;portal.scale.setScalar(.001+s.portal*1.2);portal.visible=s.portal>.001;
      rings.forEach((r,i)=>{r.rotation.z=s.portal*.18*(i%2?1:-1);});
      architecture.visible=s.portal>0;architecture.scale.setScalar(.55+s.portal*.45);
      nodes.forEach(({g,from,to},i)=>{g.visible=!mobile||i<9;g.position.lerpVectors(from,to,s.assembly);g.rotation.set((1-s.assembly)*.12*Math.sin(i), (1-s.assembly)*.35*Math.cos(i),0);});
      db.position.set(0,-4.2,-1);db.scale.setScalar(.001+s.assembly);
      links.count=mobile?12:17;pulses.count=links.count;
      for(let i=0;i<links.count;i++){
        a.copy(nodes[i%(mobile?9:12)].g.position);
        if(i>=(mobile?9:12))b.copy(db.position);else b.copy(nodes[(i+1)%(mobile?9:12)].g.position);
        dir.subVectors(b,a);
        const length=dir.length();dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(axis,dir.normalize());dummy.scale.set(s.assembly,length,s.assembly);dummy.updateMatrix();links.setMatrixAt(i,dummy.matrix);
        dummy.quaternion.identity();dummy.position.lerpVectors(a,b,Math.min(1,Math.max(0,(s.t-3.4-i*.035)/.9)));dummy.scale.setScalar(.055*s.assembly);dummy.updateMatrix();pulses.setMatrixAt(i,dummy.matrix);
      }links.instanceMatrix.needsUpdate=true;pulses.instanceMatrix.needsUpdate=true;
      status.position.set(0,5,-1);status.scale.setScalar(.001+s.deploy);statusText.visible=s.deploy>.01;
      infrastructure.position.set(6,-4,0);infrastructure.scale.setScalar(.001+s.tests);infrastructure.visible=s.tests>0;
      for(let i=0;i<5;i++){dummy.position.set(-1.2+i*.6,3.1,-.5);dummy.scale.set(.35,.045+Math.max(0,Math.min(1,s.tests*5-i))*.32,.16);dummy.updateMatrix();checks.setMatrixAt(i,dummy.matrix);}checks.instanceMatrix.needsUpdate=true;
      spot.intensity=(55+s.boot*30+s.deploy*45)*w;
      return s;
    },
    dispose(){if(disposed)return;disposed=true;group.removeFromParent();group.traverse(o=>{if(o instanceof T.InstancedMesh)o.dispose();});key.shadow.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();},
  };
}
