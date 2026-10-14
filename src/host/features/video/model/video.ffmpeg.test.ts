/**
 * The real thing: probe, plan and prepare small generated samples with the ffmpeg and ffprobe on this
 * machine, and check the results with ffprobe again.
 *
 * Skipped where the two binaries are not found (CI, most machines): everything else about the job is covered
 * with a fake spawner, and this is the one test that proves the argument lists mean what they should to a
 * real ffmpeg. The samples are generated into a temp folder and removed afterwards; nothing is read from or
 * written to any real library.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cachePathFor } from '../../../entities/video-cache/index.ts'
import { findBinaries, realSpawn } from '../../../shared/ffmpeg/index.ts'
import { makeTempDir } from '../../../shared/testing/index.ts'
import { createVideoJobs } from './video-jobs.ts'
import { forgetProbes, prepareVideo, videoStatus, type VideoDeps } from './video.ts'

const binaries = findBinaries('')

/** Whether this ffmpeg can encode with a library (HEVC is an optional build feature). */
function canEncode(name: string): boolean {
  if (binaries === null) return false
  try {
    return execFileSync(binaries.ffmpeg, ['-hide_banner', '-encoders'], { encoding: 'utf8' }).includes(name)
  } catch {
    return false
  }
}

/** One stream as the smooth checks read it. */
interface Stream {
  codec_type: string
  codec_name: string
  channels?: number
  width?: number
  height?: number
  pix_fmt?: string
}

/** The seconds at which the first video stream has a keyframe. */
function keyframeTimes(path: string): number[] {
  const text = execFileSync(
    binaries?.ffprobe ?? 'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'packet=pts_time,flags', '-print_format', 'json', path],
    { encoding: 'utf8' },
  )
  const packets = (JSON.parse(text) as { packets: { pts_time?: string; flags: string }[] }).packets
  return packets.filter((packet) => packet.flags.startsWith('K')).map((packet) => Number(packet.pts_time))
}

/** Run ffprobe on a file and read what it says. */
function probe(path: string): { streams: Stream[] } {
  const text = execFileSync(
    binaries?.ffprobe ?? 'ffprobe',
    ['-v', 'error', '-print_format', 'json', '-show_streams', path],
    { encoding: 'utf8' },
  )
  return JSON.parse(text) as { streams: Stream[] }
}

