// @vitest-environment node
/**
 * The hook's choice and its buttons, rendered to a string: the render picks the notice from what it is handed, and
 * calling the callbacks outside it checks what each does to the settings store and to the page's notice. The timers are
 * effects and do not run in a string render, and a string render reads the stores' initial state (zustand serves that
 * to a server render), so what depends on a store value set beforehand (a microphone problem, the picture to restore)
 * is `notices.test.ts`'s: which notice wins and what its button does are decided there.
 */
import type { Dispatch, ReactElement, SetStateAction } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { useSettings } from '../../../features/settings/index.ts'
import type { VideoNoticeData } from '../../../widgets/video-stage/index.ts'
import { useVideoNotices, type VideoNotices, type VideoNoticesOptions } from './useVideoNotices.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

const t = (key: string): string => key

const raised = (kind: VideoNoticeData['kind']): VideoNoticeData => ({ kind, text: kind, action: 'ok' })

function setup(over: Partial<VideoNoticesOptions> = {}) {
  const setNotice = vi.fn() as unknown as Dispatch<SetStateAction<VideoNoticeData | null>> & ReturnType<typeof vi.fn>
  const options: VideoNoticesOptions = {
    t,
    notice: null,
    setNotice,
    episodeId: 'E1',
    segmentId: null,
    sourcePicture: false,
    videoPlays: true,
    local: { url: null, mismatch: null },
    servedMismatch: null,
    ...over,
  }
  let notices: VideoNotices | undefined
  function Probe() {
    notices = useVideoNotices(options)
    return <span>probe</span>
  }
  renderToStaticMarkup(<Probe />)
  if (notices === undefined) throw new Error('the hook did not render')
  return { notices, setNotice }
}

beforeEach(() => {
  useMediaPlayer.setState({ micNotice: null })
  useSettings.setState({ picture: 'shown', pictureRestore: null })
})

describe('useVideoNotices: what shows', () => {
  it('shows nothing when there is nothing to say', () => {
    expect(setup().notices.shown).toBeNull()
  })

  it('shows the notice the page raised', () => {
    const ready = raised('ready')
    expect(setup({ notice: ready }).notices.shown).toBe(ready)
  })

  it('shows the length warning while a picture plays', () => {
    const { notices } = setup({ sourcePicture: true, servedMismatch: 8 })
    expect(notices.shown).toEqual({ kind: 'mismatch', text: 'noticeMismatch', action: 'cardGotIt' })
  })

  it('has no length warning while only the audio plays', () => {
    expect(setup({ sourcePicture: false, servedMismatch: 8 }).notices.shown).toBeNull()
  })
})

describe('useVideoNotices: the button', () => {
  it('does nothing when no notice shows', () => {
    const { notices, setNotice } = setup()
    notices.onAction()
    expect(setNotice).not.toHaveBeenCalled()
  })

  it('drops an ordinary notice', () => {
    const { notices, setNotice } = setup({ notice: raised('ready') })
    notices.onAction()
    expect(setNotice).toHaveBeenCalledWith(null)
  })
})

describe('useVideoNotices: the blind watch', () => {
  it('shows the notice and switches the picture to large when the timer starts and a video plays', () => {
    const { notices, setNotice } = setup({ videoPlays: true })
    notices.onBlindRunning(true)
    expect(useSettings.getState().picture).toBe('large')
    expect(setNotice).toHaveBeenCalledWith({ kind: 'blind', text: 'noticeBlind', action: 'noticeUndo' })
  })

  it('has nothing to switch without a video that plays', () => {
    const { notices, setNotice } = setup({ videoPlays: false })
    notices.onBlindRunning(true)
    expect(useSettings.getState().picture).toBe('shown')
    expect(setNotice).not.toHaveBeenCalled()
  })

  it('says nothing when the picture was already large', () => {
    useSettings.setState({ picture: 'large' })
    const { notices, setNotice } = setup()
    notices.onBlindRunning(true)
    expect(setNotice).not.toHaveBeenCalled()
  })

  it('puts the picture back and takes only its own notice away when the timer stops', () => {
    useSettings.setState({ picture: 'large', pictureRestore: 'shown' })
    const { notices, setNotice } = setup()
    notices.onBlindRunning(false)
    expect(useSettings.getState().picture).toBe('shown')
    const update = setNotice.mock.calls[0]?.[0] as (current: VideoNoticeData | null) => VideoNoticeData | null
    expect(update(raised('blind'))).toBeNull()
    const other = raised('ready')
    expect(update(other)).toBe(other)
    expect(update(null)).toBeNull()
  })
})
