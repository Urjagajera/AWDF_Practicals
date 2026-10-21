# Practical 9 — In-Memory Caching and Query Optimization

**CO2, CO4 / PO3, PO5** · Objective: implement server-side caching and measure its impact on API response time.

Starts from the Practical 7 API (auth + validation). `client/` is a small **cache lab** page for running the
measurements in the browser. All readings are in **[docs/response-times.md](docs/response-times.md)**.

## Flow

```
GET /tasks
   │
   ▼
cache.get("all_tasks:<userId>")
   ├─ HIT  → return cached list immediately            X-Cache: HIT
   └─ MISS → Task.find(...).lean() → cache.set(key) → return list   X-Cache: MISS

POST / PUT / DELETE /tasks
   │
   ▼
write to MongoDB → cache.del("all_tasks:<userId>")  (+ "task:<userId>:<id>")
```

The key includes the user id because since Practical 7 each user only sees their own tasks — a single
`all_tasks` key would serve one user's list to another.

## Results (2,000 tasks, 654 KB response)

| | Uncached (6 readings) | Cached hits (4 readings) |
|---|---|---|
| Range | 56.8 – 116.6 ms | 11.8 – 16.6 ms |
| Mean | 82.7 ms | **14.7 ms** (≈ 5–6× faster) |

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| In-memory caching with node-cache | `server/src/cache.ts` |
| Cache `GET /tasks` with a reasonable TTL (60 s) | `cached('list', …)` in `controllers/taskController.ts`; `CACHE_TTL` env, default 60 |
| Invalidate on every POST, PUT, DELETE | `invalidateTasks()` after each successful write |
| Compare response times with and without caching | `npm run benchmark` (`server/scripts/benchmark.ts`) and the cache lab page |
| At least 3 readings for each case | `docs/response-times.md` — 6 uncached, 6 cached-run readings, plus browser runs |

**Supplementary / post-lab:**

- `GET /tasks/:id` is cached under its own key (`task:<userId>:<id>`) and invalidated on PUT/DELETE of that task.
- `GET /debug/cache` returns hits, misses and hit rate per route, the number of keys and the TTL.
  `PUT /debug/cache {"enabled": false}` switches caching off for a fair uncached measurement (instead of
  commenting code out); `DELETE /debug/cache` clears it.
- TTL experiments with 60 s and 2 s are in the docs.
- `X-Cache: HIT | MISS` on every cached response (exposed through CORS so the browser can read it).

## Run it on its own

```bash
cd practical-9/server
cp .env.example .env && npm install
npm run benchmark                  # seeds 2,000 tasks for a benchmark user, prints 3 readings
npm run dev                        # API on :5000
cd ../client && npm install && npm run dev
```

## Key questions

**Why invalidate on every write, and what if we didn't?** The cache holds a copy of the list as it was when
it was stored. Without invalidation, a task created, edited or deleted after that would not appear in
`GET /tasks` until the TTL ran out — up to 60 s of the UI showing deleted tasks or missing new ones, and a
user who just saved something would think it failed. Deleting the key after each write means the next read
always rebuilds the list from the database.

**What is a reasonable TTL here, and what trade-off does it represent?** With invalidation on every write,
the TTL is mainly a safety net (for changes made outside this API) and a memory limit, so 60 s is
reasonable for a task list. Longer TTLs give more hits but risk staler data if something bypasses the
invalidation; shorter TTLs keep data fresher but hit the cache less — the experiment with a 2 s TTL and
requests 2.5 s apart got no hits at all.

**Why is node-cache unsuitable for several server instances?** It lives in one Node process's memory. With
two instances behind a load balancer, a write handled by instance A clears only A's cache; instance B keeps
serving its stale copy. Each instance also builds its own copy (more database load and memory), and
everything is lost on restart. A shared cache such as Redis solves this, because every instance reads and
invalidates the same store.

## Errors met along the way

- The lab sheet's single `all_tasks` key would have mixed users' lists once Practical 7 made tasks
  per-user; the key includes the user id for that reason. For the same kind of reason "not found" results
  for `GET /tasks/:id` are never cached, so a lookup can't hide a task for the length of the TTL.
- With only a handful of tasks, cached and uncached times were both 3–8 ms and the comparison showed
  nothing. Seeding 2,000 tasks (as the troubleshooting guide suggests) made the database read measurable.
