# Agent Note: a settings drawer and colour themes

Status: implemented

## Problem

The page took every colour from dsh and had no preferences of its own, so a reader could not make it
easier on the eyes. Listening practice runs for an hour at a stretch, and the page is mostly text:
the sentence on stage, the subtitle column, the kept cards. dsh's black, white and gray is a fair
default, but some readers want a warmer page for reading at a desk, a cooler one at night, or
stronger borders and text, and the stage text is one size for every screen and every pair of eyes.

The page also had one preference that had nowhere to live. The lead-in (start each sentence a little
before it begins) is a habit set once, and it sat in the 「更多」 menu next to the A-B marks, which
are gestures used while listening.

Two limits shaped the answer. Whatever the page does must stay on the page: a plugin that repaints
dsh is a hostile neighbour, the same reason the page does not take the space bar. And dsh decides
day and night, so the default must keep following it.

## Decision

**A settings drawer holds the page's preferences.** It opens from a sliders icon at the right end of
the top bar, on the home and in the practice view, and it is the five-steps drawer's sibling: the
same slide-in over a scrim, the same Escape, the same way of giving the keyboard back to the page.
Opening one closes the other. It has three groups: appearance (light or dark, and the theme),
subtitles (the size of the sentence on stage) and playback (the lead-in, the same state as in
「更多」, which keeps its copy). Every control applies at once and there is no save button. Keys
pressed inside the drawer stay inside it, since it holds radio groups that read the arrow keys.

**A theme is a value for each of the eleven host tokens the page already reads.** Every colour in the
stylesheet is `var(--dsw-alias-…, fallback)` over the same eleven tokens, so a theme is a palette
for them, set as inline custom properties on the page's root element. Custom properties inherit, so
the override reaches everything inside the page and nothing outside it, and the derived `--ll-*`
values, which are `color-mix` over those tokens on the same element, follow without a rule of their
own. No colour rule in the stylesheet had to change to make themes work.

**Each theme has a light and a dark palette, and 「明暗」 picks between them.** 「跟随 dsh」 takes the
host's day or night, read from the `data-ds-dark-theme` attribute dsh puts on `<body>` and watched
with a `MutationObserver`; 「浅色」 and 「深色」 pin one. A pure function,
`resolveThemeVars(theme, appearance, hostDark)`, returns the variables and the `color-scheme` to
apply, or `null`. It returns `null` for the default theme following dsh: nothing is set, and the page
is byte for byte what it was before themes existed. The six themes are 「默认」 (dsh's own black,
white and gray, which is only painted when a mode is pinned), 「墨蓝」, 「松绿」, 「纸张」, 「暮紫」 and
「高对比」.

**The theme cards show the palette in effect.** Each card is a miniature painted in that theme's own
colours for the mode that is showing (a page, a line of text, a quiet line, a brand dot and a
progress bar), so a card says what choosing it will look like, and it follows 「明暗」 as it changes.

**The stage size scales the two stage lines.** Small, medium and large set `--ll-stage-scale` to
0.85, 1 and 1.2, and the English and Chinese lines multiply their existing `clamp()` by it, so the
responsive shape stays. The rest of the page keeps the size the host gives it.

**Settings live in this browser.** One JSON value under `localStorage` key `dsh-lingualab:settings`,
read and written inside `try`, and read back field by field: a value that is not one of the choices
falls back to its default without throwing away the others. Another device starts from the defaults,
and the drawer's footer says so.

**Out of scope:** a free colour picker; per-episode themes; syncing the settings to other devices;
and restyling anything outside the page.

## Alternatives considered

- **A parallel `--ll-*` colour system.** The page would read its own variables and the theme would
  set those. It looks tidier, but it means rewriting every `var(--dsw-alias-…)` in the stylesheet,
  and it breaks the property that makes the default safe: with host tokens as the source, the default
  theme is exactly the host's look because nothing is overridden. Two colour systems would also drift
  the first time a rule reached for the wrong one.
- **CSS selectors keyed on `body[data-ds-dark-theme]`.** Light and dark could live in the stylesheet
  with no JavaScript. But the reader's 「明暗」 pin has to beat the host's attribute, which needs the
  choice on the page's root as an attribute anyway, and the cards need the palette as data to paint
  their previews. Resolving in JavaScript keeps one table that both the page and the cards read.
- **Syncing the settings through the host, with the progress file.** The reader would get their theme
  on every device. But the progress file merges by newest timestamp per key and is shared with the
  library folder, so a look preference would travel to whoever else holds a copy of it, and it adds a
  route and a merge rule for something that is cheap to set again. A device may reasonably want a
  different look (a bright desk, a dim bedroom).
- **A free colour picker.** Maximum freedom, but eleven coordinated colours per mode is not a thing
  anyone picks well, and an unreadable choice would be the page's bug. Curated palettes with a
  high-contrast one keep every choice readable.
- **Leaving the lead-in only in 「更多」.** It stays there too. But the menu is for gestures used while
  listening, and a habit set once belongs with the other preferences.

## Consequences

- Themes need no stylesheet changes beyond the root's colour fade, so a new theme is a row in the
  table in `features/settings/lib/themes.ts` and two locale strings. New styles must keep reading
  only the eleven tokens, never a literal colour, or a theme will miss them.
- The page root now carries an inline `style` (only when a theme is in effect), a `data-ll-stage-size`
  attribute and a short background and colour transition, which the page's reduced-motion rule
  zeroes with the other transitions.
- The page depends on a host convention it does not own: that `data-ds-dark-theme` on `<body>` means
  dark. If dsh changes it, 「跟随 dsh」 reads as light until `useHostDark` is updated. The pinned modes
  are unaffected.
- A theme sets `color-scheme`, so native controls and scrollbars inside the page match it.
- The lead-in is now reachable from two places bound to one state, so a change in either shows in the
  other.
- Settings are per browser by design, so a reader with two devices sets them twice.
