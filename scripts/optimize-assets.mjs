import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
mkdirSync("public/assets/optimized", { recursive: true });
for (const [source, name, width] of [
  ["ali-bhatti-portrait.png", "portrait", 900],
  ["ali-bhatti-portrait.png", "portrait-mobile", 600],
  ["RCS-Logo.png", "rcs", 400],
  ["GOLDADAN_LOGO.jpg", "goldadan", 400],
  ["BHABHI THULLA.png", "bhabhi", 400],
]) {
  execFileSync("cwebp", [
    "-quiet",
    "-q",
    "85",
    "-resize",
    String(width),
    "0",
    `public/assets/${source}`,
    "-o",
    `public/assets/optimized/${name}.webp`,
  ]);
}
