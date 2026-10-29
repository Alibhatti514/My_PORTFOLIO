# Burgundy & cream / Portfolio V3

## Preservation and evidence

- Started from clean `redesign/continuous-world-2026` at `f81cf61`.
- Created `redesign/burgundy-cream-world-2026`. No history rewrite, push or deployment.
- The original photograph, original résumé and three original project assets retain their source hashes (asset tests). Previous implementations and their evidence remain in Git.
- Re-extracted all 40 source PDFs by file signature, including the extensionless .NET certificate. No duplicate hashes. All download aliases retain the source bytes. Embedded PDF annotations supply verification URLs.
- Inventory: 3 Microsoft professional certificates; 4 specializations (Packt and University of London); 2 Duke University guided projects; 31 courses. All seven program certificates and both Duke records are featured exactly once.
- Duke: **Object-Oriented Programming in Python** and **Web Scraping with Python**, both dated **October 28, 2026**. These are guided projects, not Duke degrees or specializations.
- Completion and issuer claims are grounded in local PDF contents. Online credential authenticity has not been independently authenticated.
- Projects have verified artwork and descriptions but no supplied public destinations or functional screenshots. The site preserves that limitation and uses explicitly labeled abstract visual studies.

## Skills audit

Résumé experience: JavaScript (ES6+), TypeScript, Python, HTML5, CSS3, React.js, Next.js, Node.js, NestJS, PostgreSQL, Prisma ORM, Git, GitHub, Postman, REST APIs, JWT authentication and role-based access control.

Completed coursework is labeled separately: C# 12, .NET 8, ASP.NET Core, Blazor, Svelte 5, SvelteKit, Express, Supabase, Sanity CMS and Stripe integration. Further learning includes OOP, web scraping, algorithms, deployment, security and accessibility. No proficiency percentages, Docker or MySQL claims were added. A program's summary mentions Vercel deployment and Microsoft Copilot use; these alone are not treated as independent professional skills.

Branded technologies use bundled Simple Icons or Devicon SVGs, with existing and new license files in `public/assets/brands`. SvelteKit uses the authentic Svelte mark; ASP.NET Core uses the authentic .NET mark. REST and JWT remain readable concepts rather than invented brand symbols. Institution identities appear on original certificate previews rather than redrawn institutional logos.

## Design research

The prior hero and monitor-style project were captured before edits. Reference pages: [Bruno Simon](https://bruno-simon.com/) and [Dennis Snellenberg](https://www.awwwards.com/sites/dennis-snellenberg). The relevant principles are persistent spatial identity, clear editorial hierarchy and restrained interaction; the requested vertical path and burgundy palette define this implementation. The reference-page metadata is retained in `research/references.json`.

## Architecture

Native scroll supplies one dimensionless position (0–7). A single damped value drives the DOM page compositions, shared photograph, scene surfaces and persistent Three.js world. It is reversible and independent of elapsed animation time.

The camera travels monotonically from y=0 to y=-63, with restrained depth changes. There are no orbit controls, circular camera routes, mounted scene replacements or whole-page black fades. A continuous open ribbon spans the entire world. Fourteen persistent folios interpolate from vertical marks into a technology lattice, routes, architectural forms, playing pieces, paper layers and closing marks.

DOM typography and artwork travel through a perspective stage. Incoming compositions begin before outgoing content has left. The original portrait remains a single element through Hero and About: position, scale, blur, opacity and gradient mask are sampled together. Facial geometry is never displaced.

The stage uses `overflow: clip` so keyboard focus cannot secretly scroll the fixed composition. Offscreen panels become inert; visible interactive technologies have readable names, focus states and evidence. The paper stack captures horizontal pointer gestures and preserves native vertical touch scrolling.

One renderer, capped DPR, no postprocessing, no texture-heavy environment map, 3 shared geometries, asynchronous shader compilation, and no GPU draws for unchanged progress. Font families/weights were reduced. Reduced motion, reading mode and unavailable WebGL expose the complete stationary document; WebGL resources and event listeners are disposed on exit.

## Validation artifacts

- `qa/report.json`: responsive/browser interactions, forward/reverse camera states, seven boundary triptychs and WCAG scans.
- `qa/journey-desktop.webm` and `qa/journey-mobile.webm`: continuous rendered scroll, skills, certificate interaction, both Duke records and reverse travel. Mobile recording includes an actual CDP touch gesture.
- `qa/lighthouse-*.html`, JSON and `performance-summary.json`: reproducible local Lighthouse results with the active renderer recorded.
- `pdf-preview/`: every page of both final PDFs rendered and inspected, text extraction and link/font validation.
- `resume-source/`: reproducible HTML source and layout overflow checks for both PDFs.

Run `npm test`, `npm run build`, `npm run test:browser`, `node scripts/v3-record.mjs`, `node scripts/v3-performance.mjs`, `npm run resume`, and `python3 scripts/validate-resumes.py`. Browser checks use `QA_URL` or `http://127.0.0.1:4174`.
