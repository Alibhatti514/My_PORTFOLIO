import { chromium } from "playwright";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const base = process.env.QA_URL || "http://127.0.0.1:4174";
const out = "docs/redesign/qa";
await fs.mkdir(out, { recursive: true });
const credentials = JSON.parse(
  await fs.readFile("src/data/certificates.json", "utf8"),
);
const report = {
  base,
  checks: [],
  errors: [],
  failedRequests: [],
  viewports: [],
  screenshots: [],
  accessibility: [],
  performance: {},
};
function check(name, pass, detail) {
  report.checks.push({ name, pass: !!pass, detail });
  console.log(pass ? "PASS" : "FAIL", name, detail || "");
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();
page.on("pageerror", (e) => report.errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") report.errors.push(m.text());
});
page.on("response", (r) => {
  if (r.status() >= 400)
    report.failedRequests.push({ url: r.url(), status: r.status() });
});
async function shot(name) {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: false });
  report.screenshots.push(name);
}
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  check("one semantic h1", (await page.locator("h1").count()) === 1);
  check(
    "decorative WebGL mounted",
    (await page.locator(".system-visual canvas").count()) === 1,
  );
  await shot("desktop-hero");
  for (const id of [
    "work",
    "about",
    "skills",
    "experience",
    "credentials",
    "archive",
    "resume",
    "contact",
  ]) {
    await page
      .locator("#" + id)
      .evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(100);
    await shot("desktop-" + id);
  }
  check(
    "seven program credentials featured",
    (await page.locator(".credential-card").count()) === 7,
  );
  check(
    "all forty certificates in archive",
    (await page.locator(".archive-row").count()) === credentials.length,
  );
  await page.getByLabel("Search credentials").fill("Python");
  check(
    "search matches both Python guided projects",
    (await page.locator(".archive-row").count()) === 2,
  );
  await page.getByLabel("Search credentials").fill("");
  await page.getByLabel("Issuer", { exact: true }).selectOption("Microsoft");
  await page
    .getByLabel("Credential type")
    .selectOption("Professional Certificate");
  check(
    "combined issuer/type filter",
    (await page.locator(".archive-row").count()) === 3,
  );
  await page.getByLabel("Search credentials").fill("no-such-credential-123");
  check(
    "empty state",
    await page.getByText("No matching credentials.").isVisible(),
  );
  await shot("archive-empty");
  await page.getByRole("button", { name: "Reset filters" }).click();
  check(
    "reset restores complete archive",
    (await page.locator(".archive-row").count()) === 40,
  );
  const preview = page.locator(".archive-row").first().getByRole("button");
  await preview.click();
  check(
    "preview is native modal",
    await page
      .locator(".credential-dialog")
      .evaluate((e) => e.matches(":modal")),
  );
  await page.locator(".credential-dialog img").evaluate((e) => e.decode());
  await shot("certificate-preview");
  const focusTrap = await page
    .locator(".credential-dialog")
    .evaluate((e) => e.contains(document.activeElement));
  check("preview receives keyboard focus", focusTrap);
  await page.keyboard.press("Escape");
  check(
    "Escape closes preview",
    !(await page.locator(".credential-dialog").isVisible()),
  );
  check(
    "preview restores trigger focus",
    await preview.evaluate((e) => e === document.activeElement),
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator(".archive-row").first().getByRole("link").click(),
  ]);
  check(
    "browser certificate download has pdf name",
    download.suggestedFilename().endsWith(".pdf"),
  );
  for (const c of credentials) {
    const response = await page.request.get(base + c.downloadPath);
    const bytes = await response.body();
    check(
      `certificate ${c.id} HTTP/hash`,
      response.ok() &&
        createHash("sha256").update(bytes).digest("hex") === c.sha256,
    );
  }
  for (const version of ["Premium", "ATS"]) {
    const response = await page.request.get(
      `${base}/assets/resume/Resume-${version}.pdf`,
    );
    check(
      `resume ${version} production PDF`,
      response.ok() &&
        (await response.body()).subarray(0, 4).toString() === "%PDF",
    );
  }
  for (let i = 0; i < 3; i++) {
    await page.locator(".project-copy .text-link").nth(i).click();
    check(
      `project ${i + 1} opens details`,
      await page.locator(".project-dialog").isVisible(),
    );
    await shot(`project-dialog-${i + 1}`);
    await page.keyboard.press("Escape");
  }
  const socials = await page
    .locator(".social-links a")
    .evaluateAll((es) =>
      es.map((e) => ({ href: e.href, rel: e.rel, target: e.target })),
    );
  check(
    "five safe external social destinations",
    socials.length === 5 &&
      socials.every(
        (s) =>
          s.href.startsWith("https://") &&
          s.rel.includes("noopener") &&
          s.target === "_blank",
      ),
  );
  const links = await page
    .locator('a[href^="#"]')
    .evaluateAll((es) =>
      es.map((e) => ({
        hash: e.hash,
        exists: !!document.getElementById(e.hash.slice(1)),
      })),
    );
  check(
    "all internal anchors resolve",
    links.every((l) => l.exists),
  );
  for (const width of [1920, 1440, 1280, 1024, 768, 430, 390, 375, 320]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(180);
    const size = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    report.viewports.push(size);
    check(`no horizontal overflow at ${width}`, size.scroll <= width);
    await shot(`responsive-${width}-hero`);
    for (const id of [
      "work",
      "about",
      "skills",
      "experience",
      "credentials",
      "archive",
      "resume",
      "contact",
    ]) {
      await page
        .locator("#" + id)
        .evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
      await page.waitForTimeout(60);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      check(`${width} ${id} fits viewport`, !overflow);
      if ([1440, 768, 390, 320].includes(width))
        await shot(`responsive-${width}-${id}`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.getByRole("button", { name: "Open navigation" }).click();
  check(
    "mobile menu modal opens",
    await page.locator("#mobile-menu").evaluate((e) => e.matches(":modal")),
  );
  await shot("mobile-menu");
  await page
    .locator("#mobile-menu")
    .getByRole("link", { name: "Credentials", exact: false })
    .first()
    .click();
  await page.waitForTimeout(100);
  check(
    "mobile navigation closes and reaches section",
    !(await page.locator("#mobile-menu").isVisible()) &&
      (await page.evaluate(() => location.hash === "#credentials")),
  );
  await page.goto(base);
  check(
    "mobile starts with lightweight 3D poster",
    (await page.locator(".system-visual canvas").count()) === 0,
  );
  await page.getByRole("button", { name: "Explore in 3D" }).click();
  await page.locator(".system-visual canvas").waitFor();
  check(
    "mobile 3D opt-in works",
    (await page.locator(".system-visual canvas").count()) === 1,
  );
  await shot("mobile-interactive-3d");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base);
  check(
    "reduced-motion avoids WebGL",
    (await page.locator(".system-visual canvas").count()) === 0,
  );
  check(
    "reduced-motion keeps archive",
    (await page.locator(".archive-row").count()) === 40,
  );
  await shot("reduced-motion");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(base + "/?webgl=off");
  check(
    "WebGL disabled fallback",
    (await page.locator(".system-visual canvas").count()) === 0 &&
      (await page.locator(".static-system").isVisible()),
  );
  await shot("webgl-fallback");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.locator(".system-visual canvas").waitFor();
  await page.waitForTimeout(250);
  await page.locator(".system-visual canvas").evaluate((c) => {
    c.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });
  check(
    "WebGL loss reveals fallback",
    await page
      .locator(".static-system")
      .evaluate((e) => e.classList.contains("fallback-visible")),
  );
  await page.goto(base);
  await page.setViewportSize({ width: 1440, height: 1000 });
  try {
    const { default: AxeBuilder } = await import("@axe-core/playwright");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      report.accessibility.push({ width, violations: result.violations });
      check(
        `axe WCAG AA at ${width}`,
        result.violations.length === 0,
        result.violations.map((v) => `${v.id}: ${v.nodes.length}`).join(", "),
      );
    }
  } catch (e) {
    report.accessibility.push({ error: e.message });
    check("axe audit available", false, e.message);
  }
  report.performance = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0];
    return {
      domContentLoadedMs: n.domContentLoadedEventEnd,
      loadMs: n.loadEventEnd,
      resources: performance.getEntriesByType("resource").length,
    };
  });
  check(
    "no browser runtime/console errors",
    report.errors.length === 0,
    report.errors.join("\n"),
  );
  check(
    "no failed HTTP requests",
    report.failedRequests.length === 0,
    JSON.stringify(report.failedRequests),
  );
} catch (e) {
  check("QA completed without exception", false, e.stack);
} finally {
  await fs.writeFile(out + "/report.json", JSON.stringify(report, null, 2));
  await browser.close();
}
assert.ok(
  report.checks.every((c) => c.pass),
  "Browser QA has failures; inspect report.json",
);
