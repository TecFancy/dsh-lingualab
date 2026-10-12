/**
 * The two routes the picker browses with: the places it may start from, and one directory in one
 * of them. The listing rules are in `browse.ts` and `places.ts`.
 */
import type { HostContext, WebRoute } from '../../../../host-context.ts'
import { BROWSE_PATH, PLACES_PATH } from '../../../../shared/protocol.ts'
import type { OpenState } from '../../../entities/open-state/index.ts'
import { findPlace, listPlaces, placesPayload } from '../../../entities/place/index.ts'
import { resolveRoot, workspacesOf } from '../../../shared/config/index.ts'
import { methodAllowed, sendJson } from '../../../shared/http/index.ts'
import { browsePlace, refusedBrowse } from '../model/browse.ts'

/** `GET /lingualab/places` — the roots the picker may browse, and what is open. */
export function placesRoute(ctx: HostContext, configured: () => string, readState: () => OpenState): WebRoute {
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
export function browseRoute(ctx: HostContext, configured: () => string): WebRoute {
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
