/**
 * What the host says about a segment's video, and what starting a job does, with a fake ffmpeg and ffprobe.
 */
import { existsSync, mkdirSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { scanLibrary } from '../../../entities/episode/index.ts'
import { cachePathFor, forgetDirect } from '../../../entities/video-cache/index.ts'
import type { Binaries } from '../../../shared/ffmpeg/index.ts'
import {
  makeTempDir,
  MKV_H264_DTS,
  MKV_HEVC,
  MP4_DIRECT,
  audioProbe,
  fakeSpawn,
  type FakeSpawn,
} from '../../../shared/testing/index.ts'
import { createVideoJobs, type VideoJobs } from './video-jobs.ts'
import { forgetProbes, prepareVideo, videoStatus, type VideoDeps } from './video.ts'

let root = ''

const BINARIES: Binaries = { ffmpeg: 'ffmpeg', ffprobe: 'ffprobe' }

beforeEach(() => {
  root = makeTempDir('lingualab-video-')
  forgetProbes()
  forgetDirect()
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** Write files (with some content each) into an episode folder under the root. */
function folder(id: string, names: readonly string[]): string {
  const directory = join(root, id)
  mkdirSync(directory, { recursive: true })
  for (const name of names) writeFileSync(join(directory, name), `content of ${name}`)
  return directory
}

interface Setup {
  readonly deps: VideoDeps
  readonly fake: FakeSpawn
  readonly jobs: VideoJobs
}

/** Deps over the root; `probes` answers ffprobe by file name, `binaries` is what the config finds. */
function setup(probes: Readonly<Record<string, object>>, binaries: Binaries | null = BINARIES): Setup {
  const fake = fakeSpawn((path) => probes[path.split(/[\\/]/).pop() ?? ''] ?? null)
  const jobs = createVideoJobs(fake.spawn)
  return { deps: { root, binaries: () => binaries, spawn: fake.spawn, jobs, platform: 'win32' }, fake, jobs }
}

describe('an episode with no video, or no way to name one', () => {
  it('says there is none', async () => {
    folder('S01E01', ['a.mp3'])
    const { deps } = setup({})
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ ok: true, state: 'none', url: null })
  })

  it('answers none for a file episode, a missing folder, and ids that try to leave the library', async () => {
    const { deps } = setup({})
    for (const id of ['file.abc123', 'missing', '..', '../x', '.hidden', 'a/b', 'a\\b', '']) {
      expect(await videoStatus(id, undefined, deps)).toMatchObject({ state: 'none' })
    }
  })

  it('refuses to prepare what is not there', async () => {
    folder('S01E01', ['a.mp3'])
    const { deps, fake } = setup({})
    expect(await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)).toMatchObject({ ok: false, state: 'none' })
    expect(fake.ffmpeg).toHaveLength(0)
  })
})

describe('a video that plays as it is', () => {
  it('is playable at its own URL, with nothing written', async () => {
    const directory = folder('S01E01', ['a.mp3', 'a.mp4'])
    const { deps } = setup({ 'a.mp4': MP4_DIRECT, 'a.mp3': audioProbe(60) })
    const status = await videoStatus('S01E01', undefined, deps)
    expect(status).toMatchObject({
      ok: true,
      state: 'playable',
      via: 'direct',
      url: '/lingualab/media/S01E01/a.mp4',
      file: 'a.mp4',
      duration: 60,
      mismatch: null,
    })
    expect(existsSync(join(directory, '.lingualab'))).toBe(false)
  })

  it('makes the library scan say ready from then on', async () => {
    folder('S01E01', ['a.mp3', 'a.mp4'])
    expect(scanLibrary(root).episodes[0]?.video?.state).toBe('unprepared')
    await videoStatus('S01E01', undefined, setup({ 'a.mp4': MP4_DIRECT }).deps)
    expect(scanLibrary(root).episodes[0]?.video?.state).toBe('ready')
  })

  it('says how much longer the video is than the audio, when it is more than a second', async () => {
    folder('S01E01', ['a.mp3', 'a.mp4'])
    expect(await videoStatus('S01E01', undefined, setup({ 'a.mp4': MP4_DIRECT, 'a.mp3': audioProbe(57.6) }).deps)).toMatchObject({
      mismatch: 2.4,
    })
    forgetProbes()
    expect(await videoStatus('S01E01', undefined, setup({ 'a.mp4': MP4_DIRECT, 'a.mp3': audioProbe(60.8) }).deps)).toMatchObject({
      mismatch: null,
    })
    forgetProbes()
    expect(await videoStatus('S01E01', undefined, setup({ 'a.mp4': MP4_DIRECT, 'a.mp3': audioProbe(63) }).deps)).toMatchObject({
      mismatch: -3,
    })
  })

  it('probes a file once, not once per request', async () => {
    folder('S01E01', ['a.mp4'])
    const { deps, fake } = setup({ 'a.mp4': MP4_DIRECT })
    await videoStatus('S01E01', undefined, deps)
    await videoStatus('S01E01', undefined, deps)
    expect(fake.probed.filter((path) => path.endsWith('a.mp4'))).toHaveLength(1)
  })

  it('plays an mp4 or webm without ffprobe, and says an mkv needs ffmpeg, with the command to install it', async () => {
    folder('S01E01', ['a.mp4'])
    folder('S01E02', ['b.mkv'])
    const { deps } = setup({}, null)
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ state: 'playable', via: 'direct' })
    expect(await videoStatus('S01E02', undefined, deps)).toMatchObject({
      state: 'no-ffmpeg',
      installCommand: 'winget install Gyan.FFmpeg',
    })
  })
})

