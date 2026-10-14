/**
 * The preparing job's lifecycle, with a fake ffmpeg: start, progress, cancel, the `.part` that is
 * renamed into place, the stale `.part` that the next job clears, and the single job at a time.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cacheDirOf, cachePathFor } from '../../../entities/video-cache/index.ts'
import { makeTempDir, fakeSpawn } from '../../../shared/testing/index.ts'
import type { PreparePlan } from '../lib/video-plan.ts'
import { createVideoJobs, realJobHost, type JobHost, type JobSpec } from './video-jobs.ts'

let folder = ''

beforeEach(() => {
  folder = makeTempDir('lingualab-jobs-')
  writeFileSync(join(folder, 'a.mkv'), 'video')
})

afterEach(() => {
  rmSync(folder, { recursive: true, force: true })
})

const REMUX: PreparePlan = {
  kind: 'remux',
  duration: 100,
  videoIndex: 0,
  audioIndex: 1,
  videoCodec: 'h264',
  audioCodec: 'dts',
}

const SMOOTH: PreparePlan = { kind: 'smooth', duration: 100, videoIndex: 0, audioIndex: 1, videoCodec: 'h264', audioCodec: 'dts' }

/** A machine that records whom it was asked to slow down. */
function recordingHost(cores = 8): JobHost & { readonly lowered: number[] } {
  const lowered: number[] = []
  return { cores, lowered, lowerPriority: (pid) => lowered.push(pid) }
}

const SOUND: PreparePlan = { kind: 'audio-only', duration: 100, audioIndex: 1, videoCodec: 'hevc', audioCodec: 'eac3', reason: 'video-codec' }

/** A job for the segment `a`. */
function spec(plan: PreparePlan = REMUX): JobSpec {
  return { folder, stem: 'a', source: join(folder, 'a.mkv'), plan, ffmpeg: 'ffmpeg' }
}

describe('a job that succeeds', () => {
  it('writes a .part, reports progress, and renames it into place when ffmpeg exits cleanly', async () => {
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)

    const started = jobs.start(spec())
    expect(started.ok).toBe(true)
    const call = fake.ffmpeg[0]
    expect(call?.output).toBe(`${cachePathFor(folder, 'a', 'video')}.part`)
    expect(jobs.has(folder, 'a')?.phase).toBe('running')

    writeFileSync(call?.output ?? '', 'half')
    call?.child.say('frame=10\nout_time_us=25000000\nprogress=continue\nout_time_us=50')
    await new Promise((resolve) => setImmediate(resolve))
    expect(jobs.current()?.seconds).toBe(25)
    // The last line has no newline yet, so it is not a position.
    call?.child.say('000000\n')
    await new Promise((resolve) => setImmediate(resolve))
    expect(jobs.current()?.seconds).toBe(50)

    writeFileSync(call?.output ?? '', 'whole file')
    call?.child.finish(0)
    await jobs.settled()

    const final = cachePathFor(folder, 'a', 'video')
    expect(readFileSync(final, 'utf8')).toBe('whole file')
    expect(existsSync(`${final}.part`)).toBe(false)
    expect(jobs.current()).toMatchObject({ phase: 'done', kind: 'video', seconds: 100 })
    // The source is untouched.
    expect(readFileSync(join(folder, 'a.mkv'), 'utf8')).toBe('video')
  })

  it('keeps the sound of a sound-only plan as an .m4a', async () => {
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)
    jobs.start(spec(SOUND))
    const call = fake.ffmpeg[0]
    expect(call?.output).toBe(`${cachePathFor(folder, 'a', 'sound')}.part`)
    writeFileSync(call?.output ?? '', 'sound')
    call?.child.finish(0)
    await jobs.settled()
    expect(readFileSync(cachePathFor(folder, 'a', 'sound'), 'utf8')).toBe('sound')
  })

  it('hands ffmpeg an argument list, with the source and the .part in it', () => {
    const fake = fakeSpawn(() => null)
    createVideoJobs(fake.spawn).start(spec())
    const args = fake.ffmpeg[0]?.args ?? []
    expect(args).toContain(join(folder, 'a.mkv'))
    expect(args).toContain('-c:v')
    expect(fake.ffmpeg[0]?.command).toBe('ffmpeg')
  })
})

