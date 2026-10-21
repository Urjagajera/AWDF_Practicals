import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { mounts } from './mounts';

// Each practical's server is a self-contained Express app (practical-N/server/src/app.ts).
// This process mounts them side by side so the landing app can demo every practical
// with one `npm run dev`. Each one can still run on its own on port 5000.
const app = express();
app.use(cors());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, practicals: mounts.map((m) => m.n) });
});

for (const { n, create } of mounts) {
  app.use(`/api/p${n}`, create());
}

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`Practicals API on http://localhost:${PORT} — mounted: ${mounts.map((m) => `/api/p${m.n}`).join(', ') || 'none yet'}`);
});
