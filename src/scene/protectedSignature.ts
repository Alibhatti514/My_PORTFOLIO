import type { Group, Object3D, Mesh } from 'three';
/** Read-only audit of the frozen laptop core: chassis/deck/trackpad/keys/legends/hinge. */
export function protectedLaptopSignature(laptop:Group) {
  const read=(o:Object3D):unknown=>{
    const mesh=o as Mesh;
    return {type:o.type,position:o.position.toArray(),rotation:o.rotation.toArray(),scale:o.scale.toArray(),visible:o.visible,
      geometry:mesh.geometry?{type:mesh.geometry.type,vertices:mesh.geometry.getAttribute('position').count,index:mesh.geometry.index?.count}:undefined,
      children:o.children.map(read)};
  };
  return {position:laptop.position.toArray(),rotation:laptop.rotation.toArray(),scale:laptop.scale.toArray(),core:laptop.children.slice(0,6).map(read)};
}
