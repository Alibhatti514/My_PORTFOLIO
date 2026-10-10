# Ali Bhatti — The internet, built by me

A new, independent React / TypeScript portfolio built around a persistent, full-viewport Three.js world. Thirteen scroll-directed chapters connect an authentic portrait to code, software architecture, projects, career, education, and contact.

Project: `/Users/ali_bhatti/workspace/My_PORTFOLIO`

Latest update: [itshover button and navigation upgrade](docs/ICON-UPGRADE.md), including installed components, changed files, and current verification status.

## Run locally

Use Node.js `^20.19.0 || >=22.12.0` with npm, matching the installed Vite version’s declared requirement.

```sh
cd /Users/ali_bhatti/workspace/My_PORTFOLIO
npm install
npm run dev -- --port 4173
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). Scroll, use **Continue**, or open **Index** to jump to any chapter. Chapter hashes can be bookmarked, such as `/#languages`, `/#rcs-cargo`, and `/#connect`.

**Index** also offers reduced motion and the complete reading view. The app respects the system reduced-motion preference and automatically presents readable content if WebGL fails. Direct alternatives:

- [Reading view](http://127.0.0.1:4173/?view=reading)
- [WebGL-off fallback](http://127.0.0.1:4173/?webgl=off)

## Build and verify

```sh
npm run typecheck
npm test
npm run build
npm run preview -- --port 4173
```

With the dev server or production preview running in another terminal:

```sh
QA_URL=http://127.0.0.1:4173 npm run test:browser
```

Browser QA uses Playwright with a locally installed Google Chrome. It writes measurements and screenshots under `docs/qa/`; recording additionally requires Playwright's video support. The automated checks complement visual inspection. Final observed results and test limitations are recorded in [docs/QA.md](docs/QA.md).

## Edit the project

| File / folder | Responsibility |
| --- | --- |
| `src/data/chapters.ts` | Chapter copy, order, and shareable hashes |
| `src/data/portfolio.ts` | Contact details, résumé path, and project metadata |
| `src/data/socials.ts` | Exact social profile URLs and visual order |
| `src/engine/scroll.ts` | Single native-scroll story state |
| `src/engine/World.ts` | Renderer, camera, stage interpolation, quality, disposal |
| `src/scene/poses.ts` | Persistent architecture and camera poses |
| `src/scene/Portrait.ts` | Original-image plane, shader reveal, sampled particle morph |
| `src/scene/installations.ts` | Technology, project, career, education, and social installations |
| `src/scene/primitives.ts` | Shared materials, geometry, labels, texture helpers |
| `src/components/Story.tsx` | Semantic chapter overlays, links, and reading view |
| `src/App.tsx` | Loading, navigation, history, motion preference, fallback |
| `src/styles.css` | Responsive composition, typography, and accessible focus states |
| `public/assets/` | Preserved photographs, project logos, résumé, bundled brand SVGs |

React handles accessible content and controls; direct Three.js handles the scene. The renderer is loaded separately from the reading experience. Fonts are bundled locally through Fontsource; brand SVGs are local files. No font or logo CDN is needed at runtime.

## Delivery documents

- [Delivery report](docs/DELIVERY.md): direction, palette, chapter chain, architecture, mappings, limitations, and commands.
- [Storyboard](docs/STORYBOARD.md): pre-implementation shot list and transition contract.
- [Original asset inventory](docs/ASSETS.md) and [machine-readable hashes](docs/asset-manifest.json).
- [Brand sources and licenses](docs/BRAND-SOURCES.md).
- [QA report](docs/QA.md): browser observations, screenshot analysis, performance, and artifacts.
- [Visual gallery](docs/qa/gallery.html): all 58 screenshots and the recorded walkthrough.
- [Walkthrough video](docs/qa/walkthrough.webm): the complete forward journey in the production build.

The portrait is an honest 2.5D photograph and image-derived particle treatment. The three project launch URLs are intentionally unavailable until real destinations are provided. Their scenes remain interactive. Social, email, phone, and résumé links are configured.

Previous portfolio projects were not modified or used as design references. Original workspace files were backed up and verified before implementation. This delivery is local source and a production build; no public hosting has been deployed.
