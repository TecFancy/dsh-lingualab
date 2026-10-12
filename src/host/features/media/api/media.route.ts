/**
 * The two routes that send bytes: a library episode's files, and a file episode's. Containment
 * and Range are in `media.ts`; which files a file episode may serve is in `file-media.ts`.
 */
import type { HostContext, WebRoute } from '../../../../host-context.ts'
import { FILE_MEDIA_PATH, MEDIA_PATH } from '../../../../shared/protocol.ts'
import { resolveFileMedia } from '../../../entities/episode/index.ts'
import type { OpenState } from '../../../entities/open-state/index.ts'
import { resolveRoot } from '../../../shared/config/index.ts'
import { methodAllowed, refuseText, serveFile, serveMedia } from '../../../shared/http/index.ts'

/** `GET /lingualab/media/<episode>/<file>` — audio and subtitle bytes, with Range. */
export function mediaRoute(ctx: HostContext, configured: () => string): WebRoute {
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
export function fileMediaRoute(readState: () => OpenState): WebRoute {
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
