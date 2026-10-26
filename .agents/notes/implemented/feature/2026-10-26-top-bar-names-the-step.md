# Agent Note: the practice top bar names the step, and keeps two kinds of button

Status: implemented

## Problem

The home's stage now says which step comes next (「继续跟读模仿」). Inside the episode, the top bar fell back
to 「五步 2/5」: a count, with no step named and no clock, so the drawer had to be opened to see either.
It was also the only button in the bar with neither an icon nor a shape of its own.

The right column had three ways in, split over two places: the 「收藏 2 N」 chip and the collapse toggle
in the bar, and the column's own 「字幕 496 | 收藏 2」 tabs. The chip and the 「收藏」 tab did the same
thing. Five buttons came in four styles (words, icon and key cap; icon only; words only; icon only), and only
the kept chip showed its key on the button, while the strip under the player already lists every key.

The back button said 「全部剧集」, but the home is a bench now, not a list of episodes.

## Decision

- **The steps chip** draws five small bars in the colours of the home's table, then the name of the step it
  is on: the step whose clock is running, else the first step not ticked, else 「练完」. While a clock runs,
  its time follows the name. The drawer is unchanged. Its button name keeps the count, so a screen reader
  hears 「五步 2/5，跟读模仿 3:02」.
- **The kept chip is gone.** The column's tabs are the way in, and `N` still switches to them. While the column
  is collapsed those tabs are out of sight, so the column's toggle carries the kept count as a small badge.
- **Two kinds of button.** Chips with words say what is being practised (back, segments, steps); bare icons
  are tools for the page (the column, the settings). The right side is the steps' group, a thin line, then
  the two icons at the far right. Keys are not printed on buttons; they stay in the tooltips and the strip
  under the player.
- **The back button** says 「练习台」.

Which of the five bars is ticked, current or still to come is one pure function in the resume feature,
`stepBars`, which the home's table now uses too.

## Alternatives considered

**Keep the kept chip and drop the column's tabs.** The tabs are what the column shows while it is open, and
they carry both counts (subtitles and kept); the chip carried one. Without the tabs, a column open on the
subtitles would not say how to get to the kept sentences.

**A full step strip in the bar, as on the home's stage.** Five labelled bars take about 400px, more than the
whole right side of the bar on an iPad in portrait. The bar has room for one name, so it names the one step
that matters now, and the drawer keeps the rest.

## Consequences

The steps group and the tools group swapped places: the icons are now the bar's last two buttons. The group
names changed with them (「五步」 and 「右栏与设置」), as did the locale keys (`topGroupSteps`,
`topGroupTools`). The kept chip's key cap rule is gone from the stylesheet, since no chip carries one now.
The narrow top bar hides only the chips' words; the steps chip keeps its bars and its clock.
