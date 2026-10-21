import type { ComponentType } from 'react';

type Loader = () => Promise<{ default: ComponentType }>;

/**
 * Each practical's React app, loaded on demand when /practical-N is opened.
 * The practical's App never renders its own router; the host wraps it in
 * <BrowserRouter basename="/practical-N">, just like its own main.tsx does.
 */
export const registry: Record<number, Loader> = {
  1: () => import('../../practical-1/client/src/App'),
};