describe.skipIf(binaries === null)('with a real ffmpeg', () => {
  let root = ''
  const jobs = createVideoJobs(realSpawn)
  const deps = (): VideoDeps => ({ root, binaries: () => binaries, spawn: realSpawn, jobs, platform: process.platform })

  /** Make a 3 second sample: a test picture and a sine tone. */
  function sample(path: string, video: string, audio: string): void {
    execFileSync(
      binaries?.ffmpeg ?? 'ffmpeg',
      [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-f', 'lavfi', '-i', 'testsrc=size=320x240:rate=25',
        '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000',
        '-t', '3', '-c:v', video, '-pix_fmt', 'yuv420p', '-c:a', audio, '-ac', '6', '-channel_layout', '5.1',
        path,
      ],
      { stdio: 'ignore' },
    )
  }

  beforeAll(() => {
    root = makeTempDir('lingualab-ffmpeg-')
    forgetProbes()
    mkdirSync(join(root, 'E1'))
    sample(join(root, 'E1', 'sample.mkv'), 'libx264', 'ac3')
    mkdirSync(join(root, 'E2'))
    if (canEncode('libx265')) sample(join(root, 'E2', 'hevc.mkv'), 'libx265', 'ac3')
  }, 60_000)

  afterAll(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it('remuxes H.264 with AC-3 sound into an mp4 with stereo AAC, the picture copied and the index first', async () => {
    const before = await videoStatus('E1', undefined, deps())
    expect(before).toMatchObject({ state: 'prepare', videoCodec: 'h264', audioCodec: 'ac3' })

    const started = await prepareVideo({ episode: 'E1', mode: 'video' }, deps())
    expect(started.state).toBe('preparing')
    // One at a time: the second request is refused while the first runs, or (if it already finished) not needed.
    await jobs.settled()
    expect(jobs.current()).toMatchObject({ phase: 'done' })

    const output = cachePathFor(join(root, 'E1'), 'sample', 'video')
    expect(existsSync(output)).toBe(true)
    expect(existsSync(`${output}.part`)).toBe(false)
    const streams = probe(output).streams
    expect(streams.map((stream) => [stream.codec_type, stream.codec_name])).toEqual([
      ['video', 'h264'],
      ['audio', 'aac'],
    ])
    expect(streams[1]?.channels).toBe(2)
    // +faststart: the index (moov) comes before the media data (mdat), so seeking works from the first byte.
    const bytes = readFileSync(output)
    expect(bytes.indexOf('moov')).toBeGreaterThan(0)
    expect(bytes.indexOf('moov')).toBeLessThan(bytes.indexOf('mdat'))

    const after = await videoStatus('E1', undefined, deps())
    expect(after).toMatchObject({ state: 'playable', via: 'prepared', url: '/lingualab/media/E1/.lingualab/sample.mp4' })
    // The source is untouched.
    expect(probe(join(root, 'E1', 'sample.mkv')).streams.map((stream) => stream.codec_name)).toEqual(['h264', 'ac3'])
  }, 60_000)

  it.skipIf(!canEncode('libx265'))('extracts only the sound of an HEVC video, as AAC in an m4a', async () => {
    expect(await videoStatus('E2', undefined, deps())).toMatchObject({ state: 'sound-only', videoCodec: 'hevc' })
    // The picture cannot be had, only the sound.
    expect(await prepareVideo({ episode: 'E2', mode: 'video' }, deps())).toMatchObject({ ok: false, state: 'sound-only' })

    expect((await prepareVideo({ episode: 'E2', mode: 'sound' }, deps())).state).toBe('preparing')
    await jobs.settled()
    expect(jobs.current()).toMatchObject({ phase: 'done' })

    const output = cachePathFor(join(root, 'E2'), 'hevc', 'sound')
    const streams = probe(output).streams
    expect(streams.map((stream) => [stream.codec_type, stream.codec_name])).toEqual([['audio', 'aac']])
    expect(streams[0]?.channels).toBe(2)
    expect(await videoStatus('E2', undefined, deps())).toMatchObject({
      state: 'sound-ready',
      url: '/lingualab/media/E2/.lingualab/hevc.m4a',
    })
  }, 60_000)

  describe('the smooth version', () => {
    /** Make a 6 second sample of a size, in a codec, with 5.1 sound. */
    function sized(path: string, size: string, video: string, rate = 25): void {
      execFileSync(
        binaries?.ffmpeg ?? 'ffmpeg',
        [
          '-hide_banner', '-loglevel', 'error', '-y',
          '-f', 'lavfi', '-i', `testsrc=size=${size}:rate=${String(rate)}`,
          '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000',
          '-t', '6', '-c:v', video, '-pix_fmt', 'yuv420p', '-c:a', 'ac3', '-ac', '6', '-channel_layout', '5.1',
          path,
        ],
        { stdio: 'ignore' },
      )
    }

    beforeAll(() => {
      mkdirSync(join(root, 'E3'))
      sized(join(root, 'E3', 'tall.mkv'), '1920x1080', 'libx264')
      mkdirSync(join(root, 'E4'))
      sized(join(root, 'E4', 'small.mkv'), '320x240', 'libx264', 60)
      mkdirSync(join(root, 'E5'))
      if (canEncode('libx265')) sized(join(root, 'E5', 'hevc.mkv'), '640x360', 'libx265')
    }, 120_000)

    it('re-encodes to H.264 8-bit 4:2:0 at 720 lines, with stereo AAC, the index first, and a keyframe every two seconds', async () => {
      expect(await videoStatus('E3', undefined, deps())).toMatchObject({ state: 'prepare', smooth: { offer: true } })
      expect((await prepareVideo({ episode: 'E3', mode: 'smooth' }, deps())).state).toBe('preparing')
      await jobs.settled()
      expect(jobs.current()).toMatchObject({ phase: 'done', kind: 'smooth' })

      const output = cachePathFor(join(root, 'E3'), 'tall', 'smooth')
      expect(existsSync(`${output}.part`)).toBe(false)
      const streams = probe(output).streams
      expect(streams.map((stream) => [stream.codec_type, stream.codec_name])).toEqual([
        ['video', 'h264'],
        ['audio', 'aac'],
      ])
      expect(streams[0]).toMatchObject({ pix_fmt: 'yuv420p', height: 720, width: 1280 })
      expect(streams[1]?.channels).toBe(2)
      const bytes = readFileSync(output)
      expect(bytes.indexOf('moov')).toBeLessThan(bytes.indexOf('mdat'))

      // Keyframes at 0, 2 and 4 seconds, and none further apart than two seconds.
      const keys = keyframeTimes(output)
      for (const wanted of [0, 2, 4]) expect(keys.some((time) => Math.abs(time - wanted) < 0.05)).toBe(true)
      for (let at = 1; at < keys.length; at += 1) expect((keys[at] ?? 0) - (keys[at - 1] ?? 0)).toBeLessThanOrEqual(2.05)

      expect(await videoStatus('E3', undefined, deps())).toMatchObject({ state: 'playable', via: 'smooth' })
      // The source is untouched.
      expect(probe(join(root, 'E3', 'tall.mkv')).streams.map((stream) => stream.height ?? null)).toEqual([1080, null])
    }, 120_000)

    it('keeps a smaller picture its size, and puts a keyframe every two seconds at 60 frames per second too', async () => {
      expect((await prepareVideo({ episode: 'E4', mode: 'smooth' }, deps())).state).toBe('preparing')
      await jobs.settled()
      const output = cachePathFor(join(root, 'E4'), 'small', 'smooth')
      expect(probe(output).streams[0]).toMatchObject({ width: 320, height: 240 })
      const keys = keyframeTimes(output)
      for (const wanted of [0, 2, 4]) expect(keys.some((time) => Math.abs(time - wanted) < 0.05)).toBe(true)
      for (let at = 1; at < keys.length; at += 1) expect((keys[at] ?? 0) - (keys[at - 1] ?? 0)).toBeLessThanOrEqual(2.05)
    }, 120_000)

    it.skipIf(!canEncode('libx265'))('turns a picture a browser cannot decode into a video that plays', async () => {
      expect(await videoStatus('E5', undefined, deps())).toMatchObject({ state: 'sound-only', smooth: { offer: true } })
      expect((await prepareVideo({ episode: 'E5', mode: 'smooth' }, deps())).state).toBe('preparing')
      await jobs.settled()
      expect(jobs.current()).toMatchObject({ phase: 'done', kind: 'smooth' })
      const output = cachePathFor(join(root, 'E5'), 'hevc', 'smooth')
      expect(probe(output).streams.map((stream) => [stream.codec_type, stream.codec_name])).toEqual([
        ['video', 'h264'],
        ['audio', 'aac'],
      ])
      expect(await videoStatus('E5', undefined, deps())).toMatchObject({ state: 'playable', via: 'smooth' })

      // Going back leaves the audio-only state, and no smooth file.
      const back = await prepareVideo({ episode: 'E5', mode: 'original' }, deps())
      expect(back).toMatchObject({ state: 'sound-only', smooth: { revert: false } })
      expect(existsSync(output)).toBe(false)
    }, 120_000)

    it('replaces a prepared mp4, and going back prepares it again by remuxing', async () => {
      // E1 was remuxed by the first test, so its full-size mp4 is in the cache.
      const full = cachePathFor(join(root, 'E1'), 'sample', 'video')
      expect(existsSync(full)).toBe(true)
      await prepareVideo({ episode: 'E1', mode: 'smooth' }, deps())
      await jobs.settled()
      expect(jobs.current()).toMatchObject({ phase: 'done', kind: 'smooth' })
      expect(existsSync(full)).toBe(false)
      expect(existsSync(cachePathFor(join(root, 'E1'), 'sample', 'smooth'))).toBe(true)

      expect((await prepareVideo({ episode: 'E1', mode: 'original' }, deps())).state).toBe('preparing')
      await jobs.settled()
      expect(jobs.current()).toMatchObject({ phase: 'done', kind: 'video' })
      expect(existsSync(cachePathFor(join(root, 'E1'), 'sample', 'smooth'))).toBe(false)
      expect(probe(full).streams.map((stream) => stream.codec_name)).toEqual(['h264', 'aac'])
      expect(await videoStatus('E1', undefined, deps())).toMatchObject({ via: 'prepared' })
    }, 120_000)
  })

  it('stops a real ffmpeg process when it is killed, which is what a cancel does', async () => {
    // A job on these tiny samples is over before a cancel could arrive, so the process itself is checked: a
    // real-time source that would run for ten minutes, killed, must report that it closed.
    const child = realSpawn(binaries?.ffmpeg ?? 'ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-nostdin', '-re',
      '-f', 'lavfi', '-i', 'testsrc=size=160x120:rate=25', '-t', '600', '-f', 'null', '-',
    ])
    const closed = new Promise<number | null>((resolve) => child.on('close', (code) => resolve(code)))
    await new Promise((resolve) => setTimeout(resolve, 300))
    child.kill()
    expect(await closed).not.toBe(0)
  }, 30_000)
})
