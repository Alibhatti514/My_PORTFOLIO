import { chromium } from "playwright";
import fs from "node:fs/promises";
const out = "docs/continuous-world/qa";
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: `${out}/motion-temp`,
    size: { width: 1440, height: 900 },
  },
});
const p = await ctx.newPage();
await p.goto(process.env.QA_URL || "http://127.0.0.1:4174");
await p.locator(".world-ready").waitFor();
await p.waitForTimeout(1800);
for (let i = 1; i <= 7; i++) {
  for (let f = 1; f <= 30; f++) {
    await p.evaluate(
      (n) => scrollTo({ top: n * innerHeight * 1.1, behavior: "instant" }),
      i - 1 + f / 30,
    );
    await p.waitForTimeout(45);
  }
  await p.waitForTimeout(650);
  if (i === 2) {
    await p.getByRole("button", { name: "Python", exact: true }).click();
    await p.waitForTimeout(700);
    await p.getByRole("button", { name: "PostgreSQL", exact: true }).click();
    await p.waitForTimeout(700);
  }
  if (i === 6) {
    await p
      .getByRole("button", { name: "Next credential", exact: true })
      .click();
    await p.waitForTimeout(900);
    await p.mouse.move(1130, 430);
    await p.mouse.down();
    await p.mouse.move(850, 430, { steps: 20 });
    await p.mouse.up();
    await p.waitForTimeout(900);
    await p
      .getByRole("button", { name: "Inspect certificate", exact: false })
      .click();
    await p.waitForTimeout(700);
    await p.keyboard.press("Escape");
  }
}
await p.waitForTimeout(1100);
const video = p.video();
await p.close();
await ctx.close();
await video.saveAs(`${out}/journey-desktop.webm`);
await b.close();
await fs.rm(`${out}/motion-temp`, { recursive: true, force: true });
console.log(`${out}/journey-desktop.webm`);
