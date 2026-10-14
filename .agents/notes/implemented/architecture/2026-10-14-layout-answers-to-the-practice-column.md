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

Both fixes were measured at viewport sizes that left out Safari's own chrome. A real iPad in Safari has its status bar and
toolbar (about 74px with the compact tab layout, about 110px with the separate tab bar, which is the default on recent
iPadOS) taken out of the height, so an iPad mini in landscape has 1133 by 670 or 634 and not 1133 by 744, an iPad Air 11" has
1180 by 746 or 710, an iPad Pro 11" 1194 by 760 or 724 and an iPad Pro 13" 1366 by 950 or 914. With the timing panel closed and
a picture playing, the picture (180px), the sentence and the card (264px, or 230px on touch) needed up to 74px more than the
column had at 1133 by 634 (40px on touch), 49px at 1133 by 670, 25px at 1180 by 710 and 17px at 1194 by 724, for a two-line
English sentence with its Chinese line, so the scroller scrolled in a view that has no use for one. An audio file, the
timing panel open (where the picture already gives way) and the larger iPads did not overflow.

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
- **A picture that plays gives way to the sentence and the card, with the timing panel closed too.** The sentence is text
  and the card is the way to play, so the picture is the one part with room to give. The stage of a playing picture
  (`is-shown.has-screen`) has the size the picture would have as its `flex-basis`, computed from the column: the smallest of
  its share of the width, 720px and the height cap, as a height (the share and the cap are variables the stage reads as well
  as the picture, so the numbers are still said once), with `flex-shrink:1` and `min-height:0`. It is a size container
  (`ll-video`) like the timing one, and the picture is the biggest 16:9 box that fits what the stage gets (its width is the
  smallest of its share, 720px and `100cqh * 16 / 9`; no 300px floor and no height cap of its own). The sentence stage is
  `flex:1 0 auto` and the card `flex:none`, so only the picture can shrink, and the scroller is the last resort again. With
  the room it always had the stage is the old box (the basis is the old picture height, and the stage says
  `box-sizing:content-box` so the padding stays outside it whatever the host does), so nothing that fitted moves. Under 120px
  the same measurement collapses the stage as in timing mode: `usePictureRoom` now runs whenever a picture plays in the shown
  state (it ran only while the panel was open), and the rule that removes the stage no longer needs `is-timing`. What stays
  timing only is the squeezed sentence stage's `flex:1 1 auto`: in a closed column a long sentence must never shrink below
  its text. The pills on a picture (a local file, the smooth version) are not drawn once the picture is under 160px
  (`ll-video (max-height:159px)`, the one query on the stage's height; it is about what is drawn on the picture and never
  about whether the picture is drawn), because they need about that much to keep clear of each other, as screenshots at 231
  by 130 showed.
