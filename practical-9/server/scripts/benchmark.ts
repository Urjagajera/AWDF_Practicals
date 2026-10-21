/**
 * Measures GET /tasks response times against the real app and database.
 *
 *   npx tsx scripts/benchmark.ts [runs=3] [tasks=2000]
 *
 * Starts the app in-process on a free port, logs in a benchmark user (creating it and seeding
 * `tasks` documents on first use), then sends GET /tasks `runs` times in a row and prints each
 * response time and the X-Cache header (present once caching exists).
 */
import 'dotenv/config';
import type { AddressInfo } from 'node:net';
import { createApp, closeDb } from '../src/app';
import { Task } from '../src/models/Task';

process.env.JWT_SECRET ??= 'benchmark-secret';
const runs = Number(process.argv[2] ?? 3);
const seedTo = Number(process.argv[3] ?? 2000);
const EMAIL = 'benchmark@example.com';
const PASSWORD = 'benchmark-password';

async function main() {
  const server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (path: string, body: unknown, token?: string) =>
    fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: JSON.stringify(body),
    });

  await post('/auth/register', { email: EMAIL, password: PASSWORD }); // 409 after the first run — fine
  const { token, user } = await (await post('/auth/login', { email: EMAIL, password: PASSWORD })).json();

  const have = await Task.countDocuments({ owner: user._id });
  if (have < seedTo) {
    const docs = Array.from({ length: seedTo - have }, (_, i) => ({
      owner: user._id,
      title: `Benchmark task ${have + i + 1}`,
      description: 'Seeded to make the database read measurable. '.repeat(3),
      priority: (['low', 'medium', 'high'] as const)[i % 3],
    }));
    await Task.insertMany(docs);
  }
  const count = await Task.countDocuments({ owner: user._id });

  console.log(`GET /tasks × ${runs}  (${count} tasks for ${EMAIL})`);
  for (let i = 1; i <= runs; i++) {
    const t0 = performance.now();
    const res = await fetch(`${base}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await res.arrayBuffer();
    const ms = performance.now() - t0;
    const cache = res.headers.get('x-cache') ?? '—';
    console.log(`  #${i}  ${res.status}  ${ms.toFixed(1).padStart(7)} ms  ${(body.byteLength / 1024).toFixed(0)} KB  X-Cache: ${cache}`);
  }

  server.close();
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