describe('a video that needs preparing', () => {
  /** The real sample's shape: a Matroska file with DTS sound next to an mp3 and a subtitle. */
  function sample(): string {
    return folder('S01E01', ['MDJT S01E01.mkv', 'MDJT S01E01.mp3', 'MDJT S01E01.en.srt'])
  }

  it('is asked for, with the size it will take', async () => {
    sample()
    const { deps } = setup({ 'MDJT S01E01.mkv': MKV_H264_DTS })
    const status = await videoStatus('S01E01', undefined, deps)
    expect(status).toMatchObject({
      state: 'prepare',
      file: 'MDJT S01E01.mkv',
      videoCodec: 'h264',
      audioCodec: 'dts',
      duration: 1379.42,
      url: null,
    })
    expect(status.estimateBytes).toBe(status.bytes)
  })

  it('starts one job writing the .part, reports progress, and plays the prepared file when it is done', async () => {
    const directory = sample()
    const { deps, fake, jobs } = setup({ 'MDJT S01E01.mkv': MKV_H264_DTS })

    const started = await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)
    expect(started.state).toBe('preparing')
    const call = fake.ffmpeg[0]
    expect(call?.args).toContain(join(directory, 'MDJT S01E01.mkv'))
    expect(call?.output).toBe(`${cachePathFor(directory, 'MDJT S01E01', 'video')}.part`)

    call?.child.say('out_time_us=689710000\n')
    await new Promise((resolve) => setImmediate(resolve))
    const running = await videoStatus('S01E01', undefined, deps)
    expect(running.state).toBe('preparing')
    expect(running.progress?.fraction).toBeCloseTo(0.5, 2)
    expect(running.progress?.total).toBe(1379.42)

    writeFileSync(call?.output ?? '', 'the prepared video')
    call?.child.finish(0)
    await jobs.settled()

    const done = await videoStatus('S01E01', undefined, deps)
    expect(done).toMatchObject({
      state: 'playable',
      via: 'prepared',
      url: '/lingualab/media/S01E01/.lingualab/MDJT%20S01E01.mp4',
    })
    expect(scanLibrary(root).episodes[0]?.video?.state).toBe('ready')
  })

  it('refuses a second job while one runs, and says so', async () => {
    sample()
    folder('S01E02', ['b.mkv'])
    const { deps, fake, jobs } = setup({ 'MDJT S01E01.mkv': MKV_H264_DTS, 'b.mkv': MKV_H264_DTS })
    await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)
    const second = await prepareVideo({ episode: 'S01E02', mode: 'video' }, deps)
    expect(second).toMatchObject({ ok: false, state: 'prepare' })
    expect(second.reason).toContain('正在准备')
    expect(fake.ffmpeg).toHaveLength(1)
    jobs.cancel()
    await jobs.settled()
  })

  it('cancels a running job and goes back to asking for it', async () => {
    const directory = sample()
    const { deps, fake, jobs } = setup({ 'MDJT S01E01.mkv': MKV_H264_DTS })
    await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)
    writeFileSync(fake.ffmpeg[0]?.output ?? '', 'half')
    jobs.cancel()
    await jobs.settled()
    expect(existsSync(`${cachePathFor(directory, 'MDJT S01E01', 'video')}.part`)).toBe(false)
    expect((await videoStatus('S01E01', undefined, deps)).state).toBe('prepare')
  })

  it('reports a failed job with the reason, until it is tried again', async () => {
    sample()
    const { deps, fake, jobs } = setup({ 'MDJT S01E01.mkv': MKV_H264_DTS })
    await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)
    fake.ffmpeg[0]?.child.stderr.write('Disk full')
    fake.ffmpeg[0]?.child.finish(1)
    await jobs.settled()
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ ok: false, state: 'failed', reason: 'Disk full' })
    expect((await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)).state).toBe('preparing')
    jobs.cancel()
    await jobs.settled()
  })

  it('does not trust a prepared copy older than its source', async () => {
    const directory = sample()
    const { deps } = setup({ 'MDJT S01E01.mkv': MKV_H264_DTS })
    const cached = cachePathFor(directory, 'MDJT S01E01', 'video')
    mkdirSync(join(directory, '.lingualab'))
    writeFileSync(cached, 'old prepared copy')
    const past = new Date(Date.now() - 60_000)
    utimesSync(cached, past, past)
    expect((await videoStatus('S01E01', undefined, deps)).state).toBe('prepare')
    const future = new Date(Date.now() + 60_000)
    utimesSync(cached, future, future)
    expect((await videoStatus('S01E01', undefined, deps)).state).toBe('playable')
  })

  it('says it needs ffmpeg when there is none, and starts nothing', async () => {
    sample()
    const { deps, fake } = setup({}, null)
    expect(await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)).toMatchObject({ ok: false, state: 'no-ffmpeg' })
    expect(fake.ffmpeg).toHaveLength(0)
  })

  it('does not start a job when the cache folder is a link out of the episode folder', async () => {
    const directory = sample()
    const outside = makeTempDir('lingualab-video-outside-')
    try {
      const { symlinkSync } = await import('node:fs')
      symlinkSync(outside, join(directory, '.lingualab'), 'junction')
    } catch {
      rmSync(outside, { recursive: true, force: true })
      return
    }
    const { deps, fake } = setup({ 'MDJT S01E01.mkv': MKV_H264_DTS })
    const answer = await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)
    rmSync(outside, { recursive: true, force: true })
    expect(answer.ok).toBe(false)
    expect(fake.ffmpeg).toHaveLength(0)
  })
})

