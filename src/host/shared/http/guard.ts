/**
 * Who may call this plugin's routes.
 *
 * The host's browser-trust fence (a loopback `Host`, a matching `Origin`, a signed
 * session cookie) is applied to `/api` and the RPC channels, and to nothing else: a route
 * a plugin registers on the web server is reachable by anything that can open a socket to
 * the port. For a read-only page that was a quiet gap. For a route that writes into the
 * media folder, and a config route that chooses which folder, it is a hole:
 *
 *   · a page the reader visits can rebind its own hostname to 127.0.0.1 and then call the
 *     route same-origin, with no CORS preflight to stop it, because nothing checks `Host`;
 *   · any other process on the machine can call it, with no cookie to ask for.
 *
 * A custom request header stops a cross-site form and nothing else here. The check that
 * answers both is the host's own: `connection.admit`, which applies the `Host` and
 * `Origin` rules and the session cookie, and answers with the rejection status.
 *
 * Every route goes through it, reads included. Audio and subtitles are the reader's
 * files, and "only writes need a login" would mean a hostile page could read the
 * library's contents by rebinding.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { HostContext, WebRoute } from '../../../host-context.ts'

/** The slice of the host's `connection` service this module calls. */
interface ConnectionLike {
  admit(request: { readonly headers: IncomingMessage['headers'] }): { readonly peer: unknown } | { readonly rejection: number }
}

/** Whether a value is the host's connection service. */
function isConnection(value: unknown): value is ConnectionLike {
  return typeof value === 'object' && value !== null && typeof (value as ConnectionLike).admit === 'function'
}

/** The plain-text answer for a refused request. */
function refuse(res: ServerResponse, status: number, text: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' })
  res.end(`${text}\n`)
}

/**
 * Decide whether a request may proceed, and answer it when it may not.
 * @param ctx - the host context; the connection service is read through `ctx.get`.
 * @param req - the request, read for its headers only.
 * @param res - the response, written only on refusal.
 * @returns true when the handler may run.
 */
export function admitRequest(ctx: HostContext, req: IncomingMessage, res: ServerResponse): boolean {
  let connection: unknown
  try {
    connection = ctx.get?.('connection')
  } catch {
    connection = undefined
  }

  // Closed, not open: a deployment with no connection service has no way to say who is
  // asking, and a route that can write files must not answer anyone in that case.
  if (!isConnection(connection)) {
    refuse(res, 403, '这个部署没有 connection 服务，没法确认请求来自哪里')
    return false
  }

  let verdict: ReturnType<ConnectionLike['admit']>
  try {
    verdict = connection.admit(req)
  } catch {
    refuse(res, 403, '没法确认请求来自哪里')
    return false
  }
  if ('rejection' in verdict) {
    refuse(res, verdict.rejection, verdict.rejection === 401 ? '请先登录' : '这个请求不被信任')
    return false
  }
  return true
}

/**
 * Wrap a route so its handler only runs for an admitted request.
 *
 * This is also where a request is reported as a use of the plugin, when the caller has something
 * to report it to. The hook is called here rather than inside {@link admitRequest} for two reasons:
 * the decision stays a pure function that answers "may this request proceed", and the reporting can
 * only ever fire for a request that was actually let through. The hook does its own swallowing, but
 * the extra `try` means a broken one cannot turn an admitted request into a failed route.
 * @param ctx - the host context.
 * @param route - the route to protect.
 * @param onAdmitted - called once for every admitted request, before the handler; it must return
 *   immediately and must not depend on the handler's outcome.
 * @returns the same route, guarded.
 */
export function guarded(ctx: HostContext, route: WebRoute, onAdmitted?: () => void): WebRoute {
  return {
    ...route,
    handler: (req, res) => {
      if (!admitRequest(ctx, req, res)) return
      try {
        onAdmitted?.()
      } catch {
        // Reporting is best effort; the admitted request still runs.
      }
      return route.handler(req, res)
    },
  }
}
