/**
 * dsh-lingualab — host half.
 *
 * The panel is a browser page, so the things it cannot do for itself are the
 * things this half owns: say where the library is, list what is in it, let the
 * reader browse to material that is not in the library yet, receive the files the
 * reader drops on the page, hand over the bytes of one episode, and read or write the
 * notes.
 *
 * Everything is read from disk on demand rather than cached at load time. The
 * material is copied into the workspace by hand between sessions, so a library
 * snapshot taken at boot would be stale exactly when it matters most: right after a
 * new episode lands.
 *
 * Routes live under `/lingualab/`, clear of the module system's `/plugins` prefix
 * route, and every one of them is declared in `dsh-plugin.naming.json` — `npm run
 * verify` compares the two so a renamed route cannot silently outlive its record.
 *
 * The one thing this half *does* remember is which episode is open: a file episode
 * is identified by a hash of its path, and only the plugin can turn that id back
 * into a file. It is persisted in this plugin's own config (`openState`), through
 * the settings service, so the profile remains the single home for plugin state.
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
import { refusedBrowse, browsePlace } from './host/browse.ts'
import { configPayload, describeConfig, validateRoot } from './host/config.ts'
import { scanLibrary } from './host/library.ts'
import { importFile } from './host/import.ts'
import { readJsonBody, sendJson, serveFile, serveMedia } from './host/media.ts'
import { readNotes, writeNotes } from './host/notes.ts'
import { openEpisode, resolveFileMedia } from './host/open.ts'
import { findPlace, listPlaces, placesPayload, resolveInPlace } from './host/places.ts'
import { parseState, serializeState, type OpenState } from './host/state.ts'
import {
  BROWSE_PATH,
  CONFIG_PATH,
  FILE_MEDIA_PATH,
  IMPORT_HEADER,
  IMPORT_PATH,
  LIBRARY_PATH,
  MEDIA_PATH,
  NOTES_PATH,
  OPEN_PATH,
  PLACES_PATH,
  type LibraryConfigWriteRequest,
  type NotesWriteRequest,
  type OpenPayload,
  type OpenRequest,
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
  /**
   * What the plugin remembers between requests, as JSON.
   *
   * Only file episodes need it: a folder episode is rediscovered by the scan, while
   * an audio file picked out of a workspace is known by a hash of its path, and the
   * notes written against it have nowhere else to live. Volatile for the same
   * reason as `libraryRoot` — the panel writes it, and the write has to be allowed.
   */
  openState: VolatileField<string>
}