describe('a picture a browser cannot decode', () => {
  it('offers only the sound for a segment with no audio file of its own, and then plays it from the cache', async () => {
    const directory = folder('S01E01', ['only.mkv'])
    const { deps, fake, jobs } = setup({ 'only.mkv': MKV_HEVC })
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ state: 'sound-only', videoCodec: 'hevc' })

    // The picture cannot be prepared, only the sound.
    expect(await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)).toMatchObject({ ok: false, state: 'sound-only' })
    expect(fake.ffmpeg).toHaveLength(0)

    expect((await prepareVideo({ episode: 'S01E01', mode: 'sound' }, deps)).state).toBe('preparing')
    expect(fake.ffmpeg[0]?.output).toBe(`${cachePathFor(directory, 'only', 'sound')}.part`)
    writeFileSync(fake.ffmpeg[0]?.output ?? '', 'sound only')
    fake.ffmpeg[0]?.child.finish(0)
    await jobs.settled()
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({
      state: 'sound-ready',
      url: '/lingualab/media/S01E01/.lingualab/only.m4a',
    })
  })

  it('is unplayable (and offers nothing to prepare but the smooth version) when the segment has its own audio file', async () => {
    folder('S01E01', ['a.mp3', 'a.mkv'])
    const { deps } = setup({ 'a.mkv': MKV_HEVC })
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ state: 'unplayable', videoCodec: 'hevc', smooth: { offer: true } })
  })

  it('is unplayable when ffprobe cannot read the file, and when it has no sound', async () => {
    folder('S01E01', ['a.mp3', 'a.mkv'])
    expect(await videoStatus('S01E01', undefined, setup({}).deps)).toMatchObject({ ok: false, state: 'unplayable' })
    forgetProbes()
    const silent = { streams: [{ index: 0, codec_type: 'video', codec_name: 'h264' }], format: { duration: '9' } }
    expect(await videoStatus('S01E01', undefined, setup({ 'a.mkv': silent }).deps)).toMatchObject({ state: 'unplayable' })
  })
})

