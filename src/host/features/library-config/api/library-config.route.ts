/**
 * The config route: where the library is, and how the page changes it.
 *
 * The rules for a usable folder and the payload's shape are in `config.ts`; this module reads the
 * request and writes the choice through the settings service.
 */
import type { HostContext, WebRoute } from '../../../../host-context.ts'
import { CONFIG_PATH, type LibraryConfigWriteRequest, type PluginVersionInfo } from '../../../../shared/protocol.ts'
import { findPlace, listPlaces, resolveInPlace } from '../../../entities/place/index.ts'
import {
  configPayload,
  describeConfig,
  resolveRoot,
  settingsOf,
  validateRoot,
  workspacesOf,
} from '../../../shared/config/index.ts'
import { methodAllowed, readJsonBody, sendJson } from '../../../shared/http/index.ts'

/** `GET|POST /lingualab/config` — where the library is, and how to change it. */
export function configRoute(
  ctx: HostContext,
  configured: () => string,
  pluginName: string,
  plugin: PluginVersionInfo,
): WebRoute {
  return {
    kind: 'exact',
    path: CONFIG_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['GET', 'POST'])) return
      const settings = settingsOf(ctx)
      const workspaces = workspacesOf(ctx)

      if ((req.method ?? 'GET') === 'GET') {
        const resolved = resolveRoot(ctx, configured())
        sendJson(
          res,
          200,
          configPayload(
            describeConfig(resolved.root, configured(), resolved.source, settings !== null),
            workspaces,
            resolved.root,
            plugin,
          ),
        )
        return
      }

      let body: unknown
      try {
        body = await readJsonBody(req)
      } catch (error) {
        sendJson(res, 400, { ok: false, reason: `请求体读不了：${String(error)}` })
        return
      }

      // Two ways to say the same thing: a typed absolute path, or a folder the
      // picker browsed to. Sending both is a mistake worth naming, because the two
      // could disagree and the reader would have no way to tell which won.
      const fields = (typeof body === 'object' && body !== null ? body : {}) as Partial<
        LibraryConfigWriteRequest & { place: string; rel: string }
      >
      const typed = typeof fields.libraryRoot === 'string'
      const mentionsPlace = fields.place !== undefined || fields.rel !== undefined
      if (typed && mentionsPlace) {
        sendJson(res, 400, { ok: false, reason: 'libraryRoot 与 place/rel 只能给一个' })
        return
      }
      if (!typed && mentionsPlace && !(typeof fields.place === 'string' && typeof fields.rel === 'string')) {
        sendJson(res, 400, { ok: false, reason: 'place 与 rel 要么都给，要么都不给' })
        return
      }
      if (!typed && !mentionsPlace) {
        sendJson(res, 400, { ok: false, reason: '缺 libraryRoot；或者给 place 与 rel' })
        return
      }

      let proposed: string
      if (typeof fields.libraryRoot === 'string') {
        proposed = fields.libraryRoot
      } else {
        const place = findPlace(listPlaces(workspaces, resolveRoot(ctx, configured()).root), fields.place ?? '')
        if (place === null) {
          sendJson(res, 400, { ok: false, reason: '找不到这个位置' })
          return
        }
        const resolved = resolveInPlace(place, fields.rel ?? '')
        if (!resolved.ok) {
          sendJson(res, 400, { ok: false, reason: resolved.reason })
          return
        }
        proposed = resolved.abs
      }

      const problem = validateRoot(proposed)
      if (problem !== null) {
        sendJson(res, 400, { ok: false, reason: problem })
        return
      }
      if (settings === null) {
        sendJson(res, 409, {
          ok: false,
          reason:
            '这个部署没有 settings 服务，改不了配置。把下面这段写进 profile 的 cordis.patch.yml：\n' +
            `- id: lingualab\n  config:\n    libraryRoot: ${proposed.trim()}`,
        })
        return
      }

      try {
        await settings.update(pluginName, { libraryRoot: proposed.trim() })
      } catch (error) {
        sendJson(res, 500, { ok: false, reason: `配置没写进去：${String(error)}` })
        return
      }

      // Answer with the state that is now in effect, so the panel does not have to
      // guess whether the write landed before re-reading the library.
      const resolved = resolveRoot(ctx, proposed.trim())
      sendJson(
        res,
        200,
        configPayload(
          describeConfig(resolved.root, proposed.trim(), resolved.source, true),
          workspaces,
          resolved.root,
          plugin,
        ),
      )
    },
  }
}
