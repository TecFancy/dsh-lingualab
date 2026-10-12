/**
 * The subtitle-timing route: one sentence's start and end, written back into its subtitle file.
 */
import type { HostContext, WebRoute } from '../host-context.ts'
import { SUBTITLE_TIMING_PATH } from '../shared/protocol.ts'
import { resolveRoot } from './config.ts'
import { methodAllowed, readJsonBody, sendJson } from './media.ts'
import type { OpenState } from './state.ts'
import { writeTiming } from './timing.ts'

/**
 * `POST /lingualab/subtitle-timing` — move one sentence's start and end in its subtitle file.
 *
 * The second route that writes into the media folder, after the import, and admitted the same
 * way (`guarded` in `register`). It only ever changes subtitle files inside the library, and only
 * their timecodes; `timing.ts` holds the rules.
 */
export function timingRoute(ctx: HostContext, configured: () => string, readState: () => OpenState): WebRoute {
  return {
    kind: 'exact',
    path: SUBTITLE_TIMING_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['POST'])) return
      let body: unknown
      try {
        body = await readJsonBody(req)
      } catch (error) {
        sendJson(res, 400, { ok: false, code: 'refused', reason: `请求体读不了：${String(error)}`, files: [] })
        return
      }
      const result = writeTiming(resolveRoot(ctx, configured()).root, readState(), body)
      sendJson(res, result.status, result.payload)
    },
  }
}
