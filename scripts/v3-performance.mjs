import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import {userAgents} from "lighthouse/core/config/constants.js";
import fs from "node:fs/promises";
const url = process.env.QA_URL || "http://127.0.0.1:4174",
  out = "docs/burgundy-cream/qa";
const results = [];
for (const mobile of [false, true]) {
  const chrome = await launch({
    chromeFlags: ["--headless", "--no-first-run"],
  });
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: ["html", "json"],
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      ...(mobile
        ? {}
        : {
            formFactor: "desktop",
                emulatedUserAgent:userAgents.desktop,
            screenEmulation: {
              mobile: false,
              width: 1440,
              height: 900,
              deviceScaleFactor: 1,
              disabled: false,
            },
            throttling: {
              rttMs: 40,
              throughputKbps: 10240,
              cpuSlowdownMultiplier: 1,
              requestLatencyMs: 0,
              downloadThroughputKbps: 0,
              uploadThroughputKbps: 0,
            },
          }),
    });
    const timings = result.lhr.audits["user-timings"]?.details?.items || [];
    const trace = result.artifacts?.Trace?.traceEvents || [];
    const marks = timings.filter((t) => t.name?.startsWith("portfolio-"));
    const cinematicRendered =
      marks.some((m) => m.name === "portfolio-cinematic-rendered") ||
      trace.some((e) => e.name === "portfolio-cinematic-rendered");
    const renderer = { cinematicRendered, marks };
    const name = mobile ? "mobile" : "desktop";
    await fs.writeFile(`${out}/lighthouse-${name}.html`, result.report[0]);
    await fs.writeFile(`${out}/lighthouse-${name}.json`, result.report[1]);
    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([k, v]) => [
        k,
        Math.round(v.score * 100),
      ]),
    );
    results.push({
      name,
      scores,
      renderer,
      chrome: result.lhr.environment,
      metrics: {
        lcp: result.lhr.audits["largest-contentful-paint"].numericValue,
        tbt: result.lhr.audits["total-blocking-time"].numericValue,
        cls: result.lhr.audits["cumulative-layout-shift"].numericValue,
      },
    });
    console.log(name, JSON.stringify(scores), renderer.cinematicRendered);
  } finally {
    await chrome.kill();
  }
}
await fs.writeFile(
  `${out}/performance-summary.json`,
  JSON.stringify(
    {
      url,
      date: new Date().toISOString(),
      results,
      limitations:
        "Local Lighthouse lab measurements; machine load and hardware vary. Desktop uses desktop throttling, mobile uses Lighthouse default simulated mobile throttling. Active renderer is recorded; no universal FPS or real-device score is claimed.",
    },
    null,
    2,
  ),
);
