/**
 * The notes route: the hand-off file between the panel and the agent. Reading, writing and the
 * stale-save check are in `notes.ts`.
 */
import type { HostContext, WebRoute } from '../host-context.ts'
import { NOTES_PATH, type NotesPayload, type NotesWriteRequest } from '../shared/protocol.ts'
import { resolveRoot } from './config.ts'
import { methodAllowed, readJsonBody, sendJson } from './media.ts'
import { readNotes, writeNotes } from './notes.ts'
import type { OpenState } from './state.ts'

/** A notes answer for a request that never reached an episode. */
function notesRefusal(reason: string): NotesPayload {
  return { ok: false, episode: '', reason, phrases: [], version: null, stale: false }
}

/** `GET` and `POST /lingualab/notes` — the hand-off file between panel and agent. */
export function notesRoute(
  ctx: HostContext,
  configured: () => string,
  readState: () => OpenState,
  writeState: (next: OpenState) => Promise<void>,
): WebRoute {
  return {
    kind: 'exact',
    path: NOTES_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['GET', 'POST'])) return
      const root = resolveRoot(ctx, configured()).root
      const state = readState()

      if ((req.method ?? 'GET') === 'GET') {
        const url = new URL(req.url ?? NOTES_PATH, 'http://lingualab.invalid')
        sendJson(res, 200, readNotes(root, url.searchParams.get('episode') ?? '', state))
        return
      }

      let body: unknown
      try {
        body = await readJsonBody(req)
      } catch (error) {
        sendJson(res, 400, notesRefusal(`请求体读不了：${String(error)}`))
        return
      }
      if (typeof body !== 'object' || body === null) {
        sendJson(res, 400, notesRefusal('请求体不是对象'))
        return
      }
      const request = body as Partial<NotesWriteRequest>
      if (typeof request.episode !== 'string' || !Array.isArray(request.phrases)) {
        sendJson(res, 400, notesRefusal('缺 episode 或 phrases'))
        return
      }
      // Anything but a version string counts as "never read", which a folder episode refuses.
      const expect = typeof request.expect === 'string' ? request.expect : null
      const result = writeNotes(root, request.episode, request.phrases, state, expect)
      if (result.state !== state) await writeState(result.state)
      sendJson(res, result.payload.ok ? 200 : result.payload.stale ? 409 : 400, result.payload)
    },
  }
}
