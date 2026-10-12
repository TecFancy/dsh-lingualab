/**
 * A stand-in for `ffmpeg` and `ffprobe`: a spawner that answers probes from a table and hands every
 * `ffmpeg` process to the test to drive.
 *
 * Lives beside the tests it serves and is not part of the bundle: nothing in `src/index.ts`
 * imports it.
 */
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import type { Child, Spawn } from '../ffmpeg/index.ts'

/** One process the code under test started. */
export class FakeChild extends EventEmitter {
  readonly stdout = new PassThrough()
  readonly stderr = new PassThrough()
  killed = false

  /** Like a real process: stopping it is not instant, and it closes with no exit code. */
  kill(): void {
    this.killed = true
    setImmediate(() => this.finish(null))
  }

  /** Say something on stdout, as `ffmpeg -progress pipe:1` does. */
  say(text: string): void {
    this.stdout.write(text)
  }

  /** The process ends. */
  finish(code: number | null): void {
    this.stdout.end()
    this.stderr.end()
    this.emit('close', code)
  }
}

/** One `ffmpeg` call. */
export interface FfmpegCall {
  readonly command: string
  readonly args: readonly string[]
  readonly child: FakeChild
  /** Where this call was told to write: the last argument. */
  readonly output: string
}

/** The spawner, and what it saw. */
export interface FakeSpawn {
  readonly spawn: Spawn
  /** Every `ffmpeg` process started, in order. */
  readonly ffmpeg: FfmpegCall[]
  /** The paths `ffprobe` was asked about, in order. */
  readonly probed: string[]
}

/**
 * Make the spawner.
 * @param probes - what `ffprobe` prints for a path: an object (as JSON), or `null` for a failure.
 * @param options - `failToStart` makes `ffmpeg` throw when started.
 */
export function fakeSpawn(
  probes: (path: string) => object | null,
  options: { readonly failToStart?: boolean } = {},
): FakeSpawn {
  const ffmpeg: FfmpegCall[] = []
  const probed: string[] = []
  const spawn: Spawn = (command, args) => {
    const child = new FakeChild()
    if (/ffprobe/i.test(command)) {
      const path = args[args.length - 1] ?? ''
      probed.push(path)
      const answer = probes(path)
      setImmediate(() => {
        if (answer !== null) child.say(JSON.stringify(answer))
        child.finish(answer === null ? 1 : 0)
      })
      return child as unknown as Child
    }
    if (options.failToStart === true) throw new Error('spawn ENOENT')
    ffmpeg.push({ command, args, child, output: args[args.length - 1] ?? '' })
    return child as unknown as Child
  }
  return { spawn, ffmpeg, probed }
}

/** The probe of the real sample (an H.264 mkv with DTS audio and two SubRip tracks), trimmed to what the planner reads. */
export const MKV_H264_DTS = {
  streams: [
    { index: 0, codec_type: 'video', codec_name: 'h264', pix_fmt: 'yuv420p', tags: {}, disposition: { default: 1 } },
    { index: 1, codec_type: 'audio', codec_name: 'dts', tags: { language: 'eng' }, disposition: { default: 1 } },
    { index: 2, codec_type: 'subtitle', codec_name: 'subrip', tags: { language: 'chi' } },
    { index: 3, codec_type: 'subtitle', codec_name: 'subrip', tags: { language: 'eng' } },
  ],
  format: { format_name: 'matroska,webm', duration: '1379.420000', size: '1181116006' },
}

/** An mp4 a browser plays as it is. */
export const MP4_DIRECT = {
  streams: [
    { index: 0, codec_type: 'video', codec_name: 'h264', pix_fmt: 'yuv420p' },
    { index: 1, codec_type: 'audio', codec_name: 'aac' },
  ],
  format: { format_name: 'mov,mp4,m4a,3gp,3g2,mj2', duration: '60.000000' },
}

/** A video in a codec no browser decodes. */
export const MKV_HEVC = {
  streams: [
    { index: 0, codec_type: 'video', codec_name: 'hevc', pix_fmt: 'yuv420p10le' },
    { index: 1, codec_type: 'audio', codec_name: 'eac3', tags: { language: 'eng' } },
  ],
  format: { format_name: 'matroska,webm', duration: '600.000000' },
}

/** A plain audio file, for the length comparison. */
export function audioProbe(duration: number): object {
  return {
    streams: [{ index: 0, codec_type: 'audio', codec_name: 'mp3' }],
    format: { format_name: 'mp3', duration: String(duration) },
  }
}
