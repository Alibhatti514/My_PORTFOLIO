import { chromium } from "playwright";
import fs from "node:fs/promises";
const out = new URL("../docs/redesign/research-2026", import.meta.url).pathname;
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
let results = [];
for (const name of [
  "existing",
  "majd-portfolio",
  "michael-gr8r",
  "devsync",
  "reoporto",
  "nightlytemplate",
  "reserved-nonogon-623534",
  "portox",
]) {
  const url =
    name === "existing"
      ? "http://127.0.0.1:4173"
      : `https://${name}.${name === "reserved-nonogon-623534" ? "framer.app" : "framer.website"}/`;
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  let r = { name, url };
  try {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    } catch {
      await page.goto(url, { waitUntil: "commit", timeout: 30000 });
    }
    await page.waitForTimeout(2500);
    r.title = await page.title();
    r.text = (await page.locator("body").innerText()).slice(0, 16000);
    r.fonts = await page
      .locator("h1,h2")
      .evaluateAll((es) =>
        es
          .slice(0, 8)
          .map((e) => ({
            text: e.textContent,
            font: getComputedStyle(e).fontFamily,
            size: getComputedStyle(e).fontSize,
          })),
      );
    r.canvas = await page.locator("canvas").count();
    await page.screenshot({ path: `${out}/${name}-desktop.png` });
    await page.screenshot({
      path: `${out}/${name}-full.png`,
      fullPage: true,
      timeout: 30000,
    });
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let n = 1; n <= 3; n++) {
      await page.evaluate((y) => scrollTo(0, y), (height * n) / 4);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${out}/${name}-scroll-${n}.png` });
    }
    const link = page.locator("a").first();
    if (await link.count()) await link.hover().catch(() => {});
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/${name}-mobile.png` });
    r.status = "rendered";
    if (name === "existing") {
      for (const width of [1280, 768]) {
        await page.setViewportSize({ width, height: 900 });
        await page.screenshot({ path: `${out}/existing-${width}.png` });
      }
    }
  } catch (e) {
    r.error = e.message;
  }
  results.push(r);
  await fs.writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(name, r.status || r.error);
  await page.close();
}
await browser.close();