describe('segments', () => {
  it('reads the video of the segment named, and of the first one when none is', async () => {
    folder('S01E01', ['01_a.mp3', '01_a.mp4', '02_b.mp3', '02_b.mkv'])
    const { deps } = setup({ '01_a.mp4': MP4_DIRECT, '02_b.mkv': MKV_H264_DTS })
    expect(await videoStatus('S01E01', '01_a', deps)).toMatchObject({ state: 'playable', file: '01_a.mp4' })
    expect(await videoStatus('S01E01', '02_b', deps)).toMatchObject({ state: 'prepare', file: '02_b.mkv' })
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ file: '01_a.mp4' })
    expect(await videoStatus('S01E01', 'no-such', deps)).toMatchObject({ state: 'none' })
  })

  it('keeps each segment\'s prepared copy under that segment\'s stem, even when the video has another name', async () => {
    const directory = folder('S01E01', ['01_a.mp3', '01_a_hd.mkv', '02_b.mp3'])
    const { deps, fake, jobs } = setup({ '01_a_hd.mkv': MKV_H264_DTS })
    await prepareVideo({ episode: 'S01E01', segment: '01_a', mode: 'video' }, deps)
    expect(fake.ffmpeg[0]?.output).toBe(`${cachePathFor(directory, '01_a', 'video')}.part`)
    jobs.cancel()
    await jobs.settled()
  })

  it('says none for an episode of segments when the segment has no video', async () => {
    folder('S01E01', ['01_a.mp3', '01_a.mp4', '02_b.mp3'])
    const { deps } = setup({ '01_a.mp4': MP4_DIRECT })
    expect(await videoStatus('S01E01', '02_b', deps)).toMatchObject({ state: 'none' })
  })
})

/** The pause that lets a fake process's output reach the job. */
const tick = (): Promise<void> => new Promise((resolve) => setImmediate(resolve))

