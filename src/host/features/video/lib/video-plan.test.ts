import { describe, expect, it } from 'vitest'
import { MKV_H264_DTS, MKV_HEVC, MP4_DIRECT } from '../../../shared/testing/index.ts'
import {
  durationOf,
  estimateBytes,
  ffmpegArgs,
  parseProbe,
  pickAudioStream,
  planSmooth,
  planVideo,
  probeArgs,
  progressSeconds,
  smoothEstimateBytes,
  smoothEstimateSeconds,
  smoothThreads,
  type PreparePlan,
  type ProbeResult,
} from './video-plan.ts'

/** A probe built from stream descriptions. */
function probeOf(streams: ProbeResult['streams'], duration = '100'): ProbeResult {
  return { streams, format: { duration } }
}

describe('parseProbe', () => {
  it('reads ffprobe JSON', () => {
    const probe = parseProbe(JSON.stringify(MKV_H264_DTS))
    expect(probe?.streams).toHaveLength(4)
    expect(probe?.format.duration).toBe('1379.420000')
  })

  it('answers null for anything that is not a probe', () => {
    expect(parseProbe('')).toBeNull()
    expect(parseProbe('not json')).toBeNull()
    expect(parseProbe('[]')).toBeNull()
    expect(parseProbe('{"format":{}}')).toBeNull()
  })

  it('drops streams without an index', () => {
    expect(parseProbe('{"streams":[{"codec_type":"audio"},{"index":1}],"format":{}}')?.streams).toEqual([{ index: 1 }])
  })
})

describe('durationOf', () => {
  it('prefers the container, then the longest stream', () => {
    expect(durationOf(probeOf([], '12.5'))).toBe(12.5)
    expect(durationOf({ streams: [{ index: 0, duration: '3' }, { index: 1, duration: '9.5' }], format: {} })).toBe(9.5)
    expect(durationOf({ streams: [], format: {} })).toBeNull()
  })
})

describe('pickAudioStream', () => {
  it('takes the first English track, else the first', () => {
    const spanish = { index: 1, codec_type: 'audio', tags: { language: 'spa' } }
    const english = { index: 2, codec_type: 'audio', tags: { language: 'eng' } }
    const other = { index: 3, codec_type: 'audio', tags: { language: 'EN' } }
    expect(pickAudioStream([spanish, english, other])?.index).toBe(2)
    expect(pickAudioStream([spanish, other])?.index).toBe(3)
    expect(pickAudioStream([spanish, { index: 4, codec_type: 'audio' }])?.index).toBe(1)
    expect(pickAudioStream([{ index: 0, codec_type: 'video' }])).toBeNull()
  })
})

