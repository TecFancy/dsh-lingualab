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

/** Audio extensions the library scan accepts, in the order it prefers them. */
export const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'wav', 'ogg', 'opus', 'flac'] as const

/** Subtitle extensions the scan accepts. `srt` and `vtt` parse; `lrc` is text-only. */
export const SUBTITLE_EXTENSIONS = ['srt', 'vtt', 'lrc'] as const

/** The note file every episode folder may carry. */
export const NOTES_FILE = 'notes.md'

/** One episode folder, as the library scan sees it. */
export interface EpisodeEntry {
  /** Folder name, also the id used in `/lingualab/media/<id>/<file>`. */
  readonly id: string
  /** Human title: the folder name unless `manifest.json` renames it. */
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
  /** The episode that should open first. */
  readonly current: string | null
  /** Every episode folder the scan accepted, in play order. */
  readonly episodes: readonly EpisodeEntry[]
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
