import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const out='docs/certificate-tilt-v8/qa',url=process.env.QA_URL||'http://127.0.0.1:4200';
await fs.mkdir(out,{recursive:true});const b=await chromium.launch({channel:'chrome'}),report=[];
for(const [name,w,h] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844],['small-mobile',375,667]].filter(([name])=>!process.env.QA_DEVICES||process.env.QA_DEVICES.split(',').includes(name))) {
 const context=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1100,recordVideo:{dir:`${out}/temporary-${process.pid}`,size:{width:w,height:h}}}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto(url+'/#credentials');await p.locator('.world-ready').waitFor();await p.mouse.move(15,h/2);await p.waitForTimeout(1200);
 const current=()=>p.locator('.featured-index [aria-pressed=true]').innerText();
 const matrix=async(index)=>p.locator('.circular-sheet').nth(index).evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform),paper=e.querySelector('.certificate-paper'),n=new DOMMatrix(getComputedStyle(paper).transform);return {values:[...m.toFloat64Array(),...n.toFloat64Array()],z:m.m43,scale:Math.hypot(m.m11,m.m12,m.m13)*Math.hypot(n.m11,n.m12,n.m13),rotation:[n.m12,n.m13,n.m21,n.m23,n.m31,n.m32],shadow:getComputedStyle(paper).boxShadow};});
 const straightened=async(index)=>p.waitForFunction(index=>{const e=document.querySelectorAll('.circular-sheet')[index],m=new DOMMatrix(getComputedStyle(e.querySelector('.certificate-paper')).transform);return e.dataset.engaged==='true'&&[m.m12,m.m13,m.m21,m.m23,m.m31,m.m32].every(v=>Math.abs(v)<.001);},index);
 const outside=async()=>{await p.mouse.move(15,h/2);await p.evaluate(()=>document.activeElement?.blur?.());await p.waitForTimeout(650);};
 // Find a real exposed part of a sheet, rather than forcing a click through the foreground.
 const exposed=async(index)=>p.locator('.circular-sheet').nth(index).evaluate(e=>{
   const r=e.getBoundingClientRect();for(let yi=1;yi<10;yi++)for(let xi=1;xi<10;xi++){const x=r.x+r.width*xi/10,y=r.y+r.height*yi/10;if(document.elementFromPoint(x,y)?.closest('.circular-sheet')===e)return {x,y};}return null;
 });
 async function settled(expected){
  await outside();await p.waitForTimeout(400);assert.equal(await current(),String(expected).padStart(2,'0'));
  const result=await p.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom}};const es=[...document.querySelectorAll('.circular-sheet')],front=document.querySelector('.sheet-front'),r=front.getBoundingClientRect();return {layers:es.map(e=>rect(e.querySelector('.certificate-paper'))),front:rect(front),copy:rect(document.querySelector('.credential-copy')),nav:rect(document.querySelector('.featured-index')),caption:rect(document.querySelector('.certificate-stack>.eyebrow')),captionVisible:getComputedStyle(document.querySelector('.certificate-stack>.eyebrow')).display!=='none',loaded:es.every(e=>{const im=e.querySelector('img');return im.complete&&im.naturalWidth>0}),accessible:es.every(e=>!e.inert&&e.getAttribute('aria-hidden')!=='true'&&e.getAttribute('aria-label')&&e.tabIndex>=0),top:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.circular-sheet')?.dataset.front,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(result.loaded,true);assert.equal(result.accessible,true);assert.equal(result.top,'true');assert.equal(result.overflow,false);
  for(const r of result.layers){assert.ok(r.x>=0&&r.right<=w,`${name} horizontal clipping`);assert.ok(r.bottom<result.nav.y-2,`${name} nav overlap`);if(w>=760)assert.ok(r.x>result.copy.right+5,`${name} text overlap`);if(result.captionVisible)assert.ok(r.bottom<result.caption.y-2,`${name} drag instruction overlap`);}
  return result;
 }
 const initial=await settled(1);await p.screenshot({path:`${out}/${name}-default.png`});
 const base=await matrix(1),other=await matrix(3);
 if(w===1440){
  const point=await exposed(1);assert.ok(point);await p.mouse.move(point.x,point.y);await straightened(1);
  const hovered=await matrix(1);assert.equal(await current(),'01');assert.ok(hovered.rotation.every(v=>Math.abs(v)<.001),'hover must straighten all axes');assert.ok(hovered.z>base.z+28);assert.ok(Math.abs(hovered.scale/base.scale-1.04)<.003);assert.notEqual(hovered.shadow,base.shadow);assert.deepEqual(await matrix(3),other);
  await p.screenshot({path:`${out}/${name}-hover.png`});await outside();const restored=await matrix(1);restored.values.forEach((v,i)=>assert.ok(Math.abs(v-base.values[i])<.001));await p.screenshot({path:`${out}/${name}-leave.png`});
  for(let rear=2;rear<9;rear++){
    const hit=await exposed(rear);assert.ok(hit,`background ${rear} must have an exposed interactive area`);
    await p.mouse.move(hit.x,hit.y);await straightened(rear);assert.equal(await current(),'01');
    await p.screenshot({path:`${out}/${name}-hover-${rear}.png`});await outside();
  }
 }
 // Keyboard focus gets the same elevation and straightening; Space intentionally selects.
 await p.locator('.circular-sheet').nth(1).focus();await straightened(1);const focused=await matrix(1);assert.ok(focused.rotation.every(v=>Math.abs(v)<.001));assert.equal(await current(),'01');await p.screenshot({path:`${out}/${name}-focus.png`});await p.locator('.circular-sheet').nth(1).press('Space');await settled(2);
 await p.screenshot({path:`${out}/${name}-keyboard-selected.png`});
 await p.locator('.circular-sheet').nth(2).focus();await straightened(2);await p.locator('.circular-sheet').nth(2).press('Enter');await settled(3);
 await p.locator('.featured-index button').nth(1).click();await settled(2);
 const target=2,point=await exposed(target);assert.ok(point,`${name} exposed tappable rear certificate`);
 if(w<1100)await p.touchscreen.tap(point.x,point.y);else await p.mouse.click(point.x,point.y);
 await p.waitForTimeout(280);await p.screenshot({path:`${out}/${name}-selection-transition.png`});await settled(3);assert.equal(await p.locator('.preview-dialog[open]').count(),0,'select must not open inspect');await p.screenshot({path:`${out}/${name}-selected.png`});
 await p.getByRole('button',{name:'Next credential',exact:true}).click();await settled(4);await p.getByRole('button',{name:'Previous credential',exact:true}).click();await settled(3);
 await p.locator('.certificate-stack').focus();await p.locator('.certificate-stack').press('ArrowRight');await settled(4);
 const box=await p.locator('.sheet-front').boundingBox(),x=box.x+box.width*.8,y=box.y+box.height*.5;
 if(w<1100){const cdp=await context.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-box.width*.55*i/12,y}]});await p.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}else{await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x-box.width*.55,y,{steps:20});await p.mouse.up();}
 await settled(5);assert.equal(await p.locator('.preview-dialog[open]').count(),0);await p.screenshot({path:`${out}/${name}-gesture.png`});
 for(let i=0;i<12;i++)await p.getByRole('button',{name:'Next credential',exact:true}).click();await settled(8);
 for(let i=0;i<9;i++){await p.locator('.featured-index button').nth(i).click();await settled(i+1);}
 await p.locator('.sheet-front').click();await p.locator('.preview-dialog[open]').waitFor();await p.getByRole('button',{name:'Close certificate preview'}).click();
 const download=p.waitForEvent('download');await p.locator('.credential-actions a[download]').click();assert.ok((await (await download).suggestedFilename()).endsWith('.pdf'));
 const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);assert.deepEqual(errors,[]);
 const video=p.video();await context.close();await video.saveAs(`${out}/${name}.webm`);report.push({name,initial,hover:w===1440,focus:true,spaceSelection:true,enterSelection:true,tapOrClick:true,arrows:true,gesture:true,allNine:true,inspect:true,download:true,errors,axeViolations:0});console.log(`Passed ${name}`);
}
await b.close();await fs.writeFile(`${out}/report.json`,JSON.stringify({passed:true,viewports:report},null,2));await fs.rm(`${out}/temporary-${process.pid}`,{recursive:true,force:true});