describe('a job that fails', () => {
  it('removes its .part and keeps the end of what ffmpeg said', async () => {
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)
    jobs.start(spec())
    const call = fake.ffmpeg[0]
    writeFileSync(call?.output ?? '', 'half')
    call?.child.stderr.write('Invalid data found when processing input')
    call?.child.finish(1)
    await jobs.settled()

    expect(jobs.current()).toMatchObject({ phase: 'failed', error: 'Invalid data found when processing input' })
    expect(readdirSync(cacheDirOf(folder))).toEqual([])
  })

  it('counts a clean exit that wrote nothing as a failure', async () => {
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)
    jobs.start(spec())
    fake.ffmpeg[0]?.child.finish(0)
    await jobs.settled()
    expect(jobs.current()?.phase).toBe('failed')
    expect(existsSync(cachePathFor(folder, 'a', 'video'))).toBe(false)
  })

  it('reports an ffmpeg that cannot start, both at once and as an error event', async () => {
    const refusing = createVideoJobs(fakeSpawn(() => null, { failToStart: true }).spawn)
    expect(refusing.start(spec())).toMatchObject({ ok: false, reason: 'failed' })
    expect(refusing.current()).toBeNull()

    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)
    jobs.start(spec())
    fake.ffmpeg[0]?.child.emit('error', new Error('spawn ENOENT'))
    await jobs.settled()
    expect(jobs.current()).toMatchObject({ phase: 'failed' })
  })

  it('lets a new job start after a failed one, and forgets the failure', async () => {
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)
    jobs.start(spec())
    fake.ffmpeg[0]?.child.finish(1)
    await jobs.settled()
    expect(jobs.start(spec()).ok).toBe(true)
    expect(jobs.current()?.phase).toBe('running')
    fake.ffmpeg[1]?.child.finish(1)
    await jobs.settled()
  })
})

describe('one job at a time', () => {
  it('refuses a second job while one runs, and takes one when it is over', async () => {
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)
    expect(jobs.start(spec()).ok).toBe(true)
    const second = jobs.start({ ...spec(), stem: 'b' })
    expect(second).toMatchObject({ ok: false, reason: 'busy' })
    expect(fake.ffmpeg).toHaveLength(1)

    writeFileSync(fake.ffmpeg[0]?.output ?? '', 'x')
    fake.ffmpeg[0]?.child.finish(0)
    await jobs.settled()
    expect(jobs.start({ ...spec(), stem: 'b' }).ok).toBe(true)
    fake.ffmpeg[1]?.child.finish(1)
    await jobs.settled()
  })

  it('answers has() only for the segment the job is about', () => {
    const jobs = createVideoJobs(fakeSpawn(() => null).spawn)
    jobs.start(spec())
    expect(jobs.has(folder, 'a')).not.toBeNull()
    expect(jobs.has(folder, 'b')).toBeNull()
    expect(jobs.has(join(folder, 'other'), 'a')).toBeNull()
    jobs.cancel()
  })
})

describe('cancelling', () => {
  it('kills the process, removes the .part once the process has closed, and leaves no trace of the job', async () => {
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)
    jobs.start(spec())
    const call = fake.ffmpeg[0]
    writeFileSync(call?.output ?? '', 'half')

    expect(jobs.cancel()).toBe(true)
    expect(call?.child.killed).toBe(true)
    await jobs.settled()

    expect(existsSync(call?.output ?? '')).toBe(false)
    expect(existsSync(cachePathFor(folder, 'a', 'video'))).toBe(false)
    expect(jobs.current()).toBeNull()
    expect(jobs.start(spec()).ok).toBe(true)
    fake.ffmpeg[1]?.child.finish(1)
    await jobs.settled()
  })

  it('is false when nothing is running', () => {
    expect(createVideoJobs(fakeSpawn(() => null).spawn).cancel()).toBe(false)
  })

  it('does not rename a file when the cancel raced a clean exit', async () => {
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)
    jobs.start(spec())
    const call = fake.ffmpeg[0]
    writeFileSync(call?.output ?? '', 'whole')
    jobs.cancel()
    call?.child.finish(0)
    await jobs.settled()
    expect(existsSync(cachePathFor(folder, 'a', 'video'))).toBe(false)
  })
})

describe('stale .part files', () => {
  it('clears every .part in the cache folder when a job starts, and nothing else', async () => {
    const directory = cacheDirOf(folder)
    mkdirSync(directory, { recursive: true })
    writeFileSync(join(directory, 'old.mp4.part'), 'crashed')
    writeFileSync(join(directory, 'other.m4a.part'), 'crashed too')
    writeFileSync(join(directory, 'kept.mp4'), 'a finished file')

    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn)
    jobs.start(spec())
    expect(readdirSync(directory)).toEqual(['kept.mp4'])
    fake.ffmpeg[0]?.child.finish(1)
    await jobs.settled()
  })
})

