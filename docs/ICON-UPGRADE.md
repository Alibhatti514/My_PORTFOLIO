# itshover controls upgrade

Project: `/Users/ali_bhatti/workspace/My_PORTFOLIO`  
Date: 11 October 2026, Asia/Karachi.

## Installed components

These exact commands were run from the project root:

```sh
npx shadcn@latest add https://itshover.com/r/download-icon.json
npx shadcn@latest add https://itshover.com/r/arrow-narrow-down-dashed-icon.json
npx shadcn@latest add https://itshover.com/r/arrow-narrow-up-dashed-icon.json
```

The CLI resolved to shadcn **4.21.4** and installed Motion **14.1.0**. The generated shared `types.ts` was inspected and retained; subsequent commands recognized it as identical and skipped overwriting it. No customized component existed at the new registry paths.

Original registry sources: [DownloadIcon](https://itshover.com/r/download-icon.json), [ArrowNarrowDownDashedIcon](https://itshover.com/r/arrow-narrow-down-dashed-icon.json), [ArrowNarrowUpDashedIcon](https://itshover.com/r/arrow-narrow-up-dashed-icon.json).

The CLI unexpectedly deduplicated numeric SVG strings, including changing `viewBox="0 0 24 24"` to the invalid `viewBox="0 24"` and shortening download paths. Generated files were compared with the downloaded registry JSON, and exact upstream SVG/source values were restored. The arrow components retain their original source and movement. DownloadIcon retains its original keyframes, duration, easing, tray pulse, and pause; a lifecycle cancellation guard prevents stale asynchronous cycles after unmount or rapid pointer re-entry.

## Integration

- The shared résumé anchor now uses **DownloadIcon** in the header, final contact section, and reading view. The label is **DOWNLOAD RÉSUMÉ**. The compact mobile header preserves an accessible label while displaying the icon. The original PDF path and `download="Resume_Ali_ejaz.pdf"` remain unchanged.
- The hero's **scroll-to-enter** control and footer **next chapter** control use **ArrowNarrowDownDashedIcon**.
- A compact footer **previous chapter** control uses **ArrowNarrowUpDashedIcon** and is disabled at the beginning. At the final chapter, the primary control also uses the up arrow for **return to the beginning**.
- All navigation calls the existing `go()` / `scrollToChapter()` path. No extra scroll controller, camera update, or scene transformation was introduced.
- The outer button or link owns hover and keyboard focus; the icon uses the registry's imperative animation handle. SVGs are decorative and add no tab stops. The pointer and focus states are coordinated so leaving the pointer does not cancel a still-focused control.
- App's existing reduced-motion preference also controls the icons. It initializes from and follows the OS preference, while preserving the existing manual motion toggle. Reduced mode prevents animation starts, stops active animation, and presents the original icon at rest.
- Styling uses the existing ink, pearl, and violet palette, explicit 24 px SVG dimensions, subtle depth, visible focus outlines, and compact controls. Unrelated diagonal external-link arrows retain their existing treatment.

## Configuration and files

There was no previous shadcn configuration. Manual setup follows the [shadcn installation guidance](https://ui.shadcn.com/docs/installation/manual), using Vite/TypeScript aliases and an isolated utility stylesheet. Tailwind Preflight and a replacement global theme were deliberately omitted to preserve the existing portfolio styling.

| File | Change |
| --- | --- |
| `components.json` | New shadcn registry paths and existing-project configuration |
| `tsconfig.json`, `vite.config.ts` | `@/` alias and Tailwind Vite plugin |
| `package.json`, `package-lock.json` | Motion and shadcn utility dependencies |
| `src/shadcn.css` | Isolated Tailwind theme/utility imports; no Preflight reset |
| `src/lib/utils.ts` | Standard `cn()` helper for the shadcn configuration |
| `src/main.tsx` | Loads utility CSS before the original stylesheet |
| `src/components/ui/download-icon.tsx` | Installed animated download icon with cancellation guard |
| `src/components/ui/arrow-narrow-down-dashed-icon.tsx` | Installed original animated down icon |
| `src/components/ui/arrow-narrow-up-dashed-icon.tsx` | Installed original animated up icon |
| `src/components/ui/types.ts` | Inspected shared registry types |
| `src/components/AnimatedControls.tsx` | Shared animation preference, accessible résumé and chapter controls |
| `src/components/Story.tsx` | Shared résumé controls and hero indicator integration |
| `src/App.tsx` | Motion context, previous/next controls, final return-to-start icon |
| `src/styles.css` | Appended scoped interaction and responsive styles |
| `scripts/icon-controls-qa.mjs` | Focused browser checks and separate artifact output |

Resolved supporting dependencies: Tailwind CSS / Vite plugin **4.3.3**, clsx **2.1.1**, and tailwind-merge **3.7.0**. The dependency tree reports no version conflict. No static Lucide replacements were added.

## Verification status

- TypeScript validation: **passed**.
- Production build: **passed**. The existing Three.js vendor-size advisory remains.
- Existing unit tests: **16 passed, 0 failed**.
- All three components: imported and rendered through React's server renderer; each emitted a complete `0 0 24 24` SVG viewBox.
- File integrity: original résumé PDF, `src/engine/*`, and `src/scene/*` remain byte-identical to the pre-upgrade snapshot. The existing stylesheet remains an unchanged prefix, followed by scoped new styles.
- Development server: started successfully, using `http://127.0.0.1:4174` because port 4173 was already occupied. The pre-existing server was not stopped or changed.
- The owned temporary development server was stopped at handoff. The pre-existing server on 4173 was left running.
- **Browser verification is pending.** Opening the updated preview was denied by browser security. A retry after conversational approval was still blocked by a saved browser-permission setting. Automation was stopped; no successful visual, mobile, keyboard, download, or transition browser result is claimed for this upgrade.
- After the user reported “Permission updated,” the preview was restarted and browser access was retried. The tool again returned the same saved-permission block. The temporary server was stopped, and browser verification remains pending.

The prior `docs/QA.md` and `docs/qa/` artifacts describe the original portfolio delivery, not this icon upgrade. The focused script writes to `docs/qa-icons/` so those baseline artifacts are preserved. An interrupted browser run must not be treated as a completed verification.

Once local browser access is permitted, run against a running server:

```sh
QA_URL=http://127.0.0.1:4174 node scripts/icon-controls-qa.mjs
```

This suite checks rendered SVG motion on whole-control hover and keyboard focus, system/manual reduced motion, next/previous/return navigation, desktop and mobile bounds, and actual résumé-download bytes. Its final assertions and screenshots should be inspected before marking browser verification complete.
