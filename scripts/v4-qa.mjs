import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const out='docs/cinematic-v4/qa',url=process.env.QA_URL||'http://127.0.0.1:4174';
await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({channel:'chrome'}), report={viewports:[],errors:[],interactions:[],performance:{},accessibility:[]};
const move=async(p,n)=>{await p.evaluate(n=>scrollTo({top:n*innerHeight*1.2,behavior:'instant'}),n);await p.waitForFunction(n=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-n)<.003,n);await p.waitForTimeout(450);};
for(const [w,h] of [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[375,667]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<760}),p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(String(e)));
 await p.goto(url);await p.locator('.world-ready').waitFor();await p.evaluate(()=>document.fonts.ready);
 const row={width:w,height:h,poses:[]};
 for(const n of [0,.6,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,7]){
  await move(p,n);await p.screenshot({path:`${out}/${w}-${h}-${n}.png`});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${w} p${n}`);
  if([3,4,5].includes(n)){
   assert.equal(await p.locator('.project-stage').count(),1);
   const card=p.locator('.project-composition').nth(n-3);
   const bounds=await card.locator('h2,p,img').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {name:e.tagName,x:r.x,y:r.y,right:r.right,bottom:r.bottom}}));
   for(const r of bounds){assert.ok(r.x>=-1&&r.right<=w+1&&r.y>=0&&r.bottom<=h,`${w} ${n} ${JSON.stringify(r)}`);}
  }
  row.poses.push({p:n,world:await p.evaluate(()=>window.__journeyWorld),portrait:await p.locator('.shared-portrait').getAttribute('style')});
 }
 await move(p,2);
 assert.equal(await p.getByRole('button',{name:'Completed study',exact:true}).count(),0);
 for(const [cat,names] of Object.entries({Languages:['C#','JavaScript (ES6+)','TypeScript','Python'],Frontend:['Svelte 5','SvelteKit','Blazor','React.js','Next.js','HTML5','CSS3'],Backend:['ASP.NET Core','.NET 8','Express.js','REST APIs','JWT Authentication'],Data:['Supabase','PostgreSQL','Prisma ORM'],Tools:['Sanity CMS','Stripe Integration','GitHub']})){
  await p.getByRole('button',{name:cat,exact:true}).click();await p.waitForTimeout(500);
  for(const name of names)assert.equal(await p.getByRole('button',{name,exact:true}).isVisible(),true,`${cat}: ${name}`);
  await p.screenshot({path:`${out}/${w}-${cat}.png`});
 }
 await p.getByRole('button',{name:'All',exact:true}).click();await p.waitForTimeout(500);
 const images=await p.locator('.technology img').evaluateAll(es=>es.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src));assert.deepEqual(images,[]);
 await move(p,3);await p.getByRole('button',{name:'Show GOLDADAN',exact:true}).click();await p.waitForFunction(()=>Math.abs(Number(document.querySelector('.portfolio').dataset.progress)-4)<.003);assert.equal(await p.getByRole('button',{name:'Show GOLDADAN',exact:true}).getAttribute('aria-pressed'),'true');
 await move(p,6);const issuer=()=>p.locator('.active-credential .eyebrow').innerText();assert.match(await issuer(),/University of London/);
 const issuers=[];for(let i=0;i<9;i++){issuers.push(await issuer());await p.getByRole('button',{name:'Next credential',exact:true}).click();await p.waitForTimeout(460);}
 assert.deepEqual([...new Set(issuers.map(x=>x.split(' / ')[0]))],['University of London','Microsoft','Duke University','Packt']);
 const box=await p.locator('.certificate-stack').boundingBox(),x=box.x+box.width*.8,y=box.y+box.height*.45;
 if(w<760){const cdp=await ctx.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=16;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-box.width*.6*i/16,y}]});await p.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}else{await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x-box.width*.6,y,{steps:16});await p.mouse.up();}
 await p.waitForTimeout(500);assert.match(await issuer(),/Microsoft/);
 await p.locator('.certificate-stack').press('ArrowLeft');await p.waitForTimeout(500);assert.match(await issuer(),/University of London/);
 const downloadPromise=p.waitForEvent('download');await p.locator('.credential-actions a[download]').click();const download=await downloadPromise;assert.ok((await download.suggestedFilename()).endsWith('.pdf'));
 if(w===1440||w===390){for(const n of [0,1,2,3,4,5,6,7]){await move(p,n);const result=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({w,p:n,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});}}
 for(const n of [5,3,2,1,0]){await move(p,n);const expected=row.poses.find(x=>x.p===n);assert.deepEqual(await p.evaluate(()=>window.__journeyWorld.camera),expected.world.camera);assert.equal(await p.locator('.shared-portrait').getAttribute('style'),expected.portrait);}
 await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
 report.viewports.push(row);report.interactions.push({w,filters:true,manualProject:true,issuerOrder:issuers,gesture:w<760?'touch':'mouse',keyboard:true,download:true,reverse:true});await ctx.close();
}
const inventory=JSON.parse(await fs.readFile('src/data/certificates.json','utf8'));for(const c of inventory){const response=await fetch(url+c.downloadPath);assert.equal(response.status,200);assert.equal(new TextDecoder().decode((await response.arrayBuffer()).slice(0,4)),'%PDF');}
const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto(url);await p.locator('.world-ready').waitFor();
report.performance=await p.evaluate(async()=>{const frames=[],start=performance.now();let last=start;await new Promise(resolve=>{function tick(now){frames.push(now-last);last=now;scrollTo({top:Math.min(7,(now-start)/7000*7)*innerHeight*1.2,behavior:"instant"});if(now-start<7000)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});const samples=frames.slice(5).sort((a,b)=>a-b),mean=samples.reduce((a,b)=>a+b,0)/samples.length;return {viewport:[innerWidth,innerHeight],userAgent:navigator.userAgent,frames:samples.length,meanFrameMs:mean,meanFPS:1000/mean,p95FrameMs:samples[Math.floor(samples.length*.95)],over33ms:samples.filter(x=>x>33.34).length,world:window.__journeyWorld};});
await p.close();
for(const option of [{reducedMotion:'reduce'},{}]){const context=await b.newContext(option);const p=await context.newPage();if(!option.reducedMotion)await p.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});await p.goto(url);await p.locator('.reading-mode').waitFor();assert.equal(await p.locator('.project-composition').count(),3);await p.close();await context.close();}
assert.deepEqual(report.errors,[]);await b.close();await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,viewports:report.viewports.length,performance:report.performance},null,2));
