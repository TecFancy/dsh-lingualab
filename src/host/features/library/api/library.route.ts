/**
 * The library route: every episode under the root, as `library.ts` scans it.
 */
import type { HostContext, WebRoute } from '../../../../host-context.ts'
import { LIBRARY_PATH } from '../../../../shared/protocol.ts'
import { scanLibrary } from '../../../entities/episode/index.ts'
import type { OpenState } from '../../../entities/open-state/index.ts'
import { resolveRoot } from '../../../shared/config/index.ts'
import { methodAllowed, sendJson } from '../../../shared/http/index.ts'

/** `GET /lingualab/library` — describe every episode folder under the root. */
export function libraryRoute(ctx: HostContext, configured: () => string, readState: () => OpenState): WebRoute {
  return {
    kind: 'exact',
    path: LIBRARY_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['GET'])) return
      sendJson(res, 200, scanLibrary(resolveRoot(ctx, configured()).root, readState()))
    },
  }
}
