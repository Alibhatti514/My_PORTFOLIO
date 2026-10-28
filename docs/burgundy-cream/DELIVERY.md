# Portfolio V3 / implementation report

October 29, 2026 · Burgundy & cream · Local-only delivery

## Result

Replaced the circular navy/violet experience with a continuous vertical 3D page, a centered real portrait and soft masked departure, editorial About composition, authentic technology marks, frameless project environments, a draggable certificate stack, verified social profiles and a cinematic closing composition. Both résumés were rebuilt in the new identity.

The source branch is `redesign/burgundy-cream-world-2026`, based on `f81cf61`. The original branch, original résumé, photograph, project artwork, certificate PDFs and earlier evidence remain preserved. No push or deployment was performed.

## Evidence

- [Visual gallery](qa/index.html) contains every desktop, laptop, tablet, mobile and 320px composition, interactions and seven transition triptychs.
- [Desktop recording](qa/journey-desktop.webm): 44.08 seconds, continuous forward travel, skills, certificate drag, both Duke credentials, finale and reverse travel.
- [Mobile recording](qa/journey-mobile.webm): 44.20 seconds, including actual CDP touch events for horizontal certificate swiping.
- [Frames sampled from the recordings](qa/recorded-frames/index.html) were visually inspected alongside the screenshots.
- [Browser results](qa/report.json): passed; 5 viewport sizes; 7 joins; 27 WCAG scans; zero violations and zero browser errors. Persistent canvas identity and reverse camera poses are checked.
- Production build passes. All **24 tests** pass, including original asset hashes, certificate aliases, embedded verification URLs, vertical camera continuity, photograph transforms and opening/archive inventory consistency.
- Reduced-motion, reading mode and unsupported WebGL fallbacks expose all content.

## Performance

Final local Lighthouse measurements with the cinematic render mark verified in the measured trace:

|Mode|Performance|Accessibility|Best practices|SEO|LCP|TBT|3D rendered|
|---|---:|---:|---:|---:|---:|---:|---|
|desktop|100|100|100|100|486 ms|0 ms|Yes|
|mobile|97|100|100|100|1860 ms|194 ms|Yes|

[Configuration and renderer evidence](qa/performance-summary.json), [desktop report](qa/lighthouse-desktop.html), [mobile report](qa/lighthouse-mobile.html). Desktop uses the desktop user agent, viewport and throttling; mobile uses Lighthouse's default simulated mobile profile. Machine load and lab simulation vary; the earlier reported 75/92 scores were not reproduced under an identical baseline.

Both final performance measurements exceed the requested 90-point target. These are local lab results, not guarantees for every device. The actual 3D renderer ran during both measured traces.

All page poses are assigned during the first DOM commit, before the animation loop, preventing offscreen panels from briefly overlapping at startup. A separate startup regression checks this and post-render skills/archive interaction at all five viewport sizes. Startup prioritizes the decoded portrait, then asynchronously compiles WebGL shaders. The full archive is loaded on demand. Geometry is shared (three geometries), DPR is capped, unnecessary font weights/environment textures/postprocessing were removed from the active experience, and unchanged progress produces no GPU draw.

## Content and PDFs

All **40** unique certificates remain downloadable with search and issuer/type filters. Exactly **nine** are featured: three professional certificates, four specializations and both Duke University guided projects. Their issuers, dates and verification URLs come from original PDF contents/annotations.

The premium and ATS documents each have **two pages**. All four pages were rendered with Poppler and visually inspected. Validation confirms selectable text, embedded fonts, correct experience/education/skills, all nine featured credential links, and byte-identical public download copies. The premium document has 24 hyperlinks; ATS has 17. [PDF validation](pdf-preview/validation.json).

Course-backed technologies remain distinct from résumé experience. No skill percentages, public project URLs or functional screenshots were fabricated. Project artwork is explicitly presented as an abstract visual study of the real identity. Online issuer identity authentication is not claimed beyond the local certificate evidence.

## Reproduce

`npm run build` then `npm run preview -- --port 4174`. Run `npm test`, `npm run test:browser`, `node scripts/v3-record.mjs`, `node scripts/v3-performance.mjs`, `node scripts/v3-gallery.mjs`, `npm run resume`, and `python3 scripts/validate-resumes.py`. Browser scripts accept `QA_URL`.
