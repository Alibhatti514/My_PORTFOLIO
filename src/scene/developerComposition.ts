/** CSS-pixel rectangles shared by rendering, audit telemetry and regression tests. */
export interface VisualRect { x:number; y:number; width:number; height:number }
export function intersects(a:VisualRect,b:VisualRect,gap=0) {
  return a.x < b.x+b.width+gap && a.x+a.width+gap > b.x && a.y < b.y+b.height+gap && a.y+a.height+gap > b.y;
}
export function developerComposition(width:number,height:number,obstacles:VisualRect[]) {
  const stacked=width<1000 && height>width;
  const margin=width*(stacked?.07:.045);
  const x=stacked?margin:width*.50, right=width-margin;
  const top=stacked?height*.43:height*.30, bottom=height*.82;
  let gaps:[number,number][]=[[top,bottom]];
  // Choose an actual free interval rather than pushing the model below one incoming
  // element and above another. That used to erase the workstation during the handoff.
  for(const r of obstacles) {
    if(r.width<=0||r.height<=0||r.y+r.height<100||r.y>=height||r.x>=right||r.x+r.width<=x)continue;
    const cutTop=r.y-16,cutBottom=r.y+r.height+16;
    gaps=gaps.flatMap(([a,b]):[number,number][]=>{
      if(cutBottom<=a||cutTop>=b)return[[a,b]];
      const next:[number,number][]=[];if(cutTop>a)next.push([a,Math.min(b,cutTop)]);if(cutBottom<b)next.push([Math.max(a,cutBottom),b]);return next;
    });
  }
  const [y,end]=gaps.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0]||[top,top];
  return {x:Math.round(x),y:Math.round(y),width:Math.round(right-x),height:Math.max(0,Math.floor(end-y)),stacked};
}
