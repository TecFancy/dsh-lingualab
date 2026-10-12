/**
 * The import route: one dropped file into the library. The rules (the folder, the cleaned name,
 * whether the file may land) are in `import.ts`.
 */
import type { HostContext, WebRoute } from '../../../../host-context.ts'
import { IMPORT_HEADER, IMPORT_PATH } from '../../../../shared/protocol.ts'
import { resolveRoot } from '../../../shared/config/index.ts'
import { methodAllowed, sendJson } from '../../../shared/http/index.ts'
import { importFile } from '../model/import.ts'

/**
 * `POST /lingualab/import` — one dropped file into the library.
 *
 * One of the routes that write into the media folder. Who may call it is decided by
 * `guarded` in `register`, which asks the host's own request trust: a loopback `Host`, a
 * matching `Origin` and the signed session cookie. That, and not the header below, is the
 * access control. The custom header is a second, narrower check that only says "this came
 * from the panel's code", and it would not stop a page that rebinds its hostname to
 * 127.0.0.1 or another process on the machine. The host also decides everything that
 * matters about the file (the folder, the cleaned name, whether it may land) rather than
 * believing the page.
 */
export function importRoute(ctx: HostContext, configured: () => string): WebRoute {
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
      // 429 for "try again in a moment", so a client can tell it from a refusal that will repeat.
      sendJson(res, payload.ok ? 200 : payload.retryable === true ? 429 : 400, payload)
    },
  }
}
