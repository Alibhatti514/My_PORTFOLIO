import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const out='docs/certificate-radial-v8/qa',url=process.env.QA_URL||'http://127.0.0.1:4200';
const temporary=`${out}/temporary-${process.pid}`;
await fs.mkdir(out,{recursive:true});const b=await chromium.launch({channel:'chrome'}),report=[];
for(const [name,w,h] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844],['small-mobile',375,667]]){
 const context=await b.newContext({viewport:{width:w,height:h},hasTouch:w<760,recordVideo:{dir:temporary,size:{width:w,height:h}}}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto(url+'/#credentials');await p.locator('.world-ready').waitFor();await p.waitForTimeout(1100);
 const index=async()=>Number(await p.locator('.featured-index [aria-pressed=true]').innerText());
 async function verify(expected){
  await p.waitForTimeout(950);assert.equal(await index(),expected);
  const result=await p.evaluate(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom}};
   const sheets=[...document.querySelectorAll('.circular-sheet')],front=document.querySelector('.circular-sheet[data-front=true]'),r=front.getBoundingClientRect();
   return {count:sheets.length,fronts:sheets.filter(e=>e.dataset.front==='true').length,loaded:sheets.every(e=>{const img=e.querySelector('img');return img.complete&&img.naturalWidth>0}),white:sheets.every(e=>getComputedStyle(e.querySelector('.certificate-paper')||e).backgroundColor==='rgb(255, 255, 255)'),interactive:sheets.filter(e=>e!==front).every(e=>!e.inert&&e.getAttribute('aria-hidden')!=='true'&&e.tabIndex>=0&&e.getAttribute('aria-label')?.startsWith('Select ')),top:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.circular-sheet')?.dataset.front,front:rect(front),rear:sheets.filter(e=>e!==front).map(rect),layers:sheets.map(rect),nav:rect(document.querySelector('.featured-index')),copy:rect(document.querySelector('.credential-copy')),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(result.count,9);assert.equal(result.fronts,1);for(const key of ['loaded','white','interactive'])assert.equal(result[key],true,key);assert.equal(result.top,'true');assert.equal(result.overflow,false);
  for(const r of result.layers){assert.ok(r.x>=0&&r.right<=w,`clipped ${name} ${JSON.stringify(r)}`);assert.ok(r.bottom<result.nav.y-2,`navigation overlap ${name} ${JSON.stringify(r)}`);if(w>=760)assert.ok(r.x>result.copy.right+5,`text overlap ${name}`);else assert.ok(r.bottom<result.copy.y);}
  // Check the rendered arrangement: eight exposed rear sheets at uniform angular intervals.
  const cx=(result.front.x+result.front.right)/2,cy=(result.front.y+result.front.bottom)/2;
  const angles=result.rear.map(r=>Math.atan2((r.y+r.bottom)/2-cy,(r.x+r.right)/2-cx)).sort((a,b)=>a-b);
  for(let i=0;i<8;i++) {
    const gap=(angles[(i+1)%8]-angles[i]+2*Math.PI)%(2*Math.PI);
    assert.ok(Math.abs(gap-Math.PI/4)<.16,`uneven visible radial spacing ${name}: ${gap}`);
  }
  for(const r of result.rear) {
    assert.ok((r.right-r.x)<(result.front.right-result.front.x)*.6,`rear sheet too large ${name}`);
    assert.ok(Math.max(r.right-result.front.right,result.front.x-r.x,r.bottom-result.front.bottom,result.front.y-r.y)>(w<760?6:12),`rear sheet hidden by active certificate ${name}`);
  }
  return result;
 }
 const initial=await verify(1);await p.screenshot({path:`${out}/${name}-initial.png`});
 await p.getByRole('button',{name:'Next credential',exact:true}).click();await p.waitForTimeout(240);await p.screenshot({path:`${out}/${name}-mid-transition.png`});await verify(2);await p.screenshot({path:`${out}/${name}-next.png`});
 await p.getByRole('button',{name:'Previous credential',exact:true}).click();await verify(1);await p.screenshot({path:`${out}/${name}-previous.png`});
 for(let i=0;i<13;i++){await p.getByRole('button',{name:'Next credential',exact:true}).click();await p.waitForTimeout(45);}await verify(5);await p.screenshot({path:`${out}/${name}-rapid.png`});
 const stack=p.locator('.certificate-stack');await stack.focus();await stack.press('ArrowRight');await verify(6);await stack.press('ArrowLeft');await verify(5);
 const box=await p.locator('.sheet-front').boundingBox(),x=box.x+box.width*.75,y=box.y+box.height*.5;
 if(w<760){const cdp=await context.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-box.width*.5*i/12,y}]});await p.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}else{await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x-box.width*.5,y,{steps:20});await p.mouse.up();}
 await verify(6);await p.screenshot({path:`${out}/${name}-gesture.png`});
 for(let i=0;i<9;i++){await p.locator('.featured-index button').nth(i).click();await verify(i+1);}
 await p.locator('.sheet-front').click();await p.locator('.preview-dialog[open]').waitFor();await p.getByRole('button',{name:'Close certificate preview'}).click();
 const dl=p.waitForEvent('download');await p.locator('.credential-actions a[download]').click();assert.ok((await (await dl).suggestedFilename()).endsWith('.pdf'));
 assert.deepEqual(await p.locator('.featured-index button').allTextContents(),Array.from({length:9},(_,i)=>String(i+1).padStart(2,'0')));
 const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);assert.deepEqual(errors,[]);
 const video=p.video();await context.close();await video.saveAs(`${out}/${name}.webm`);report.push({name,viewport:[w,h],initial,allNineForeground:true,next:true,previous:true,rapid:true,keyboard:true,gesture:w<760?'swipe':'drag',inspect:true,download:true,axeViolations:0,errors});console.log(`Passed ${name}`);
}
const reduced=await b.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}}),p=await reduced.newPage();await p.goto(url);await p.locator('.reading-mode').waitFor();await p.locator('.certificate-stack').scrollIntoViewIfNeeded();await p.locator('.certificate-stack').press('ArrowRight');await p.waitForTimeout(100);assert.equal(await p.locator('.featured-index [aria-pressed=true]').innerText(),'02');assert.equal(await p.locator('.sheet-front').count(),1);await p.screenshot({path:`${out}/reduced-motion.png`});await reduced.close();
await b.close();await fs.writeFile(`${out}/report.json`,JSON.stringify({passed:true,viewports:report,reducedMotion:true},null,2));await fs.rm(temporary,{recursive:true,force:true});
