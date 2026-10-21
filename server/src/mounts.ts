import type { Express } from 'express';
import { createApp as p4 } from '../../practical-4/server/src/app';
import { createApp as p5 } from '../../practical-5/server/src/app';
import { createApp as p6 } from '../../practical-6/server/src/app';
import { createApp as p7 } from '../../practical-7/server/src/app';
import { createApp as p8 } from '../../practical-8/server/src/app';
import { createApp as p9 } from '../../practical-9/server/src/app';
import { createApp as p10 } from '../../practical-10/server/src/app';
import { createApp as p11 } from '../../practical-11/server/src/app';
import { createApp as p13 } from '../../practical-13/server/src/app';

export interface Mount {
  n: number;
  create: () => Express;
}

/** One entry per practical that has a backend. */
export const mounts: Mount[] = [
  { n: 4, create: p4 },
  { n: 5, create: p5 },
  { n: 6, create: p6 },
  { n: 7, create: p7 },
  { n: 8, create: p8 },
  { n: 9, create: p9 },
  { n: 10, create: p10 },
  { n: 11, create: p11 },
  { n: 13, create: p13 },
];
