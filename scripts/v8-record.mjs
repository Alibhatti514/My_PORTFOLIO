import { chromium } from "playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const out = "docs/spatial-v8/qa",
  url = process.env.QA_URL || "http://127.0.0.1:4198";
const b = await chromium.launch({ channel: "chrome" });
for (const [name, width, height] of [
  ["desktop", 1440, 900],
  ["mobile", 390, 844],
  ["tablet", 768, 1024],
].filter(([name]) => !process.env.RECORD_ONLY || process.env.RECORD_ONLY === name)) {
  const ctx = await b.newContext({
      viewport: { width, height },
      hasTouch: name === "mobile",
      recordVideo: { dir: `${out}/record-tmp`, size: { width, height } },
    }),
    p = await ctx.newPage();
  await p.goto(url);
  await p.locator(".world-ready").waitFor();
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1100);
  for (const n of [.25,.5,.75]) { await moveEarly(n); }
  async function moveEarly(n) { await p.evaluate(n=>scrollTo({top:n*innerHeight*1.2,behavior:"smooth"}),n);await p.waitForTimeout(1500);await p.screenshot({path:`${out}/hero-${name}-${n}.png`}); }
  await p.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await p.waitForTimeout(1100);
  await p.screenshot({path:`${out}/recorded-${name}-0.png`});
  const move = async (destination, duration = 2600) => {
    await p.evaluate(
      async ({ destination, duration }) => {
        const from = scrollY,
          to = destination * innerHeight * 1.2,
          t = performance.now();
        await new Promise((resolve) => {
          function tick(now) {
            const x = Math.min(1, (now - t) / duration),
              ease = x * x * (3 - 2 * x);
            scrollTo({ top: from + (to - from) * ease, behavior: "instant" });
            if (x < 1) requestAnimationFrame(tick);
            else resolve();
          }
          requestAnimationFrame(tick);
        });
      },
      { destination, duration },
    );
    await p.waitForTimeout(400);
  };
  for (let i = 1; i < 8; i++) {
    await move(i);
    await p.waitForTimeout(600);
    if (i === 1) {
      if (name === 'mobile') {
        const touch = await ctx.newCDPSession(p);
        await touch.send('Input.synthesizeScrollGesture', {x:width*.5,y:height*.65,yDistance:-180,speed:350,gestureSourceType:'touch'});
        await touch.detach();
      } else {
        await p.mouse.wheel(0,130);
        for(let step=0;step<6;step++)await p.mouse.wheel(0,8);
      }
      await p.waitForTimeout(500);await move(1,900);
    }
    if (i === 3) {await move(3.5,1800);await p.waitForTimeout(700);await move(3,1800);}
    if (i === 2) {
      const python = p.getByRole("button", { name: "Python", exact: true });
      if (name === "mobile") await python.tap();
      else await python.hover();
      await python.focus();
      await p.waitForTimeout(700);
      await p
        .getByRole("button", { name: "Frontend", exact: true })
        .click();
      await p.waitForTimeout(600);
      for(const category of ["Languages","Backend","Data","Tools","All"]){await p.getByRole("button",{name:category,exact:true}).click();await p.waitForTimeout(700);}
      await p.screenshot({path:`${out}/recorded-${name}-skills.png`});
    }
    await p.screenshot({path:`${out}/recorded-${name}-${i}.png`});
    if(i===4){await p.getByRole("button",{name:"Show BHABHI THULLA",exact:true}).click();await p.waitForTimeout(1600);await move(4,1600);}
    if (i === 6) {
      const box = await p.locator(".certificate-stack").boundingBox(),
        from = box.x + box.width * 0.8,
        to = box.x + box.width * 0.2,
        y = box.y + box.height * 0.5;
      const before = await p.locator(".active-credential h3").innerText();
      if (name === "mobile") {
        const cdp = await ctx.newCDPSession(p);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: from, y }],
        });
        for (let j = 1; j <= 18; j++) {
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: from + ((to - from) * j) / 18, y }],
          });
          await p.waitForTimeout(20);
        }
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        await cdp.detach();
      } else {
        await p.mouse.move(from, y);
        await p.mouse.down();
        await p.mouse.move(to, y, { steps: 25 });
        await p.mouse.up();
      }
      assert.notEqual(
        await p.locator(".active-credential h3").innerText(),
        before,
      );
      await p.waitForTimeout(800);
      await p
        .getByRole("button", {
          name: "Show Object-Oriented Programming in Python, Duke University",
          exact: true,
        })
        .click();
      await p.waitForTimeout(1100);
      await p
        .getByRole("button", { name: "Next credential", exact: true })
        .click();
      await p.waitForTimeout(1100);
      await p.getByRole("button",{name:"Next credential",exact:true}).click();await p.waitForTimeout(1100);
      await p.screenshot({path:`${out}/recorded-${name}-packt.png`});
    }
  }
  await p.waitForTimeout(1000);
  await move(0, 9000);
  await p.waitForTimeout(700);
  const video = p.video();
  await ctx.close();
  await video.saveAs(`${out}/journey-${name}.webm`);
  console.log(`${name}: continuous journey, interaction and reverse recording`);
}
await b.close();
await fs.rm(`${out}/record-tmp`, { recursive: true, force: true });
