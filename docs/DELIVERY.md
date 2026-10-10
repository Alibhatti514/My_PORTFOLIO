# Delivery report — Ali Bhatti

Project: **ALI BHATTI — THE INTERNET, BUILT BY ME**  
Exact editable project directory: `/Users/ali_bhatti/workspace/My_PORTFOLIO`  
Report date: 11 October 2026, Asia/Karachi.

This is a new, independent application. Existing portfolio directories were used only to locate original assets and verify factual content. No previous portfolio source, scene architecture, or visual design was reused, and no previous project was modified. The initial contents of this project were preserved in a byte-verified archive before implementation; see [ASSETS.md](ASSETS.md).

## Creative direction

**Luminous digital architecture:** an open, pearl-colored architectural stage with silver structural beams, soft violet and ice-blue surfaces, and deep-ink typography. The viewport behaves as one continuous exhibition space. A centered authentic portrait establishes the person behind the work; the name sits left and the profession sits right on the desktop composition. Narrow screens use a deliberately stacked editorial arrangement and a narrower, deeper 3D stage.

The persistent structure provides continuity. Seventy-two shared beams retain their identity while they move, rotate, resize, and change color between chapter poses. Chapter-specific installations unfold around this structure. The portrait uses its real pixels, controlled shader reveal, and sampled particles that organize into developer syntax. It is a 2.5D photograph, not a fabricated face or a claimed volumetric human model.

Space Grotesk provides display type, Manrope provides body text, and IBM Plex Mono provides technical annotations. All fonts are bundled locally. Lighting uses a bright room environment, hemisphere and directional lights, a soft shadowed floor, and restrained atmospheric fog. No bloom or postprocessing chain is used.

## Color and material palette

| Role | Hex values |
| --- | --- |
| Pearl foundation | `#F7F9FF` |
| Porcelain / floor | `#F3F4FB` / `#F3F5FC` |
| Deep-ink text | `#20243B` |
| Secondary text | `#697088` |
| Editorial violet | `#8172C4` |
| Chrome / silver beams | `#DBE4F1` / `#DBE4EF` |
| Lavender architecture | `#B8ACF0` / `#C6C5EB` / `#B7A5E9` |
| Periwinkle architecture | `#B1BCEE` |
| Pale structural planes | `#E5E7F5` |
| Ice-cyan architecture | `#91D5E3` / `#9ED4DF` |

Materials share a restrained metal / porcelain vocabulary. Original project-logo colors remain intact; technology and social marks use authentic monochrome brand silhouettes.

## Scene breakdown and exact transition chain

The [detailed storyboard](STORYBOARD.md) records each chapter's opening, objects, camera, lighting, typography, scroll action, final pose, and next-scene bridge. It was written before the main implementation. The implemented sequence contains thirteen chapters:

| Chapter / hash | Focal content | Structural bridge to the next chapter |
| --- | --- | --- |
| 00 · `#human` | Centered original portrait, name, profession, open architectural wings | Portrait-colored samples curl into code-glyph targets; gateway beams hinge inward |
| 01 · `#code` | Meaningful syntax and a spatial development environment | Code supports separate into three language structures |
| 02 · `#languages` | JavaScript, TypeScript, and Python installations | Three structures extend into interface rails and browser framing |
| 03 · `#frontend` | HTML5, CSS3, JavaScript, TypeScript, React.js, Next.js; assembled interface layers | Interface framing rotates and redistributes into service architecture |
| 04 · `#backend` | Node.js, NestJS, REST, JWT; request / authentication / service route | Service lanes reorganize into the relational-data structure |
| 05 · `#data` | PostgreSQL, Prisma, and named structured relationships | Data rows straighten into version-control / delivery branches |
| 06 · `#workflow` | Git, GitHub, and Postman along one software workflow | Branches and repository blocks become logistics routes and containers |
| 07 · `#rcs-cargo` | Authentic RCS logo, connected-logistics installation | Container structure rises and aligns into a company-brand pavilion |
| 08 · `#goldadan` | Authentic GOLDADAN logo and verified company identity | Pavilion elements hinge into rectangular card surfaces |
| 09 · `#bhabhi-thulla` | Authentic logo, dimensional card deck, ranks and suits | Repeated card edges reorganize into career milestones |
| 10 · `#experience` | Upwork and Fiverr freelance roles, September 2025–June 2026 | Milestone rail and supports become educational architecture |
| 11 · `#education` | Hawk College ICS 2018–2020; Punjab University Computer Science 2021–2025 | Educational supports spread into five connection stations |
| 12 · `#connect` | Five ordered social links, email, phone, original résumé | Open frontal composition resolves the journey; reverse scroll retraces its poses |