// No `z<Config>` annotation: `.volatile()` widens the schema's meta type, and the
// asserted form stops compiling. The exported interface above still documents the
// fields and types `apply`.
export const Config = z.object({
  libraryRoot: z.string().default('').volatile(),
  openState: z.string().default('').volatile(),
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

/** One plain-text refusal, for the routes that answer a body of their own shape. */
function refuseText(res: ServerResponse, status: number, text: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(`${text}\n`)
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

      // Two ways to say the same thing: a typed absolute path, or a folder the
      // picker browsed to. Sending both is a mistake worth naming, because the two
      // could disagree and the reader would have no way to tell which won.
      const fields = (typeof body === 'object' && body !== null ? body : {}) as Partial<
        LibraryConfigWriteRequest & { place: string; rel: string }
      >
      const typed = typeof fields.libraryRoot === 'string'
      const mentionsPlace = fields.place !== undefined || fields.rel !== undefined
      if (typed && mentionsPlace) {
        sendJson(res, 400, { ok: false, reason: 'libraryRoot 与 place/rel 只能给一个' })
        return
      }
      if (!typed && mentionsPlace && !(typeof fields.place === 'string' && typeof fields.rel === 'string')) {
        sendJson(res, 400, { ok: false, reason: 'place 与 rel 要么都给，要么都不给' })
        return
      }
      if (!typed && !mentionsPlace) {
        sendJson(res, 400, { ok: false, reason: '缺 libraryRoot；或者给 place 与 rel' })
        return
      }

      let proposed: string
      if (typeof fields.libraryRoot === 'string') {
        proposed = fields.libraryRoot
      } else {
        const place = findPlace(listPlaces(workspaces, resolveRoot(ctx, configured()).root), fields.place ?? '')
        if (place === null) {
          sendJson(res, 400, { ok: false, reason: '找不到这个位置' })
          return
        }
        const resolved = resolveInPlace(place, fields.rel ?? '')
        if (!resolved.ok) {
          sendJson(res, 400, { ok: false, reason: resolved.reason })
          return
        }
        proposed = resolved.abs
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

/** `GET /lingualab/places` — the roots the picker may browse, and what is open. */
function placesRoute(ctx: HostContext, configured: () => string, readState: () => OpenState): WebRoute {
  return {
    kind: 'exact',
    path: PLACES_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['GET'])) return
      const root = resolveRoot(ctx, configured()).root
      sendJson(res, 200, placesPayload(workspacesOf(ctx), root, readState().current))
    },
  }
}

/** `GET /lingualab/browse` — one directory under one place. */
function browseRoute(ctx: HostContext, configured: () => string): WebRoute {
  return {
    kind: 'exact',
    path: BROWSE_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['GET'])) return
      const url = new URL(req.url ?? BROWSE_PATH, 'http://lingualab.invalid')
      const root = resolveRoot(ctx, configured()).root
      const place = findPlace(listPlaces(workspacesOf(ctx), root), url.searchParams.get('place') ?? '')
      if (place === null) {
        sendJson(res, 400, refusedBrowse(null, '', '找不到这个位置'))
        return
      }
      const requested = Number(url.searchParams.get('limit') ?? '')
      sendJson(
        res,
        200,
        browsePlace({
          place,
          libraryRoot: root,
          rel: url.searchParams.get('rel') ?? '',
          query: url.searchParams.get('q') ?? '',
          limit: Number.isFinite(requested) && url.searchParams.get('limit') !== null ? requested : undefined,
          includeOther: url.searchParams.get('includeOther') === '1',
        }),
      )
    },
  }
}

/** `POST /lingualab/open` — make one folder episode, or one audio file, current. */
function openRoute(
  ctx: HostContext,
  configured: () => string,
  readState: () => OpenState,
  writeState: (next: OpenState) => Promise<void>,
): WebRoute {
  return {
    kind: 'exact',
    path: OPEN_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['POST'])) return

      let body: unknown
      try {
        body = await readJsonBody(req)
      } catch (error) {
        sendJson(res, 400, emptyOpen(`请求体读不了：${String(error)}`))
        return
      }
      if (typeof body !== 'object' || body === null) {
        sendJson(res, 400, emptyOpen('请求体不是对象'))
        return
      }
      const request = body as Partial<OpenRequest>
      const hasEpisode = typeof request.episodeId === 'string' && request.episodeId.length > 0
      const mentionsPlace = request.place !== undefined || request.rel !== undefined
      if (hasEpisode === mentionsPlace) {
        sendJson(res, 400, emptyOpen('episodeId 与 place/rel 只能给一个'))
        return
      }

      const root = resolveRoot(ctx, configured()).root
      const state = readState()
      const result = openEpisode(request as OpenRequest, {
        libraryRoot: root,
        places: listPlaces(workspacesOf(ctx), root),
        state,
      })
      if (result.state !== state) await writeState(result.state)
      sendJson(res, result.payload.ok ? 200 : 400, result.payload)
    },
  }
}

/**
 * `POST /lingualab/import` — one dropped file into the library.
 *
 * The one route that writes into the media folder, so it is guarded twice over. The
 * request must carry a custom header: a plain cross-site form or `<img>` cannot set
 * one, and a script that does is subject to the browser's own cross-origin rules. And
 * the host decides everything that matters (the folder, the cleaned name, whether the
 * file may land) rather than believing the page.
 */
function importRoute(ctx: HostContext, configured: () => string): WebRoute {
  return {
    kind: 'exact',
    path: IMPORT_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['POST'])) return
      if (req.headers[IMPORT_HEADER] !== '1') {
        sendJson(res, 403, {
          ok: false,
          code: 'refused',
          reason: '缺少导入标记，这个请求不像是从面板发来的',
          episode: null,
          file: null,
          bytes: 0,
          root: null,
        })
        return
      }
      const url = new URL(req.url ?? IMPORT_PATH, 'http://lingualab.invalid')
      const declared = Number(req.headers['content-length'])
      const payload = await importFile(
        {
          root: resolveRoot(ctx, configured()).root,
          episode: url.searchParams.get('episode') ?? '',
          file: url.searchParams.get('file') ?? '',
          declaredBytes: Number.isFinite(declared) && req.headers['content-length'] !== undefined ? declared : null,
        },
        req,
      )
      sendJson(res, payload.ok ? 200 : 400, payload)
    },
  }
}

