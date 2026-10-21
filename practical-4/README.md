# Practical 4 — Building a RESTful API with Node.js and Express

**CO2 / PO3, PO5** · Objective: design and implement a RESTful backend with complete CRUD endpoints using the
Express middleware pipeline.

A Task Management API in Express 4 + TypeScript, storing tasks in an in-memory array. A small React page
(`client/`) acts as an in-browser Postman: it calls every endpoint and logs each status code and response.

## Pipeline

```
Client (browser page / Postman)
        │
        ▼
 express.json()            parse JSON bodies
        │
 [logger]                  "GET /tasks - 2026-10-21T10:43:37.786Z"
        │
 /tasks router             GET /  · POST /  · PUT /:id  · DELETE /:id
   ├─ validateId           (PUT, DELETE)  400 for ids like "abc"
   ├─ requireJson          (POST, PUT)    415 unless Content-Type is application/json
   └─ taskController       getAllTasks · createTask · updateTask · deleteTask
        │
 [notFound]                404 JSON for any unmatched route
        │
 [errorHandler]            last — 500 JSON, stack trace only in the server log
```

## Endpoints

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/tasks` | 200 list | — |
| POST | `/tasks` | 201 created task | 400 no title · 415 not JSON |
| PUT | `/tasks/:id` | 200 updated task | 400 bad id / empty title · 404 unknown id · 415 not JSON |
| DELETE | `/tasks/:id` | 200 removed task | 400 bad id · 404 unknown id |
| GET | `/boom` | — | 500 (deliberate, to show the error handler) |

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| Node/Express backend for task management | `server/src/app.ts`, `server/src/server.ts` |
| CRUD endpoints over an in-memory array | `server/src/routes/tasks.ts`, `controllers/taskController.ts`, `data/taskStore.ts` |
| Logging middleware (method, URL, timestamp) | `server/src/middleware/logger.ts` |
| Global error handler as the last middleware | `server/src/middleware/errorHandler.ts`, registered last in `app.ts` |
| Correct status codes (200, 201, 404, 500) | controllers + the table above |

**Supplementary / post-lab:** `requireJson` rejects POST/PUT without `Content-Type: application/json` (415),
`validateId` is a route-specific middleware that checks the id before the controller (400), and `notFound`
returns a structured JSON 404 for undefined routes.

## Test results

Run against the real app (log lines from the server, statuses from the responses):

```
GET    /tasks            → 200
POST   /tasks            → 201  {"id":3,"title":"Test Postman",…}
PUT    /tasks/3          → 200  completed: true
POST   /tasks (no title) → 400  {"error":"title is required"}
PUT    /tasks/999        → 404  {"error":"Task 999 not found"}
DELETE /tasks/3          → 200, then again → 404
POST   /tasks text/plain → 415  {"error":"Content-Type must be application/json"}
PUT    /tasks/abc        → 400  {"error":"Invalid task id \"abc\" — expected a positive integer"}
GET    /nope             → 404  {"error":"Route not found","method":"GET","path":"/nope"}
GET    /boom             → 500  {"error":"Something went wrong"}
```

The same results show up in the request log of the browser page.

## Run it on its own

```bash
cd practical-4/server && npm install && npm run dev     # API on http://localhost:5000
cd practical-4/client && npm install && npm run dev     # console on http://localhost:5173
```

The client's Vite dev server forwards `/api/*` to port 5000, because this API has no CORS yet (Practical 6
adds it). From the repo root, `npm run dev` serves it at http://localhost:5173/practical-4 with the API at
`/api/p4`.

## Key questions

**Why must the error handler be defined last?** Express runs middleware in the order it was registered.
When something calls `next(err)`, Express skips ordinary middleware and looks for the next one with four
arguments `(err, req, res, next)` *after* the current point. A handler registered before the routes is
never "after" them, so errors raised in routes would fall through to Express's default HTML error page.

**`app.use()` vs route-specific middleware?** `app.use(fn)` runs for every request that reaches it
(`logger`, `express.json()`). Route-specific middleware is passed in a route definition —
`router.put('/:id', validateId, requireJson, updateTask)` — and runs only for that method and path, so it
can rely on things like `req.params.id` existing.

**Why not send stack traces to the client?** A stack trace exposes file paths, library versions and
internal logic that help an attacker, and it means nothing to a normal user. The handler logs the stack on
the server (`console.error(err.stack)`) and sends a generic message with the right status code.

## Errors met along the way

- Stopping a test server started with `npx tsx … &` from Git Bash: `pkill` doesn't exist there and killing
  the `npx` wrapper left the Node process listening. The API tests now start the app in-process on a free port
  instead, using `createApp()`, which is why `app.ts` exports the app without calling `listen()`.
- In the combined landing app every request first returned 404: the new `.env.development` setting the API
  base URL was not loaded until the Vite dev server restarted.
