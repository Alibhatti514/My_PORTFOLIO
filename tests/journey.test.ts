import assert from "node:assert/strict";
import test from "node:test";
import { samplePath, cameraPath, targetPath } from "../src/scene/journey.ts";
import { execFileSync } from "node:child_process";
import certificates from "../src/data/certificates.json";

test("camera and target remain continuous at every scene join, in both directions", () => {
  for (const path of [cameraPath, targetPath])
    for (let i = 1; i < 7; i++) {
      const a = samplePath(i - 0.0001, path),
        b = samplePath(i + 0.0001, path);
      assert.ok(Math.hypot(...a.map((x, k) => x - b[k])) < 0.00001);
      assert.deepEqual(samplePath(i, path), samplePath(i, path));
    }
  assert.ok(
    Math.hypot(
      ...samplePath(1, cameraPath).map((x, k) => x - cameraPath[0][k]),
    ) > 2,
  );
  for (const p of [-10, 0, 0.3, 3.5, 7, 100])
    assert.ok(samplePath(p, cameraPath).every(Number.isFinite));
});

test("certificate verification destinations match embedded PDF annotations, without text-extraction suffixes", () => {
  const embedded = JSON.parse(
    execFileSync(
      "python3",
      [
        "-c",
        `from pypdf import PdfReader
import json
rows=json.load(open('src/data/certificates.json'))
print(json.dumps([[str(a.get_object().get('/A',{}).get('/URI','')) for p in PdfReader('public'+c['downloadPath']).pages for a in p.get('/Annots',[])] for c in rows]))`,
      ],
      { encoding: "utf8" },
    ),
  );
  certificates.forEach((c, i) => assert.ok(embedded[i].includes(c.url), c.id));
  assert.equal(certificates.filter((c) => c.featured).length, 7);
  assert.ok(
    certificates
      .filter((c) => c.featured)
      .every((c) =>
        ["Professional Certificate", "Specialization"].includes(c.type),
      ),
  );
});
