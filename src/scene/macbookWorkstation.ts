import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {developerTimeline} from './developerTimeline';
import {smooth} from './journey';
import {macbookStartup} from './macbookStartup';
import {macbookStudio} from './macbookStudio';
import {createMacbookEditor,type TerminalCommand} from './macbookEditor';
import type {createDeveloperUniverse} from './developerUniverse';

/** Licensed hardware adapter. Original procedural factory and all scroll/camera math stay intact. */
export function createMacbookWorkstation(legacy:ReturnType<typeof createDeveloperUniverse>,invalidate:()=>void,renderer:T.WebGLRenderer){
 const original=new URLSearchParams(location.search).get('laptop')==='original';
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>(),opacity=new Map<T.Material,number>();
 const draco=new DRACOLoader().setDecoderPath('/assets/models/macbook-pro/');
 const loader=new GLTFLoader().setDRACOLoader(draco),abort=new AbortController();
 const editor=createMacbookEditor(),screenTexture=new T.CanvasTexture(editor.canvas);screenTexture.colorSpace=T.SRGBColorSpace;screenTexture.flipY=true;screenTexture.anisotropy=4;textures.add(screenTexture);
 const env=((legacy.laptop.children[0] as T.Mesh).material as T.MeshStandardMaterial).envMap;
 const studio=original?null:macbookStudio(renderer),hardwareEnv=studio?.texture??env,logoGlow={value:0},logoDark=new T.Color('#101419'),logoWhite=new T.Color('#F4F0E8');let logo:T.Mesh|undefined,logoMaterial:T.MeshPhysicalMaterial|undefined;
 const screen=new T.MeshPhysicalMaterial({color:'#ffffff',map:screenTexture,emissive:'#ffffff',emissiveMap:screenTexture,emissiveIntensity:.85,metalness:0,roughness:.24,clearcoat:.5,clearcoatRoughness:.28,envMap:env,envMapIntensity:.06,toneMapped:false});materials.add(screen);
 const frame={value:new T.Vector4()},feather={value:18};let base:T.Object3D|undefined,lid:T.Object3D|undefined,loaded=false,disposed=false,lastP=-1,manual:TerminalCommand|null=null,lastState=editor.draw(0,0,null);
 const logoCenter={value:new T.Vector3()};
 // Distinct shader variants must not share Three's generated program cache entry.
 const decorate=(mat:T.Material)=>{mat.customProgramCacheKey=()=>mat.name==='Space_Black_Anodized_Aluminum'?'macbook-lid-reflection-v2':'macbook-frame-v2';opacity.set(mat,mat.opacity);if(!mat.transparent)mat.forceSinglePass=true;mat.transparent=true;mat.onBeforeCompile=shader=>{shader.uniforms.uMacbookFrame=frame;shader.uniforms.uMacbookFeather=feather;shader.fragmentShader='uniform vec4 uMacbookFrame;uniform float uMacbookFeather;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','vec2 edge=min(gl_FragCoord.xy-uMacbookFrame.xy,uMacbookFrame.xy+uMacbookFrame.zw-gl_FragCoord.xy);diffuseColor.a*=smoothstep(0.,uMacbookFeather,min(edge.x,edge.y));\n#include <opaque_fragment>');if(mat.name==='Space_Black_Anodized_Aluminum'){shader.uniforms.uLogoGlow=logoGlow;shader.uniforms.uLogoCenter=logoCenter;shader.vertexShader='varying vec3 vHardwarePosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHardwarePosition=position;');shader.fragmentShader='varying vec3 vHardwarePosition;uniform vec3 uLogoCenter;uniform float uLogoGlow;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nvec2 delta=vHardwarePosition.xy-uLogoCenter.xy;totalEmissiveRadiance+=vec3(.075)*uLogoGlow*exp(-dot(delta,delta)*5.);');}};};
 decorate(screen);
 const disposeResources=()=>{const bitmaps=new Set<ImageBitmap>();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{if(typeof ImageBitmap!=='undefined'&&t.image instanceof ImageBitmap)bitmaps.add(t.image);t.dispose();});bitmaps.forEach(image=>image.close());geometries.clear();materials.clear();textures.clear();opacity.clear();};
 const halos:T.Mesh[]=[];
 const ready=original?Promise.resolve():fetch('/assets/models/macbook-pro-studio/macbook-pro.glb',{signal:abort.signal}).then(r=>{if(!r.ok)throw Error(`MacBook asset HTTP ${r.status}`);return r.arrayBuffer();}).then(bytes=>loader.parseAsync(bytes,'/assets/models/macbook-pro-studio/')).then(gltf=>{
  gltf.scene.traverse(object=>{if(!(object instanceof T.Mesh))return;geometries.add(object.geometry);const mats=Array.isArray(object.material)?object.material:[object.material];object.material=mats.map(mat=>{materials.add(mat);for(const value of Object.values(mat))if(value instanceof T.Texture&&value!==env)textures.add(value);let finish=mat;if(mat instanceof T.MeshStandardMaterial){mat.envMap=hardwareEnv;mat.envMapIntensity=.85;if(['lmWQsEjxpsebDlK','iyDJFXmHelnMTbD','Space_Black_Anodized_Aluminum','MacBook_Apple_Logo'].includes(mat.name)){const physical=new T.MeshPhysicalMaterial({name:mat.name,color:mat.color,map:mat.map,normalMap:mat.normalMap,normalScale:mat.normalScale,metalness:.82,roughness:mat.name==='iyDJFXmHelnMTbD'?.42:.32,envMap:hardwareEnv,envMapIntensity:.85,clearcoat:.08,clearcoatRoughness:.35,side:mat.side});if(mat.name==='iyDJFXmHelnMTbD'){physical.polygonOffset=true;physical.polygonOffsetFactor=-1;physical.polygonOffsetUnits=-1;}materials.add(physical);finish=physical;}if(mat.name==='MacBook_Apple_Logo'){logo=object;logoMaterial=finish as T.MeshPhysicalMaterial;object.geometry.computeBoundingBox();object.geometry.boundingBox!.getCenter(logoCenter.value);}}decorate(finish);return finish;});if(!Array.isArray(object.material)||object.material.length===1)object.material=(object.material as T.Material[])[0];
   // The actual aluminum case/lid provide the shadow silhouette. Microscopic
   // screw/port/key meshes retain full detail without a second expensive draw.
   object.castShadow=object.name.startsWith('Object_22_')||object.name==='Object_10_lid';object.receiveShadow=true;if(object.name==='Object_123_lid'){object.material=screen;object.castShadow=false;}});
  if(disposed){disposeResources();return;}
  base=gltf.scene.getObjectByName('MacBook_Base');lid=gltf.scene.getObjectByName('MacBook_Lid');if(!base||!lid)throw Error('Licensed MacBook hinge groups missing');
  base.position.set(0,0,0);lid.position.set(0,0,0);lid.rotation.set(0,0,0);legacy.laptop.add(base);legacy.hinge.add(lid);loaded=true;invalidate();
  if(logo){logo.geometry.translate(-logoCenter.value.x,-logoCenter.value.y,-logoCenter.value.z);logo.geometry.scale(1.12,1.12,1);logo.geometry.translate(logoCenter.value.x,logoCenter.value.y,logoCenter.value.z);for(const scale of[1.035,1.075,1.13]){const geometry=logo.geometry.clone();geometry.translate(-logoCenter.value.x,-logoCenter.value.y,-logoCenter.value.z);geometries.add(geometry);const mat=new T.MeshBasicMaterial({color:'#F4F0E8',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});materials.add(mat);decorate(mat);const halo=new T.Mesh(geometry,mat);halo.position.copy(logoCenter.value);halo.position.z-=.0008;halo.scale.set(scale,scale,1);lid.add(halo);halos.push(halo);}}
 }).catch(error=>{if(!disposed)throw error;});
 return{ready,original,
  setFrame(x:number,y:number,w:number,h:number,dpr:number){frame.value.set(x*dpr,y*dpr,w*dpr,h*dpr);feather.value=18*dpr;},
  run(command:TerminalCommand){manual=command;invalidate();},
  update(p:number,mobile:boolean){
   const s=developerTimeline(p,mobile),startup=macbookStartup(p);if(original)return{kind:'original',ready:true,characters:0,terminal:'',command:null};
   legacy.hinge.rotation.x=T.MathUtils.lerp(Math.PI/2,-.1,startup.lid);logoGlow.value=startup.glow;
   if(lastP>=0&&Math.abs(p-lastP)>.001)manual=null;lastP=p;
   legacy.laptop.children.slice(0,5).forEach(o=>o.visible=false);
   legacy.hinge.children.forEach(o=>{if(o!==lid)o.visible=false;});
   // The accurate 16:10 display is taller than the old procedural screen. Resolve
   // its portal surface before the unchanged camera crosses the near plane.
   const visibility=s.presence*(1-smooth((s.portal-.72)/.28));
   if(base)base.visible=loaded&&visibility>.0001;if(lid)lid.visible=loaded&&visibility>.0001;
   materials.forEach(m=>{m.opacity=(opacity.get(m)??1)*visibility;m.depthWrite=visibility>.98;});
   if(logoMaterial){logoMaterial.color.lerpColors(logoDark,logoWhite,startup.glow);logoMaterial.emissive.copy(logoWhite);logoMaterial.emissiveIntensity=startup.glow*1.8;}
   halos.forEach((halo,i)=>{(halo.material as T.Material).opacity=visibility*startup.glow*(.065/(i+1));halo.visible=startup.glow>.001;});
   lastState=editor.draw(startup.typing,startup.terminal,manual);if(lastState.changed)screenTexture.needsUpdate=true;
   screen.opacity=visibility;screen.color.setScalar(startup.boot*.18);screen.emissiveIntensity=startup.boot*.85;
   return{kind:'macbook-pro',ready:loaded,characters:lastState.characters,terminal:lastState.terminalText,command:lastState.command,redraws:editor.redraws,hinge:legacy.hinge.rotation.x,geometryCount:geometries.size,visibility,startup};
  },
  dispose(){if(disposed)return;disposed=true;abort.abort();draco.dispose();base?.removeFromParent();lid?.removeFromParent();disposeResources();studio?.dispose();},
 };
}
