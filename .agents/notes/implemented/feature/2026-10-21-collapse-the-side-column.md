# Agent Note: the right column collapses

Status: implemented

## Problem

On an iPad the practice column is 440 to 630px wide. The host's sidebar takes 56px or 280px, and the right column (the
subtitles, or the kept sentences) takes another 260 to 440px of what is left, so the stage gets the narrow layout of
[the layout note](../architecture/2026-10-14-layout-answers-to-the-practice-column.md): a picture of about 300 by 170, a
player card that wraps into more rows, and in portrait with the sidebar open a stage of 278px. Much of the time on an iPad
the user is listening to the sentence on stage and does not need the list beside it, and there was no way to give its
width back.

The top bar has the same problem in a smaller way. Its buttons take about 480px with their words, so in a 540px bar (iPad
portrait, sidebar open) the episode title had about 40px left. The chips are 28px tall, under the 44px a finger needs.

## Decision

- **Three states, two facts.** The right column is collapsed, the subtitles, or the kept sentences. Which view it shows is
  `Column` as before, state of this visit; whether it is collapsed is a separate flag, the setting `sideCollapsed`. The
  moves are pure functions in `pages/lingualab/lib/side-column.ts` and `useSideColumn` applies them, so collapsing never
  forgets the view, and `N` keeps the meaning it had on an expanded column: switch the view.
