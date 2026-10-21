# Practical 11 — Containerization with Docker and Docker Compose

**CO5 / PO3, PO5** · Objective: containerise the full-stack application and orchestrate its services with
Docker Compose.

The stack is the latest full app: the Practical 10 API (auth, validation, caching, events) and the
Practical 8 React client (lazy-loaded routes). Both folders are self-contained build contexts — the theme
files are copied into `client/theme/`, and neither `tsconfig.json` extends anything outside its folder.

## Architecture

```
docker-compose.yml
├── frontend   React build served by nginx        host :5173 → container :5173
├── backend    Node/Express (compiled to JS)      host :5000 → container :5000
└── mongodb    official mongo:7 image             host :27018 → container :27017, volume mongo-data

network: app-network (bridge)      frontend → backend → mongodb
start everything: docker-compose up --build
```

The browser loads the frontend from `localhost:5173` and calls the API at `localhost:5000` (published
port). Inside the network the backend reaches the database as **`mongodb://mongodb:27017/taskdb`** — the
service name, resolved by Docker's DNS.

## Run it

```bash
cd practical-11
docker-compose up --build          # or: docker compose up --build
# http://localhost:5173  — register, log in, create tasks
docker ps                          # three containers: frontend, backend, mongodb
docker-compose down                # stop (data stays in the mongo-data volume)
```

If a host port is already taken (on this machine 5173 is used by another project and 27017 by a local
MongoDB), override it without editing files: `FRONTEND_PORT=5193 docker-compose up --build`.
Set `JWT_SECRET` in the environment (or a `practical-11/.env` file, git-ignored) for anything beyond a demo.

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| Dockerfile for the React frontend | `client/Dockerfile` |
| Dockerfile for the Express backend | `server/Dockerfile` |
| `docker-compose.yml` for frontend, backend and MongoDB | `docker-compose.yml` |
| Port mappings + internal network | `ports:` per service, `app-network` bridge |
| Whole app starts with one `docker-compose up` | verified — no manual steps |

**Supplementary / post-lab:**

- **`.dockerignore`** in both folders excludes `node_modules`, `dist`, `.env`.
- **Multi-stage builds** for both images (the lab sheet asks for the frontend; the backend got the same
  treatment): a Node stage builds, the final stage keeps only what runs.
- **Named volume `mongo-data`** so task data survives container restarts and re-creation.

## Results

| Image | Single stage (lab sheet Dockerfiles) | Multi-stage | |
|---|---|---|---|
| frontend | 1.94 GB (`node:18` + node_modules + source, `vite preview`) | **74.2 MB** (`nginx:alpine` + `dist/`) | −96 % |
| backend | 1.73 GB (`node:18` + dev dependencies) | **281 MB** (`node:18-alpine`, prod deps + `dist/`) | −84 % |

Checks run against the containers:

```
docker ps  → practical-11-frontend-1  Up   0.0.0.0:5193->5173/tcp
             practical-11-backend-1   Up   0.0.0.0:5000->5000/tcp
             practical-11-mongodb-1   Up   0.0.0.0:27018->27017/tcp
backend log: "Server running on port 5000" / "MongoDB connected (taskdb)"
GET  localhost:5000/      → {"name":"Task Management API","practical":11}
GET  localhost:5193/tasks → 200 (nginx serves index.html; React Router handles the route)
Browser: register → log in → create "Runs inside Docker" → listed
```

Persistence:

| | `docker-compose down` then `up` |
|---|---|
| Without a volume | the account was gone — login answered *"Invalid email or password"* |
| With `mongo-data` | the task *"Survives docker compose down"* was still there |

## Key questions

**Why `mongodb` and not `localhost` in the backend's connection string?** Each container has its own
network namespace, so `localhost` inside the backend container is the backend container itself — nothing
listens on 27017 there. Compose puts the services on one network and registers each service name in Docker's
internal DNS, so `mongodb` resolves to the database container's address.

**`EXPOSE` vs `ports:`?** `EXPOSE 5000` in a Dockerfile is documentation: it records which port the app
listens on and publishes nothing. `ports: "5000:5000"` in Compose actually maps a host port to a container
port so something outside Docker (your browser) can connect. Containers on the same network can reach each
other's ports without either.

**Why not copy `node_modules` into the image?** Packages installed on Windows can contain platform-specific
binaries that don't run on the Linux image, and the folder is huge, which makes every build slow (it is all
sent as build context) and bloats the image. Running `npm install` inside the Dockerfile builds the
dependencies for the image's own OS and Node version, and caches them in a layer that only rebuilds when
`package.json` changes. `.dockerignore` keeps the local folder out of the context entirely.

## Errors met along the way

- Docker Desktop's engine was not running at first (`failed to connect to the docker API at
  npipe:////./pipe/dockerDesktopLinuxEngine`); it had to be started before anything could build.
- Host ports 5173 and 27017 were already in use on this machine (another dev server and the local MongoDB
  service). The compose file publishes MongoDB on 27018 by default and lets every host port be overridden.
- The first images could not be built from inside the repo layout as-is: the client imported
  `../../shared/theme.css` and both `tsconfig.json` files extended `../../tsconfig.base.json`, all outside the
  build context. Copying the theme into the folder and inlining the TypeScript options fixed it.
- Without a volume, `docker-compose down` threw away every user and task — see Persistence above.
