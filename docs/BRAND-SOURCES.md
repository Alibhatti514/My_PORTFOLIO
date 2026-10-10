# Brand asset sources

All 18 files in `public/assets/brands/` are authentic brand silhouettes from the canonical [Simple Icons repository, release 11.15.0](https://github.com/simple-icons/simple-icons/tree/11.15.0). This fixed release preserves consistent versions, including CSS3 and LinkedIn. No logo geometry was redrawn or invented.

The source SVG path data, titles, and `viewBox="0 0 24 24"` are preserved. The only changes are explicit `width="256"`, `height="256"`, and monochrome `fill="#172326"` attributes on the SVG root for predictable browser and WebGL texture use.

Simple Icons is distributed under [CC0 1.0 Universal](https://github.com/simple-icons/simple-icons/blob/11.15.0/LICENSE.md); a copy is included at `public/assets/brands/SIMPLE-ICONS-LICENSE.md`. Brand marks remain the property of their respective owners. Brand-specific source and license metadata below are recorded as published by Simple Icons, and are separate from the library’s CC0 dedication.

| File | Brand | Original brand source | Additional license metadata |
| --- | --- | --- | --- |
| [`javascript.svg`](../public/assets/brands/javascript.svg) | JavaScript | [Source](https://github.com/voodootikigod/logo.js/blob/1544bdeed6d618a6cfe4f0650d04ab8d9cfa76d9/js.svg) | MIT |
| [`typescript.svg`](../public/assets/brands/typescript.svg) | TypeScript | [Source](https://www.typescriptlang.org/branding) | Not specified by upstream metadata |
| [`python.svg`](../public/assets/brands/python.svg) | Python | [Source](https://www.python.org/community/logos/) | Not specified by upstream metadata |
| [`html5.svg`](../public/assets/brands/html5.svg) | HTML5 | [Source](https://www.w3.org/html/logo/) | Not specified by upstream metadata |
| [`css3.svg`](../public/assets/brands/css3.svg) | CSS3 | [Source](https://www.w3.org/html/logo/) | Not specified by upstream metadata |
| [`react.svg`](../public/assets/brands/react.svg) | React | [Source](https://github.com/facebook/create-react-app/blob/282c03f9525fdf8061ffa1ec50dce89296d916bd/test/fixtures/relative-paths/src/logo.svg) | Not specified by upstream metadata |
| [`nextdotjs.svg`](../public/assets/brands/nextdotjs.svg) | Next.js | [Source](https://vercel.com/design/brands#next-js) | Not specified by upstream metadata |
| [`nodedotjs.svg`](../public/assets/brands/nodedotjs.svg) | Node.js | [Source](https://nodejs.org/en/about/branding) | Not specified by upstream metadata |
| [`nestjs.svg`](../public/assets/brands/nestjs.svg) | NestJS | [Source](https://nestjs.com) | Not specified by upstream metadata |
| [`postgresql.svg`](../public/assets/brands/postgresql.svg) | PostgreSQL | [Source](https://wiki.postgresql.org/wiki/Logo) | Not specified by upstream metadata |
| [`prisma.svg`](../public/assets/brands/prisma.svg) | Prisma | [Source](https://github.com/prisma/presskit/tree/4bcb64181f266723439d955d60afa1c55fefa715) | Not specified by upstream metadata |
| [`git.svg`](../public/assets/brands/git.svg) | Git | [Source](https://git-scm.com/downloads/logos) | CC-BY-3.0 |
| [`github.svg`](../public/assets/brands/github.svg) | GitHub | [Source](https://github.com/logos) | Not specified by upstream metadata |
| [`postman.svg`](../public/assets/brands/postman.svg) | Postman | [Source](https://www.getpostman.com/resources/media-assets/) | Not specified by upstream metadata |
| [`linkedin.svg`](../public/assets/brands/linkedin.svg) | LinkedIn | [Source](https://brand.linkedin.com) | Not specified by upstream metadata |
| [`freelancer.svg`](../public/assets/brands/freelancer.svg) | Freelancer | [Source](https://www.freelancer.com) | Not specified by upstream metadata |
| [`fiverr.svg`](../public/assets/brands/fiverr.svg) | Fiverr | [Source](https://www.fiverr.com/press-kit) | Not specified by upstream metadata |
| [`upwork.svg`](../public/assets/brands/upwork.svg) | Upwork | [Source](https://www.upwork.com/press/) | Not specified by upstream metadata |

Each SVG’s exact distribution source is `https://raw.githubusercontent.com/simple-icons/simple-icons/11.15.0/icons/<filename>`. Original source metadata: [simple-icons.json](https://github.com/simple-icons/simple-icons/blob/11.15.0/_data/simple-icons.json).

Git logo attribution: Jason Long, [Git logos](https://git-scm.com/downloads/logos), licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). The monochrome styling and display dimensions have been adapted; vector path geometry is unchanged.

JavaScript logo source: Christopher Williams / the [logo.js project](https://github.com/voodootikigod/logo.js), marked MIT in Simple Icons metadata. The original MIT license is included at `public/assets/brands/JAVASCRIPT-LOGO-LICENSE.txt`.

Validation: all 18 assets parse as SVG XML, contain a real brand path, preserve the upstream viewBox, and have explicit dimensions and a deterministic solid fill.
