# Verification report

Date: 2026-11-18

## Assets

- Probed all 736 source MP4 files with `ffprobe`; no unreadable videos or metadata errors.
- AmbiPhys-Bench: 240 videos; AmbiPhys-Bench-SkyBlue: 240; PhysTwin: 256.
- Generated six independent comparison videos and 12 multi-size paper images. Source files were not edited.

## Build and static checks

- `npm run build`: passed; Astro reported 0 errors, 0 warnings, and 0 hints.
- `npm run check:site`: passed for `/` and `/PrismPhys/`.
- Checked six demos, 12 paper images, local assets, anchors, and duplicate HTML IDs.

## Browser checks

Playwright Chromium was installed only in a temporary directory, not in project dependencies.

| Check | Result |
| --- | --- |
| 1440×1000, 768×1024, 390×844, 320×740 | No page overflow, broken images, or duplicate IDs |
| Six demo tabs | All videos loaded and played; 1280×632, H.264 |
| AmbiPhys videos | 3.24 seconds each |
| PhysTwin videos | 2.70 seconds each |
| Keyboard | End, ArrowLeft, and Home changed the selected demo correctly |
| BibTeX | Clipboard button reported `Copied` |
| Reduced motion | Smooth scrolling and video transitions disabled |
| JavaScript disabled | All sections and six direct video links remained available |
| `/PrismPhys/` production simulation | Video switching worked; HTTP 200; no console errors |

The production check also caught and fixed inline scripts blocked by CSP. Both interactions now load from same-origin external scripts.

## vibe-check

Ran the requested read-only scanner against the locally mounted `/PrismPhys/` build: 67 requests, 13 PASS, 4 WARN, 3 FAIL, 2 INFO.

- Passed: sensitive files, directory listings, public source maps, restrictive script/CSP rules, CORS, error responses, and debug/API endpoints.
- The three FAIL results concern `frame-ancestors`, `X-Frame-Options`, and `X-Content-Type-Options`, which require HTTP response headers and cannot be set by a purely static local `python -m http.server`.
- One WARN identifies the temporary Python server's version header; it is not part of the site or GitHub Pages.
- Production GitHub Pages headers were not scanned because the site has not been deployed. Recheck the deployed URL before treating these items as resolved.

## Dependency audit

`npm audit` reports 13 high-severity ReDoS findings through the build-time `picomatch` dependency chain. The recommended forced fix selects an incompatible framework version and was not applied. The deployed site is static HTML/CSS/JS and does not ship npm packages or a Node server.
