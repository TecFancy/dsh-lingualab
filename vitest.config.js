/**
 * Vitest configuration: only which files are tests.
 *
 * `.claude` holds the generated skill mirror and agent worktrees, which are whole
 * copies of this repo. Without this, `npm test` in the main checkout also runs every
 * worktree's tests, each against its own older code, which made a release's verify
 * take six minutes and fail on a worktree's test. ESLint skips it for the same reason.
 */
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
})
