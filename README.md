# Ali Bhatti / Burgundy & cream / Portfolio V3

Implemented on `redesign/burgundy-cream-world-2026`, starting from the clean `redesign/continuous-world-2026` branch (`f81cf61`). Earlier implementations, original assets and Git history remain preserved. Nothing is pushed or deployed automatically.

One native-scroll coordinate drives a persistent Three.js world and an editorial page moving through perspective. A monotonic vertical camera, continuous open ribbon and fourteen transforming folios connect the centered real portrait, About, technology field, three frameless project compositions, dimensional certificate stack and finale. Reduced motion, reading mode and unavailable WebGL provide the complete stationary portfolio.

## Run

```sh
npm install
npm run dev
```

```sh
npm run build
npm run preview -- --port 4174
```

No backend or credentials are required. Optional `SITE_URL` supplies a real canonical origin and sitemap during production builds.

## Review

- [Visual evidence gallery](docs/burgundy-cream/qa/index.html)
- [Desktop motion recording](docs/burgundy-cream/qa/journey-desktop.webm)
- [Mobile touch recording](docs/burgundy-cream/qa/journey-mobile.webm)
- [Audit, architecture and content sources](docs/burgundy-cream/AUDIT.md)
- [Implementation report](docs/burgundy-cream/DELIVERY.md)
- [Premium résumé](output/pdf/Resume-Premium.pdf) / [ATS résumé](output/pdf/Resume-ATS.pdf)

## Content

All 40 original certificates remain downloadable, searchable and filterable. Featured credentials comprise all three professional programs, all four specializations and both Duke University guided projects. Dates and issuers come from the actual PDF contents; verification links come from embedded PDF annotations. Local completion evidence does not independently authenticate online identity.

Skills separate original résumé experience from certificate-backed coursework. Authentic technology marks are bundled locally, with license notices in `public/assets/brands`. Existing GitHub, LinkedIn and other professional profile destinations remain unchanged. No proficiency percentages, invented project stacks or unverified public project links were added.

Projects use original artwork in explicitly labeled abstract compositions. Functional screenshots were unavailable. The original photograph and source résumé remain unchanged. Both redesigned, two-page PDFs contain selectable text, embedded fonts and hyperlinks; the premium version carries the new visual identity and actual photograph.

## Validate

```sh
npm test
npm run build
QA_URL=http://127.0.0.1:4174 npm run test:browser
node scripts/v3-record.mjs
node scripts/v3-performance.mjs
npm run resume
python3 scripts/validate-resumes.py
npm run audit:certificates
```

Browser and PDF generation use installed Google Chrome through Playwright. Python validation uses pypdf and Poppler. The browser suite checks five viewport sizes, forward/reverse poses, seven transition triptychs, interactions, downloads, archive search/filtering, WCAG accessibility, reduced motion and unsupported WebGL. Legacy scene tests and source remain available; V3 browser checks exercise the active UI.

The renderer caps DPR, uses no postprocessing or baked environment texture, and skips GPU draws for unchanged progress. Resources and event listeners are disposed when leaving the cinematic view. Performance reports record the active renderer and lab configuration; they are not real-device guarantees.
