/**
 * ESLint configuration.
 *
 * Type-aware linting is deliberately left off. The rules that matter for this
 * plugin — hook dependencies, unused symbols, obvious mistakes in async code —
 * do not need type information, and asking for it would make the gate depend on
 * a build order that `npm run verify` already enforces elsewhere (tsc runs before
 * tests, and the bundle is checked byte for byte).
 *
 * The FSD layering rules are not duplicated here: `steiger` owns them, reads the
 * layer graph directly, and runs as its own step (`npm run lint:fsd`).
 */
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['lib', 'node_modules', 'coverage', '.husky']),

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // The host bundle is a classic script whose wrapper defines `module` and
      // `exports`; that is tsdown's business, not ours to lint.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },

  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
])