The physical continuity is implemented by a single persistent instanced beam mesh interpolating between corresponding numbered poses. The portrait has a separate source-image-to-syntax particle morph. Scene-specific objects enter and leave through scale, translation, and rotation around the shared structure. HTML text uses a small opacity / position choreography for reading clarity; crossfading replacement canvases is not the transition mechanism.

## Technical architecture

The application uses **React 19, TypeScript, Vite, and direct Three.js**. Direct Three.js keeps the renderer, camera, particle shader, and instanced geometry under one scroll clock without adding a second animation framework. The preferred stack's optional React Three Fiber, Drei, GSAP, and ScrollTrigger dependencies were not needed for this implementation.

- `src/engine/scroll.ts` maps native scroll position to stable chapter progress with a reading hold and smooth interpolation. Forward, reverse, jumps, and refreshes derive from position rather than accumulated animation state.
- `src/engine/World.ts` owns the persistent viewport canvas, camera, scene, lighting, beam interpolation, renderer telemetry, and cleanup. It is dynamically imported by the React app.
- `src/scene/poses.ts` defines thirteen camera and beam poses. `Portrait.ts` owns sampled source pixels and GLSL interpolation; `installations.ts` owns chapter-specific objects; `primitives.ts` shares material / geometry / texture helpers.
- `src/components/Story.tsx` provides semantic HTML content and controls. Social-link DOM positions are projected from 3D anchors so clickable targets track their installations. Inactive chapter content is excluded from focus.
- `src/App.tsx` manages chapter navigation, browser history / hashes, resizing, loading, motion preference, and the reading fallback. Native dialog navigation supports keyboard operation.
- `src/data/chapters.ts`, `portfolio.ts`, and `socials.ts` separate editorial content, contact / project facts, and social destinations from rendering.

The renderer starts with 6,200 portrait particles on desktop and 2,600 on narrow screens. Pixel ratio is capped at 1.65 on desktop and 1.35 on mobile. A sustained low sampled frame rate can reduce pixel ratio to 1. Nearby scene textures are prepared as needed; invisible chapter installations are excluded from rendering. Shared beams use instancing, and renderer resources and event listeners are disposed when leaving the 3D view.

Reduced motion respects the system preference and can be toggled in the chapter index. It uses stable chapter poses, a fixed camera, disabled pointer parallax, and no CSS animated transitions. The full reading view preserves essential content and links when WebGL is unavailable, when a context is lost, or when the visitor chooses reading mode.

## Asset inventory and factual evidence

The complete source paths, hashes, dimensions, and backup proof are in [ASSETS.md](ASSETS.md), with a machine-readable [asset manifest](asset-manifest.json). Required public files are:

| Asset | Public path | Verification |
| --- | --- | --- |
| Portrait | `/assets/ali-bhatti-portrait.png` | 1105 × 1105 RGBA original; byte-verified |
| Résumé | `/assets/Resume_Ali_ejaz.pdf` | Original one-page PDF; byte-verified, extracted and visually inspected |
| RCS logo | `/assets/RCS-Logo.png` | Authentic 512 × 512 PNG; exact case-sensitive directory spelling verified |
| GOLDADAN logo | `/assets/GOLDADAN_LOGO.jpg` | Authentic 1254 × 1254 original JPEG |
| Bhabhi Thulla logo | `/assets/BHABHI THULLA.png` | Authentic 1254 × 1254 original PNG |

Lowercase asset copies remain preserved. RCS's lowercase original is stored at `public/assets/originals/rcs-logo.png` because a case-insensitive filesystem cannot hold both RCS spellings in one directory. The original backup and upstream project asset also remain intact.

Eighteen locally bundled brand SVGs retain authentic vector paths. [BRAND-SOURCES.md](BRAND-SOURCES.md) records the pinned Simple Icons source, original brand references, attribution, and included licenses. REST and JWT use labeled technical symbols rather than invented brand identities. Fontsource packages bundle all font files into the build; runtime font / logo CDN dependencies are not required.

GOLDADAN copy is limited to locally verified company website domains: security, software, hardware, and enterprise technology. Project illustrations are conceptual visual presentations, not claims of additional shipped functionality. No public project destination was supplied or verified, so all three launch states visibly indicate unavailability.

## Exact social URL mapping

The authoritative TypeScript configuration is `src/data/socials.ts`. Both the cinematic and reading interfaces preserve this order and the exact destination strings:

| Order | Platform | Exact destination |
| --- | --- | --- |
| 1 | LinkedIn | `https://www.linkedin.com/in/muhammad-ali-ejaz-bhatti-629676442/` |
| 2 | Freelancer | `https://www.freelancer.com/u/Devalibhatti?sb=t@Devalibhatti%27s` |
| 3 | GitHub | `https://github.com/Alibhatti514` |
| 4 | Fiverr | `https://www.fiverr.com/dev_alibhatti?public_mode=true` |
| 5 | Upwork | `https://www.upwork.com/freelancers/~01d8521e683ca03553?companyReference=1966580391923811613&mp_source=share` |

