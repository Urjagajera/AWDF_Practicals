# Practical 8 — Performance Optimization and Lazy Loading in React

**CO1 / PO3, PO5** · Objective: improve frontend performance using lazy loading and code splitting.

Starts from the Practical 7 snapshot (client + server). All measurements, with how they were taken, are
in **[docs/performance.md](docs/performance.md)**.

## Before → after

```
Before (single bundle):  index.js 360 kB  ← Home, Projects, Tasks, Login, Contact, NotFound, Chart.js
                         all downloaded on the first visit

After (code split):      index.js        181 kB   first visit (Home + shared code)
                         ProjectsPage.js   1 kB   only when /projects is visited
                         Contact.js        3 kB   only when /contact is visited
                         Login.js          3 kB   only when /login is visited
                         Tasks.js         10 kB   only when /tasks is visited
                         TaskInsights.js 165 kB   only when "Show charts" is clicked
                         NotFound.js       1 kB   only for unknown paths
```

First-page JavaScript: **360.31 kB → 180.73 kB** (120.74 → 59.41 kB gzip), −51 %.

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| Lazy loading for route-based components | `client/src/App.tsx` — `lazy(() => import('./pages/…'))` for Projects, Tasks, Login, Contact, NotFound |
| `React.lazy()` + `Suspense` on at least Projects and Contact | same file; one `<Suspense>` around `<Routes>` |
| Meaningful fallback while a chunk loads | `components/PageFallback.tsx` — a page-shaped skeleton; nav and footer stay visible |
| Bundle size and load time measured before and after | `docs/performance.md` (build output + Performance API readings) |
| Before/after comparison documented | `docs/performance.md` |

**Supplementary / post-lab:**

- **Heavy third-party component lazy loaded** — Chart.js charts (`TaskInsights.tsx`) load only when
  *Show charts* is clicked (Tasks chunk 174 kB → 10 kB).
- **Minimum-delay fallback** — `components/Delayed.tsx` hides the fallback for 300 ms, so fast loads never
  flicker.
- **One unnecessary re-render found and fixed** — every `TaskItem` re-rendered on any page state change
  (18 renders to toggle one task, 16 to open the charts). `React.memo` + `useCallback` brought that to 4 and 0.

## Run it on its own

```bash
cd practical-8/server && cp .env.example .env && npm install && npm run dev   # set JWT_SECRET first
cd practical-8/client && npm install
npm run build        # prints the chunk list
npm run preview      # serve the production build; open DevTools → Network, throttle to "Slow 3G"
```

## Key questions

**Initial bundle vs lazy-loaded chunk — when is each downloaded?** The initial bundle is referenced by
`index.html` and downloaded before the app can render anything. A lazy chunk is fetched by a dynamic
`import()` the first time React renders the lazy component — here, the first time its route (or the charts
panel) is opened. After that it is cached and reused.

**Why does lazy loading improve perceived performance if the total code stays the same?** The user only
waits for the code needed for the screen in front of them. The first page becomes interactive after
181 kB instead of 360 kB, and the rest arrives in small pieces when needed — often never (most visitors
never open the charts or the 404 page). The total over a full session is similar, but it is spread out and
mostly hidden behind user actions.

**When is lazy loading not worth it?** For a very small app (Practical 1's whole bundle is 143 kB with
nothing heavy), splitting adds extra requests and a loading state for a saving of a few kilobytes. It is
also a poor fit for components needed immediately on the first screen — lazy loading those only adds a
round trip. It pays off when a route or component is large and not needed by everyone.

## Errors met along the way

- Reloading to take repeated timing samples gave a JS size of **0 KB** on the third reload — the script came
  from the browser cache. Only cold first loads are used in the comparison, and byte counts from the build
  are treated as the reliable figure.
- Opening the charts re-rendered every task row although none had changed — traced to new function
  identities on each render (see the Profiler section).
