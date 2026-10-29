import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { certificateForegroundWeight } from '../scene/certificateScroll';
import { useCertificateScroll } from './useCertificateScroll';
import type { Credential } from './CredentialPreview';

function RadialSheet({certificate,index,active,count,width,height,compact,phase,reduced,inspect,select}: {
  certificate:Credential;index:number;active:number;count:number;width:number;height:number;compact:boolean;phase:MotionValue<number>;
  reduced:boolean;inspect:(c:Credential)=>void;select:(index:number)=>void;
}) {
  const front=index===active;
  const [hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
  const attention=useMotionValue(0), engaged=!front&&(hovered||focused);
  useEffect(()=>{const animation=animate(attention,engaged?1:0,{duration:reduced?0:.5,ease:[.22,.72,.18,1]});return()=>animation.stop();},[attention,engaged,reduced]);
  const angle=useTransform(()=>index*2*Math.PI/count-phase.get()+Math.PI/2);
  // One shared phase preserves all nine 40-degree gaps on every animation frame.
  const x=useTransform(()=>Math.cos(angle.get())*Math.min(width,height)*(compact?.31:.33));
  const y=useTransform(()=>Math.sin(angle.get())*Math.min(width,height)*(compact?.31:.33));
  const displayProminence=useTransform(()=>certificateForegroundWeight(index*2*Math.PI/count-phase.get(),count));
  const z=useTransform(()=>10+Math.cos(angle.get())*6*(1-displayProminence.get())+displayProminence.get()*70+attention.get()*30*(1-displayProminence.get()));
  const scale=useTransform(()=>.5263157895+displayProminence.get()*(compact?.5263157895:.4736842105));
  const paperScale=useTransform(()=>1+attention.get()*.04*(1-displayProminence.get()));
  const rotateX=useTransform(()=>(-Math.sin(angle.get())*8*(1-displayProminence.get()))*(1-attention.get())-displayProminence.get());
  const rotateY=useTransform(()=>(-Math.cos(angle.get())*10*(1-displayProminence.get()))*(1-attention.get())-displayProminence.get()*2);
  const rotateZ=useTransform(()=>{
    const tangent=angle.get()*180/Math.PI+90;
    // Straighten before reaching full scale, keeping the passing paper inside V9's envelope.
    const revealed=1-Math.pow(1-displayProminence.get(),3);
    const upright=revealed+(1-revealed)*attention.get();
    const canonical=Math.atan2(Math.sin(tangent*Math.PI/180),Math.cos(tangent*Math.PI/180))*180/Math.PI;
    return canonical*(1-upright);
  });
  const shadow=useTransform(attention,[0,1],['0 1px 0 #dedbd5,0 3px 5px #581c3218,0 12px 24px #581c321a','0 1px 0 #dedbd5,0 7px 12px #581c3222,0 21px 32px #581c3229']);
  return <motion.button type="button"
    className={`paper-sheet circular-sheet ${front?'sheet-front':'sheet-orbit'}`}
    data-certificate={certificate.id} data-certificate-index={index} data-front={front} data-engaged={engaged}
    style={{x,y,z,scale,zIndex:front?20:engaged?10:1}}
    transformTemplate={(_,transform)=>`translate(-50%, -50%) ${transform==='none'?'':transform}`}
    aria-label={front?`Inspect ${certificate.title} certificate`:`Select ${certificate.title}, ${certificate.issuer} certificate`}
    aria-pressed={front}
    onPointerEnter={e=>{if(e.pointerType==='mouse'&&matchMedia('(hover: hover) and (pointer: fine)').matches)setHovered(true);}}
    onPointerLeave={()=>setHovered(false)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
    onClick={e=>{if(e.detail===0){if(front)inspect(certificate);else select(index);}}}>
    <motion.span className="certificate-paper" style={{rotateX,rotateY,rotateZ,scale:paperScale,boxShadow:front?undefined:shadow}}>
    <img src={certificate.preview} alt={front?`Original ${certificate.issuer} certificate: ${certificate.title}`:''}
      loading="lazy" decoding="async" draggable="false"/>
    </motion.span>
  </motion.button>;
}

export function CertificateSheets({certificates,active,reduced,inspect,select}: {
  certificates:Credential[];active:number;reduced:boolean;inspect:(c:Credential)=>void;select:(index:number)=>void;
}) {
  const phase=useMotionValue(active*2*Math.PI/certificates.length),manualOffset=useMotionValue(0);
  const ref=useRef<HTMLDivElement>(null),[size,setSize]=useState({width:0,height:0,compact:innerWidth<760});
  useCertificateScroll({host:ref,phase,manualOffset,certificates,active,reduced,select});
  useLayoutEffect(()=>{
    const observer=new ResizeObserver(([entry])=>{
      const {width,height}=entry.contentRect;
      setSize({width,height,compact:innerWidth<760});
      ref.current?.parentElement?.style.setProperty('--certificate-caption-y',`${height/2+Math.min(width,height )*.56+8}px`);
    });
    observer.observe(ref.current!);return()=>observer.disconnect();
  },[]);
  return <div ref={ref} style={{"--wheel-paper-width":`${Math.min(size.width,size.height )*.57}px`} as React.CSSProperties} className="radial-certificates">
    {certificates.map((certificate,index)=><RadialSheet key={certificate.id} certificate={certificate}
      index={index} active={active} count={certificates.length} phase={phase} {...size} reduced={reduced} inspect={inspect} select={select}/>)}
  </div>;
}
