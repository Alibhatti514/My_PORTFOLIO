# Ali Bhatti / Spatial portfolio V8

A burgundy-and-cream portfolio with native vertical scrolling through a real Three.js gallery landscape. The perspective camera travels nearly 200 world units through curved, solid plaster courts, terraced foundations and cantilevered roofs. Scroll also changes court rotation, elevation, scale, camera orientation, field of view and lighting. The folded side-wall system has been removed. The approved portrait component, animation code, timing and stylesheet remain unchanged.

The professional headings and summaries are updated. All 26 verified technologies retain the six filters All, Languages, Frontend, Backend, Data and Tools; evidence distinguishes résumé experience from coursework. Three authentic project identities share a single sticky showcase with reversible depth transitions. Nine featured credentials retain University of London → Microsoft → Duke University → Packt ordering, both Duke guided projects, numbered navigation, touch/mouse gestures and keyboard controls. All 40 original downloads remain available. Both two-page résumés have been regenerated and visually checked.

## Run locally

```sh
npm install
npm run dev
npm run build
npm run preview -- --port 4198
```

No backend or credentials are required. Optional `SITE_URL` supplies the canonical origin and domain-specific sitemap. Work is on `redesign/architectural-3d-v7`, based on the approved committed baseline `c4fa246` with incoming uncommitted changes retained. Nothing is pushed, merged or deployed.

The complete incoming working tree is archived at `../portfolio-incoming-v6-20261029.tar.gz`. The tracked binary patch, initial status, portrait samples and protected source copies are in `docs/architectural-v7/baseline/`. Earlier branches and QA evidence remain intact.

## Review

- [Current recordings and screenshot gallery](docs/spatial-v8/qa/index.html)
- [V8 implementation and verification](docs/spatial-v8/DELIVERY.md)
- [Previous V7 gallery](docs/architectural-v7/qa/index.html)
- [Implementation, verification and limitations](docs/architectural-v7/DELIVERY.md)
- [Evidence audit and architecture](docs/architectural-v7/AUDIT.md)
- [Premium résumé](output/pdf/Resume-Premium.pdf) / [ATS résumé](output/pdf/Resume-ATS.pdf)
- Previous evidence: [V3](docs/burgundy-cream/DELIVERY.md), [V4](docs/cinematic-v4/DELIVERY.md), [V5](docs/cinematic-v5/DELIVERY.md), [V6](docs/ultimate-4d-v6/DELIVERY.md)

## Validate

```sh
npm test
npm run build
npm run test:browser
npm run test:motion
npm run test:production
npm run record
npm run test:performance
npm run resume
python3 scripts/validate-resumes.py
```

Browser scripts use local Chrome through Playwright and default to `http://127.0.0.1:4198`; set `QA_URL` to override. Finish builds before browser testing, since rebuilding removes hashed production assets used by open tabs. Run performance measurements after other browser jobs and recordings finish.

The scene uses closed extruded geometry, shared rough plaster materials with world-space grain, depth testing, fog and shadow lighting. Original project artwork is rendered on real scene surfaces, with HTML text and controls kept accessible. `galleryScroll.ts` contains the reversible scroll-to-world mapping, `gallery.ts` builds the environment, `projectArtifacts.ts` handles original artwork, and `JourneyWorld.tsx` owns rendering and disposal. DPR is capped at 1 on phones and 1.5 on desktop; phone shadows use 512px maps. Idle scroll produces no GPU draws. Reduced motion, reading mode and WebGL failure expose the full document. Geometry, materials, textures, shadow maps, renderer and context are released on exit.
