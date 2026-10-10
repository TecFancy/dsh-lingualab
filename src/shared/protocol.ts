/**
 * The wire contract between the two halves, and the one place the route paths
 * live.
 *
 * The browser half never touches the filesystem, so everything it knows about
 * the library arrives as the JSON below. Keeping the shapes here means a change
 * to a payload is a type error in both halves at once, instead of a runtime
 * surprise in whichever half was not edited.
 *
 * The paths are also declared in `dsh-plugin.naming.json`; `npm run verify`
 * compares the two so a renamed route cannot drift out of the naming record.
 */

/** Library listing: what the panel renders before it has loaded anything. */
export const LIBRARY_PATH = '/lingualab/library'

/** Prefix route serving episode media. The rest of the path is `<episode>/<file>`. */
export const MEDIA_PATH = '/lingualab/media'

/** Reading and writing one episode's notes markdown. */
export const NOTES_PATH = '/lingualab/notes'

/**
 * Reading and changing where the library lives.
 *
 * The panel needs this because the config alone cannot be set from the page: with
 * `libraryRoot` unset the plugin opens on an empty library, and the only way out was
 * to edit the profile's patch file by hand.
 */
export const CONFIG_PATH = '/lingualab/config'

/**
 * The roots the picker may browse.
 *
 * Browsing is by *place id*, never by a path the browser supplies: the page asks for
 * `ws_ab12…` or `lib`, and the host answers with the absolute path it resolved. A
 * route that took a path would be a general file browser on somebody's server, which
 * is a different feature with a different threat model.
 */
export const PLACES_PATH = '/lingualab/places'

/** Listing one directory under one place: a place id plus a relative path. */
export const BROWSE_PATH = '/lingualab/browse'

/**
 * Making one episode current: a folder episode the scan already knows, or a single
 * audio file together with the subtitles sitting beside it.
 */
export const OPEN_PATH = '/lingualab/open'

/**
 * Audio and subtitle bytes for a file episode.
 *
 * Separate from {@link MEDIA_PATH} on purpose. That route resolves `<episode>/<file>`
 * under the library root; this one serves the paths recorded when the reader picked a
 * file, and the two must not be able to address each other's space — a folder that
 * happened to be named `file.abc123` would otherwise be reachable through both.
 */
export const FILE_MEDIA_PATH = '/lingualab/file-media'

/**
 * Receiving one file the reader dropped on the page.
 *
 * One request carries one file as the raw body, with the episode folder and the file
 * name in the query. The page sends an audio file and its subtitles as separate
 * requests into the same folder, so a failure names exactly the file it concerns, and
 * a file that already exists is reported rather than overwritten.
 */
export const IMPORT_PATH = '/lingualab/import'

/**
 * Listening positions and step ticks, kept on the host so they follow the reader to another
 * browser or device. `GET` reads the host's copy; `POST` merges the browser's entries into it
 * (the newest `updatedAt` wins per episode) and answers with the merged result.
 */
export const PROGRESS_PATH = '/lingualab/progress'

/** The hidden file at the library root that holds the progress, next to the episodes' `notes.md`. */
export const PROGRESS_FILE = '.lingualab-progress.json'

/**
 * The most one imported file may weigh. The page checks it before sending so a refusal
 * arrives as a sentence; the host checks it again because the page is only a client.
 */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024 * 1024

/** The header an import request must carry, so a cross-origin page cannot send one blind. */
export const IMPORT_HEADER = 'x-lingualab-import'

/** Audio extensions the library scan accepts, in the order it prefers them. */
export const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'wav', 'ogg', 'opus', 'flac'] as const

/** Subtitle extensions the scan accepts. `srt` and `vtt` parse; `lrc` is text-only. */
export const SUBTITLE_EXTENSIONS = ['srt', 'vtt', 'lrc'] as const

/** The note file every episode folder may carry. */
export const NOTES_FILE = 'notes.md'

/**
 * One episode the panel can open.
 *
 * Two kinds share the shape, because the page treats them the same way once they are
 * open: a **folder episode** is one folder under the library root, and a **file
 * episode** is a single audio file the reader picked in the picker, with whatever
 * subtitles sat beside it. `kind` is what the media URL depends on; `source` is the
 * human-readable place the material came from, shown in the picker and in the notes
 * file's preamble.
 */
export interface EpisodeEntry {
  /** Folder name, or `file.<hash>` for a file episode. */
  readonly id: string
  /** Human title: the folder name unless `manifest.json` renames it; the file stem otherwise. */
  readonly title: string
  /** Audio file name inside the folder, or `null` when the folder has none. */
  readonly audio: string | null
  /** Audio size in bytes, so the panel can show it before playing. */
  readonly audioBytes: number | null
  /** English subtitle file name, if one was found. */
  readonly subtitleEn: string | null
  /** Chinese subtitle file name, if one was found. */
  readonly subtitleZh: string | null
  /** Notes summary, without shipping the file body on every library load. */
  readonly notes: NotesSummary
  /** `folder` for a scanned folder, `file` for one audio file. */
  readonly kind: 'folder' | 'file'
  /** Absolute path the material was found at; display only, never sent back as input. */
  readonly source: string
}

