# Original asset and factual-content audit

Audit date: 11 October 2026 (Asia/Karachi). The new project already contained five original assets and three Finder metadata files. No previous portfolio source, scene architecture, screenshots, or styling was used as an implementation reference. Read-only access to other projects was restricted to locating original asset files and verifying business facts.

## Verified backup before project writes

- Archive: `/private/tmp/My_PORTFOLIO-original-20261011/My_PORTFOLIO-original.tar.gz`
- Archive SHA256: `4380b23be0160c79b56c010cf197a4dcd27e6db9b53f74544e5c3c819ef2f533`
- Manifest: `/private/tmp/My_PORTFOLIO-original-20261011/manifest.json`
- Includes original `.DS_Store`, `public/.DS_Store`, `public/assets/.DS_Store`, and all five original assets.
- Verification: every archive member was read from the completed archive and independently hashed; its SHA256 matched the original file.
- Backup lives outside this project and is not included in the web build.

## Immutable original assets

| Public path | Format / dimensions | Bytes | SHA256 |
| --- | --- | ---: | --- |
| `/assets/ali-bhatti-portrait.png` | PNG, RGBA; actual alpha range 0–255; 1105 × 1105 | 614179 | `25c5be07be587d76634108cc15af984b842195e56a1041318c443ec14f7c4a96` |
| `/assets/Resume_Ali_ejaz.pdf` | Original PDF, no modifications; 1 page | 246568 | `9a3380db4e5f862befcd56b05359502c1a2538b73a19e207eca4a71edf702c1d` |
| `/assets/RCS-Logo.png` | PNG with alpha; 512 × 512 | 76217 | `bf91b750b786634f5fb96da5d11d06bf2c71434735b756ab9c2a0978342cdfa3` |
| `/assets/GOLDADAN_LOGO.jpg` | JPEG, opaque black background; 1254 × 1254 | 46842 | `03adb9bec6020f4e11b846a17a840c6244a59eca25e8cd613d3a8a7cb9e41f18` |
| `/assets/BHABHI THULLA.png` | PNG with alpha; 1254 × 1254 | 2210590 | `734d285e9017520058fcce349607f4614d80bc6f97e928136a4650f4fa841727` |

The original logo bytes remain unchanged. `GOLDADAN_LOGO.jpg` and `BHABHI THULLA.png` are additional byte-identical copies, including the space in the latter. On this case-insensitive macOS filesystem, `rcs-logo.png` and `RCS-Logo.png` cannot coexist in one directory. The initial lowercase RCS file was first copied byte-for-byte to `public/assets/originals/rcs-logo.png`, then renamed through a unique temporary filename to make the actual public directory entry `RCS-Logo.png`. Its original bytes are also preserved in the verified backup and untouched upstream source. An exact directory-entry check confirms the required case for case-sensitive Linux hosting. Browser URLs encode spaces as needed. No asset content was regenerated, cropped, recolored, or otherwise altered.

## Provenance evidence

### /assets/ali-bhatti-portrait.png

- Original file already in this workspace: `/Users/ali_bhatti/workspace/My_PORTFOLIO/public/assets/ali-bhatti-portrait.png`
- Independently verified matching original: `/Users/ali_bhatti/workspace/ALI BHATTI — BEYOND THE SCREEN/public/images/ali-bhatti-portrait.png`
- Equality check: complete file bytes and SHA256 matched.

### /assets/Resume_Ali_ejaz.pdf

- Original file already in this workspace: `/Users/ali_bhatti/workspace/My_PORTFOLIO/public/assets/Resume_Ali_ejaz.pdf`
- Independently verified matching original: `/Users/ali_bhatti/workspace/ALI BHATTI — BEYOND THE SCREEN/public/Resume_Ali_ejaz.pdf`
- Equality check: complete file bytes and SHA256 matched.

### /assets/RCS-Logo.png

- Original file already in this workspace: `/Users/ali_bhatti/workspace/My_PORTFOLIO/public/assets/rcs-logo.png`
- Independently verified matching original: `/Users/ali_bhatti/workspace/ALI BHATTI — THE CODEVERSE/public/images/projects/rcs-logo.png`
- Equality check: complete file bytes and SHA256 matched.

### /assets/GOLDADAN_LOGO.jpg

