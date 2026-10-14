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

/**
 * Moving one sentence's start and end, written back into the subtitle file itself.
 *
 * Only the timecode lines of that cue (and of a neighbour it pushed) change; the host refuses with `409` when the file is no
 * longer the one the page parsed, and keeps a `.bak` copy of the original before its first write.
 */
export const SUBTITLE_TIMING_PATH = '/lingualab/subtitle-timing'

/**
 * Which subtitle files one episode (or one of its segments) plays with, chosen by hand.
 *
 * `GET` answers for one episode and segment (`episode` and `segment` in the query) with the choice,
 * what the name rule would pick, and the subtitle files there are to choose from. `POST` saves a choice
 * and answers the same way. A folder episode keeps its choices in {@link SUBTITLE_CHOICE_FILE} inside
 * the folder; a file episode keeps its choice in its record in the plugin state.
 */
export const SUBTITLE_CHOICE_PATH = '/lingualab/subtitle-choice'

/** The hidden file in an episode folder that holds the subtitle choices of its segments. */
export const SUBTITLE_CHOICE_FILE = '.lingualab-subtitles.json'

/** The shortest a cue may be made, in milliseconds: shorter, a sentence loop is a click. */
export const MIN_CUE_MS = 200

/**
 * Every kept sentence not yet graded 「记住了」, across the library, for a review that spans
 * episodes. Read only: a grade is written by the episode that is open, through {@link NOTES_PATH}.
 */
export const REVIEW_PATH = '/lingualab/review'

/**
 * What a segment's video amounts to, and how far preparing it has got.
 *
 * `GET` answers for one segment (`episode` and `segment` in the query): whether its video plays as
 * it is, needs preparing, is being prepared, or cannot be played, and the URL to play when it can.
 * Probing the file with `ffprobe` is what decides, so this route is asynchronous and cached per
 * file. Only folder episodes in the library have a video; anything else answers `none`.
 */
export const VIDEO_PATH = '/lingualab/video'

/**
 * Starting the one preparing job: `POST` with `episode`, `segment` and a `mode` (`video`, `sound`,
 * `smooth` or `original`). One job runs at a time; asking for another while one runs is answered `busy`.
 * `smooth` re-encodes the picture for streaming; `original` deletes that file and goes back to the
 * ordinary preparing.
 */
export const VIDEO_PREPARE_PATH = '/lingualab/video-prepare'

/** Cancelling the running preparing job, if there is one; its partial file is removed. */
export const VIDEO_CANCEL_PATH = '/lingualab/video-cancel'

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

/**
 * Video extensions the scan accepts, in the order it prefers them when one stem has several.
 *
 * A video is another source for the same segment, never an episode of its own kind. `mp4` and
 * `webm` can play as they are; `mkv` and `mov` are prepared first (see `host/video.ts`).
 */
export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mkv', 'mov'] as const

/**
 * The hidden folder inside an episode folder where prepared video and sound are kept.
 *
 * The scan skips names starting with a dot, so the cache never shows up as a file. It is the
 * plugin's own: deleting it only means preparing again, and the source video is never touched.
 */
export const VIDEO_CACHE_DIR = '.lingualab'

/** Subtitle extensions the scan accepts. `srt` and `vtt` parse; `lrc` is text-only. */
export const SUBTITLE_EXTENSIONS = ['srt', 'vtt', 'lrc'] as const

/** The note file every episode folder may carry. */
export const NOTES_FILE = 'notes.md'

/**
 * The video beside one segment (or one episode without segments), as the scan sees it.
 *
 * The scan does not probe, so `state` is what the files on disk say: `ready` when a prepared
 * `.mp4` (or the smooth `.smooth.mp4`) is in the cache (or the file is already known to play as it is),
 * `sound` when only the sound was kept (`.m4a`), `unprepared` otherwise. The exact verdict, with the reason, comes from
 * {@link VideoStatusPayload}.
 */
export interface VideoRef {
  /** The source video's file name in the episode folder. */
  readonly file: string
  readonly bytes: number | null
  readonly state: 'ready' | 'sound' | 'unprepared'
}

/** One of the two subtitle slots an episode plays with. */
export type SubtitleSlot = 'en' | 'zh'

/**
 * What one slot holds: left to the name rule (`auto`, the default), one subtitle file, or no track.
 *
 * Picking the same bilingual file for both slots is the bilingual case, as when the rule finds one.
 */