describe('the smooth version of a video that plays as it is', () => {
  /** An mp4 a browser plays, with an audio file beside it. */
  function direct(): string {
    return folder('S01E01', ['a.mp3', 'a.mp4'])
  }

  it('is on offer, with the size and the time it will take', async () => {
    direct()
    const { deps } = setup({ 'a.mp4': MP4_DIRECT })
    const status = await videoStatus('S01E01', undefined, deps)
    // 60 seconds: about 1.9 Mbps for the size, and about 1.5 times real time for the encode.
    expect(status.smooth).toEqual({ offer: true, estimateBytes: 14_250_000, estimateSeconds: 40, revert: false, error: null })
    expect(status).toMatchObject({ state: 'playable', via: 'direct', jobKind: null, progress: null })
  })

  it('starts one job that encodes into <stem>.smooth.mp4, while the picture keeps playing and shows the progress', async () => {
    const directory = direct()
    const { deps, fake, jobs } = setup({ 'a.mp4': MP4_DIRECT })

    const started = await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)
    // What played still plays: the file as it is, not a card.
    expect(started).toMatchObject({ ok: true, state: 'playable', via: 'direct', url: '/lingualab/media/S01E01/a.mp4', jobKind: 'smooth' })
    expect(started.smooth.offer).toBe(false)
    expect(started.progress).toMatchObject({ fraction: 0, total: 60 })
    const call = fake.ffmpeg[0]
    expect(call?.output).toBe(`${cachePathFor(directory, 'a', 'smooth')}.part`)
    expect(call?.args).toContain('libx264')

    call?.child.say('out_time_us=30000000\n')
    await tick()
    const running = await videoStatus('S01E01', undefined, deps)
    expect(running).toMatchObject({ state: 'playable', via: 'direct', jobKind: 'smooth' })
    expect(running.progress?.fraction).toBeCloseTo(0.5, 2)

    writeFileSync(call?.output ?? '', 'smooth video')
    call?.child.finish(0)
    await jobs.settled()
    const done = await videoStatus('S01E01', undefined, deps)
    expect(done).toMatchObject({
      state: 'playable',
      via: 'smooth',
      url: '/lingualab/media/S01E01/.lingualab/a.smooth.mp4',
      progress: null,
      jobKind: null,
    })
    expect(done.smooth).toMatchObject({ offer: false, revert: true })
    expect(scanLibrary(root).episodes[0]?.video?.state).toBe('ready')
    // The reader's own file is untouched.
    expect(existsSync(join(directory, 'a.mp4'))).toBe(true)
  })

  it('prefers the smooth file to the full-size prepared one, and either to the source', async () => {
    const directory = direct()
    mkdirSync(join(directory, '.lingualab'))
    const future = new Date(Date.now() + 60_000)
    for (const kind of ['video', 'smooth'] as const) {
      writeFileSync(cachePathFor(directory, 'a', kind), kind)
      utimesSync(cachePathFor(directory, 'a', kind), future, future)
    }
    const { deps } = setup({ 'a.mp4': MP4_DIRECT })
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ via: 'smooth', url: '/lingualab/media/S01E01/.lingualab/a.smooth.mp4' })
    rmSync(cachePathFor(directory, 'a', 'smooth'))
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ via: 'prepared', url: '/lingualab/media/S01E01/.lingualab/a.mp4' })
  })

  it('does not trust a smooth file older than its source', async () => {
    const directory = direct()
    mkdirSync(join(directory, '.lingualab'))
    writeFileSync(cachePathFor(directory, 'a', 'smooth'), 'old')
    const past = new Date(Date.now() - 60_000)
    utimesSync(cachePathFor(directory, 'a', 'smooth'), past, past)
    const { deps } = setup({ 'a.mp4': MP4_DIRECT })
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ via: 'direct', smooth: { offer: true, revert: false } })
  })

  it('says a failed job failed without taking the picture away, and offers it again', async () => {
    direct()
    const { deps, fake, jobs } = setup({ 'a.mp4': MP4_DIRECT })
    await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)
    fake.ffmpeg[0]?.child.stderr.write('Conversion failed')
    fake.ffmpeg[0]?.child.finish(1)
    await jobs.settled()
    const status = await videoStatus('S01E01', undefined, deps)
    expect(status).toMatchObject({ ok: true, state: 'playable', via: 'direct', progress: null, jobKind: null })
    expect(status.smooth).toMatchObject({ offer: true, error: 'Conversion failed' })
  })

  it('leaves the picture playing and nothing deleted when the job is cancelled', async () => {
    const directory = direct()
    const { deps, fake, jobs } = setup({ 'a.mp4': MP4_DIRECT })
    await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)
    writeFileSync(fake.ffmpeg[0]?.output ?? '', 'half')
    jobs.cancel()
    await jobs.settled()
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ state: 'playable', via: 'direct', smooth: { offer: true, error: null } })
    expect(existsSync(`${cachePathFor(directory, 'a', 'smooth')}.part`)).toBe(false)
  })

  it('refuses a second job while one runs, and a smooth version that already exists', async () => {
    direct()
    folder('S01E02', ['b.mp4'])
    const { deps, fake, jobs } = setup({ 'a.mp4': MP4_DIRECT, 'b.mp4': MP4_DIRECT })
    await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)
    const second = await prepareVideo({ episode: 'S01E02', mode: 'smooth' }, deps)
    expect(second).toMatchObject({ ok: false, state: 'playable' })
    expect(second.reason).toContain('正在准备')
    expect(fake.ffmpeg).toHaveLength(1)

    writeFileSync(fake.ffmpeg[0]?.output ?? '', 'smooth')
    fake.ffmpeg[0]?.child.finish(0)
    await jobs.settled()
    const again = await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)
    expect(again).toMatchObject({ ok: false, via: 'smooth' })
    expect(fake.ffmpeg).toHaveLength(1)
  })

  it('is not on offer without ffmpeg, for a video with no sound, or for a file ffprobe cannot read', async () => {
    direct()
    expect((await videoStatus('S01E01', undefined, setup({}, null).deps)).smooth.offer).toBe(false)
    forgetProbes()
    expect((await videoStatus('S01E01', undefined, setup({}).deps)).smooth.offer).toBe(false)
    forgetProbes()
    const silent = { streams: [{ index: 0, codec_type: 'video', codec_name: 'h264', pix_fmt: 'yuv420p' }], format: { duration: '9' } }
    const { deps, fake } = setup({ 'a.mp4': silent })
    expect((await videoStatus('S01E01', undefined, deps)).smooth.offer).toBe(false)
    expect(await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)).toMatchObject({ ok: false })
    expect(fake.ffmpeg).toHaveLength(0)
  })
})