- **Adjusting timing is a mode.** While the timing panel is on the page (it holds a sentence, and stays for its way out) the
  page sets `is-timing` on the column. It is a class on purpose, and not a `:has()` of the panel: the page's one presence
  state decides it for the column and the panel alike, and a test can see it without a layout engine. Only the layout follows
  that presence; behaviour (the keys, the stage's button) follows the session. Everything that is not the sentence, the panel
  and the way to play it steps back:
  - The player card folds to the scrubber and one row, "speed | previous, play, next", about 124px instead of 264. Every other
    button, the key hints and any open menu are hidden by class, not unmounted, so all of it is back when the panel closes.
    The speed button carries `is-speed` to be the one kept, and the row is a three-column grid again at every width, because
    the narrow rule that dissolves the card's sides into one wrapping flow would otherwise put the speed on a second row.
  - The lines either side of the sentence go, and the sentence is not stretched to take room, so it is as tall as its text.
  - A picture that plays takes what is left. Its stage is a size container (`ll-video`) with `flex:1 1 0`, and the picture is the
    biggest box of the video's own shape that fits, the technique of the large state: its width is the smallest of the
    container's width, 720px and its height times the ratio (`--ll-video-ratio`, which a shown picture now carries too; its
    normal frame stays 16:9). A card or a chip standing in for a picture (a stage without `has-screen`) is not drawn while
    timing, and neither are the pills on the picture (a local file, the smooth version): they do not fit a small picture and
    are no help in moving an edge.
  - A picture with under 120px is not drawn, and its stage is not there either. A size container cannot shrink itself when its
    child is not drawn (a container query on the picture hid the picture and left the stage's `flex:1` box behind: about 80px
    of empty space above a two-line sentence), so this one decision is a measurement. `usePictureRoom` (in the page slice,
    because it spans three widgets) computes the room the picture would get from things that do not change when it
    collapses: the scroller's height inside its padding, less the height the sentence stage needs (measured from its lines, its
    gap and its padding, not from its own box, which is stretched by this very state), less the timing strip, less the
    picture stage's own padding. It is never read from the picture's own box, which would chase itself: collapse, room appears,
    show, room goes. The picture is drawn from 120px, and one that has stepped aside comes back at 128px, so a window dragged
    along the edge does not flicker. The page puts `is-picture-squeezed` on the column, and the stylesheet hides the
    picture's stage (`display:none`) and makes the sentence stage `flex:1 1 auto`; the stage already centres its content, so
    the sentence sits in the middle of the room, which reads as breathing room around it and not as a hole above it. The
    `<video>` keeps playing, as it does for an audio file. The measuring runs before the first paint, watches the scroller,
    the stage's lines (they are replaced on every sentence, so the watched set is rebuilt on each change) and the strip (its
    panel has its full height from its first frame, so the answer is final at once), and is only on while the panel has a sentence and a picture
    plays. Without `ResizeObserver` the picture is taken to fit. The earlier container query at 119px is gone: a second rule with
    its own idea of the edge, a rounded pixel away, would bring the empty box back exactly where the two disagree.
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
  The one class the page sets for the layout, `is-timing`, is a state the page already has, not a measurement. The exception
  is `is-picture-squeezed`, for the one thing a container query cannot do (collapse the box it is measuring); it is the only
  measurement, it runs before paint, and the stylesheet still holds every number but that one.
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
- **Hide the picture with a container query on its own stage only (v0.11.3).** It left the stage's box behind, with nothing
  drawn in it. Making the box `flex:0 0 auto` would let it collapse, but the picture's size comes from that box, so the box
  and the picture would define each other; the measurement breaks the loop by using only what does not change.
- **Stack the two edge cards in a narrow column (v0.11.2).** Two stacked cards of two rows each were 232px of a column that
  has 631px; one row per edge is 96px, less than half of that, and the same layout serves a short wide column and a narrow tall one.
- **Write the picture's size from the measured room (a variable set by the page).** It needs no new CSS idea, but the
  measurement runs after layout, so every sentence that gains a line would draw one frame with the scroller scrolled and
  then a smaller picture. The container sizes the picture in the same layout pass; the measurement is kept for the one
  decision a container cannot make.
- **Make the stage font follow the column's height.** Not needed: with the picture giving way, the sentence and the card fit
  every size measured, and a height term in the font would only change the text where the picture can still absorb the
  shortfall. It is also the "scale to fit" idea above, which makes the sentence smaller where a reader needs it larger.
- **Tighten the card and the stage's padding in a shorter column.** It buys about 24px, which keeps a picture at one size (1133
  by 634 with a pointer, sidebar open, two lines) at the price of a new threshold that changes the sizes of this note that fit
  today. Left out; the picture steps aside there instead.
- **Hide the picture whenever the column is short.** That was the mistake of v0.11.2 for timing; a picture of 130 to 200px is
  what an iPad has the room for.



## Settled details

- **Measured, not guessed.** The thresholds come from rendering the real components to markup with the real stylesheet in a
  browser at each size (iPad portrait 820 by 1180 and 744 by 1133, landscape 1180 by 760 and 1024 by 700, each with the host
  sidebar at 56, 224 and 280px, and a desktop 1440 by 900), touch and not, and reading the heights back. The Safari sizes
  below were measured the same way, except that the real components ran in a browser (the hook included, so the measured
  squeeze is the shipped one), with overlay scrollbars as on an iPad and the stylesheet's touch block applied for touch. Not on
  a device: the font is not SF Pro, which is a little wider, so a sentence may wrap a few characters sooner on an iPad.
