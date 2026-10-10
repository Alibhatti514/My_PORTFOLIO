# Final verification — Ali Bhatti

Project: `/Users/ali_bhatti/workspace/My_PORTFOLIO`  
Delivery date: 11 October 2026, Asia/Karachi.

## Evidence and scope

The site was opened in a browser and inspected as rendered WebGL and HTML. The review covered all thirteen resting desktop scenes, every adjacent transition midpoint, all thirteen mobile chapters, and the requested six viewport sizes. Screenshots were assessed against [STORYBOARD.md](STORYBOARD.md); this was a visual review as well as automated checking.

The final production test record is [qa/browser-report.json](qa/browser-report.json). Earlier focused runs and history files document the refinement process; they are not the final verdict. The final run uses Vite's production preview at `http://127.0.0.1:4174`, rather than its development server.

**Final result: 214 browser assertions passed, 0 failed; 58 screenshots and a recorded walkthrough delivered.** The run began at `2026-10-10T19:48:08.698Z` (11 October in Asia/Karachi) and observed the final `index-Cv-L5Tx4.js`, `World-C9ogvxdr.js`, and `three--q06Lw8y.js` bundles. There were **zero unexpected console errors, console warnings, JavaScript exceptions, or failed resource requests**. The deliberately forced WebGL failure produced its expected renderer diagnostic, recorded separately, and successfully displayed readable fallback content without an uncaught exception.

## Build and content verification

| Check | Result |
| --- | --- |
| `npm install` | Completed; npm reported zero vulnerabilities at installation |
| `npm run typecheck` | Passed |
| `npm test` | 16 passed, 0 failed on final source |
| `npm run build` | Passed; TypeScript build and Vite production output generated |
| Development server | Started and opened in Google Chrome |
| Production preview | Started and used for the final full browser suite |

The tests verify original asset bytes and exact portable filenames; all thirteen chapter identifiers; required technologies; career, education, contact, and résumé facts; exact social URL order and strings; intentional unavailable project destinations; deterministic forward / reverse / jump scroll states; chapter-boundary continuity; reduced-motion states; and finite geometry poses.

The original résumé was extracted and visually inspected during the asset audit. Both unit and browser checks compare the delivered PDF with its original bytes. A browser download event was exercised and the downloaded file hash matched. The portrait and three original project logos were observed loading in the application and their served bytes were checked against source files.

## Browser environment and coverage

The automated browser was local **Google Chrome 154.0.8037.98**, controlled by Playwright in headless mode on **macOS arm64**, **Node.js v22.22.3**, with **ANGLE Metal / Apple M1** graphics. The desktop performance sample used device scale factor 1. The interactive preview was also opened in a regular Chrome tab for visual inspection.

| Viewport | Captured coverage |
| --- | --- |
| 1920 × 1080 | Hero and final connection environment |
| 1440 × 900 | Every desktop chapter, twelve transition midpoints, project interactions, hero and connection |
| 1366 × 768 | Hero and connection |
| 768 × 1024 | Hero and connection |
| 390 × 844 | Every mobile chapter, hero and connection, keyboard navigation |
| 375 × 812 | Hero and connection |

Additional captures cover reading mode, explicit WebGL-off fallback, an actual forced WebGL context-creation failure, and system reduced motion. This matrix is viewport emulation in Chrome; it is not physical iOS / Android testing or a Safari / Firefox certification.

The browser assertions exercise:

- All chapter landings and adjacent midpoints; active HTML / WebGL synchronization; full-viewport canvas dimensions; no horizontal document overflow.
- Slow incremental scrolling, fast jumps, reverse scrolling, direct hashes, chapter-menu navigation, browser back, reload after menu navigation and manual scrolling, and fractional progress preservation on resize.
- Return from reading view to the synchronized 3D chapter; keyboard navigation; skip-link focus transfer; exclusion of hidden loading content from tab order.
- All five social links in the requested order, accessible logos, exact destinations, safe new-tab attributes, and intercepted popup navigation to each profile.
- The original résumé download; exact `mailto:` and `tel:` destinations; the three project interaction controls.
- System reduced motion, a stable reduced-motion chapter pose, complete reading content, and recovery when WebGL context creation actually returns `null`.
- Actual requests for all five required files and byte identity of served assets; browser JavaScript exceptions, console errors, and failed resource requests.

Email and phone checks verify usable URI links; the suite does not send an email or place a call. Social popup checks verify the destination without logging into external services or asserting profile ownership. The three project controls were exercised without exceptions; their corresponding scenes were also visually reviewed.

## Visual assessment and corrections

The final direction is a bright, open architectural stage. The portrait remains the hero's focal point, with warm photographic color preserved against the pearl / violet environment. The name, profession, and open wings occupy the full desktop viewport. Mobile stacks the introduction above a deeper stage and keeps navigation reachable.

