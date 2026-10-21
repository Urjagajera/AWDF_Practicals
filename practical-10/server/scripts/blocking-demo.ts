/**
 * Shows that emit() itself is synchronous, and what that means for the response time.
 *
 *   npx tsx scripts/blocking-demo.ts
 *
 * Two routes respond, then emit an event. Both listeners "work" for 500 ms:
 *   /blocking → a synchronous busy loop (holds the single JavaScript thread)
 *   /deferred → an awaited timer (gives the thread back to the event loop)
 * Each route is called three times and timed from the client.
 */
import { EventEmitter } from 'node:events';
import type { AddressInfo } from 'node:net';
import express from 'express';

const WORK_MS = 500;
const bus = new EventEmitter();

bus.on('blocking', () => {
  const end = Date.now() + WORK_MS;
  while (Date.now() < end) {
    /* busy: nothing else in this process can run */
  }
});

bus.on('deferred', async () => {
  await new Promise((resolve) => setTimeout(resolve, WORK_MS));
});

const app = express();
app.post('/:kind', (req, res) => {
  res.status(201).json({ ok: true });
  bus.emit(req.params.kind);
});

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  for (const kind of ['blocking', 'deferred']) {
    const times: string[] = [];
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now();
      await fetch(`${base}/${kind}`, { method: 'POST' }).then((r) => r.text());
      times.push(`${(performance.now() - t0).toFixed(1)} ms`);
      await new Promise((r) => setTimeout(r, WORK_MS + 50)); // let the previous listener finish
    }
    console.log(`${kind.padEnd(9)} listener → response times: ${times.join(', ')}`);
  }
  server.close();
});
