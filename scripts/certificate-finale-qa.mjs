import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const out='docs/certificate-finale-v10/qa',url=process.env.QA_URL||'http://127.0.0.1:4199';
await fs.mkdir(out,{recursive:true});const browser=await chromium.launch({channel:'chrome'});
const report={complete:[],interruptions:[],errors:[],reduced:[]};
const state=p=>p.locator('.radial-certificates').getAttribute('data-finale-state');
const index=async p=>Number(await p.locator('.featured-index [aria-pressed=true]').innerText());
const ids=JSON.parse(await fs.readFile('src/data/featuredCertificates.json','utf8')).map(c=>c.id);
async function session(name,w=1440,h=900,video=true,reduced=false){
 const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<1100,reducedMotion:reduced?'reduce':'no-preference',...(video?{recordVideo:{dir:`${out}/tmp-${process.pid}`,size:{width:w,height:h}}}:{})}),p=await context.newPage();
 p.on('pageerror',e=>report.errors.push({name,error:e.message}));p.on('console',m=>{if(m.type()==='error')report.errors.push({name,error:m.text()});});
 await p.goto(url);await p.locator(reduced?'.reading-mode':'.world-ready').waitFor();await p.mouse.move(5,100);
 return {p,context,async close(){const video=p.video();await context.close();if(video)await video.saveAs(`${out}/${name}.webm`);}};
}
async function nativeMove(p,destination,duration=900){
 await p.evaluate(async({destination,duration})=>{const from=scrollY,to=destination*innerHeight*1.2,start=performance.now();await new Promise(resolve=>{function tick(now){const x=Math.min(1,(now-start)/duration),e=x*x*(3-2*x);scrollTo({top:from+(to-from)*e,behavior:'instant'});if(x<1)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});},{destination,duration});
}
async function approach(p){
 await nativeMove(p,5.94,1200);await p.waitForTimeout(500);assert.equal(await state(p),'waiting');
 await p.mouse.wheel(0,await p.evaluate(()=>innerHeight*1.2*.06));
 await p.waitForFunction(()=>document.querySelector('.radial-certificates')?.dataset.finaleState==='running');
}
const matrices=p=>p.locator('.circular-sheet').evaluateAll(es=>es.map(e=>({button:getComputedStyle(e).transform,paper:getComputedStyle(e.querySelector('.certificate-paper')).transform})));
function circle(points){
 const radii=points.map(p=>Math.hypot(p.x,p.y));assert.ok(Math.min(...radii)>20);
 assert.ok(Math.max(...radii)-Math.min(...radii)<.15,'common radius on every cinematic frame');
 const angles=points.map(p=>(Math.atan2(p.y,p.x)+2*Math.PI)%(2*Math.PI)).sort((a,b)=>a-b);
 for(let i=0;i<9;i++)assert.ok(Math.abs((angles[(i+1)%9]-angles[i]+2*Math.PI)%(2*Math.PI)-2*Math.PI/9)<.003,'40-degree spacing on every cinematic frame');
 for(const point of points){const angle=Math.atan2(point.y,point.x),distance=Math.abs(Math.atan2(Math.sin(angle-Math.PI/2),Math.cos(angle-Math.PI/2)));if(distance>2*Math.PI/9+.03&&!point.engaged){const error=Math.atan2(Math.sin(point.rotation-angle-Math.PI/2),Math.cos(point.rotation-angle-Math.PI/2));assert.ok(Math.abs(error)<.065,'rear paper stays tangent to the actual moving circumference');}}
}
for(const [name,w,h] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844]].filter(([name])=>!process.env.FINALE_VIEWPORTS||process.env.FINALE_VIEWPORTS.split(',').includes(name))){
 const s=await session(name,w,h),{p}=s;
 await nativeMove(p,5.94,1200);await p.waitForTimeout(700);assert.equal(await state(p),'waiting');
 await p.screenshot({path:`${out}/${name}-initial.png`});
 const focused=await p.evaluate(()=>document.activeElement?.tagName);
 const trace=p.evaluate(async()=>{
  const samples=[],start=performance.now();await new Promise((resolve,reject)=>{
   function tick(now){
    const points=[...document.querySelectorAll('.circular-sheet')].map(e=>{const m=new DOMMatrix(getComputedStyle(e).transform),c=getComputedStyle(e),n=new DOMMatrix(getComputedStyle(e.querySelector('.certificate-paper')).transform),r=e.querySelector('.certificate-paper').getBoundingClientRect();return {bottom:r.bottom,left:r.left,right:r.right,x:m.m41+parseFloat(c.width)/2,y:m.m42+parseFloat(c.height)/2,rotation:Math.atan2(n.m12,n.m11),engaged:e.dataset.engaged==='true'};});
    const navTop=document.querySelector('.featured-index').getBoundingClientRect().top,caption=document.querySelector('.certificate-stack>.eyebrow'),captionTop=getComputedStyle(caption).display==='none'?null:caption.getBoundingClientRect().top;
    samples.push({ms:now-start,points,navTop,captionTop,width:innerWidth,active:document.querySelector('.sheet-front')?.dataset.certificate});
    const state=document.querySelector('.radial-certificates')?.dataset.finaleState;
    if(state==='complete')resolve();else if(now-start>12000)reject(Error(`cinema did not finish: ${state}`));else requestAnimationFrame(tick);
   }requestAnimationFrame(tick);
  });return samples;
 });
 await p.mouse.wheel(0,h*1.2*.06);await p.waitForFunction(()=>document.querySelector('.radial-certificates')?.dataset.finaleState==='running');
 await p.waitForTimeout(1900);const scrollBefore=await p.evaluate(()=>scrollY);await p.mouse.wheel(0,12);await p.waitForTimeout(150);assert.ok(await p.evaluate(()=>scrollY)>scrollBefore,'native scrolling remains free during rotation');
 await p.screenshot({path:`${out}/${name}-middle.png`});
 const samples=await trace;await fs.writeFile(`${out}/${name}-trace.json`,JSON.stringify(samples));samples.forEach(sample=>{circle(sample.points);for(const point of sample.points){assert.ok(point.left>=0&&point.right<=sample.width,'no horizontal clipping during finale');assert.ok(point.bottom<sample.navTop-2,'no indicator overlap during any cinematic frame');if(sample.captionTop!==null)assert.ok(point.bottom<sample.captionTop-2,'drag instruction stays clear during the finale');}});
 let travel=0;for(let i=1;i<samples.length;i++){const a=Math.atan2(samples[i-1].points[0].y,samples[i-1].points[0].x),b=Math.atan2(samples[i].points[0].y,samples[i].points[0].x);travel-=Math.atan2(Math.sin(b-a),Math.cos(b-a));}
 assert.ok(Math.abs(travel-2*Math.PI)<.03,`complete 360 degree revolution: ${travel}`);
 const seen=[...new Set(samples.map(s=>s.active))];assert.deepEqual([...seen].sort(),[...ids].sort());
 assert.equal(await p.locator('.sheet-front').getAttribute('data-certificate'),'credential-32');assert.equal(await p.locator('.active-credential h3').innerText(),'Full-Stack Web Development');assert.match(await p.locator('.active-credential .eyebrow').innerText(),/University of London/);
 assert.equal(await p.getByRole('button',{name:'Show Full-Stack Web Development, University of London',exact:true}).getAttribute('aria-pressed'),'true');
 assert.equal(await p.evaluate(()=>document.activeElement?.tagName),focused,'no automatic focus movement');
 await p.waitForTimeout(200);const held=await matrices(p);await p.waitForTimeout(1000);assert.deepEqual(await matrices(p),held,'wheel and individual sheets stop completely');
 await p.screenshot({path:`${out}/${name}-final-london.png`});
 const data=await p.locator('.radial-certificates').evaluate(e=>({...e.dataset}));assert.equal(data.finaleDegrees,'360');assert.equal(data.finaleTarget,'credential-32');
 for(const n of [5.94,7,6])await nativeMove(p,n,600);await p.waitForTimeout(650);assert.equal(await state(p),'complete');assert.equal(await p.locator('.sheet-front').getAttribute('data-certificate'),'credential-32');
 await p.getByRole('button',{name:'Next credential',exact:true}).click();await p.waitForTimeout(1100);assert.equal(await index(p),2);
 for(const n of [7,6])await nativeMove(p,n,600);await p.waitForTimeout(1100);assert.equal(await state(p),'complete');assert.equal(await index(p),2,'re-entry preserves manual selection');
 await p.screenshot({path:`${out}/${name}-manual-after.png`});
 const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);
 report.complete.push({name,viewport:[w,h],frames:samples.length,rotationDegrees:travel*180/Math.PI,foregroundIds:seen,duration:Number(data.finaleDuration),finalTarget:data.finaleTarget,nativeScroll:true,focusStable:true,noReplay:true,manualAfter:true,axeViolations:0});
 await fs.writeFile(`${out}/${name}-trace.json`,JSON.stringify(samples));await s.close();console.log(`Complete finale passed: ${name}`);
}
for(const input of ['arrow','indicator','keyboard','certificate','drag','swipe'].filter(()=>!process.env.FINALE_CASES||process.env.FINALE_CASES==='interruptions')){
 const mobile=input==='swipe',s=await session(`interrupt-${input}`,mobile?390:1440,mobile?844:900,input==='arrow'||mobile),{p}=s;
 await approach(p);await p.waitForTimeout(1900);const before=await index(p);let expected=before%9+1;
 if(input==='arrow'){const r=await p.getByRole('button',{name:'Next credential',exact:true}).boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();expected=(await index(p))%9+1;await p.mouse.up();}
 if(input==='indicator'){expected=6;await p.locator('.featured-index button').nth(5).click();}
 if(input==='keyboard'){await p.locator('.certificate-stack').focus();expected=(await index(p))%9+1;await p.locator('.certificate-stack').press('ArrowRight');}
 if(input==='certificate'){
  const point=await p.locator('.circular-sheet').evaluateAll(es=>{for(const e of es){if(e.dataset.front==='true')continue;const r=e.querySelector('.certificate-paper').getBoundingClientRect();for(const f of [.5,.3,.7])for(const g of [.5,.3,.7]){const x=r.x+r.width*f,y=r.y+r.height*g;if(document.elementFromPoint(x,y)?.closest('.circular-sheet')===e)return{x,y};}}return null;});assert.ok(point);
  await p.mouse.click(point.x,point.y);const actual=await p.locator('.certificate-stack').getAttribute('data-certificate-index');assert.notEqual(actual,'');expected=Number(actual)+1;
 }
 if(input==='drag'||input==='swipe'){
  const box=await p.locator('.sheet-front').boundingBox(),x=box.x+box.width*.75,y=box.y+box.height*.5;
  if(mobile){const cdp=await s.context.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});expected=(await index(p))%9+1;for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-box.width*.55*i/12,y}]});await p.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
  else{await p.mouse.move(x,y);await p.mouse.down();expected=(await index(p))%9+1;await p.mouse.move(x-box.width*.55,y,{steps:20});await p.mouse.up();}
 }
 await p.waitForTimeout(1300);assert.equal(await state(p),'interrupted');assert.equal(await index(p),expected);
 const held=await matrices(p);await p.waitForTimeout(6500);assert.equal(await index(p),expected,'cancelled finale must never override the user');assert.deepEqual(await matrices(p),held);
 for(const n of [7,6])await nativeMove(p,n,500);await p.waitForTimeout(700);assert.equal(await state(p),'interrupted');assert.equal(await index(p),expected);
 await p.screenshot({path:`${out}/interrupt-${input}.png`});report.interruptions.push({input,before,selected:expected,noOverride:true,noReplay:true});await s.close();console.log(`Interruption passed: ${input}`);
}
for(const during of [false,true].filter(()=>!process.env.FINALE_CASES||process.env.FINALE_CASES==='reduced')){
 const s=await session(during?'reduced-during':'reduced-initial',390,844,false,!during),{p}=s;
 if(during){await approach(p);await p.waitForTimeout(1200);await p.emulateMedia({reducedMotion:'reduce'});}
 await p.locator('.reading-mode').waitFor();await p.locator('.certificate-stack').scrollIntoViewIfNeeded();await p.waitForTimeout(500);assert.equal(await state(p),'reduced');assert.equal(await p.locator('[data-certificate-finale-trigger]').count(),0);
 const old=await index(p);await p.locator('.certificate-stack').press('ArrowRight');assert.equal(await index(p),old%9+1);await p.waitForTimeout(1000);assert.equal(await index(p),old%9+1);
 await p.screenshot({path:`${out}/reduced-${during?'during':'initial'}.png`});report.reduced.push({during,automaticSkipped:true,keyboard:true,observerMarkerRemoved:true});await s.close();
}
assert.deepEqual(report.errors,[]);await browser.close();await fs.writeFile(`${out}/report.json`,JSON.stringify({passed:true,...report},null,2));await fs.rm(`${out}/tmp-${process.pid}`,{recursive:true,force:true});console.log('All cinematic finale checks passed');