/** How much has been written down for one episode. */
export interface NotesSummary {
  /** Whether `notes.md` exists at all. */
  readonly exists: boolean
  /** Total recorded phrases. */
  readonly count: number
  /** Phrases still marked `#review`. */
  readonly review: number
  /** Phrases still marked `#hard`. */
  readonly hard: number
}

/** `GET /lingualab/library`. */
export interface LibraryPayload {
  /** False when the library root is missing or unreadable; `reason` says why. */
  readonly ok: boolean
  /** Absolute path the scan used, echoed so a misconfiguration is visible. */
  readonly root: string
  /** Why the scan failed, when it did. */
  readonly reason: string | null
  /** The episode that should open first when nothing else is remembered. */
  readonly current: string | null
  /** Every episode folder the scan accepted, in play order. */
  readonly episodes: readonly EpisodeEntry[]
  /**
   * Audio files sitting directly in the library root, in name order.
   *
   * They are their own list rather than more `episodes`, because `episodes` is what
   * `manifest.json` orders and renames; a loose file has no folder to name it by and
   * no place in that order. The picker shows both lists, folders first.
   */
  readonly files: readonly EpisodeEntry[]
  /**
   * What the reader had open last, resolved against the listing above.
   *
   * `null` when nothing is remembered, and also when the remembered thing is gone —
   * in that case {@link currentUnavailable} says what disappeared, so the page can
   * explain itself instead of silently opening something else.
   */
  readonly currentEpisode: EpisodeEntry | null
  /** The remembered episode that is no longer there, when that is what happened. */
  readonly currentUnavailable: OpenRef | null
}

/** One recorded phrase, as the notes markdown carries it. */
export interface NotePhrase {
  /** Seconds into the episode; the panel seeks here. */
  readonly at: number
  /** The English phrase itself, copied from the subtitle line. */
  readonly text: string
  /** Chinese gloss, possibly empty. */
  readonly zh: string
  /** Free-form note: who said it, in what scene. */
  readonly note: string
  /** Tags such as `review` or `hard`, without the leading `#`. */
  readonly tags: readonly string[]
  /** Checkbox state from the markdown list item. */
  readonly done: boolean
}

/** `GET` and `POST /lingualab/notes`. */
export interface NotesPayload {
  readonly ok: boolean
  readonly episode: string
  readonly reason: string | null
  /** The phrases in file order. */
  readonly phrases: readonly NotePhrase[]
}

/** One folder the panel may offer as a library root. */
export interface LibraryCandidate {
  /** Absolute path. */
  readonly path: string
  /** Where the candidate came from: a workspace name, or the setting in effect. */
  readonly label: string
  readonly exists: boolean
  /** Shallow count of subfolders, or `null` when the path is unreadable. */
  readonly episodes: number | null
}

/** `GET /lingualab/config`. */
export interface LibraryConfigPayload {
  /** False when the resolved root is unusable; `reason` says why. */
  readonly ok: boolean
  readonly reason: string | null
  /** The root in effect right now. */
  readonly root: string
  /** The value stored in the plugin config, empty when it is being guessed. */
  readonly configured: string
  /** Where `root` came from. */
  readonly source: 'config' | 'workspace' | 'none'
  readonly exists: boolean
  readonly episodes: number | null
  /** Whether this deployment can persist a new root, or only report it. */
  readonly writable: boolean
  readonly candidates: readonly LibraryCandidate[]
}

/** `POST /lingualab/config` request body. */
export interface LibraryConfigWriteRequest {
  readonly libraryRoot: string
}

/** `POST /lingualab/notes` request body. */
export interface NotesWriteRequest {
  readonly episode: string
  readonly phrases: readonly NotePhrase[]
}

/** Where the reader stopped in one episode. */
export interface ProgressEntry {
  /** Seconds into the episode where listening stopped. */
  readonly at: number
  /** The episode's length when it was last known. */
  readonly duration: number
  /** Milliseconds since the epoch; the newest entry wins when two devices disagree. */
  readonly updatedAt: number
}

/** One of the five steps, as stored. */
export interface StepRecord {
  readonly done: boolean
  readonly seconds: number
}

/** One episode's step ticks, stamped as a whole so the newest device wins as a unit. */
export interface EpisodeSteps {
  readonly updatedAt: number
  readonly records: Readonly<Record<string, StepRecord>>
}

/** Everything the reader has done that is not a note: positions and step ticks, by episode id. */
export interface ProgressTable {
  readonly progress: Readonly<Record<string, ProgressEntry>>
  readonly steps: Readonly<Record<string, EpisodeSteps>>
}

/** `GET` and `POST /lingualab/progress`. */
export interface ProgressPayload extends ProgressTable {
  readonly ok: boolean
  readonly reason: string | null
}

