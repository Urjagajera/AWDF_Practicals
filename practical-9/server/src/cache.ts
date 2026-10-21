import NodeCache from 'node-cache';

/**
 * One in-memory cache for this process. Entries expire after CACHE_TTL seconds (default 60).
 * useClones: false — cached values are plain objects from .lean() that are never mutated, so
 * deep-copying 2,000 tasks on every get/set would only waste time.
 */
export const cache = new NodeCache({
  stdTTL: Number(process.env.CACHE_TTL ?? 60),
  checkperiod: 120,
  useClones: false,
});

// Stable keys. Tasks belong to a user (Practical 7), so each user's list is cached separately.
export const keys = {
  allTasks: (userId: string) => `all_tasks:${userId}`,
};
