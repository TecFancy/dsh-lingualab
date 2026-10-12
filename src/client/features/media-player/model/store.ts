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
 */
import { create } from 'zustand'
import { findActiveCue, type Cue } from '../../../entities/cue/index.ts'
import { loopWindow, planLoop, stepCueIndex, type LoopMode } from '../lib/loop.ts'

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

export const useMediaPlayer = create<MediaPlayerState>((set, get) => ({
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

  // A new episode starts with no loop and the default repeat count. The speed is
  // deliberately *not* reset: it is a preference about how the reader listens, not
  // a property of the material, and re-picking it every episode would be noise.
  reset: (cues) =>
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
    })),

  // Starting to play covers the English again in shadow mode: the reveal belongs to one pass.
  setPlaying: (playing) =>
    set((state) => ({
      isPlaying: playing,
      finished: playing ? false : state.finished,
      revealed: playing ? -1 : state.revealed,
    })),

  setPauseAfterSentence: (on) => set({ pauseAfterSentence: on }),

  // The element's nded event: playback stopped because there was nothing left, which is
  // not the same as the reader pressing pause, and the page answers it with a summary.
  markFinished: () => set((state) => ({ isPlaying: false, finished: true, finishCount: state.finishCount + 1 })),

  reveal: (index) => set({ revealed: index }),

  toggle: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
      finished: false,
      revealed: state.isPlaying ? state.revealed : -1,
    })),

  seek: (time) =>
    set((state) => ({
      seekRequest: Math.max(0, time),
      seekToken: state.seekToken + 1,
      currentTime: Math.max(0, time),
      activeIndex: state.editWindow?.index ?? findActiveCue(state.cues, time),
      guard: { target: Math.max(0, time), expiresAt: Date.now() + SEEK_GUARD_MS },
      finished: false,
      runUp: null,
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
      // The sentence is over, so the English it hid is uncovered for the self-check.
      set({ isPlaying: false, revealed: state.activeIndex })
      get().seekCue(state.activeIndex)
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

  clearGuard: () => set({ guard: null }),

  setDuration: (duration) => set({ duration: Number.isFinite(duration) ? duration : 0 }),

  setSpeedIndex: (index) => set({ speedIndex: clampSpeed(index) }),

  cycleSpeed: (delta) => set((state) => ({ speedIndex: clampSpeed(state.speedIndex + delta) })),

  // The on-screen button has no "slower" twin, so it wraps instead of sticking at the top.
  nextSpeedWrapping: () =>
    set((state) => ({ speedIndex: (clampSpeed(state.speedIndex) + 1) % SPEED_PRESETS.length })),

  setLoopMode: (mode) => set({ loopMode: mode, playsDone: 0, isPlaying: mode === 'none' ? get().isPlaying : true }),

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
    })),
}))

/** The speed currently in effect. */
export function currentSpeed(state: Pick<MediaPlayerState, 'speedIndex'>): number {
  return SPEED_PRESETS[state.speedIndex] ?? 1
}
