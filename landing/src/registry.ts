import type { ComponentType } from 'react';

type Loader = () => Promise<{ default: ComponentType }>;

/**
 * Each practical's React app, loaded on demand when /practical-N is opened.
 * The practical's App never renders its own router; the host wraps it in
 * <BrowserRouter basename="/practical-N">, just like its own main.tsx does.
 */
export const registry: Record<number, Loader> = {
  1: () => import('../../practical-1/client/src/App'),
  2: () => import('../../practical-2/client/src/App'),
  3: () => import('../../practical-3/client/src/App'),
  4: () => import('../../practical-4/client/src/App'),
  5: () => import('../../practical-5/client/src/App'),
  6: () => import('../../practical-6/client/src/App'),
  7: () => import('../../practical-7/client/src/App'),
  8: () => import('../../practical-8/client/src/App'),
  9: () => import('../../practical-9/client/src/App'),
  10: () => import('../../practical-10/client/src/App'),
};
