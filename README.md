# Ali Bhatti — Ideas into interfaces. And beyond.

An original developer portfolio with an exploded 3D system, editorial project presentations, verified-content career and education sections, a complete certificate library, and two downloadable résumé formats.

## Local development

Node.js 22.12+ and npm. This is the existing React / TypeScript / Vite checkout; no new application or hosting account was created.

```sh
npm ci
npm run dev -- --port 4173
npm run typecheck
npm test
npm run build
npm run preview -- --port 4174
QA_URL=http://127.0.0.1:4174 npm run test:browser
```

Browser QA and résumé generation use locally installed Google Chrome via Playwright. Install Chrome or change the `channel` in those scripts for another supported browser. `npm run test:browser:legacy` preserves the previous chapter-experience harness for historical reference; it does not test the new page.

## Features and design

Dark graphite, warm ivory, chartreuse, and locally bundled Space Grotesk / Manrope / Plex Mono. Native section anchors and normal document scrolling. Three.js is dynamically imported; pointer response and scroll separate a procedural interface / logic / data stack. Rendering is capped near 30fps and pauses offscreen or when the document is hidden. DPR is capped. GPU resources, observers and listeners are disposed on cleanup. Mobile starts with a small scene poster and offers **Explore in 3D**. Reduced motion and `?webgl=off` retain all content with a static scene. Motion can also be changed in the footer.

Three original project identities, details dialogs, experience, education, skill layers, seven featured program credentials, searchable/filterable archive of 40 documents, native certificate preview dialogs, premium and ATS downloads, contact links and safe external social links. HTML contains all important information independently of the scene. No accounts, messages, contact submissions or analytics are involved.

## Source map

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Semantic sections, project dialog, navigation, preference state |
| `src/styles.css` | Design tokens, desktop/mobile layout and motion styles |
| `src/components/SystemScene.tsx` | Progressive scene loading, mobile opt-in and fallback |
| `src/scene/system.ts` | Procedural Three.js architecture, scroll state and cleanup |
| `src/components/Credentials.tsx` | Featured credentials, archive, filters, native preview modal |
| `src/data/certificates.json` | PDF-derived metadata and downloadable asset mappings |
| `src/data/portfolio.ts`, `socials.ts`, `chapters.ts` | Preserved factual content and original destinations |
| `public/assets/optimized/` | WebP derivatives; original assets remain intact |
| `public/assets/resume/` | Premium and ATS PDFs |
| `docs/redesign/` | Project audit, reference research, design, certificate inventory, QA and sources |

Earlier world/scene modules, Story and animated controls are retained for provenance but are no longer in the main application bundle. Legacy source-data tests remain useful factual and asset-preservation checks; the new Playwright suite exercises the current interface.

## Certificates

All PDF-signature files below `public/assets/Certificates` are included, including the extensionless .NET course. Finder metadata is excluded. The inventory is derived from actual PDF text and records title, issuer, type, completion date, source, file hash, issuer verification link, thumbnail and featured status. Three Microsoft professional certificates and four specializations are featured. Two Duke documents are guided projects. Packt specialization attribution is corroborated by its constituent course PDFs; those program PDFs omit issuer text. Local completion evidence does not independently authenticate issuer records.

```sh
# Requires Python 3 + pypdf, and Poppler pdftotext / pdftoppm
npm run audit:certificates
npm test
```

The audit makes byte-identical aliases at `public/assets/credentials/credential-NN.pdf`. These avoid encoded `#`, spaces, punctuation and extensionless MIME behavior across static hosts. Original source files are never renamed or edited. Preview images are lazily loaded when a dialog opens. The automated test independently scans every source PDF, checks complete coverage, uniqueness, source/alias hashes, previews and featured program status. Browser tests also fetch and hash every alias through the production server.

## Résumé sources and generation

```sh
npm run resume
# Visual review after regenerating:
pdftoppm -scale-to 1400 -png public/assets/resume/Resume-Premium.pdf /tmp/resume-premium
pdftoppm -scale-to 1400 -png public/assets/resume/Resume-ATS.pdf /tmp/resume-ats
```

`scripts/generate-resumes.mjs` owns the content and print template, embeds local fonts, checks page overflow and writes HTML sources under `docs/redesign/resume-source/`. Both outputs are two-page, selectable-text PDFs with clickable contact/profile and credential links. The premium version uses a coordinated restrained layout; ATS uses a single column. The original `public/assets/Resume_Ali_ejaz.pdf` is unchanged. Re-run the PDF visual QA whenever content changes. Experience/education dates come from that original, without invented job history or outcomes.

## Production deployment and SEO

`npm run build` creates `dist/`, suitable for static hosting at the domain root. Upload the complete output, including `assets/`, certificate aliases, original PDFs, résumés, robots and sharing assets. There are no runtime environment variables, API keys or backend requirements. No deployment was requested or performed.

For a verified public hostname, set `SITE_URL` during the build. `scripts/seo-output.mjs` then emits the canonical URL, absolute Open Graph/Twitter image URLs, sitemap and robots sitemap reference. With no known public origin, domain-specific metadata is intentionally omitted. Do not invent a domain. Standard metadata, Person JSON-LD and a local social sharing image are already present. The single page uses anchors; no route rewrites are needed.

```sh
# After configuring SITE_URL in your hosting environment:
npm run build
```

## Quality checks and performance

`tests/certificates.test.ts` adds inventory and alias integrity checks. `scripts/redesign-qa.mjs` covers nine viewport widths from 320 to 1920, sections, filters, dialogs, downloads, PDF responses, hash integrity, navigation, reduced motion, WebGL fallback and axe WCAG AA checks. Reports and reviewed screenshots are in `docs/redesign/qa/`. PDF renders and extracted text are in `docs/redesign/audit/`.

```sh
npx lighthouse http://127.0.0.1:4174 --chrome-flags='--headless --no-sandbox' --output=json --output-path=/tmp/lighthouse-mobile.json
npx lighthouse http://127.0.0.1:4174 --chrome-flags='--headless --no-sandbox' --preset=desktop --output=json --output-path=/tmp/lighthouse-desktop.json
```

No extra production dependencies were added. Axe and Lighthouse are development tools. Local test results are evidence for this machine and build; hosted network/GPU performance will vary. Actual scores, visual review notes and limitations are in `docs/redesign/IMPLEMENTATION.md`.

Image derivatives can be regenerated with `node scripts/optimize-assets.mjs` (requires `cwebp`). With the local site running, `node scripts/capture-system-poster.mjs` regenerates the scene poster. `node scripts/motion-qa.mjs` checks scroll/return appearance within a documented pixel tolerance and exercises both browser résumé downloads.
