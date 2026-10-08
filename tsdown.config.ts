/**
 * Build configuration for dsh-lingualab.
 *
 * Two halves, one output directory:
 *
 *   · `src/index.ts`         → `lib/index.js`   — the host half (ESM, resolved
 *     by the Loader through the package's `main`).
 *   · `src/client/index.tsx` → `lib/client.js`  — the browser bundle, fetched by
 *     the shell from `/plugins/dsh-lingualab/client.js`. JSX is compiled with
 *     the automatic runtime, so `react/jsx-runtime` stays a module-table request
 *     the bundle asks for through `require`. Types are erased here; `npm run
 *     typecheck` is what checks them.
 *
 * The browser artifact is not an ES module. It is a classic script that calls
 * `window.__ModuleLoader__.load({ id, factory })`, and the module table answers
 * the factory's `require` calls. `format: 'cjs'` plus the `banner`, `intro` and
 * `footer` below produce exactly that closure shape; the platform's own plugins
 * are built the same way by `packages/client/tsdown.client.ts`, which this file
 * mirrors for a repository that has no access to that monorepo preset.
 *
 * Everything the module table can answer stays a `require`; everything else is
 * inlined. A `require` the table cannot answer is a guaranteed runtime throw, so
 * the two lists must agree with the shell's seed table and this package's
 * `dsh.client.external`.
 */
import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsdown'

/** Plugin id: the module-table registration id, and the `/plugins/<id>/` route. */
const ID = 'dsh-lingualab'

/**
 * Specifiers the shell seeds into the frozen module table every dynamic bundle
 * resolves against, copied from `packages/client/web/src/platform.ts` in the
 * harness. A harness upgrade can change this list; the `verify` gate compares it
 * with the running profile's `dsh-client-modules` so drift is caught here rather
 * than at runtime.
 */
const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-dockkit',
]

/** This package's own module-table requests, read from the manifest it ships. */
const manifest = JSON.parse(readFileSync(new URL('package.json', import.meta.url), 'utf8')) as {
  dsh?: { client?: { external?: string[] } }
}
const requested = new Set([...PLATFORM_MODULES, ...(manifest.dsh?.client?.external ?? [])])

/** The loader handoff the shell expects at the top of a browser bundle. */
const REGISTRATION = `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`

export default defineConfig([
  {
    name: ID,
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    // `lib/` is shared with the browser bundle below, so neither config may clean it.
    clean: false,
  },
  {
    name: `${ID}/client`,
    entry: { client: 'src/client/index.tsx' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
    // No sourcemap yet: nothing here is minified, and a map with `sourcesContent`
    // would copy the whole source tree into `lib/` for no debugging gain.
    sourcemap: false,
    deps: {
      neverBundle: (specifier) => requested.has(specifier),
      alwaysBundle: (specifier) => !requested.has(specifier),
    },
    outputOptions: {
      // The artifact name is fixed: the shell asks for exactly `client.js`, and
      // a package-local dynamic chunk must be named `client.<name>.js`.
      entryFileNames: 'client.js',
      chunkFileNames: 'client.[name].js',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      banner: REGISTRATION,
      footer: 'return module.exports; } });',
    },
  },
])
