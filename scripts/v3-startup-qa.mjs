import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome'}),report=[];
for(const [width,height] of [[1440,900],[1366,768],[768,1024],[390,844],[320,568]]){
 const p=await b.newPage({viewport:{width,height}});
 await p.addInitScript(()=>new MutationObserver(()=>{const els=[...document.querySelectorAll('.scene-panel')];if(els.length===8&&!window.initialPanelStyles)window.initialPanelStyles=els.map(el=>el.style.transform);}).observe(document,{childList:true,subtree:true}));
 await p.goto(process.env.QA_URL||'http://127.0.0.1:4174');await p.locator('.world-ready').waitFor();
 const initial=await p.evaluate(()=>window.initialPanelStyles);assert.equal(initial.length,8);assert.ok(initial.every(s=>s.includes('translate3d')),'All page poses exist at the first DOM commit, before any scroll frame.');
 for(const n of [2,6,7,0]){await p.evaluate(n=>scrollTo({top:n*innerHeight*1.2,behavior:'instant'}),n);await p.waitForTimeout(850);assert.ok(Math.abs(Number(await p.locator('.portfolio').getAttribute('data-progress'))-n)<.004);assert.equal(await p.locator('.story-content').evaluate(e=>e.scrollTop),0);if(n===2){await p.getByRole('button',{name:'Python',exact:true}).click();assert.match(await p.locator('.skill-inspector').innerText(),/Duke/);}if(n===6){await p.getByRole('button',{name:'Explore all 40 credentials',exact:false}).click();await p.locator('.library-dialog[open]').waitFor();assert.equal(await p.locator('.library-row').count(),40);await p.getByRole('button',{name:'Close certificate library',exact:true}).click();}}
 report.push({width,height,initialStyles:initial,status:'passed'});await p.close();
}
await b.close();await fs.writeFile('docs/burgundy-cream/qa/startup-regression.json',JSON.stringify(report,null,2));console.log('PASS: first-frame poses and post-render interaction regression at all five viewport sizes.');
