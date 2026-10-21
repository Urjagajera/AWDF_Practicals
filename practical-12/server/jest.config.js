/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // Test-only environment (separate database, fixed secret) — loaded before any app code.
  setupFiles: ['<rootDir>/tests/env.ts'],
  transform: {
    // ts-jest compiles TypeScript on the fly; type-checking is left to `npm run typecheck`.
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true }],
  },
};
