import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = "docs/continuous-world/qa";
await fs.mkdir(out, { recursive: true });
const url = process.env.QA_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const report = {};
const goto = async (p, point) => {
  await p.evaluate(
    (n) => scrollTo({ top: n * innerHeight * 1.1, behavior: "instant" }),
    point,
  );
  await p.waitForTimeout(1000);
};
await page.goto(url);
await page.locator(".world-ready").waitFor();
await page.waitForTimeout(1400);
const canvas = page.locator("canvas[data-world]");
const canvasIdentity = await canvas.evaluate((e) => {
  window.testCanvas = e;
  return true;
});
assert.ok(canvasIdentity);
const cameras = [];
for (let i = 0; i < 8; i++) {
  if (i > 0) {
    for (let j = 1; j <= 15; j++) {
      await page.evaluate(
        (n) => scrollTo({ top: n * innerHeight * 1.1, behavior: "instant" }),
        i - 1 + j / 15,
      );
      await page.waitForTimeout(70);
    }
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: `${out}/desktop-${i}.png` });
  cameras.push(await canvas.getAttribute("data-camera"));
  assert.equal(
    await canvas.evaluate((e) => e === window.testCanvas),
    true,
    "canvas must remain mounted",
  );
  if (i === 2) {
    await page.getByRole("button", { name: "Python", exact: true }).click();
    assert.match(
      await page.locator(".skill-inspector").innerText(),
      /Duke University/,
    );
    await page.screenshot({ path: `${out}/skills-selected.png` });
    await page
      .getByRole("button", { name: "C# / .NET 8", exact: true })
      .focus();
    assert.match(
      await page.locator(".skill-inspector").innerText(),
      /COMPLETED STUDY/,
    );
  }
  if (i === 6) {
    await page
      .getByRole("button", { name: "Next credential", exact: true })
      .click();
    await page.waitForTimeout(800);
    assert.match(
      await page.locator(".active-credential").innerText(),
      /University of London/,
    );
    await page.screenshot({ path: `${out}/credential-rotated.png` });
    await page.mouse.move(1130, 430);
    await page.mouse.down();
    await page.mouse.move(850, 430, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(900);
    assert.match(
      await page.locator(".active-credential").innerText(),
      /Mastering Node/,
    );
    await page
      .getByRole("button", { name: "Inspect certificate", exact: false })
      .click();
    await page.screenshot({ path: `${out}/certificate-preview.png` });
    await page.keyboard.press("Escape");
  }
}
assert.ok(new Set(cameras).size >= 7);
report.cameraPositions = cameras;
// Every outgoing/incoming join is sampled, with the same canvas and no world reset.
report.continuity = [];
for (let i = 0; i < 7; i++) {
  const states = [];
  for (const delta of [-0.015, 0.015]) {
    await goto(page, i + 0.5 + delta);
    await page.screenshot({
      path: `${out}/boundary-${i}-${delta < 0 ? "out" : "in"}.png`,
    });
    states.push(
      (await canvas.getAttribute("data-camera")).split(",").map(Number),
    );
    assert.equal(await canvas.evaluate((e) => e === window.testCanvas), true);
  }
  const cameraDelta = Math.hypot(...states[0].map((v, k) => v - states[1][k]));
  assert.ok(cameraDelta < 0.25);
  report.continuity.push({ boundary: i, cameraDelta });
}
await goto(page, 0);
assert.equal(await canvas.getAttribute("data-camera"), cameras[0]);
report.reverseCamera = true;
await goto(page, 6);
await page.getByRole("button", { name: "Open all 40 credentials" }).click();
const library = page.locator(".library-dialog");
await library.waitFor({ state: "visible" });
assert.equal(await library.locator(".library-row").count(), 40);
await library.getByRole("searchbox").fill("python");
assert.equal(await library.locator(".library-row").count(), 2);
await library.getByRole("searchbox").fill("nothing-matches");
assert.equal(await library.locator(".library-row").count(), 0);
await library.getByRole("button", { name: "Reset filters" }).click();
await library.getByLabel("Issuer", { exact: true }).selectOption("Microsoft");
assert.equal(await library.locator(".library-row").count(), 19);
await library.getByLabel("Issuer", { exact: true }).selectOption("All issuers");
await library.getByLabel("Credential type").selectOption("Specialization");
assert.equal(await library.locator(".library-row").count(), 4);
await page.screenshot({ path: `${out}/library-filtered.png` });
await page.keyboard.press("Escape");
const certs = JSON.parse(
  await fs.readFile("src/data/certificates.json", "utf8"),
);
for (const c of certs) {
  const r = await page.request.get(url + c.downloadPath);
  assert.equal(r.status(), 200);
  assert.equal((await r.body()).subarray(0, 4).toString(), "%PDF");
}
report.certificateDownloads = 40;
await goto(page, 7);
for (const mode of ["Premium", "ATS"]) {
  const [d] = await Promise.all([
    page.waitForEvent("download"),
    page.locator(`.finale-right a[href$="Resume-${mode}.pdf"]`).click(),
  ]);
  assert.equal(d.suggestedFilename(), `Resume-${mode}.pdf`);
}
report.resumeDownloads = true;
report.accessibility = [];
for (const i of [0, 1, 2, 3, 6, 7]) {
  await goto(page, i);
  const a = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  report.accessibility.push({
    scene: i,
    violations: a.violations.map((v) => ({
      id: v.id,
      description: v.description,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
}
await fs.writeFile(
  `${out}/partial-report.json`,
  JSON.stringify(report, null, 2),
);
// Mobile scene geometry stays enabled. Touch gestures do not intercept vertical scrolling.
for (const width of [320, 390, 768]) {
  const p = await browser.newPage({
    viewport: { width, height: width === 320 ? 700 : 844 },
    isMobile: width < 760,
    hasTouch: width < 760,
  });
  await p.goto(url);
  await p.locator(".world-ready").waitFor();
  for (const i of [0, 1, 2, 3, 6, 7]) {
    await goto(p, i);
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.screenshot({ path: `${out}/responsive-${width}-${i}.png` });
  }
  await p.close();
}
const reducedContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const reduced = await reducedContext.newPage();
await reduced.goto(url);
await reduced.locator(".reading-mode").waitFor();
assert.equal(await reduced.locator("canvas").count(), 0);
assert.equal(
  await reduced.locator(".scene-panel[aria-hidden=true]").count(),
  0,
);
await reduced.screenshot({ path: `${out}/reduced-motion.png` });
const a = await new AxeBuilder({ page: reduced })
  .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  .analyze();
report.accessibility.push({
  scene: "reduced-motion",
  violations: a.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => n.target),
  })),
});
await reducedContext.close();
// Force a real WebGL context loss and verify automatic content recovery.
await goto(page, 0);
await canvas.evaluate((c) =>
  c.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext(),
);
await page.locator(".reading-mode").waitFor();
assert.equal(
  await page.getByRole("heading", { name: /Curiosity is/ }).count(),
  1,
);
report.contextLossFallback = true;
report.errors = errors;
await page.close();
await context.close();
await browser.close();
await fs.writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
assert.equal(errors.length, 0);
assert.equal(
  report.accessibility.reduce((n, x) => n + x.violations.length, 0),
  0,
);
