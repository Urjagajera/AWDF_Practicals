import type { Express } from 'express';

export interface Mount {
  n: number;
  create: () => Express;
}

/** One entry per practical that has a backend. */
export const mounts: Mount[] = [];
