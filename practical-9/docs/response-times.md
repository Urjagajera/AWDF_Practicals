# Practical 9 — response times, cached vs uncached

Measured with `npm run benchmark` (`server/scripts/benchmark.ts`): the real Express app and the local
MongoDB, one logged-in user with **2,000 tasks** (a 654 KB JSON response), `GET /tasks` sent three times in
a row. Times are measured by the client from sending the request to receiving the full body.

## Without caching (recorded before the cache was added)

| Run | #1 | #2 | #3 |
|---|---|---|---|
| A | 96.1 ms | 83.1 ms | 56.8 ms |
| B | 116.6 ms | 78.4 ms | 65.2 ms |

Every request runs `Task.find({ owner }).sort({ createdAt: -1 })` and serialises 2,000 documents. The first
request of each run is the slowest (cold connection and MongoDB working set); later ones settle at 57–83 ms.

## With caching (`node-cache`, TTL 60 s)

| Run | #1 | #2 | #3 |
|---|---|---|---|
| A | 60.2 ms · MISS | 16.6 ms · HIT | 14.2 ms · HIT |
| B | 68.9 ms · MISS | 16.2 ms · HIT | 11.8 ms · HIT |

The first request is a miss (the same database query as before, plus storing the result); the next two
come straight from memory. The `X-Cache` response header shows which happened.

## Summary

| | Uncached (6 readings) | Cached hits (4 readings) |
|---|---|---|
| Range | 56.8 – 116.6 ms | 11.8 – 16.6 ms |
| Mean | 82.7 ms | 14.7 ms |

Cache hits were about **5–6× faster**. What remains (~12–17 ms) is mostly the auth middleware and
serialising and sending 654 KB of JSON, which the cache does not avoid.

## Invalidation check

```
GET  /tasks               → []                         (miss, cached)
POST /tasks {"title":"A"} → 201                        (cache for this user dropped)
GET  /tasks               → [ A ]                      (miss — fresh data)
GET  /tasks               → [ A ]                      (hit)
PUT  /tasks/:id {"title":"A renamed"} → 200            (cache dropped)
GET  /tasks               → [ "A renamed" ]            (miss — never the stale "A")
```

## TTL experiments (`CACHE_TTL=… npm run benchmark -- 3 2000 <gapMs>`)

| TTL | Gap between requests | #1 | #2 | #3 |
|---|---|---|---|---|
| 60 s | 2.5 s | 65.7 ms MISS | 24.9 ms HIT | 25.3 ms HIT |
| 2 s | 2.5 s | 57.6 ms MISS | 63.2 ms MISS | 67.7 ms MISS |
| 2 s | 1 s | 57.6 ms MISS | 13.3 ms HIT | 63.3 ms MISS |

A short TTL keeps data fresh even without invalidation, but the cache is rarely hit: with TTL 2 s and
requests 2.5 s apart it never helps. A long TTL gives the most hits, and is safe here only because every
write invalidates the entry; without invalidation it would mean up to 60 s of stale data.

## In the browser (cache lab page, through the combined app's proxy, 1,000 tasks)

| Mode | #1 | #2 | #3 |
|---|---|---|---|
| Cache on | 89.9 ms MISS | 24.9 ms HIT | 28.8 ms HIT |
| Cache off | 61.7 ms MISS | 55.4 ms MISS | 42.5 ms MISS |

"Write, then read": `POST /tasks → 201`, then `GET /tasks → X-Cache: MISS` with the new task in the list.