- **A toggle and a key.** A panel icon in the top bar beside the kept chip (`aria-expanded`, its title naming the key)
  and `\`, which no other key of the page uses and which sits beside the brackets (the speed) on a US layout. On a layout
  where `\` needs AltGr it is a chord and not the page's, and the button is the way. The key is in the keymap with its
  tests and in the shortcut list of 「更多」.
- **`N` and the kept chip open a collapsed column into the kept sentences.** The press asked for the kept sentences, so
  opening on the subtitles, or switching a view that cannot be seen, would both be wrong. A protected sentence that asks
  to show its card expands the column too. The kept chip reads as pressed only while the kept sentences are on screen.
- **Collapsed is not drawn.** No rail: the side pane is not rendered and the stage has the row. Expanding mounts it
  again, and the subtitle list lands on the sentence playing in a layout effect, before it is painted, whatever the
  follow switch says: it was not following while it was not there. The same landing serves a switch back from the kept
  sentences. There is no width animation; the row changes once.
- **Remembered per device.** `sideCollapsed` is stored with the theme and the stage size under `dsh-lingualab:settings`;
  only a stored `true` collapses, so a missing or broken value is the expanded default.
- **The picture grows with the row.** Above a 600px column the picture's share of the width is 64%, which in a wide
  column leaves the extra width as empty margin. With the column collapsed (`is-side-collapsed` on `.dsh-lingualab-body`)
  the share is the whole width (`--ll-pic-share:1`, `--ll-pic-w:100%`); 720px, the 405px stage, the height cap and the
  `is-picture-squeezed` measurement still bound it. The card that stands in for a picture takes the same width and stays
  under `useCardFit`.
- **The chip says 「收藏」.** It used to say 「笔记」 (Notes in English) while the column it opens says 「收藏」 (Kept); it now
  uses the column's own word.
- **The top bar answers to its own width.** It is a width container (`ll-top`). In a bar of 720px or less the back chip
  and the kept chip show only their icon (and the count), which gives the title about 110px; their names stay as
  `aria-label` and title. The chips and buttons are `flex:none`, so only the title gives way and no icon is squeezed.
- **44px on touch without changing the look.** Under `(hover:none) and (pointer:coarse)` the top bar's chips and icon
  buttons get a transparent `::after` whose inset is whatever brings each side to 44px and never less than nothing, the
  technique of the pills on the picture. A 32px button needs 6px either side and the gaps are 8px, so neighbours do not
  overlap.
- The stylesheet's new rules are in `shared/lib/styles-side.ts`, appended to `STYLES` after the responsive rules, because
  `styles.ts` is at its size limit; the icon is in its own file for the same reason and uses the shared `Svg`.

## Measured

The real page, with the real host half serving a test library (one video episode, one with two segments and a 60
character title), in Chrome with the host sidebar drawn as a strip, a sentence of about 80 characters on stage (two lines
where the column is narrow). Picture sizes are
width by height, expanded then collapsed; nothing scrolled in any of them.

- 1440 by 900: sidebar 56px 557 by 313, then 612 by 344; sidebar 280px 443 by 249, then 612 by 344.
- 1180 by 820: sidebar 56px 428 by 241, then 509 by 286; sidebar 280px 299 by 168, then 509 by 286. The player card is
  166px collapsed where the narrow expanded column wrapped it to 238px.
- 820 by 1180: sidebar 56px 430 by 242, then 691 by 389; sidebar 280px the stage is 278px wide with a 206 by 116
  picture, then 539px with 467 by 263.
- Timing open at 1180 by 820, sidebar 280px: 303 by 170, then 384 by 216, the compact panel 201px, nothing scrolls.
- The prepare card at 1180 by 820: 428 or 520px wide expanded, 720px collapsed, the lean step in both, nothing scrolls.
- Top bar at 539px with the segment chip and two kept sentences: the title has 145px and nothing overflows; at 763px it
  has 249px with every word shown; at 899px (1180, sidebar 280) the buttons keep their 32px.
- Touch emulation: the chips stay 28px and the buttons 32px; their hit areas are 46 by 46 (icon-only chips), 46 tall
  (wider chips) and 44 by 44 (buttons).
- `\` and the button collapse and expand, the choice survives a reload, `N` on a collapsed column opens the kept
  sentences, `↑` `↓` and Enter still pick and play a sentence while collapsed, and after stepping 25 sentences while
  collapsed the list opens on the sentence playing. A click on the toggle leaves the keyboard on the page, so Space still
  plays.

Not measured: a real dsh-web and a real iPad (Safari's height, SF Pro, real touch). The harness is Chrome's engine.

## Alternatives considered

- **A fourth value of `Column` ('collapsed').** One state instead of two, but then `N` would have to remember which view
  to go back to, and the remembered setting would carry the view, which is a choice of this visit and not of the device.
- **A rail of about 40px when collapsed.** It keeps the column one press away, but costs width exactly where width is
  short, and the top bar's toggle is already there.
- **Animate the width.** The stage reflows on every frame of the animation (the picture, the card's rows, the timing
  layout), which is the jump the collapse is meant to stop; one change reads calmer.
- **Keep the column mounted and hide it with CSS.** It would keep the list's scroll, but the follow scrolling does not run
  on a hidden list, so it would open wherever it was left. Mounting again and landing on the sentence playing is the
  answer the user wants, and costs nothing.
- **Store the collapse in the host's progress file.** It is a preference of a device (an iPad wants the width, a desktop
  may not), so it stays in the browser with the other settings.
- **Drop the chip words with a viewport breakpoint.** The bar's width depends on the host's sidebar, as the practice
  column's does; the style test only lets the browse layer ask the viewport.
- **Make the top bar's chips 44px tall on touch.** It would change the bar's look and height for a hit area the invisible
  margin already gives.
- **The two next steps.** Opening the column over the stage where the row is narrow, and collapsing by default there, are
  in [the side column over a narrow stage](2026-10-21-side-column-over-a-narrow-stage.md); finding a
  sentence on the stage without the list is in
  [locate a sentence on the stage](../../proposed/feature/2026-10-21-locate-a-sentence-on-the-stage.md). Both wait until the
  collapse has been used for a while.

## Consequences

- A new piece of the right column goes through `side-column.ts`: a move that changes the view or the collapse is a pure
  function there with a test, and `useSideColumn` writes the setting only when the collapse changes.
- Anything drawn in the right column is unmounted while it is collapsed, so state it keeps in React is lost on collapse
  (the list's scroll is, on purpose).
- A new top bar button should be `flex:none` and gets the touch hit area by being a `.dsh-lingualab-chip` or a
  `.dsh-lingualab-icon-btn` in the bar.
