import * as T from 'three';

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

export function createGallery() {
  const scene = new T.Scene();
  scene.background = new T.Color('#f7f0e6');
  scene.fog = new T.Fog('#f7f0e6', 35, 115);
  const materials = ['#eee3d4', '#e0cfbb', '#be9b91', '#754252'].map(color =>
    new T.MeshStandardMaterial({ color, roughness: .92, metalness: 0 }));
  // World-space grain provides material variation without downloading textures.
  materials.forEach(material => {
    material.onBeforeCompile = shader => {
      shader.vertexShader = 'varying vec3 plasterPosition;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nplasterPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = 'varying vec3 plasterPosition;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nfloat grain = fract(sin(dot(floor(plasterPosition * 95.0), vec3(12.9898,78.233,37.719))) * 43758.5453);\ndiffuseColor.rgb *= .97 + grain * .045;');
    };
  });
  const geometries: T.BufferGeometry[] = [];
  const add = (geometry: T.BufferGeometry, material: T.Material, parent: T.Object3D, x=0,y=0,z=0) => {
    geometries.push(geometry);
    const mesh = new T.Mesh(geometry, material); mesh.position.set(x,y,z);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  add(new T.BoxGeometry(200, 1, 340), materials[0], scene, 0,-3,-75);
  const courts: T.Group[] = [];
  // Seven linked courts share a ground plane. Their open sides alternate along the route.
  // Walls, stepped foundations and cantilevered roofs belong to the same architecture.
  for (let i = 0; i < 7; i++) {
    const court = new T.Group(); court.position.set(i % 2 ? 12 : -12, -2, 5-i*28);
    scene.add(court); courts.push(court);
    const wall = add(curvedVolume(13 + (i%3)*2, 1.8, 2.1, 12 + (i%2)*5), materials[i===3||i===5?2:0], court);
    wall.rotation.y = i%2 ? -Math.PI*.15 : Math.PI*.85;
    const foundation = add(curvedVolume(10, 7, 2.45, 1.4), materials[1], court, 0,.1,0);
    foundation.rotation.y = wall.rotation.y;
    const terrace = add(curvedVolume(8, 8.5, 2.3, .7), materials[0], court, 0,1.5,0);
    terrace.rotation.y = wall.rotation.y;
    // A broad solid roof gives real near-plane occlusion as the camera enters each court.
    if (i===1||i===3||i===5) {
      const roof = add(curvedVolume(11, 9, 1.7, .7), materials[1], court, 0,13,0);
      roof.rotation.y = wall.rotation.y;
    }
    const returnWall = add(new T.BoxGeometry(2.4, 6, 6), materials[1], court, i%2?-24:24,1,-9);
    returnWall.rotation.y = i%2?.32:-.32;
  }
  const sky = new T.HemisphereLight('#fffaf1', '#b39586', 2.1); scene.add(sky);
  const key = new T.DirectionalLight('#fff6e7', 3); key.position.set(-18,30,16);
  key.castShadow = true; key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera, {left:-35,right:35,top:35,bottom:-35,near:1,far:100});
  key.shadow.radius=4; key.shadow.bias=-.001; key.shadow.normalBias=.04; scene.add(key);scene.add(key.target);
  const fill = new T.DirectionalLight('#e6c3b6', .7); fill.position.set(14,8,-20);scene.add(fill);
  return {scene, courts, key, geometries, materials,
    dispose() { geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); key.shadow.dispose(); } };
}
