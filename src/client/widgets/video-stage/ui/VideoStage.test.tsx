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
import { STYLES } from '../../../shared/lib/styles.ts'
import type { VideoState, VideoStatusPayload } from '../../../shared/protocol.ts'
import type { LocalFileProps } from './LocalFileActions.tsx'
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
    jobKind: null,
    smooth: { offer: false, estimateBytes: null, estimateSeconds: null, revert: false, error: null },
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
    local: null,
    ...patch,
  }
}

/** The local file's props: nothing chosen, nothing remembered, no picker that remembers. */
function local(patch: Partial<LocalFileProps> = {}): LocalFileProps {
  return {
    name: null,
    remembered: null,
    canPick: false,
    onPick: () => undefined,
    onFile: () => undefined,
    onResume: () => undefined,
    onForget: () => undefined,
    onStop: () => undefined,
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

  it('buffers ahead before play is pressed, so a slow link has the sentence ready', () => {
    expect(html()).toContain('preload="auto"')
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

  it('says whether a picture is on the stage, so the timing layout can tell it from a card or a chip', () => {
    expect(html()).toContain('dsh-lingualab-videostage is-shown has-screen')
    expect(html({ picture: 'large' })).toContain('dsh-lingualab-videostage is-large has-screen')
    expect(html({ playing: false, card: 'prepare', status: status('prepare') })).not.toContain('has-screen')
    expect(html({ picture: 'hidden' })).not.toContain('has-screen')
  })

  it('shows only a chip when hidden, and still has the element that plays the sound', () => {
    const markup = html({ picture: 'hidden' })
    expect(markup).toContain('dsh-lingualab-videostage is-hidden')
    expect(markup).toContain('pictureHiddenChip')
    expect(markup).toContain('dsh-lingualab-picture is-off')
    expect(markup).toContain('<video')
  })
})

describe('the large frame', () => {
  /** The rule block of a selector, from the stylesheet the page ships. */
  const rule = (selector: string): string => {
    const start = STYLES.indexOf(`${selector}{`)
    expect(start).toBeGreaterThanOrEqual(0)
    return STYLES.slice(start, STYLES.indexOf('}', start))
  }

  it('asks the stylesheet for a frame of the video shape, 16:9 until the real one is known', () => {
    const markup = html({ picture: 'large' })
    expect(markup).toContain('--ll-video-ratio:1.7778')
  })

  it('gives a shown picture the video shape too, for the timing layout, while its own frame stays 16:9', () => {
    expect(html({ picture: 'shown' })).toContain('--ll-video-ratio:1.7778')
    expect(rule('.dsh-lingualab-picture')).toContain('aspect-ratio:16/9')
  })

  it('leaves the other states on the stylesheet own 16:9', () => {
    expect(html({ picture: 'hidden' })).not.toContain('--ll-video-ratio')
    // No picture to enlarge: the card state keeps the usual size.
    expect(html({ playing: false, picture: 'large', card: 'prepare', status: status('prepare') })).not.toContain('--ll-video-ratio')
  })

  it('makes the stage a size container and the frame the biggest box of the video shape that fits, at most 1100px wide', () => {
    expect(rule('.dsh-lingualab-videostage.is-large')).toContain('container:ll-video/size')
    expect(rule('.dsh-lingualab-videostage.is-large')).toContain('flex:1')
    // A floor, not zero: with the timing panel open the frame stays a picture and the column's scroller takes the rest.
    expect(rule('.dsh-lingualab-videostage.is-large')).toContain('min-height:160px')
    const frame = rule('.dsh-lingualab-videostage.is-large .dsh-lingualab-picture')
    expect(frame).toContain('aspect-ratio:var(--ll-video-ratio,1.7778)')
    // The old frame filled the stage's height, which is what left the bars; nothing may stretch it again.
    expect(frame).not.toContain('flex:1')
    expect(frame).toContain('flex:none')
    expect(frame).toContain('min-width:0')
    expect(STYLES).toContain('width:min(100cqw,1100px,calc(100cqh * var(--ll-video-ratio,1.7778)))')
  })

  it('does not touch the shown and hidden states', () => {
    expect(rule('.dsh-lingualab-videostage.is-shown')).toBe('.dsh-lingualab-videostage.is-shown{padding:20px 12px 0')
    expect(rule('.dsh-lingualab-videostage.is-hidden')).toBe('.dsh-lingualab-videostage.is-hidden{padding:14px 12px 0')
    const base = rule('.dsh-lingualab-picture')
    // 64% of the column and 720px at most, and 42% of the column's height (42vh where container units are unknown); the
    // responsive rules change the two variables, so the width follows a height cap at 16:9.
    expect(base).toContain('--ll-pic-w:64%')
    expect(base).toContain('--ll-pic-h:42vh')
    expect(base).toContain('width:min(var(--ll-pic-w),720px,calc(var(--ll-pic-h) * 16 / 9))')
    expect(base).toContain('aspect-ratio:16/9')
    expect(base).toContain('max-height:var(--ll-pic-h)')
    expect(STYLES).toContain('{.dsh-lingualab-picture{--ll-pic-h:42cqh}}')
  })

  it('puts the badge, the peek button and the caption on the frame, not on the stage', () => {
    expect(rule('.dsh-lingualab-picture')).toContain('position:relative')
    for (const selector of ['.dsh-lingualab-picture-badge', '.dsh-lingualab-picture-peek', '.dsh-lingualab-picture-caption']) {
      expect(rule(selector)).toContain('position:absolute')
    }
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

  it('says whether a card is drawn, so the page can step it down in a short column', () => {
    expect(html({ playing: false, card: 'prepare', status: status('prepare') })).toContain('dsh-lingualab-videostage is-shown has-card')
    expect(html({ playing: false, card: 'unplayable', cardOpen: true, status: status('unplayable') })).toContain('has-card')
    // A picture, a chip, a label, an empty stage and a card with nothing to say are not a card.
    expect(html()).not.toContain('has-card')
    expect(html({ picture: 'hidden' })).not.toContain('has-card')
    expect(html({ playing: false, picture: 'hidden', card: 'prepare', status: status('prepare') })).not.toContain('has-card')
    expect(html({ playing: false, card: 'unplayable', cardOpen: false, status: status('unplayable') })).not.toContain('has-card')
    expect(html({ playing: false, card: null, status: null })).not.toContain('has-card')
    expect(html({ playing: false, card: 'prepare', status: null })).not.toContain('has-card')
  })

  it('draws the parts a step down drops under the classes the stylesheet names, so the steps can find them', () => {
    const prepare = html({ playing: false, card: 'prepare', status: status('prepare', { smooth: { ...status('prepare').smooth, offer: true } }), local: local() })
    for (const part of [
      'dsh-lingualab-videocard-icon',
      'dsh-lingualab-videocard-title',
      'dsh-lingualab-videocard-sub is-mono',
      'dsh-lingualab-videocard-body',
      'dsh-lingualab-videocard-note',
      'dsh-lingualab-smoothoffer',
      'dsh-lingualab-localactions',
      'dsh-lingualab-spacer',
    ]) {
      expect(prepare).toContain(part)
    }
    expect(html({ playing: false, card: 'preparing', status: status('preparing', { progress: { fraction: 0.4, seconds: 40, total: 100 } }) })).toContain(
      'dsh-lingualab-bar is-thick',
    )
  })

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

describe('the smooth version', () => {
  /** The smooth fields of a status, offered unless the patch says otherwise. */
  const smooth = (patch: Partial<VideoStatusPayload['smooth']> = {}): VideoStatusPayload['smooth'] => ({
    offer: true,
    estimateBytes: 330_000_000,
    estimateSeconds: 920,
    revert: false,
    error: null,
    ...patch,
  })
  const playing = (patch: Partial<VideoStatusPayload> = {}): VideoStatusPayload =>
    status('playable', { url: '/v.mp4', via: 'direct', smooth: smooth(), ...patch })

  it('offers 「准备流畅版」 in the corner of a picture that plays, with the estimate beside it', () => {
    const markup = html({ status: playing() })
    expect(markup).toContain('dsh-lingualab-picture-smooth')
    expect(markup).toContain('smoothAction')
    expect(markup).toContain('title="smoothHint"')
    expect(markup).toContain('>smoothEstimate[size=315 MB;minutes=16]<')
  })

  it('gives the estimate in the corner a title with the full sentence, so a cut line can still be read', () => {
    const markup = html({ status: playing() })
    expect(markup).toContain('title="smoothEstimateTitle[size=315 MB;minutes=16]"')
    expect(html({ status: playing({ smooth: smooth({ estimateSeconds: 30 }) }) })).toContain('title="smoothEstimateShortTitle[size=315 MB]"')
    expect(html({ status: playing({ smooth: smooth({ estimateSeconds: null }) }) })).toContain('title="smoothEstimateSizeTitle[size=315 MB]"')
  })

  it('says nothing where it cannot be made, and says no estimate when the length is not known', () => {
    expect(html({ status: playing({ smooth: smooth({ offer: false }) }) })).not.toContain('dsh-lingualab-picture-smooth')
    const markup = html({ status: playing({ smooth: smooth({ estimateBytes: null, estimateSeconds: null }) }) })
    expect(markup).toContain('smoothAction')
    expect(markup).not.toContain('smoothEstimate')
  })

  it('labels the smooth file that plays and offers the way back', () => {
    const markup = html({ status: playing({ via: 'smooth', smooth: smooth({ offer: false, revert: true }) }) })
    expect(markup).toContain('title="smoothLabel">smoothLabel<')
    expect(markup).toContain('smoothRevert')
    expect(markup).not.toContain('smoothAction')
  })

  it('keeps the picture and shows the progress with 「取消」 while a smooth job runs', () => {
    const markup = html({
      eta: 300,
      status: playing({ jobKind: 'smooth', progress: { fraction: 0.4, seconds: 40, total: 100 }, smooth: smooth({ offer: false }) }),
    })
    expect(markup).toContain('smoothRunning[percent=40]')
    expect(markup).toContain('cardPreparingEtaMinutes[minutes=5]')
    expect(markup).toContain('title="smoothRunning[percent=40] · cardPreparingEtaMinutes[minutes=5]"')
    expect(markup).toContain('cardCancel')
    expect(markup).not.toContain('dsh-lingualab-videocard')
    expect(markup).not.toContain('dsh-lingualab-picture is-off')
  })

  it('shows the time left in seconds when it is short', () => {
    const markup = html({ eta: 45, status: playing({ jobKind: 'smooth', progress: { fraction: 0.4, seconds: 40, total: 100 } }) })
    expect(markup).toContain('cardPreparingEta[seconds=45]')
  })

  it('says why the last job failed, and why a request was refused, under the control', () => {
    expect(html({ status: playing({ smooth: smooth({ error: 'Conversion failed' }) }) })).toContain('smoothError[reason=Conversion failed]')
    expect(html({ status: playing({ ok: false, reason: 'busy with another' }) })).toContain('busy with another')
  })

  it('is left out while the reader own file plays, while the picture is hidden and in no card', () => {
    expect(html({ local: local({ name: 'ep1.mp4' }) })).not.toContain('dsh-lingualab-picture-smooth')
    expect(html({ picture: 'hidden', status: playing() })).not.toContain('dsh-lingualab-picture-smooth')
  })

  it('moves to the left of a large picture, clear of the peek button', () => {
    const start = STYLES.indexOf('.dsh-lingualab-videostage.is-large .dsh-lingualab-picture-smooth{')
    expect(start).toBeGreaterThanOrEqual(0)
    expect(STYLES.slice(start, STYLES.indexOf('}', start))).toContain('left:14px')
    expect(html({ picture: 'large', status: playing() })).toContain('dsh-lingualab-picture-smooth')
  })

  const asking: readonly [CardKind, VideoState][] = [
    ['prepare', 'prepare'],
    ['sound-only', 'sound-only'],
    ['sound-ready', 'sound-ready'],
    ['unplayable', 'unplayable'],
  ]
  for (const [card, state] of asking) {
    it(`is offered at the foot of the ${card} card, with what it does and what it costs`, () => {
      const markup = html({ playing: false, card, cardOpen: true, status: status(state, { videoCodec: 'hevc', smooth: smooth() }) })
      expect(markup).toContain('smoothAction')
      expect(markup).toContain('dsh-lingualab-videocard-note">smoothEstimateTitle[size=315 MB;minutes=16]<')
      expect(markup).toContain('dsh-lingualab-videocard-note">smoothHint')
    })

    it(`is not offered on the ${card} card when it cannot be made`, () => {
      const markup = html({ playing: false, card, cardOpen: true, status: status(state, { videoCodec: 'hevc', smooth: smooth({ offer: false }) }) })
      expect(markup).not.toContain('smoothAction')
    })
  }

  it('says on the card why the last smooth job failed, and offers it again', () => {
    const markup = html({ playing: false, card: 'prepare', status: status('prepare', { smooth: smooth({ error: 'Disk full' }) }) })
    expect(markup).toContain('smoothError[reason=Disk full]')
    expect(markup).toContain('smoothAction')
  })

  it('titles the progress card as the smooth version while that job runs', () => {
    const progress = { fraction: 0.1, seconds: 10, total: 100 }
    const smoothJob = html({ playing: false, card: 'preparing', status: status('preparing', { jobKind: 'smooth', progress }) })
    expect(smoothJob).toContain('cardPreparingTitleSmooth')
    expect(smoothJob).toContain('cardPreparingSubSmooth')
    const plain = html({ playing: false, card: 'preparing', status: status('preparing', { jobKind: 'video', progress }) })
    expect(plain).toContain('cardPreparingTitle')
    expect(plain).not.toContain('cardPreparingTitleSmooth')
  })

  it('does not put the offer on the failed, ffmpeg or progress cards', () => {
    for (const [card, state] of [['failed', 'failed'], ['no-ffmpeg', 'no-ffmpeg'], ['preparing', 'preparing']] as const) {
      expect(html({ playing: false, card, status: status(state, { smooth: smooth() }) })).not.toContain('smoothAction')
    }
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

describe('a video from the reader own disk', () => {
  it('offers nothing for a segment with no video file', () => {
    const markup = html({ local: null })
    expect(markup).not.toContain('localFileUse')
    expect(markup).not.toContain('dsh-lingualab-picture-local')
  })

  it('puts a small action on the picture that plays, with the formats in its tooltip', () => {
    const markup = html({ local: local() })
    expect(markup).toContain('dsh-lingualab-picture-local')
    expect(markup).toContain('localFileUse')
    expect(markup).toContain('title="localFileHint"')
  })

  it('is a file input that takes video (and mkv, which some browsers give no type) where there is no picker that remembers', () => {
    const markup = html({ local: local({ canPick: false }) })
    expect(markup).toContain('type="file"')
    expect(markup).toContain('accept="video/*,.mkv"')
    expect(markup).not.toContain('multiple')
  })

  it('is a button that opens the picker where there is one', () => {
    const markup = html({ local: local({ canPick: true }) })
    expect(markup).not.toContain('type="file"')
    expect(markup).toContain('<button type="button" class="dsh-lingualab-picture-local-btn" title="localFileHint">localFileUse</button>')
  })

  it('offers the remembered file with its name, a way to forget it, and the choice of another', () => {
    const markup = html({ local: local({ remembered: 'ep1.mp4', canPick: true }) })
    expect(markup).toContain('localFileResume[name=ep1.mp4]')
    expect(markup).toContain('localFileForget')
    expect(markup).toContain('localFileUse')
  })

  it('labels the file that plays, with its name as the tooltip and a way to stop using it', () => {
    const markup = html({ local: local({ name: 'ep1.mp4', remembered: 'ep1.mp4' }) })
    expect(markup).toContain('localFileBadge')
    expect(markup).toContain('title="ep1.mp4"')
    expect(markup).toContain('localFileStop')
    // What it replaces is not offered while it plays.
    expect(markup).not.toContain('localFileUse')
    expect(markup).not.toContain('localFileResume')
  })

  it('keeps the label (and the way to stop) while the picture is hidden and the audio file plays', () => {
    const markup = html({ picture: 'hidden', local: local({ name: 'ep1.mp4' }) })
    expect(markup).toContain('pictureHiddenChip')
    expect(markup).toContain('localFileBadge')
    expect(markup).toContain('localFileStop')
  })

  const cards: readonly [CardKind, VideoState][] = [
    ['prepare', 'prepare'],
    ['preparing', 'preparing'],
    ['no-ffmpeg', 'no-ffmpeg'],
    ['sound-only', 'sound-only'],
    ['sound-ready', 'sound-ready'],
    ['failed', 'failed'],
    ['unplayable', 'unplayable'],
  ]
  for (const [card, state] of cards) {
    it(`ends the ${card} card with the action and the hint about formats`, () => {
      const markup = html({
        playing: false,
        card,
        cardOpen: true,
        local: local({ canPick: true }),
        status: status(state, { installCommand: 'winget install Gyan.FFmpeg' }),
      })
      expect(markup).toContain('dsh-lingualab-videocard')
      expect(markup).toContain('localFileUse')
      expect(markup).toContain('dsh-lingualab-videocard-note">localFileHint')
    })
  }

  it('does not add the action to a card for a segment with no video file', () => {
    expect(html({ playing: false, card: 'prepare', status: status('prepare') })).not.toContain('localFileUse')
  })
})
