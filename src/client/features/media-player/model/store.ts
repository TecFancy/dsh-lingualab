/**
 * Player state, and the rules that keep the scrubber honest.
 *
 * Two things here are worth reading before changing anything.
 *
 * **The seek gate.** When playback is moved programmatically, the browser keeps
 * emitting `timeupdate` for the position it had a moment ago. Written straight
 * through, that stale value puts the scrubber back where it was, and — worse — a
 * loop that wraps on it counts a pass that never played and can stop a repeat
 * early. So a programmatic seek raises a guard, every reported position is
 * dropped while the guard is up, and the guard comes down on the element's own
 * `seeked` event (see `useAudioBinding`). A timeout backs it up, because a seek
 * that never completes must not freeze the clock forever.
 *
 * **The loop decision.** Wrapping is delegated to {@link planLoop}, a pure
 * function with its own tests. This file owns the state it reads and the effects
 * it implies, nothing else.
 *
 * **The lead-in.** Subtitles found in the wild often start a beat after the voice,
 * so jumping to a sentence's start clips its first syllable. With a lead-in set,
 * every jump *to a sentence* (stepping, looping it, replaying it, rewinding after
 * shadowing) starts that much earlier. The playhead is then inside the previous
 * sentence, so the store remembers which sentence it is running up to and keeps
 * that one active until the start is reached: otherwise the previous sentence
 * would be the one looped, or the one shadowing pauses after. A seek to a plain
 * time (the scrubber, a bookmark) and the timing strip never get a lead-in.
 *
 * **The shadowing program.** With shadowing on and no loop, the end of a sentence is handed to
 * {@link planShadow}: play it again, wait out a speaking pause, go on to the next one, or stop.
 * A pause is a state, not a timer: the store records which sentence it belongs to and when it ends,
 * the media binding owns the timeout, and anything the reader does (play or pause, a step, a seek,
 * a loop) drops the pause and starts the sentence's count again, so no stray timeout acts later.
 *
 * **Recording and comparing.** With the microphone on, a speaking pause is recorded (the hook in `useTakes` owns the
 * recorder; `capturing` says one is live) and when the pause ends the program hands over to a comparison: the
 * sentence once more through the source, then the take through a short-lived audio element while the source waits
 * at the sentence's start. `compare` is that step, and it is part of the program like a pause is: `IDLE_PROGRAM`
 * drops it, which stops the take, so the 对比 key and every other way of moving playback end it cleanly. The takes
 * are the last recording of each sentence, in memory only, dropped (and their URLs revoked) with the cue list.
 */
import { create } from 'zustand'
import { findActiveCue, type Cue } from '../../../entities/cue/index.ts'
import { loopWindow, planLoop, stepCueIndex, type LoopMode } from '../lib/loop.ts'
import {
  DEFAULT_SHADOW,
  mergeShadow,
  parseShadowSettings,
  planShadow,
  shadowPauseMs,
  type ShadowPhase,
  type ShadowPlan,
  type ShadowSettings,
} from '../lib/shadow.ts'
import { probeMic, type MicFailure } from '../lib/recorder.ts'
import { NO_TAKES, allTakes, putTake, revokeTake, type MicNotice, type Take, type Takes } from '../lib/take.ts'

/** Ten steps, all of them pitch-preserving. Ported from the repealed repeater app. */
export const SPEED_PRESETS: readonly number[] = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.25, 1.5, 2]

/** Where the default speed sits in {@link SPEED_PRESETS}. */
export const DEFAULT_SPEED_INDEX = 5

/** How long a programmatic seek may keep ignoring reported positions. */
const SEEK_GUARD_MS = 1200

/** How far past a sentence's end a position still counts as having just finished it. */
const SHADOW_WINDOW_S = 1.5

/** How many times a wrap repeats before the loop stops by itself. `0` is endless. */
const DEFAULT_REPEATS = 0

/** The lead-ins offered, in seconds; `0` is off. */
export const LEAD_IN_CHOICES: readonly number[] = [0, 0.1, 0.2, 0.3, 0.5]

