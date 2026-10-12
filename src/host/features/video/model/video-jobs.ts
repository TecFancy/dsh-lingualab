/**
 * The one job that prepares a video: start, progress, cancel, and a file that is whole or absent.
 *
 * Preparing is an ffmpeg process that runs for as long as it takes to read a file, so it cannot be a
 * request. It is a job the host owns, and the page polls it. The rules are short and each one
 * answers a way it could go wrong:
 *
 *   · **One at a time.** A second request while one runs is answered `busy`, not queued: the reader
 *     is waiting on a particular segment, and a queue behind a gigabyte is a silent wait.
 *   · **A write is whole or absent.** The output goes to `<name>.part` and is renamed to its final
 *     name only when ffmpeg has exited cleanly and left something behind. A failed or cancelled job
 *     removes its `.part`, and a `.part` that a crash or a restart left is cleared the next time a job
 *     starts in that folder (there is only ever one job, so any `.part` found then is stale).
 *   · **Cancel is real.** The process is killed, and the `.part` is removed once the process has let go
 *     of it (Windows will not delete an open file), so cancelling never leaves a half file that
 *     looks finished.
 *   · **The source is never touched.** Only the hidden cache folder is written.
 *
 * Starting a process goes through an injected {@link Spawn}, so the lifecycle is tested with a fake.
 */
import { mkdirSync, readdirSync, renameSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { cacheDirOf, cachePathFor, type CacheKind } from '../../../entities/video-cache/index.ts'
import type { Spawn } from '../../../shared/ffmpeg/index.ts'
import { ffmpegArgs, progressSeconds, type PreparePlan } from '../lib/video-plan.ts'

/** What a job needs to start. */
export interface JobSpec {
  /** The episode folder and the segment stem: also the job's identity, so the page can tell whose it is. */
  readonly folder: string
  readonly stem: string
  /** The source video, absolute. */
  readonly source: string
  readonly plan: PreparePlan
  readonly ffmpeg: string
}

/** Where a job is. */
export type JobPhase = 'running' | 'done' | 'failed' | 'cancelled'

/** A job as the status route reports it. */
export interface JobView {
  readonly folder: string
  readonly stem: string
  readonly phase: JobPhase
  /** Seconds of the video done, and its length when known. */
  readonly seconds: number
  readonly total: number | null
  /** What went wrong, for `failed`. */
  readonly error: string | null
  readonly kind: CacheKind
}

/** The answer to a start. */
export type StartResult =
  | { readonly ok: true; readonly job: JobView }
  | { readonly ok: false; readonly reason: 'busy' | 'failed'; readonly message: string }

/** The job runner. */
export interface VideoJobs {
  /** Start a job, unless one is running. */
  start: (spec: JobSpec) => StartResult
  /** The running job, else the last one that finished, else `null`. */
  current: () => JobView | null
  /** Whether a job for this folder and stem is the current one, whatever its phase. */
  has: (folder: string, stem: string) => JobView | null
  /** Stop the running job. Returns whether there was one. */
  cancel: () => boolean
  /** Resolves when no job is running; for tests and for shutdown. */
  settled: () => Promise<void>
}

/** How much of ffmpeg's stderr is kept to say why a job failed. */
const ERROR_TAIL_CHARS = 600

/** Remove a file and say nothing if it is already gone. */
function quietUnlink(path: string): void {
  try {
    unlinkSync(path)
  } catch {
    // Gone already, or never made.
  }
}

/** Remove every `.part` in a cache folder: with one job at a time, any found when a job starts is stale. */
export function sweepParts(directory: string): void {
  let names: string[]
  try {
    names = readdirSync(directory)
  } catch {
    return
  }
  for (const name of names) {
    if (name.endsWith('.part')) quietUnlink(join(directory, name))
  }
}

/** Whether a file exists and has something in it. */
function nonEmpty(path: string): boolean {
  try {
    return statSync(path).size > 0
  } catch {
    return false
  }
}

/**
 * Make the job runner.
 * @param spawnFn - how a process is started; the real one in the host, a fake in tests.
 */
export function createVideoJobs(spawnFn: Spawn): VideoJobs {
  interface Running {
    view: JobView
    cancelRequested: boolean
    done: Promise<void>
    kill: () => void
  }
  let running: Running | null = null
  let last: JobView | null = null

  const start = (spec: JobSpec): StartResult => {
    if (running !== null) return { ok: false, reason: 'busy', message: '正在准备另一个视频，等它做完或者先取消' }

    const kind: CacheKind = spec.plan.kind === 'remux' ? 'video' : 'sound'
    const final = cachePathFor(spec.folder, spec.stem, kind)
    const part = `${final}.part`
    try {
      mkdirSync(cacheDirOf(spec.folder), { recursive: true })
    } catch (error) {
      return { ok: false, reason: 'failed', message: `缓存文件夹建不出来：${String(error)}` }
    }
    sweepParts(cacheDirOf(spec.folder))

    let child: ReturnType<Spawn>
    try {
      child = spawnFn(spec.ffmpeg, ffmpegArgs(spec.plan, spec.source, part))
    } catch (error) {
      return { ok: false, reason: 'failed', message: `ffmpeg 没能启动：${String(error)}` }
    }

    const base = { folder: spec.folder, stem: spec.stem, total: spec.plan.duration, kind }
    const record: Running = {
      view: { ...base, phase: 'running', seconds: 0, error: null },
      cancelRequested: false,
      done: Promise.resolve(),
      kill: () => child.kill(),
    }
    running = record
    last = null

    let tail = ''
    let buffer = ''
    child.stdout?.on('data', (chunk: Buffer | string) => {
      buffer += String(chunk)
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const seconds = progressSeconds(line)
        if (seconds !== null && running === record) record.view = { ...record.view, seconds }
      }
    })
    child.stderr?.on('data', (chunk: Buffer | string) => {
      tail = (tail + String(chunk)).slice(-ERROR_TAIL_CHARS)
    })

    record.done = new Promise<void>((resolve) => {
      let finished = false
      const finish = (phase: JobPhase, error: string | null): void => {
        if (finished) return
        finished = true
        // The `.part` goes first and the rename last: whatever happens, no half file keeps a real name.
        const view: JobView = { ...record.view, phase, error, seconds: phase === 'done' ? (record.view.total ?? record.view.seconds) : record.view.seconds }
        last = phase === 'cancelled' ? null : view
        running = null
        resolve()
      }
      child.on('error', (error) => {
        quietUnlink(part)
        finish('failed', `ffmpeg 没能启动：${error.message}`)
      })
      child.on('close', (code) => {
        if (record.cancelRequested) {
          quietUnlink(part)
          finish('cancelled', null)
          return
        }
        if (code === 0 && nonEmpty(part)) {
          try {
            renameSync(part, final)
          } catch (error) {
            quietUnlink(part)
            finish('failed', `没能放到位：${String(error)}`)
            return
          }
          finish('done', null)
          return
        }
        quietUnlink(part)
        const reason = tail.trim().length > 0 ? tail.trim() : `ffmpeg 退出码 ${String(code)}`
        finish('failed', reason)
      })
    })
    return { ok: true, job: record.view }
  }

  const current = (): JobView | null => (running === null ? last : running.view)

  return {
    start,
    current,
    has: (folder, stem) => {
      const view = current()
      return view !== null && view.folder === folder && view.stem === stem ? view : null
    },
    cancel: () => {
      if (running === null) return false
      running.cancelRequested = true
      running.kill()
      return true
    },
    settled: async () => {
      while (running !== null) await running.done
    },
  }
}