describe('the smooth version of a video that needs preparing', () => {
  it('is on offer beside the ordinary preparing, and while it runs nothing plays, so the card shows it', async () => {
    const directory = folder('S01E01', ['MDJT S01E01.mkv', 'MDJT S01E01.mp3'])
    const { deps, fake, jobs } = setup({ 'MDJT S01E01.mkv': MKV_H264_DTS })
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ state: 'prepare', smooth: { offer: true } })

    const started = await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)
    expect(started).toMatchObject({ state: 'preparing', jobKind: 'smooth', url: null })
    expect(fake.ffmpeg[0]?.output).toBe(`${cachePathFor(directory, 'MDJT S01E01', 'smooth')}.part`)

    writeFileSync(fake.ffmpeg[0]?.output ?? '', 'smooth video')
    fake.ffmpeg[0]?.child.finish(0)
    await jobs.settled()
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ state: 'playable', via: 'smooth', duration: 1379.42 })
  })

  it('replaces the prepared file: once the smooth one is in place the full-size one is gone', async () => {
    const directory = folder('S01E01', ['a.mkv'])
    const { deps, fake, jobs } = setup({ 'a.mkv': MKV_H264_DTS })
    await prepareVideo({ episode: 'S01E01', mode: 'video' }, deps)
    writeFileSync(fake.ffmpeg[0]?.output ?? '', 'full-size')
    fake.ffmpeg[0]?.child.finish(0)
    await jobs.settled()
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ via: 'prepared', smooth: { offer: true } })

    await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ state: 'playable', via: 'prepared', jobKind: 'smooth' })
    writeFileSync(fake.ffmpeg[1]?.output ?? '', 'smooth')
    fake.ffmpeg[1]?.child.finish(0)
    await jobs.settled()
    expect(existsSync(cachePathFor(directory, 'a', 'video'))).toBe(false)
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ via: 'smooth' })
  })
})

describe('the smooth version of a picture a browser cannot decode', () => {
  it('is on offer with the sound-only card and with the unplayable one, and turns the picture into a video', async () => {
    const directory = folder('S01E01', ['only.mkv'])
    folder('S01E02', ['b.mp3', 'b.mkv'])
    const { deps, fake, jobs } = setup({ 'only.mkv': MKV_HEVC, 'b.mkv': MKV_HEVC })
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ state: 'sound-only', smooth: { offer: true, estimateBytes: 142_500_000, estimateSeconds: 400 } })
    expect(await videoStatus('S01E02', undefined, deps)).toMatchObject({ state: 'unplayable', smooth: { offer: true } })

    const started = await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)
    expect(started).toMatchObject({ state: 'preparing', jobKind: 'smooth' })
    expect(fake.ffmpeg[0]?.output).toBe(`${cachePathFor(directory, 'only', 'smooth')}.part`)
    // The picture is decoded by the encoder, whatever the codec.
    expect(fake.ffmpeg[0]?.args).toContain('libx264')
    expect(fake.ffmpeg[0]?.args).not.toContain('-vn')
    writeFileSync(fake.ffmpeg[0]?.output ?? '', 'smooth')
    fake.ffmpeg[0]?.child.finish(0)
    await jobs.settled()
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({
      state: 'playable',
      via: 'smooth',
      url: '/lingualab/media/S01E01/.lingualab/only.smooth.mp4',
      smooth: { revert: true },
    })
  })

  it('keeps the sound playing from the cache while the smooth version is made', async () => {
    const directory = folder('S01E01', ['only.mkv'])
    mkdirSync(join(directory, '.lingualab'))
    writeFileSync(cachePathFor(directory, 'only', 'sound'), 'sound')
    const future = new Date(Date.now() + 60_000)
    utimesSync(cachePathFor(directory, 'only', 'sound'), future, future)
    const { deps, jobs } = setup({ 'only.mkv': MKV_HEVC })
    const started = await prepareVideo({ episode: 'S01E01', mode: 'smooth' }, deps)
    expect(started).toMatchObject({ state: 'sound-ready', url: '/lingualab/media/S01E01/.lingualab/only.m4a', jobKind: 'smooth' })
    expect(started.progress).not.toBeNull()
    jobs.cancel()
    await jobs.settled()
  })
})

