// @vitest-environment node
/**
 * What the video's slot draws in each state, rendered to static markup (there is no DOM in these tests, and
 * the slot has no effect that matters to what it draws).
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CardKind } from '../../../features/video/index.ts'
import type { VideoState, VideoStatusPayload } from '../../../shared/protocol.ts'
import { VideoNotice, VideoStage, type VideoStageProps } from './VideoStage.tsx'

const renderToStaticMarkup = render as (element: ReactElement) => string

/** A translator that shows the key and its parameters, so the markup says which string was asked for. */
const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? key : `${key}[${Object.entries(params).map(([name, value]) => `${name}=${String(value)}`).join(';')}]`

function status(state: VideoState, patch: Partial<VideoStatusPayload> = {}): VideoStatusPayload {
  return {
    ok: true,
    reason: null,
    state,
    file: 'a.mkv',
    bytes: 1_181_116_006,
    url: null,
    via: null,
    videoCodec: 'h264',
    audioCodec: 'dts',
    duration: 100,
    mismatch: null,
    estimateBytes: 1_181_116_006,
    progress: null,
    installCommand: null,
    ...patch,
  }
}

/** The props of a segment whose video plays, which each test changes a little. */
function props(patch: Partial<VideoStageProps> = {}): VideoStageProps {
  return {
    t,
    mediaRef: () => undefined,
    picture: 'shown',
    playing: true,
    status: status('playable', { url: '/v.mp4', via: 'prepared' }),
    card: null,
    cardOpen: false,
    hasAudioFile: true,
    busy: false,
    eta: null,
    caption: null,
    onPeek: () => undefined,
    onPrepare: () => undefined,
    onCancel: () => undefined,
    onCardShow: () => undefined,
    onCardHide: () => undefined,
    onShowPicture: () => undefined,
    ...patch,
  }
}

const html = (patch: Partial<VideoStageProps> = {}): string => renderToStaticMarkup(<VideoStage {...props(patch)} />)

describe('a video that plays', () => {
  it('shows the picture above the sentence, with the clock and no card', () => {
    const markup = html()
    expect(markup).toContain('dsh-lingualab-videostage is-shown')
    expect(markup).toContain('<video')
    expect(markup).not.toContain('is-off')
    expect(markup).toContain('dsh-lingualab-picture-time')
    expect(markup).not.toContain('dsh-lingualab-videocard')
  })

  it('gives the picture the whole stage when large, with a button to peek at the sentence', () => {
    const markup = html({ picture: 'large' })
    expect(markup).toContain('dsh-lingualab-videostage is-large')
    expect(markup).toContain('pictureLargeBadge')
    expect(markup).toContain('peekSentence')
    expect(markup).not.toContain('dsh-lingualab-picture-time')
  })

  it('shows the English of the sentence as a caption on the large picture once it was peeked at', () => {
    const markup = html({ picture: 'large', caption: 'I tried, but my phone died.' })
    expect(markup).toContain('dsh-lingualab-picture-caption')
    expect(markup).toContain('I tried, but my phone died.')
    expect(markup).not.toContain('peekSentence')
  })

  it('never shows a caption outside the large state', () => {
    expect(html({ picture: 'shown', caption: 'secret' })).not.toContain('secret')
  })

  it('shows only a chip when hidden, and still has the element that plays the sound', () => {
    const markup = html({ picture: 'hidden' })
    expect(markup).toContain('dsh-lingualab-videostage is-hidden')
    expect(markup).toContain('pictureHiddenChip')
    expect(markup).toContain('dsh-lingualab-picture is-off')
    expect(markup).toContain('<video')
  })
})

