/**
 * The subtitle-choice route: which subtitle files one episode or segment plays with.
 */
import type { HostContext, WebRoute } from '../host-context.ts'
import { SUBTITLE_CHOICE_PATH } from '../shared/protocol.ts'
import { resolveRoot } from './config.ts'
import { methodAllowed, readJsonBody, sendJson } from './media.ts'
import type { OpenState } from './state.ts'
import { readSubtitleChoice, refuse as refuseChoice, saveSubtitleChoice } from './subtitle-choice-rules.ts'

/**
 * `GET` and `POST /lingualab/subtitle-choice`: which subtitle files one episode or segment plays with.
 *
 * A `POST` for a folder episode writes one hidden file into the episode folder, and for a file episode
 * changes its record in the plugin state; `subtitle-choice-rules.ts` holds the rules. Admitted by
 * `guarded` like every route.
 */
export function subtitleChoiceRoute(
  ctx: HostContext,
  configured: () => string,
  readState: () => OpenState,
  writeState: (next: OpenState) => Promise<void>,
): WebRoute {
  return {
    kind: 'exact',
    path: SUBTITLE_CHOICE_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['GET', 'POST'])) return
      const root = resolveRoot(ctx, configured()).root
      const state = readState()
      if ((req.method ?? 'GET') === 'GET') {
        const url = new URL(req.url ?? SUBTITLE_CHOICE_PATH, 'http://lingualab.invalid')
        const segment = url.searchParams.get('segment')
        const result = readSubtitleChoice(root, state, url.searchParams.get('episode') ?? '', segment === null || segment.length === 0 ? undefined : segment)
        sendJson(res, result.status, result.payload)
        return
      }
      let body: unknown
      try {
        body = await readJsonBody(req)
      } catch (error) {
        const refused = refuseChoice(state, 400, `请求体读不了：${String(error)}`)
        sendJson(res, refused.status, refused.payload)
        return
      }
      const result = saveSubtitleChoice(root, state, body)
      if (result.state !== state) await writeState(result.state)
      sendJson(res, result.status, result.payload)
    },
  }
}
