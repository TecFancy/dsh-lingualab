/**
 * What to do with a video: a pure decision from `ffprobe`'s JSON, and the `ffmpeg` arguments that carry it out.
 *
 * Nothing here touches the disk or starts a process, so every rule is a plain test. The question
 * the page has to answer is "can a browser play this, and if not, what is the cheapest thing that
 * would let it?", and the answer is one of four plans:
 *
 *   · `direct`: an `mp4` or `webm` whose video and first audio track a browser decodes. Nothing is
 *     written, the file is served as it is.
 *   · `remux`: the picture is a codec a browser decodes (H.264, VP9, AV1) but the box or the sound
 *     is not (an `mkv`, DTS or AC-3 audio). The picture is copied untouched and the sound becomes
 *     stereo AAC, in an `mp4` with its index at the front. This takes about as long as reading the
 *     file, not as long as watching it.
 *   · `audio-only`: the picture is a codec a browser cannot decode (HEVC, MPEG-4 Part 2, VC-1, a
 *     10-bit H.264) and is not re-encoded: that would take longer than the episode lasts. The sound
 *     is extracted to an `m4a`, which is enough to study by ear.
 *   · `none`: no audio track at all, or nothing usable in the file.
 *
 * The audio track is the first English one, else the first.
 */

/** One stream of `ffprobe -show_streams`, the fields this module reads. */
export interface ProbeStream {
  readonly index: number
  readonly codec_type?: string
  readonly codec_name?: string
  readonly pix_fmt?: string
  readonly duration?: string
  readonly tags?: Readonly<Record<string, string>>
  readonly disposition?: Readonly<Record<string, number>>
}

/** The parts of `ffprobe -show_format -show_streams -print_format json` this module reads. */
export interface ProbeResult {
  readonly streams: readonly ProbeStream[]
  readonly format: { readonly format_name?: string; readonly duration?: string; readonly size?: string }
}

/** Why a video gets no picture, or none at all. */
export type PlanReason = 'video-codec' | 'no-video' | 'no-audio' | 'no-streams'

/** What to do with one video. */
export type VideoPlan =
  | {
      readonly kind: 'direct'
      readonly duration: number | null
      readonly videoCodec: string
      readonly audioCodec: string
    }
  | {
      readonly kind: 'remux'
      readonly duration: number | null
      readonly videoIndex: number
      readonly audioIndex: number
      readonly videoCodec: string
      readonly audioCodec: string
    }
  | {
      readonly kind: 'audio-only'
      readonly duration: number | null
      readonly audioIndex: number
      readonly videoCodec: string | null
      readonly audioCodec: string
      readonly reason: 'video-codec' | 'no-video'
    }
  | { readonly kind: 'none'; readonly duration: number | null; readonly reason: 'no-audio' | 'no-streams' }

/** The plans that need a file written. */
export type PreparePlan = Extract<VideoPlan, { kind: 'remux' | 'audio-only' }>

/** Video codecs a browser plays inside each of the containers that may be served as they are. */
const DIRECT_VIDEO: Readonly<Record<string, readonly string[]>> = {
  mp4: ['h264', 'vp9', 'av1'],
  webm: ['vp8', 'vp9', 'av1'],
}

/** Video codecs that can be copied into an `mp4` and then played. */
const REMUX_VIDEO: readonly string[] = ['h264', 'vp9', 'av1']

/** Audio codecs a browser plays from an `mp4` or `webm` as they are. */
const PLAYABLE_AUDIO: readonly string[] = ['aac', 'opus', 'mp3']

/** The pixel formats a browser decodes for H.264; the 10-bit and 4:4:4 ones are common in rips and do not play. */
const H264_PIXEL_FORMATS: readonly string[] = ['yuv420p', 'yuvj420p']

/** The bit rate the prepared sound is written at, in bits per second. */
export const AUDIO_BITRATE = 160_000

/** Read `ffprobe`'s JSON into the shape above; anything else is `null`. */
export function parseProbe(text: string): ProbeResult | null {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const record = data as { streams?: unknown; format?: unknown }
  if (!Array.isArray(record.streams)) return null
  const streams = record.streams.filter(
    (stream): stream is ProbeStream =>
      typeof stream === 'object' && stream !== null && typeof (stream as ProbeStream).index === 'number',
  )
  const format = typeof record.format === 'object' && record.format !== null ? (record.format as ProbeResult['format']) : {}
  return { streams, format }
}

/** The length of the file in seconds: the container's own figure, else the longest stream's. */
export function durationOf(probe: ProbeResult): number | null {
  const own = Number(probe.format.duration)
  if (Number.isFinite(own) && own > 0) return own
  let longest = 0
  for (const stream of probe.streams) {
    const value = Number(stream.duration)
    if (Number.isFinite(value) && value > longest) longest = value
  }
  return longest > 0 ? longest : null
}

/** Whether a stream is a cover image rather than a picture to play. */
function isCoverArt(stream: ProbeStream): boolean {
  return stream.disposition?.attached_pic === 1
}

/** The audio track to use: the first one tagged English, else the first. */
export function pickAudioStream(streams: readonly ProbeStream[]): ProbeStream | null {
  const audio = streams.filter((stream) => stream.codec_type === 'audio')
  const english = audio.find((stream) => {
    const language = (stream.tags?.language ?? '').toLowerCase()
    return language === 'en' || language === 'eng'
  })
  return english ?? audio[0] ?? null
}