/** Where the chosen lead-in is remembered, per browser. */
const LEAD_IN_KEY = 'dsh-lingualab:lead-in'

/** Where the shadowing settings are remembered, per browser. */
const SHADOW_KEY = 'dsh-lingualab:shadow'

/** The shadowing settings this browser chose last, or the defaults. */
function readShadow(): ShadowSettings {
  try {
    const stored = globalThis.localStorage.getItem(SHADOW_KEY)
    return stored === null ? DEFAULT_SHADOW : parseShadowSettings(JSON.parse(stored))
  } catch {
    return DEFAULT_SHADOW
  }
}

/** A speaking pause (or the look after it) that shadowing is waiting out. */
export interface ShadowWait {
  /** The sentence it belongs to. */
  readonly index: number
  readonly phase: ShadowPhase
  /** How long it lasts, and when it ends (`Date.now()` milliseconds). */
  readonly ms: number
  readonly until: number
}

/**
 * The comparison of a sentence with the reader's take: the sentence plays again (`original`), then the take (`take`).
 * It is made when a recorded speaking pause ends (`program`, which carries on afterwards as the pause would have) or
 * when the reader asks for it (`stop`, which leaves everything as it was, stopped at the sentence's start).
 */
export interface Compare {
  readonly index: number
  readonly stage: 'original' | 'take'
  readonly then: 'program' | 'stop'
}

/** No program in progress: the sentence's count starts again and no pause or comparison is pending. */
const IDLE_PROGRAM = { shadowPlayed: 0, shadowWait: null, compare: null } as const

/** How far before a run-up's start a position still counts as the run-up (a seek lands a little early). */
const RUN_UP_SLACK_S = 0.25

/** The lead-in this browser chose last, or off when none was (or storage is not there). */
function readLeadIn(): number {
  try {
    const stored = Number(globalThis.localStorage.getItem(LEAD_IN_KEY))
    return LEAD_IN_CHOICES.includes(stored) ? stored : 0
  } catch {
    return 0
  }
}

/** The sentence a lead-in is running up to, and where it starts. */
interface RunUp {
  readonly index: number
  /** Seconds. */
  readonly at: number
}

/**
 * The sentence whose edges are being moved, with the edges as they stand in the editor.
 *
 * While it is set the player plays that window and nothing else: the sentence stays the active
 * one whatever the playhead says (a start moved past the playhead would otherwise make the
 * previous sentence active, and loop that), and reaching the end wraps to the start without
 * counting passes, because the reader is listening for the edges, not practising.
 */
export interface EditWindow {
  readonly index: number
  /** Seconds. */
  readonly start: number
  readonly end: number
}

interface SeekGuard {
  readonly target: number
  readonly expiresAt: number
}

export interface MediaPlayerState {
  readonly cues: readonly Cue[]
  readonly activeIndex: number
  readonly isPlaying: boolean
  readonly currentTime: number
  readonly duration: number
  readonly speedIndex: number
  readonly loopMode: LoopMode
  readonly repeats: number
  readonly playsDone: number
  readonly pointA: number | null
  readonly pointB: number | null
  readonly seekRequest: number | null
  readonly seekToken: number
  readonly guard: SeekGuard | null
  /**
   * Pause when a sentence ends and wait for the reader, who is repeating it aloud.
   * Only acts while no loop is on: a loop already decides what happens at the end.
   */
  readonly pauseAfterSentence: boolean
  /** True from the moment the audio reaches its end until anything moves or plays again. */
  readonly finished: boolean
  /** How many times the audio has reached its end; a card is dismissed per count, not per episode. */
  readonly finishCount: number
  /** The sentence whose English the reader has uncovered in shadow mode, or -1. */
  readonly revealed: number
  /** The sentence being retimed, or `null`. */
  readonly editWindow: EditWindow | null
  /** How many seconds before a sentence's start a jump to it begins playing; `0` is off. */
  readonly leadIn: number
  /** The sentence the playhead is running up to through a lead-in, or `null`. */
  readonly runUp: RunUp | null
  /** How shadowing runs: plays per sentence, the speaking pause, auto-advance. Remembered per browser. */
  readonly shadow: ShadowSettings
  /** Plays of the active sentence the shadowing program has finished. */
  readonly shadowPlayed: number
  /** The pause shadowing is waiting out, or `null`. The media is paused while it runs. */
  readonly shadowWait: ShadowWait | null
  /** The comparison under way, or `null`. */
  readonly compare: Compare | null
  /** The last take of each sentence of the open episode or segment. Memory only. */
  readonly takes: Takes
  /** Bumped whenever the takes are dropped, so a recording that finishes afterwards is not filed under the new ones. */
  readonly takesEpoch: number
  /** How many recordings have the microphone open or are still finishing; a comparison waits for them. */
  readonly capturing: number
  /** Why the microphone, or a take, did not work, until the page has said so. */
  readonly micNotice: MicNotice | null