describe('planVideo', () => {
  it('plays an mp4 with H.264 and AAC as it is', () => {
    const plan = planVideo(parseProbe(JSON.stringify(MP4_DIRECT)) as ProbeResult, 'mp4')
    expect(plan).toEqual({ kind: 'direct', duration: 60, videoCodec: 'h264', audioCodec: 'aac' })
  })

  it('plays a webm with VP9 and Opus as it is', () => {
    const plan = planVideo(
      probeOf([
        { index: 0, codec_type: 'video', codec_name: 'vp9' },
        { index: 1, codec_type: 'audio', codec_name: 'opus' },
      ]),
      'webm',
    )
    expect(plan.kind).toBe('direct')
  })

  it('remuxes the real sample: H.264 in a Matroska box with DTS sound', () => {
    const plan = planVideo(parseProbe(JSON.stringify(MKV_H264_DTS)) as ProbeResult, 'mkv')
    expect(plan).toEqual({
      kind: 'remux',
      duration: 1379.42,
      videoIndex: 0,
      audioIndex: 1,
      videoCodec: 'h264',
      audioCodec: 'dts',
    })
  })

  it('remuxes an mp4 whose sound a browser cannot play', () => {
    const plan = planVideo(
      probeOf([
        { index: 0, codec_type: 'video', codec_name: 'h264', pix_fmt: 'yuv420p' },
        { index: 1, codec_type: 'audio', codec_name: 'ac3' },
      ]),
      'mp4',
    )
    expect(plan.kind).toBe('remux')
  })

  it('remuxes a file whose English track is not its first, so the English one is what plays', () => {
    const plan = planVideo(
      probeOf([
        { index: 0, codec_type: 'video', codec_name: 'h264' },
        { index: 1, codec_type: 'audio', codec_name: 'aac', tags: { language: 'jpn' } },
        { index: 2, codec_type: 'audio', codec_name: 'aac', tags: { language: 'eng' } },
      ]),
      'mp4',
    )
    expect(plan).toMatchObject({ kind: 'remux', audioIndex: 2 })
  })

  it('remuxes an mkv that holds VP9, and an mp4 that holds an unusual box codec', () => {
    const vp9 = probeOf([
      { index: 0, codec_type: 'video', codec_name: 'vp9' },
      { index: 1, codec_type: 'audio', codec_name: 'opus' },
    ])
    expect(planVideo(vp9, 'mkv').kind).toBe('remux')
    expect(planVideo(vp9, 'mov').kind).toBe('remux')
  })

  it('keeps only the sound of HEVC, and does not re-encode it', () => {
    const plan = planVideo(parseProbe(JSON.stringify(MKV_HEVC)) as ProbeResult, 'mkv')
    expect(plan).toMatchObject({ kind: 'audio-only', videoCodec: 'hevc', audioIndex: 1, reason: 'video-codec' })
  })

  it('keeps only the sound of the other pictures a browser cannot decode', () => {
    for (const codec of ['mpeg4', 'vc1', 'mpeg2video', 'wmv3']) {
      const plan = planVideo(
        probeOf([
          { index: 0, codec_type: 'video', codec_name: codec },
          { index: 1, codec_type: 'audio', codec_name: 'aac' },
        ]),
        'mp4',
      )
      expect(plan.kind).toBe('audio-only')
    }
  })

  it('treats a 10-bit H.264 as a picture a browser cannot decode', () => {
    const plan = planVideo(
      probeOf([
        { index: 0, codec_type: 'video', codec_name: 'h264', pix_fmt: 'yuv420p10le' },
        { index: 1, codec_type: 'audio', codec_name: 'aac' },
      ]),
      'mp4',
    )
    expect(plan.kind).toBe('audio-only')
  })

  it('plays VP8 in a webm as it is, but keeps only the sound of VP8 anywhere it would need a new box', () => {
    const vp8 = [
      { index: 0, codec_type: 'video', codec_name: 'vp8' },
      { index: 1, codec_type: 'audio', codec_name: 'opus' },
    ]
    expect(planVideo(probeOf(vp8), 'webm').kind).toBe('direct')
    expect(planVideo(probeOf(vp8), 'mkv').kind).toBe('audio-only')
    // The sound is not one a browser plays, so the webm cannot be direct and VP8 cannot be remuxed.
    expect(
      planVideo(
        probeOf([
          { index: 0, codec_type: 'video', codec_name: 'vp8' },
          { index: 1, codec_type: 'audio', codec_name: 'ac3' },
        ]),
        'webm',
      ).kind,
    ).toBe('audio-only')
  })

  it('ignores a cover image when looking for the picture', () => {
    const plan = planVideo(
      probeOf([
        { index: 0, codec_type: 'video', codec_name: 'mjpeg', disposition: { attached_pic: 1 } },
        { index: 1, codec_type: 'audio', codec_name: 'aac' },
      ]),
      'mp4',
    )
    expect(plan).toMatchObject({ kind: 'audio-only', reason: 'no-video' })
  })

  it('has no plan for a file with no sound, or nothing in it', () => {
    expect(planVideo(probeOf([{ index: 0, codec_type: 'video', codec_name: 'h264' }]), 'mp4')).toMatchObject({
      kind: 'none',
      reason: 'no-audio',
    })
    expect(planVideo(probeOf([]), 'mkv')).toMatchObject({ kind: 'none', reason: 'no-streams' })
  })
})

describe('estimateBytes', () => {
  it('is the source size for a remux and the bit rate times the length for sound', () => {
    const remux = planVideo(parseProbe(JSON.stringify(MKV_H264_DTS)) as ProbeResult, 'mkv') as PreparePlan
    expect(estimateBytes(remux, 1000)).toBe(1000)
    const sound = planVideo(parseProbe(JSON.stringify(MKV_HEVC)) as ProbeResult, 'mkv') as PreparePlan
    expect(estimateBytes(sound, 1000)).toBe(12_000_000)
  })
})