export type SubtitlePick =
  | { readonly kind: 'auto' }
  | { readonly kind: 'none' }
  | { readonly kind: 'file'; readonly file: string }

/** A hand-made choice for both slots. */
export interface SubtitleChoice {
  readonly en: SubtitlePick
  readonly zh: SubtitlePick
}

/**
 * A choice that is in force, as the scan reports it next to the files it resolved to.
 *
 * `missing` names the slots whose picked file is not there any more: they play what the name
 * rule picks, and the choice is kept for when the file comes back.
 */
export interface SubtitleChoiceState {
  readonly choice: SubtitleChoice
  readonly missing: readonly SubtitleSlot[]
}

/**
 * One scene of a folder episode: a single audio file and the subtitles that belong to it.
 *
 * Study material often arrives as one folder per TV episode, cut into scenes that each
 * have their own audio and their own subtitle clock. A folder holding two or more audio
 * stems is therefore one episode made of segments, listed in natural order so `02` comes
 * before `10`. A folder with one audio file has no segments and behaves as it always did.
 */
export interface EpisodeSegment {
  /** The audio stem, unique within the episode: `01_Dunphy家的早晨`. */
  readonly id: string
  /** 1-based position in natural order. */
  readonly index: number
  /** Display title: the stem without a leading number and separator, `Dunphy家的早晨`. */
  readonly title: string
  /** The audio file, or `null` for a segment that is only a video (its sound is taken from the video). */
  readonly audio: string | null
  readonly audioBytes: number | null
  readonly subtitleEn: string | null
  readonly subtitleZh: string | null
  /** The hand-made subtitle choice behind the two names above; absent while both slots are automatic. */
  readonly subtitleChoice?: SubtitleChoiceState
  /** The video that goes with this segment, or `null`. */
  readonly video: VideoRef | null
}

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
  /** Audio file name inside the folder, or `null` when the folder has none (a video alone is enough to open it). */
  readonly audio: string | null
  /** Audio size in bytes, so the panel can show it before playing. */
  readonly audioBytes: number | null
  /** English subtitle file name, if one was found. */
  readonly subtitleEn: string | null
  /** Chinese subtitle file name, if one was found. */
  readonly subtitleZh: string | null
  /**
   * The hand-made subtitle choice behind the two names above; absent while both slots are automatic.
   * With segments it mirrors the first one's, as the names do.
   */
  readonly subtitleChoice?: SubtitleChoiceState
  /** The video of the folder (or of its first segment, when it has segments); `null` for a file episode. */
  readonly video: VideoRef | null
  /**
   * The segments in order; empty unless the folder holds two or more audio files.
   *
   * When there are some, the entry's own `audio` and subtitle fields mirror the first one,
   * so a reader that knows nothing about segments still sees an episode it can play.
   */
  readonly segments: readonly EpisodeSegment[]
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
  /**
   * The segment (audio stem) the sentence is from, when the episode has segments.
   *
   * Seconds are only meaningful inside one segment, so two scenes that both have a sentence
   * at 00:02 are told apart by this. In `notes.md` it is the `## <segment id>` heading the
   * phrase line sits under; a phrase with none belongs to an episode without segments.
   */
  readonly segment?: string
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
  /**
   * A hash of the `notes.md` bytes these phrases came from (or were just written as), which
   * the next save sends back as `expect`. A missing file hashes as an empty one. `null` for a
   * file episode, whose notes are not a file, and for an answer that read nothing.
   */
  readonly version: string | null
  /** True when a save was refused because the file changed after the page read it. */
  readonly stale: boolean
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

/** One episode with sentences still to review, as `GET /lingualab/review` lists it. */
export interface ReviewEpisode {
  readonly episode: string
  readonly title: string
  readonly kind: 'folder' | 'file'
  /** Its segment ids in play order; empty for an episode without segments. */
  readonly segments: readonly string[]
  /** The phrases not graded 「记住了」, in play order (segment, then time). */
  readonly phrases: readonly NotePhrase[]
}

/** `GET /lingualab/review`. */
export interface ReviewPayload {
  readonly ok: boolean
  readonly reason: string | null
  /** Episodes with at least one such sentence, in library order: folders, then loose files. */
  readonly episodes: readonly ReviewEpisode[]
  /** Sentences across all of them. */
  readonly total: number
}

