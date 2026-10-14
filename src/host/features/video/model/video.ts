/**
 * What the host says about one segment's video, and starting the job that prepares it.
 *
 * The page asks one question per segment, "what do I do with this video?", and gets one of the
 * states in `VideoState`: it plays (as it is, or from the prepared copy in the hidden cache), it
 * needs preparing, it is being prepared, only its sound can be taken, nothing can be done with it, or
 * the host has no `ffmpeg` to find out. Everything that needs a decision about the file is `ffprobe`'s
 * to answer, through the pure planner in `video-plan.ts`, and the answer is remembered per file (path,
 * size and modification time) so polling a job does not probe the same file every second.
 *
 * The smooth version rides on top of that answer: whatever the file's state is, the status also says whether
 * 「准备流畅版」 can be offered (any file with a picture and a sound, the ones a browser cannot decode included),
 * whether 「改回原画质」 can (a smooth file is in the cache), and, while a smooth job runs, how far it has got. A
 * smooth job does not take the picture away: what plays keeps playing until the new file is in place.
 *
 * Videos exist only for folder episodes inside the library: preparing writes into the library, so a
 * file episode picked from elsewhere in the workspace has no video here, the same boundary subtitle
 * timing draws. The episode and segment named in a request are looked up in the scan, never joined
 * into a path as they come.
 */
import { existsSync, statSync, unlinkSync } from 'node:fs'
import { extname, join } from 'node:path'
import {
  MEDIA_PATH,
  VIDEO_CACHE_DIR,
  type EpisodeSegment,
  type VideoPrepareRequest,
  type VideoProgress,
  type VideoSmooth,
  type VideoStatusPayload,
} from '../../../../shared/protocol.ts'
import { stemOf } from '../../../../shared/stem.ts'
import { scanEpisode } from '../../../entities/episode/index.ts'
import { isFileEpisodeId } from '../../../entities/open-state/index.ts'
import { cacheDirOf, cacheFileName, cachePathFor, findCached, rememberDirect, type CachedFile } from '../../../entities/video-cache/index.ts'
import { installCommandFor, runToEnd, type Binaries, type Spawn } from '../../../shared/ffmpeg/index.ts'
import { isInside } from '../../../shared/fs/index.ts'
import {
  durationOf,
  estimateBytes,
  parseProbe,
  planSmooth,
  planVideo,
  probeArgs,
  smoothEstimateBytes,
  smoothEstimateSeconds,
  type PreparePlan,
  type ProbeResult,
  type VideoPlan,
} from '../lib/video-plan.ts'
import type { JobView, VideoJobs } from './video-jobs.ts'

/** Everything a video request needs from its surroundings. */
export interface VideoDeps {
  /** The library root. */
  readonly root: string
  /** The binaries, found now (the config may have changed since the last request), or `null`. */
  readonly binaries: () => Binaries | null
  readonly spawn: Spawn
  readonly jobs: VideoJobs
  readonly platform: NodeJS.Platform
}

/** One segment (or one whole episode) with the video it carries, resolved from the scan. */
interface Track {
  readonly episode: string
  readonly folder: string
  readonly stem: string
  readonly audio: string | null
  readonly videoFile: string
  readonly videoBytes: number | null
}

/** A difference in length below this is the ordinary noise of two containers, not a mismatch. */
const MISMATCH_SECONDS = 1

/** The status of a segment with nothing to say. */
function emptyStatus(ok: boolean, reason: string | null, state: VideoStatusPayload['state'] = 'none'): VideoStatusPayload {
  return {
    ok,
    reason,
    state,
    file: null,
    bytes: null,
    url: null,
    via: null,
    videoCodec: null,
    audioCodec: null,
    duration: null,
    mismatch: null,
    estimateBytes: null,
    progress: null,
    jobKind: null,
    smooth: { offer: false, estimateBytes: null, estimateSeconds: null, revert: false, error: null },
    installCommand: null,
  }
}

/** The URL a file under an episode folder is served from. */
function urlOf(episode: string, file: string, cached: boolean): string {
  const base = `${MEDIA_PATH}/${encodeURIComponent(episode)}`
  return cached ? `${base}/${VIDEO_CACHE_DIR}/${encodeURIComponent(file)}` : `${base}/${encodeURIComponent(file)}`
}

/** Whether an episode id can name a folder directly under the library: one plain name, not a file episode. */
function plainFolderName(id: string): boolean {
  return (
    id.length > 0 &&
    !isFileEpisodeId(id) &&
    !id.startsWith('.') &&
    !id.includes('/') &&
    !id.includes('\\') &&
    !id.includes('\0') &&
    id !== '..'
  )
}

/**
 * Find the segment a request names, and the video it carries.
 * @returns the track, or `null` when the episode, the segment or the video is not there.
 */