External social links use `target="_blank"` and `rel="noopener noreferrer"`. Their logo and label share the same accessible anchor. Unit tests assert exact URL strings and order; browser verification inspects links and popup destinations. These checks do not authenticate into or verify ownership / availability of third-party profiles.

Email is `mailto:dev._.ali@icloud.com`; phone is `tel:+923172003786`; contact location is Khanewal, Pakistan. The résumé download uses the original verified PDF.

## Build, tests, browser inspection, and performance

The implementation's production build and TypeScript validation have passed, and all **16 unit tests** passed on the final source. The tests cover immutable original asset hashes, exact public filenames, logo aliases, local brand files, résumé identity, chapter content, social mappings, résumé / contact configuration, project URL unavailability, deterministic scroll states, reverse / jump behavior, boundary continuity, reduced motion, and finite persistent geometry poses.

[QA.md](QA.md) is the authoritative final record of browser assertions, visually reviewed screenshots, observed defects and corrections, final reruns, browser environment, and performance measurements. The final production run passed **214 browser assertions with 0 failures**, with no unexpected console errors, warnings, JavaScript exceptions, or failed resource requests. A deliberately forced WebGL context-creation failure was caught and displayed the complete reading fallback.

The tested viewport matrix is 1920 × 1080, 1440 × 900, 1366 × 768, 768 × 1024, 390 × 844, and 375 × 812. All thirteen desktop resting scenes, all twelve adjacent transition midpoints, and all thirteen mobile chapters were visually reviewed. The [visual gallery](qa/gallery.html) contains **58 screenshots** and the [21.52-second forward-scroll recording](qa/walkthrough.webm). The production browser report is [browser-report.json](qa/browser-report.json).

Performance telemetry exposes sampled FPS, render calls, triangles, points, and adaptive quality at `window.__portfolio`. The final Chrome / Apple M1 sample at 1440 × 900 measured **16.67 ms mean frame interval**, **16.8 ms p95**, approximately **60 requestAnimationFrame callbacks per second**, **45 draw calls**, and **5,038 triangles** at the data chapter over 2.215 seconds. These measurements apply only to the documented local run. They do not establish universal 60 FPS or represent performance on an actual phone. The Three.js production chunk is approximately **502.20 kB, 125.60 kB gzip** in the recorded build and triggers Vite's 500 kB chunk-size advisory. The 3D engine is dynamically loaded, and its vendor chunk is separate. Preserved original raster assets are delivered in their original formats rather than GPU-compressed texture variants.

## Known limitations and remaining work

- **Project URLs are unavailable.** Real launch destinations for RCS CARGO, GOLDADAN, and BHABHI THULLA remain unconfigured until supplied or independently verified. This is visible in the interface; no placeholder destination is invented.
- **Hosting has not been deployed.** This delivery consists of editable local source and its local production build. No public URL or server infrastructure has been provisioned.
- **Device coverage is bounded.** Browser QA uses local Chrome with desktop / tablet / phone viewport dimensions. Real iOS / Android hardware, Safari, and Firefox have not been verified in this delivery.
- **The portrait is 2.5D.** The source photograph stays recognizable and unchanged; sampled pixels form a controlled particle bridge. It is not a photogrammetry reconstruction.
- **Performance depends on the device.** Adaptive resolution, particle budgets, and fallback improve reach; they do not guarantee a particular frame rate on every GPU. The vendor-chunk advisory and original raster sizes remain known tradeoffs.
- **Visual quality is an assessed result, not an objective guarantee.** The final screenshots and critique in QA document the actual local result and any observed remaining issues.

No source implementation is intentionally left as a stub. The unresolved external inputs are the three project launch URLs; deployment and cross-browser / real-device validation remain outside the completed local verification. Final browser QA status and any newly observed defects are explicitly recorded in [QA.md](QA.md).

## Exact local commands

Install and start the editable application:

```sh
cd /Users/ali_bhatti/workspace/My_PORTFOLIO
npm install
npm run dev -- --port 4173
```

Open `http://127.0.0.1:4173`. Stop that server before using the same port for production preview:

```sh
npm run typecheck
npm test
npm run build
npm run preview -- --port 4173
```

Run browser verification against either running server from a second terminal:

```sh
cd /Users/ali_bhatti/workspace/My_PORTFOLIO
QA_URL=http://127.0.0.1:4173 npm run test:browser
```

The installed Vite package requires Node.js `^20.19.0 || >=22.12.0`. Browser automation uses the installed Google Chrome through Playwright. The application itself does not require Playwright to run.
