import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {atelier} from './atelierTokens';
import {atelierTimeline} from './atelierTimeline';
import {smooth} from './journey';
import type {createDeveloperUniverse} from './developerUniverse';

/** V13 surroundings adapter. The frozen laptop factory/timeline/camera are never rewritten. */
export function createAtelierWorld(legacy:ReturnType<typeof createDeveloperUniverse>) {
  const scene=new T.Scene();scene.fog=new T.Fog(atelier.obsidian,35,85);
  const group=new T.Group();scene.add(group);
  const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>(),instances:T.InstancedMesh[]=[];
  const env=((legacy.laptop.children[0] as T.Mesh).material as T.MeshStandardMaterial).envMap;
  const metal=new T.MeshStandardMaterial({color:atelier.titanium,metalness:.75,roughness:.28,envMap:env,envMapIntensity:.65});
  const carbon=new T.MeshStandardMaterial({color:atelier.graphite,metalness:.5,roughness:.4,envMap:env});
  const glass=new T.MeshStandardMaterial({color:atelier.glass,metalness:.3,roughness:.24,transparent:true,opacity:.8,envMap:env});
  const copper=new T.MeshBasicMaterial({color:atelier.copper,transparent:true,opacity:.75});
  const teal=new T.MeshBasicMaterial({color:atelier.teal,transparent:true,opacity:.65});
  const lineMaterial=new T.LineBasicMaterial({color:atelier.teal,transparent:true,opacity:.46});
  const box=new RoundedBoxGeometry(1,1,1,2,.07);geometries.add(box);
  const mesh=(parent:T.Object3D,geometry:T.BufferGeometry,material:T.Material,pos:number[],size=[1,1,1])=>{
    geometries.add(geometry);materials.add(material);const m=new T.Mesh(geometry,material);m.position.fromArray(pos);m.scale.fromArray(size);parent.add(m);return m;
  };
  const slab=(parent:T.Object3D,mat:T.Material,pos:number[],size:number[])=>mesh(parent,box,mat,pos,size);
  const instanced=(parent:T.Object3D,geometry:T.BufferGeometry,material:T.Material,count:number)=>{
    geometries.add(geometry);materials.add(material);const m=new T.InstancedMesh(geometry,material,count);parent.add(m);instances.push(m);m.frustumCulled=false;return m;
  };
  const dummy=new T.Object3D();
  const place=(m:T.InstancedMesh,i:number,pos:number[],size:number[])=>{dummy.position.fromArray(pos);dummy.rotation.set(0,0,0);dummy.scale.fromArray(size);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);};
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;const ctx=canvas.getContext('2d')!;
  const labels=[['REST / API','GET /projects   200 OK'],['TERMINAL','build → test → release'],['FRONTEND','React / Next.js'],['BACKEND','Node.js / NestJS'],['AUTHENTICATION','JWT / role-based access'],['DATABASE','PostgreSQL / Prisma'],['MONITOR','requests / latency / health'],['APPLICATION','typed / tested / connected'],['CODE','source / revision'],['BUILD','compile / artifact'],['TEST','unit / integration'],['VERIFY','schema / contracts'],['DEPLOY','release / infrastructure'],['PRODUCTION','ready / connected'],['{ }    </>    [ ]','types / services / data'],['ENGINEERING SYSTEM','interface → service → storage']];
  labels.forEach((lines,i)=>{ctx.fillStyle=atelier.copper;ctx.fillRect(0,i*64+6,2,50);ctx.font='600 34px "IBM Plex Mono",monospace';ctx.fillText(lines[0],14,i*64+36);ctx.fillStyle=atelier.porcelain;ctx.font='14px "IBM Plex Mono",monospace';ctx.fillText(lines[1],14,i*64+58);});
  const atlas=new T.CanvasTexture(canvas);atlas.colorSpace=T.SRGBColorSpace;textures.add(atlas);
  const ink=new T.MeshBasicMaterial({map:atlas,transparent:true,depthWrite:false,toneMapped:false});materials.add(ink);
  const label=(parent:T.Object3D,row:number,pos:number[],width=2.8,height=.48)=>{
    const geometry=new T.PlaneGeometry(width,height),uv=geometry.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setY(i,1-(row+1-uv.getY(i))/16);
    return mesh(parent,geometry,ink,pos);
  };
  const panel=(parent:T.Object3D,row:number,pos:number[],width=2.8)=>{
    const g=new T.Group();g.position.fromArray(pos);parent.add(g);slab(g,glass,[0,0,0],[width+.2,.9,.08]);label(g,row,[0,0,.06],width,.58);return g;
  };
  // Workstation: a titanium dais, server block, and a quiet mechanical-keyboard rib structure.
  const station=new T.Group();group.add(station);
  slab(station,carbon,[0,-1.8,0],[8.3,.22,5]);
  const ribs=instanced(station,box,metal,20);for(let i=0;i<20;i++)place(ribs,i,[(i-9.5)*.33,-1.58,1.6],[.16,.16,.7]);
  const server=instanced(station,box,metal,4),lamps=instanced(station,box,teal,4);
  for(let i=0;i<4;i++){place(server,i,[-3.1,-.6+i*.38,-1.7],[1.2,.28,1.5]);place(lamps,i,[-2.65,-.55+i*.38,-.93],[.12,.045,.025]);}
  const workstationPanels=[panel(station,0,[-3.3,2.5,-2],2.2),panel(station,1,[3.35,1.7,-2.3],2.2),panel(station,5,[3.3,.4,-2.4],2.2)];
  // Code rings are physical frames in depth, rather than an unbounded particle field.
  const portal=new T.Group();group.add(portal);portal.position.set(0,1,-2.6);
  const torus=new T.TorusGeometry(1,.018,6,64);geometries.add(torus);
  const rings=Array.from({length:5},(_,i)=>{const ring=mesh(portal,torus,i%2?metal:copper,[0,0,-i*2.9]);ring.scale.set(2.7,1.85,1);return ring;});
  const fragments=Array.from({length:6},(_,i)=>{const g=panel(group,i%2?14:0,[Math.sin(i*2.2)*4.2,Math.cos(i*2.2)*2.6,-10-i*2.6],2.2);g.rotation.y=Math.sin(i)*.2;return g;});
  // Foundry: real chassis, pins, service racks and data volumes converge on a common bus.
  const system=new T.Group();system.position.set(0,0,-27);group.add(system);
  const moduleRows=[2,3,0,4,5,7];
  const modules=moduleRows.map((row,i)=>{
    const g=new T.Group();system.add(g);slab(g,carbon,[0,0,0],[2.5,1.1,1.3]);slab(g,metal,[0,-.58,.1],[2.65,.13,1.55]);label(g,row,[0,.05,.67],2.25,.48);
    const rail=slab(g,copper,[0,.42,.69],[2.1,.025,.025]);rail.name='interface-bus';
    return {g,from:new T.Vector3((i%3-1)*4.8,(Math.floor(i/3)-.5)*4,Math.sin(i*1.9)*2.8),to:new T.Vector3((i%3-1)*3.1,(Math.floor(i/3)-.5)*2.2,0)};
  });
  const cylinder=new T.CylinderGeometry(.75,.75,.28,24);geometries.add(cylinder);
  const database=new T.Group();system.add(database);for(let i=0;i<4;i++){mesh(database,cylinder,metal,[0,i*.34,0]);const ring=mesh(database,torus,teal,[0,i*.34+.15,0]);ring.scale.setScalar(.75);ring.rotation.x=Math.PI/2;}
  const wireGeo=new T.CylinderGeometry(.018,.018,1,6);geometries.add(wireGeo);
  const links=instanced(system,wireGeo,copper,9),packets=instanced(system,box,teal,9);
  // Deployment engine: six physical gates share the same moving application components.
  const engine=new T.Group();system.add(engine);engine.position.set(0,-3.2,1);
  const gates=Array.from({length:6},(_,i)=>{
    const g=new T.Group();engine.add(g);g.position.x=(i-2.5)*2.1;
    slab(g,metal,[0,0,0],[1.6,.18,1.4]);slab(g,carbon,[0,.6,-.4],[1.5,1.1,.3]);label(g,8+i,[0,.66,-.23],1.35,.36);return g;
  });
  const pipeline=instanced(engine,box,copper,5);for(let i=0;i<5;i++)place(pipeline,i,[(i-2)*2.1,-.05,0],[.6,.045,.06]);
  // Observatory: geodesic network, orbital routes, monitoring windows, server infrastructure.
  const observatory=new T.Group();system.add(observatory);observatory.position.y=.9;
  const sphereGeo=new T.IcosahedronGeometry(2.7,2),edges=new T.EdgesGeometry(sphereGeo,1);sphereGeo.dispose();geometries.add(edges);materials.add(lineMaterial);
  const globe=new T.LineSegments(edges,lineMaterial);observatory.add(globe);
  const orbit=new T.Group();observatory.add(orbit);for(let i=0;i<3;i++){const r=mesh(orbit,torus,i===1?copper:teal,[0,0,0]);r.scale.setScalar(3.1);r.rotation.set(i*.8,.4+i*.5,i*.6);}
  const network=instanced(observatory,box,teal,12);
  for(let i=0;i<12;i++){const a=i*2.39996,y=(i/11-.5)*4.5,r=Math.sqrt(Math.max(0,7.84-y*y));place(network,i,[Math.cos(a)*r,y,Math.sin(a)*r],[.1,.1,.1]);}
  const monitors=[panel(system,6,[-4.1,3.1,0],2.3),panel(system,13,[4.1,3.1,0],2.3)];
  const observatoryInfrastructure=new T.Group();system.add(observatoryInfrastructure);
  const obsServers=instanced(observatoryInfrastructure,box,metal,6),obsLights=instanced(observatoryInfrastructure,box,teal,6);
  for(let i=0;i<6;i++){const x=i<3?-4.8:4.8,y=-2+(i%3)*.44;place(obsServers,i,[x,y,-1],[1.4,.32,1.6]);place(obsLights,i,[x+.45,y+.06,-.18],[.13,.05,.025]);}
  scene.add(new T.HemisphereLight(atelier.porcelain,atelier.obsidian,1.8));
  const key=new T.DirectionalLight(atelier.copper,2.8);key.position.set(-6,8,10);scene.add(key);
  const fill=new T.DirectionalLight(atelier.teal,1.2);fill.position.set(7,4,-15);scene.add(fill);
  // Legacy geometry is retained and disposed by its original owner; only unprotected decor is replaced.
  const core=new Set(legacy.laptop.children.slice(0,6));
  const oldFloor=legacy.group.children[3] as T.Mesh;
  const floorMaterial=(oldFloor.material as T.MeshStandardMaterial).clone();floorMaterial.color.set(atelier.obsidian);materials.add(floorMaterial);oldFloor.material=floorMaterial;
  const frameUniform={value:new T.Vector4()},feather={value:18};
  const baseOpacity=new Map<T.Material,number>();materials.forEach(mat=>{
    baseOpacity.set(mat,mat.opacity);mat.transparent=true;
    mat.onBeforeCompile=shader=>{shader.uniforms.uAtelierFrame=frameUniform;shader.uniforms.uAtelierFeather=feather;shader.fragmentShader='uniform vec4 uAtelierFrame;uniform float uAtelierFeather;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','vec2 edge=min(gl_FragCoord.xy-uAtelierFrame.xy,uAtelierFrame.xy+uAtelierFrame.zw-gl_FragCoord.xy);diffuseColor.a*=smoothstep(0.,uAtelierFeather,min(edge.x,edge.y));\n#include <opaque_fragment>');};
  });
  const axis=new T.Vector3(0,1,0),a=new T.Vector3(),b=new T.Vector3(),direction=new T.Vector3();let disposed=false;
  return {scene,
    setFrame(x:number,y:number,w:number,h:number,dpr:number){frameUniform.value.set(x*dpr,y*dpr,w*dpr,h*dpr);feather.value=18*dpr;},
    update(p:number,mobile:boolean){
      const s=atelierTimeline(p);group.visible=s.presence>0;
      legacy.laptop.children.forEach(o=>{if(!core.has(o))o.visible=false;});legacy.group.children[1].visible=false;legacy.group.children[2].visible=false;
      materials.forEach(m=>{m.opacity=baseOpacity.get(m)!*s.presence;m.depthWrite=s.presence>.98&&m!==ink;});
      if(!group.visible)return s;
      const workstationExit=1-smooth((p-3.35)/.5);station.scale.setScalar(Math.max(.001,workstationExit));station.visible=workstationExit>.001;
      workstationPanels.forEach((g,i)=>{g.scale.setScalar(Math.max(.001,s.awaken*(mobile?.75:1)));g.rotation.y=(i?-.1:.1);});
      const ringWeight=s.portal*(1-smooth((p-4.05)/.4));portal.scale.setScalar(.001+ringWeight);portal.visible=ringWeight>.001;rings.forEach((r,i)=>{r.rotation.z=s.portal*(i%2?.16:-.12);});
      fragments.forEach((g,i)=>{g.visible=s.portal>.01&&(!mobile||i%2===0);g.scale.setScalar(Math.max(.001,s.portal*(1-s.foundry)));g.rotation.z=(1-s.foundry)*Math.sin(i)*.06;});
      system.visible=s.portal>.01;system.scale.setScalar(.001+s.portal*.999);
      const compact=s.observatory;
      modules.forEach(({g,from,to},i)=>{g.position.lerpVectors(from,to,s.foundry);g.position.x*=1-compact*.24;g.position.y=g.position.y*(1-compact*.15)-compact*2.4;g.position.z-=compact*2.5;g.rotation.set((1-s.foundry)*.18,(1-s.foundry)*(i%2?.4:-.4),0);g.scale.setScalar(1-compact*.24);});
      database.position.set(0,-3.9,-1);database.scale.setScalar(.01+s.foundry*.99);
      for(let i=0;i<9;i++){
        a.copy(modules[i%6].g.position);b.copy(i>=6?database.position:modules[(i+1)%6].g.position);direction.subVectors(b,a);const length=direction.length();
        dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(axis,direction.normalize());dummy.scale.set(s.foundry,length,s.foundry);dummy.updateMatrix();links.setMatrixAt(i,dummy.matrix);
        dummy.quaternion.identity();dummy.position.lerpVectors(a,b,Math.max(0,Math.min(1,(p-4.15-i*.04)/.6)));dummy.scale.setScalar(.07*s.foundry);dummy.updateMatrix();packets.setMatrixAt(i,dummy.matrix);
      }links.instanceMatrix.needsUpdate=true;packets.instanceMatrix.needsUpdate=true;
      const engineWeight=smooth((p-4.5)/.25)*(1-compact);engine.scale.setScalar(Math.max(.001,engineWeight));engine.visible=engineWeight>.001;
      gates.forEach((g,i)=>{const active=smooth(s.deployment*6-i);g.position.y=active*.45;g.rotation.y=(1-active)*-.12;});
      observatory.scale.setScalar(Math.max(.001,compact));observatory.visible=compact>.001;globe.rotation.y=compact*.4+(p-5.05)*.18;network.rotation.y=(p-5.02)*.5;observatoryInfrastructure.scale.setScalar(Math.max(.001,compact));observatoryInfrastructure.visible=compact>.001;orbit.rotation.set(.15,compact*.25,.18);
      monitors.forEach(g=>{g.scale.setScalar(Math.max(.001,compact));});
      network.count=mobile?8:12;
      return s;
    },
    dispose(){if(disposed)return;disposed=true;instances.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());group.removeFromParent();},
  };
}