describe('the smooth version', () => {
  it('writes <stem>.smooth.mp4 through a .part, and deletes the full-size prepared mp4 once it is in place', async () => {
    mkdirSync(cacheDirOf(folder), { recursive: true })
    writeFileSync(cachePathFor(folder, 'a', 'video'), 'full-size')
    writeFileSync(cachePathFor(folder, 'a', 'sound'), 'sound')
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn, recordingHost())
    jobs.start(spec(SMOOTH))
    const call = fake.ffmpeg[0]
    const final = cachePathFor(folder, 'a', 'smooth')
    expect(final.endsWith(`a.smooth.mp4`)).toBe(true)
    expect(call?.output).toBe(`${final}.part`)

    // The full-size file stays until the smooth one is whole.
    writeFileSync(call?.output ?? '', 'smooth')
    expect(existsSync(cachePathFor(folder, 'a', 'video'))).toBe(true)
    call?.child.finish(0)
    await jobs.settled()

    expect(readFileSync(final, 'utf8')).toBe('smooth')
    expect(existsSync(`${final}.part`)).toBe(false)
    expect(existsSync(cachePathFor(folder, 'a', 'video'))).toBe(false)
    // The sound-only file is another thing, and the source is never touched.
    expect(existsSync(cachePathFor(folder, 'a', 'sound'))).toBe(true)
    expect(readFileSync(join(folder, 'a.mkv'), 'utf8')).toBe('video')
    expect(jobs.current()).toMatchObject({ phase: 'done', kind: 'smooth', seconds: 100 })
  })

  it('keeps the full-size file when the job fails or is cancelled', async () => {
    mkdirSync(cacheDirOf(folder), { recursive: true })
    writeFileSync(cachePathFor(folder, 'a', 'video'), 'full-size')
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn, recordingHost())

    jobs.start(spec(SMOOTH))
    fake.ffmpeg[0]?.child.stderr.write('Error while encoding')
    fake.ffmpeg[0]?.child.finish(1)
    await jobs.settled()
    expect(jobs.current()).toMatchObject({ phase: 'failed', kind: 'smooth', error: 'Error while encoding' })
    expect(readFileSync(cachePathFor(folder, 'a', 'video'), 'utf8')).toBe('full-size')

    jobs.start(spec(SMOOTH))
    writeFileSync(fake.ffmpeg[1]?.output ?? '', 'half')
    jobs.cancel()
    await jobs.settled()
    expect(readFileSync(cachePathFor(folder, 'a', 'video'), 'utf8')).toBe('full-size')
    expect(readdirSync(cacheDirOf(folder))).toEqual(['a.mp4'])
  })

  it('runs ffmpeg at a lower priority with one thread fewer than there are cores', () => {
    const fake = fakeSpawn(() => null, { pid: 4242 })
    const host = recordingHost(8)
    createVideoJobs(fake.spawn, host).start(spec(SMOOTH))
    expect(host.lowered).toEqual([4242])
    const args = fake.ffmpeg[0]?.args ?? []
    expect(args[args.indexOf('-threads') + 1]).toBe('7')
    expect(args).toContain('libx264')
  })

  it('leaves one thread on a machine with one core, and leaves the other jobs at the usual priority', () => {
    const fake = fakeSpawn(() => null, { pid: 4242 })
    const host = recordingHost(1)
    const jobs = createVideoJobs(fake.spawn, host)
    jobs.start(spec(SMOOTH))
    expect(fake.ffmpeg[0]?.args[(fake.ffmpeg[0]?.args.indexOf('-threads') ?? 0) + 1]).toBe('1')
    jobs.cancel()

    const other = fakeSpawn(() => null, { pid: 99 })
    const quiet = recordingHost()
    createVideoJobs(other.spawn, quiet).start(spec(REMUX))
    expect(quiet.lowered).toEqual([])
  })

  it('swallows a refusal to lower the priority: the real host only costs time then', () => {
    // No process has this id, so the system refuses, and nothing may come of it.
    expect(() => realJobHost.lowerPriority(2 ** 30)).not.toThrow()
    expect(realJobHost.cores).toBeGreaterThanOrEqual(1)
  })

  it('says whether a job is running', async () => {
    const fake = fakeSpawn(() => null)
    const jobs = createVideoJobs(fake.spawn, recordingHost())
    expect(jobs.busy()).toBe(false)
    jobs.start(spec(SMOOTH))
    expect(jobs.busy()).toBe(true)
    fake.ffmpeg[0]?.child.finish(1)
    await jobs.settled()
    expect(jobs.busy()).toBe(false)
  })
})
