import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const url=process.env.QA_URL||'http://127.0.0.1:4198';
const b=await chromium.launch({channel:'chrome'}),report=[];
for(const [w,h] of [[375,667],[390,844]]){
 const context=await b.newContext({viewport:{width:w,height:h}}),p=await context.newPage();
 await p.goto(url);await p.locator('.world-ready').waitFor();
 for(const n of [0,1,2,6,7]){
  await p.evaluate(n=>scrollTo({top:n*innerHeight*1.2,behavior:'instant'}),n);
  await p.waitForFunction(n=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-n)<.003,n);
  await p.waitForTimeout(600);
  await p.screenshot({path:`docs/architectural-v7/qa/${w}-${h}-${n}.png`});
  if(n===7){
   const bounds=await p.locator('.finale-heading').evaluate(el=>{const range=new Range();range.selectNodeContents(el);return [...range.getClientRects()].map(r=>({x:r.x,right:r.right}));});
   assert.ok(bounds.every(r=>r.x>=-1&&r.right<=w+1),'all closing text is inside the viewport');
  }
  const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(axe.violations.map(x=>x.id),[]);
  report.push({w,h,p:n,violations:[]});
 }
 await context.close();
}
await b.close();await fs.writeFile('docs/architectural-v7/qa/final-visual-report.json',JSON.stringify(report,null,2));
console.log('Final phone layouts, closing text bounds and 10 WCAG scans passed.');
