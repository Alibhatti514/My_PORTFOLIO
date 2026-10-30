import {smooth,clamp} from './journey';
/** Dedicated MacBook interval. Nothing after 3.5 changes the existing camera path. */
export function macbookStartup(p:number){
 const w=(a:number,b:number)=>smooth((p-a)/(b-a));
 return{lid:w(2.65,2.98),glow:w(2.3,2.49)*(1-w(2.64,2.82)),boot:w(2.98,3.08),
  typing:w(3.08,3.39),terminal:w(3.4,3.58),side:w(2.49,2.69),front:w(2.72,3.13),handoff:w(3.18,3.5),
  stage:p<2.3?'closed':p<2.49?'logo-illumination':p<2.65?'rotation':p<2.98?'lid-opening':p<3.08?'screen-activation':p<3.4?'code-typing':p<3.58?'terminal':'portal',
  presence:clamp((p-1.84)/.3)};
}