/** Whether a browser decodes this stream's picture once it is in a box it can open. */
function pictureDecodes(stream: ProbeStream): boolean {
  const codec = stream.codec_name ?? ''
  if (!REMUX_VIDEO.includes(codec)) return false
  if (codec === 'h264' && stream.pix_fmt !== undefined && !H264_PIXEL_FORMATS.includes(stream.pix_fmt)) return false
  return true
}

/**
 * Decide what to do with one video.
 * @param probe - what \`ffprobe\` said about the file.
 * @param extension - the file's extension, lower case, without the dot: only \`mp4\` and \`webm\` can be direct.
 * @returns the plan.
 */
export function planVideo(probe: ProbeResult, extension: string): VideoPlan {
  const duration = durationOf(probe)
  const audio = pickAudioStream(probe.streams)
  const picture = probe.streams.find((stream) => stream.codec_type === 'video' && !isCoverArt(stream)) ?? null
  if (audio === null) {
    return { kind: 'none', duration, reason: probe.streams.length === 0 ? 'no-streams' : 'no-audio' }
  }
  const audioCodec = audio.codec_name ?? 'unknown'
  if (picture === null) {
    return { kind: 'audio-only', duration, audioIndex: audio.index, videoCodec: null, audioCodec, reason: 'no-video' }
  }
  const videoCodec = picture.codec_name ?? 'unknown'
  if (!pictureDecodes(picture) && !(extension === 'webm' && videoCodec === 'vp8')) {
    return { kind: 'audio-only', duration, audioIndex: audio.index, videoCodec, audioCodec, reason: 'video-codec' }
  }

  const firstAudio = probe.streams.find((stream) => stream.codec_type === 'audio')
  const containerOk = (DIRECT_VIDEO[extension] ?? []).includes(videoCodec)
  // The browser plays the first audio track, so a file whose English track is a later one is
  // prepared rather than played as it is.
  if (containerOk && PLAYABLE_AUDIO.includes(audioCodec) && firstAudio?.index === audio.index) {
    return { kind: 'direct', duration, videoCodec, audioCodec }
  }
  // VP8 has no place in an mp4, so a VP8 picture that cannot play as it is keeps only its sound.
  if (!REMUX_VIDEO.includes(videoCodec)) {
    return { kind: 'audio-only', duration, audioIndex: audio.index, videoCodec, audioCodec, reason: 'video-codec' }
  }
  return { kind: 'remux', duration, videoIndex: picture.index, audioIndex: audio.index, videoCodec, audioCodec }
}

/**
 * The size the prepared file will be, roughly, in bytes.
 * @param plan - a plan that writes a file.
 * @param sourceBytes - the source's size.
 */
export function estimateBytes(plan: PreparePlan, sourceBytes: number | null): number | null {
  if (plan.kind === 'remux') return sourceBytes
  return plan.duration === null ? null : Math.round((plan.duration * AUDIO_BITRATE) / 8)
}

/** The arguments of \`ffprobe\` for one file: JSON out, nothing else. */
export function probeArgs(path: string): string[] {
  return ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', path]
}

/**
 * The arguments of \`ffmpeg\` that carry a plan out.
 *
 * Progress goes to stdout as \`key=value\` lines (\`-progress pipe:1\`), everything else stays
 * quiet. The output name is a \`.part\`, which \`ffmpeg\` cannot guess a format from, so the format
 * is spelled out. The caller passes absolute paths it resolved itself, and this list is handed to
 * the process as an argument array, never to a shell.
 * @param plan - a plan that writes a file.
 * @param source - the source video's absolute path.
 * @param output - the absolute path to write.
 */
export function ffmpegArgs(plan: PreparePlan, source: string, output: string): string[] {
  const head = ['-hide_banner', '-nostdin', '-y', '-loglevel', 'error', '-progress', 'pipe:1', '-nostats', '-i', source]
  const sound = ['-c:a', 'aac', '-ac', '2', '-b:a', String(AUDIO_BITRATE), '-map_chapters', '-1', '-map_metadata', '-1']
  const tail = ['-movflags', '+faststart', '-f', 'mp4', output]
  if (plan.kind === 'remux') {
    return [...head, '-map', `0:${String(plan.videoIndex)}`, '-map', `0:${String(plan.audioIndex)}`, '-c:v', 'copy', ...sound, ...tail]
  }
  return [...head, '-vn', '-map', `0:${String(plan.audioIndex)}`, ...sound, ...tail]
}

/**
 * Read the seconds done out of one line of \`-progress\` output.
 *
 * \`out_time_us\` is microseconds, and so, confusingly, is \`out_time_ms\`; \`out_time\` is
 * \`HH:MM:SS.micro\`. Anything else (\`frame=\`, \`speed=\`, \`progress=\`) is not a position.
 * @returns the seconds, or \`null\` for a line that is not a position (or \`N/A\`).
 */
export function progressSeconds(line: string): number | null {
  const at = line.indexOf('=')
  if (at < 0) return null
  const key = line.slice(0, at).trim()
  const value = line.slice(at + 1).trim()
  if (key === 'out_time_us' || key === 'out_time_ms') {
    const micro = Number(value)
    return Number.isFinite(micro) && micro >= 0 ? micro / 1_000_000 : null
  }
  if (key === 'out_time') {
    const match = /^(-?)(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(value)
    if (match === null || match[1] === '-') return null
    return Number(match[2]) * 3600 + Number(match[3]) * 60 + Number(match[4])
  }
  return null
}
