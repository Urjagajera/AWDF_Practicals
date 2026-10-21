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