- **Safari's own height is in the numbers now.** The sizes are the visible viewport with 74px and with 110px of Safari's
  status bar and toolbar taken off: iPad mini 1133 by 670 and 634, iPad and iPad Air 11" 1180 by 746 and 710, iPad Pro 11"
  1194 by 760 and 724, iPad Pro 13" 1366 by 950 and 914, portrait 744 by 1059 and 820 by 1106, each with the sidebar at 56,
  224 and 280px, one line and two lines (the longest English of two lines under 90 characters, plus a Chinese line), touch
  and pointer, a picture and an audio file, the timing panel closed and open, together with the older sizes above: 720
  states in all. The extra height the scroller was
  needed for before (a two-line sentence, pointer and touch; one line in brackets): 1133 by 670 with the sidebar open 49 and 15
  (5 and 0), 1133 by 634 74 and 40 (30 and 0; with the sidebar at 56px 12 and 16), 1180 by 710 25 and 0, 1194 by 724 17 and 0;
  nothing at 1180 by 746, 1194 by 760, 1366 by 950 and 914, nor in portrait with the sidebar at 56px (a 744px portrait with the
  sidebar open leaves a 155px column, which is not a layout the host produces). With the timing panel open nothing needed it,
  and with an audio file nothing did. After the change none of the 720 states scrolls, and the card ends where the column ends.
  The picture paid for it: with a two-line sentence and the sidebar open it is 234 by 132 at 1133 by 670 (295 by 166 on
  touch), 231 by 130 at 1133 by 634 on touch, 297 by 167 at 1180 by 710 and 319 by 180 at 1194 by 724 (both with a pointer; touch
  fits at full size there); at 1133 by 634 with a pointer and the key hints taking 34px more card it is not drawn, and the
  sentence takes the room. With one line the smallest picture is 248 by 140 (1133 by 634, pointer, sidebar open). A
  three-line sentence no longer scrolls closed either, because the picture steps aside.
- **Closed, the page is what it was where it fitted.** With the timing panel closed, a column that holds the card, the sentence
  and the picture at its own size is the same at every size as in v0.11.2 (the 1440 by 900 desktop with the sidebar open has the
  picture at 443 by 249), apart from at most 0.1px because the stage's height is now computed from the column and not read from
  the picture's width; the picture and the sentence do not move on any device pixel that matters. Touch differs only by the
  44px buttons, as before. The sizes that changed are the ones that did not fit: 1024 by 700 with a two-line sentence and a
  pointer (picture 307 by 173, was 337 by 189 with 17px of scrolling), 1440 by 900 with the sidebar at 56px and a two-line
  sentence (548 by 308 and 540 by 304 on touch, was 557 by 314 with 6 and 10px of scrolling). The timing mode and the
  audio file are identical in all 720 states, and the large picture at the five sizes it was measured at.
- **The cards that stand in for a picture still scroll in a short column.** The card that asks to prepare a video, for one, is
  a page of text, a file line and two buttons (about 340px), and needs 67 to 173px more than a 1133 by 634 or 670 column has.
  It is drawn until the video is prepared, and the card below stays where it is; it was not part of this change.
- **Timing at 1024 by 700 with the host sidebar open fits.** The column is 483 by 651. With a one-line sentence the card is
  126px, the sentence 135px, the panel 205px (233px on touch) and the picture 269 by 151 (219 by 123 on touch); nothing
  scrolls. With a two-line sentence the sentence is 214px and the picture does not fit, so it is not drawn, its stage is
  collapsed, and the sentence stage takes the 80px or so that is left and centres the sentence in it; nothing scrolls either.
  This used to leave an empty box above the sentence, because a picture container cannot know how much room is left before
  it is laid out; the measurement is what knows.
- **The layout steps once in each direction, and only the card's look moves.** The timing panel takes its full height in the
  commit that sets `is-timing` and keeps it until the commit that removes it; what fades and lifts is the card inside it. So
  the picture lands at its final size, or is squeezed away, in the first frame, and `usePictureRoom` decides once from the
  final heights (a picture that crosses 120px is hidden once, and comes back only at 128px). Until v0.11.5 the panel grew a
  grid row from nothing: the picture first jumped to the biggest box that fits, shrank over 240ms, and beside a two-line
  sentence was squeezed away at the end; and closing put the usual layout back at once while the row was still shrinking, so
  the layout moved twice. Closing now runs in the reverse order: the card fades out while the column stays in timing mode,
  and the column leaves it in the same commit that unmounts the panel. Both follow one `usePresence` in the page (the panel
  takes `mounted` and `shown` as props, and the page reads the exit time from the panel's slice), so two timers cannot part
  by a frame. The keys and the stage's button follow the session, which ends at once: while the card fades the keys are the
  page's again and the panel is inert.
- **A long sentence still scrolls where it must.** Two lines of English and one of Chinese need about 250px of stage; in a column
  that cannot hold the sentence, the panel and the card (under about 570px tall), the scroller takes the rest.
- **The player card's buttons are 32px with a pointer and 44px with a finger.** Making them 44px for a mouse would add two
  rows to a card that is already the tallest part of a short column.
