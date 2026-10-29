import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const url=process.env.QA_URL||'http://127.0.0.1:4176';
const browser=await chromium.launch({channel:'chrome'});
const report=[];
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const page=await browser.newPage({viewport});
 await page.goto(url);await page.locator('.world-ready').waitFor();
 await page.evaluate(()=>window.savedCanvas=document.querySelector('[data-world="persistent"]'));
 const move=async n=>{const target=await page.evaluate(n=>{scrollTo({top:n*innerHeight*1.2,behavior:'instant'});return Math.min(7,Math.max(0,scrollY/(innerHeight*1.2)));},n);await page.waitForFunction(n=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-n)<.00003,target);await page.waitForTimeout(150);return page.evaluate(()=>({y:scrollY,...window.__journeyWorld}));};
 const boundaries=[];
 for(let n=1;n<=6;n++){
  const a=await move(n-.01),b=await move(n+.01);
  const delta=Math.hypot(...a.camera.map((v,i)=>v-b.camera[i]));
  assert.ok(delta<.2,`camera continuity at ${n}: ${delta}`);
  assert.ok(b.y>a.y);
  boundaries.push({at:n,cameraDistance:delta});
 }
 await move(3);await page.waitForTimeout(800);
 const before=await page.evaluate(()=>window.__journeyWorld);
 await page.waitForTimeout(600);
 assert.deepEqual(await page.evaluate(()=>window.__journeyWorld),before,'environment must stop when scroll settles');
 assert.equal(await page.evaluate(()=>window.savedCanvas===document.querySelector('[data-world="persistent"]')),true);
 assert.equal(before.drawCalls,4);assert.equal(before.geometries,4);
 await move(7);
 const downloads=[];
 for(const label of ['Premium résumé ↓','ATS résumé ↓']){
  const event=page.waitForEvent('download');await page.getByRole('link',{name:label,exact:true}).click();
  downloads.push((await event).suggestedFilename());
 }
 const social=await page.locator('.finale-socials a').evaluateAll(els=>els.map(e=>({href:e.getAttribute('href'),target:e.target,rel:e.rel})));
 assert.ok(social.length>=3);assert.ok(social.every(s=>s.href.startsWith('https://')&&s.rel.includes('noopener')));
 report.push({viewport,boundaries,idle:true,persistentCanvas:true,drawCalls:before.drawCalls,geometries:before.geometries,downloads,social});
 await page.close();
}
await browser.close();
await fs.writeFile('docs/cinematic-v5/qa/environment-report.json',JSON.stringify(report,null,2));
console.log('Environment continuity, idle stability, persistent canvas, résumé downloads and social links passed.');
