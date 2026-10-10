import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { socials } from '../src/data/socials.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const assetPath = (name: string) => resolve(root, 'public/assets', name);
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

// These hashes were verified against the untouched supplied source files in the asset audit.
const originals = [
  ['ali-bhatti-portrait.png', '25c5be07be587d76634108cc15af984b842195e56a1041318c443ec14f7c4a96'],
  ['Resume_Ali_ejaz.pdf', '9a3380db4e5f862befcd56b05359502c1a2538b73a19e207eca4a71edf702c1d'],
  ['RCS-Logo.png', 'bf91b750b786634f5fb96da5d11d06bf2c71434735b756ab9c2a0978342cdfa3'],
  ['GOLDADAN_LOGO.jpg', '03adb9bec6020f4e11b846a17a840c6244a59eca25e8cd613d3a8a7cb9e41f18'],
  ['BHABHI THULLA.png', '734d285e9017520058fcce349607f4614d80bc6f97e928136a4650f4fa841727'],
] as const;

test('all five required assets retain their original source bytes and exact portable filenames', async () => {
  const entries = await readdir(assetPath('.'));
  for (const [name, expectedHash] of originals) {
    assert.ok(entries.includes(name), `${name} must exist with exact case on case-sensitive hosts`);
    assert.equal(sha256(await readFile(assetPath(name))), expectedHash, `${name} matches source hash`);
  }
});

test('project-logo aliases preserve the bytes of the original local assets', async () => {
  for (const [alias, original] of [
    ['RCS-Logo.png', 'originals/rcs-logo.png'],
    ['GOLDADAN_LOGO.jpg', 'goldadan-logo.jpg'],
    ['BHABHI THULLA.png', 'bhabhi-thulla.png'],
  ]) {
    assert.deepEqual(await readFile(assetPath(alias)), await readFile(assetPath(original)), `${alias} is an unchanged copy`);
  }
});

test('resume is the original PDF and matches the independently verified source when available', async (t) => {
  const delivered = await readFile(assetPath('Resume_Ali_ejaz.pdf'));
  assert.equal(delivered.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.ok(delivered.subarray(-1024).includes(Buffer.from('%%EOF')), 'PDF includes its end-of-file marker');
  assert.equal(delivered.byteLength, 246568);
  const source = '/Users/ali_bhatti/workspace/ALI BHATTI — BEYOND THE SCREEN/public/Resume_Ali_ejaz.pdf';
  if (existsSync(source)) {
    assert.deepEqual(delivered, await readFile(source));
    t.diagnostic('Compared the delivered PDF byte-for-byte with the untouched original portfolio source.');
  } else {
    // The application is independent of other projects; immutable hash validation remains portable.
    assert.equal(sha256(delivered), '9a3380db4e5f862befcd56b05359502c1a2538b73a19e207eca4a71edf702c1d');
    t.diagnostic('Original external source is absent on this machine; verified the recorded source SHA-256.');
  }
});

test('each technology and social mark resolves to a real locally bundled SVG path', async () => {
  const technologies = [
    'javascript', 'typescript', 'python', 'html5', 'css3', 'react', 'nextdotjs',
    'nodedotjs', 'nestjs', 'postgresql', 'prisma', 'git', 'github', 'postman',
  ];
  const paths = new Set([
    ...technologies.map((id) => `/assets/brands/${id}.svg`),
    ...socials.map(({ icon }) => icon),
  ]);
  assert.equal(paths.size, 18);
  for (const path of paths) {
    const svg = await readFile(resolve(root, 'public', path.slice(1)), 'utf8');
    assert.match(svg, /<svg\b/);
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.match(svg, /<path\b[^>]*\bd="[^"]{20,}"/);
  }
});
