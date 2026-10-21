# Practical 8 — performance measurements

All numbers come from real runs on this machine (Windows 11, Node 22, Vite 5 production build).

**How they were taken**

- **Bundle sizes** — the output of `npm run build` (Vite prints raw and gzip size per file).
- **First visit** — the production build served with `npm run preview`, opened in a fresh browser tab, then
  read from the Performance API: every `.js` resource the page downloaded (`decodedBodySize`) and the
  navigation timing (`domContentLoadedEventEnd`). Only the *first, cold* load is used — later reloads come
  from the browser cache and download nothing.
- **Slow 3G estimate** — gzip bytes ÷ 50 KB/s (DevTools' "Slow 3G" preset is ~400 kbit/s down), excluding
  latency. This is a calculation, not a measurement.

## Before — one bundle (baseline)

Build (`practical-8/client`, every page imported statically, Chart.js imported by the Tasks page):

```
dist/index.html                  0.81 kB │ gzip:   0.46 kB
dist/assets/index-Ds8KLZe9.css  17.31 kB │ gzip:   4.34 kB
dist/assets/index-CO16V0Ts.js  360.31 kB │ gzip: 120.74 kB
```

First visit to `/` (cold):

| JS files downloaded | JS size | DOMContentLoaded |
|---|---|---|
| `index-CO16V0Ts.js` | 351.9 KB | 175.7 ms |

Every page and the whole chart library are downloaded before anything appears, even on the Home page,
which uses none of them. Slow 3G estimate for the JS alone: 120.74 KB ÷ 50 KB/s ≈ **2.4 s**.

## After — route-based code splitting

`React.lazy()` for Projects, Tasks, Login, Contact and NotFound; Home stays in the main bundle. One
`<Suspense fallback={<PageFallback />}>` wraps the `<Routes>` block.

```
dist/index.html                       0.81 kB │ gzip:  0.46 kB
dist/assets/index-g77wH53f.css       17.69 kB │ gzip:  4.46 kB
dist/assets/NotFound-ijNL8_J0.js      0.73 kB │ gzip:  0.43 kB
dist/assets/ProjectsPage-DYzCnVNo.js  1.34 kB │ gzip:  0.62 kB
dist/assets/Login-IHL-WbZY.js         2.86 kB │ gzip:  1.22 kB
dist/assets/Contact-CjnFG59R.js       3.18 kB │ gzip:  1.34 kB
dist/assets/Tasks-Ut8XypiR.js       173.88 kB │ gzip: 60.68 kB
dist/assets/index-BhdKm2-o.js       180.51 kB │ gzip: 59.34 kB
```

First visit to `/` (cold, fresh tab):

| JS files downloaded | JS size | DOMContentLoaded |
|---|---|---|
| `index-BhdKm2-o.js` | 176.3 KB | 59.9 ms |

Chunks then load only when their route is opened (Network / resource timing in the same tab):

| Action | JS loaded so far |
|---|---|
| open `/` | `index` |
| click **Projects** | `index`, `ProjectsPage` |
| click **Contact** | `index`, `ProjectsPage`, `Contact` |
| click **Log in** | … + `Login` (13.2 ms); the `PageFallback` skeleton appeared 5.3 ms after the click |

The Tasks chunk is still large (174 kB) because Chart.js is bundled with the Tasks page — handled next.

## Comparison so far

| | Before | After route splitting |
|---|---|---|
| JS needed for the first page | 360.31 kB (120.74 kB gzip) | 180.51 kB (59.34 kB gzip) — **−50 %** |
| Slow 3G estimate for that JS | ≈ 2.4 s | ≈ 1.2 s |
| DOMContentLoaded, cold, localhost | 175.7 ms | 59.9 ms |

The localhost timings are single cold samples and vary from run to run; the byte counts are exact and are
the reliable part of the comparison. Total code over a full session is about the same — lazy loading
changes *when* code is downloaded, not *how much*.
