/**
 * dsh-lingualab — host half.
 *
 * The panel is a browser page, so the four things it cannot do for itself are the
 * four things this half owns: say where the library is, list what is in it, hand
 * over the bytes of one episode, and read or write the notes file.
 *
 * Everything is read from disk on demand rather than cached at load time. The
 * material is copied into the workspace by hand between sessions, so a library
 * snapshot taken at boot would be stale exactly when it matters most: right after a
 * new episode lands.
 *
 * Routes live under `/lingualab/`, clear of the module system's `/plugins` prefix
 * route, and the same four are declared in `dsh-plugin.naming.json` — `npm run
 * verify` compares the two so a renamed route cannot silently outlive its record.
 */
import z from '@deepseek-ai/schemastery'
import { join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type {
  HostContext,
  SettingsService,
  WebRoute,
  WorkspaceRef,
  WorkspaceRegistryService,
} from './host-context.ts'
import { configPayload, describeConfig, validateRoot } from './host/config.ts'
import { scanLibrary } from './host/library.ts'
import { readJsonBody, sendJson, serveMedia } from './host/media.ts'
import { readNotes, writeNotes } from './host/notes.ts'
import {
  CONFIG_PATH,
  LIBRARY_PATH,
  MEDIA_PATH,
  NOTES_PATH,
  type LibraryConfigWriteRequest,
  type NotesWriteRequest,
} from './shared/protocol.ts'

/** Stable plugin name (the composition row id is `lingualab`). */
export const name = 'lingualab'

/**
 * Without a web carrier there is nowhere to serve the library from, and nowhere
 * for the shell to fetch the client bundle either.
 */
export const inject = ['webServer']

/**
 * A config field the settings service may rewrite while the plugin is running.
 *
 * A volatile field is a box, not a value: reading it goes through `get()`. The
 * service writes into the box and the plugin sees the new value on its next read,
 * which is why this half resolves the root per request instead of caching it at
 * load.
 */
export interface VolatileField<T> {
  get(): T
}

/** Where the media library lives, and what the scan should do with it. */
export interface Config {
  /**
   * Absolute path to the library root: one folder per episode.
   *
   * Left empty, the plugin falls back to `<first workspace>/notes/learning/english/media`,
   * which is where the study method puts material. The panel can set this value
   * from the page, and a value set there lands in the same place as one written
   * into the profile's patch file.
   *
   * Declared volatile so the settings service will write it while the plugin is
   * running. Without that marker the write is refused — "entry has no volatile
   * fields" — and the folder card can only report what it cannot change.
   */
  libraryRoot: VolatileField<string>
}

// No `z<Config>` annotation: `.volatile()` widens the schema's meta type, and the
// asserted form stops compiling. The exported interface above still documents the
// fields and types `apply`.
export const Config = z.object({
  libraryRoot: z.string().default('').volatile(),
})

/** Where the library sits when the config does not say. */
const DEFAULT_LIBRARY_SUBPATH = 'notes/learning/english/media'

/**
 * Every workspace this deployment knows, or none.
 *
 * Read through `ctx.get`, not through the context property: the property proxy is
 * topology-sensitive, and touching an undeclared service through it throws — which
 * turned every route into an empty `400` whenever the config was unset and the
 * workspace guess had to run. Found by opening the panel with no `libraryRoot`.
 */
function workspacesOf(ctx: HostContext): readonly WorkspaceRef[] {
  try {
    const service = ctx.get?.('workspaceRegistry') as WorkspaceRegistryService | undefined
    return service?.list() ?? []
  } catch {
    return []
  }
}

/** The settings service, when this deployment has one. */
function settingsOf(ctx: HostContext): SettingsService | null {
  const service = ctx.get?.('settings')
  return typeof service === 'object' && service !== null && 'update' in service
    ? (service as SettingsService)
    : null
}

/** Where the root came from, and what it is. */
interface ResolvedRoot {
  readonly root: string
  readonly source: 'config' | 'workspace' | 'none'
}

/** Config first, workspace guess second. */
function resolveRoot(ctx: HostContext, configured: string): ResolvedRoot {
  if (configured.trim().length > 0) return { root: configured, source: 'config' }
  const workspace = workspacesOf(ctx)[0]?.path
  if (workspace === undefined) return { root: '', source: 'none' }
  return { root: join(workspace, DEFAULT_LIBRARY_SUBPATH), source: 'workspace' }
}

/** Reject every method the route does not implement, so a typo is loud. */
function methodAllowed(req: IncomingMessage, res: ServerResponse, allowed: readonly string[]): boolean {
  const method = req.method ?? 'GET'
  if (allowed.includes(method)) return true
  res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8', allow: allowed.join(', ') })
  res.end('方法不对\n')
  return false
}

/** `GET|POST /lingualab/config` — where the library is, and how to change it. */
function configRoute(ctx: HostContext, configured: () => string): WebRoute {
  return {
    kind: 'exact',
    path: CONFIG_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['GET', 'POST'])) return
      const settings = settingsOf(ctx)
      const workspaces = workspacesOf(ctx)

      if ((req.method ?? 'GET') === 'GET') {
        const resolved = resolveRoot(ctx, configured())
        sendJson(
          res,
          200,
          configPayload(
            describeConfig(resolved.root, configured(), resolved.source, settings !== null),
            workspaces,
            resolved.root,
          ),
        )
        return
      }

      let body: unknown
      try {
        body = await readJsonBody(req)
      } catch (error) {
        sendJson(res, 400, { ok: false, reason: `请求体读不了：${String(error)}` })
        return
      }
      const proposed = (body as Partial<LibraryConfigWriteRequest> | null)?.libraryRoot
      if (typeof proposed !== 'string') {
        sendJson(res, 400, { ok: false, reason: '缺 libraryRoot' })
        return
      }

      const problem = validateRoot(proposed)
      if (problem !== null) {
        sendJson(res, 400, { ok: false, reason: problem })
        return
      }
      if (settings === null) {
        sendJson(res, 409, {
          ok: false,
          reason:
            '这个部署没有 settings 服务，改不了配置。把下面这段写进 profile 的 cordis.patch.yml：\n' +
            `- id: lingualab\n  config:\n    libraryRoot: ${proposed.trim()}`,
        })
        return
      }

      try {
        await settings.update(name, { libraryRoot: proposed.trim() })
      } catch (error) {
        sendJson(res, 500, { ok: false, reason: `配置没写进去：${String(error)}` })
        return
      }

      // Answer with the state that is now in effect, so the panel does not have to
      // guess whether the write landed before re-reading the library.
      const resolved = resolveRoot(ctx, proposed.trim())
      sendJson(
        res,
        200,
        configPayload(
          describeConfig(resolved.root, proposed.trim(), resolved.source, true),
          workspaces,
          resolved.root,
        ),
      )
    },
  }
}