function locateTrack(root: string, episode: string, segment: string | undefined): Track | null {
  if (root.trim().length === 0 || !plainFolderName(episode)) return null
  const folder = join(root, episode)
  if (!existsSync(folder) || !isInside(root, folder)) return null
  let entry
  try {
    entry = scanEpisode(root, episode, episode)
  } catch {
    return null
  }
  let source: Pick<EpisodeSegment, 'id' | 'audio' | 'video'> | null
  if (entry.segments.length > 0) {
    source = (segment === undefined ? entry.segments[0] : entry.segments.find((item) => item.id === segment)) ?? null
  } else {
    // Without segments the folder is one stem; the entry has no id of its own for it.
    source = segment === undefined ? { id: '', audio: entry.audio, video: entry.video } : null
  }
  if (source === null || source.video === null) return null
  // A folder of one segment has no segment id: its stem is the audio file's, else the video's own.
  const stem = source.id.length > 0 ? source.id : stemOf(source.audio ?? source.video.file)
  return { episode, folder, stem, audio: source.audio, videoFile: source.video.file, videoBytes: source.video.bytes }
}

/** Probe results, per file as it is now, so a poll does not run `ffprobe` every second. */
const probeMemo = new Map<string, ProbeResult>()

/** The size and modification time that make a memo entry stale when the file changes. */
function fileKey(path: string): string | null {
  try {
    const stats = statSync(path)
    return `${path}|${String(stats.size)}|${String(stats.mtimeMs)}`
  } catch {
    return null
  }
}

/** Forget every probe; for tests. */
export function forgetProbes(): void {
  probeMemo.clear()
}

/** Probe one file, or answer `null` when `ffprobe` could not read it. */
async function probe(deps: VideoDeps, binaries: Binaries, path: string): Promise<ProbeResult | null> {
  const key = fileKey(path)
  if (key === null) return null
  const known = probeMemo.get(key)
  if (known !== undefined) return known
  const text = await runToEnd(deps.spawn, binaries.ffprobe, probeArgs(path))
  const result = text === null ? null : parseProbe(text)
  if (result !== null) probeMemo.set(key, result)
  return result
}

/** The job's progress as the page reads it. */
function progressOf(job: JobView): VideoProgress {
  const total = job.total ?? 0
  return {
    fraction: total > 0 ? Math.min(1, Math.max(0, job.seconds / total)) : 0,
    seconds: job.seconds,
    total,
  }
}

/** What a plan says, in the shape of the payload. */
function describePlan(plan: VideoPlan, track: Track): Partial<VideoStatusPayload> {
  const video = 'videoCodec' in plan ? plan.videoCodec : null
  return {
    duration: plan.duration,
    videoCodec: video,
    audioCodec: 'audioCodec' in plan ? plan.audioCodec : null,
    file: track.videoFile,
    bytes: track.videoBytes,
  }
}

/**
 * How much longer the video is than the segment's audio file, when the two differ by more than a second.
 * @returns the difference in seconds, rounded to a tenth, or `null`.
 */
async function mismatchOf(deps: VideoDeps, binaries: Binaries | null, track: Track, videoSeconds: number | null): Promise<number | null> {
  if (binaries === null || track.audio === null || videoSeconds === null) return null
  const audio = await probe(deps, binaries, join(track.folder, track.audio))
  const audioSeconds = audio === null ? null : durationOf(audio)
  if (audioSeconds === null) return null
  const difference = videoSeconds - audioSeconds
  return Math.abs(difference) > MISMATCH_SECONDS ? Math.round(difference * 10) / 10 : null
}

/** What the status of one segment is worked out from. */
interface StatusContext {
  readonly episode: string
  readonly track: Track
  readonly source: string
  readonly basis: VideoStatusPayload
  readonly deps: VideoDeps
  readonly binaries: Binaries | null
  readonly cached: CachedFile | null
  /** The last job for this segment when it failed, whatever it was making (except the smooth one, which the smooth field tells of). */
  readonly failed: JobView | null
}

/**
 * Say what the host knows about the video of one segment.
 * @param episode - the folder episode's id.
 * @param segment - the segment id, for an episode that has segments.
 * @param deps - the library, the binaries and the job runner.
 * @returns the status; never throws.
 */
