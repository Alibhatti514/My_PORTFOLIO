import { useCallback, useEffect, useRef, useState } from 'react';
import { chapters } from './data/chapters';
import { Story, ReadingView, Arrow } from './components/Story';
import { ChapterButton, IconMotionContext, ResumeLink } from './components/AnimatedControls';
import { chapterStep, scrollToChapter } from './engine/scroll';
import type { World } from './engine/World';

export default function App(){
  const [active,setActive]=useState(0),[ready,setReady]=useState(false),[menu,setMenu]=useState(false);
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [reading,setReading]=useState(()=>new URLSearchParams(location.search).get('view')==='reading'||new URLSearchParams(location.search).get('webgl')==='off');
  const [failed,setFailed]=useState(()=>new URLSearchParams(location.search).get('webgl')==='off');
  const canvas=useRef<HTMLCanvasElement>(null),world=useRef<World|null>(null),dialog=useRef<HTMLDialogElement>(null),progressBar=useRef<HTMLDivElement>(null),scrollLength=useRef<HTMLDivElement>(null),activeRef=useRef(0),motionRef=useRef(reduced),skipFocus=useRef(false);
  const fail=useCallback(()=>{setFailed(true);setReading(true);},[]);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');const update=(e:MediaQueryListEvent)=>setReduced(e.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>{motionRef.current=reduced;world.current?.setReduced(reduced);},[reduced]);
  useEffect(()=>{
    if(reading||!canvas.current)return;
    let cancelled=false;setReady(false);
    import('./engine/World').then(({World})=>{
      if(cancelled||!canvas.current)return;
      try{world.current=new World(canvas.current,(chapter,progress)=>{
        if(chapter!==activeRef.current){activeRef.current=chapter;setActive(chapter);if(location.hash!==`#${chapters[chapter].id}`)history.replaceState(null,'',`#${chapters[chapter].id}`);}
        document.querySelector<HTMLElement>(`[data-chapter="${chapter}"]`)?.style.setProperty('--chapter-distance',String(progress-chapter));
        if(progressBar.current)progressBar.current.style.transform=`scaleX(${progress/12})`;
        document.documentElement.style.setProperty('--story-progress',`${progress}`);
      },()=>setReady(true),fail);world.current.setReduced(motionRef.current);}catch{fail();}
    }).catch(fail);
    return()=>{cancelled=true;world.current?.dispose();world.current=null;};
  },[reading,fail]);
  useEffect(()=>{
    if(active!==1||!ready||!skipFocus.current)return;
    let frame=0;
    const transferFocus=()=>{
      const target=document.querySelector<HTMLElement>('[data-chapter="1"]');
      if(target&&!target.inert&&getComputedStyle(target).visibility==='visible'){
        target.focus({preventScroll:true});
        if(document.activeElement===target){skipFocus.current=false;return;}
      }
      frame=requestAnimationFrame(transferFocus);
    };
    frame=requestAnimationFrame(transferFocus);
    return()=>cancelAnimationFrame(frame);
  },[active,ready]);
  useEffect(()=>{
    if(reading)return;
    let timer:ReturnType<typeof setTimeout>,previousStep=chapterStep(),lastRaw=window.scrollY/previousStep;
    const restore=()=>{const index=chapters.findIndex(c=>`#${c.id}`===location.hash);if(index>=0)scrollToChapter(index,true);};
    const resize=()=>{if(scrollLength.current)scrollLength.current.style.height=`${chapterStep()*12+innerHeight}px`;};
    const onScroll=()=>{lastRaw=window.scrollY/previousStep;};
    const onResize=()=>{const raw=lastRaw;resize();previousStep=chapterStep();clearTimeout(timer);timer=setTimeout(()=>{window.scrollTo({top:raw*previousStep,behavior:'instant'});lastRaw=raw;},80);};
    resize();restore();window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);window.addEventListener('resize',onResize);window.addEventListener('scroll',onScroll,{passive:true});
    return()=>{clearTimeout(timer);window.removeEventListener('popstate',restore);window.removeEventListener('hashchange',restore);window.removeEventListener('resize',onResize);window.removeEventListener('scroll',onScroll);};
  },[reading]);
  useEffect(()=>{
    if(menu){dialog.current?.showModal();document.body.style.overflow='hidden';}
    else{dialog.current?.close();document.body.style.overflow='';}
    return()=>{document.body.style.overflow='';};
  },[menu]);
  const go=useCallback((index:number)=>{setMenu(false);if(reading){document.getElementById(`read-${chapters[index].id}`)?.scrollIntoView({behavior:reduced?'instant':'smooth'});return;}scrollToChapter(index,reduced,chapters[index].id);},[reading,reduced]);
  const toggleReading=()=>{setMenu(false);setReading(v=>!v);window.scrollTo({top:0,behavior:'instant'});};
  return <IconMotionContext.Provider value={reduced}><div className={`${reading?'is-reading':''} ${reduced?'reduced-motion':''}`}>
    <a className="skip-link" href={reading?'#read-code':'#story'} onClick={event=>{if(!reading){event.preventDefault();if(activeRef.current===1)document.querySelector<HTMLElement>('[data-chapter="1"]')?.focus({preventScroll:true});else skipFocus.current=true;go(1);}}}>Skip to portfolio content</a>
    <header className="site-header"><button className="wordmark" aria-label="Ali Bhatti, go to introduction" data-goto="0" onClick={()=>go(0)}><span className="brand-symbol" aria-hidden="true"><i/><i/></span><span>ALI BHATTI</span></button><span className="header-meta">FULL STACK DEVELOPER<span>KHANEWAL, PAKISTAN</span></span><div className="header-actions"><ResumeLink className="header-resume"/><button className={`menu-button ${menu?'open':''}`} aria-label={menu?'Close chapters':'Open chapters'} aria-expanded={menu} aria-controls="chapter-menu" onClick={()=>setMenu(!menu)}><span>INDEX</span><i/><i/></button></div></header>
    {reading?<ReadingView onReturn={()=>{setFailed(false);setReading(false);history.replaceState(null,'',location.pathname+location.hash);window.scrollTo(0,0);}} fallback={failed}/>:<>
      <div className="world-shell" aria-hidden="true"><div className="world-atmosphere"/><canvas ref={canvas} data-world/><div className="world-vignette"/></div>
      {!ready&&<div className="loading-state" role="status"><span className="loading-mark">//</span><span>BUILDING A WORLD<span className="loading-dots">...</span></span><small>Good things take a first line.</small><button onClick={toggleReading}>Read the portfolio instead <Arrow/></button></div>}
      <div className={`experience ${ready?'experience-ready':''}`} inert={!ready} aria-hidden={!ready}><Story active={active} go={go} hover={id=>world.current?.setHover(id)} interact={index=>world.current?.interact(index)}/><div className="side-annotation" aria-hidden="true">HUMAN · CODE · EXPERIENCE</div></div>
      <div className="scroll-length" ref={scrollLength} aria-hidden="true"/>
      <footer className="story-footer"><button className="chapter-current" onClick={()=>setMenu(true)} aria-label="Open chapter index"><span>{String(active+1).padStart(2,'0')} <small>/ 13</small></span><span>{chapters[active].shortLabel}</span><span className="index-plus">+</span></button><nav className="chapter-track" aria-label="Story chapters">{chapters.map((c,i)=><button key={c.id} data-goto={i} aria-label={`Chapter ${i+1}: ${c.shortLabel}`} aria-current={active===i?'step':undefined} onClick={()=>go(i)}><span>{c.shortLabel}</span><i/></button>)}<div className="chapter-track-progress" ref={progressBar}/></nav><div className="chapter-actions"><ChapterButton className="previous-chapter" direction="up" disabled={active===0} data-goto={Math.max(0,active-1)} onClick={()=>go(Math.max(0,active-1))} aria-label="Previous chapter" title="Previous chapter"/><ChapterButton className="next-chapter" direction={active===12?'up':'down'} data-goto={active===12?0:active+1} onClick={()=>go(active===12?0:active+1)} aria-label={active===12?'Return to the beginning':'Next chapter'}>{active===12?'BACK TO START':'CONTINUE'}</ChapterButton></div></footer>
    </>}
    <dialog ref={dialog} id="chapter-menu" className="chapter-menu" onCancel={()=>setMenu(false)} onClick={e=>{if(e.target===e.currentTarget)setMenu(false);}}><div className="menu-top"><span className="overline">THE INTERNET, BUILT BY ME</span><button className="close-button" aria-label="Close chapters" onClick={()=>setMenu(false)}>CLOSE <span>×</span></button></div><h2>Every part.<br/><span>One story.</span></h2><nav aria-label="Chapter index">{chapters.map((c,i)=><button data-goto={i} key={c.id} onClick={()=>go(i)} aria-current={active===i?'step':undefined}><span className="menu-number">{String(i).padStart(2,'0')}</span><span>{c.shortLabel}</span><Arrow/></button>)}</nav><div className="menu-bottom"><button onClick={toggleReading}>{reading?'Enter the 3D story':'Read the complete portfolio'}<Arrow/></button><button aria-pressed={reduced} onClick={()=>setReduced(v=>!v)}>Motion: {reduced?'reduced':'full'}<span className={`toggle ${reduced?'enabled':''}`}><i/></span></button><span>Made with intention, by Ali.</span></div></dialog>
  </div></IconMotionContext.Provider>;
}
