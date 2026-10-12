/**
 * The open route: one folder episode, or one audio file, becomes current. `open.ts` decides what
 * the open means; this module checks the request's shape and remembers the state it produced.
 */
import type { HostContext, WebRoute } from '../../../../host-context.ts'
import { OPEN_PATH, type OpenPayload, type OpenRequest } from '../../../../shared/protocol.ts'
import type { OpenState } from '../../../entities/open-state/index.ts'
import { listPlaces } from '../../../entities/place/index.ts'
import { resolveRoot, workspacesOf } from '../../../shared/config/index.ts'
import { methodAllowed, readJsonBody, sendJson } from '../../../shared/http/index.ts'
import { openEpisode } from '../model/open.ts'

/** A refusal with no episode attached, for the request-level mistakes. */
function emptyOpen(reason: string): OpenPayload {
  return { ok: false, reason, episode: null, media: null, segment: null, warnings: [] }
}

/** `POST /lingualab/open` — make one folder episode, or one audio file, current. */
export function openRoute(
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
      if (request.segment !== undefined && typeof request.segment !== 'string') {
        sendJson(res, 400, emptyOpen('segment 必须是字符串'))
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