export async function videoStatus(episode: string, segment: string | undefined, deps: VideoDeps): Promise<VideoStatusPayload> {
  const track = locateTrack(deps.root, episode, segment)
  if (track === null) return emptyStatus(true, null)
  const source = join(track.folder, track.videoFile)
  const basis = { ...emptyStatus(true, null), file: track.videoFile, bytes: track.videoBytes }

  const job = deps.jobs.has(track.folder, track.stem)
  const running = job !== null && job.phase === 'running' ? job : null
  if (running !== null && running.kind !== 'smooth') {
    return { ...basis, state: 'preparing', progress: progressOf(running), duration: running.total, jobKind: running.kind }
  }

  const binaries = deps.binaries()
  const cached = findCached(track.folder, track.stem, source)
  const failed = job !== null && job.phase === 'failed' && job.kind !== 'smooth' ? job : null
  const status = await settledStatus({ episode, track, source, basis, deps, binaries, cached, failed })

  const probed = binaries === null ? null : await probe(deps, binaries, source)
  const smoothPlan = probed === null ? null : planSmooth(probed)
  const smooth: VideoSmooth = {
    offer: smoothPlan !== null && cached?.kind !== 'smooth' && running === null,
    estimateBytes: smoothPlan === null ? null : smoothEstimateBytes(smoothPlan.duration),
    estimateSeconds: smoothPlan === null ? null : smoothEstimateSeconds(smoothPlan.duration),
    revert: cached?.kind === 'smooth',
    error: job !== null && job.phase === 'failed' && job.kind === 'smooth' ? job.error : null,
  }
  if (running === null) return { ...status, smooth, jobKind: status.state === 'failed' ? (failed?.kind ?? null) : null }
  // A smooth job runs. What plays keeps playing; only a segment with nothing to play yet is "being prepared".
  const keepsPlaying = status.state === 'playable' || status.state === 'sound-ready'
  return {
    ...status,
    smooth,
    state: keepsPlaying ? status.state : 'preparing',
    progress: progressOf(running),
    jobKind: 'smooth',
    duration: status.duration ?? running.total,
  }
}

/** The state of a segment's video, without the smooth version's offers and progress laid over it. */
async function settledStatus(context: StatusContext): Promise<VideoStatusPayload> {
  const { episode, track, source, basis, deps, binaries, cached, failed } = context
  const extension = extname(track.videoFile).slice(1).toLowerCase()

  // A prepared copy with its picture plays, the smooth one before the one that kept its size. The length check is the
  // source's, which is what either was made from.
  if (cached !== null && cached.kind !== 'sound') {
    const plan = binaries === null ? null : await planOf(deps, binaries, source, extension)
    const duration = plan === null ? null : plan.duration
    return {
      ...basis,
      state: 'playable',
      via: cached.kind === 'smooth' ? 'smooth' : 'prepared',
      url: urlOf(episode, cacheFileName(track.stem, cached.kind), true),
      duration,
      ...(plan === null ? {} : describePlan(plan, track)),
      mismatch: await mismatchOf(deps, binaries, track, duration),
    }
  }
  // Only the sound was kept: it is the segment's sound when the segment has no audio file of its own.
  if (cached !== null && cached.kind === 'sound' && track.audio === null) {
    return { ...basis, state: 'sound-ready', via: 'prepared', url: urlOf(episode, cacheFileName(track.stem, 'sound'), true) }
  }

  if (failed !== null) {
    return { ...basis, ok: false, state: 'failed', reason: failed.error ?? '没准备成功' }
  }

  if (binaries === null) {
    // Without ffprobe nothing can be verified. An mp4 or webm may still play as it is, and the page falls back
    // to the audio when the browser says it cannot; anything else is said to need ffmpeg.
    if (extension === 'mp4' || extension === 'webm') {
      return { ...basis, state: 'playable', via: 'direct', url: urlOf(episode, track.videoFile, false) }
    }
    return { ...basis, state: 'no-ffmpeg', installCommand: installCommandFor(deps.platform) }
  }

  const plan = await planOf(deps, binaries, source, extension)
  if (plan === null) {
    return { ...basis, ok: false, state: 'unplayable', reason: '读不了这个视频，ffprobe 没能解析它' }
  }
  const described = { ...basis, ...describePlan(plan, track) }
  switch (plan.kind) {
    case 'direct':
      rememberDirect(source)
      return {
        ...described,
        state: 'playable',
        via: 'direct',
        url: urlOf(episode, track.videoFile, false),
        mismatch: await mismatchOf(deps, binaries, track, plan.duration),
      }
    case 'remux':
      return { ...described, state: 'prepare', estimateBytes: estimateBytes(plan, track.videoBytes) }
    case 'audio-only':
      // The picture cannot be played. A segment with no audio of its own can still be studied by ear from the sound.
      return {
        ...described,
        state: track.audio === null ? 'sound-only' : 'unplayable',
        estimateBytes: estimateBytes(plan, track.videoBytes),
        reason: plan.reason === 'no-video' ? '这个文件里没有画面' : null,
      }
    case 'none':
      return { ...described, state: 'unplayable', reason: plan.reason === 'no-audio' ? '这个视频里没有声音轨' : '这个视频里没有可用的轨道' }
  }
}