/** `POST /lingualab/notes` request body. */
export interface NotesWriteRequest {
  readonly episode: string
  readonly phrases: readonly NotePhrase[]
  /** The `version` of the notes the page is editing; `null` for a file episode. */
  readonly expect: string | null
}

/** Where the reader stopped in one episode, or in one segment of it (see `segmentKey`). */
export interface ProgressEntry {
  /** Seconds into the episode (or the segment) where listening stopped. */
  readonly at: number
  /** That audio file's length when it was last known. */
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

/**
 * Everything the reader has done that is not a note: positions and step ticks.
 *
 * Step ticks are keyed by episode id. Positions are keyed by episode id for an episode
 * without segments, and by `segmentKey(episode, segment)` for each segment of one that has
 * them, because a position only means something inside one audio file.
 */
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
  /**
   * With `episodeId`: which segment of a folder episode to open, by its id.
   *
   * Omitted means the first one. The host does not decide which segment to continue, because
   * it knows no more than the progress file; the page does, and says so explicitly.
   */
  readonly segment?: string
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
  /** The segment that was opened, or `null` for an episode without segments. */
  readonly segment: string | null
  /** Things that are true but not fatal: `no-subtitle` is the only one today. */
  readonly warnings: readonly string[]
}

/** What a video needs, from the point of view of the stage that has to draw it. */
export type VideoState =
  /** Plays now: `url` is set, and `via` says whether it is the source itself or a prepared copy. */
  | 'playable'
  /** Needs preparing before it plays (the picture is kept, the sound converted). */
  | 'prepare'
  /** A preparing job is running for this segment; `progress` says how far. */
  | 'preparing'
  /** The picture cannot be played here; only the sound can be taken from it. */
  | 'sound-only'
  /** The sound was taken out earlier and plays from the cache: `url` is set, there is no picture. */
  | 'sound-ready'
  /** The video cannot be used at all (no usable stream, or nothing that can be played). */
  | 'unplayable'
  /** It needs preparing and the host has no `ffmpeg`. */
  | 'no-ffmpeg'
  /** The last job for this segment failed; `reason` says why. */
  | 'failed'
  /** There is no video for this segment. */
  | 'none'

/**
 * What the smooth version offers for one segment: 「准备流畅版」, 「改回原画质」, and what went wrong last time.
 *
 * The smooth version re-encodes the picture for a slow link (H.264, 720 lines at most, about 1.9 Mbps) and works for
 * any video that has a picture and a sound, including the ones whose picture a browser cannot decode.
 */
export interface VideoSmooth {
  /** 「准备流畅版」 can be started: the host has `ffmpeg`, the file has a picture and a sound, no smooth file exists, no job runs for it. */
  readonly offer: boolean
  /** What the smooth file will weigh, and how long encoding it takes, roughly. `null` when the length is not known. */
  readonly estimateBytes: number | null
  readonly estimateSeconds: number | null
  /** The smooth file is in the cache: 「改回原画质」 can be offered. */
  readonly revert: boolean
  /** Why the last smooth job for this segment failed, or `null`. */
  readonly error: string | null
}

/** How far a preparing job has got. */
export interface VideoProgress {
  /** 0 to 1. */
  readonly fraction: number
  /** Seconds of the video done so far, and its length. */
  readonly seconds: number
  readonly total: number
}

/** `GET /lingualab/video`, and the answer of `POST /lingualab/video-prepare`. */
export interface VideoStatusPayload {
  readonly ok: boolean
  readonly reason: string | null
  readonly state: VideoState
  /** The source video's file name. */
  readonly file: string | null
  readonly bytes: number | null
  /** What to play, for `playable` and `sound-ready`. */
  readonly url: string | null
  readonly via: 'direct' | 'prepared' | 'smooth' | null
  readonly videoCodec: string | null
  readonly audioCodec: string | null
  /** The video's length in seconds, when probed. */
  readonly duration: number | null
  /**
   * How much longer the video is than the segment's audio file, in seconds, when the two differ by
   * more than a second (negative when the video is shorter). The subtitles were timed against the audio.
   */
  readonly mismatch: number | null
  /** What the prepared file will weigh, roughly, in bytes. */
  readonly estimateBytes: number | null
  /**
   * How far the running job has got, or `null` when none runs for this segment. A smooth job runs while the
   * current file keeps playing, so `progress` can be set in `playable`, not only in `preparing`.
   */
  readonly progress: VideoProgress | null
  /** What kind of file the running job (or the failed one `reason` is about) writes, or `null`. */
  readonly jobKind: 'video' | 'sound' | 'smooth' | null
  /** The smooth version's offers for this segment. */
  readonly smooth: VideoSmooth
  /** The command that installs `ffmpeg` on this host, when `state` is `no-ffmpeg`. */
  readonly installCommand: string | null
}

