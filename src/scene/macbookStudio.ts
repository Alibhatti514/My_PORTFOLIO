import * as T from 'three';
/** Private softboxes reflected by the hardware; no lights/materials in other scenes change. */
export function macbookStudio(renderer:T.WebGLRenderer){
 const scene=new T.Scene();scene.background=new T.Color('#080a0d');
 const geo=new T.PlaneGeometry(1,1),materials:T.Material[]=[];
 for(const[position,size,color]of[[[-5,5,3],[3,8],'#ffffff'],[[5,3,-4],[2,7],'#d9e4e6'],[[-2,7,-9],[14,10],'#fff9f0'],[[0,3,-8],[10,5],'#ffffff'],[[6,4,-4],[.3,6],'#D78B60']]as const){const mat=new T.MeshBasicMaterial({color});mat.color.multiplyScalar(color==='#D78B60'?.2:1.4);materials.push(mat);const card=new T.Mesh(geo,mat);card.position.fromArray([...position]);card.scale.set(size[0],size[1],1);card.lookAt(0,0,0);scene.add(card);}
 const generator=new T.PMREMGenerator(renderer),target=generator.fromScene(scene,.035);generator.dispose();geo.dispose();materials.forEach(m=>m.dispose());
 return target;
}
