# Practical 10 — Asynchronous Processing with Event-Driven Architecture

**CO4 / PO3, PO5** · Objective: implement asynchronous background processing with Node.js's built-in
`EventEmitter`, with no external dependencies.

Starts from the Practical 9 API (auth, validation, caching). `client/` is an **event timeline** page that
shows, for each request, when the response arrived and when the background notification ran. Timing
evidence is in **[docs/event-timing.md](docs/event-timing.md)**.

## Flow

```
POST /tasks
   │
   ▼
Task.create()  →  invalidate cache
   │
   ▼
console.log("[API] Response sent at …")  →  res.status(201).json(task)     ← client is answered here
   │
   ▼
taskEvents.emit('task-created', { task, user, respondedAt })
   │   (listener awaits first, so the thread goes back to the event loop)
   ▼
Notification listener  ── ~2 s later ──►  "[Notification] Task "…" created by <user> at <time>"
        └─ throws? ──► taskEvents.emit('error') ──► error listener logs it, server keeps running
```

## Files

| File | Role |
|---|---|
| `server/src/events/events.ts` | the shared `TaskEvents extends EventEmitter` instance, typed events, and an in-memory log of the last 50 notifications |
| `server/src/events/listeners.ts` | `task-created`, `task-deleted` and `error` listeners, registered once at startup from `createApp()` |
| `server/src/controllers/taskController.ts` | `createTask` and `deleteTask` respond, then emit |
| `server/src/routes/events.ts` | `GET /events` — the logged-in user's recent notifications (for the timeline page) |
| `server/scripts/blocking-demo.ts` | experiment: synchronous vs deferred listener |

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| Background notification system with `EventEmitter` | `events/events.ts`, `events/listeners.ts` |
| Creating a task emits `task-created`, handled asynchronously | `createTask` → `taskEvents.emit('task-created', …)` |
| Handler logs task title, timestamp and assigned user without blocking | `[Notification] Task "…" created by <email> at <ISO time>` |
| API response returns before the handler finishes | 201 in 8–42 ms while the handler takes 2 s (docs) |
| Timestamps at the response point and in the handler | `[API] Response sent at …` vs `[Notification] … at … (API responded at …)` |

**Supplementary / post-lab:**

- A second event, **`task-deleted`**, with its own listener and message.
- An **`error` listener** that catches errors thrown inside the `task-created` handler (try it with a title
  containing `[fail]`). Without it, emitting `error` would crash the process.
- A **slow handler** (2 s, `NOTIFY_DELAY_MS`) — the API still responds instantly.

## Run it on its own

```bash
cd practical-10/server && cp .env.example .env && npm install && npm run dev
# create a task in Postman (with a Bearer token from /auth/login) and watch the console order
npx tsx scripts/blocking-demo.ts      # synchronous vs deferred listener
cd ../client && npm install && npm run dev
```

## Key questions

**Why doesn't emitting block the response, when both run in the same process?** Strictly, `emit()` *does*
run listeners synchronously — it is a plain function call. What keeps the response fast is that the route
calls `res.json()` first and the listener immediately `await`s (a timer here; an email or HTTP call in real
life). That hands the single JavaScript thread back to the event loop, which flushes the response to the
socket; the rest of the listener runs later, when its timer fires. The experiment in the docs shows the
difference: a listener that busy-waits 500 ms delays the response to ~505 ms even though `emit` comes after
`res.json`; the same 500 ms as an awaited timer gives 3–5 ms responses.

**What if the notification logic were inside the POST route?** The route would have to finish the
notification before it could respond, so every task creation would take as long as the slowest step —
about 2 s here instead of under 50 ms — and a failure in the notification would turn a successful save into
an error response. Moving it to a listener decouples the user's request from side effects.

**Why is EventEmitter fine here but not for millions of events a day?** Everything lives in one process's
memory: if the server crashes or restarts, pending events are lost; there are no retries, no persistence,
and no way to spread the work across machines or to let another service consume the events. At scale you
need a durable message queue (RabbitMQ, Redis/BullMQ, Kafka) with acknowledgements, retries and multiple
workers. For a single-server lab app, the built-in emitter gives the same decoupling with zero setup.

## Errors met along the way

- I expected emitting *after* `res.json()` to be enough on its own. Measuring it showed otherwise: with
  synchronous work in the listener, the response still waited (~505 ms). All listeners now start with an
  `await` so the response is flushed first.