- Original file already in this workspace: `/Users/ali_bhatti/workspace/My_PORTFOLIO/public/assets/goldadan-logo.jpg`
- Independently verified matching original: `/Users/ali_bhatti/workspace/GOLDADAN/Frontend/public/assets/goldadan-logo-original.jpg`
- Equality check: complete file bytes and SHA256 matched.

### /assets/BHABHI THULLA.png

- Original file already in this workspace: `/Users/ali_bhatti/workspace/My_PORTFOLIO/public/assets/bhabhi-thulla.png`
- Independently verified matching original: `/Users/ali_bhatti/workspace/ALI BHATTI — THE CODEVERSE/public/images/projects/BHABHI THULLA.png`
- Equality check: complete file bytes and SHA256 matched.

## Portrait review

The original is an 1105 × 1105 RGBA PNG. It is a recognizable centered photograph of Ali with crossed arms and a gray T-shirt, surrounded by transparency. Actual alpha values span 0–255. There is substantial transparent spacing around the upper-body silhouette. A 2.5D plane / sampled image-particle treatment is appropriate; the file is not a 3D face or body model. The photograph is preserved exactly.

## Résumé audit

The one-page `Resume_Ali_ejaz.pdf` was read using native PDFKit text extraction, rendered to PNG, and visually inspected. The temporary visual review artifact is `/private/tmp/My_PORTFOLIO-original-20261011/resume-review.png`. No résumé edits were performed.

| Fact | Verified content |
| --- | --- |
| Legal name | MUHAMMAD ALI EJAZ |
| Display name | ALI BHATTI, as explicitly requested by the user |
| Professional title | Full Stack Web Developer |
| Upwork | Freelance Full Stack Web Developer; September 2025 – June 2026 |
| Fiverr | Freelance Full Stack Web Developer; September 2025 – June 2026 |
| University | Punjab University; Bachelor in Computer Science; 2021–2025 |
| College | Hawk College; Intermediate in Computer Science (ICS); 2018–2020 |
| Contact location | Khanewal, Pakistan |
| Email | dev._.ali@icloud.com |
| Phone | +92 317 2003786 |
| Languages | JavaScript (ES6+), TypeScript, Python |
| Frontend | HTML5, CSS3, JavaScript (ES6+), TypeScript, React.js, Next.js |
| Backend | Node.js, NestJS, REST APIs, JWT Authentication |
| Database | PostgreSQL, Prisma ORM |
| Tools | Git, GitHub, Postman |

Verified work descriptions include responsive React / Next.js interfaces, NestJS / Node.js backend services and REST APIs, PostgreSQL / Prisma data management, JWT authentication, client collaboration, and clean maintainable code. The résumé lists Lahore for the two freelance role entries; personal contact location remains Khanewal as requested.

## Project factual boundaries

- **RCS CARGO:** authentic RCS logo verified. Connected logistics is the requested visual concept. Do not turn conceptual routes, parcels, or transport scenery into claims of unverified shipped functionality.
- **GOLDADAN:** authentic original JPEG matches `GOLDADAN/Frontend/public/assets/goldadan-logo-original.jpg`. Local factual metadata in `GOLDADAN/Frontend/lib/site.ts` identifies **GOLDADAN LLC** and describes **security, software, hardware and enterprise technology**. The local public-content domain metadata corroborates these four areas. Appropriate portfolio description: “A company website for GOLDADAN LLC, presenting security, software, hardware and enterprise technology.” No sales metrics, customer lists, ecommerce functions, or unverified product functionality are claimed.
- **BHABHI THULLA:** authentic original card-game logo verified; card-game-inspired visual setting explicitly requested by user. Do not infer multiplayer, payment, or deployment claims from the artwork.
- No project URL was supplied by the user. Project launch controls should use an explicit unavailable state until a destination is verified and intentionally configured.

## Runtime verification responsibility

The original asset files and required aliases exist and have been byte-verified. `docs/asset-manifest.json` is the machine-readable inventory. Content tests should check these immutable hashes and alias equality. Browser QA and/or HTTP checks must additionally verify that the application actually requests the portrait, all three required logo paths, and the résumé download, and that the downloaded PDF hash matches this inventory. Runtime results belong in the final verification report; this asset audit alone does not assert that a running app has loaded a file.