/** Probe a source and plan it; `null` when it cannot be probed. */
async function planOf(deps: VideoDeps, binaries: Binaries, source: string, extension: string): Promise<VideoPlan | null> {
  const probed = await probe(deps, binaries, source)
  return probed === null ? null : planVideo(probed, extension)
}

/** Whether the cache folder, if it is there, really is inside the episode folder (not a link out of it). */
function cacheFolderSafe(folder: string): boolean {
  const directory = cacheDirOf(folder)
  return !existsSync(directory) || isInside(folder, directory)
}

/**
 * Start preparing one segment's video.
 *
 * The plan comes from the probe again rather than from the page: the page says only which segment and
 * what it wants (the picture, only the sound, the smooth version, or the original back), and the host
 * decides what that means for this file.
 * @param request - the parsed request body.
 * @param deps - the library, the binaries and the job runner.
 * @returns the status after the start: `preparing` when a job began, otherwise the reason it did not.
 */
export async function prepareVideo(request: VideoPrepareRequest, deps: VideoDeps): Promise<VideoStatusPayload> {
  const track = locateTrack(deps.root, request.episode, request.segment)
  if (track === null) return emptyStatus(false, '这一段没有视频')
  const source = join(track.folder, track.videoFile)
  const binaries = deps.binaries()
  if (binaries === null) return { ...(await videoStatus(request.episode, request.segment, deps)), ok: false }

  /** The status as it is, with the reason nothing was started. */
  const refuse = async (reason: string): Promise<VideoStatusPayload> => ({
    ...(await videoStatus(request.episode, request.segment, deps)),
    ok: false,
    reason,
  })

  const probed = await probe(deps, binaries, source)
  if (probed === null) return emptyStatus(false, '读不了这个视频，ffprobe 没能解析它', 'unplayable')
  const plan = planVideo(probed, extname(track.videoFile).slice(1).toLowerCase())

  if (request.mode === 'original') return revertSmooth(request, deps, track, source, plan)

  let chosen: PreparePlan
  if (request.mode === 'smooth') {
    if (findCached(track.folder, track.stem, source)?.kind === 'smooth') return refuse('已经是流畅版了')
    const smooth = planSmooth(probed)
    if (smooth === null) return refuse('这个视频没有画面或者没有声音，做不了流畅版')
    chosen = smooth
  } else {
    if (plan.kind === 'direct' || plan.kind === 'none') return videoStatus(request.episode, request.segment, deps)
    if (request.mode === 'sound') {
      const audioIndex = plan.audioIndex
      chosen = { kind: 'audio-only', duration: plan.duration, audioIndex, videoCodec: plan.videoCodec, audioCodec: plan.audioCodec, reason: 'video-codec' }
    } else if (plan.kind === 'remux') {
      chosen = plan
    } else {
      return refuse('这个画面浏览器解不了，只能准备声音，或者准备流畅版')
    }
  }

  if (!cacheFolderSafe(track.folder)) return refuse('缓存文件夹指到剧集文件夹外面了')
  const started = deps.jobs.start({ folder: track.folder, stem: track.stem, source, plan: chosen, ffmpeg: binaries.ffmpeg })
  if (!started.ok) return refuse(started.message)
  return videoStatus(request.episode, request.segment, deps)
}

/**
 * Go back from the smooth version: delete its file, and prepare the file as it was before.
 *
 * A source that plays as it is needs nothing more, and one whose picture a browser cannot decode goes back to what it
 * was (the sound, or nothing). One that was prepared by remuxing is prepared again, which is a minute of work through
 * the same job queue. Nothing is deleted while a job runs, since that job may be writing the file that replaces it.
 */
async function revertSmooth(request: VideoPrepareRequest, deps: VideoDeps, track: Track, source: string, plan: VideoPlan): Promise<VideoStatusPayload> {
  const again = (): Promise<VideoStatusPayload> => videoStatus(request.episode, request.segment, deps)
  const refuse = async (reason: string): Promise<VideoStatusPayload> => ({ ...(await again()), ok: false, reason })
  if (findCached(track.folder, track.stem, source)?.kind !== 'smooth') return again()
  if (deps.jobs.busy()) return refuse('正在准备另一个视频，等它做完或者先取消')
  if (!cacheFolderSafe(track.folder)) return refuse('缓存文件夹指到剧集文件夹外面了')
  try {
    unlinkSync(cachePathFor(track.folder, track.stem, 'smooth'))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') return refuse(`没能删掉流畅版：${String(error)}`)
  }
  const binaries = deps.binaries()
  if (plan.kind === 'remux' && binaries !== null) {
    const started = deps.jobs.start({ folder: track.folder, stem: track.stem, source, plan, ffmpeg: binaries.ffmpeg })
    if (!started.ok) return refuse(started.message)
  }
  return again()
}
