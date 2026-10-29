import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome'}),results=[];
for(const [width,height] of [[1440,900],[390,844]]){
 const p=await b.newPage({viewport:{width,height}});await p.goto(process.env.QA_URL||'http://127.0.0.1:4174');await p.locator('.world-ready').waitFor();await p.waitForTimeout(700);
 const result=await p.evaluate(async()=>{
  const frames=[],poses=[],start=performance.now();let last=start;
  const gl=document.querySelector('.journey-world canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');
  const renderer=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
  await new Promise(resolve=>{function tick(now){const elapsed=now-start;frames.push(now-last);last=now;const t=Math.min(2,elapsed/7000);scrollTo({top:(t<=1?t:2-t)*7*innerHeight*1.2,behavior:'instant'});poses.push(window.__journeyWorld.progress);if(t<2)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});
  const samples=frames.slice(5).sort((a,b)=>a-b),mean=samples.reduce((a,b)=>a+b,0)/samples.length;
  return {viewport:[innerWidth,innerHeight],devicePixelRatio,renderer,userAgent:navigator.userAgent,frames:samples.length,meanFrameMs:mean,meanFPS:1000/mean,p95FrameMs:samples[Math.floor(samples.length*.95)],over33ms:samples.filter(x=>x>33.34).length,progressRange:[Math.min(...poses),Math.max(...poses)],world:window.__journeyWorld};
 });
 if(result.progressRange[1]<6.8)throw Error('Full journey was not measured');results.push(result);await p.close();
}
await b.close();await fs.writeFile('docs/cinematic-v4/qa/performance-summary.json',JSON.stringify({date:new Date().toISOString(),method:'14 seconds of continuous forward and backward scrolling per viewport, requestAnimationFrame cadence in local headless Chrome, active WebGL renderer. No video capture or parallel QA. Not a physical device presentation or universal FPS guarantee.',results},null,2));console.log(results);