/** One root the picker may browse. Workspaces come from the host; `lib` is the library. */
export interface PlaceEntry {
  /** `ws_<hash>` for a workspace, `lib` for the library root. Stable across restarts. */
  readonly id: string
  readonly kind: 'workspace' | 'library'
  /** Row title: the workspace name, or 「媒体库」. */
  readonly label: string
  /** Absolute path, for display and for the reader to recognise the place. */
  readonly path: string
  readonly readable: boolean
  /** Why it is not readable, when it is not. */
  readonly reason: string | null
  /** True when the conventional media folder already exists somewhere inside it. */
  readonly suggested: boolean
  /** The conventional relative path, so the picker can jump straight to it. */
  readonly conventionRel: string | null
}

/** A name for something that was opened, without the whole entry. */
export interface OpenRef {
  readonly id: string
  readonly title: string
  readonly kind: 'folder' | 'file'
  /** Where it was: the folder path, or the audio file path. */
  readonly source: string
}

/** `GET /lingualab/places`. */
export interface PlacesPayload {
  readonly ok: boolean
  /** Why the list is empty or incomplete, when that is worth saying. */
  readonly reason?: string | null
  readonly places: readonly PlaceEntry[]
  /** What is open now, so the picker can mark the current row. */
  readonly current: OpenRef | null
}

/** Which subtitles sit beside one audio file, decided by name alone. */
export interface SubtitleHint {
  /** `unknown` means one unmarked subtitle exists; its content has not been read. */
  readonly state: 'none' | 'en' | 'zh' | 'both' | 'unknown'
  /** The files that paired, at most four, for the row's secondary line. */
  readonly files: readonly string[]
}

/** One row of a directory listing. */
export interface BrowseEntry {
  readonly name: string
  /** Path relative to the place root; sent back verbatim when opening or descending. */
  readonly rel: string
  readonly type: 'dir' | 'audio' | 'subtitle' | 'other'
  /** Lower-case extension without the dot; empty for a directory. */
  readonly ext: string
  /** Audio rows only: what it would open with. */
  readonly subtitle: SubtitleHint | null
  /** Audio rows only: size in bytes, `null` when it cannot be read. */
  readonly bytes: number | null
}

/** `GET /lingualab/browse`. */
export interface BrowsePayload {
  readonly ok: boolean
  readonly reason: string | null
  /** The resolved place, echoed so the breadcrumb does not need a second request. */
  readonly place: { id: string; kind: 'workspace' | 'library'; label: string; path: string } | null
  /** Normalised relative path of the directory being listed; empty at the root. */
  readonly rel: string
  /** The parent directory, or `null` at the place root. */
  readonly parentRel: string | null
  readonly entries: readonly BrowseEntry[]
  /** Counts before the page limit, so an empty list can say what it skipped. */
  readonly summary: { dirs: number; audio: number; subtitles: number; other: number }
  readonly page: { limit: number; returned: number; truncated: boolean }
  /**
   * Set when this directory is itself a folder episode: a direct child of the library
   * root that holds at least one audio file. The picker offers to open it as one.
   */
  readonly folderEpisode: { id: string; title: string } | null
}

/** `POST /lingualab/open` request body: one of the two shapes, never both. */
export interface OpenRequest {
  /** A folder episode the scan already knows. */
  readonly episodeId?: string
  /** A place id plus a relative path to an audio file. */
  readonly place?: string
  readonly rel?: string
}

/** Where each track of an opened episode can be fetched. Ready to hand to the player. */
export interface EpisodeMedia {
  readonly audioUrl: string
  readonly subtitleEnUrl: string | null
  readonly subtitleZhUrl: string | null
}

/** `POST /lingualab/open`. */
export interface OpenPayload {
  readonly ok: boolean
  readonly reason: string | null
  readonly episode: EpisodeEntry | null
  readonly media: EpisodeMedia | null
  /** Things that are true but not fatal: `no-subtitle` is the only one today. */
  readonly warnings: readonly string[]
}

/** `POST /lingualab/import`. */
export interface ImportPayload {
  readonly ok: boolean
  /**
   * What happened to the file. `exists` is not a failure: the file was already there,
   * nothing was overwritten, and the page carries on with the rest of the episode.
   */
  readonly code: 'saved' | 'exists' | 'refused'
  readonly reason: string | null
  /** The episode folder the file went into, which is the id to open afterwards. */
  readonly episode: string | null
  /** The name the file was saved under, after the host cleaned it. */
  readonly file: string | null
  readonly bytes: number
  /** The library root the file landed under, so the page can say where things went. */
  readonly root: string | null
  /**
   * Whether the same request would be accepted a moment later. True only for "the host is
   * already receiving as many files as it will at once"; every other refusal is about the
   * file or the folder and will repeat.
   */
  readonly retryable?: boolean
}

/** `POST /lingualab/config` — set the library root from the picker instead of a typed path. */
export interface LibraryConfigFromPlaceRequest {
  readonly place: string
  readonly rel: string
}
