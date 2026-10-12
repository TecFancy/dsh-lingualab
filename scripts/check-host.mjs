#!/usr/bin/env node
/**
 * Host-contract gate: the four files that must agree about who this plugin is.
 *
 * The composition knows this plugin by four independent names, and none of them
 * is derived from another at runtime:
 *
 *   · `package.json#name`          — the package and the `/plugins/<id>/` route
 *   · `package.json#dsh`           — the bundle patch and the client's platform
 *   · `cordis.patch.yml`           — the Loader row id the profile mounts
 *   · `dsh-plugin.naming.json`     — the public declaration of all of the above
 *
 * Plus two runtime facts a source review cannot see: the browser bundle's
 * registration id and the set of specifiers it asks the module table for. A
 * `require` the table cannot answer is a guaranteed runtime throw, so drift there
 * has to fail here instead of in the browser console.
 *
 * Usage: node scripts/check-host.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const problems = []

/** Read a file relative to the repository root, or record why it could not be read. */
function read(relative) {
  const path = join(root, relative)
  if (!existsSync(path)) {
    problems.push(`${relative} 不存在`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

/** Record a problem when a condition does not hold. */
function expect(condition, message) {
  if (!condition) problems.push(message)
}

const manifest = JSON.parse(read('package.json') || '{}')
const naming = JSON.parse(read('dsh-plugin.naming.json') || '{}')
const patch = read('cordis.patch.yml')

/**
 * Every host module that can register a route: the entry and everything under `src/host/`
 * except tests. A route is built next to the rules it calls, so the registrations are spread
 * across the tree rather than kept in the entry.
 */
function hostSources() {
  const files = ['src/index.ts']
  const walk = (dir) => {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`
      if (entry.isDirectory()) walk(rel)
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) files.push(rel)
    }
  }
  if (existsSync(join(root, 'src/host'))) walk('src/host')
  return files
}
const hostSource = hostSources()
  .map((file) => read(file))
  .join('\n')
const clientBundle = read('lib/client.js')
const hostBundle = read('lib/index.js')

// 1. The package names itself consistently.
expect(manifest.name === naming.plugin?.packageName, 'package.json#name 与命名清单的 packageName 不一致')
expect(manifest.main === 'lib/index.js', 'package.json#main 必须是 lib/index.js')
expect(manifest.exports?.['.'] === './lib/index.js', 'package.json#exports["."] 必须是 ./lib/index.js')
expect(manifest.exports?.['./client'] === './lib/client.js', 'package.json#exports["./client"] 必须是 ./lib/client.js')
expect(Array.isArray(manifest.files) && manifest.files.includes('lib'), 'package.json#files 必须包含 lib')
expect(manifest.dsh?.bundle?.patch === './cordis.patch.yml', 'package.json#dsh.bundle.patch 必须是 ./cordis.patch.yml')
expect(manifest.dsh?.client?.platform === 'web', 'package.json#dsh.client.platform 必须是 web')

// 2. The Loader row is the id the naming record declares, and it names this package.
const rows = [...patch.matchAll(/^\s*-?\s*id:\s*(\S+)\s*$/gm)].map((match) => match[1])
const loaderIds = naming.names?.loaderIds ?? []
expect(rows.length > 0, 'cordis.patch.yml 里没有 Loader 行')
for (const id of rows) {
  expect(loaderIds.includes(id), `cordis.patch.yml 的行 id ${id} 不在命名清单的 loaderIds 里`)
}
for (const id of loaderIds) {
  expect(rows.includes(id), `命名清单的 loaderIds ${id} 在 cordis.patch.yml 里找不到`)
}
expect(
  patch.includes(`name: '${manifest.name}'`) || patch.includes(`name: "${manifest.name}"`),
  'cordis.patch.yml 的行 name 必须指向本包',
)
for (const pluginName of naming.names?.pluginNames ?? []) {
  expect(loaderIds.includes(pluginName) || rows.includes(pluginName), `插件名 ${pluginName} 没有对应的 Loader 行`)
}

// 3. Every declared route exists in the host source, and the source registers nothing else.
//    The paths themselves live in `src/shared/protocol.ts`, so the source is read
//    through those constants rather than by grepping for a literal.
const protocol = read('src/shared/protocol.ts')
const pathConstants = new Map(
  [...protocol.matchAll(/export const (\w+_PATH)\s*=\s*'([^']+)'/g)].map((match) => [match[1], match[2]]),
)
const declaredRoutes = naming.names?.routes ?? []
const registered = [...hostSource.matchAll(/kind:\s*'(\w+)',\s*\n\s*path:\s*(\w+)/g)].map((match) => ({
  kind: match[1],
  path: pathConstants.get(match[2]),
}))
expect(registered.length > 0, 'host 源码里没有找到 kind/path 成对的路由注册')
for (const route of declaredRoutes) {
  expect(typeof route.kind === 'string' && typeof route.path === 'string', '命名清单里的路由缺少 kind 或 path')
  const hit = registered.some((entry) => entry.kind === route.kind && entry.path === route.path)
  expect(hit, `命名清单里的路由 ${route.kind} ${route.path} 在 host 源码里找不到`)
}
expect(
  registered.length === declaredRoutes.length,
  `host 源码注册了 ${registered.length} 条路由，命名清单声明了 ${declaredRoutes.length} 条`,
)

// 4. The host bundle exports the plugin identity the composition expects.
expect(hostBundle.includes(`name = "${naming.names?.pluginNames?.[0]}"`) || hostBundle.includes(`name = '${naming.names?.pluginNames?.[0]}'`), `lib/index.js 没有导出插件名 ${naming.names?.pluginNames?.[0]}`)
expect(hostBundle.includes('webServer'), 'lib/index.js 没有声明 webServer 依赖')

// 5. The browser bundle registers under the package name and only asks the module
//    table for specifiers the shell actually seeds.
const registration = /__ModuleLoader__\.load\(\{\s*id:\s*"([^"]+)"/.exec(clientBundle)
expect(registration !== null, 'lib/client.js 里找不到 __ModuleLoader__.load 注册')
if (registration !== null) {
  expect(registration[1] === manifest.name, `客户端注册 id ${registration[1]} 与包名 ${manifest.name} 不一致`)
}
const platform = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-dockkit',
  ...(manifest.dsh?.client?.external ?? []),
])
const requested = [...clientBundle.matchAll(/require\("([^"]+)"\)/g)].map((match) => match[1])
for (const specifier of new Set(requested)) {
  expect(platform.has(specifier), `lib/client.js 向模块表要了 ${specifier}，宿主没有这个模块`)
}

if (problems.length > 0) {
  console.error(`❌ check-host — ${problems.length} 处不一致：`)
  for (const problem of problems) console.error(`   · ${problem}`)
  process.exit(1)
}
console.log(
  `✅ check-host — 包名、Loader 行、${declaredRoutes.length} 条路由与客户端注册 id 一致（模块表请求：${[...new Set(requested)].join(', ') || '无'}）`,
)