describe('no picture to play', () => {
  const asking: readonly [CardKind, VideoState, string][] = [
    ['prepare', 'prepare', 'cardPrepareAction'],
    ['preparing', 'preparing', 'cardCancel'],
    ['no-ffmpeg', 'no-ffmpeg', 'cardFfmpegTitle'],
    ['failed', 'failed', 'cardRetry'],
  ]

  for (const [card, state, text] of asking) {
    it(`draws the ${card} card in the picture's place, in full whatever was seen before`, () => {
      const markup = html({ playing: false, card, status: status(state, { installCommand: 'winget install Gyan.FFmpeg' }) })
      expect(markup).toContain('dsh-lingualab-videocard')
      expect(markup).toContain(text)
      // The element is there, and not displayed: it still plays the audio file.
      expect(markup).toContain('dsh-lingualab-picture is-off')
    })
  }

  it('says what the prepare card is about: the file, the size and why', () => {
    const markup = html({ playing: false, card: 'prepare', status: status('prepare') })
    expect(markup).toContain('a.mkv · 1.1 GB')
    expect(markup).toContain('cardPrepareAudio[codec=DTS]')
    expect(markup).toContain('cardPrepareSize')
    expect(markup).toContain('cardPrepareNote')
  })

  it('does not promise the audio keeps playing for a segment with no audio file of its own', () => {
    const markup = html({ playing: false, hasAudioFile: false, card: 'prepare', status: status('prepare') })
    expect(markup).toContain('cardPrepareNoteNoAudio')
    expect(markup).not.toContain('"cardPrepareNote"')
  })

  it('draws progress as a percentage with the time done and the time left', () => {
    const markup = html({
      playing: false,
      card: 'preparing',
      eta: 35,
      status: status('preparing', { progress: { fraction: 0.42, seconds: 580, total: 1379 } }),
    })
    expect(markup).toContain('width:42%')
    expect(markup).toContain('cardPreparingPercent[percent=42;done=09:40;total=22:59]')
    expect(markup).toContain('cardPreparingEta[seconds=35]')
  })

  it('shows the install command and the config field on the ffmpeg card', () => {
    const markup = html({ playing: false, card: 'no-ffmpeg', status: status('no-ffmpeg', { installCommand: 'winget install Gyan.FFmpeg' }) })
    expect(markup).toContain('winget install Gyan.FFmpeg')
    expect(markup).toContain('ffmpegPath')
    expect(markup).toContain('cardCopy')
  })

  it('offers only the sound, with the picture codec, on the sound-only card', () => {
    const markup = html({
      playing: false,
      hasAudioFile: false,
      card: 'sound-only',
      cardOpen: true,
      status: status('sound-only', { videoCodec: 'hevc' }),
    })
    expect(markup).toContain('cardSoundAction')
    expect(markup).toContain('cardSoundCodec[codec=HEVC]')
  })

  it('draws a card that only informs in full the first time, and as a small label after', () => {
    const open = html({ playing: false, card: 'unplayable', cardOpen: true, status: status('unplayable', { videoCodec: 'hevc' }) })
    expect(open).toContain('dsh-lingualab-videocard')
    expect(open).toContain('cardUnplayableCodec[codec=HEVC]')
    expect(open).toContain('cardUnplayableAudio')

    const closed = html({ playing: false, card: 'unplayable', cardOpen: false, status: status('unplayable') })
    expect(closed).not.toContain('dsh-lingualab-videocard')
    expect(closed).toContain('videoLabelUnplayable')
  })

  it('hides every card when the picture is hidden, leaving a label that brings it back', () => {
    const asked = html({ playing: false, picture: 'hidden', card: 'prepare', status: status('prepare') })
    expect(asked).not.toContain('dsh-lingualab-videocard')
    expect(asked).toContain('videoLabelPrepare')
    const informed = html({ playing: false, picture: 'hidden', card: 'unplayable', cardOpen: true, status: status('unplayable') })
    expect(informed).not.toContain('dsh-lingualab-videocard')
    expect(informed).toContain('videoLabelUnplayable')
  })

  it('treats large as shown when there is no picture to enlarge', () => {
    expect(html({ playing: false, picture: 'large', card: 'prepare', status: status('prepare') })).toContain('is-shown')
  })

  it('takes no room when there is nothing to say', () => {
    expect(html({ playing: false, card: null, status: null })).toContain('dsh-lingualab-videostage is-empty')
  })
})

describe('the notice bar', () => {
  it('draws the text and, when there is one, its action', () => {
    const ready = renderToStaticMarkup(<VideoNotice notice={{ kind: 'ready', text: 'ready at 09:41', action: null }} onAction={() => undefined} />)
    expect(ready).toContain('role="status"')
    expect(ready).toContain('ready at 09:41')
    expect(ready).not.toContain('<button')
    const blind = renderToStaticMarkup(<VideoNotice notice={{ kind: 'blind', text: 'blind', action: 'undo' }} onAction={() => undefined} />)
    expect(blind).toContain('<button')
    expect(blind).toContain('undo')
  })
})
