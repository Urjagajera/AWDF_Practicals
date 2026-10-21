# AWDF Practicals — ITUE301

Advanced Web Development Frameworks, B.Tech CSE Semester 5, CSPIT, CHARUSAT.
**Urja Gajera · 24CS021**

Thirteen practicals that grow one Task Management application: from a first React component to a
containerised, CI-tested, AI-assisted full-stack app.

## Layout

```
practical-1/ … practical-13/   one folder per practical, each a self-contained snapshot
  client/                      React 18 + TypeScript + Tailwind (Vite)
  server/                      Express 4 + TypeScript (+ MongoDB from Practical 5)
landing/                       landing page; also hosts every practical's client at /practical-N
server/                        mounts every practical's server under /api/pN
shared/                        Tailwind preset and colour theme used by all clients
```

Every practical folder has its own README with what was built, how to run it on its own, the answers
to the key questions, and the errors met along the way.

## Run everything

Requirements: Node.js 18+, MongoDB running locally on `mongodb://127.0.0.1:27017`.

```bash
npm install
cp server/.env.example server/.env   # then fill in JWT_SECRET (and GEMINI_API_KEY for Practical 13)
npm run dev
```

- Landing page: http://localhost:5173
- A practical: http://localhost:5173/practical-4
- API: http://localhost:4000/api/p4/tasks

Each practical can also be run on its own exactly as its lab sheet describes — see its README.

## Practicals

| # | Practical | Track |
|---|-----------|-------|
| 1 | Introduction to React and Component Architecture | Frontend |
| 2 | State Management and Routing in React | Frontend |
| 3 | API Integration and Data Rendering in React | Frontend |
| 4 | Building a RESTful API with Node.js and Express | Backend |
| 5 | MongoDB Integration and Schema Design with Mongoose | Backend |
| 6 | Full Stack Integration: React + Node + MongoDB | Full stack |
| 7 | Authentication and Middleware Pipeline | Backend |
| 8 | Performance Optimization and Lazy Loading in React | Frontend |
| 9 | In-Memory Caching and Query Optimization | Backend |
| 10 | Asynchronous Processing with Event-Driven Architecture | Backend |
| 11 | Containerization with Docker and Docker Compose | DevOps |
| 12 | CI/CD Pipeline with GitHub Actions | DevOps |
| 13 | AI API Integration into a Web Application | Full stack |
