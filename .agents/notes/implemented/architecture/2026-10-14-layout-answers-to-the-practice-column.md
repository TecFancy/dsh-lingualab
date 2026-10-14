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
56px or 280px and the transcript takes about a third of what is left, so the practice column is 440 to 630px wide while
the window is 1024 or 1180px. The one `max-width:860px` rule never applied. In a column that narrow the picture was 300 by 169
with its overlay pills crowding it, the two edge cards of the timing panel were about 174px each and their value, step
buttons and playhead button wrapped, and the keyboard hints cost a row on a device that has no keyboard while its buttons
were 36 by 30.

A first fix (v0.11.2) moved the breakpoints to the column, and left two things. With the timing panel open at 1024 by 700 the
sentence, the panel (379px) and the card (264px) still needed 147px more than the column had, so the scroller scrolled; and
the picture was hidden whenever the panel was open and the column was under 1000px tall, which is every iPad and a 900px
desktop window. The transcript's follow switch also stuck out of the 260px transcript.

## Decision

**The practice column is a size container, and every rule about what is in it asks the column.** The row it shares with the
transcript is a width container for the one rule about the transcript.

- **Two named containers.** `.dsh-lingualab-practice` is `container:ll-practice/size` (it has a definite size: it is a flex
  item in a fixed-height row, so size containment costs nothing) and `.dsh-lingualab-body` is `container:ll-body/inline-size`.
  The transcript's narrower 260px asks `ll-body`; the rest asks `ll-practice`. Only the browse layer and reduced motion
  still use a media query, because they are about the window. A third container, `ll-video`, is the stage of a picture
  while it takes the leftover room (see the timing mode below).
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
  cap that did not follow the column) and the stage gives up some padding. The picture's width is the smallest of its share,
  720px and what the cap allows at 16:9, so a cap makes it smaller and keeps its shape.
- **Adjusting timing is a mode.** While the timing panel holds a sentence the page sets `is-timing` on the column. It is a
  class on purpose, and not a `:has()` of the panel: the one state that decides it sets it, a test can see it without a layout
  engine, and it does not depend on the panel being mounted (the panel stays mounted for the way out). Everything that is not
  the sentence, the panel and the way to play it steps back:
  - The player card folds to the scrubber and one row, "speed | previous, play, next", about 124px instead of 264. Every other
    button, the key hints and any open menu are hidden by class, not unmounted, so all of it is back when the panel closes.
    The speed button carries `is-speed` to be the one kept, and the row is a three-column grid again at every width, because
    the narrow rule that dissolves the card's sides into one wrapping flow would otherwise put the speed on a second row.
  - The lines either side of the sentence go, and the sentence is not stretched to take room, so it is as tall as its text.
  - A picture that plays takes what is left. Its stage is a size container (`ll-video`) with `flex:1 1 0`, and the picture is the
    biggest box of the video's own shape that fits, the technique of the large state: its width is the smallest of the
    container's width, 720px and its height times the ratio (`--ll-video-ratio`, which a shown picture now carries too; its
    normal frame stays 16:9). It is not drawn when the container is under 120px tall; the `<video>` keeps playing, as it does
    for an audio file. A card or a chip standing in for a picture (a stage without `has-screen`) is not drawn while timing,
    and neither are the pills on the picture (a local file, the smooth version): they do not fit a small picture and are no
    help in moving an edge.
  - A large picture keeps what it had. It is already the part that takes what is left (it is the whole stage, and its
    sentence is not on the stage to take the room) and it has a floor of 160px, so it never reaches the 120px rule. Hiding it
    would leave nothing on the stage for a reader who asked for it.
- **The timing panel in a small room is one compact layout.** It asks `(max-width:600px) or (max-height:760px)`, which is a
  column 648px wide or 780px tall or less. Each edge is one row: the label with how far it moved under it, the value (18px),
  the two 50 ms step buttons and the playhead button, 44px tall (52px on a touch screen, where the steps are 44px). The foot
  is one row: Reset, Cancel and Save, which takes what is left. The mini timeline and the key hints go. The buttons with a
  long text draw both the long and a short text (`timingAtPlayheadShort`, `timingSaveShort`) and the stylesheet picks one; the
  full text stays as `aria-label` and `title`. Where the row cannot hold all four parts the playhead button takes a second
  line of its row: below 372px of content width, and below 392px on a touch screen. The row needs about 341px (365px on
  touch), and the thresholds have 24px of headroom for an hour in the value (`1:05:12.345`). A wide, tall column keeps the two
  cards and the mini timeline. This one layout replaces the two steps of stacking cards (520px and 440px) of v0.11.2, so
  there is one narrow layout and not three. The panel is about 205px tall (233px on touch) instead of 379px.
