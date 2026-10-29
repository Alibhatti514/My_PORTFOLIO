import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { skills } from "../src/data/skills.ts";
import { portraitPose, panelPose } from "../src/scene/journey.ts";
import certificates from "../src/data/certificates.json";

test("every branded technology resolves to an authentic local SVG, including course-backed technologies", () => {
  for (const s of skills)
    if (s.icon) {
      const path = `public/assets/brands/${s.icon}.svg`;
      assert.ok(existsSync(path), s.name);
      assert.match(readFileSync(path, "utf8"), /<svg/);
    }
  for (const name of [
    "JavaScript (ES6+)",
    "TypeScript",
    "Python",
    "C#",
    ".NET 8",
    "HTML5",
    "CSS3",
    "Git",
    "GitHub",
    "Blazor",
    "Svelte 5",
    "SvelteKit",
    "Supabase",
    "Sanity CMS",
    "Stripe Integration",
  ])
    assert.ok(skills.some((s) => s.name === name));
  assert.ok(
    skills
      .filter((s) => s.study)
      .every((s) => ["Languages","Frontend","Backend","Data","Tools"].includes(s.category)),
  );
});
test("portrait and page transforms have no jumps or accumulated reverse-scroll state", () => {
  for (const mobile of [true, false]) {
    for (let i = 1; i < 280; i++) {
      const p = i / 100,
        a = portraitPose(p - 0.00001, mobile),
        b = portraitPose(p + 0.00001, mobile);
      for (const key of Object.keys(a) as (keyof typeof a)[])
        assert.ok(Math.abs(a[key] - b[key]) < 0.01, `${key} at ${p}`);
    }
    assert.equal(portraitPose(0, mobile).opacity, 1);
    assert.equal(portraitPose(2, mobile).opacity, 0);
    for (const p of [0, 0.5, 1, 1.3, 1.8, 2, 7].reverse())
      assert.deepEqual(portraitPose(p, mobile), portraitPose(p, mobile));
  }
  for (let i = 0; i < 8; i++)
    for (const p of [i - 0.50001, i - 0.49999, i, i + 0.49999, i + 0.50001])
      assert.ok(Object.values(panelPose(p, i)).every(Number.isFinite));
});
test("featured set is exactly programs plus Duke, without duplicate credentials", () => {
  const expected = certificates.filter(
    (c) =>
      ["Professional Certificate", "Specialization"].includes(c.type) ||
      c.issuer === "Duke University",
  );
  assert.deepEqual(
    certificates.filter((c) => c.featured).map((c) => c.id),
    expected.map((c) => c.id),
  );
  assert.equal(expected.length, 9);
  assert.equal(new Set(expected.map((c) => c.sha256)).size, 9);
  assert.equal(
    expected.filter((c) => c.issuer === "Duke University").length,
    2,
  );
});

test("the small opening inventory and lazy archive agree with the audited PDFs", () => {
  const featured = JSON.parse(
    readFileSync("src/data/featuredCertificates.json", "utf8"),
  );
  const stats = JSON.parse(
    readFileSync("src/data/inventoryStats.json", "utf8"),
  );
  assert.equal(stats.count, certificates.length);
  assert.equal(stats.featured, 9);
  assert.deepEqual(
    featured.map((c: { id: string }) => c.id),
    certificates.filter((c) => c.featured).map((c) => c.id),
  );
  for (const c of featured) {
    const original = certificates.find((item) => item.id === c.id)!;
    for (const [key, value] of Object.entries(c))
      assert.equal(value, original[key as keyof typeof original]);
  }
});
