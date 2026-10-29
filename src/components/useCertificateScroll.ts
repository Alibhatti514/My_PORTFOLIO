import {animate,type MotionValue} from 'motion/react';
import {useEffect,useRef,type RefObject} from 'react';
import {nearestCertificateAngle} from '../scene/certificateStack';
import {certificateScrollPhase,certificateScrollPlan,certificateScrollProgress,londonCertificateIndex,FULL_TURN,type CertificateIdentity} from '../scene/certificateScroll';

interface Options {
  host:RefObject<HTMLDivElement|null>;phase:MotionValue<number>;manualOffset:MotionValue<number>;
  certificates:readonly CertificateIdentity[];active:number;reduced:boolean;select:(index:number)=>void;
}
/** V11: phase = absolute document-scroll phase + persistent, user-controlled offset. */
export function useCertificateScroll(options:Options) {
  const latest=useRef(options);latest.current=options;
  const initialPhase=useRef(options.phase.get()),published=useRef(options.active);
  const request=useRef<(index:number)=>void>(()=>{});
  useEffect(()=>{
    const host=options.host.current,section=host?.closest<HTMLElement>('#content-credentials');
    if(!host||!section)return;
    const {phase,manualOffset}=options;
    let frame=0,start=0,end=1,base=initialPhase.current,manual=false,disposed=false;
    let rotation:{stop:()=>void}|undefined;
    const finalIndex=londonCertificateIndex(options.certificates);
    const plan=finalIndex<0?{start:initialPhase.current,end:initialPhase.current+FULL_TURN}:
      certificateScrollPlan(initialPhase.current,finalIndex,options.certificates.length);
    const publish=(index:number)=>{
      if(index===published.current)return;
      published.current=index;latest.current.select(index);
    };
    const apply=()=>{
      const effective=base+manualOffset.get();phase.set(effective);
      host.dataset.scrollPhase=String(base);host.dataset.manualOffset=String(manualOffset.get());
      if(!manual){const n=options.certificates.length;publish(((Math.round(effective/(FULL_TURN/n))%n)+n)%n);}
    };
    const stopManual=()=>{rotation?.stop();rotation=undefined;manual=false;};
    const choose=(index:number)=>{
      const n=options.certificates.length,indexInRange=((index%n)+n)%n;
      stopManual();
      const target=nearestCertificateAngle(phase.get(),indexInRange*FULL_TURN/n)-base;
      // Existing React handlers own the selected item. Don't publish another selection mid-tween.
      published.current=indexInRange;manual=true;
      if(latest.current.reduced){manualOffset.set(target);manual=false;apply();return;}
      rotation=animate(manualOffset,target,{duration:.85,ease:[.22,.72,.18,1],onComplete:()=>{
        if(disposed)return;manual=false;rotation=undefined;apply();
      }});
    };
    request.current=choose;
    const readScroll=()=>{
      frame=0;if(disposed)return;
      // A new scroll gesture takes over immediately; there is no playback after scrolling stops.
      stopManual();
      const progress=options.reduced?0:certificateScrollProgress(window.scrollY,start,end);
      base=options.reduced?initialPhase.current:certificateScrollPhase(progress,plan);
      host.dataset.scrollProgress=String(progress);apply();
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(readScroll);};
    const documentTop=(element:HTMLElement)=>{
      let y=0,node:HTMLElement|null=element;
      // Layout coordinates, independent of the global perspective transforms and sticky offsets.
      while(node){y+=node.offsetTop;node=node.offsetParent as HTMLElement|null;}
      return y;
    };
    const stage=section.querySelector<HTMLElement>('.certificate-section-stage');
    const rightStage=section.querySelector<HTMLElement>('.certificate-wheel-stage');
    const measure=()=>{
      const boundedStage=stage&&getComputedStyle(stage).display!=='contents'?stage:rightStage;
      start=documentTop(section);
      end=start+Math.max(1,section.offsetHeight-(boundedStage?.offsetHeight||innerHeight));
      host.dataset.scrollStart=String(start);host.dataset.scrollEnd=String(end);
      host.dataset.scrollTarget=finalIndex<0?'':options.certificates[finalIndex].id;
      schedule();
    };
    const click=(event:MouseEvent)=>{
      const target=event.target as Element;
      const numbered=target.closest<HTMLButtonElement>('.featured-index button');
      if(numbered){choose(Array.from(section.querySelectorAll('.featured-index button')).indexOf(numbered));return;}
      const arrow=target.closest<HTMLButtonElement>('.carousel-controls button');
      if(arrow){choose(latest.current.active+(arrow.getAttribute('aria-label')==='Next credential'?1:-1));return;}
      // Enter/Space activation of the persistent, accessible certificate buttons.
      const paper=target.closest<HTMLElement>('.circular-sheet');
      if(event.detail===0&&paper?.dataset.front==='false')choose(Number(paper.dataset.certificateIndex));
    };
    const resizeObserver=new ResizeObserver(measure);resizeObserver.observe(section);
    if(stage)resizeObserver.observe(stage);if(rightStage)resizeObserver.observe(rightStage);
    const unwatch=manualOffset.on('change',apply);
    host.dataset.rotationMode=options.reduced?'reduced':'scroll';
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure);
    window.addEventListener('pageshow',measure);
    section.addEventListener('pointerdown',stopManual,true);
    section.addEventListener('click',click,true);
    measure();
    return()=>{
      disposed=true;stopManual();cancelAnimationFrame(frame);unwatch();resizeObserver.disconnect();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);window.removeEventListener('pageshow',measure);
      section.removeEventListener('pointerdown',stopManual,true);
      section.removeEventListener('click',click,true);request.current=()=>{};
    };
  },[options.host,options.phase,options.manualOffset,options.certificates,options.reduced]);
  // Non-pointer selection changes (e.g. a programmatic navigation or assistive technology).
  useEffect(()=>{if(options.active!==published.current)request.current(options.active);},[options.active]);
}
