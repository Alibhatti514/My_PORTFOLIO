import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
await page.goto(process.env.QA_URL || "http://127.0.0.1:4173");
await page.locator(".system-visual canvas").waitFor();
await page.waitForTimeout(250);
await page.addStyleTag({
  content:
    ".scene-label,.scene-live,.scene-coordinate,.system-grid,.static-system,.system-poster{visibility:hidden!important}.system-visual{background:transparent!important}",
});
await page
  .locator(".system-visual canvas")
  .screenshot({
    path: "/tmp/portfolio-system-poster.png",
    omitBackground: true,
  });
await browser.close();
execFileSync("cwebp", [
  "-quiet",
  "-q",
  "88",
  "/tmp/portfolio-system-poster.png",
  "-o",
  "public/assets/optimized/system.webp",
]);
