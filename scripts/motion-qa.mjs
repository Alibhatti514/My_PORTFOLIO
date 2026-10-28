import { chromium } from "playwright";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto("http://127.0.0.1:4174");
const canvas = p.locator(".system-visual canvas");
await canvas.waitFor();
await p.waitForTimeout(1300);
const hash = (x) => createHash("sha256").update(x).digest("hex");
const first = await canvas.screenshot();
await p.evaluate(() => scrollTo({ top: 450, behavior: "instant" }));
await p.waitForTimeout(1300);
const middle = await canvas.screenshot();
await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await p.waitForTimeout(1500);
const restored = await canvas.screenshot();
const meanDifference = await p.evaluate(
  async ([a, b]) => {
    const load = async (data) => {
      const img = new Image();
      img.src = "data:image/png;base64," + data;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, c.width, c.height).data;
    };
    const [x, y] = await Promise.all([load(a), load(b)]);
    let difference = 0;
    for (let i = 0; i < x.length; i++) difference += Math.abs(x[i] - y[i]);
    return difference / x.length;
  },
  [first.toString("base64"), restored.toString("base64")],
);
const result = {
  scrollChangesScene: hash(first) !== hash(middle),
  reverseReturnsWithinPixelTolerance: meanDifference < 1,
  meanDifference,
  maxMeanDifference: 1,
};
for (const version of ["Premium", "ATS"]) {
  const [d] = await Promise.all([
    p.waitForEvent("download"),
    p.locator(`.resume-options a[href$="Resume-${version}.pdf"]`).click(),
  ]);
  result[version + "Download"] =
    d.suggestedFilename() === `Resume-${version}.pdf`;
}
await p.setViewportSize({ width: 390, height: 844 });
await p.goto("http://127.0.0.1:4174");
await p.waitForTimeout(150);
await p.screenshot({ path: "docs/redesign/qa/mobile-static-poster.png" });
await p.getByRole("button", { name: "Explore in 3D" }).click();
await canvas.waitFor();
await p.waitForTimeout(350);
await p.screenshot({ path: "docs/redesign/qa/mobile-opt-in.png" });
await b.close();
await fs.writeFile(
  "docs/redesign/qa/motion-downloads.json",
  JSON.stringify(result, null, 2),
);
console.log(result);
if (
  !result.scrollChangesScene ||
  !result.reverseReturnsWithinPixelTolerance ||
  !result.PremiumDownload ||
  !result.ATSDownload
)
  process.exitCode = 1;