/** `GET /lingualab/library` — describe every episode folder under the root. */
function libraryRoute(ctx: HostContext, configured: () => string): WebRoute {
  return {
    kind: 'exact',
    path: LIBRARY_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['GET'])) return
      sendJson(res, 200, scanLibrary(resolveRoot(ctx, configured()).root))
    },
  }
}

/** `GET /lingualab/media/<episode>/<file>` — audio and subtitle bytes, with Range. */
function mediaRoute(ctx: HostContext, configured: () => string): WebRoute {
  return {
    kind: 'prefix',
    path: MEDIA_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['GET', 'HEAD'])) return
      const requestPath = (req.url ?? '').split('?')[0] ?? ''
      const rest = requestPath.startsWith(MEDIA_PATH) ? requestPath.slice(MEDIA_PATH.length) : ''
      serveMedia(req, res, resolveRoot(ctx, configured()).root, rest)
    },
  }
}

/** `GET` and `POST /lingualab/notes` — the hand-off file between panel and agent. */
function notesRoute(ctx: HostContext, configured: () => string): WebRoute {
  return {
    kind: 'exact',
    path: NOTES_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['GET', 'POST'])) return
      const root = resolveRoot(ctx, configured()).root

      if ((req.method ?? 'GET') === 'GET') {
        const url = new URL(req.url ?? NOTES_PATH, 'http://lingualab.invalid')
        sendJson(res, 200, readNotes(root, url.searchParams.get('episode') ?? ''))
        return
      }

      let body: unknown
      try {
        body = await readJsonBody(req)
      } catch (error) {
        sendJson(res, 400, { ok: false, episode: '', reason: `请求体读不了：${String(error)}`, phrases: [] })
        return
      }
      if (typeof body !== 'object' || body === null) {
        sendJson(res, 400, { ok: false, episode: '', reason: '请求体不是对象', phrases: [] })
        return
      }
      const request = body as Partial<NotesWriteRequest>
      if (typeof request.episode !== 'string' || !Array.isArray(request.phrases)) {
        sendJson(res, 400, { ok: false, episode: '', reason: '缺 episode 或 phrases', phrases: [] })
        return
      }
      const result = writeNotes(root, request.episode, request.phrases)
      sendJson(res, result.ok ? 200 : 400, result)
    },
  }
}

/** Mount the four routes. The config is read per request, so edits need no reload. */
export function apply(ctx: HostContext, config: Config): void {
  // Through the box: a volatile field holds the value, and the settings service can
  // replace it while this closure is still alive.
  const configured = (): string => {
    try {
      return config.libraryRoot.get()
    } catch {
      return ''
    }
  }
  const routes = [
    configRoute(ctx, configured),
    libraryRoute(ctx, configured),
    mediaRoute(ctx, configured),
    notesRoute(ctx, configured),
  ]
  for (const route of routes) {
    ctx.effect(() => ctx.webServer.register(route), `lingualab: ${route.kind} ${route.path}`)
  }
}
