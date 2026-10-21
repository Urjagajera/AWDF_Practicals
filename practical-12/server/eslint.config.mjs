import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      // Express error handlers must keep the 4-argument signature even when `next` is unused.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/types.d.ts'],
    // Augmenting Express's Request type requires `declare global { namespace Express … }`.
    rules: { '@typescript-eslint/no-namespace': 'off' },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: { globals: { ...globals.jest } },
  },
);