  reset: (cues: readonly Cue[]) => void
  setPlaying: (playing: boolean) => void
  setPauseAfterSentence: (on: boolean) => void
  markFinished: () => void
  reveal: (index: number) => void
  toggle: () => void
  seek: (time: number) => void
  /** Jump to a sentence: its start, less the lead-in, with the sentence kept active through the run-up. */
  seekCue: (index: number) => void
  /** Jump to a time that is a sentence's start as a sentence (with the lead-in), or as a plain time when it is not one. */
  seekCueAt: (time: number) => void
  setLeadIn: (seconds: number) => void
  /** Change some of the shadowing settings, and remember them. */
  setShadow: (settings: Partial<ShadowSettings>) => void
  /** Switch recording on or off. Switching it on asks for the microphone now, and goes off again if it is refused. */
  setRecord: (on: boolean) => void
  /** The microphone could not be used: recording switches itself off, and the reason is left for the page to say. */
  micFailed: (reason: MicFailure) => void
  /** The page has said why. */
  clearMicNotice: () => void
  /** A recording has the microphone open. */
  captureStarted: () => void
  /** A recording ended: its take (or `null` when it was too short to keep) for a sentence, from the epoch it began in. */
  captureFinished: (index: number, take: Take | null, epoch: number) => void
  /** Let go of every take: the episode or segment they belong to closed. */
  dropTakes: () => void
  /** Play the sentence on stage, then the reader's last take of it. Does nothing without a take. */
  compareTake: () => void
  /** The take is over (or cannot play): the comparison ends, and the program goes on if it was waiting for it. */
  endCompare: () => void
  /** The pending pause ran out: carry the program on (called by the media binding's timeout). */
  endShadowWait: () => void
  onTime: (time: number) => void
  clearGuard: () => void
  setDuration: (duration: number) => void
  setSpeedIndex: (index: number) => void
  cycleSpeed: (delta: number) => void
  nextSpeedWrapping: () => void
  setLoopMode: (mode: LoopMode) => void
  loopSentence: (index?: number) => void
  /**
   * A row's loop button: stop when that sentence is the one looping, otherwise loop it (moving the loop
   * over from another sentence, or out of an A-B loop).
   */
  toggleSentenceLoop: (index: number) => void
  setPoint: (which: 'a' | 'b') => void
  clearAB: () => void
  setRepeats: (repeats: number) => void
  stepCue: (delta: number) => void
  /** Pin playback to a sentence being retimed, or let go of it with `null`. */
  setEditWindow: (window: EditWindow | null) => void
}

/** Clamp a speed index into range. */
function clampSpeed(index: number): number {
  if (!Number.isFinite(index)) return DEFAULT_SPEED_INDEX
  return Math.min(SPEED_PRESETS.length - 1, Math.max(0, Math.trunc(index)))
}

