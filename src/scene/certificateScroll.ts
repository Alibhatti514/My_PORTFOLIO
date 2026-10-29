export const FULL_TURN=2*Math.PI;
export interface CertificateIdentity {id:string;issuer:string;title:string}
const normalized=(value:string)=>value.trim().replace(/\s+/g,' ').toLowerCase();
export function londonCertificateIndex(certificates:readonly CertificateIdentity[]) {
  return certificates.findIndex(c=>normalized(c.issuer)==='university of london'&&normalized(c.title)==='full-stack web development');
}
/** Geometry only: no durations, playback flags or elapsed-time easing. */
export function certificateScrollPlan(start:number,target:number,count:number) {
  const step=FULL_TURN/count,remainder=((target*step-start)%FULL_TURN+FULL_TURN)%FULL_TURN;
  const alignment=remainder<1e-8||FULL_TURN-remainder<1e-8?0:remainder;
  return {start,end:start+FULL_TURN+alignment};
}
export function certificateScrollProgress(scroll:number,start:number,end:number) {
  return Math.max(0,Math.min(1,(scroll-start)/Math.max(1,end-start)));
}
export function certificateScrollPhase(progress:number,plan:{start:number;end:number}) {
  return plan.start+(plan.end-plan.start)*Math.max(0,Math.min(1,progress));
}
export function certificateForegroundWeight(offset:number,count:number) {
  const distance=Math.abs(Math.atan2(Math.sin(offset),Math.cos(offset)))/(FULL_TURN/count);
  const t=Math.min(1,distance);return 1-t*t*(3-2*t);
}
