# Agent Note: finish shadowing as the repeater's core loop

Status: proposed

## Problem

The panel exists to replace a physical language repeater for listening and speaking practice. A
repeater does one loop: play a sentence, leave room to say it, compare what you said with what you
heard, go on. Most of the listening half is built: a sentence loop (`L`), an A-B loop with a repeat
count, ten pitch-preserving speeds and a lead-in. The speaking half stops after the first step.

What shadowing does today (`onTime` in `features/media-player/model/store.ts`): with the mode on and
no loop, a sentence plays with its English blurred, then playback stops, rewinds to the sentence's
start and sets `revealed`, so the English is uncovered the moment it stops. Play hears it again; a step
moves to the next sentence and plays it. Four gaps follow from that, checked on 2026-10-14 against v0.11.5:

1. **Nothing records.** The shadowing step's tip (`stepTipShadow`) says "turn on shadowing, record once
   to compare", and there is no recording anywhere in the source. Comparing your voice with the
   original is the feature a repeater is bought for.
2. **The reveal contradicts the copy.** `shadowHint` and the README say "you say it first, then press
   R"; the store reveals at the stop, so the answer is on screen before the reader has opened their
   mouth.
3. **Shadowing and looping exclude each other.** The stop only fires when `loopMode` is `none`, and the
   repeat count is offered only for A-B loops. A repeater's basic program, "each sentence twice, a
   pause to repeat after each, then the next", cannot be set up, so every sentence needs a hand on the
   screen.
4. **There are no hardware buttons.** The page has no Media Session handlers. On an iPad without a
   keyboard, `Space`, the arrows and `R` do not exist; a headset or AirPods button does nothing to the
   sentence.

The releases since v0.8 went to layout, video, themes and the timing editor. Each was a fair support
job, but none moved the loop above. This note fixes the yardstick for what comes next: a change earns
its place when it adds ears-on or mouth-on time per minute, or takes the hands off the screen. The
text is the answer key, not the material.

## Proposal

Four pieces, in this order. Each ships on its own and leaves the default behaviour unchanged until the
reader turns it on.

1. **Shadowing as a sentence program.** In shadowing mode the 「更多」 menu offers three settings: plays
   per sentence (1, 2 or 3), a speaking pause after each play (off, the sentence's own length, or
   one and a half times it, plus one second), and whether to go on to the next sentence by itself.
   The defaults (one play, no pause, no auto-advance) are exactly today's behaviour. The decision goes
   into a pure planner beside `planLoop` (`planShadow`: given the time, the sentence, the pass and the
   settings, it says play, wait, rewind, advance or stop), tested without a browser; the store only
   applies it. The lead-in applies to every replay, as it does to loops. `Space`, a step or a click on
   the scrubber ends the program's current pass cleanly. With a pause and auto-advance on, the page
   runs hands-free, which also covers simultaneous shadowing closely enough that it does not need a
   mode of its own.
2. **The reveal follows one blind attempt.** The English stays hidden through the first play and its
   speaking pause, and is uncovered from the second play on, or at the end of the pause when there is
   only one play. With auto-advance, an uncovered sentence stays on screen for its pause before the next
   one starts. `R` and the button still uncover it at any time. The hint and the README are rewritten
   to say what happens.
3. **Record and compare.** A microphone switch joins the shadowing settings. When it is on, each speaking
   pause is recorded with `MediaRecorder`, and when the pause ends the page plays the original sentence
   once more and then your take. A 「对比」 button (and a key) replays that pair later. The last take per
   sentence is kept in memory for the open episode and dropped when it closes: never written to disk,
   never sent to the host, never scored. Takes play through their own short-lived audio element while
   the source is paused; the one `<video>` element stays the only timeline for the source. The
   microphone stream is stopped after every take, because iOS lowers playback volume while a microphone
   is open.
4. **Hardware buttons through Media Session.** `play` and `pause` toggle playback, `previoustrack` and
   `nexttrack` step a sentence, `seekbackward` replays the sentence, and the metadata names the episode
   and the sentence number. That gives AirPods, wired headset buttons, the iPad lock screen and Bluetooth
   remotes that send media keys the role of a repeater's physical keys. It is not a keyboard listener, so
   the rule against taking the host's keys is not touched.

## Alternatives considered

- **Pronunciation scoring with a recogniser.** The first-version note set it aside because it "turns a
  listening habit into a scoring loop before the habit exists"; the habit still is the point, and a
  score invites rereading the text instead of listening again. Feedback on speaking stays in the
  conversation with the agent. Not part of this plan.
- **Graded hints (first letters, gapped content words) instead of the blur.** They move the eyes back
  onto the text while the ears should be working, which is the drift this note is guarding against.
- **Ending the speaking pause by detecting silence.** Nicer than a fixed pause, but the microphone would
  have to stay open the whole time and the audio analysed live, and a pause that ends unpredictably is
  harder to rely on hands-free. Worth revisiting once recording has shipped and been used.
- **Recording a whole stretch instead of one sentence.** A repeater compares per sentence; a long take
  is hard to find your way around and cannot sit next to the sentence it belongs to.
- **Keeping takes in IndexedDB or the episode folder.** It needs quota handling, cleanup and a privacy
  story for something that is meant to be thrown away. Sending a take to the agent is a separate
  decision for later.
- **A separate simultaneous-shadowing mode.** The program with no pause and auto-advance already plays
  sentence after sentence with the English hidden; a second mode would be a second set of rules to learn.

## Settled details

- **Order.** The program and the reveal (1 and 2) come first: they fix the copy that is wrong today and
  make the page usable without hands. Recording (3) is the largest piece and depends on the pause the
  program creates. Media Session (4) is small and can ship with either.
- **Where the controls live.** The 「跟读」 chip stays on the transport row; its settings go into
  「更多」 next to the lead-in, so the row does not grow. The step tracker's shadowing tip becomes true
  once recording ships.
- **To verify on a real iPad before calling 3 and 4 done.** `MediaRecorder` records `audio/mp4` in
  Safari; playback volume comes back after the microphone is stopped; the Media Session actions reach
  the page with AirPods; and the live site is served over HTTPS, because `getUserMedia` refuses an
  insecure origin (localhost is exempt).

Related: [the first version ships without a waveform, video or shadowing scores](../../implemented/simplification/2026-10-08-v1-without-waveform.md),
[review kept sentences](../../implemented/feature/2026-10-11-review-kept-sentences.md).
