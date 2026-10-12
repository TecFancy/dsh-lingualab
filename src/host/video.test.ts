/**
 * What the host says about a segment's video, and what starting a job does, with a fake ffmpeg and ffprobe.
 */
import { existsSync, mkdirSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Binaries } from './ffmpeg.ts'
import { makeTempDir } from './test-dir.ts'
import { MKV_H264_DTS, MKV_HEVC, MP4_DIRECT, audioProbe, fakeSpawn, type FakeSpawn } from './test-ffmpeg.ts'
import { cachePathFor, forgetDirect } from './video-cache.ts'
import { createVideoJobs, type VideoJobs } from './video-jobs.ts'
import { forgetProbes, prepareVideo, videoStatus, type VideoDeps } from './video.ts'
import { scanLibrary } from './library.ts'

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

  it('is unplayable (and offers nothing to prepare) when the segment has its own audio file', async () => {
    folder('S01E01', ['a.mp3', 'a.mkv'])
    const { deps } = setup({ 'a.mkv': MKV_HEVC })
    expect(await videoStatus('S01E01', undefined, deps)).toMatchObject({ state: 'unplayable', videoCodec: 'hevc' })
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
