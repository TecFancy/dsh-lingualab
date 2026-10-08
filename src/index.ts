/**
 * dsh-lingualab — host half.
 *
 * The panel is a browser page, so the three things it cannot do for itself are
 * the three things this half owns: list what is in the library, hand over the
 * bytes of one episode, and read or write the notes file.
 *
 * Everything is read from disk on demand rather than cached at load time. The
 * material is copied into the workspace by hand between sessions, so a library
 * snapshot taken at boot would be stale exactly when it matters most: right after
 * a new episode lands.
 *
 * Routes live under `/lingualab/`, clear of the module system's `/plugins` prefix
 * route, and the same three are declared in `dsh-plugin.naming.json` — `npm run
 * verify` compares the two so a renamed route cannot silently outlive its record.
 */
import z from '@deepseek-ai/schemastery'
import { join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { HostContext, WebRoute } from './host-context.ts'
import { scanLibrary } from './host/library.ts'
import { readJsonBody, sendJson, serveMedia } from './host/media.ts'
import { readNotes, writeNotes } from './host/notes.ts'
import { LIBRARY_PATH, MEDIA_PATH, NOTES_PATH, type NotesWriteRequest } from './shared/protocol.ts'

/** Stable plugin name (the composition row id is `lingualab`). */
export const name = 'lingualab'

/**
 * Without a web carrier there is nowhere to serve the library from, and nowhere
 * for the shell to fetch the client bundle either.
 */
export const inject = ['webServer']

/** Where the media library lives, and what the scan should do with it. */
export interface Config {
  /**
   * Absolute path to the library root: one folder per episode.
   *
   * Left empty, the plugin falls back to `<first workspace>/notes/learning/english/media`,
   * which is where the study method puts material. An explicit path is how this
   * is installed in practice, because guessing stops being useful the moment the
   * host knows about more than one workspace.
   */
  libraryRoot: string
}

export const Config: z<Config> = z.object({
  libraryRoot: z.string().default(''),
})

/** Where the library sits when the config does not say. */
const DEFAULT_LIBRARY_SUBPATH = 'notes/learning/english/media'

/** Resolve the library root for one request: config first, workspace guess second. */
function resolveRoot(ctx: HostContext, configured: string): string {
  if (configured.trim().length > 0) return configured
  const workspace = ctx.workspaceRegistry?.list()[0]?.path
  return workspace === undefined ? '' : join(workspace, DEFAULT_LIBRARY_SUBPATH)
}

/** Reject every method the route does not implement, so a typo is loud. */
function methodAllowed(req: IncomingMessage, res: ServerResponse, allowed: readonly string[]): boolean {
  const method = req.method ?? 'GET'
  if (allowed.includes(method)) return true
  res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8', allow: allowed.join(', ') })
  res.end('方法不对\n')
  return false
}

/** `GET /lingualab/library` — describe every episode folder under the root. */
function libraryRoute(ctx: HostContext, configured: () => string): WebRoute {
  return {
    kind: 'exact',
    path: LIBRARY_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['GET'])) return
      sendJson(res, 200, scanLibrary(resolveRoot(ctx, configured())))
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
      serveMedia(req, res, resolveRoot(ctx, configured()), rest)
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
      const root = resolveRoot(ctx, configured())

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

/** Mount the three routes. The config is read per request, so edits need no reload. */
export function apply(ctx: HostContext, config: Config): void {
  const configured = (): string => config.libraryRoot
  for (const route of [libraryRoute(ctx, configured), mediaRoute(ctx, configured), notesRoute(ctx, configured)]) {
    ctx.effect(() => ctx.webServer.register(route), `lingualab: ${route.kind} ${route.path}`)
  }
}
