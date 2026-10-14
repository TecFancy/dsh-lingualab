/**
 * Recording the speaking pauses and playing the takes back: the browser half of the comparison.
 *
 * The store holds the intent (a speaking pause is waiting, a comparison is at its `take` stage) and this hook
 * does what the intent needs of the browser, so everything the reader can do to playback ends it the same way:
 * the store drops the pause or the comparison, the effect below is cleaned up, and the recording stops or the
 * take goes quiet. Nothing here decides anything; the order of things is the store's and `planShadow`'s.
 *
 * The take is played on one shared `Audio` element that a gesture unlocked earlier (see `take-player.ts`): iOS
 * refuses sound from an element that was never played inside a gesture, and this effect runs long after the last
 * touch. The page and the control bar call `primeTakeAudio` from the gestures that can lead here.
 *
 * Called once, from {@link useMediaBinding}, beside the timeout that ends a pause.
 */
import { useEffect } from 'react'
import { useMediaPlayer } from '../model/store.ts'
import { recordPause } from './recorder.ts'
import { playTake } from './take-player.ts'

/** Record each speaking pause while recording is on, and play the take at the second stage of a comparison. */
export function useTakes(): void {
  const record = useMediaPlayer((state) => state.shadow.record)
  const wait = useMediaPlayer((state) => state.shadowWait)
  const compare = useMediaPlayer((state) => state.compare)
  const takes = useMediaPlayer((state) => state.takes)
  const capturing = useMediaPlayer((state) => state.capturing)

  // One recording per speaking pause: it opens with the pause and ends with it, however the pause ends. A pause
  // the reader cuts short keeps what was said so far (the recorder drops anything too short to be a try).
  const recordFor = record && wait !== null && wait.phase === 'speak' ? wait.index : null
  const recordPauseId = wait?.until ?? 0
  useEffect(() => {
    if (recordFor === null) return
    const epoch = useMediaPlayer.getState().takesEpoch
    return recordPause({
      started: () => useMediaPlayer.getState().captureStarted(),
      failed: (reason) => useMediaPlayer.getState().micFailed(reason),
      finished: (recorded) => {
        const take =
          recorded === null ? null : { url: URL.createObjectURL(recorded.blob), mime: recorded.mime, ms: recorded.ms }
        useMediaPlayer.getState().captureFinished(recordFor, take, epoch)
      },
    })
  }, [recordFor, recordPauseId])

  // The take, once the sentence before it has played and the recording of it has been handed in. It plays on the
  // shared element, which stays put between takes.
  const takeFor = compare?.stage === 'take' ? compare.index : null
  const take = takeFor === null ? undefined : takes[takeFor]
  useEffect(() => {
    if (takeFor === null || capturing > 0) return
    if (take === undefined) {
      // Nothing was kept (too short, or the recording failed): the comparison is just the sentence.
      useMediaPlayer.getState().endCompare()
      return
    }
    return playTake(take, {
      ended: () => useMediaPlayer.getState().endCompare(),
      failed: () => {
        useMediaPlayer.setState({ micNotice: 'blocked' })
        useMediaPlayer.getState().endCompare()
      },
    })
  }, [takeFor, take, capturing])

  // The page closing (or the player going away) lets go of the takes.
  useEffect(() => () => useMediaPlayer.getState().dropTakes(), [])
}
