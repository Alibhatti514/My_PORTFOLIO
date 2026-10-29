import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const url=process.env.QA_URL||'http://127.0.0.1:4198', report=[];
const b=await chromium.launch({channel:'chrome'});
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 for(const reduced of [false,true]){
  const ctx=await b.newContext({viewport,reducedMotion:reduced?'reduce':'no-preference'}),p=await ctx.newPage();
  const errors=[];p.on('pageerror',e=>errors.push(String(e)));
  await p.goto(url);await p.locator(reduced?'.reading-mode':'.world-ready').waitFor();
  assert.equal(await p.locator('.technology').count(),26);
  assert.deepEqual(await p.locator('.featured-index button').allTextContents(),Array.from({length:9},(_,i)=>String(i+1).padStart(2,'0')));
  if(reduced){
   assert.equal(await p.locator('.journey-world canvas').count(),0);
   const stack=p.locator('.certificate-stack');await stack.scrollIntoViewIfNeeded();await stack.press('ArrowRight');
   assert.equal(await p.locator('.featured-index button[aria-pressed=true]').innerText(),'02');
   await p.getByRole('button',{name:'Next credential',exact:true}).click();
   assert.equal(await p.locator('.featured-index button[aria-pressed=true]').innerText(),'03');
  } else {
   for(let n=0;n<8;n++){
    await p.evaluate(n=>scrollTo({top:n*innerHeight*1.2,behavior:'instant'}),n);
    await p.waitForFunction(n=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-n)<.003,n);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   }
  }
  if(reduced){await p.locator('#content-credentials').scrollIntoViewIfNeeded();await p.screenshot({path:`docs/spatial-v8/qa/reading-${viewport.width}-credentials.png`});}
  const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  if(axe.violations.length) console.log(JSON.stringify({viewport,reduced,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))},null,2));
  assert.deepEqual(axe.violations.map(v=>v.id),[]);assert.deepEqual(errors,[]);
  report.push({viewport,reducedMotion:reduced,production:true,technologies:26,numericIndicators:true,violations:[],errors});
  await ctx.close();
 }
}
await b.close();await fs.writeFile('docs/spatial-v8/qa/production-report.json',JSON.stringify(report,null,2));console.log('Production desktop/mobile and reduced-motion interaction/accessibility smoke passed.');