describe('the ffmpeg arguments', () => {
  it('copies the picture, makes stereo AAC of the chosen sound and moves the index to the front', () => {
    const plan = planVideo(parseProbe(JSON.stringify(MKV_H264_DTS)) as ProbeResult, 'mkv') as PreparePlan
    const args = ffmpegArgs(plan, '/lib/S01E01/a.mkv', '/lib/S01E01/.lingualab/a.mp4.part')
    expect(args.slice(args.indexOf('-i'), args.indexOf('-i') + 2)).toEqual(['-i', '/lib/S01E01/a.mkv'])
    expect(args.join(' ')).toContain('-map 0:0 -map 0:1 -c:v copy -c:a aac -ac 2')
    expect(args.join(' ')).toContain('-movflags +faststart -f mp4')
    expect(args.join(' ')).toContain('-progress pipe:1')
    expect(args[args.length - 1]).toBe('/lib/S01E01/.lingualab/a.mp4.part')
  })

  it('drops the picture for a sound-only plan', () => {
    const plan = planVideo(parseProbe(JSON.stringify(MKV_HEVC)) as ProbeResult, 'mkv') as PreparePlan
    const args = ffmpegArgs(plan, '/in.mkv', '/out.m4a.part')
    expect(args).toContain('-vn')
    expect(args).not.toContain('copy')
    expect(args.join(' ')).toContain('-map 0:1')
  })

  it('never puts a shell in front of the source: every part is its own argument', () => {
    const plan = planVideo(parseProbe(JSON.stringify(MKV_H264_DTS)) as ProbeResult, 'mkv') as PreparePlan
    const source = '/lib/a b; rm -rf x/$(evil).mkv'
    expect(ffmpegArgs(plan, source, '/out').filter((arg) => arg === source)).toHaveLength(1)
    expect(probeArgs(source)[probeArgs(source).length - 1]).toBe(source)
  })
})

describe('planSmooth', () => {
  it('plans any file that has a picture and a sound, the codec being no obstacle', () => {
    const h264 = planSmooth(parseProbe(JSON.stringify(MKV_H264_DTS)) as ProbeResult)
    expect(h264).toEqual({ kind: 'smooth', duration: 1379.42, videoIndex: 0, audioIndex: 1, videoCodec: 'h264', audioCodec: 'dts' })
    // A picture a browser cannot decode is what the smooth version turns into a video.
    expect(planSmooth(parseProbe(JSON.stringify(MKV_HEVC)) as ProbeResult)).toMatchObject({ kind: 'smooth', videoCodec: 'hevc', audioCodec: 'eac3' })
    expect(planSmooth(parseProbe(JSON.stringify(MP4_DIRECT)) as ProbeResult)).toMatchObject({ kind: 'smooth', videoIndex: 0, audioIndex: 1 })
  })

  it('takes the same audio track as the other plans', () => {
    const plan = planSmooth(
      probeOf([
        { index: 0, codec_type: 'video', codec_name: 'h264' },
        { index: 1, codec_type: 'audio', codec_name: 'aac', tags: { language: 'spa' } },
        { index: 2, codec_type: 'audio', codec_name: 'aac', tags: { language: 'eng' } },
      ]),
    )
    expect(plan?.audioIndex).toBe(2)
  })

  it('has no plan without a sound, without a picture, or with only a cover image', () => {
    expect(planSmooth(probeOf([{ index: 0, codec_type: 'video', codec_name: 'h264' }]))).toBeNull()
    expect(planSmooth(probeOf([{ index: 0, codec_type: 'audio', codec_name: 'mp3' }]))).toBeNull()
    const cover = { index: 1, codec_type: 'video', codec_name: 'mjpeg', disposition: { attached_pic: 1 } }
    expect(planSmooth(probeOf([{ index: 0, codec_type: 'audio', codec_name: 'mp3' }, cover]))).toBeNull()
    expect(planSmooth(probeOf([]))).toBeNull()
  })
})

