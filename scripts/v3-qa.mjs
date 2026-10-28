import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = "docs/burgundy-cream/qa",
  url = process.env.QA_URL || "http://127.0.0.1:4174";
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" }),
  report = {
    errors: [],
    viewports: [],
    boundaries: [],
    interactions: [],
    accessibility: [],
  };
const settle = async (page, p) => {
  await page.evaluate(
    (n) => scrollTo({ top: n * innerHeight * 1.2, behavior: "instant" }),
    p,
  );
  await page.waitForTimeout(120);
  await page.evaluate(
    (n) => scrollTo({ top: n * innerHeight * 1.2, behavior: "instant" }),
    p,
  );
  await page.waitForFunction(
    (n) =>
      Math.abs(
        Number(document.querySelector(".portfolio").dataset.progress) - n,
      ) < 0.0012,
    p,
  );
  await page.waitForTimeout(150);
};
const scan = async (page, label) => {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  report.accessibility.push({
    label,
    violations: r.violations.map((v) => ({
      id: v.id,
      description: v.description,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  await fs.writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
};
for (const [name, width, height] of [
  ["desktop", 1440, 900],
  ["laptop", 1366, 768],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
  ["small-mobile", 320, 568],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: width < 800,
    ...(process.env.QA_RECORD && ["desktop", "mobile"].includes(name)
      ? { recordVideo: { dir: `${out}/video-tmp`, size: { width, height } } }
      : {}),
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(`${name}: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") report.errors.push(`${name}: ${m.text()}`);
  });
  await page.goto(url);
  await page.locator(".world-ready").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.locator("canvas").evaluate((el) => {
    window.qaCanvas = el;
  });
  const states = [];
  for (let i = 0; i < 8; i++) {
    if (["desktop", "mobile"].includes(name) && i > 0) {
      await page.evaluate(async (n) => {
        const start = scrollY,
          end = n * innerHeight * 1.2,
          t = performance.now();
        await new Promise((resolve) => {
          function frame(now) {
            const x = Math.min(1, (now - t) / 1900);
            scrollTo({ top: start + (end - start) * x, behavior: "instant" });
            if (x < 1) requestAnimationFrame(frame);
            else resolve();
          }
          requestAnimationFrame(frame);
        });
      }, i);
    }
    await settle(page, i);
    await page.screenshot({ path: `${out}/${name}-${i}.png` });
    const state = await page.evaluate(() => ({
      world: window.__journeyWorld,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      sameCanvas: document.querySelector("canvas") === window.qaCanvas,
      stageScroll: document.querySelector(".story-content").scrollTop,
      portrait: getComputedStyle(document.querySelector(".shared-portrait"))
        .opacity,
    }));
    states.push(state);
    assert.equal(
      state.stageScroll,
      0,
      `${name} ${i}: focus must not scroll the fixed stage`,
    );
    assert.ok(!state.overflow, `${name} ${i}: horizontal overflow`);
    assert.ok(state.sameCanvas);
    const panel = page.locator(`.panel-${i}`);
    assert.equal(await panel.getAttribute("aria-hidden"), null);
    if (name === "desktop" || name === "mobile")
      await scan(page, `${name}-${i}`);
    if (i === 2) {
      await page.getByRole("button", { name: "Python", exact: true }).click();
      assert.match(
        await page.locator(".skill-inspector").innerText(),
        /Duke University/,
      );
      await page
        .getByRole("button", { name: "Completed study", exact: true })
        .click();
      await page
        .getByRole("button", { name: "C# 12, completed study", exact: true })
        .focus();
      assert.match(
        await page.locator(".skill-inspector").innerText(),
        /C# 12 and .NET 8/,
      );
      await page.screenshot({ path: `${out}/${name}-skill-interaction.png` });
      await page.getByRole("button", { name: "All", exact: true }).click();
      report.interactions.push(
        `${name}: skill selection, keyboard focus, category filter`,
      );
    }
    if (i === 3) {
      await page
        .getByRole("button", { name: "Show GOLDADAN", exact: true })
        .click();
      await settle(page, 4);
      await page
        .getByRole("button", { name: "Show RCS CARGO", exact: true })
        .click();
      await settle(page, 3);
      report.interactions.push(`${name}: project navigation`);
    }
    if (i === 6) {
      const before = await page.locator(".active-credential h3").innerText();
      const box = await page.locator(".certificate-stack").boundingBox();
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5, {
        steps: 18,
      });
      await page.mouse.up();
      assert.notEqual(
        await page.locator(".active-credential h3").innerText(),
        before,
      );
      assert.equal(
        await page.locator(".preview-dialog[open]").count(),
        0,
        "swipe must not open preview",
      );
      await page
        .getByRole("button", {
          name: "Show Object-Oriented Programming in Python, Duke University",
          exact: true,
        })
        .click();
      assert.match(
        await page.locator(".active-credential").innerText(),
        /Duke University/,
      );
      await page.screenshot({ path: `${out}/${name}-duke-oop.png` });
      await page
        .getByRole("button", { name: "Next credential", exact: true })
        .click();
      assert.match(
        await page.locator(".active-credential").innerText(),
        /Web Scraping/,
      );
      await page.screenshot({ path: `${out}/${name}-duke-scraping.png` });
      await page
        .getByRole("button", { name: "Inspect", exact: false })
        .first()
        .click();
      await page.locator(".preview-dialog[open]").waitFor();
      await page.screenshot({ path: `${out}/${name}-preview.png` });
      await scan(page, `${name}-preview`);
      await page.keyboard.press("Escape");
      const download = page.waitForEvent("download");
      await page.locator(".credential-actions a[download]").click();
      assert.ok((await download).suggestedFilename().endsWith(".pdf"));
      await page
        .getByRole("button", {
          name: "Explore all 40 credentials",
          exact: false,
        })
        .click();
      await page.locator(".library-dialog[open]").waitFor();
      assert.equal(await page.locator(".library-row").count(), 40);
      await page.getByRole("searchbox").fill("Python");
      assert.equal(await page.locator(".library-row").count(), 2);
      await page.getByRole("searchbox").fill("");
      await page
        .getByRole("combobox", { name: "Issuer", exact: true })
        .selectOption("Duke University");
      assert.equal(await page.locator(".library-row").count(), 2);
      await page.screenshot({ path: `${out}/${name}-library.png` });
      await scan(page, `${name}-library`);
      await page
        .getByRole("button", { name: "Close certificate library" })
        .click();
      report.interactions.push(
        `${name}: certificate drag, Duke records, preview, escape, download, 40-file archive, search, issuer filter`,
      );
    }
  }
  report.viewports.push({ name, width, height, states });
  if (name === "desktop") {
    for (let i = 0; i < 7; i++) {
      const samples = [];
      for (const offset of [0.49, 0.5, 0.51]) {
        await settle(page, i + offset);
        await page.screenshot({ path: `${out}/join-${i}-${offset}.png` });
        samples.push(await page.evaluate(() => window.__journeyWorld));
      }
      assert.ok(
        samples[0].camera[1] > samples[1].camera[1] &&
          samples[1].camera[1] > samples[2].camera[1],
      );
      report.boundaries.push({ join: i, samples });
    }
  }
  for (let i = 7; i >= 0; i--) {
    await settle(page, i);
    const now = await page.evaluate(() => window.__journeyWorld.camera);
    assert.ok(
      Math.hypot(...now.map((v, k) => v - states[i].world.camera[k])) < 0.012,
      `${name}: reverse pose ${i}`,
    );
  }
  await page.screenshot({ path: `${out}/${name}-reverse-hero.png` });
  // Verify real navigation and external profile destinations without contacting those accounts.
  if (width < 760) {
    await page.getByRole("button", { name: "Menu", exact: false }).click();
    await page.locator('#mobile-menu a[href="#skills"]').click();
  } else await page.locator('.site-header nav a[href="#skills"]').click();
  await page.waitForFunction(
    () =>
      Math.abs(
        Number(document.querySelector(".portfolio").dataset.progress) - 2,
      ) < 0.008,
  );
  await settle(page, 2);
  await page.locator(".wordmark").click();
  await page.waitForFunction(
    () => Number(document.querySelector(".portfolio").dataset.progress) < 0.008,
  );
  await settle(page, 0);
  assert.equal(
    await page
      .locator('.hero-left a[aria-label^="GitHub"]')
      .getAttribute("href"),
    "https://github.com/Alibhatti514",
  );
  await page
    .getByRole("button", { name: "Reading view", exact: false })
    .click();
  await page.locator(".reading-mode").waitFor();
  assert.equal(await page.locator("canvas").count(), 0);
  await page.locator(".panel-1 summary").click();
  assert.match(
    await page.locator(".about-history").innerText(),
    /Punjab University/,
  );
  await page.screenshot({ path: `${out}/${name}-reading.png`, fullPage: true });
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(`${out}/journey-${name}.webm`);
  console.log(`Verified ${name}`);
}
const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  }),
  page = await context.newPage();
await page.goto(url);
await page.locator(".reading-mode").waitFor();
assert.equal(await page.locator("canvas").count(), 0);
await scan(page, "reduced-motion");
await page.screenshot({ path: `${out}/reduced-motion.png`, fullPage: true });
await context.close();
// Unsupported WebGL must expose the same complete stationary content.
const fallback = await browser.newContext();
await fallback.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (String(type).includes("webgl")) return null;
    return original.call(this, type, ...args);
  };
});
const fp = await fallback.newPage();
await fp.goto(url);
await fp.locator(".reading-mode").waitFor();
assert.equal(await fp.locator("canvas").count(), 0);
assert.equal(await fp.locator(".scene-panel").count(), 8);
report.interactions.push(
  "Reduced motion and unsupported-WebGL reading fallbacks",
);
await fallback.close();
await browser.close();
await fs.rm(`${out}/video-tmp`, { recursive: true, force: true });
report.status=report.errors.length===0&&report.viewports.length===5&&report.boundaries.length===7&&report.accessibility.every(a=>a.violations.length===0)?'passed':'failed';
await fs.writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
assert.equal(
  report.accessibility.filter((r) => r.violations.length).length,
  0,
  JSON.stringify(
    report.accessibility.filter((r) => r.violations.length),
    null,
    2,
  ),
);
console.log(
  `PASS: ${report.viewports.length} viewports; ${report.boundaries.length} boundaries; ${report.accessibility.length} accessibility scans`,
);
