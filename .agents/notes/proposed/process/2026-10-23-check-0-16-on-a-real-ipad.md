# Agent Note: check 0.16.0 on a real iPad

Status: proposed

## Problem

The plugin is mostly used on an iPad, but since 0.12.0 every feature built for it was measured in a desktop browser:
Chrome's engine at iPad viewport sizes, with touch emulation, without SF Pro, without Safari's toolbars and without a
finger. Each note says so in its own words, and the open items are now spread over eight notes:

- [the layout answers to the practice column](../../implemented/architecture/2026-10-14-layout-answers-to-the-practice-column.md)
- [shadowing as the repeater loop](../../implemented/feature/2026-10-14-shadowing-as-the-repeater-loop.md)
- [step to a neighbour while retiming](../../implemented/feature/2026-10-12-step-to-neighbour-while-retiming.md)
- [collapse the side column](../../implemented/feature/2026-10-21-collapse-the-side-column.md)
- [fine scrubbing on the progress bar](../../implemented/feature/2026-10-21-fine-scrubbing-on-the-progress-bar.md)
- [the side column over a narrow stage](../../implemented/feature/2026-10-21-side-column-over-a-narrow-stage.md)
- [animate the side column and regroup the top bar](../../implemented/feature/2026-10-21-animate-the-side-column-and-regroup-the-top-bar.md)
- [pick a playback speed in one tap](../../implemented/feature/2026-10-23-pick-a-speed-in-one-tap.md)

A list spread over notes does not get done. Two later plans also wait on it: locating a sentence by dragging on the
stage depends on how touch feels on the stage, and ending the speaking pause on silence depends on how recording
behaves in Safari.

## Proposal

**One pass on a real iPad against the deployed 0.16.0, with the list below.** The user runs it on 2026-10-23 in the
evening.

How to run it:

- Open the deployed site in Safari, not the local one. Write down the iPad model and iPadOS version at the top of the
  results.
- Each item says what to do and what counts as a pass. Tick it, or write what happened beside it; a photo or a screen
  recording is enough for anything visual.
- An item that fails is not fixed during the pass. The results come back to the agent, which fixes them one by one
  with the note that owns each.
- When the pass is done, each owning note gets its "not verified on a device" line replaced with what was seen, and
  this note moves to `implemented/` with the results in it.

**1. Before starting**

- [ ] The site opens over HTTPS. Without it Safari refuses the microphone, and every recording item fails for that
  reason alone.
- [ ] The page is 0.16.0: the speed button opens a picker instead of stepping one preset.

**2. Layout (landscape and portrait, the host's sidebar narrow and wide)**

- [ ] In landscape with the sidebar narrow, then wide: the practice page does not scroll as a whole, the sentence is
  readable, and the player card's buttons do not overlap.
- [ ] The same in portrait.
- [ ] With the timing panel open (「调整这一句的开头和结尾」 in 「更多」) in landscape with the sidebar wide: the panel, the sentence and the player
  card all fit without scrolling.
- [ ] A long sentence in SF Pro wraps cleanly; no word is cut off.
- [ ] The top bar in portrait: back, title, the 「右栏」 group and the 「进度与设置」 group all fit, the line between the two
  groups is visible, and every button is easy to hit with a finger.

**3. Right column**

- [ ] In landscape, the toggle in the top bar slides the column out and back in over a fifth of a second, the stage and
  the picture following without a stutter. If it stutters, note how badly: the fallback is a fade only.
- [ ] In portrait (or landscape with the sidebar wide), the expanded column opens as a drawer over the stage with a
  dimmed scrim. A tap on the scrim slides it out with the scrim; the stage keeps its wide layout throughout.
- [ ] Turning the iPad between portrait and landscape switches between the drawer and the column beside the stage.
- [ ] The column, once collapsed with the toggle, stays collapsed after a reload.

**4. Speed**

- [ ] The speed button opens the picker above it; every chip is easy to hit without touching its neighbour.
- [ ] A tap on a chip sets that speed and closes the picker; a tap anywhere else closes it without a change.
- [ ] With the timing panel open the speed button still opens the picker.

**5. Progress bar**

- [ ] Drag the thumb along the bar: it follows the finger. Move the finger up above the bar while dragging: the label
  says half speed, then a quarter, and the thumb moves slower.
- [ ] The label stays readable beside the finger, not under it.
- [ ] A drag near the bottom edge of the screen does not trigger the iPad's own swipe (home or app switcher).
- [ ] Letting go plays from the time the label showed.

**6. Timing panel**

- [ ] The two buttons in the panel's header move to the previous and next sentence. After changing an edge first, the
  header says 「已保存」 for a moment and the subtitle file has the new time.

**7. Shadowing, recording and the headset**

- [ ] With 「跟读」 on, turning on 「录下我说的」 in 「更多」 asks for the microphone once; after allowing it, a shadowing run records a take.
- [ ] 「对比」 plays the sentence, then the take, with no tap in between.
- [ ] After the microphone stops, the sentence plays back at its normal volume (iOS sometimes leaves it quieter).
- [ ] With AirPods: play and pause reach the page, and next and previous track step the sentence.
- [ ] On the lock screen: the controls show previous and next track, not skip by seconds, and during a speaking pause
  the button shows pause. Pressing it there ends the shadowing run.

## Alternatives considered

- **Leave each note's own line where it is.** No new file, but eight scattered lines have not been worked through in
  a week, and nobody can run them in one sitting.
- **WebKit in Playwright, or a cloud device service.** WebKit is closer than Chrome, but it has no real finger, no
  Safari toolbars, no AirPods and no lock screen, which are what the open items are about. A device service would
  need the site exposed to it and still has no headset.
- **An iPad simulator on a Mac.** It needs a Mac and still has no microphone path like the device's and no
  AirPods.
- **Check only the newest features.** Faster, but the recording and headset items are the oldest open ones and the
  core of the plugin.
