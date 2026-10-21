# Practical 5 — MongoDB Integration and Schema Design with Mongoose

**CO2, CO3 / PO3, PO5** · Objective: connect a MongoDB database to an Express server and enforce data
validation through a Mongoose schema.

Starts from the Practical 4 snapshot. The in-memory array is gone; every route now reads and writes the
`tasks` collection in MongoDB.

## Architecture

```
Express app  ──►  Mongoose (schema + validation)  ──►  MongoDB  awdf_p5.tasks
                                                       { title, description, completed, priority, createdAt }
```

Required fields and defaults are enforced by the schema *before* a document reaches the database.

## Schema — `server/src/models/Task.ts`

| Field | Type | Rule |
|---|---|---|
| `title` | String | required, trimmed |
| `description` | String | default `''` |
| `completed` | Boolean | default `false` |
| `priority` | String | enum `low` / `medium` / `high`, default `medium` |
| `createdAt` | Date | default `Date.now` |

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| Connect MongoDB with Mongoose | `server/src/db.ts` (URI from `MONGO_URI` in `.env`) |
| Task schema with title (required), description, completed (default false), createdAt (default now) | `server/src/models/Task.ts` |
| Replace the in-memory array with model operations | `server/src/controllers/taskController.ts` — `find`, `findById`, `create`, `findByIdAndUpdate`, `findByIdAndDelete` |
| CRUD tested against the live database | results below |
| Validation errors as structured JSON | `server/src/middleware/errorHandler.ts` |

**Supplementary / post-lab:** a `priority` enum (`low` / `medium` / `high`), a hook that trims the title
before validation (on `save` and on `findOneAndUpdate`), and `GET /tasks/:id` returning a JSON 404 for an
unknown id. Ids are also checked with `isValidObjectId` before any query runs.

## Test results (local MongoDB)

```
POST /tasks {"title":"   Survives restart   ","priority":"high"}  → 201  title saved as "Survives restart"
GET  /tasks/:id                                               → 200
POST /tasks {"title":"x","priority":"urgent"}                 → 400  {"error":"Validation failed","fields":{"priority":"priority must be low, medium or high"}}
POST /tasks {"title":"    "}                                  → 400  {"error":"Validation failed","fields":{"title":"title is required"}}
PUT  /tasks/:id {"title":"  trimmed on update  "}             → 200  title "trimmed on update"
PUT  /tasks/abc                                               → 400  invalid ObjectId
GET  /tasks/000000000000000000000000                          → 404
POST /tasks  (body "{bad json")                               → 400  {"error":"Request body is not valid JSON"}
```

Persistence: after the process exited, a **new** process answered `GET /tasks` with the task created in the
previous run.

## Run it on its own

```bash
cd practical-5/server
cp .env.example .env          # MONGO_URI=mongodb://127.0.0.1:27017/awdf_p5
npm install && npm run dev    # http://localhost:5000
cd ../client && npm install && npm run dev   # console on http://localhost:5173
```

## Key questions

**What is a schema for, if MongoDB is schema-less?** MongoDB accepts any document shape in a collection,
which is flexible but means nothing stops a typo'd field or a task without a title. The Mongoose schema is
an application-level contract: it casts types, applies defaults and rejects invalid documents, so every
task in the collection has the same, predictable shape.

**Why define required fields and defaults in the schema, not only in the frontend?** Frontend checks can be
skipped — anyone can send a request with Postman or curl. The server is the last line of defence, and the
schema is the one place every write passes through, whether it comes from the React app, a script or a
future mobile client.

**What happens when a document fails validation?** `Task.create()` (or the update with
`runValidators: true`) rejects with a `ValidationError` before any write is sent to MongoDB. The `catch` in
the controller forwards it with `next(err)`, Express skips the remaining middleware and runs the error
handler, which turns it into `400 {"error":"Validation failed","fields":{…}}`. The database never sees the
invalid document.

## Design note

The lab sheet uses `mongoose.connect()` and `mongoose.model()`. This repo's combined server loads several
practicals into one Node process, and each defines its own `Task` model on its own database. With the
single global connection, the second `mongoose.model('Task', …)` would throw `OverwriteModelError`. Each
practical therefore uses `mongoose.createConnection()` and `db.model('Task', …)` — the same API, scoped to
its own connection.

## Errors met along the way

- A plain `pre('save')` trim hook let a title of `"   "` through: Mongoose validates *before* `save` hooks
  run, so `required` saw a non-empty string. Moving the trim to `pre('validate')` fixed it.
- Update queries skip document hooks entirely, so the trim also needed a `pre('findOneAndUpdate')` hook.
