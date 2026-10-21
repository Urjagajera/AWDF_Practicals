# Practical 6 — Full Stack Integration: React + Node + MongoDB

**CO1, CO2 / PO3, PO5** · Objective: wire the React frontend to the Node/Express/MongoDB backend into a
fully working full-stack application.

- `server/` — the Practical 5 Task API (Express + Mongoose, database `awdf_p6`) with **CORS** enabled.
- `client/` — the Practical 3 portfolio app. The GitHub fetch is gone; a new **Tasks** route
  (`/tasks`) creates, lists, edits, completes and deletes tasks through the API.

## Flow

```
React (localhost:5173)                Express (localhost:5000)          MongoDB
TaskForm ──POST /tasks──────────────►  cors → json → validate  ───────►  awdf_p6.tasks
         ◄──────── 201 + document ───                          ◄───────
setTasks(prev => [created, …prev])     ← UI state comes from the server's response
```

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| React task UI connected to the Node + MongoDB backend | `client/src/pages/Tasks.tsx`, `client/src/api.ts` |
| GitHub data from Practical 3 replaced with our own task data | `GitHubRepos` / `RepoList` removed; Projects page is static again |
| Create, view, update and delete from the UI | `TaskForm.tsx`, `TaskItem.tsx` (edit, checkbox, delete) |
| Data persists in MongoDB | verified by reloading the page — tasks remain |
| Loading and error states for every API interaction | list (`Spinner` / `ErrorMessage` + retry), form (`Adding…` + message), each row (`Saving…` / `Deleting…` + message) |
| CORS on the backend | `server/src/app.ts` — `app.use(cors())` before the routes |
| One shared base URL | `client/src/api.ts` — `BASE_URL`, used by every request |

**Supplementary / post-lab:**

- **Optimistic create** — the new task appears instantly, marked *Saving…*, and is swapped for the server's
  document when it answers, or removed again if the server rejects it.
- **Confirmation dialog** before deleting (`ConfirmDialog.tsx`, a native `<dialog>`; Esc cancels).
- **Toast notifications** after every create, update and delete, success or failure (`Toast.tsx`).

## Checked in the browser

| Scenario | Result |
|---|---|
| Client on `localhost:5191`, API on `localhost:5000` (different origins) | create succeeds — CORS allows it; `OPTIONS /tasks` preflight answers 204 |
| Create → toggle → edit → reload page | the edited, completed task is still there after reload |
| Empty title | form shows *"Validation failed (title is required)"* from the server |
| Optimistic create | row shows *Saving…* 5 ms after submit, then the real timestamp |
| Delete → Cancel / Delete → Delete | task kept / task removed, toast *Deleted "…"* |
| Backend stopped, then create | optimistic row rolls back; form and toast say *"Cannot reach the server — is the backend running on port 5000?"*; Refresh shows the error with *Try again* |

## Run it on its own (two terminals)

```bash
cd practical-6/server && cp .env.example .env && npm install && npm run dev   # http://localhost:5000
cd practical-6/client && npm install && npm run dev                            # http://localhost:5173/tasks
```

From the repo root, `npm run dev` serves it at http://localhost:5173/practical-6/tasks with the API at `/api/p6`.

## Key questions

**What backend change lets the React dev server call the API?** The browser's same-origin policy blocks
JavaScript on `localhost:5173` from reading responses from `localhost:5000` unless the server says it is
allowed. The `cors` middleware adds `Access-Control-Allow-Origin` (and answers the `OPTIONS` preflight that
browsers send before a JSON `POST`/`PUT`), so it must run before the routes.

**Why update the UI from the server's response instead of assuming success?** The server is the source of
truth: it trims the title, fills `_id`, `createdAt` and default priority, and may reject the write
altogether. Using the returned document keeps the screen identical to what is actually stored; assuming
success shows data that may not exist after a refresh.

**What is the risk of not handling errors on writes?** A failed `POST`/`PUT`/`DELETE` would look like it
worked — the task seems saved or deleted, the user moves on, and the change silently disappears on the next
load. Reads that fail are visible (nothing shows); writes that fail are invisible unless handled, which is
why each form and row reports its own errors here.

## Errors met along the way

- Testing the "backend down" case: the first create after stopping the dev server still succeeded, because
  the server process had not finished shutting down. Repeating the request once port 5000 was free showed
  the expected error.
