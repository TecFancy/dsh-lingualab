/**
 * `GET /lingualab/update` — the running version, and whether a newer release exists.
 *
 * Read only, by construction: the checker runs `git ls-remote` and nothing else. `?refresh=1` skips
 * the cache when the page asks again after a failed answer.
 */
import type { WebRoute } from '../../../../host-context.ts'
import { UPDATE_PATH } from '../../../../shared/protocol.ts'
import { methodAllowed, sendJson } from '../../../shared/http/index.ts'
import type { UpdateChecker } from '../model/update-check.ts'

export function updateRoute(checker: UpdateChecker): WebRoute {
  return {
    kind: 'exact',
    path: UPDATE_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['GET'])) return
      const url = new URL(req.url ?? UPDATE_PATH, 'http://host')
      sendJson(res, 200, await checker.check({ refresh: url.searchParams.get('refresh') === '1' }))
    },
  }
}