describe('going back to the original quality', () => {
  /** A smooth file in the cache, newer than its source. */
  function withSmooth(directory: string, stem: string): void {
    mkdirSync(join(directory, '.lingualab'), { recursive: true })
    writeFileSync(cachePathFor(directory, stem, 'smooth'), 'smooth')
    const future = new Date(Date.now() + 60_000)
    utimesSync(cachePathFor(directory, stem, 'smooth'), future, future)
  }

  it('deletes the smooth file and prepares a video that needed it again, through the same queue', async () => {
    const directory = folder('S01E01', ['a.mkv'])
    withSmooth(directory, 'a')
    const { deps, fake, jobs } = setup({ 'a.mkv': MKV_H264_DTS })
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ via: 'smooth', smooth: { revert: true } })

    const answer = await prepareVideo({ episode: 'S01E01', mode: 'original' }, deps)
    expect(existsSync(cachePathFor(directory, 'a', 'smooth'))).toBe(false)
    expect(answer).toMatchObject({ state: 'preparing', jobKind: 'video' })
    expect(fake.ffmpeg[0]?.output).toBe(`${cachePathFor(directory, 'a', 'video')}.part`)
    expect(fake.ffmpeg[0]?.args).toContain('copy')

    writeFileSync(fake.ffmpeg[0]?.output ?? '', 'full-size')
    fake.ffmpeg[0]?.child.finish(0)
    await jobs.settled()
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ via: 'prepared', smooth: { offer: true, revert: false } })
  })

  it('only deletes the smooth file for a source that plays as it is', async () => {
    const directory = folder('S01E01', ['a.mp3', 'a.mp4'])
    withSmooth(directory, 'a')
    const { deps, fake } = setup({ 'a.mp4': MP4_DIRECT })
    const answer = await prepareVideo({ episode: 'S01E01', mode: 'original' }, deps)
    expect(existsSync(cachePathFor(directory, 'a', 'smooth'))).toBe(false)
    expect(answer).toMatchObject({ ok: true, state: 'playable', via: 'direct', url: '/lingualab/media/S01E01/a.mp4' })
    expect(fake.ffmpeg).toHaveLength(0)
  })

  it('returns a picture that could only ever be sound to the audio-only state', async () => {
    const directory = folder('S01E01', ['only.mkv'])
    withSmooth(directory, 'only')
    const { deps, fake } = setup({ 'only.mkv': MKV_HEVC })
    const answer = await prepareVideo({ episode: 'S01E01', mode: 'original' }, deps)
    expect(existsSync(cachePathFor(directory, 'only', 'smooth'))).toBe(false)
    expect(answer).toMatchObject({ ok: true, state: 'sound-only', smooth: { offer: true, revert: false } })
    expect(fake.ffmpeg).toHaveLength(0)
  })

  it('does nothing when there is no smooth file, and never starts a job for it', async () => {
    const directory = folder('S01E01', ['a.mkv'])
    mkdirSync(join(directory, '.lingualab'))
    writeFileSync(cachePathFor(directory, 'a', 'video'), 'prepared')
    const future = new Date(Date.now() + 60_000)
    utimesSync(cachePathFor(directory, 'a', 'video'), future, future)
    const { deps, fake } = setup({ 'a.mkv': MKV_H264_DTS })
    expect(await prepareVideo({ episode: 'S01E01', mode: 'original' }, deps)).toMatchObject({ ok: true, via: 'prepared' })
    expect(fake.ffmpeg).toHaveLength(0)
    expect(existsSync(cachePathFor(directory, 'a', 'video'))).toBe(true)
  })

  it('deletes nothing while a job runs', async () => {
    const directory = folder('S01E01', ['a.mkv'])
    withSmooth(directory, 'a')
    folder('S01E02', ['b.mkv'])
    const { deps, fake, jobs } = setup({ 'a.mkv': MKV_H264_DTS, 'b.mkv': MKV_H264_DTS })
    await prepareVideo({ episode: 'S01E02', mode: 'video' }, deps)
    const answer = await prepareVideo({ episode: 'S01E01', mode: 'original' }, deps)
    expect(answer).toMatchObject({ ok: false, via: 'smooth' })
    expect(answer.reason).toContain('正在准备')
    expect(existsSync(cachePathFor(directory, 'a', 'smooth'))).toBe(true)
    expect(fake.ffmpeg).toHaveLength(1)
    jobs.cancel()
    await jobs.settled()
  })
})
