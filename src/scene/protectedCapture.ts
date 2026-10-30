import * as T from 'three';
import type {createDeveloperUniverse} from './developerUniverse';
declare global {interface Window {__captureProtectedLaptop?:()=>string}}
/** Read-only QA render: isolate the current hardware, then restore the live renderer. */
export function installProtectedCapture(renderer:T.WebGLRenderer,legacy:ReturnType<typeof createDeveloperUniverse>,camera:T.PerspectiveCamera,invalidate:()=>void,setHardwareFrame?:(x:number,y:number,w:number,h:number,dpr:number)=>void) {
  window.__captureProtectedLaptop=()=>{
    const metrics=(window as unknown as {__journeyWorld:{visualFrame:{x:number;y:number;width:number;height:number}}}).__journeyWorld;
    const frame=metrics.visualFrame;if(!frame||frame.height<4)throw new Error('Laptop is outside its visible interval');
    const width=frame.width,height=frame.height,target=new T.WebGLRenderTarget(width,height);target.texture.colorSpace=T.SRGBColorSpace;
    const visibility=new Map<T.Object3D,boolean>();
    const set=(o:T.Object3D,v:boolean)=>{visibility.set(o,o.visible);o.visible=v;};
    const viewport=renderer.getViewport(new T.Vector4()),scissor=renderer.getScissor(new T.Vector4()),scissorTest=renderer.getScissorTest(),autoClear=renderer.autoClear,previousTarget=renderer.getRenderTarget();
    try{
      legacy.group.children.forEach(o=>{if(o!==legacy.laptop&&!(o instanceof T.Light))set(o,false);});legacy.laptop.children.slice(6).forEach(o=>{if(o.name!=='MacBook_Base')set(o,false);});
      legacy.setFrame(0,0,width,height,1);setHardwareFrame?.(0,0,width,height,1);renderer.setRenderTarget(target);renderer.setViewport(0,0,width,height);renderer.setScissorTest(false);renderer.autoClear=true;renderer.clear();renderer.render(legacy.scene,camera);
      const pixels=new Uint8Array(width*height*4);renderer.readRenderTargetPixels(target,0,0,width,height,pixels);
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d')!,data=ctx.createImageData(width,height);
      for(let y=0;y<height;y++)data.data.set(pixels.subarray((height-1-y)*width*4,(height-y)*width*4),y*width*4);ctx.putImageData(data,0,0);return canvas.toDataURL();
    }finally{
      visibility.forEach((v,o)=>o.visible=v);renderer.setRenderTarget(previousTarget);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);renderer.autoClear=autoClear;
      legacy.setFrame(frame.x,innerHeight-frame.y-frame.height,width,height,renderer.getPixelRatio());setHardwareFrame?.(frame.x,innerHeight-frame.y-frame.height,width,height,renderer.getPixelRatio());target.dispose();invalidate();
    }
  };
  return()=>{delete window.__captureProtectedLaptop;};
}
