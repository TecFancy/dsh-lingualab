# Agent Note: the five steps and the settings drawers take the right column's place

Status: implemented

## Problem

The practice page has three panels on its right side, and they did not look like one page. The right column
(「字幕 496 | 收藏 1」) sits under the top bar, as wide as `clamp(300px,34cqw,440px)`, with a 48px head and a faint
left edge. The five steps' and the settings' drawers started at the very top of the page and covered the top bar
with their scrim, were 440px and 420px wide whatever the column's width, had a heavy shadow, and a two-line head
with an 18px title. Opening one over the column looked like a second, different panel slid over the first.

## Decision

A drawer takes the column's place.

- **Under the top bar.** The drawers and their scrim start at the bar's bottom edge (`--ll-top-h`, the bar's 48px
  and its 1px border). The bar is never covered, so its buttons work while a drawer is open; the page already
  closes one drawer when the other opens.
- **As wide as the column.** The page is a width container (`ll-page`), and the drawers use the column's clamp
  against it. The page is as wide as the row, so the same 982px that makes the column float switches the drawers
  to the floating column's width.
- **The column's frame.** A faint left edge and no shadow, and a 48px head on one line: the title, then a short
  grey phrase, as the column's tabs read 「字幕 496」. The scrim covers the stage only.

## Alternatives considered

**Only align the details.** Keep the drawers over the whole page and match the width and spacing. The top bar
would still be dimmed and blocked, and a drawer still slides over the column as a second panel; this does not
answer what looked inconsistent.

**No scrim for the settings.** A theme change could be judged against an undimmed stage. The scrim is also what
a press outside the drawer lands on to close it, and the five steps' drawer needs it too; two drawers with
different backdrops would be a new inconsistency.

**Settings as a third view of the column.** The column's tabs are about the episode (subtitles, kept sentences);
settings are a tool of the page. It would also leave the five steps' drawer as the only panel of its kind.

## Consequences

The drawer's head lost the 18px title and the second line; the steps' count and the settings' hint now follow
the title on the same line and are cut with an ellipsis when the drawer is narrow. The settings body's side padding
went from 20px to 16px, the column's head padding. The layout reference has a section on these rules.
