import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='docs/ultimate-4d-v6/qa', url=process.env.QA_URL||'http://127.0.0.1:4186';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}), report=[];
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const page=await browser.newPage({viewport});
 await page.goto(url);await page.locator('.world-ready').waitFor();
 await page.evaluate(()=>window.savedCanvas=document.querySelector('[data-world="persistent"]'));
 const move=async n=>{
  const target=await page.evaluate(n=>{scrollTo({top:n*innerHeight*1.2,behavior:'instant'});return Math.min(7,scrollY/(innerHeight*1.2));},n);
  await page.waitForFunction(n=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-n)<.00003,target);
  return page.evaluate(()=>({y:scrollY,...window.__journeyWorld}));
 };
 const boundaries=[];
 // Half-coordinates capture the handovers; integers also verify pose joins.
 for(const n of [.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5]){
  const states=[];
  for(const [name,offset] of [['before',-.01],['at',0],['after',.01]]){
   const state=await move(n+offset);states.push(state);
   await page.screenshot({path:`${out}/boundary-${viewport.width}-${n}-${name}.png`});
  }
  const delta=Math.hypot(...states[0].camera.map((v,i)=>v-states[2].camera[i]));
  assert.ok(delta<.2,`camera join at ${n}: ${delta}`);
  assert.ok(states[2].y>states[0].y);
  boundaries.push({at:n,cameraDistance:delta,foldDelta:Math.abs(states[2].fold-states[0].fold)});
 }
 await move(2);
 const a=await page.locator('#content-skills').boundingBox();
 await move(2.02);
 const c=await page.locator('#content-skills').boundingBox();
 assert.ok(c.y<a.y-viewport.height*.02,'the document itself must move');
 await move(3);await page.waitForTimeout(600);
 const settled=await page.evaluate(()=>window.__journeyWorld);
 await page.waitForTimeout(600);
 assert.deepEqual(await page.evaluate(()=>window.__journeyWorld),settled,'no autonomous animation when idle');
 assert.equal(await page.evaluate(()=>window.savedCanvas===document.querySelector('[data-world="persistent"]')),true);
 assert.equal(settled.drawCalls,1);assert.equal(settled.geometries,1);
 // Direct fragment landing, refresh, browser back/forward, and resize.
 await page.goto(url+'/#credentials');await page.locator('.world-ready').waitFor();
 await page.waitForFunction(()=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-6)<.001);
 await page.reload();await page.locator('.world-ready').waitFor();
 await page.waitForFunction(()=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-6)<.001);
 if(viewport.width<760){
  await page.getByRole('button',{name:'Menu',exact:false}).click();
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'The human'}).click();
 }else await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About',exact:true}).click();
 await page.waitForFunction(()=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-1)<.001);
 await page.goBack();await page.waitForFunction(()=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-6)<.001);
 await page.goForward();await page.waitForFunction(()=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-1)<.001);
 await page.setViewportSize({width:viewport.width+25,height:viewport.height+65});
 await page.waitForFunction(()=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-1)<.003);
 await page.waitForTimeout(200);
 assert.ok(Math.abs(await page.evaluate(()=>scrollY/(innerHeight*1.2))-1)<.003);
 await page.setViewportSize(viewport);await page.waitForTimeout(250);
 await move(7);
 const downloads=[];
 for(const label of ['Premium résumé ↓','ATS résumé ↓']){
  const event=page.waitForEvent('download');await page.getByRole('link',{name:label,exact:true}).click();
  const download=await event;downloads.push(download.suggestedFilename());assert.equal(await download.failure(),null);
 }
 const social=await page.locator('.finale-socials a').evaluateAll(els=>els.map(e=>({href:e.getAttribute('href'),rel:e.rel})));
 assert.equal(social.length,5);assert.ok(social.every(s=>s.href.startsWith('https://')&&s.rel.includes('noopener')));
 // Simulate context loss after rendering, rather than only no-WebGL startup.
 await page.evaluate(()=>document.querySelector('.journey-world canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 await page.locator('.reading-mode').waitFor();assert.equal(await page.locator('.project-composition').count(),3);
 report.push({viewport,boundaries,nativeTravel:true,idle:true,persistentCanvas:true,drawCalls:1,geometries:1,
  deepLink:true,refresh:true,history:true,resize:true,downloads,social,contextLoss:true});
 await page.close();
}
await browser.close();
await fs.writeFile(`${out}/continuity-report.json`,JSON.stringify(report,null,2));
console.log('Native travel, boundary continuity, idle stability, history, resize, PDF downloads and context loss passed.');
