# Agent Note: four bands for practice, a picker for material

Status: implemented

## Problem

Two complaints, one shape. The page was a stack of cards of equal weight — player,
subtitles, media folder, notes, five steps — so nothing led the eye, and the setting you
touch twice a month sat at the same level as the notes you write every day. And the only
way to say *what* to practise was a native `<select>` of episode titles, filled by a scan
that only looked inside subfolders, while the library root itself could only be set by
typing an absolute path into a text box.

## Decision

**The page is four horizontal bands.** A 48px top bar (back, the open episode, chips for
notes, steps and the media folder), a stage holding the sentence being worked on together
with the transport row, the subtitle list as the only scroller, and a 32px line of keyboard
reminders. The old title and subtitle are gone: on a practice page the episode name is the
title. Nothing scrolls but the list, so "play this sentence again" cannot scroll away from
the sentence it belongs to.

**Everything that is not listening is a layer.** Picking an episode, keeping notes and
setting the media folder appear over the page and leave when done. The notes layer pushes
the list rather than covering it on a wide page, and covers it on a narrow one, because the
sentence being worked on is on the stage either way.

**Material is picked by browsing.** `GET /lingualab/places` lists the roots a picker may
walk — every workspace, plus the library root — as ids, never as paths. `GET /lingualab/browse`
lists one directory: directories, audio files, subtitles, and for each audio file which
subtitles sit beside it, decided by file name. `POST /lingualab/open` makes one of them
current: a folder episode the scan already knows, or a single audio file, which is recorded
in the plugin's own profile and served from `GET /lingualab/file-media/<id>/<file>`.

**Loose audio is material too.** Files directly in the library root are listed as their own
group and open on their own. The scan stays read-only: it reports them, and the index that
makes them servable is written when one is opened.

**The setting keeps a typed-path fallback.** A mount point outside every workspace has no
place to walk from, so the folder layer still accepts an absolute path. It is no longer the
first thing the page asks for.

## Alternatives considered

- **Keep the cards and restyle them.** Cheaper, and it would have left the actual defect:
  five blocks of equal weight, with the one you look at while listening scrolling away.
- **Put the notes in a right-hand column that is always there.** Half the width of the list
  spent on something consulted a few times an hour; the previous version already showed
  what that does to scanning subtitles.
- **Keep the `<select>` and add a "browse" dialog beside it.** Two selection models to
  maintain, and the dropdown still could not say whether an episode had subtitles.
- **Let the browser send a path to browse.** It would turn a plugin route into a general
  file browser on somebody's server, and the allow-list would become decoration.
- **Write a file episode's notes next to the audio.** The plugin's rule is that the material
  folder is read-only; one `S01E03.notes.md` beside the audio contradicts it and starts a
  second home for the same data.

## Consequences

- The client can no longer address a file by path; everything goes through a place id and a
  relative path the host re-checks after `realpath`.
- A file episode's notes and its index entry live in the plugin's profile entry
  (`openState`), which is the same place `libraryRoot` is written. Two homes for notes —
  markdown in a folder episode, JSON in the profile for a file — is the price of not writing
  into the user's material folder.
- Picking is a request rather than local state: the layer stays open until the host confirms,
  so a refusal is shown where the list is instead of vanishing with the layer.
- The keyboard map grew a second notion of "current row": `↑`/`↓` move a selection without
  moving the audio, `Enter` plays it. Scanning ahead no longer costs your place.