| Area | Observed result and refinement |
| --- | --- |
| Hero and portrait → code | Original portrait is recognizable. The code cloud derives from its pixels. The revised “A first line. / A new world.” headline clears the transforming portrait; the narrow-screen cloud was moved and scaled to stay within the composition. |
| Languages and frontend | Named, authentic marks occupy distinct installations. Shared beams carry the geometry forward into interface framing. HTML copy provides readable detail without relying on tiny in-world lettering. |
| Backend and data | The request sequence reads REST → Node.js → JWT → NestJS. Data relationships use User.id → Project.userId and Project.id → Record.projectId. Duplicate in-world captions shrink at transition midpoints to avoid collisions with the semantic overlay. |
| Workflow | Git, GitHub, and Postman are grouped along a visible process. Shared structural pieces extend into the logistics scene. |
| RCS and GOLDADAN | Original logos remain intact. A visual review found shared beams covering them at the two project midpoints; the bridge now moves deeper into the stage, and both updated screenshots were independently re-inspected. |
| Bhabhi Thulla | The original game logo accompanies dimensional cards with visible ranks and suits at the resting scene. Card details grow in as the scene arrives; transitional card silhouettes are intentionally simpler. |
| Experience | Both freelance roles and dates are accurate. Dates were moved away from the headline, and redundant 3D career text is suppressed on narrow screens. |
| Education | Both institutions and date ranges remain readable within a stepped architectural composition. The supports spread into the five social stations. |
| Connection | Five authentic marks appear in the requested order. Each logo and label shares an accessible clickable target; desktop and narrow-screen screenshots show all five targets. Contact and résumé actions remain reachable. |
| Responsive / fallback | All thirteen mobile resting chapters were inspected. Reading mode retains the complete essential content and links. Reduced motion retains deliberate static poses. |

All twelve midpoint images were inspected, rather than inferring continuity from the resting scenes. The final targeted review confirmed that the previously identified text collisions, experience-date spacing, and project-logo obstruction were resolved. The result uses persistent geometry and a consistent material system. It remains an art-directed 2.5D portrait within a 3D environment, not a volumetric scan.

Functional defects found during iteration were also corrected: stale active content after returning from reading mode, outdated hashes after manual scrolling, resize snapping, focus landing on an inert chapter, and loading controls entering tab order. Their relevant browser regressions passed before delivery. Renderer and texture cleanup were improved and reviewed in code; no GPU-memory leak measurement was performed.

## Screenshots and walkthrough

Open the [visual gallery](qa/gallery.html) for a filterable local index and embedded video. It links all **58 PNG screenshots**: thirteen desktop resting scenes, twelve desktop midpoints, thirteen mobile resting scenes, twelve responsive hero / connection frames, three project interaction frames, and five accessibility / fallback frames.

- [Desktop hero](qa/screenshots/desktop-00-human.png)
- [Portrait-to-code midpoint](qa/screenshots/transition-00-human-to-code.png)
- [Backend](qa/screenshots/desktop-04-backend.png)
- [RCS-to-GOLDADAN midpoint](qa/screenshots/transition-07-rcs-cargo-to-goldadan.png)
- [GOLDADAN-to-Bhabhi midpoint](qa/screenshots/transition-08-goldadan-to-bhabhi-thulla.png)
- [Mobile hero](qa/screenshots/mobile-00-human.png)
- [Mobile connection](qa/screenshots/mobile-12-connect.png)
- [Full forward-scroll walkthrough](qa/walkthrough.webm)

The final video is **21.52 seconds**, **1440 × 900**, and **5,835,800 bytes**, verified with FFprobe after recording. It traverses all thirteen chapters from beginning to end. It is an accelerated visual walkthrough, not a real-device performance benchmark or an exhaustive recording of every interaction.

## Measured performance and build size

At the data chapter, 1440 × 900 and device scale factor 1, the final run observed **132 frame intervals over 2,215.4 ms**. Mean frame interval was **16.67 ms**, median **16.7 ms**, and p95 **16.8 ms**, approximately **60 requestAnimationFrame callbacks per second**. Renderer telemetry at that pose showed **45 draw calls**, **5,038 triangles**, no active portrait points, and high quality. The raw measurements and per-chapter snapshots are preserved in the JSON report.

This is a short local sample, not a universal frame-rate guarantee. Navigation / loading warm-up and other scenes have different costs. Viewport emulation does not reproduce a phone GPU or mobile network. GPU memory and thermal behavior were not profiled with a hardware device.

The final production bundles are:

| File | Uncompressed | Gzip |
| --- | --- | --- |
| `assets/index-Cv-L5Tx4.js` | 244.16 kB | 76.74 kB |
| `assets/World-C9ogvxdr.js` | 26.58 kB | 10.50 kB |
| `assets/three--q06Lw8y.js` | 502.20 kB | 125.60 kB |
| `assets/index-BPvzasjb.css` | 24.44 kB | 6.07 kB |

Vite reports its expected advisory for the Three.js vendor chunk exceeding 500 kB. The 3D engine is dynamically loaded and the vendor chunk is separate. There is no runtime font or logo CDN dependency. The renderer caps pixel ratio, reduces initial portrait particle count on narrow screens, adapts resolution to sustained slow rendering, uses instancing, skips invisible installations, prepares nearby textures lazily, and disposes scene resources on teardown.

Original raster assets are preserved and served in their source PNG / JPEG formats. GPU-compressed KTX variants were not implemented; this remains a performance optimization opportunity, not a completed feature.

## Remaining limitations

No critical failure remained in the final documented local checks. Real launch URLs for the three projects are still unavailable and clearly labeled in the app. Public deployment, real-device validation, and Safari / Firefox testing are not part of the completed local delivery. No formal screen-reader session or automated accessibility certification was performed. Reduced motion and keyboard behavior were checked, but that does not establish full WCAG conformance.

Review the [delivery report](DELIVERY.md) for architecture, palette, exact social mapping, asset inventory, and startup commands. The owned local test servers are stopped at handoff; starting the documented command reopens the editable application.
