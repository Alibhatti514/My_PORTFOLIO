import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='docs/spatial-v8/qa',url=process.env.QA_URL||'http://127.0.0.1:4198';
const browser=await chromium.launch({channel:'chrome'}),report={errors:[],samples:[],checks:[]};
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>report.errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
await page.goto(url);await page.locator('.world-ready').waitFor();
async function sample(p){
 await page.evaluate(p=>scrollTo({top:p*innerHeight*1.2,behavior:'instant'}),p);
 await page.waitForFunction(p=>window.__journeyWorld?.progress===p,p);
 return page.evaluate(()=>{const {renders,...s}=window.__journeyWorld;return s;});
}
for(const p of [0,.25,.5,.75,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7]){
 const state=await sample(p);assert.equal(state.cameraType,'PerspectiveCamera');assert.ok(state.triangles>0);assert.ok(state.geometries>20);assert.ok(state.drawCalls>0);
 const gl=await page.evaluate(()=>{const c=document.querySelector('.journey-world canvas'),gl=c.getContext('webgl2');return !!gl&&!gl.isContextLost();});assert.ok(gl);
 report.samples.push({p,state});await page.screenshot({path:`${out}/spatial-${p}.png`});
}
assert.ok(Math.max(...report.samples.map(s=>s.state.triangles))>20000);
const pose=s=>({camera:s.camera,rotation:s.rotation,fov:s.fov,objects:s.objects,light:s.light,progress:s.progress});
for(const {p,state} of [...report.samples].reverse())assert.deepEqual(pose(await sample(p)),pose(state));
assert.ok(Math.abs(report.samples[0].state.camera[2]-report.samples.at(-1).state.camera[2])>190);
assert.notDeepEqual(report.samples[1].state.objects,report.samples[3].state.objects);
report.checks.push('actual WebGL2 context, perspective camera, rendered triangles, depth translation, object transforms, exact reverse states');
await sample(3.5);const held=await page.evaluate(()=>window.__journeyWorld);await page.waitForTimeout(1000);assert.deepEqual(await page.evaluate(()=>window.__journeyWorld),held);report.checks.push('midway pause holds state and stops rendering');
for(const p of [6,1,7,2,.5,5])await page.evaluate(p=>scrollTo(0,p*innerHeight*1.2),p);
await sample(5);assert.deepEqual(pose(await sample(3.5)),pose(report.samples.find(s=>s.p===3.5).state));report.checks.push('rapid scroll recovers exact state');
await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(1000);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1000);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);report.checks.push('live desktop/tablet/mobile resizing');
await page.goto(url+'/#credentials');await page.waitForFunction(()=>Math.abs((window.__journeyWorld?.progress??-1)-6)<.001);report.checks.push('direct hash navigation restores camera');
await page.getByRole('button',{name:'Reading view',exact:false}).click();await page.locator('.reading-mode').waitFor();await page.waitForFunction(()=>window.__journeyWorld?.disposed===true);assert.equal(await page.locator('.journey-world canvas').count(),0);report.cleanup=await page.evaluate(()=>window.__journeyWorld);report.checks.push('mounted scene cleanup on reading-mode switch');
assert.deepEqual(report.errors,[]);await browser.close();await fs.writeFile(`${out}/spatial-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,checks:report.checks,cleanup:report.cleanup},null,2));
