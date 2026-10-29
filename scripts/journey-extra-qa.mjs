import { chromium } from "playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const p = await ctx.newPage();
const url = "http://127.0.0.1:4174";
await p.goto(url);
await p.locator(".world-ready").waitFor();
await p.getByRole("button", { name: "Menu" }).click();
await p
  .getByRole("navigation", { name: "Mobile navigation" })
  .getByRole("link", { name: "The collection" })
  .click();
await p.waitForTimeout(1900);
const before = await p.locator(".active-credential h3").innerText();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: 300, y: 280 }],
});
for (let i = 1; i <= 12; i++) {
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 300 - i * 15, y: 280 }],
  });
  await p.waitForTimeout(20);
}
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchEnd",
  touchPoints: [],
});
await p.waitForTimeout(900);
assert.notEqual(await p.locator(".active-credential h3").innerText(), before);
await p.screenshot({
  path: "docs/continuous-world/qa/mobile-touch-rotation.png",
});
await p.evaluate(() =>
  scrollTo({ top: 6.26 * innerHeight * 1.1, behavior: "instant" }),
);
await p.waitForTimeout(1100);
assert.match(
  await p.locator(".active-credential").innerText(),
  /Mastering Node/,
);
const frameTimes = await p.evaluate(
  () =>
    new Promise((resolve) => {
      const times = [];
      let last = performance.now();
      function next(t) {
        times.push(t - last);
        last = t;
        if (times.length < 90) requestAnimationFrame(next);
        else resolve(times.slice(3).sort((a, b) => a - b));
      }
      requestAnimationFrame(next);
    }),
);
const metrics = {
  touchSwipe: true,
  mobileMenu: true,
  scrollRotatesCredentials: true,
  frameMedianMs: frameTimes[Math.floor(frameTimes.length * 0.5)],
  frameP95Ms: frameTimes[Math.floor(frameTimes.length * 0.95)],
};
await ctx.close();
const fallback = await b.newContext();
const f = await fallback.newPage();
await f.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (String(type).includes("webgl")) return null;
    return original.call(this, type, ...args);
  };
});
await f.goto(url);
await f.locator(".reading-mode").waitFor();
await f.screenshot({ path: "docs/continuous-world/qa/no-webgl-fallback.png" });
metrics.initialNoWebGLFallback = true;
await fallback.close();
const social = await b.newPage({ viewport: { width: 1200, height: 630 } });
await social.goto(url);
await social.locator(".world-ready").waitFor();
await social.waitForTimeout(1700);
await social.screenshot({ path: "public/social-card.png" });
await b.close();
await fs.writeFile(
  "docs/continuous-world/qa/extra-report.json",
  JSON.stringify(metrics, null, 2),
);
console.log(metrics);
