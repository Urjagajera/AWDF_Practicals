export type Track = 'Frontend' | 'Backend' | 'Full stack' | 'DevOps';

export interface PracticalInfo {
  n: number;
  title: string;
  track: Track;
  co: string;
  summary: string;
  objective: string;
  problem: string[];
  skills: string[];
  /** Parts that exist in practical-N/: client (React), server (Express) or infra-only files. */
  parts: ('client' | 'server' | 'infra')[];
}

export const practicals: PracticalInfo[] = [
  {
    n: 1,
    title: 'Introduction to React and Component Architecture',
    track: 'Frontend',
    co: 'CO1 / PO3, PO5',
    summary: 'A Vite + React student portfolio built from small, reusable components that pass data through props.',
    objective:
      'To set up a React development environment using Vite and build a static UI using independently structured, reusable components.',
    problem: [
      'Create a React application using Vite for a student portfolio page.',
      'Include at least 4 reusable components: Header, About, Skills and Footer.',
      'Each component is independently structured and composed into a single-page layout.',
      'No logic or JSX is duplicated across components.',
      'Props pass at least one piece of data into a minimum of 2 components.',
    ],
    skills: ['Vite project setup', 'Reusable functional components', 'Props for data flow', 'Composing a single-page layout'],
    parts: ['client'],
  },
  {
    n: 2,
    title: 'State Management and Routing in React',
    track: 'Frontend',
    co: 'CO1 / PO3, PO5',
    summary: 'The portfolio grows into a multi-page app with React Router, a controlled contact form and a theme toggle.',
    objective:
      'To implement reactive state management using useState and multi-page navigation using React Router in the existing portfolio application.',
    problem: [
      'Extend the portfolio from Practical 1 by adding React Router.',
      'A navigation bar with at least 3 routes: Home, Projects and Contact.',
      'Each route renders a distinct component without a full page reload.',
      'At least 2 meaningful useState variables: one toggles UI visibility, one manages a form input.',
      'The Contact page has a controlled input that shows user input in real time.',
    ],
    skills: ['React Router v6', 'Navigation without reload', 'useState', 'Controlled form inputs'],
    parts: ['client'],
  },
  {
    n: 3,
    title: 'API Integration and Data Rendering in React',
    track: 'Frontend',
    co: 'CO1 / PO3, PO5',
    summary: 'The Projects page fetches live GitHub repositories with proper loading, error and retry states.',
    objective: 'To consume a REST API in React and handle asynchronous data with loading and error states.',
    problem: [
      'Integrate a public REST API (GitHub) to fetch and display repositories dynamically.',
      'Use the Projects page from Practical 2 as the integration point.',
      'Show a loading spinner component while the request is in progress.',
      'Show an error message component if the API call fails.',
      'Render at least the repository name and URL for each item.',
    ],
    skills: ['fetch / REST APIs', 'useEffect on mount', 'Loading, success and error state', 'Conditional rendering'],
    parts: ['client'],
  },
  {
    n: 4,
    title: 'Building a RESTful API with Node.js and Express',
    track: 'Backend',
    co: 'CO2 / PO3, PO5',
    summary: 'A Task Management API with full CRUD, a logging middleware and a central error handler.',
    objective:
      'To design and implement a RESTful backend server with complete CRUD endpoints using Express middleware pipeline.',
    problem: [
      'Build a Node/Express backend for a Task Management system.',
      'REST endpoints to create, read, update and delete tasks (in-memory array, no database yet).',
      'A request logging middleware that logs method, URL and timestamp.',
      'A global error handling middleware as the last middleware in the pipeline.',
      'Correct HTTP status codes (200, 201, 404, 500) for each response.',
    ],
    skills: ['Express routing', 'Custom middleware', 'Request → response → error pipeline', 'HTTP status codes'],
    parts: ['client', 'server'],
  },
  {
    n: 5,
    title: 'MongoDB Integration and Schema Design with Mongoose',
    track: 'Backend',
    co: 'CO2, CO3 / PO3, PO5',
    summary: 'The Task API moves from an in-memory array to MongoDB with a validated Mongoose schema.',
    objective: 'To connect a MongoDB database to an Express server and enforce data validation through Mongoose schema.',
    problem: [
      'Extend the Task backend from Practical 4 by connecting MongoDB using Mongoose.',
      'A Task schema with title (required), description, completed (default false) and createdAt (default now).',
      'Replace the in-memory array with real Mongoose model operations.',
      'Test all CRUD operations against the live database.',
      'Return validation errors as structured JSON, not raw Mongoose errors.',
    ],
    skills: ['Mongoose connection', 'Schema types, required and defaults', 'Model CRUD methods', 'Structured validation errors'],
    parts: ['client', 'server'],
  },
  {
    n: 6,
    title: 'Full Stack Integration: React + Node + MongoDB',
    track: 'Full stack',
    co: 'CO1, CO2 / PO3, PO5',
    summary: 'A React Task board wired to the Express + MongoDB API with CORS, toasts and confirmed deletes.',
    objective: 'To wire the React frontend to the Node/Express/MongoDB backend into a fully functional full-stack application.',
    problem: [
      'Connect the React Task UI to the Node + MongoDB backend from Practicals 4 and 5.',
      'Replace the GitHub data from Practical 3 with task data from your own backend.',
      'Create, view, update and delete tasks from the React interface through API calls.',
      'All data persists in MongoDB — it survives a browser refresh.',
      'Loading and error states for every API interaction, not just the first fetch.',
    ],
    skills: ['CORS', 'Calling CRUD endpoints from React', 'Syncing UI state with server state', 'Per-action loading and errors'],
    parts: ['client', 'server'],
  },
  {
    n: 7,
    title: 'Authentication and Middleware Pipeline',
    track: 'Backend',
    co: 'CO2, CO6 / PO3, PO5',
    summary: 'Register and log in with bcrypt + JWT; every task route sits behind auth and validation middleware.',
    objective: 'To implement JWT-based authentication and input validation as part of the Express middleware pipeline.',
    problem: [
      'Add user registration and login to the Task Management application.',
      'Hash passwords with bcrypt before saving the User document.',
      'Issue a JWT on successful login with a 1 hour expiry.',
      'Protect all task routes with an authentication middleware that verifies the JWT.',
      'Server-side validation rejects malformed requests before they reach the database.',
    ],
    skills: ['bcrypt hashing', 'JWT sign / verify', 'Auth middleware', 'Server-side validation'],
    parts: ['client', 'server'],
  },
  {
    n: 8,
    title: 'Performance Optimization and Lazy Loading in React',
    track: 'Frontend',
    co: 'CO1 / PO3, PO5',
    summary: 'Route-level code splitting with React.lazy and Suspense, measured before and after.',
    objective: 'To improve frontend performance using lazy loading and code splitting techniques.',
    problem: [
      'Lazy load route-based components of the Task Management frontend.',
      'Apply React.lazy() and Suspense to at least the Projects and Contact routes.',
      'Provide a meaningful fallback UI while a chunk loads.',
      'Measure bundle size and load time before and after optimization.',
      'Document the before/after comparison.',
    ],
    skills: ['React.lazy + Suspense', 'Reading the Network tab', 'Bundle size from build output', 'Before / after reporting'],
    parts: ['client', 'server'],
  },
  {
    n: 9,
    title: 'In-Memory Caching and Query Optimization',
    track: 'Backend',
    co: 'CO2, CO4 / PO3, PO5',
    summary: 'node-cache in front of GET /tasks, invalidated on every write, with measured response times.',
    objective: 'To implement server-side caching and measure its impact on API response time.',
    problem: [
      'Add in-memory caching to the Task backend using node-cache.',
      'Cache GET /tasks with a reasonable TTL (60 seconds).',
      'Invalidate the cache on every POST, PUT and DELETE.',
      'Compare API response times with and without caching.',
      'Document at least 3 readings for each case.',
    ],
    skills: ['node-cache', 'Cache invalidation', 'Measuring response times', 'Caching trade-offs'],
    parts: ['client', 'server'],
  },
  {
    n: 10,
    title: 'Asynchronous Processing with Event-Driven Architecture',
    track: 'Backend',
    co: 'CO4 / PO3, PO5',
    summary: 'A task-created event handled by an EventEmitter listener after the API has already responded.',
    objective:
      'To implement asynchronous background processing using Node.js native EventEmitter without external dependencies.',
    problem: [
      'Add a background notification system using Node.js EventEmitter.',
      'Creating a task emits a task-created event handled asynchronously.',
      'The handler logs task title, timestamp and assigned user without blocking the response.',
      'The API response returns before the handler finishes.',
      'Timestamps at the response and in the handler prove the ordering.',
    ],
    skills: ['EventEmitter', 'Non-blocking background work', 'The event loop in practice', 'Timestamp evidence'],
    parts: ['client', 'server'],
  },
  {
    n: 11,
    title: 'Containerization with Docker and Docker Compose',
    track: 'DevOps',
    co: 'CO5 / PO3, PO5',
    summary: 'Frontend, backend and MongoDB in three containers, started with one docker-compose up.',
    objective: 'To containerize the full-stack application using Docker and orchestrate services using Docker Compose.',
    problem: [
      'A Dockerfile for the React frontend.',
      'A Dockerfile for the Node/Express backend.',
      'docker-compose.yml orchestrating frontend, backend and MongoDB.',
      'Port mappings and an internal Docker network so services can talk.',
      'The whole app starts with a single docker-compose up.',
    ],
    skills: ['Dockerfiles', 'Docker Compose', 'Container networking', 'One-command stack'],
    parts: ['client', 'server', 'infra'],
  },
  {
    n: 12,
    title: 'CI/CD Pipeline with GitHub Actions',
    track: 'DevOps',
    co: 'CO5 / PO3, PO5',
    summary: 'Jest + Supertest tests run by a GitHub Actions workflow on every push to main.',
    objective: 'To automate testing and deployment of the application using a CI/CD pipeline.',
    problem: [
      'A GitHub Actions workflow that runs on every push to main.',
      'The pipeline installs dependencies as a defined step.',
      'At least one automated test with a clear pass / fail status.',
      'Show a failed pipeline caused by a deliberately broken test.',
      'Show the pipeline passing again after the fix.',
    ],
    skills: ['Workflow YAML', 'Triggers, jobs and steps', 'Automated API tests', 'Reading CI logs'],
    parts: ['server', 'infra'],
  },
  {
    n: 13,
    title: 'AI API Integration into a Web Application',
    track: 'Full stack',
    co: 'CO6 / PO3, PO5, PO12',
    summary: 'Gemini suggests a task description from its title — called only from the backend, with graceful fallback.',
    objective: 'To integrate an external AI service into the existing application and understand responsible AI usage.',
    problem: [
      'Add an AI-powered feature to the Task app using the Gemini API.',
      'It serves a real purpose: generating a task description from the title.',
      'The API key lives only on the backend (.env), never in the frontend.',
      'If the AI call fails or times out, the app keeps working normally.',
      'Show the AI response meaningfully in the UI, not as raw JSON.',
    ],
    skills: ['Server-side AI calls', 'Graceful degradation', 'Presenting AI output', 'Responsible AI'],
    parts: ['client', 'server'],
  },
];

export const tracks: Track[] = ['Frontend', 'Backend', 'Full stack', 'DevOps'];

export const pad = (n: number) => String(n).padStart(2, '0');