/** What a prepare request asks for. */
export type VideoPrepareMode = 'video' | 'sound' | 'smooth' | 'original'

/** The modes, for a route that checks the one it was given. */
export const VIDEO_PREPARE_MODES: readonly VideoPrepareMode[] = ['video', 'sound', 'smooth', 'original']

/** `POST /lingualab/video-prepare` request body. */
export interface VideoPrepareRequest {
  readonly episode: string
  readonly segment?: string
  /**
   * `video` keeps the picture and converts the sound; `sound` keeps only the sound; `smooth` re-encodes the
   * picture for streaming; `original` deletes the smooth file and prepares the file as it was before.
   */
  readonly mode: VideoPrepareMode
}

/** `POST /lingualab/video-cancel`. */
export interface VideoCancelPayload {
  readonly ok: boolean
  /** True when a job was running and has been stopped. */
  readonly cancelled: boolean
  readonly reason: string | null
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

/** One subtitle file the choice can offer, with what its first bytes say about it. */
export interface SubtitleCandidate {
  readonly file: string
  /** Whether the first few kilobytes carry Chinese, the same check the name rule falls back on. */
  readonly cjk: boolean
}

/** `GET` and `POST /lingualab/subtitle-choice`. */
export interface SubtitleChoicePayload {
  readonly ok: boolean
  readonly reason: string | null
  /** The choice as it is stored; both slots `auto` when nothing was ever chosen. */
  readonly choice: SubtitleChoice
  /** What the name rule picks for each slot, which is what `auto` plays. */
  readonly auto: { readonly en: string | null; readonly zh: string | null }
  /** What plays now: the choice, with `auto` (and a picked file that is gone) resolved. */
  readonly resolved: { readonly en: string | null; readonly zh: string | null }
  /** The slots whose picked file is not there any more. */
  readonly missing: readonly SubtitleSlot[]
  /** The subtitle files to choose from, in natural order. */
  readonly candidates: readonly SubtitleCandidate[]
}

/** `POST /lingualab/subtitle-choice` request body. */
export interface SubtitleChoiceRequest {
  readonly episode: string
  /** The segment of a folder episode; omitted for an episode without segments. */
  readonly segment?: string
  readonly choice: SubtitleChoice
}

/** One cue's timing as a subtitle file writes it, in whole milliseconds. */
export interface TimingRange {
  readonly start: number
  /** For LRC, which writes starts only, the same as `start`. */
  readonly end: number
}

/** One change to one subtitle file: which cue, where it goes, and which bytes it was read from. */
export interface TimingEdit {
  /** The subtitle file's name, as the episode (or its segment) lists it. */
  readonly file: string
  /** The cue as the file has it now, and which of the cues with exactly that range it is (0 = first). */
  readonly from: TimingRange & { readonly occurrence: number }
  /** The new range. For LRC only `start` is used. */
  readonly to: TimingRange
  /** SHA-256 of the bytes the page parsed, lower-case hex. */
  readonly expect: string
}

/** `POST /lingualab/subtitle-timing` request body. */
export interface TimingWriteRequest {
  readonly episode: string
  /**
   * The sentence's cue, plus a neighbour whose shared edge it pushed, in the English file and again
   * in the Chinese one when that is a file of its own. Never the same cue twice.
   */
  readonly edits: readonly TimingEdit[]
}

/** `POST /lingualab/subtitle-timing`. */
export interface TimingWritePayload {
  readonly ok: boolean
  /**
   * `saved`: every file was written. `stale`: a file changed since the page read it, or the cue is
   * not where the page said; nothing was written and the page should load the subtitles again.
   * `refused`: the request cannot be carried out (a file outside the library, a bad range).
   */
  readonly code: 'saved' | 'stale' | 'refused'
  readonly reason: string | null
  /** The files written, in request order; empty unless `saved`. */
  readonly files: readonly string[]
}

/** `POST /lingualab/config` — set the library root from the picker instead of a typed path. */
export interface LibraryConfigFromPlaceRequest {
  readonly place: string
  readonly rel: string
}
