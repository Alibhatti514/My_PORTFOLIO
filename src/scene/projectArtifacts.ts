import * as T from 'three';
import { clamp } from './journey';

/** Original artwork becomes a real, depth-tested scene surface; all text stays semantic HTML. */
export function projectArtifacts(scene: T.Scene, invalidate: () => void) {
  let disposed = false;
  const loader = new T.TextureLoader();
  const entries = Array.from(document.querySelectorAll<HTMLImageElement>('.project-object img')).map((image, i) => {
    const geometry = new T.PlaneGeometry(1, 1);
    const material = new T.MeshBasicMaterial({ transparent:true, depthWrite:false, side:T.DoubleSide, toneMapped:false });
    // Preserve the approved SVG identity-ink treatment of the original GOLDADAN artwork.
    if (i === 1) material.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
        '#include <map_fragment>\ndiffuseColor.a *= min(1.0, 2.0 * (diffuseColor.r + diffuseColor.g + diffuseColor.b));');
    };
    const mesh = new T.Mesh(geometry, material); mesh.visible=false; scene.add(mesh);
    const texture = loader.load(image.src, () => {
      if (disposed) { texture.dispose(); return; }
      texture.colorSpace=T.SRGBColorSpace; material.map=texture; material.needsUpdate=true;
      image.style.opacity='0'; invalidate();
    });
    return {image, geometry, material, mesh, texture, i};
  });
  const forward = new T.Vector3(), ray = new T.Vector3();
  return {
    update(camera:T.PerspectiveCamera, p:number) {
      camera.updateMatrixWorld(); camera.getWorldDirection(forward);
      for (const {image, mesh, material, i} of entries) {
        const d = i-clamp(p-3,0,2), opacity=clamp((1-Math.abs(d))*1.8);
        mesh.visible=!!material.map && p>2.2 && p<5.8 && opacity>.001;
        if (!mesh.visible) continue;
        const box=image.getBoundingClientRect(), ratio=image.naturalWidth/image.naturalHeight;
        let w=box.width, h=w/ratio; if(h>box.height){h=box.height;w=h*ratio;}
        const depth=3+Math.abs(d)*3;
        ray.set((box.x+box.width/2)/innerWidth*2-1,1-(box.y+box.height/2)/innerHeight*2,.5).unproject(camera).sub(camera.position).normalize();
        mesh.position.copy(camera.position).addScaledVector(ray,depth/ray.dot(forward));
        const units=2*Math.tan(T.MathUtils.degToRad(camera.fov/2))*depth/innerHeight;
        mesh.scale.set(w*units,h*units,1);
        mesh.quaternion.copy(camera.quaternion);mesh.rotateY(d*-.35);mesh.rotateX(d*.12);
        material.opacity=opacity;
      }
    },
    dispose(){disposed=true;entries.forEach(({image,mesh,geometry,material,texture})=>{image.style.opacity='';scene.remove(mesh);geometry.dispose();material.dispose();texture.dispose();});},
  };
}