- **Narrow widths.** Under 600px the picture and the cards take the whole width, the smooth-version pill wraps (a tooltip
  does not exist on a touch screen, so a cut-off word cannot be read), and the card's buttons flow in centred rows.
- **The follow switch says "Follow" where the transcript is 260px wide.** Both words are drawn and the stylesheet picks one;
  the full word stays as the checkbox's `aria-label`. The head's padding, gaps and segmented control are a little tighter in
  that row, so the segmented control with three-digit counts and the switch fit with nothing past the transcript's edge.
- **Touch is the pointer, not the width.** `(hover:none) and (pointer:coarse)` removes the keyboard hints (every `kbd`, the
  key row under the player, the timing panel's keys, the shortcut list, the editor and picker hints) and makes every button
  of the player card (previous and next included), the timing step buttons, the playhead button, Cancel and Save 44px tall.
  The card grows by about 12px for each row of buttons it wraps into. The small pills on the picture keep their size and get a
  44px hit area from an invisible margin: at 44px a pill would cover a quarter of a 169px picture.

## Alternatives considered

- **More viewport breakpoints.** The sidebar and the transcript make the window's width a poor guess at the column's, and
  that was the bug; a breakpoint at 1100 would be right for one sidebar state and wrong for the other.
- **A resize observer that sets classes.** It works where container queries do not, but it is code to keep in step with the
  stylesheet, runs after layout, and flashes the wrong layout once. Container queries are in current Safari, Chrome and Firefox.
  The one class the page does set, `is-timing`, is a state the page already has, not a measurement.
- **Scroll the whole practice column, deck included.** Then the play button is
  off screen exactly when the column is too short, which was the complaint, and a sticky card needs a background to cover what
  scrolls under it.
- **Scale the picture and the sentence to fit.** A font that follows the column's height makes the sentence smaller exactly
  where a reader on an iPad needs it larger, and a scaled picture still needs the room.
- **Hide the picture whenever the timing panel is open and the column is short.** This was v0.11.2, and it hid the picture on
  every iPad and on a 900px desktop window, which have the room for a small one. The picture is now the part that takes the
  leftover room and steps aside only when that is under 120px.
- **Fold only the panel and leave the player card alone.** With the card at 264px the panel could not be under about 230px
  and the picture could not come back at 1024 by 700; while timing, the loop, the shadowing, the picture and the menus are not
  things the reader reaches for, so they wait.
- **Stack the two edge cards in a narrow column (v0.11.2).** Two stacked cards of two rows each were 232px of a column that
  has 631px; one row per edge is 96px, less than half of that, and the same layout serves a short wide column and a narrow tall one.

## Settled details

- **Measured, not guessed.** The thresholds come from rendering the real components to markup with the real stylesheet in a
  browser at each size (iPad portrait 820 by 1180 and 744 by 1133, landscape 1180 by 760 and 1024 by 700, each with the host
  sidebar at 56, 224 and 280px, and a desktop 1440 by 900), touch and not, and reading the heights back. Not on a device:
  Safari's own toolbar takes height the numbers above do not include, so a real iPad is a little shorter and reaches the
  scroller a little earlier.
- **Closed, the page is what it was.** With the timing panel closed and no touch, the deck, the picture and the sentence are
  the same height at every size as in v0.11.2 (the 1440 by 900 desktop has the picture at 443 by 249). Only the touch screen
  differs, by the 44px buttons.
- **Timing at 1024 by 700 with the host sidebar open fits.** The column is 483 by 651. With a one-line sentence the card is
  126px, the sentence 135px, the panel 205px (233px on touch) and the picture 269 by 151 (219 by 123 on touch); nothing
  scrolls. With a two-line sentence the sentence is 214px and the picture does not fit, so it is not drawn and the room above
  the sentence stays empty; nothing scrolls either. The empty room is the cost of a picture container that cannot know how
  much room is left before it is laid out.
- **The picture changes at most once while the panel opens.** The panel grows a grid row from nothing, so the room left for the
  picture only shrinks, and it is hidden once when it crosses 120px. When the panel opens the picture first jumps from its
  usual size to the biggest box that fits (the room has no panel in it yet) and then shrinks. Closing puts the usual layout
  back at once while the panel finishes leaving.
- **A long sentence still scrolls where it must.** Two lines of English and one of Chinese need about 250px of stage; in a column
  that cannot hold the sentence, the panel and the card (under about 570px tall), the scroller takes the rest.
- **The player card's buttons are 32px with a pointer and 44px with a finger.** Making them 44px for a mouse would add two
  rows to a card that is already the tallest part of a short column.