/** A refusal with no episode attached, for the request-level mistakes. */
function emptyOpen(reason: string): OpenPayload {
  return { ok: false, reason, episode: null, media: null, warnings: [] }
}

/** `GET /lingualab/library` — describe every episode folder under the root. */
function libraryRoute(ctx: HostContext, configured: () => string, readState: () => OpenState): WebRoute {
  return {
    kind: 'exact',
    path: LIBRARY_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['GET'])) return
      sendJson(res, 200, scanLibrary(resolveRoot(ctx, configured()).root, readState()))
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

/** `GET|HEAD /lingualab/file-media/<id>/<file>` — one picked file's bytes, with Range. */
function fileMediaRoute(readState: () => OpenState): WebRoute {
  return {
    kind: 'prefix',
    path: FILE_MEDIA_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['GET', 'HEAD'])) return
      const requestPath = (req.url ?? '').split('?')[0] ?? ''
      const rest = requestPath.startsWith(FILE_MEDIA_PATH) ? requestPath.slice(FILE_MEDIA_PATH.length) : ''
      const target = resolveFileMedia(readState(), rest)
      if (target === null) {
        refuseText(res, 404, '没有这个文件')
        return
      }
      serveFile(req, res, target)
    },
  }
}

/** `GET` and `POST /lingualab/notes` — the hand-off file between panel and agent. */
function notesRoute(
  ctx: HostContext,
  configured: () => string,
  readState: () => OpenState,
  writeState: (next: OpenState) => Promise<void>,
): WebRoute {
  return {
    kind: 'exact',
    path: NOTES_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['GET', 'POST'])) return
      const root = resolveRoot(ctx, configured()).root
      const state = readState()

      if ((req.method ?? 'GET') === 'GET') {
        const url = new URL(req.url ?? NOTES_PATH, 'http://lingualab.invalid')
        sendJson(res, 200, readNotes(root, url.searchParams.get('episode') ?? '', state))
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
      const result = writeNotes(root, request.episode, request.phrases, state)
      if (result.state !== state) await writeState(result.state)
      sendJson(res, result.payload.ok ? 200 : 400, result.payload)
    },
  }
}

/** Mount every route. The config is read per request, so edits need no reload. */
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

  /**
   * The state as this process last saw it.
   *
   * The config field is the durable copy, but a plugin cannot assume the box it
   * reads reflects a write made moments ago in the same process — the settings
   * service owns when that lands. So the first read parses the field and every
   * write updates this copy, which is what the next request reads. A hand edit of
   * the profile is picked up at the next restart, which is when a hand edit of a
   * profile is expected to arrive.
   */
  let live: OpenState | null = null
  const readState = (): OpenState => {
    if (live !== null) return live
    let raw = ''
    try {
      raw = config.openState.get()
    } catch {
      // Left empty: a box that cannot be read reads as nothing remembered.
    }
    live = parseState(raw)
    return live
  }
  const writeState = async (next: OpenState): Promise<void> => {
    live = next
    const settings = settingsOf(ctx)
    if (settings === null) return
    try {
      await settings.update(name, { openState: serializeState(next) })
    } catch {
      // The in-process copy is what the next request reads, so a failed write costs
      // the memory at restart, not the session in progress.
    }
  }

  const routes = [
    configRoute(ctx, configured),
    placesRoute(ctx, configured, readState),
    browseRoute(ctx, configured),
    openRoute(ctx, configured, readState, writeState),
    importRoute(ctx, configured),
    libraryRoute(ctx, configured, readState),
    mediaRoute(ctx, configured),
    fileMediaRoute(readState),
    notesRoute(ctx, configured, readState, writeState),
  ]
  for (const route of routes) {
    ctx.effect(() => ctx.webServer.register(route), `lingualab: ${route.kind} ${route.path}`)
  }
}
