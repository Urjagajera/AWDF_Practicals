import TaskBoard from './components/TaskBoard';
import PipelineChecks from './components/PipelineChecks';
import RequestLog from './components/RequestLog';
import { BASE_URL } from './api';

export default function App() {
  return (
    <main className="mx-auto w-[min(1160px,100%-32px)] py-12">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-rust">Practical 05 · Express + MongoDB</p>
      <h1 className="mt-3 font-serif text-[clamp(32px,5vw,52px)] font-medium leading-tight tracking-tight">
        Task Management API
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        CRUD on MongoDB through a validated Mongoose schema, behind a logging middleware and a global error handler. Every call this page
        makes is listed on the right with its status code and response.
      </p>
      <p className="mt-3 font-mono text-[12.5px] text-ink-mute">Base URL: {BASE_URL}</p>

      <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <TaskBoard />
          <PipelineChecks />
        </div>
        <RequestLog />
      </div>
    </main>
  );
}