describe('the smooth estimates', () => {
  it('weigh about 1.9 Mbps and take about 1/1.5 of the length', () => {
    // 23 minutes: the episode the numbers were measured on.
    expect(smoothEstimateBytes(1380)).toBe(327_750_000)
    expect(smoothEstimateSeconds(1380)).toBe(920)
    expect(estimateBytes(planSmooth(parseProbe(JSON.stringify(MKV_H264_DTS)) as ProbeResult) as PreparePlan, 1)).toBe(327_612_250)
  })

  it('are unknown when the length is', () => {
    expect(smoothEstimateBytes(null)).toBeNull()
    expect(smoothEstimateSeconds(null)).toBeNull()
    expect(smoothEstimateBytes(0)).toBeNull()
  })
})

describe('smoothThreads', () => {
  it('leaves one core to the host, and never fewer than one thread', () => {
    expect(smoothThreads(8)).toBe(7)
    expect(smoothThreads(2)).toBe(1)
    expect(smoothThreads(1)).toBe(1)
    expect(smoothThreads(0)).toBe(1)
    expect(smoothThreads(Number.NaN)).toBe(1)
  })
})

describe('the smooth ffmpeg arguments', () => {
  const plan = planSmooth(parseProbe(JSON.stringify(MKV_H264_DTS)) as ProbeResult) as PreparePlan
  const joined = (threads?: number): string => ffmpegArgs(plan, '/in.mkv', '/out.smooth.mp4.part', threads).join(' ')

  it('encodes H.264 at veryfast, CRF 23, capped at 1.8 Mbps with a 3.6 Mbit buffer, in 8-bit 4:2:0', () => {
    expect(joined()).toContain('-c:v libx264 -preset veryfast -crf 23 -maxrate 1.8M -bufsize 3.6M -pix_fmt yuv420p')
  })

  it('caps the height at 720 lines without enlarging a smaller picture', () => {
    const args = ffmpegArgs(plan, '/in.mkv', '/out')
    // The comma inside min() is escaped, or the filter graph would read it as the end of the filter.
    expect(args[args.indexOf('-vf') + 1]).toBe('scale=-2:min(720\\,ih)')
  })

  it('puts a keyframe every two seconds whatever the frame rate', () => {
    const args = ffmpegArgs(plan, '/in.mkv', '/out')
    expect(args[args.indexOf('-force_key_frames') + 1]).toBe('expr:gte(t,n_forced*2)')
  })

  it('makes stereo AAC at 128 kb/s of the chosen sound, and moves the index to the front', () => {
    expect(joined()).toContain('-map 0:0 -map 0:1')
    expect(joined()).toContain('-c:a aac -ac 2 -b:a 128000')
    expect(joined()).toContain('-movflags +faststart -f mp4')
    expect(ffmpegArgs(plan, '/in.mkv', '/out').at(-1)).toBe('/out')
  })

  it('passes the thread count it was given', () => {
    expect(joined(3)).toContain('-threads 3')
    expect(joined(0)).toContain('-threads 1')
  })

  it('copies nothing: the picture is always re-encoded', () => {
    expect(ffmpegArgs(plan, '/in.mkv', '/out')).not.toContain('copy')
  })
})

describe('progressSeconds', () => {
  it('reads out_time_us and out_time_ms as microseconds', () => {
    expect(progressSeconds('out_time_us=2500000')).toBe(2.5)
    expect(progressSeconds('out_time_ms=2500000')).toBe(2.5)
  })

  it('reads out_time as a clock', () => {
    expect(progressSeconds('out_time=00:01:02.500000')).toBe(62.5)
    expect(progressSeconds('out_time=01:00:00.000000')).toBe(3600)
  })

  it('ignores every other line, and a position that is not there yet', () => {
    expect(progressSeconds('frame=120')).toBeNull()
    expect(progressSeconds('progress=continue')).toBeNull()
    expect(progressSeconds('out_time_us=N/A')).toBeNull()
    expect(progressSeconds('out_time=N/A')).toBeNull()
    expect(progressSeconds('out_time=-00:00:00.033333')).toBeNull()
    expect(progressSeconds('no equals sign')).toBeNull()
  })
})
