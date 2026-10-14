/**
 * The three video routes: what the host knows about one segment's video, starting the job that
 * prepares it, and stopping that job. The plan, the job queue and the cache are in `video.ts`,
 * `video-plan.ts`, `video-jobs.ts` and `video-cache.ts`.
 */
import type { HostContext, WebRoute } from '../../../../host-context.ts'
import {
  VIDEO_CANCEL_PATH,
  VIDEO_PATH,
  VIDEO_PREPARE_MODES,
  VIDEO_PREPARE_PATH,
  type VideoCancelPayload,
  type VideoPrepareRequest,
} from '../../../../shared/protocol.ts'
import { resolveRoot } from '../../../shared/config/index.ts'
import { findBinaries, realSpawn } from '../../../shared/ffmpeg/index.ts'
import { methodAllowed, readJsonBody, sendJson } from '../../../shared/http/index.ts'
import type { VideoJobs } from '../model/video-jobs.ts'
import { prepareVideo, videoStatus, type VideoDeps } from '../model/video.ts'

/** The video questions every video route asks, built from what is true now. */
function videoDeps(ctx: HostContext, configured: () => string, ffmpegPath: () => string, jobs: VideoJobs): VideoDeps {
  return {
    root: resolveRoot(ctx, configured()).root,
    binaries: () => findBinaries(ffmpegPath()),
    spawn: realSpawn,
    jobs,
    platform: process.platform,
  }
}

/** `GET /lingualab/video`: what the host knows about one segment's video. */
export function videoRoute(ctx: HostContext, configured: () => string, ffmpegPath: () => string, jobs: VideoJobs): WebRoute {
  return {
    kind: 'exact',
    path: VIDEO_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['GET'])) return
      const url = new URL(req.url ?? VIDEO_PATH, 'http://lingualab.invalid')
      const segment = url.searchParams.get('segment')
      sendJson(
        res,
        200,
        await videoStatus(url.searchParams.get('episode') ?? '', segment === null || segment.length === 0 ? undefined : segment, videoDeps(ctx, configured, ffmpegPath, jobs)),
      )
    },
  }
}

/**
 * `POST /lingualab/video-prepare`: start preparing one segment's video.
 *
 * The third route that writes into the media folder, after the import and the subtitle timing, and it
 * writes the narrowest thing: files in the plugin's own hidden `.lingualab` folder, made by a process
 * the host starts itself (or deletes the smooth one, for `original`). Admitted by `guarded` like every route; the body names a segment and a mode,
 * never a path, and the host works out the rest from its own scan.
 */
export function videoPrepareRoute(ctx: HostContext, configured: () => string, ffmpegPath: () => string, jobs: VideoJobs): WebRoute {
  return {
    kind: 'exact',
    path: VIDEO_PREPARE_PATH,
    handler: async (req, res) => {
      if (!methodAllowed(req, res, ['POST'])) return
      let body: unknown
      try {
        body = await readJsonBody(req)
      } catch (error) {
        sendJson(res, 400, { ok: false, reason: `请求体读不了：${String(error)}` })
        return
      }
      const request = (typeof body === 'object' && body !== null ? body : {}) as Partial<VideoPrepareRequest>
      if (typeof request.episode !== 'string' || request.mode === undefined || !VIDEO_PREPARE_MODES.includes(request.mode)) {
        sendJson(res, 400, { ok: false, reason: '缺 episode，或者 mode 不是 video、sound、smooth 或 original' })
        return
      }
      if (request.segment !== undefined && typeof request.segment !== 'string') {
        sendJson(res, 400, { ok: false, reason: 'segment 必须是字符串' })
        return
      }
      const payload = await prepareVideo(
        { episode: request.episode, segment: request.segment, mode: request.mode },
        videoDeps(ctx, configured, ffmpegPath, jobs),
      )
      sendJson(res, 200, payload)
    },
  }
}

/** `POST /lingualab/video-cancel`: stop the running preparing job; its partial file is removed. */
export function videoCancelRoute(jobs: VideoJobs): WebRoute {
  return {
    kind: 'exact',
    path: VIDEO_CANCEL_PATH,
    handler: (req, res) => {
      if (!methodAllowed(req, res, ['POST'])) return
      const cancelled = jobs.cancel()
      const payload: VideoCancelPayload = { ok: true, cancelled, reason: cancelled ? null : '没有在准备的视频' }
      sendJson(res, 200, payload)
    },
  }
}
