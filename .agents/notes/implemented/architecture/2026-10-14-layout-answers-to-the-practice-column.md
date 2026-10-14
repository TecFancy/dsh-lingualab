# Agent Note: the layout answers to the practice column, not to the window

Status: implemented

## Problem

The practice view stacks four things in one column: the picture, the sentence, the timing panel and the player card. It was
laid out for a desktop window, and on an iPad it broke in two ways.

The first is height. At 1180 by 760 (an iPad in landscape) the column is 711px tall, and with the timing panel open the
picture (208px), the panel (350px) and the card (264px) need 822px before the sentence gets any. The sentence was the one
flexible item, so it was squeezed to 40px while its text needed 140px or more, painted over the picture and the panel, and
the card ended up below the screen with the play button out of reach. At 1024 by 700 the sentence overflowed with the panel
closed.

The second is that the breakpoints asked the wrong thing. They were viewport media queries, but the host's sidebar takes
56px or 280px and the transcript takes about a third of what is left, so the practice column is 440 to 630px wide while the
window is 1024 or 1180px. The one `max-width:860px` rule never applied. In a column that narrow the picture was 300 by 169
with its overlay pills crowding it, the two edge cards of the timing panel were about 174px each and their value, step
buttons and playhead button wrapped, and the keyboard hints cost a row on a device that has no keyboard while its buttons
were 36 by 30.

## Decision

**The practice column is a size container, and every rule about what is in it asks the column.** The row it shares with the
transcript is a width container for the one rule about the transcript.

- **Two named containers.** `.dsh-lingualab-practice` is `container:ll-practice/size` (it has a definite size: it is a flex
  item in a fixed-height row, so size containment costs nothing) and `.dsh-lingualab-body` is `container:ll-body/inline-size`.
  The transcript's narrower 260px asks `ll-body`; the rest asks `ll-practice`. Only the browse layer and reduced motion
  still use a media query, because they are about the window.
- **A size query measures the content box.** The column has 24px of side padding and 20px at the bottom, so every number in
  the stylesheet is the column's width less 48 and its height less 20. The desktop the thresholds were checked against (the
  column about 765 by 851, so 717 by 831 in these terms) triggers none of the width or height rules while the timing panel is
  closed.
- **The part above the player card scrolls, and the card never moves.** Everything above the card sits in
  `.dsh-lingualab-practice-main`, a flex column that is the one scroller; the sentence is `flex:1 0 auto`, so it never shrinks
  below its text. When the picture, the sentence and the timing panel cannot all fit, that part scrolls, and overlap is no
  longer possible. The card stays under it, reachable.
- **Short heights tighten in steps, so the scroller is the last resort and not the usual case.** Under 700px of content
  height the lines either side of the sentence go, the picture is capped at 30% of the height (it was 42% of the window's, a
  cap that did not follow the column) and the stage and the timing panel give up some padding and the panel its mini timeline.
  The picture's width is the smallest of its share, 720px and what the cap allows at 16:9, so a cap makes it smaller and
  keeps its shape. While the timing panel is open the neighbouring lines always go, and a shown picture steps aside under
  1000px of height (it keeps playing, the `<video>` is only not drawn, as it already is for an audio file); taller it fits as
  a strip. A large picture is the whole stage and stays, with a 160px floor.
- **Narrow widths.** Under 600px the picture and the cards take the whole width, the smooth-version pill wraps (a tooltip
  does not exist on a touch screen, so a cut-off word cannot be read), and the card's buttons flow in centred rows. Under
  520px the two edge cards stack, each as two rows with the playhead button beside the value, and under 440px the playhead
  button takes its own row.
- **Touch is the pointer, not the width.** `(hover:none) and (pointer:coarse)` removes the keyboard hints (every `kbd`, the
  key row under the player, the timing panel's keys, the shortcut list, the editor and picker hints) and makes the timing
  step buttons, 「设为播放位置」, Cancel and Save 44px tall. The small pills on the picture keep their size and get a 44px hit
  area from an invisible margin: at 44px a pill would cover a quarter of a 169px picture.

## Alternatives considered

- **More viewport breakpoints.** The sidebar and the transcript make the window's width a poor guess at the column's, and
  that was the bug; a breakpoint at 1100 would be right for one sidebar state and wrong for the other.
- **A resize observer that sets classes.** It works where container queries do not, but it is code to keep in step with the
  stylesheet, runs after layout, and flashes the wrong layout once. Container queries are in current Safari, Chrome and Firefox.
- **Scroll the whole practice column, deck included.** Then the play button is
  off screen exactly when the column is too short, which was the complaint, and a sticky card needs a background to cover what
  scrolls under it.
- **Scale the picture and the sentence to fit.** A font that follows the column's height makes the sentence smaller exactly
  where a reader on an iPad needs it larger, and a scaled picture still needs the room.
- **Hide the picture whenever the column is short.** A short column with the timing panel closed still has room for a picture
  beside a one-line sentence; only the timing panel takes it all, so only then does the picture step aside.

## Settled details

- **Measured, not guessed.** The thresholds come from rendering the real components to markup with the real stylesheet in a
  browser at each size (iPad portrait 820 by 1180 and 744 by 1133, landscape 1180 by 760 and 1024 by 700, each with the host
  sidebar at 56, 224 and 280px, and a desktop 1440 by 900), touch and not, and reading the heights back. Not on a device:
  Safari's own toolbar takes height the numbers above do not include, so a real iPad is a little shorter and reaches the
  scroller a little earlier.
- **A long sentence still scrolls.** Two lines of English and one of Chinese need about 250px of stage; at 1180 by 760 with the
  picture shown and the timing panel closed the picture and sentence together fit with a one-line sentence and overflow by
  about 50px with a long one. The scroller takes that.
- **The 32px buttons of the player card stay 32px.** 44px would add two rows to a card that is already the tallest part of a
  short column, so they are left for a later change that rethinks the card.
