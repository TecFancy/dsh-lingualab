/**
 * The review route: the kept sentences still to review, across the library, as `review.ts` reads them.
 */
import type { HostContext, WebRoute } from '../host-context.ts'
import { REVIEW_PATH } from '../shared/protocol.ts'
import { resolveRoot } from './config.ts'
import { methodAllowed, sendJson } from './media.ts'
import { readReview } from './review.ts'
import type { OpenState } from './state.ts'

/** `GET /lingualab/review`: every kept sentence not graded 「记住了」, across the library. Read only. */
export function reviewRoute(ctx: HostContext, configured: () => string, readState: () => OpenState): WebRoute {
  return {
    kind: 'exact',
    path: REVIEW_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['GET'])) return
      sendJson(res, 200, readReview(resolveRoot(ctx, configured()).root, readState()))
    },
  }
}
