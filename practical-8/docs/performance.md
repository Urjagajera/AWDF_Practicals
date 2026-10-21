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
