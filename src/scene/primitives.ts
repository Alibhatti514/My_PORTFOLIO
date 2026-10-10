import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const textureLoader = new THREE.TextureLoader();
const geometry = new RoundedBoxGeometry(1,1,1,3,.07);
export const materials = {
  porcelain: new THREE.MeshStandardMaterial({color:'#f3f4fb', roughness:.32, metalness:.22}),
  lavender: new THREE.MeshStandardMaterial({color:'#b8acf0', roughness:.24, metalness:.43}),
  chrome: new THREE.MeshStandardMaterial({color:'#dbe4f1', roughness:.23, metalness:.78}),
  ink: new THREE.MeshStandardMaterial({color:'#343b64', roughness:.35, metalness:.38}),
  cyan: new THREE.MeshStandardMaterial({color:'#91d5e3', roughness:.25, metalness:.42}),
};
export function box(parent: THREE.Object3D, size: number[], position: number[], material: THREE.Material = materials.porcelain, rotation?: number[]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(size[0],size[1],size[2]); mesh.position.set(position[0],position[1],position[2]);
  if(rotation) mesh.rotation.set(rotation[0],rotation[1],rotation[2]);
  mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
export function line(parent: THREE.Object3D, points: number[][], color = '#929ecc', radius=.017) {
  const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)), false, 'catmullrom', .01);
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(8,points.length*6),radius,6,false),new THREE.MeshStandardMaterial({color,roughness:.5}));
  parent.add(mesh); return curve;
}
export function textPlane(parent: THREE.Object3D, text: string, position: number[], width=2, color='#20243b', options: {height?:number;font?:string;background?:string;align?:CanvasTextAlign} = {}) {
  const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=options.height?Math.round(options.height/width*1024):256;
  const ctx=canvas.getContext('2d')!;
  if(options.background){ctx.fillStyle=options.background;ctx.fillRect(0,0,canvas.width,canvas.height);}
  ctx.fillStyle=color; ctx.font=options.font??'500 72px "Space Grotesk", sans-serif'; ctx.textAlign=options.align??'center'; ctx.textBaseline='middle';
  const lines=text.split('\n');lines.forEach((l,i)=>ctx.fillText(l,options.align==='left'?36:512,canvas.height/2+(i-(lines.length-1)/2)*92,960));
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*canvas.height/1024),new THREE.MeshBasicMaterial({map:tex,transparent:!options.background,depthWrite:false,side:THREE.DoubleSide}));
  mesh.userData.storyLabel=true;
  mesh.position.set(...position as [number,number,number]);parent.add(mesh);return mesh;
}
export function imagePlane(parent: THREE.Object3D, path: string, position: number[], width=1, height=width) {
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}));
  mesh.userData.assetPath=path;
  mesh.position.set(...position as [number,number,number]);parent.add(mesh);return mesh;
}
export function prepareTextures(root: THREE.Object3D) {
  root.traverse(object=>{
    if(!object.userData.assetPath||object.userData.assetRequested)return;
    object.userData.assetRequested=true;
    const mesh=object as THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>;
    textureLoader.load(object.userData.assetPath,texture=>{if(object.userData.disposed){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;mesh.material.map=texture;mesh.material.opacity=1;mesh.material.needsUpdate=true;});
  });
}
export function station(parent: THREE.Object3D, x: number, label: string, icon: string, accent=materials.lavender, y=-.55, z=0) {
  const group=new THREE.Group();group.position.set(x,y,z);parent.add(group);
  box(group,[1.45,.2,1.45],[0,-1.1,0],materials.chrome);
  box(group,[.92,1.6,.3],[0,-.25,-.16],accent,[0,.13,0]);
  imagePlane(group,`/assets/brands/${icon}.svg`,[0,.25,.04],.58);
  textPlane(group,label,[0,-.58,.08],1.45);
  return group;
}