export const useMediaPlayer = create<MediaPlayerState>((set, get) => {
  /**
   * Carry out one step of the shadowing program on the active sentence.
   *
   * @param played Plays of the sentence finished, which a replay and a pause keep counting from.
   */
  const applyShadow = (plan: ShadowPlan, played: number): void => {
    const state = get()
    const index = state.activeIndex
    const cue = state.cues[index]
    if (cue === undefined) return
    switch (plan.do) {
      case 'replay':
        // The jump drops the program's count, so it is put back after it.
        state.seekCue(index)
        set({ isPlaying: true, shadowPlayed: played, revealed: plan.reveal ? index : -1 })
        return
      case 'wait': {
        state.seekCue(index)
        const ms = shadowPauseMs(cue.end - cue.start, currentSpeed(state), state.shadow.pause)
        set({
          isPlaying: false,
          shadowPlayed: played,
          revealed: plan.reveal ? index : -1,
          shadowWait: { index, phase: plan.phase, ms, until: Date.now() + ms },
        })
        return
      }
      case 'compare':
        // The sentence again, uncovered: the reader has had their try. The take follows when it ends.
        state.seekCue(index)
        set({
          isPlaying: true,
          shadowPlayed: played,
          revealed: index,
          compare: { index, stage: 'original', then: 'program' },
        })
        return
      case 'advance':
        // A step plays the next sentence, covered, because shadowing is on.
        state.stepCue(1)
        return
      case 'stop':
        set({ isPlaying: false, revealed: index })
        state.seekCue(index)
    }
  }

  /** Let go of every take, and of any recording that has not finished. */
  const releaseTakes = (): void => {
    const state = get()
    allTakes(state.takes).forEach(revokeTake)
    set({ takes: NO_TAKES, takesEpoch: state.takesEpoch + 1 })
  }

  /**
   * The sentence of a comparison has played to its end: put the source back at the sentence's start, paused, and
   * let the take play. The program's count is kept, since the jump drops it.
   */
  const finishOriginal = (compare: Compare): void => {
    const state = get()
    const played = state.shadowPlayed
    set({ isPlaying: false })
    state.seekCue(compare.index)
    set({ shadowPlayed: played, compare: { ...compare, stage: 'take' } })
  }

  return {
    cues: [],
    activeIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    speedIndex: DEFAULT_SPEED_INDEX,
    loopMode: 'none',
    repeats: DEFAULT_REPEATS,
    playsDone: 0,
    pointA: null,
    pointB: null,
    seekRequest: null,
    seekToken: 0,
    guard: null,
    pauseAfterSentence: false,
    finished: false,
    finishCount: 0,
    revealed: -1,
    editWindow: null,
    leadIn: readLeadIn(),
    runUp: null,
    shadow: readShadow(),
    shadowPlayed: 0,
    shadowWait: null,
    compare: null,
    takes: NO_TAKES,
    takesEpoch: 0,
    capturing: 0,
    micNotice: null,

    // A new episode starts with no loop and the default repeat count. The speed is
    // deliberately *not* reset: it is a preference about how the reader listens, not
    // a property of the material, and re-picking it every episode would be noise.
    reset: (cues) => {
      // The takes were of another list of sentences: their indexes mean nothing against this one.
      releaseTakes()
      set((state) => ({
        cues,
        activeIndex: findActiveCue(cues, 0),
        isPlaying: false,
        currentTime: 0,
        // Not zeroed: the length belongs to the audio source, and the subtitles usually finish
        // loading after the audio's metadata has already said how long it is.
        loopMode: 'none',
        repeats: DEFAULT_REPEATS,
        playsDone: 0,
        pointA: null,
        pointB: null,
        seekRequest: null,
        seekToken: state.seekToken + 1,
        guard: null,
        finished: false,
        revealed: -1,
        editWindow: null,
        runUp: null,
        ...IDLE_PROGRAM,
      }))
    },

    // Starting to play covers the English again in shadow mode: the reveal belongs to one pass. Playing or
    // stopping from outside the program (a row, a review, going home) also ends any pause it was waiting out.
    setPlaying: (playing) =>
      set((state) => ({
        isPlaying: playing,
        finished: playing ? false : state.finished,
        revealed: playing ? -1 : state.revealed,
        ...IDLE_PROGRAM,
      })),

    setPauseAfterSentence: (on) => set({ pauseAfterSentence: on, ...IDLE_PROGRAM }),

    // The element's nded event: playback stopped because there was nothing left, which is
    // not the same as the reader pressing pause, and the page answers it with a summary.
    markFinished: () => {
      const compare = get().compare
      // The last sentence's comparison reaches the end of the audio before the clock reports the end of the
      // sentence: that is the original having played, not the episode being over.
      if (compare?.stage === 'original') {
        finishOriginal(compare)
        return
      }
      set((state) => ({ isPlaying: false, finished: true, finishCount: state.finishCount + 1, ...IDLE_PROGRAM }))
    },

    reveal: (index) => set({ revealed: index }),

    // A pause belongs to a running program, so the button reads "pause" through it, and pressing it ends
    // the program there: the playhead is already back at the sentence's start, and the next press plays it afresh.
    // A comparison is the same, except that its first half is playing, and that stops with it.
    toggle: () =>
      set((state) =>
        state.compare !== null
          ? { isPlaying: false, finished: false, ...IDLE_PROGRAM }
          : state.shadowWait !== null
            ? IDLE_PROGRAM
            : {
                isPlaying: !state.isPlaying,
                finished: false,
                revealed: state.isPlaying ? state.revealed : -1,
              },
      ),

    seek: (time) =>
      set((state) => ({
        seekRequest: Math.max(0, time),
        seekToken: state.seekToken + 1,
        currentTime: Math.max(0, time),
        activeIndex: state.editWindow?.index ?? findActiveCue(state.cues, time),
        guard: { target: Math.max(0, time), expiresAt: Date.now() + SEEK_GUARD_MS },
        finished: false,
        runUp: null,
        ...IDLE_PROGRAM,
      })),

    seekCue: (index) => {
      const state = get()
      const cue = state.cues[index]
      if (cue === undefined) return
      const from = Math.max(0, cue.start - state.leadIn)
      state.seek(from)
      if (from < cue.start) set({ activeIndex: state.editWindow?.index ?? index, runUp: { index, at: cue.start } })
    },

    seekCueAt: (time) => {
      const state = get()
      const index = findActiveCue(state.cues, time)
      const cue = state.cues[index]
      if (cue !== undefined && Math.abs(cue.start - time) < 0.001) state.seekCue(index)
      else state.seek(time)
    },

    setLeadIn: (seconds) => {
      const leadIn = LEAD_IN_CHOICES.includes(seconds) ? seconds : 0
      set({ leadIn })
      try {
        globalThis.localStorage.setItem(LEAD_IN_KEY, String(leadIn))
      } catch {
        // A browser without storage still plays with the lead-in; it is just not remembered.
      }
    },

    onTime: (time) => {
      const { guard, cues } = get()
      if (guard !== null) {
        // Every position reported before the seek lands is stale, including one that
        // happens to sit near the target. Waiting for `seeked` is the only signal
        // that distinguishes "the element moved" from "the element has not moved yet".
        if (Date.now() <= guard.expiresAt) return
        set({ guard: null })
      }

      const state = get()
      const edit = state.editWindow
      if (edit !== null) {
        if (state.isPlaying && time >= edit.end - 0.01) {
          get().seek(edit.start)
          return
        }
        set({ currentTime: time, activeIndex: edit.index })
        return
      }
      const runUp = state.runUp
      if (runUp !== null) {
        // Still before the sentence it is running up to: that sentence stays the one playing.
        if (time < runUp.at && time >= runUp.at - state.leadIn - RUN_UP_SLACK_S) {
          set({ currentTime: time, activeIndex: runUp.index })
          return
        }
        set({ runUp: null })
      }
      const compare = state.compare
      if (compare !== null) {
        // A comparison owns the clock: its sentence plays once and the end of it is the only thing that matters,
        // so no loop wraps and no pause starts under it. The take plays with the source stopped.
        const cue = cues[compare.index]
        if (compare.stage === 'original' && state.isPlaying && cue !== undefined && time >= cue.end) {
          finishOriginal(compare)
          return
        }
        set({ currentTime: time, activeIndex: compare.index })
        return
      }
      const heard = state.cues[state.activeIndex]
      if (
        state.pauseAfterSentence &&
        state.loopMode === 'none' &&
        state.isPlaying &&
        heard !== undefined &&
        time >= heard.end &&
        // Only the sentence ending under the playhead. A reader who seeks into the silence
        // after a sentence is not asking to be stopped for a sentence they skipped.
        time < heard.end + SHADOW_WINDOW_S
      ) {
        // Judged on the sentence that was playing at the previous tick, not the one the
        // position now falls in: a tick can land just inside the next sentence, and its
        // start must not be what the reader hears first when they press play again.
        const played = state.shadowPlayed + 1
        applyShadow(planShadow({ played, after: null, settings: state.shadow, last: state.activeIndex >= cues.length - 1 }), played)
        return
      }
      const decision = planLoop({
        time,
        mode: state.loopMode,
        cueStart: state.cues[state.activeIndex]?.start ?? null,
        cueEnd: state.cues[state.activeIndex]?.end ?? null,
        pointA: state.pointA,
        pointB: state.pointB,
        repeats: state.repeats,
        playsDone: state.playsDone,
      })

      if (decision.stop) {
        // Leave the playhead at the start of what was repeated rather than just past
        // its end: pressing play again would otherwise re-trigger the same stop on
        // the next tick and the button would look broken.
        const window = loopWindow({
          mode: state.loopMode,
          cueStart: state.cues[state.activeIndex]?.start ?? null,
          cueEnd: state.cues[state.activeIndex]?.end ?? null,
          pointA: state.pointA,
          pointB: state.pointB,
        })
        set({ isPlaying: false, playsDone: decision.playsDone })
        if (state.loopMode === 'sentence') get().seekCue(state.activeIndex)
        else if (window !== null) get().seek(window.start)
        return
      }
      if (decision.seekTo !== null) {
        // A sentence loop wraps to the sentence, lead-in and all; an A-B loop to its exact mark.
        if (state.loopMode === 'sentence') get().seekCue(state.activeIndex)
        else get().seek(decision.seekTo)
        set({ playsDone: decision.playsDone })
        return
      }
      set({ currentTime: time, activeIndex: findActiveCue(cues, time) })
    },

    setShadow: (settings) => {
      const shadow = mergeShadow(get().shadow, settings)
      set({ shadow })
      try {
        globalThis.localStorage.setItem(SHADOW_KEY, JSON.stringify(shadow))
      } catch {
        // As with the lead-in: it still applies, it is just not remembered.
      }
    },

    setRecord: (on) => {
      get().setShadow({ record: on })
      if (!on) return
      void probeMic().then((result) => {
        if (!result.ok) get().micFailed(result.reason)
      })
    },

    micFailed: (reason) => {
      // Said once, and only while recording is still what the reader asked for.
      if (!get().shadow.record) return
      get().setShadow({ record: false })
      set({ micNotice: reason })
    },

    clearMicNotice: () => set({ micNotice: null }),

    captureStarted: () => set((state) => ({ capturing: state.capturing + 1 })),

    captureFinished: (index, take, epoch) => {
      const state = get()
      const capturing = Math.max(0, state.capturing - 1)
      if (take === null) {
        set({ capturing })
        return
      }
      if (epoch !== state.takesEpoch) {
        // It was recorded for an episode that has since closed.
        revokeTake(take)
        set({ capturing })
        return
      }
      const kept = putTake(state.takes, index, take)
      kept.stale.forEach(revokeTake)
      set({ capturing, takes: kept.takes })
    },

    dropTakes: () => releaseTakes(),

    compareTake: () => {
      const state = get()
      const index = state.activeIndex
      // The timing strip owns the clock while it is open, and a sentence with no take has nothing to compare.
      if (state.editWindow !== null || state.takes[index] === undefined) return
      // The jump ends whatever program was running, a pause and its recording included.
      state.seekCue(index)
      set({ isPlaying: true, finished: false, revealed: index, compare: { index, stage: 'original', then: 'stop' } })
    },

    endCompare: () => {
      const state = get()
      const compare = state.compare
      if (compare === null) return
      set({ compare: null })
      if (compare.then !== 'program') return
      // A sentence the reader has since left has nothing to carry on.
      if (compare.index !== state.activeIndex) {
        set(IDLE_PROGRAM)
        return
      }
      const last = state.activeIndex >= state.cues.length - 1
      applyShadow(planShadow({ played: state.shadowPlayed, after: 'speak', settings: state.shadow, last }), state.shadowPlayed)
    },

    endShadowWait: () => {
      const state = get()
      const wait = state.shadowWait
      if (wait === null) return
      set({ shadowWait: null })
      // A pause left over from another sentence has nothing to carry on.
      if (wait.index !== state.activeIndex) {
        set(IDLE_PROGRAM)
        return
      }
      const last = state.activeIndex >= state.cues.length - 1
      // A recording of this pause that is open now is the reader's try at the sentence: it is compared first.
      const compare = wait.phase === 'speak' && state.shadow.record && state.capturing > 0
      applyShadow(planShadow({ played: state.shadowPlayed, after: wait.phase, settings: state.shadow, last, compare }), state.shadowPlayed)
    },

    clearGuard: () => set({ guard: null }),

    setDuration: (duration) => set({ duration: Number.isFinite(duration) ? duration : 0 }),

    setSpeedIndex: (index) => set({ speedIndex: clampSpeed(index) }),

    cycleSpeed: (delta) => set((state) => ({ speedIndex: clampSpeed(state.speedIndex + delta) })),

    // The on-screen button has no "slower" twin, so it wraps instead of sticking at the top.
    nextSpeedWrapping: () =>
      set((state) => ({ speedIndex: (clampSpeed(state.speedIndex) + 1) % SPEED_PRESETS.length })),

    setLoopMode: (mode) =>
      set({ loopMode: mode, playsDone: 0, isPlaying: mode === 'none' ? get().isPlaying : true, ...IDLE_PROGRAM }),

    loopSentence: (index) => {
      const state = get()
      const target = index ?? state.activeIndex
      const cue = state.cues[target]
      if (cue === undefined) return
      // Looping another sentence (or this one, as practice) ends an edit of its edges.
      set({ activeIndex: target, loopMode: 'sentence', playsDone: 0, editWindow: null })
      get().seekCue(target)
      set({ isPlaying: true })
    },

    toggleSentenceLoop: (index) => {
      const state = get()
      if (state.loopMode === 'sentence' && state.activeIndex === index) state.setLoopMode('none')
      else state.loopSentence(index)
    },

    setPoint: (which) => {
      const state = get()
      const time = state.currentTime
      if (which === 'a') {
        set({ pointA: time, loopMode: 'ab', playsDone: 0 })
        return
      }
      // A B point that is not after the A point would make an empty window, so the
      // pair is kept ordered instead of silently never looping.
      if (state.pointA !== null && time <= state.pointA) return
      set({ pointB: time, loopMode: 'ab', playsDone: 0 })
    },

    clearAB: () => set({ pointA: null, pointB: null, loopMode: 'none', playsDone: 0 }),

    setRepeats: (repeats) => set({ repeats: Math.max(0, Math.trunc(repeats)), playsDone: 0 }),

    stepCue: (delta) => {
      const state = get()
      const next = stepCueIndex(state.activeIndex, delta, state.cues.length)
      const cue = state.cues[next]
      if (cue === undefined) return
      // Moving to another sentence ends an edit: the window belongs to the one it was opened on.
      set({ activeIndex: next, playsDone: 0, editWindow: null })
      get().seekCue(next)
      // Shadowing is one sentence at a time, so moving to another one means 'play it'.
      if (state.pauseAfterSentence) set({ isPlaying: true })
    },

    setEditWindow: (window) =>
      set((state) => ({
        editWindow: window,
        activeIndex: window?.index ?? state.activeIndex,
        // Passes counted while the edges moved are not passes of the sentence.
        playsDone: 0,
        ...IDLE_PROGRAM,
      })),
  }
})

/** The speed currently in effect. */
export function currentSpeed(state: Pick<MediaPlayerState, 'speedIndex'>): number {
  return SPEED_PRESETS[state.speedIndex] ?? 1
}
