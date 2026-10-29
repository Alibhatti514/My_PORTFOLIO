# Continuous world delivery · 29 October 2026

## Creative implementation
Navy/indigo/violet/lavender replace the rejected green identity. The actual portrait occupies the center of the opening composition, layered into metallic orbit geometry, atmospheric particles and environmental light. It remains in the About scene, recedes as the same orbital structure opens into technologies, then returns in the closing scene. No synthetic face, facial displacement or unseen facial geometry is used.

One Three.js renderer, scene and canvas persist across all eight waypoints. Six narrative scenes include three project stops. A native scroll scalar controls interpolated camera position and target, ring position/rotation/scale, portrait position/rotation/scale/opacity, technology arrangements, project approach/recession, credential entrance/recession, particles and point-light intensities. Ambient movement is independent but does not accumulate scroll transforms. Reverse scrolling uses the same path. No wheel or trackpad interception and no custom scroll physics.

The portrait, rings, particles and visual objects overlap in world space during transitions. HTML copy hands off through a brief world-focused interval to avoid overlapping text. Boundary frames and the browser recording show continuity; there are no section background resets or remounted world canvases.

Sixteen selectable dimensional technology surfaces use bundled licensed icons where available. The HTML index provides equivalent keyboard/touch access and evidence descriptions. Course-backed competencies are marked completed study; additional audited topics remain available in the study disclosure.

Three camera-driven project displays show authentic local project artwork. No fabricated product UI, repository, launch link or stack is supplied. Full existing project descriptions and social destinations are retained.

Seven program PDFs supply preview textures in a rotating credential ring with preserved image proportions. Active programs approach the camera, surrounding documents remain in the environment, and selection interpolates along the shortest rotation. Desktop drag, touch swipe, buttons, keyboard controls and continued scrolling update the selection. Clicking an active surface or using Inspect opens the original preview. Downloads and verification are HTML links. The separate modal library provides all 40 originals, search, issuer and type filters, preview, download, verification and a resettable empty state.

## Responsive and accessible behavior
Mobile and tablet use centered upper-stage objects and lower copy, adapted camera distance, lower DPR/particle counts and simpler geometry. Desktop uses asymmetric spatial compositions. Native keyboard scrolling, direct scene controls, focusable technology selection and native dialog focus behavior remain available. Reduced motion starts in a complete reading view with no WebGL requirement. Constructor failure and actual context loss recover to the same content. The explicit reading view is always available.

## Verification
`qa/report.json`: persistent canvas identity across all waypoints and boundaries, seven distinct camera destinations, exact camera restoration on reverse scroll, interactive skills, credential button/drag behavior, library filtering/empty/reset behavior, all 40 PDF responses, both résumé downloads, six desktop scene WCAG A/AA scans plus reduced motion, 320/390/768px overflow checks, actual context-loss recovery, zero browser errors.

`qa/extra-report.json`: native mobile touch swipe, mobile menu, scroll-driven credential rotation, initial no-WebGL recovery and sampled frame timing. These are local Chrome measurements, not guarantees for every device.

`qa/lighthouse-desktop.json` and `qa/lighthouse-mobile.json`: final production scores are desktop 75 performance / 100 accessibility / 100 best practices / 100 SEO, and mobile 92 / 100 / 100 / 100. Desktop startup remains the main performance limit; native mobile frame sampling was about 16.7ms median and p95. These are local measurements, not a device guarantee. Startup reflection rendering was replaced by a precomputed CubeUV atlas and parallel shader compilation. These scores complement visual inspection; they are not treated as proof of creative success.

`pdf-preview/validation.json`: both PDFs have two pages, selectable text, embedded fonts, correct program verification annotations and matching public download copies. All four pages are rendered and visually reviewed. `resume-source/layout-check.json` checks footer clearance and page bounds.

`qa/journey-desktop.webm`: short production browser recording covering the opening, every transition, skills selection, three project movements, credential rotation and inspection, and the closing composition. `scripts/record-journey.mjs` reproduces it. `qa/boundary-N-out.png` and `-in.png` are paired continuity frames. See PROOF.html for the selected evidence.

## Scope limits
No hosted deployment was requested. Run locally using the README commands. Project-specific screenshots and public project destinations remain unverified; genuine logos are labeled as artwork. Certificate identity is supported by supplied documents and their embedded verification URLs, not independent authentication with issuers. Browser automation and emulated mobile checks are supplemented by visual review; physical-device testing remains outside this local run.
