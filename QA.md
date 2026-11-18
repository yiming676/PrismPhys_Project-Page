# Verification report

Date: 2026-11-18

## Assets

- Probed all 736 source MP4 files with `ffprobe`; no unreadable videos or metadata errors.
- AmbiPhys-Bench: 240 videos; AmbiPhys-Bench-SkyBlue: 240; PhysTwin: 256.
- Generated 40 comparison-video variants across 28 cases and 12 multi-size paper images. Source files were not edited.
- AmbiPhys-Bench contributes 12 cases with two selectable views each; PhysTwin contributes 16 dual-view cases.

## Build and static checks

- `npm run build`: passed; Astro reported 0 errors, 0 warnings, and 0 hints.
- `npm run check:site`: passed for `/` and `/PrismPhys_Project-Page/`.
- Checked 40 video variants, 12 paper images, local assets, anchors, and duplicate HTML IDs.

## Browser checks

Playwright Chromium was installed only in a temporary directory, not in project dependencies.

| Check | Result |
| --- | --- |
| 1440×1000, 768×1024, 390×844, 320×740 | No page overflow, broken images, or duplicate IDs |
| 40 video variants | Every video loaded and played; 1280×632, H.264 |
| Dataset separation | 12 AmbiPhys-Bench cases and 16 PhysTwin cases; independent selection memory |
| AmbiPhys videos | 3.24 seconds each |
| PhysTwin videos | 1.67–2.70 seconds each |
| Case selection | Touch/native horizontal scrolling, previous/next buttons, boundaries, and view memory passed |
| Keyboard | End, ArrowLeft, Home, and previous/next controls changed the selected case correctly |
| BibTeX | Clipboard button reported `Copied` |
| Reduced motion | Smooth scrolling and video transitions disabled |
| JavaScript disabled | All sections and 40 direct video links remained available |
| Console and resource responses | No browser errors or failed HTTP responses |

The production check also caught and fixed inline scripts blocked by CSP. Both interactions now load from same-origin external scripts.

## vibe-check

Ran the requested read-only scanner against the locally mounted `/PrismPhys/` build: 67 requests, 13 PASS, 4 WARN, 3 FAIL, 2 INFO.

- Passed: sensitive files, directory listings, public source maps, restrictive script/CSP rules, CORS, error responses, and debug/API endpoints.
- The three FAIL results concern `frame-ancestors`, `X-Frame-Options`, and `X-Content-Type-Options`, which require HTTP response headers and cannot be set by a purely static local `python -m http.server`.
- One WARN identifies the temporary Python server's version header; it is not part of the site or GitHub Pages.
- GitHub Pages response headers remain platform-controlled; no new header scan was performed for this revision.

## Dependency audit

`npm audit` reports 13 high-severity ReDoS findings through the build-time `picomatch` dependency chain. The recommended forced fix selects an incompatible framework version and was not applied. The deployed site is static HTML/CSS/JS and does not ship npm packages or a Node server.
