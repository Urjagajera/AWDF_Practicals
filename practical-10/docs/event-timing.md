# Practical 10 — timing evidence

## Response first, notification later (real app, `NOTIFY_DELAY_MS=2000`)

Console output while creating two tasks and deleting one:

```
[API] Response sent at 2026-10-21T11:15:41.789Z
POST /tasks → 201 (41.7 ms)                                  ← client got its answer
[API] Response sent at 2026-10-21T11:15:41.801Z
POST /tasks → 201 (8.8 ms)
DELETE /tasks/… → 200 (11.8 ms)
[Notification] Task "Break it [fail]" was deleted by events.urja@example.com at 2026-10-21T11:15:42.329Z
[Notification] Task "Slow notification" created by events.urja@example.com at 2026-10-21T11:15:43.799Z (API responded at 2026-10-21T11:15:41.789Z)
[Notification error] Notification service rejected "Break it [fail]" at 2026-10-21T11:15:43.816Z
```

- The API responded at **41.789** and the notification for that task ran at **43.799** — 2.0 s later.
  The client's request took 41.7 ms, not 2 s.
- The task titled `Break it [fail]` made the listener throw (the demo hook); the error went to the `error`
  listener and was logged. The server kept running and the request had long since succeeded.
- `task-deleted` has its own listener and message.

Without a delay (`NOTIFY_DELAY_MS=0`, first version):

```
[API] Response sent at 2026-10-21T11:14:53.882Z
[Notification] Task "Write viva answers" created by events.urja@example.com at 2026-10-21T11:14:53.883Z (API responded at 2026-10-21T11:14:53.882Z)
```

## Is emit() asynchronous? — `npx tsx scripts/blocking-demo.ts`

Both routes respond and *then* emit; both listeners do 500 ms of work.

```
blocking  listener → response times: 542.5 ms, 505.4 ms, 504.5 ms
deferred  listener → response times: 4.5 ms, 3.0 ms, 3.8 ms
```

`emit()` calls its listeners **synchronously**, right there in the route handler. `res.json()` only
queues the response; Node writes it to the socket when the handler gives the thread back. A listener that
does synchronous work keeps the thread, so the response waits for it — even though `emit` comes after
`res.json`. A listener that awaits (a timer, I/O, a network call) returns the thread immediately, and the
response goes out at once. That is why every listener in `listeners.ts` starts with an `await`.
