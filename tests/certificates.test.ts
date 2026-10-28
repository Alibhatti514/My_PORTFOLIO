import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import credentials from "../src/data/certificates.json";
async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? walk(path.join(dir, e.name))
          : Promise.resolve([path.join(dir, e.name)]),
      ),
    )
  ).flat();
}
test("every PDF, including extensionless certificates, is uniquely indexed, unchanged and previewable", async () => {
  const files = [];
  for (const p of await walk("public/assets/Certificates")) {
    const bytes = await readFile(p);
    if (bytes.subarray(0, 4).toString() === "%PDF")
      files.push("/" + p.replace(/^public\//, ""));
  }
  assert.deepEqual(credentials.map((c) => c.path).sort(), files.sort());
  assert.equal(new Set(credentials.map((c) => c.id)).size, files.length);
  assert.equal(new Set(credentials.map((c) => c.sha256)).size, files.length);
  for (const c of credentials) {
    const bytes = await readFile("public" + c.path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), c.sha256);
    assert.equal(
      createHash("sha256")
        .update(await readFile("public" + c.downloadPath))
        .digest("hex"),
      c.sha256,
    );
    assert.ok((await readFile("public" + c.preview)).length > 1000);
    assert.match(
      c.url,
      /^https:\/\/coursera.org\/verify\/(?:(?:professional-cert|specialization)\/)?[A-Z0-9]+$/,
    );
    assert.ok(c.title.length < 120);
    if (["Specialization", "Professional Certificate"].includes(c.type))
      assert.equal(c.featured, true);
  }
  assert.equal(credentials.filter((c) => c.featured).length, 7);
  assert.equal(
    credentials.filter((c) => c.type === "Professional Certificate").length,
    3,
  );
  assert.equal(
    credentials.filter((c) => c.type === "Guided Project").length,
    2,
  );
});
