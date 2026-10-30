import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { atelier } from './atelierTokens';

export { galleryState } from './galleryScroll';

/** Closed curved plaster volumes: curved footprint, solid caps and rounded edges. */
export function curvedVolume(radius: number, thickness: number, arc: number, height: number) {
  const shape = new T.Shape();
  const start = -arc / 2, end = arc / 2;
  shape.absarc(0, 0, radius, start, end, false);
  shape.lineTo(Math.cos(end) * (radius + thickness), Math.sin(end) * (radius + thickness));
  shape.absarc(0, 0, radius + thickness, end, start, true);
  shape.closePath();
  const geometry = new T.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true,
    bevelSegments: 3, steps: 1, bevelSize: .13, bevelThickness: .13, curveSegments: 48 });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** V13 architectural entrance. The existing galleryState camera and court motion are unchanged. */
export function createGallery() {
  const scene=new T.Scene();scene.background=new T.Color(atelier.obsidian);scene.fog=new T.Fog(atelier.obsidian,28,105);
  const materials=[
    new T.MeshStandardMaterial({color:atelier.graphite,metalness:.18,roughness:.72}),
    new T.MeshStandardMaterial({color:atelier.titanium,metalness:.78,roughness:.28}),
    new T.MeshStandardMaterial({color:atelier.copper,emissive:atelier.copper,emissiveIntensity:.55,metalness:.6,roughness:.3}),
    new T.MeshStandardMaterial({color:atelier.glass,metalness:.5,roughness:.46}),
  ];
  const box=new RoundedBoxGeometry(1,1,1,2,.06),floorGeo=new T.BoxGeometry(180,1,340);
  const geometries:T.BufferGeometry[]=[box,floorGeo];
  const floor=new T.Mesh(floorGeo,materials[0]);floor.position.set(0,-3,-75);floor.receiveShadow=true;scene.add(floor);
  const courts:T.Group[]=[],dummy=new T.Object3D(),instances:T.InstancedMesh[]=[];
  for(let i=0;i<7;i++) {
    const court=new T.Group();court.position.set(i%2?12:-12,-2,5-i*28);scene.add(court);courts.push(court);
    const structure=new T.InstancedMesh(box,materials[1],12),inlay=new T.InstancedMesh(box,materials[2],8);
    structure.castShadow=true;structure.receiveShadow=true;court.add(structure,inlay);instances.push(structure,inlay);
    const cx=i%2?-12:12;
    for(let k=0;k<3;k++) {
      const z=-k*4.2,w=19-k*.8,h=14-k*.5;
      const poses=[[cx-w/2,h/2-1,z,.7,h,.85],[cx+w/2,h/2-1,z,.7,h,.85],[cx,h-1,z,w+.7,.7,.85],[cx,-.9,z,w,.45,1.3]];
      poses.forEach((v,j)=>{dummy.position.set(v[0],v[1],v[2]);dummy.scale.set(v[3],v[4],v[5]);dummy.rotation.set(0,0,0);dummy.updateMatrix();structure.setMatrixAt(k*4+j,dummy.matrix);});
    }
    for(let k=0;k<8;k++) {
      dummy.position.set(cx+(k%2?1:-1)*8.7,5+(k%4)*1.4,-Math.floor(k/2)*3.1);
      dummy.scale.set(.055,4.5,.09);dummy.updateMatrix();inlay.setMatrixAt(k,dummy.matrix);
    }
    const plinth=new T.Mesh(box,materials[3]);plinth.position.set(cx,-.5,-5);plinth.scale.set(23,.5,18);plinth.receiveShadow=true;court.add(plinth);
  }
  scene.add(new T.HemisphereLight(atelier.porcelain,atelier.obsidian,1.4));
  const key=new T.DirectionalLight(atelier.copper,2.8);key.position.set(-18,30,16);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:1,far:100});key.shadow.bias=-.001;key.shadow.normalBias=.04;scene.add(key,key.target);
  const fill=new T.DirectionalLight(atelier.teal,1.1);fill.position.set(14,8,-20);scene.add(fill);
  return{scene,courts,key,geometries,materials,dispose(){instances.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());key.shadow.dispose();}};
}
