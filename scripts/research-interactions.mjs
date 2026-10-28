import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out='docs/continuous-world/research';
const b=await chromium.launch({channel:'chrome',headless:true});
const names=['majd-portfolio','michael-gr8r','devsync','reoporto','nightlytemplate','reserved-nonogon-623534','portox'];
const results=await Promise.all(names.map(async name=>{
 const p=await b.newPage({viewport:{width:1440,height:900}}); const r={name};
 try{
 await p.goto(`https://${name}.${name.startsWith('reserved')?'framer.app':'framer.website'}`,{waitUntil:'domcontentloaded',timeout:25000});
 await p.waitForTimeout(1000);
 const sample=()=>p.locator('h1,h2,img,[data-framer-name]').evaluateAll(es=>es.slice(0,100).map(e=>({name:e.getAttribute('data-framer-name'),text:e.textContent?.slice(0,35),transform:getComputedStyle(e).transform,opacity:getComputedStyle(e).opacity,top:e.getBoundingClientRect().top})));
 r.before=await sample(); await p.mouse.wheel(0,1100); await p.waitForTimeout(150); r.moving=await sample(); await p.screenshot({path:`${out}/${name}-motion-mid.png`}); await p.waitForTimeout(900); r.settled=await sample();
 const target=p.locator('a').filter({has:p.locator('img')}).first();
 if(await target.count()){await target.scrollIntoViewIfNeeded();await target.hover(); await p.waitForTimeout(350);await p.screenshot({path:`${out}/${name}-project-hover.png`});r.hover='image link';}else{await p.locator('a').first().hover(); r.hover='first link';}
 await p.setViewportSize({width:390,height:844}); await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(400);
 const menu=p.getByRole('button',{name:/menu|navigation/i}).first();
 if(await menu.count()){await menu.click();await p.waitForTimeout(400);r.menu='clicked';}
 await p.screenshot({path:`${out}/${name}-mobile-interaction.png`});
 r.ok=true;
 }catch(e){r.error=e.message;} await p.close();return r;
}));
await fs.writeFile(`${out}/interactions.json`,JSON.stringify(results,null,2));await b.close();console.log(results.map(({name,ok,error})=>({name,ok,error})));
