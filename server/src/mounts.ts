import type { Express } from 'express';
import { createApp as p4 } from '../../practical-4/server/src/app';
import { createApp as p5 } from '../../practical-5/server/src/app';

export interface Mount {
  n: number;
  create: () => Express;
}

/** One entry per practical that has a backend. */
export const mounts: Mount[] = [
  { n: 4, create: p4 },
  { n: 5, create: p5 },
];
