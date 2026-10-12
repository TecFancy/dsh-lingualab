/**
 * The progress route: positions and step ticks, shared across devices. The file and its merge
 * rule are in `progress.ts`.
 */
import type { HostContext, WebRoute } from '../../../../host-context.ts'
import { PROGRESS_PATH, type ProgressPayload } from '../../../../shared/protocol.ts'
import { resolveRoot } from '../../../shared/config/index.ts'
import { methodAllowed, readJsonBody, sendJson } from '../../../shared/http/index.ts'
import { readProgressFile, writeProgressFile, type ProgressRead } from '../model/progress.ts'

/**
 * `GET` and `POST /lingualab/progress` — positions and step ticks, shared across devices.
 *
 * A `POST` merges rather than replaces: the body is whatever this browser has, the newest
 * entry per episode wins, and the answer is the merged table, so one round trip is both
 * "upload mine" and "download everyone's".
 */
export function progressRoute(ctx: HostContext, configured: () => string): WebRoute {
  const answer = (read: ProgressRead): ProgressPayload => ({ ok: read.ok, reason: read.reason, ...read.table })
  return {
    kind: 'exact',
    path: PROGRESS_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['GET', 'POST'])) return
      const root = resolveRoot(ctx, configured()).root
      if ((req.method ?? 'GET') === 'GET') {
        sendJson(res, 200, answer(readProgressFile(root)))
        return
      }
      let body: unknown
      try {
        // Roomier than the notes limit: a full table is up to a thousand small entries (one
        // per episode or per segment), a couple of hundred kilobytes at the most.
        body = await readJsonBody(req, 512 * 1024)
      } catch (error) {
        sendJson(res, 400, { ok: false, reason: `请求体读不了：${String(error)}`, progress: {}, steps: {} })
        return
      }
      sendJson(res, 200, answer(writeProgressFile(root, body)))
    },
  }
}
