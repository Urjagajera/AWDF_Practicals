# Practical 7 — Authentication and Middleware Pipeline

**CO2, CO6 / PO3, PO5** · Objective: implement JWT-based authentication and input validation as part of the
Express middleware pipeline.

Starts from the Practical 6 snapshot (server + client).

## Flows

```
POST /auth/register  → validate → bcrypt.hash(password, 10) → save User → 201 { user }   (no hash in the response)
POST /auth/login     → validate → bcrypt.compare → jwt.sign({ id, email }, JWT_SECRET, 1h) → 200 { token }

Protected route:
Client  Authorization: Bearer <token>
   │
   ▼
[auth]        jwt.verify in try/catch → req.user = { id, email }      401 if missing / expired / invalid
   │
   ▼
[validate]    keep only known fields, check types and lengths         400 { fields: { … } }
   │
   ▼
taskController   every query filtered by owner = req.user.id
```

## Endpoints

| Method | Path | Auth | Result |
|---|---|---|---|
| POST | `/auth/register` | — | 201 user · 400 invalid email / password < 8 chars · 409 email taken |
| POST | `/auth/login` | — | 200 `{ token, expiresIn: "1h", user }` · 401 wrong email or password |
| GET | `/auth/me` | Bearer | 200 current user |
| GET, POST | `/tasks` | Bearer | the user's own tasks only |
| GET, PUT, DELETE | `/tasks/:id` | Bearer | 404 for tasks owned by someone else |

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| Registration and login | `server/src/routes/auth.ts`, `controllers/authController.ts` |
| Passwords hashed with bcrypt before saving | `authController.register` — stored as a 60-char `$2a$10$…` hash |
| JWT on successful login, 1 hour expiry | `authController.login`, `config.ts` (`TOKEN_EXPIRY = '1h'`) |
| All task routes protected by JWT middleware | `middleware/auth.ts`, `router.use(auth)` in `routes/tasks.ts` |
| Server-side validation before the database | `middleware/validate.ts` (`registerRules`, `loginRules`, `createTaskRules`, `updateTaskRules`) |
| `JWT_SECRET` from `.env`, never in code | `config.ts` throws a clear error if it is missing; `.env` is git-ignored |

**Supplementary / post-lab:**

- `GET /auth/me` returns the logged-in user from the decoded token; the client uses it to restore the session
  on reload.
- **401 handling on the frontend** — any request that carried a token and gets a 401 clears the token and
  redirects to `/login` with the reason (e.g. *"Token expired — log in again"*), then returns to the page.
- **Logout** removes the token from the client.

Also added: each task has an `owner`, so users only ever see and change their own tasks, and the validator
drops unknown fields — a client cannot set `owner` itself or slip in Mongo operators like `{"$gt": ""}`.

## Test results

```
GET  /tasks  (no header)                     → 401 Missing token — send the header Authorization: Bearer <token>
GET  /tasks  (expired token)                 → 401 Token expired — log in again
GET  /tasks  (Bearer abc.def.ghi)            → 401 Invalid token
POST /auth/register {"email":"not-an-email","password":"short"}
                                             → 400 {"fields":{"email":"email is not valid","password":"password must be at least 8 characters"}}
POST /auth/register (same email twice)       → 409
POST /auth/login {"email":{"$gt":""},…}      → 400 {"fields":{"email":"email must be a string"}}
POST /auth/login (wrong password)            → 401 Invalid email or password
POST /auth/login (correct)                   → 200 { token, … }
GET  /auth/me                                → 200 { user }   (no password field)
POST /tasks {"description":"no title"}       → 400 title is required
POST /tasks {"title":"  Protected task ","owner":"000…","isAdmin":true}
                                             → 201  title trimmed; owner = the logged-in user; isAdmin dropped
PUT  /tasks/:id {}                           → 400 Send at least one of: title, description, completed, priority
PUT  /tasks/:id {"completed":"yes"}          → 400 completed must be a boolean
```

In the browser: visiting `/tasks` logged out redirects to `/login`; registering logs in and returns to
`/tasks`; a second account does not see the first account's tasks; editing the stored token by hand makes
the next request return 401 and the app sends you to log in with *"Invalid token"*; reloading keeps you
logged in (via `/auth/me`); Log out clears the token.

## Run it on its own

```bash
cd practical-7/server
cp .env.example .env     # set JWT_SECRET to a long random string
npm install && npm run dev
cd ../client && npm install && npm run dev
```

Testing in Postman: register → login → copy `token` → on the task requests add the header
`Authorization: Bearer <token>` (with the space after `Bearer`).

## Key questions

**Why hash passwords even in a demo project?** A database leak, a shared lab machine or a committed backup
would expose every password in plain text, and people reuse passwords across sites. bcrypt is one-way, salts
each password automatically (so equal passwords get different hashes) and is deliberately slow, which makes
guessing passwords from stolen hashes expensive. Fast hashes like plain SHA-256 can be brute-forced at
billions per second.

**What does the auth middleware verify, and what if the token is missing or expired?** `jwt.verify` checks
that the signature was made with our `JWT_SECRET` (so the payload hasn't been altered) and that `exp` is in
the future. If the header is missing, the signature doesn't match, or the token has expired, it responds
401 with the reason and the controller never runs. `verify` throws on failure, so it sits in try/catch — an
uncaught throw would otherwise turn a bad token into a 500.

**Why validate on the server when the frontend already does?** The frontend is only a convenience: requests
can be sent with Postman, curl or a modified page, skipping all of its checks. The server is the only place
that sees every request, so it must enforce the rules. Here it also sanitises — dropping unknown fields like
`owner` and rejecting objects where strings are expected.

**Token storage note:** the client keeps the JWT in `localStorage`, which is simple and works across
reloads, but is readable by any script on the page (an XSS risk). Production apps often prefer an
`httpOnly` cookie; for this lab the short 1 hour expiry limits the damage.

## Errors met along the way

- The first test run stopped after one request: my test script sent a `null` body on `GET` requests that
  only had headers, and `fetch` refuses a body on `GET`. Treating `null` as "no body" fixed it.
- In the combined app the API server had been started before `server/.env` existed, so `JWT_SECRET` was
  undefined until the server was restarted — exactly the *"JWT_SECRET is undefined"* case from the
  troubleshooting guide. `config.ts` now fails with a clear message instead of signing with `undefined`.
