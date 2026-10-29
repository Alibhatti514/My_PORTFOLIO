# Implementation and validation — 29 October 2026

Branch: `redesign/immersive-credentials-2026`. Local delivery; no remote push, deployment or commits made. Existing uncommitted certificate/research work retained and improved. Original résumé and all original source asset bytes remain unchanged, verified by existing hash tests.

## Delivered
- Completely replaced the fixed chapter interface with an original dark editorial portfolio and normal document flow.
- Original procedural Three.js system stack, pointer response and reversible scroll separation. Shared geometry/materials, adaptive DPR, 30fps cap, offscreen/hidden pause and explicit disposal. Mobile begins with a 21KB scene poster and offers interactive 3D; reduced motion / WebGL failure retain the content.
- Responsive header and native mobile menu, project details, about, skill architecture, freelance experience, education, seven featured programs, complete certificate archive, two résumé formats and contact/footer.
- Certificate search, combined issuer/type filtering, empty state/reset, native previews with keyboard focus restoration and Escape, original PDF download aliases and issuer verification links.
- 40 PDF source files inspected by extraction; all certificate thumbnails reviewed as a contact sheet. Three professional certificates, four specializations, two guided projects, 31 courses. Packt issuer attribution is also visible in program logos and corroborated by constituent course text. No invented certificate metadata, metrics or employment.
- Two coordinated, two-page, selectable-text résumé PDFs. The premium layout uses restrained brand colors and a skills/education split; ATS is single-column. Sources embedded local fonts and kept clickable links. Original untouched.
- Optimized WebP derivatives: portrait ~34KB, RCS ~13KB, Goldadan ~5KB, Bhabhi ~47KB. Original asset files preserved. This avoids loading the 2.2MB game logo on the initial page.
- Page title, description, Open Graph, Twitter image, Person JSON-LD, robots and social image. Conditional canonical/sitemap generation from verified `SITE_URL`.

## Changed and new source
Modified `src/App.tsx`, `src/styles.css`, `index.html`, `public/favicon.svg`, `package.json`, lockfile and README. New `Credentials.tsx`, `SystemScene.tsx`, `scene/system.ts`, credential dataset, stable download aliases, optimized assets and résumé PDFs. New scripts: credential inventory, résumé generation, browser QA, motion/download QA, optional SEO output, research and scene poster capture. New certificate integrity test. Full research, audit, sources and results are under `docs/redesign`.

Earlier narrative/engine modules and tests are retained for traceability, but not imported by the new application. The old browser harness is explicitly labeled legacy. Original source fields remain intact rather than changing original content test expectations to fit the new UI.

## Validation
- `npm run typecheck`: passed.
- `npm test`: 17 passed. This includes original asset integrity/factual tests, retained legacy engine tests, and the new independent certificate-source and alias completeness test.
- `npm run build`: passed; static output in `dist`. No production dependencies added; axe and Lighthouse are development dependencies.
- Production Playwright `npm run test:browser`: 153 checks passed, zero failed. 59 screenshot states captured. Nine widths: 1920,1440,1280,1024,768,430,390,375,320. All section layouts, filters, previews, menu, project dialogs, downloads, reduced motion, mobile opt-in and simulated context-loss fallback exercised.
- All 40 PDF aliases fetched through production HTTP and SHA256 matched their corresponding original PDFs. Covers C# names and extensionless .NET source without platform-sensitive URLs.
- Axe WCAG A/AA + WCAG 2.1 AA: zero violations at 1440 and 390. Automated audit does not replace all assistive-technology testing.
- No runtime/console errors or HTTP failures in the production browser run.
- Both PDF versions: two pages, 12 hyperlink annotations each; text extraction passed, all seven program verification links present. Every final page rendered and visually reviewed at 1400px. No clipping, blank pages or overlap. Overflow checks are built into generation.
- `npm audit --omit=dev`: zero known vulnerabilities at inspection. Subsequent test-tool installation also reported zero vulnerabilities.
- `git diff --check`: passed.

## Visual review
Reviewed existing desktop/laptop/tablet/mobile and all seven reference desktop/mobile/scroll states before implementation. All seven accessible. Original screenshots retained under research-2026; comparison and technical uncertainty in DESIGN.md. New page reviewed at desktop, tablet, narrow/mobile, archive and dialog states, then revised. Corrections included perspective-grid overflow, C# download URL handling, print type sizing, mobile scene loading and optimized imagery. Final PDF pages and certificate contact sheet reviewed. Institution glyphs in the archive are restrained typographic identifiers, not downloaded official logo assets.

## Practical limits
- No verified public portfolio domain: canonical and domain-specific sitemap intentionally wait for `SITE_URL`. The build generator is implemented; standard metadata and sharing artwork are included.
- Project live/repository URLs and per-project technology stacks were not supplied or verified; no destinations or details fabricated. Project dialogs explicitly explain availability and offer direct email contact.
- Social destinations were preserved and mapped, not authenticated against third-party accounts. Certificate PDFs provide local completion evidence; remote issuer identity records were not independently authenticated.
- Lighthouse measures this local Chrome/host setup. Real devices, hosting and network conditions vary. No Safari/Firefox or real-device GPU benchmark is claimed. ATS text extraction was checked; universal applicant-tracking-system acceptance cannot be guaranteed.
- No lint script exists in the original repository; TypeScript, tests, production browser checks and build were run instead.

## Lighthouse measurements

Production preview on this machine. Score order: performance, accessibility, best practices, SEO.

- desktop: 100 / 100 / 100 / 100. LCP 0.2 s, TBT 80 ms.
- mobile: 97 / 100 / 100 / 100. LCP 2.6 s, TBT 0 ms.

Initial mobile baseline after first implementation was 79 / 100 / 100 / 100. Optimized WebP imagery and optional mobile 3D improved the measured performance score to 97. JSON reports in qa/ retain the detailed audits.

## Supplemental motion and download checks
`node scripts/motion-qa.mjs` passed: scroll changes the rendered scene; returning to the original scroll position restores the image within a mean per-channel pixel difference of 0.60/255 (limit 1/255), allowing the deliberate easing to settle. Exact screenshot bytes are not assumed identical while interpolation is settling. Premium and ATS links both generated the expected browser PDF downloads. The fresh-mobile poster and interactive opt-in states were captured separately.
