# Agent Note: the home is a practice bench, with the five steps on it

Status: implemented

## Problem

The home of v0.18.0 listed the library well and left the method out. The five steps (blind watch,
subtitle read, shadowing, next-day review, weekly review) are what a session is made of, and the home
could not say which of them came next: only the drawer inside an open episode knew. The user opened
an episode to find out where they were, which is the question the home exists to answer.

The stage had smaller problems of its own. A whole file showed its place as a bare `11:04` over a bar
that was often empty, so the number read as a length and the bar as broken. Four controls offered to
add files (「添加文件」, 「浏览已有的文件」, the drop line, 「选择文件」), two of them the same action.
The review block said one number three times. The size of the audio file sat among the facts about
practice. And the page was a narrow column with hairlines between its blocks, which read like a
settings page rather than a place to work.

## Decision

The home is laid out as a bench, after a design made on a canvas first (direction A of two):

- **The stage** is a framed card on the left and the largest thing on the page. It says when the
  episode was last heard (「接着上次 · 2 小时前」, from the bookmark's `updatedAt`), where it stopped
  (`11:04 / 22:41`, filled to the place), its five steps as a strip of five bars with what each took or
  is suggested to take, and one filled button that names the step it goes to (「继续跟读模仿」). A line
  beside the button says where the audio picks up.
- **The right column** holds the weekly pass (one big number, then up to three source episodes) and
  the only card for adding an episode. A drop anywhere on the page still works; while a file is over
  the page that card's edge turns the brand colour.
- **The library** is a table under the bench once there is more than one episode: where listening
  stopped, five small step bars, what was kept. A filter sorts it by where each episode stands in the
  method: in practice, not started, done. Done means all five steps ticked, not the audio heard out.
- **The foot** is one line: the folder on the left, the build on the right.

The step definitions moved from the step tracker widget to the resume feature, so the tracker and the
home read the same five steps, and the page keeps a table of every episode's ticks next to the
positions it already kept. The ticks are only shown on the home; ticking stays in the drawer, where
the clocks run.

The stage and the home are size containers. A stage under 500px lays the steps out one per row, and a
home under 560px narrows its gutter, so a phone and an iPad beside the host's sidebar get a layout
made for them rather than five squeezed columns.

## Alternatives considered

**A list of today's tasks (direction B).** It reads better as a daily ritual, but "today" needs dates
the ticks do not carry: when a step was done is not recorded, so the next-day and weekly reviews
cannot be scheduled honestly. It can come back once the ticks are stamped.

**Keep the previous layout and fix its details.** The empty bar, the duplicated buttons and the
repeated number could each be fixed in place, but the missing method could not: there was no room on a
narrow stage for five steps without pushing the button below the fold.

**Tick steps from the home.** It would save opening the episode, but the clocks run in the drawer and
a tick without a clock would disagree with the time shown next to it.

## Consequences

The home now reads `dsh-lingualab:steps` as well as the positions, and re-reads both when the host's
sync brings news and when the user comes back from an episode.

The old home was one 777-line file in the size baseline; it is now one small file per block, and the
baseline lost its entries. `locale.ts` grew by the new strings and its baseline grew with it.

The four partial stylesheets moved into `shared/lib/sheets/`, because `shared/lib` was at the module
count Steiger allows and the home's sheet would have gone past it.
