# Ali Bhatti — a continuous 3D portfolio

The new experience is on `redesign/continuous-world-2026`. The rejected, previously uncommitted implementation is preserved at `archive/rejected-design-checkpoint-20261029` (`f66ac7f`); the original branch reference is untouched.

A persistent Three.js world connects a portrait-led opening, professional introduction, interactive technology constellation, three moving project displays, a seven-program credential orbit and a portrait-led finale. Native scrolling controls one reversible camera/object timeline. Accessible HTML supplies text, controls and downloads. Mobile keeps WebGL with adaptive framing, DPR and geometry; reduced motion, reading mode and WebGL loss provide complete semantic content.

## Run locally

```sh
npm install
npm run dev
```

Production output:

```sh
npm run build
npm run preview -- --port 4174
```

No backend, credentials or environment variables are needed. `SITE_URL` is optional for a real deployment origin; it enables canonical URLs and a sitemap. No public deployment URL is invented.

## Review the actual experience

- [Browser recording](docs/continuous-world/qa/journey-desktop.webm)
- [Visual proof gallery](docs/continuous-world/PROOF.html)
- [Seven-reference research report](docs/continuous-world/RESEARCH.md)
- [Audit and source limitations](docs/continuous-world/AUDIT.md)
- [Implementation and verification](docs/continuous-world/DELIVERY.md)
- [Premium résumé](output/pdf/Resume-Premium.pdf) and [ATS résumé](output/pdf/Resume-ATS.pdf)

Screenshots include every waypoint, outgoing/incoming boundary pairs, 320/390/768px layouts, skill selection, credential rotation, the searchable library, reduced motion and WebGL fallback. The recording is the primary motion evidence, rather than static screenshots alone.

## Content integrity

The supplied portrait is used without face replacement or invented depth geometry. Original project names, logos and descriptions are retained. No project screenshots, per-project stacks, repository destinations or live URLs were verified in the supplied portfolio; the dimensional displays are explicitly labeled original project artwork.

All 40 original PDF certificates remain downloadable and byte-identical to their aliases. Only the three professional certificate programs and four specializations are featured in the main orbit. Search, issuer/type filters, original previews, downloads and verification links are in the complete library. Verification destinations now come from actual PDF annotations, correcting a text-extraction suffix defect affecting 33 old URLs. Program completion is supported by local PDFs; independent issuer identity authentication is not claimed.

Résumé experience, institutions and dates come from the original résumé. Certificate-backed study is labeled separately from applied experience. No proficiency percentages or unsupported spoken languages are added. The premium PDF includes the real photograph, orbital graphics, categorized technology diagrams and seven linked programs. The ATS version uses a single reading order. Both have selectable text, embedded fonts and live hyperlinks.

## Verification and reproducibility

```sh
npm test
npm run build
QA_URL=http://127.0.0.1:4174 npm run test:browser
node scripts/journey-extra-qa.mjs
node scripts/record-journey.mjs
npm run resume
python3 scripts/validate-resumes.py
```

Browser/PDF scripts use installed Google Chrome through Playwright. Python checks need pypdf and Poppler (`pdftotext`, `pdftoppm`, `pdffonts`). The original content/asset tests remain alongside the new camera-continuity and PDF-link regression checks. Legacy scene tests validate retained source, while `journey-qa.mjs` tests the actual current production UI.

Reflection lighting is baked once by `scripts/bake-studio-environment.mjs` (requires the Vite dev server on 4173). Visitors load the resulting CubeUV atlas; shaders compile asynchronously. Technology icon licenses are retained under `public/assets/brands/`.
