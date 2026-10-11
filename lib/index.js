import z from "@deepseek-ai/schemastery";
import { basename, dirname, extname, isAbsolute, join, posix, relative, resolve, sep, win32 } from "node:path";
import { constants, copyFileSync, createReadStream, createWriteStream, existsSync, linkSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, rmdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
//#region src/shared/protocol.ts
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
const LIBRARY_PATH = "/lingualab/library";
/** Prefix route serving episode media. The rest of the path is `<episode>/<file>`. */
const MEDIA_PATH = "/lingualab/media";
/** Reading and writing one episode's notes markdown. */
const NOTES_PATH = "/lingualab/notes";
/**
* Reading and changing where the library lives.
*
* The panel needs this because the config alone cannot be set from the page: with
* `libraryRoot` unset the plugin opens on an empty library, and the only way out was
* to edit the profile's patch file by hand.
*/
const CONFIG_PATH = "/lingualab/config";
/**
* The roots the picker may browse.
*
* Browsing is by *place id*, never by a path the browser supplies: the page asks for
* `ws_ab12…` or `lib`, and the host answers with the absolute path it resolved. A
* route that took a path would be a general file browser on somebody's server, which
* is a different feature with a different threat model.
*/
const PLACES_PATH = "/lingualab/places";
/** Listing one directory under one place: a place id plus a relative path. */
const BROWSE_PATH = "/lingualab/browse";
/**
* Making one episode current: a folder episode the scan already knows, or a single
* audio file together with the subtitles sitting beside it.
*/
const OPEN_PATH = "/lingualab/open";
/**
* Audio and subtitle bytes for a file episode.
*
* Separate from {@link MEDIA_PATH} on purpose. That route resolves `<episode>/<file>`
* under the library root; this one serves the paths recorded when the reader picked a
* file, and the two must not be able to address each other's space — a folder that
* happened to be named `file.abc123` would otherwise be reachable through both.
*/
const FILE_MEDIA_PATH = "/lingualab/file-media";
/**
* Receiving one file the reader dropped on the page.
*
* One request carries one file as the raw body, with the episode folder and the file
* name in the query. The page sends an audio file and its subtitles as separate
* requests into the same folder, so a failure names exactly the file it concerns, and
* a file that already exists is reported rather than overwritten.
*/
const IMPORT_PATH = "/lingualab/import";
/**
* Listening positions and step ticks, kept on the host so they follow the reader to another
* browser or device. `GET` reads the host's copy; `POST` merges the browser's entries into it
* (the newest `updatedAt` wins per episode) and answers with the merged result.
*/
const PROGRESS_PATH = "/lingualab/progress";
/**
* Moving one sentence's start and end, written back into the subtitle file itself.
*
* Only the timecode lines of that cue (and of a neighbour it pushed) change; the host refuses with `409` when the file is no
* longer the one the page parsed, and keeps a `.bak` copy of the original before its first write.
*/
const SUBTITLE_TIMING_PATH = "/lingualab/subtitle-timing";
/**
* Every kept sentence not yet graded 「记住了」, across the library, for a review that spans
* episodes. Read only: a grade is written by the episode that is open, through {@link NOTES_PATH}.
*/
const REVIEW_PATH = "/lingualab/review";
/** The hidden file at the library root that holds the progress, next to the episodes' `notes.md`. */
const PROGRESS_FILE = ".lingualab-progress.json";
/** Audio extensions the library scan accepts, in the order it prefers them. */
const AUDIO_EXTENSIONS = [
	"mp3",
	"m4a",
	"wav",
	"ogg",
	"opus",
	"flac"
];
/** Subtitle extensions the scan accepts. `srt` and `vtt` parse; `lrc` is text-only. */
const SUBTITLE_EXTENSIONS = [
	"srt",
	"vtt",
	"lrc"
];
/** The note file every episode folder may carry. */
const NOTES_FILE = "notes.md";
//#endregion
//#region src/shared/notes-format.ts
/** `00:03:41` for `221`, `03:41` when the episode is shorter than an hour. */
function formatTimestamp(seconds) {
	const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
	const hours = Math.floor(safe / 3600);
	const minutes = Math.floor(safe % 3600 / 60);
	const secs = safe % 60;
	const mm = String(minutes).padStart(2, "0");
	const ss = String(secs).padStart(2, "0");
	return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
/** Parse `mm:ss` or `h:mm:ss` back into seconds, or `null` when it is neither. */
function parseTimestamp(text) {
	const parts = text.trim().split(":");
	if (parts.length < 2 || parts.length > 3) return null;
	const numbers = parts.map((part) => /^\d+$/.test(part) ? Number(part) : NaN);
	if (numbers.some((value) => Number.isNaN(value))) return null;
	const [first = 0, second = 0, third] = numbers;
	return third === void 0 ? first * 60 + second : first * 3600 + second * 60 + third;
}
const PHRASE_PATTERN = /^\s*-\s*\[( |x|X)\]\s*(.*)$/;
/** Split on unescaped `|`, so `a\\|b` stays one field. */
function splitFields(body) {
	return body.split(/(?<!\\)\|/).map((field) => field.replace(/\\\|/g, "|").trim());
}
/** Escape the separator so a field can contain one. */
function joinField(field) {
	return field.replace(/\|/g, "\\|");
}
/** Split the tags field (`#review #hard`) into bare tag names. */
function parseTags(field) {
	return field.split(/\s+/).map((token) => token.replace(/^#+/, "").trim()).filter((token) => token.length > 0);
}
/** Read one checklist line, or `null` when the line is not a phrase. */
function parsePhraseLine(line) {
	const match = PHRASE_PATTERN.exec(line);
	if (match === null) return null;
	const done = (match[1] ?? " ").toLowerCase() === "x";
	const fields = splitFields(match[2] ?? "");
	const stamp = fields[0] === void 0 ? null : parseTimestamp(fields[0]);
	if (stamp === null) return null;
	const text = (fields[1] ?? "").trim();
	if (text.length === 0) return null;
	return {
		at: stamp,
		text,
		zh: (fields[2] ?? "").trim(),
		note: (fields[3] ?? "").trim(),
		tags: parseTags(fields[4] ?? ""),
		done
	};
}
/** A segment heading: exactly two hashes, then the segment id. `###` and deeper are not ours. */
const SEGMENT_HEADING = /^##(?!#)\s+(.+?)\s*$/;
/**
* Split a notes file into its preserved preamble and its phrases.
*
* A `## <id>` heading names the segment of the phrase lines under it, until the next heading.
* Only a heading with a phrase line directly under it counts: an `## 备注` that someone wrote
* into the preamble as commentary, with prose below it, stays in the preamble instead of
* turning into a segment.
*/
function parseNotes(markdown) {
	const lines = markdown.split(/\r?\n/);
	const tokens = [];
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index] ?? "";
		const phrase = parsePhraseLine(line);
		if (phrase !== null) {
			tokens.push({
				kind: "phrase",
				line: index,
				phrase
			});
			continue;
		}
		const heading = SEGMENT_HEADING.exec(line);
		if (heading?.[1] !== void 0) tokens.push({
			kind: "heading",
			line: index,
			id: heading[1]
		});
	}
	const phrases = [];
	let segment;
	let boundary = -1;
	for (let at = 0; at < tokens.length; at += 1) {
		const token = tokens[at];
		if (token === void 0) continue;
		if (token.kind === "heading") {
			if (tokens[at + 1]?.kind !== "phrase") continue;
			segment = token.id;
			if (boundary === -1) boundary = token.line;
			continue;
		}
		if (boundary === -1) boundary = token.line;
		phrases.push(segment === void 0 ? token.phrase : {
			...token.phrase,
			segment
		});
	}
	return {
		preamble: (boundary === -1 ? markdown : lines.slice(0, boundary).join("\n")).replace(/\s+$/, ""),
		phrases
	};
}
/**
* Give the phrases that carry no segment one, leaving the others alone.
*
* A notes file written before the episode had segments has no headings, and what it holds
* was recorded against the first audio file, which is the first segment. Reading and writing
* both apply this, so those phrases move under the first heading on the next save instead of
* being left outside every group.
* @param phrases - the phrases as parsed or as received.
* @param segment - the segment to give them, or `undefined` for an episode without segments.
* @returns the same array when nothing changes, so a caller's identity checks still hold.
*/
function withSegmentDefault(phrases, segment) {
	if (segment === void 0 || phrases.every((phrase) => phrase.segment !== void 0)) return phrases;
	return phrases.map((phrase) => phrase.segment === void 0 ? {
		...phrase,
		segment
	} : phrase);
}
/** One phrase line, as it is written. */
function phraseLine(phrase) {
	const tags = phrase.tags.map((tag) => `#${tag.replace(/^#+/, "")}`).join(" ");
	const fields = [
		formatTimestamp(phrase.at),
		phrase.text,
		phrase.zh,
		phrase.note
	].map(joinField);
	while (tags.length === 0 && fields.length > 3 && (fields[fields.length - 1] ?? "").trim().length === 0) fields.pop();
	const tail = tags.length > 0 ? ` | ${tags}` : "";
	return `- [${phrase.done ? "x" : " "}] ${fields.join(" | ").trimEnd()}${tail}`;
}
/**
* The canonical file body. `preamble` is kept as-is, then the phrase lines.
*
* Phrases with no segment are written flat, as they always were. When the episode has
* segments, `segmentOrder` lists their ids in play order: those phrases go under the first
* one, and every group is written under its `## <id>` heading in that order. A segment the
* list does not know (an audio file that was renamed since) still keeps its heading, after
* the known ones, in the order its phrases first appear. Within a group the phrases keep the
* order they were given in.
* @param preamble - the text above the first phrase, kept verbatim.
* @param phrases - every phrase of the episode.
* @param segmentOrder - the episode's segment ids in order, or none when it has no segments.
*/
function serializeNotes(preamble, phrases, segmentOrder = []) {
	const head = preamble.trim().length > 0 ? `${preamble.replace(/\s+$/, "")}\n\n` : "";
	const groups = /* @__PURE__ */ new Map();
	for (const phrase of withSegmentDefault(phrases, segmentOrder[0])) {
		const group = groups.get(phrase.segment);
		if (group === void 0) groups.set(phrase.segment, [phrase]);
		else group.push(phrase);
	}
	const known = segmentOrder.filter((id, at) => groups.has(id) && segmentOrder.indexOf(id) === at);
	const strangers = [...groups.keys()].filter((id) => id !== void 0 && !known.includes(id));
	return `${head}${[
		...groups.has(void 0) ? [void 0] : [],
		...known,
		...strangers
	].map((id) => {
		const lines = (groups.get(id) ?? []).map(phraseLine).join("\n");
		return id === void 0 ? `${lines}\n` : `## ${id.replace(/[\r\n]+/g, " ").trim()}\n\n${lines}\n`;
	}).join("\n")}`;
}
/** Counts the library listing shows without shipping the whole file. */
function summarizeNotes(markdown) {
	if (markdown === null) return {
		exists: false,
		count: 0,
		review: 0,
		hard: 0
	};
	const { phrases } = parseNotes(markdown);
	return {
		exists: true,
		count: phrases.length,
		review: phrases.filter((phrase) => phrase.tags.includes("review")).length,
		hard: phrases.filter((phrase) => phrase.tags.includes("hard")).length
	};
}
/**
* The phrases in the order the episode plays them: segment by segment, then by time.
*
* A phrase with no segment belongs to the first one, as everywhere else. A segment the order does
* not know (an audio file renamed since) goes after the known ones, in the order its phrases first
* appear. The sort is stable, so two phrases at the same second keep the order they came in.
* @param phrases - an episode's phrases, in any order.
* @param segmentOrder - its segment ids in order; empty for an episode without segments.
*/
function inPlayOrder(phrases, segmentOrder) {
	const rank = new Map(segmentOrder.map((id, at) => [id, at]));
	const rankOf = (segment) => {
		const id = segment ?? segmentOrder[0];
		const known = rank.get(id);
		if (known !== void 0) return known;
		rank.set(id, segmentOrder.length + rank.size);
		return rank.get(id) ?? 0;
	};
	return phrases.map((phrase, index) => ({
		phrase,
		index,
		rank: rankOf(phrase.segment)
	})).sort((left, right) => left.rank - right.rank || left.phrase.at - right.phrase.at || left.index - right.index).map((item) => item.phrase);
}
//#endregion
//#region src/shared/stem.ts
/**
* Which files belong together, by name: the one rule, in one place.
*
* The host pairs subtitles with an audio file by name when it scans a library, and the
* page pairs a dropped batch the same way before it sends anything. They used to be two
* hand-written copies with a comment promising they agreed. The cost of a disagreement is
* a subtitle that imports under one episode and is then not found under it, so the rule
* lives here and both halves import it; a test on this file is a test on both.
*
* Pure string work with no `node:` imports, so the browser bundle can use it.
*/
/** The file name without its last extension: `lesson.en.srt` becomes `lesson.en`. */
function stemOf(fileName) {
	const dot = fileName.lastIndexOf(".");
	return dot <= 0 ? fileName : fileName.slice(0, dot);
}
/**
* Whether a file name belongs to the same stem as an audio file or an episode folder.
*
* `lesson.mp3` owns `lesson.srt`, `lesson.en.srt` and `lesson_zh.srt`; it does not own
* `lesson2.srt`. The separator is required so a numbered sequel is a different lesson
* rather than a second subtitle track.
* @param fileName - the candidate file name, extension included.
* @param stem - the stem to test it against.
* @returns true when the file belongs to the stem.
*/
function sameStem(fileName, stem) {
	const base = stemOf(fileName);
	if (base === stem) return true;
	const next = base.slice(stem.length, stem.length + 1);
	return base.startsWith(stem) && (next === "." || next === "_" || next === "-");
}
/**
* The stem that owns a file, when several stems are candidates: the longest one that
* {@link sameStem} accepts.
*
* `04_Dunphy家.mp3` and `04_Dunphy家-Luke射击.mp3` can sit in one folder, and
* `04_Dunphy家-Luke射击.srt` starts with both of them followed by a separator. Without a
* tie-break the shorter one would claim it, so the rule is "longest wins". The import
* grouping, the library scan, the picker and opening an episode all ask this one
* function, which is what keeps a subtitle from belonging to one audio file in the
* listing and to another once it is opened.
* @param fileName - the candidate file name, extension included.
* @param stems - the audio stems in the same folder.
* @returns the owning stem, or `null` when none of them accepts the file.
*/
function owningStem(fileName, stems) {
	let best = null;
	for (const stem of stems) if (sameStem(fileName, stem) && (best === null || stem.length > best.length)) best = stem;
	return best;
}
/**
* Split a segment's stem into its number and its title.
*
* Scene files are named `01_Dunphy家的早晨`, and the page wants the number and the name
* apart: the name is the title, the number is what the reader sees in the file list.
* `01_`, `01-`, `01.` and `01 ` all count as a separator. A stem with nothing after the
* separator, or with no number at all, is its own title.
* @param stem - the audio stem.
* @returns the number and the title.
*/
function splitSegmentStem(stem) {
	const match = /^(\d+)[\s._-]+(.+)$/.exec(stem);
	const title = match?.[2]?.trim() ?? "";
	if (match === null || title.length === 0) return {
		number: null,
		title: stem
	};
	return {
		number: match[1] ?? null,
		title
	};
}
//#endregion
//#region src/host/pairing.ts
/**
* Which subtitles sit beside one audio file, and which of them is which language.
*
* Two callers ask this and they ask different questions. The picker shows a row
* per audio file and wants to say "EN + ZH" without reading anything, so it uses
* {@link subtitleHint}, which decides by name alone. Opening an episode needs the
* actual files, so it uses {@link pairSubtitles}, which falls back to reading a
* few bytes of one file when the names do not say.
*
* The shared rule, which is what keeps the library scan and the picker from
* drifting apart: **the file name decides when it says something, and the content
* decides only when it does not.**
*
* A bilingual subtitle is one file with two languages in it, and the study method
* produces them (a `.srt` with the English line above the Chinese one). Such a file
* is offered as *both* tracks, and the panel splits it line by line. When its name says
* so (`_双语`, `.bilingual`) that is decided by name, like `en` and `zh`.
*
* A subtitle belongs to the audio stem that owns it, and the longest stem wins (see
* {@link owningStem}): in a folder of scenes, `04_Dunphy家-Luke射击.srt` is not offered
* to a sibling named `04_Dunphy家`.
*/
/**
* Language marks this module recognises, and only these.
*
* `eng` and `chs` are the spellings everyone reaches for and the two this module
* deliberately does not know: once a list of near-misses is allowed, the pairing
* rule stops being predictable. A file whose mark is not here is *unmarked*, which
* is a state the content check can still resolve.
*/
const ENGLISH_MARKS = /* @__PURE__ */ new Set([
	"en",
	"en-us",
	"en-gb"
]);
const CHINESE_MARKS = /* @__PURE__ */ new Set([
	"zh",
	"zh-cn",
	"zh-hans",
	"zh-hant",
	"cn"
]);
/** Marks that say one file holds both languages. Compared after lower-casing, so `Bilingual` counts. */
const BILINGUAL_MARKS = /* @__PURE__ */ new Set(["双语", "bilingual"]);
/** Extensions this module accepts as subtitles. */
const SUBTITLE_SET = new Set(SUBTITLE_EXTENSIONS);
/** How much of a file is read when the content has to break a tie. */
const SNIFF_BYTES = 4096;
/** Whether the first bytes of a file carry CJK text, used only to break ties. */
function fileHasCjk(path) {
	try {
		const head = readFileSync(path, "utf8").slice(0, SNIFF_BYTES);
		return /[\u4e00-\u9fff]/.test(head);
	} catch {
		return false;
	}
}
/**
* Read the language mark out of one file name.
*
* When an audio stem is known, only the part after it is searched: `lesson.en.srt`
* marks on `en`, and a directory holding `en.mp3` and `lesson.srt` cannot make the
* second file look English by accident. Without a stem the whole name is searched,
* which is what a folder episode needs — there the folder is the stem, and its
* subtitles may be named after the episode rather than after the folder.
* @param fileName - the subtitle file name.
* @param stem - the audio file's stem, when one is known.
* @returns the mark, or `none` when the name says nothing.
*/
function markOf(fileName, stem) {
	const base = stemOf(fileName);
	const tokens = (stem !== void 0 && base.startsWith(stem) ? base.slice(stem.length) : base).split(/[._\-\s]+/).filter((token) => token.length > 0);
	for (const token of tokens) {
		const mark = token.toLowerCase();
		if (ENGLISH_MARKS.has(mark)) return "en";
		if (CHINESE_MARKS.has(mark)) return "zh";
		if (BILINGUAL_MARKS.has(mark)) return "both";
	}
	return "none";
}
/** The stems of the audio files among some names; one per distinct stem, in the order seen. */
function audioStemsOf(names) {
	const stems = /* @__PURE__ */ new Set();
	for (const name of names) if (AUDIO_EXTENSIONS.includes(extname(name).slice(1).toLowerCase())) stems.add(stemOf(name));
	return [...stems];
}
/**
* Split a directory's names into the four groups, in natural order.
*
* A stem narrows the set as well as the reading: subtitles belong to one audio
* file by name, and `other.en.srt` sitting in the same directory is not this
* episode's English track. Without a stem — a folder episode — every subtitle in
* the folder is a candidate, because there the folder is the episode.
*
* With a stem, ownership is by the longest stem: when the directory also holds a
* longer audio stem that accepts the same name, the subtitle is that file's and not
* this one's. This is the one place the rule is applied, so the scan, the picker and
* opening an episode cannot disagree about whose a subtitle is.
* @param names - the file names of one directory.
* @param stem - the audio stem, when the caller has one.
* @returns the classification.
*/
function classifySubtitles(names, stem) {
	const rivals = stem === void 0 ? [] : [stem, ...audioStemsOf(names)];
	const files = names.filter((name) => SUBTITLE_SET.has(extname(name).slice(1).toLowerCase())).filter((name) => stem === void 0 || owningStem(name, rivals) === stem).sort(compareIds);
	const en = [];
	const zh = [];
	const both = [];
	const unmarked = [];
	for (const file of files) {
		const mark = markOf(file, stem);
		if (mark === "en") en.push(file);
		else if (mark === "zh") zh.push(file);
		else if (mark === "both") both.push(file);
		else unmarked.push(file);
	}
	return {
		files,
		en,
		zh,
		both,
		unmarked,
		ambiguous: en.length > 1 || zh.length > 1 || both.length > 1 || unmarked.length > 1
	};
}
/**
* How two unmarked files are told apart when their names say nothing.
*
* This is the fallback for the spelling the mark list refuses (`chs` next to
* `eng`, or a plain `S01E01.srt` next to a translated one): the file with CJK in it
* is the Chinese track. Returns `null` unless the two files disagree, because two
* Chinese files or two English ones are not a pair.
*/
function splitByContent(directory, files) {
	let en = null;
	let zh = null;
	for (const file of files) if (fileHasCjk(join(directory, file))) zh ??= file;
	else en ??= file;
	return en !== null && zh !== null ? {
		en,
		zh
	} : null;
}
/**
* Pick the English and Chinese tracks from one directory's names.
*
* The decision mirrors the scan's original rules, with the mark list above in place
* of the old name heuristic: names decide first; a single file that carries CJK is
* offered as both tracks; and when nothing is marked, the content of at most a few
* files decides which is which. A file whose name marks it bilingual is the Chinese
* source (the page keeps only its Chinese lines), and the English track is an
* English-marked file if there is one, else the single unmarked file, else that
* bilingual file again. `ambiguous` reports that this was a best effort:
* the picker shows that state, while the page opens what it is given.
* @param names - file names of one directory.
* @param options - the audio stem, and the directory when content may be read.
* @returns the pair, plus whether it was guessed.
*/
function pairSubtitles(names, options = {}) {
	const { stem, directory } = options;
	const { files, en, zh, both, unmarked, ambiguous } = classifySubtitles(names, stem);
	if (files.length === 0) return {
		en: null,
		zh: null,
		ambiguous: false
	};
	const bilingualFile = both[0];
	if (bilingualFile !== void 0) {
		const lone = unmarked.length === 1 ? unmarked[0] : void 0;
		return {
			en: en[0] ?? lone ?? bilingualFile,
			zh: bilingualFile,
			ambiguous
		};
	}
	const only = unmarked[0];
	if (en.length === 0 && zh.length === 0 && unmarked.length === 1 && only !== void 0) return {
		en: only,
		zh: directory !== void 0 && fileHasCjk(join(directory, only)) ? only : null,
		ambiguous
	};
	if (en.length > 0 || unmarked.length > 0) {
		const byContent = directory !== void 0 && unmarked.length >= 2 ? splitByContent(directory, unmarked) : null;
		return {
			en: en[0] ?? byContent?.en ?? unmarked[0] ?? null,
			zh: zh[0] ?? byContent?.zh ?? unmarked[1] ?? null,
			ambiguous
		};
	}
	const first = zh[0] ?? files[0] ?? null;
	return {
		en: first,
		zh: first !== null && directory !== void 0 && fileHasCjk(join(directory, first)) ? first : zh[1] ?? null,
		ambiguous
	};
}
/**
* What the picker shows for one audio row, decided by name alone.
*
* Nothing here opens a file: the row is drawn while the reader scrolls, and reading
* a few bytes per audio file would turn a directory listing into a directory scan.
* `unknown` is therefore an honest state — one unmarked subtitle exists and only
* opening the episode will say what it holds.
* @param names - file names of the directory holding the audio.
* @param stem - the audio file's stem.
* @returns the hint, with at most four file names.
*/
function subtitleHint(names, stem) {
	const { files, en, zh, both, unmarked, ambiguous } = classifySubtitles(names, stem);
	const shown = files.slice(0, 4);
	if (files.length === 0) return {
		state: "none",
		files: []
	};
	if (ambiguous) return {
		state: "unknown",
		files: shown
	};
	const bilingual = both[0];
	if (bilingual !== void 0 && both.length === 1) {
		const english = en[0] ?? (unmarked.length === 1 ? unmarked[0] : void 0);
		return {
			state: "both",
			files: english === void 0 ? [bilingual] : [english, bilingual]
		};
	}
	if (en.length === 1 && zh.length === 1) return {
		state: "both",
		files: [en[0] ?? "", zh[0] ?? ""]
	};
	if (en.length === 1 && unmarked.length === 1) return {
		state: "both",
		files: [en[0] ?? "", unmarked[0] ?? ""]
	};
	if (zh.length === 1 && unmarked.length === 1) return {
		state: "both",
		files: [unmarked[0] ?? "", zh[0] ?? ""]
	};
	if (en.length === 1) return {
		state: "en",
		files: shown
	};
	if (zh.length === 1) return {
		state: "zh",
		files: shown
	};
	return {
		state: "unknown",
		files: shown
	};
}
/**
* The audio file of one directory: the first extension in preference order wins.
*
* Shared with the scan so a folder's audio and a file episode's audio are chosen by
* the same rule — a folder holding both `lesson.mp3` and `lesson.wav` must not play
* one file in the library listing and another when the picker opens it.
* @param names - the file names of one directory.
* @returns the file name, or `null` when there is no audio.
*/
function pickAudioFile(names) {
	for (const extension of AUDIO_EXTENSIONS) {
		const hit = names.find((name) => extname(name).slice(1).toLowerCase() === extension);
		if (hit !== void 0) return hit;
	}
	return null;
}
//#endregion
//#region src/host/config.ts
/**
* Which folder the library lives in, and how it gets chosen.
*
* The plugin's config carries `libraryRoot`, and until now the only way to set it
* was the profile's own patch file — which means the panel opened on an empty page
* with no way forward from inside it. This module adds the missing half: validate a
* folder the panel proposes, and offer the folders worth proposing.
*
* Persisting the choice is not done here. The host half hands the validated path to
* the harness settings service, which writes it into this plugin's profile entry —
* the same place the Plugins page edits, so there is one home for the value and no
* second source of truth on disk.
*/
/** The conventional place for material inside a workspace. */
const LIBRARY_SUBPATH = "notes/learning/english/media";
/** Why a proposed folder was refused, or `null` when it is usable. */
function validateRoot(candidate) {
	const path = candidate.trim();
	if (path.length === 0) return "路径是空的";
	if (!isAbsolute(path)) return "要用绝对路径";
	if (!existsSync(path)) return "这个目录不存在";
	try {
		if (!statSync(path).isDirectory()) return "这是一个文件，不是目录";
	} catch {
		return "读不了这个目录";
	}
	return null;
}
/** How many episode folders a directory holds, or `null` when it cannot be read. */
function countEntries(path) {
	try {
		return readdirSync(path, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).length;
	} catch {
		return null;
	}
}
/** One candidate, described well enough for the panel to show why it is worth picking. */
function describe(path, label) {
	const exists = existsSync(path);
	return {
		path,
		label,
		exists,
		episodes: exists ? countEntries(path) : null
	};
}
/**
* The folders worth offering: every workspace's conventional media folder, then the
* one currently in effect if it is somewhere else.
*
* The counts come from a shallow listing rather than a full scan: this answer is
* rendered next to a text box, and a workspace can hold tens of thousands of files.
*/
function candidateRoots(workspaces, current) {
	const candidates = [];
	const seen = /* @__PURE__ */ new Set();
	for (const workspace of workspaces) {
		const path = join(workspace.path, LIBRARY_SUBPATH);
		if (seen.has(path)) continue;
		seen.add(path);
		candidates.push(describe(path, basename(workspace.path) || workspace.path));
	}
	const trimmed = current.trim();
	if (trimmed.length > 0 && !seen.has(trimmed)) candidates.push(describe(trimmed, "当前设置"));
	return candidates;
}
/** Describe the resolved root, without deciding anything about it. */
function describeConfig(resolved, configured, source, writable) {
	const exists = resolved.trim().length > 0 && existsSync(resolved);
	return {
		root: resolved,
		configured,
		source,
		exists,
		episodes: exists ? countEntries(resolved) : null,
		writable,
		reason: resolved.trim().length === 0 ? "还没有设置媒体目录" : exists ? null : "这个目录不存在"
	};
}
/** The payload `GET /lingualab/config` answers with. */
function configPayload(description, workspaces, root) {
	return {
		ok: description.reason === null,
		reason: description.reason,
		root: description.root,
		configured: description.configured,
		source: description.source,
		exists: description.exists,
		episodes: description.episodes,
		writable: description.writable,
		candidates: candidateRoots(workspaces, root)
	};
}
//#endregion
//#region src/host/places.ts
/**
* Where the picker may look, and how a path inside one of those places is checked.
*
* Browsing is by *place id*, never by a path the browser supplies: the page asks
* for `ws_ab12…` or `lib`, and this module answers with the absolute path it
* resolved. A route that took a path would be a general file browser on somebody's
* server, which is a different feature with a different threat model — so the two
* rules that keep it from becoming one live here:
*
* 1. **The roots are an allow-list.** Workspaces come from the host's registry, and
*    the library root comes from this plugin's config. Nothing else is addressable,
*    and the roots a host would never mean to expose — `/`, `/etc`, `/proc` and the
*    rest — are refused even when one of those lists names them by accident.
* 2. **Every step down is checked against the root it started from**, after
*    `realpath`, because a symlink inside a workspace can point anywhere and the
*    lexical answer ("it starts with the root, so it is inside") would be a lie the
*    filesystem tells only later.
*
* The id is derived from the root's own path, so it survives a restart and a
* browser reload; a workspace that is re-registered at the same directory keeps the
* id it had.
*/
/**
* Directories a place may never be, nor sit inside.
*
* The library root and the workspace roots are configuration, and configuration
* gets written by hand: a typo that pointed the panel at `/` would list the whole
* machine to a browser. These are the roots where nothing of the reader's media
* lives and everything of the operating system's does.
*/
const POSIX_FORBIDDEN_ROOTS = [
	"/etc",
	"/proc",
	"/sys",
	"/dev",
	"/run",
	"/boot",
	"/root"
];
/**
* The same idea on Windows, where the operating system lives under the system drive's
* `Windows`, `Program Files` and `ProgramData` folders rather than under `/etc`.
*
* Without this the check was silently a no-op on Windows: `path.resolve('/etc')` there
* is `D:\etc`, which no list of POSIX literals would ever match. The names are compared
* case-insensitively because the filesystem is.
*/
const WINDOWS_FORBIDDEN_NAMES = [
	"windows",
	"program files",
	"program files (x86)",
	"programdata"
];
/** The row title the library place is shown under. */
const LIBRARY_PLACE_LABEL = "媒体库";
/**
* The stable id of a workspace place: `ws_` plus twelve hex characters of the
* path's SHA-1.
*
* A hash rather than the path itself because the id travels in a URL and in the
* page's state, and a path there would be both an eyesore and a second way to
* address a directory the plugin has decided not to address by path at all.
* @param path - the workspace's absolute directory.
* @returns the place id.
*/
function placeIdFor(path) {
	return `ws_${createHash("sha1").update(path).digest("hex").slice(0, 12)}`;
}
/**
* The real path when the filesystem can answer, the resolved one when it cannot.
*
* Containment is decided between real paths — a symlink makes the lexical answer
* wrong — but the checks also run for paths that do not exist yet, and there
* `realpath` throws. Falling back to `resolve` keeps one code path for both, and
* every caller that needs existence asks for it separately.
* @param path - the path to canonicalise.
* @returns the canonical path.
*/
function realPathOf(path) {
	try {
		return realpathSync.native(path);
	} catch {
		const absolute = resolve(path);
		let head = absolute;
		const tail = [];
		for (;;) {
			const parent = dirname(head);
			if (parent === head) return absolute;
			tail.unshift(basename(head));
			head = parent;
			try {
				return join(realpathSync.native(head), ...tail);
			} catch {}
		}
	}
}
/**
* Why a canonical path may not be browsed or written to, or `null` when it may.
*
* Pure, and parameterised by flavour, so the Windows branch and the POSIX branch both run
* in every test environment: a rule that is only exercised on the platform it was written
* for is a rule that nobody notices has stopped working on the other. (It had: the POSIX
* literals never matched anything on Windows.)
* @param real - an already canonical path.
* @param flavour - which rules to apply.
* @returns the reason it is refused, or `null`.
*/
function forbiddenReasonFor(real, flavour) {
	const path = flavour === "win32" ? win32 : posix;
	if (real.length === 0) return "不允许浏览根目录";
	if (path.parse(real).root === real) return "不允许浏览根目录";
	if (flavour === "win32") {
		const first = real.slice(path.parse(real).root.length).split(path.sep)[0]?.toLowerCase() ?? "";
		if (WINDOWS_FORBIDDEN_NAMES.includes(first) || /^[a-z0-9]{1,6}~\d+$/i.test(first)) return `${first} 下面不允许浏览`;
		return null;
	}
	for (const forbidden of POSIX_FORBIDDEN_ROOTS) if (real === forbidden || real.startsWith(`${forbidden}/`)) return `${forbidden} 下面不允许浏览`;
	return null;
}
/**
* Why a directory may not be browsed, or `null` when it may.
*
* The check is on the canonical path, and covers descendants as well as the roots
* themselves: `/etc/ssl` is refused for the same reason `/etc` is. A sibling that
* merely starts with the same characters (`/etcetera`) is not a descendant, so the
* comparison is made on path segments rather than on a bare prefix.
* @param path - the directory to check.
* @returns the reason it is refused, or `null`.
*/
function forbiddenReason(path) {
	return forbiddenReasonFor(realPathOf(path), process.platform === "win32" ? "win32" : "posix");
}
/**
* Whether `target` is `root` itself or sits under it, by real path.
*
* The prefix comparison carries the separator on purpose: without it `/data/lib2`
* would read as being inside `/data/lib`. This is the check the browser's input
* passes through before any read happens.
* @param root - the directory that must contain the target.
* @param target - the path to test.
* @returns true when the target is the root or inside it.
*/
function isInside(root, target) {
	const base = realPathOf(root);
	const other = realPathOf(target);
	if (other === base) return true;
	return other.startsWith(base.endsWith(sep) ? base : `${base}${sep}`);
}
/**
* Validate and normalise a relative path.
*
* The rules are deliberately narrow, because this string is the only piece of a
* browse request that comes from the browser: no NUL, no backslash (a Windows
* separator that some shells normalise late), not absolute, and no `..` segment
* anywhere. Empty segments and `.` are dropped, so `a//b` and `a/./b` both read
* as `a/b` and the answer can be sent back verbatim.
* @param rel - the raw relative path.
* @returns the normalised path, or `null` when it is not acceptable.
*/
function normalizeRel(rel) {
	if (rel.includes("\0")) return null;
	if (rel.includes("\\")) return null;
	if (isAbsolute(rel)) return null;
	const segments = rel.split("/").filter((segment) => segment.length > 0 && segment !== ".");
	if (segments.some((segment) => segment === "..")) return null;
	return segments.join("/");
}
/** The parent of a normalised relative path: `''` at the first level, `null` at the root. */
function parentOfRel(rel) {
	if (rel.length === 0) return null;
	const cut = rel.lastIndexOf("/");
	return cut === -1 ? "" : rel.slice(0, cut);
}
/**
* Whether a directory can be listed right now.
*
* Synchronous and total: this runs while a payload is being built, and a place that
* cannot be read is a row with a reason rather than an exception that would take
* the other places down with it.
* @param path - the directory to probe.
* @returns the verdict, with a short reason when it is not readable.
*/
function probeReadable(path) {
	if (path.trim().length === 0) return {
		readable: false,
		reason: "还没有设置目录"
	};
	const forbidden = forbiddenReason(path);
	if (forbidden !== null) return {
		readable: false,
		reason: forbidden
	};
	if (!existsSync(path)) return {
		readable: false,
		reason: "这个目录不存在"
	};
	try {
		if (!statSync(path).isDirectory()) return {
			readable: false,
			reason: "这是一个文件，不是目录"
		};
		readdirSync(path);
		return {
			readable: true,
			reason: null
		};
	} catch {
		return {
			readable: false,
			reason: "读不了这个目录"
		};
	}
}
/** Whether the conventional media folder already exists inside one root. */
function hasConvention(root) {
	const path = join(root, LIBRARY_SUBPATH);
	try {
		return existsSync(path) && statSync(path).isDirectory();
	} catch {
		return false;
	}
}
/** One `PlaceEntry`, with the readability probe folded in. */
function placeEntry(root, id, kind, label) {
	const probe = probeReadable(root.path);
	return {
		id,
		kind,
		label,
		path: root.path,
		readable: probe.readable,
		reason: probe.reason,
		suggested: kind === "library" ? probe.readable : hasConvention(root.path),
		conventionRel: kind === "library" ? null : LIBRARY_SUBPATH
	};
}
/**
* Every place the picker may browse: each workspace, then the library root.
*
* Workspaces come first because they are what the picker is *for* — the material
* being added lives in a workspace, and the library is where it is being collected.
* The library place is always present, even when its root is unset or unreadable,
* so the row can say that in as many words instead of the picker quietly having
* fewer rows than expected.
* @param workspaces - the workspaces the host knows, in registry order.
* @param libraryRoot - the library root currently in effect; may be empty.
* @returns the places, and whether anything among them can be opened at all.
*/
function listPlaces(workspaces, libraryRoot) {
	const places = [];
	for (const workspace of workspaces) {
		const path = workspace.path;
		if (path.trim().length === 0) continue;
		const id = placeIdFor(path);
		if (places.some((place) => place.id === id)) continue;
		places.push(placeEntry({ path }, id, "workspace", workspace.title?.trim() || basename(path)));
	}
	places.push(placeEntry({ path: libraryRoot.trim() }, "lib", "library", LIBRARY_PLACE_LABEL));
	return places;
}
/** Find one place by id, or `null` when nothing claims it. */
function findPlace(places, id) {
	return places.find((place) => place.id === id) ?? null;
}
/**
* The payload `GET /lingualab/places` answers with.
* @param workspaces - the workspaces the host knows.
* @param libraryRoot - the library root currently in effect.
* @param current - what is open now, so the picker can mark that row.
* @returns the payload; `ok` is true when at least one place can be opened.
*/
function placesPayload(workspaces, libraryRoot, current) {
	const places = listPlaces(workspaces, libraryRoot);
	return {
		ok: places.some((place) => place.readable),
		places,
		current
	};
}
/**
* Resolve `place` + `rel` into an absolute path, refusing anything that leaves the
* place.
*
* Order matters: the place is checked before the join, the relative path is
* normalised before anything touches the filesystem, and the canonical result is
* compared with the canonical root last. A symlink that points outside is caught by
* that final comparison — it is the only check that can see it.
* @param place - the place to resolve inside.
* @param rel - the raw relative path from the request.
* @returns the canonical path, or the reason it was refused.
*/
function resolveInPlace(place, rel) {
	const forbidden = forbiddenReason(place.path);
	if (forbidden !== null) return {
		ok: false,
		reason: forbidden
	};
	const normalized = normalizeRel(rel);
	if (normalized === null) return {
		ok: false,
		reason: "相对路径不合法"
	};
	const abs = join(place.path, normalized);
	if (!existsSync(abs)) return {
		ok: false,
		reason: "这个路径不存在"
	};
	if (!isInside(place.path, abs)) return {
		ok: false,
		reason: "这个路径跑到允许的目录外面了"
	};
	return {
		ok: true,
		abs: realPathOf(abs),
		rel: normalized
	};
}
//#endregion
//#region src/host/state.ts
/**
* What the plugin remembers between requests, and where it remembers it.
*
* A folder episode is a folder under the library root: the scan rediscovers it on
* every request, so nothing about it needs to be stored. A **file episode** is the
* opposite — the reader picked one audio file out of a workspace, and every later
* request that says `file.9f2c…` has to be able to turn that id back into a path.
* That mapping, plus the notes written against it, is this module's whole reason to
* exist.
*
* It is persisted as one JSON string in this plugin's own profile entry (the
* `openState` config field), next to `libraryRoot`. The settings service owns the
* write; a private file on disk would be a second home for plugin state, and the
* first time somebody edited the profile by hand the two would disagree.
*
* Everything here is total: a state string that fails to parse, or that was written
* by a future version, reads as "nothing remembered" rather than taking the panel
* down. The panel can always be used; it just opens on the library default.
*/
/** Prefix that marks an episode id as one audio file rather than one folder. */
const FILE_EPISODE_PREFIX = "file.";
/** The state of a plugin that has never opened anything. */
const EMPTY_STATE = {
	version: 1,
	current: null,
	recent: [],
	files: [],
	notes: {}
};
/** Whether an id names a file episode rather than a folder. */
function isFileEpisodeId(id) {
	return id.startsWith("file.") && id.length > 5;
}
/**
* The id of one audio file: its canonical path, hashed.
*
* The path is the identity on purpose. Renaming the file makes a different episode,
* because the subtitles and the notes beside it were found by name; the id would
* otherwise point at a file whose episode no longer exists.
* @param path - canonical absolute path of the audio file.
* @returns the episode id.
*/
function fileEpisodeIdFor(path) {
	return `${FILE_EPISODE_PREFIX}${createHash("sha1").update(path).digest("hex").slice(0, 16)}`;
}
/** The reference the picker and the library listing name one file episode by. */
function fileRef(record) {
	return {
		id: record.id,
		title: record.title,
		kind: "file",
		source: record.path
	};
}
/** The longest segment id accepted on a phrase: a file name, with room to spare. */
const MAX_SEGMENT_ID_LENGTH = 300;
/** Normalise one incoming phrase, dropping anything that cannot be played back. */
function sanitizePhrase(input) {
	if (typeof input !== "object" || input === null) return null;
	const record = input;
	const at = typeof record.at === "number" && Number.isFinite(record.at) && record.at >= 0 ? record.at : null;
	const text = typeof record.text === "string" ? record.text.trim() : "";
	if (at === null || text.length === 0) return null;
	const tags = Array.isArray(record.tags) ? record.tags.filter((tag) => typeof tag === "string").map((tag) => tag.replace(/^#+/, "").trim()).filter((tag) => tag.length > 0) : [];
	const segment = typeof record.segment === "string" ? record.segment.replace(/[\r\n]+/g, " ").trim() : "";
	return {
		at,
		text,
		zh: typeof record.zh === "string" ? record.zh.trim() : "",
		note: typeof record.note === "string" ? record.note.trim() : "",
		tags,
		done: record.done === true,
		...segment.length > 0 && segment.length <= MAX_SEGMENT_ID_LENGTH ? { segment } : {}
	};
}
/**
* Normalise a list of incoming phrases.
*
* Shared with the notes module, and that sharing is the point: a phrase written
* against a file episode and one written into `notes.md` go through the same rule,
* so the two stores cannot drift into accepting different things.
* @param input - the raw list from a request body or from persisted state.
* @returns the phrases that survived.
*/
function sanitizePhrases(input) {
	const phrases = [];
	for (const item of input) {
		const phrase = sanitizePhrase(item);
		if (phrase !== null) phrases.push(phrase);
	}
	return phrases;
}
/** The counts the library listing shows for a file episode's notes. */
function summarizePhrases(phrases) {
	return {
		exists: phrases.length > 0,
		count: phrases.length,
		review: phrases.filter((phrase) => phrase.tags.includes("review")).length,
		hard: phrases.filter((phrase) => phrase.tags.includes("hard")).length
	};
}
/** Whether a value is a string, for the tolerant readers below. */
function isText(value) {
	return typeof value === "string" && value.length > 0;
}
/** Read one persisted record, or `null` when it is not one. */
function readRecord(value) {
	if (typeof value !== "object" || value === null) return null;
	const record = value;
	if (!isText(record.id) || !isFileEpisodeId(record.id)) return null;
	if (!isText(record.path) || !isText(record.audio)) return null;
	return {
		id: record.id,
		path: record.path,
		title: typeof record.title === "string" && record.title.length > 0 ? record.title : record.audio,
		place: typeof record.place === "string" ? record.place : "",
		rel: typeof record.rel === "string" ? record.rel : "",
		audio: record.audio,
		subtitleEn: typeof record.subtitleEn === "string" ? record.subtitleEn : null,
		subtitleZh: typeof record.subtitleZh === "string" ? record.subtitleZh : null,
		openedAt: typeof record.openedAt === "number" && Number.isFinite(record.openedAt) ? record.openedAt : 0
	};
}
/** Read one persisted reference, or `null` when it is not one. */
function readRef(value) {
	if (typeof value !== "object" || value === null) return null;
	const ref = value;
	if (!isText(ref.id)) return null;
	if (ref.kind !== "folder" && ref.kind !== "file") return null;
	return {
		id: ref.id,
		title: typeof ref.title === "string" && ref.title.length > 0 ? ref.title : ref.id,
		kind: ref.kind,
		source: typeof ref.source === "string" ? ref.source : ""
	};
}
/**
* Read the persisted string back into a state.
* @param raw - the config field's value; empty when nothing has been opened.
* @returns the state, or {@link EMPTY_STATE} when the string is not one.
*/
function parseState(raw) {
	if (raw.trim().length === 0) return EMPTY_STATE;
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return EMPTY_STATE;
	}
	if (typeof parsed !== "object" || parsed === null) return EMPTY_STATE;
	const record = parsed;
	if (record.version !== 1) return EMPTY_STATE;
	const files = [];
	if (Array.isArray(record.files)) for (const item of record.files) {
		const entry = readRecord(item);
		if (entry !== null) files.push(entry);
	}
	const notes = {};
	if (typeof record.notes === "object" && record.notes !== null) for (const [id, value] of Object.entries(record.notes)) {
		if (!isFileEpisodeId(id) || !Array.isArray(value)) continue;
		notes[id] = sanitizePhrases(value);
	}
	const recent = Array.isArray(record.recent) ? record.recent.filter((id) => typeof id === "string" && isFileEpisodeId(id)).slice(0, 20) : [];
	return {
		version: 1,
		current: readRef(record.current),
		recent,
		files,
		notes
	};
}
/**
* Write the state back out.
*
* Field order is fixed by construction rather than inherited from the object, so
* two runs that remember the same thing produce the same string and a profile diff
* stays readable.
* @param state - the state to persist.
* @returns the JSON string.
*/
function serializeState(state) {
	return JSON.stringify({
		version: 1,
		current: state.current,
		recent: state.recent,
		files: state.files,
		notes: state.notes
	});
}
/** One file episode by id, or `null` when it is not in the index. */
function findFileEpisode(state, id) {
	return state.files.find((record) => record.id === id) ?? null;
}
/** The notes written against one file episode. */
function notesFor(state, id) {
	return state.notes[id] ?? [];
}
/** The notes of one file episode, replaced wholesale. */
function withNotes(state, id, phrases) {
	const notes = { ...state.notes };
	if (phrases.length === 0) delete notes[id];
	else notes[id] = phrases;
	return {
		...state,
		notes
	};
}
/**
* Keep the index inside its ceiling.
*
* The order is the point: entries that are neither recent nor annotated are the
* ones nobody would miss, and they go first. Only when that is not enough does the
* oldest entry with something worth keeping go, which is what the ceiling means —
* notes outlive the index entry they came from only until the index is full.
*/
function capIndex(state) {
	if (state.files.length <= 200) return state;
	const recent = new Set(state.recent);
	const oldestFirst = [...state.files].sort((left, right) => left.openedAt - right.openedAt);
	const dropped = /* @__PURE__ */ new Set();
	let overflow = state.files.length - 200;
	for (const record of oldestFirst) {
		if (overflow <= 0) break;
		if (recent.has(record.id) || notesFor(state, record.id).length > 0) continue;
		dropped.add(record.id);
		overflow -= 1;
	}
	for (const record of oldestFirst) {
		if (overflow <= 0) break;
		if (dropped.has(record.id)) continue;
		dropped.add(record.id);
		overflow -= 1;
	}
	const notes = {};
	for (const [id, phrases] of Object.entries(state.notes)) if (!dropped.has(id)) notes[id] = phrases;
	return {
		...state,
		files: state.files.filter((record) => !dropped.has(record.id)),
		notes
	};
}
/**
* Remember one opened file episode: refresh its record, make it current, and mark
* it recent.
* @param state - the state before the open.
* @param record - what was opened.
* @returns the state after it.
*/
function withOpenedFile(state, record) {
	const files = [record, ...state.files.filter((entry) => entry.id !== record.id)];
	const recent = [record.id, ...state.recent.filter((id) => id !== record.id)].slice(0, 20);
	return capIndex({
		...state,
		files,
		recent,
		current: fileRef(record)
	});
}
/**
* Remember which episode is open, without touching the index.
*
* Used for folder episodes, which are rediscovered by the scan and therefore need
* no record — only the note that this, and not the library default, is what the
* reader had open.
* @param state - the state before.
* @param ref - the episode now open, or `null` to forget.
* @returns the state after.
*/
function withCurrent(state, ref) {
	return {
		...state,
		current: ref
	};
}
//#endregion
//#region src/host/library.ts
/**
* The library scan.
*
* One episode is one folder under the library root, holding an audio file, up to
* two subtitle files and an optional `notes.md`. A folder that holds two or more audio
* files is still one episode, made of segments: one scene per audio file, each with the
* subtitles that carry its name. Nothing else is required and
* nothing is generated here: the scan is read-only. Material arrives by hand or through
* the import route (src/host/import.ts, which never replaces a file), and a plugin that rewrites a user's
* media folder is a plugin you stop trusting.
*
* An optional `manifest.json` at the root may set the play order and rename
* episodes:
*
* ```json
* { "episodes": ["S01E02", "S01E01"], "titles": { "S01E02": "The Bicycle Thief" }, "current": "S01E02" }
* ```
*
* Without it, folders sort naturally by name and the first episode that has no
* notes yet is the one offered first — which is the "learn the next thing"
* default the study method asks for.
*
* Audio files lying loose in the root are the other half of the listing. They are
* **not** episodes: `manifest.json` orders and renames episodes, and a loose file
* has no folder to be named by, so it is reported separately as `files` with an id
* derived from its path. The picker shows both lists; the panel can play either.
*/
/** Optional root file that overrides order, titles and the opening episode. */
const MANIFEST_FILE = "manifest.json";
/** Natural order: `S01E2` sorts before `S01E10`, which a plain string sort gets wrong. */
function compareIds(left, right) {
	const split = (value) => value.split(/(\d+)/).filter((part) => part.length > 0).map((part) => /^\d+$/.test(part) ? Number(part) : part.toLowerCase());
	const a = split(left);
	const b = split(right);
	for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
		const one = a[index];
		const two = b[index];
		if (one === void 0) return -1;
		if (two === void 0) return 1;
		if (one === two) continue;
		if (typeof one === "number" && typeof two === "number") return one - two;
		return String(one).localeCompare(String(two));
	}
	return 0;
}
/** Read `manifest.json`, tolerating absence and malformed content alike. */
function readManifest(root) {
	const path = join(root, MANIFEST_FILE);
	if (!existsSync(path)) return {};
	try {
		const parsed = JSON.parse(readFileSync(path, "utf8"));
		return typeof parsed === "object" && parsed !== null ? parsed : {};
	} catch {
		return {};
	}
}
/**
* The title a folder episode is shown under.
*
* Exported because the picker offers to open a folder episode from its directory
* listing, and the row there should carry the same name the library shows.
* @param root - the library root.
* @param id - the folder name.
* @returns the manifest title when there is one, the folder name otherwise.
*/
function episodeTitle(root, id) {
	return readManifest(root).titles?.[id] ?? id;
}
/** The size of one file, or `null` when it cannot be measured. */
function sizeOf(path) {
	try {
		return statSync(path).size;
	} catch {
		return null;
	}
}
/**
* The segments of one episode folder: one per audio stem, in natural order.
*
* A folder with a single audio stem has none, and is one episode of one file as it always
* was; `lesson.mp3` next to `lesson.wav` is one stem, and the extension preference of
* {@link pickAudioFile} picks between them. Each segment pairs its own subtitles by name,
* and the longest stem owns a subtitle (see `classifySubtitles`), so the scan, the
* picker and the open all agree about which file belongs to which scene.
*
* Exported because the notes writer needs the same order for the headings of `notes.md`.
* @param folder - the absolute path of the episode folder.
* @param names - the visible file names in it.
* @returns the segments, or an empty list unless there are two or more.
*/
function scanSegments(folder, names) {
	const stems = audioStemsOf(names).sort(compareIds);
	if (stems.length < 2) return [];
	const segments = [];
	for (const stem of stems) {
		const audio = pickAudioFile(names.filter((name) => stemOf(name) === stem));
		if (audio === null) continue;
		const { en, zh } = pairSubtitles(names, {
			directory: folder,
			stem
		});
		segments.push({
			id: stem,
			index: segments.length + 1,
			title: splitSegmentStem(stem).title,
			audio,
			audioBytes: sizeOf(join(folder, audio)),
			subtitleEn: en,
			subtitleZh: zh
		});
	}
	return segments;
}
/** Scan one episode folder. A folder with no audio is listed but not playable. */
function scanEpisode(root, id, title) {
	const folder = join(root, id);
	const names = readdirSync(folder).filter((name) => !name.startsWith("."));
	const segments = scanSegments(folder, names);
	const first = segments[0];
	const audio = first === void 0 ? pickAudioFile(names) : first.audio;
	const { en, zh } = first === void 0 ? pairSubtitles(names, { directory: folder }) : {
		en: first.subtitleEn,
		zh: first.subtitleZh
	};
	const audioBytes = first === void 0 ? audio === null ? null : sizeOf(join(folder, audio)) : first.audioBytes;
	const notesPath = join(folder, NOTES_FILE);
	return {
		id,
		title,
		audio,
		audioBytes,
		subtitleEn: en,
		subtitleZh: zh,
		segments,
		notes: existsSync(notesPath) ? summarizeNotes(readFileSync(notesPath, "utf8")) : summarizeNotes(null),
		kind: "folder",
		source: folder
	};
}
/**
* Describe one audio file by looking at the directory it is in.
*
* One home for "what is beside this file", used both by the library listing for the
* loose files in the root and by the picker when it opens one. The subtitles are
* paired by name and content, never cached, so adding a translation and reopening
* the episode is enough to see it.
* @param path - absolute path of the audio file.
* @returns the description, or `null` when the directory cannot be read.
*/
function describeAudioFile(path) {
	let names;
	try {
		names = readdirSync(dirname(path)).filter((name) => !name.startsWith("."));
	} catch {
		return null;
	}
	const audio = basename(path);
	let bytes;
	try {
		const stats = statSync(path);
		if (!stats.isFile()) return null;
		bytes = stats.size;
	} catch {
		return null;
	}
	const pair = pairSubtitles(names, {
		directory: dirname(path),
		stem: stemOf(audio)
	});
	return {
		id: fileEpisodeIdFor(path),
		path,
		audio,
		title: stemOf(audio),
		bytes,
		subtitleEn: pair.en,
		subtitleZh: pair.zh
	};
}
/** Dress one described audio file as an episode, with the notes held for it. */
function audioEntry(description, state) {
	return {
		id: description.id,
		title: description.title,
		audio: description.audio,
		audioBytes: description.bytes,
		subtitleEn: description.subtitleEn,
		subtitleZh: description.subtitleZh,
		segments: [],
		notes: summarizePhrases(notesFor(state, description.id)),
		kind: "file",
		source: description.path
	};
}
/** The loose audio files directly in the library root, in name order. */
function scanLooseFiles(root, names, state) {
	const files = [];
	for (const name of names.filter(isAudioName).sort(compareIds)) {
		const description = describeAudioFile(realPathOf(join(root, name)));
		if (description === null) continue;
		files.push(audioEntry(description, state));
	}
	return files;
}
/** Whether a file name is audio the scan accepts. */
function isAudioName(name) {
	return AUDIO_EXTENSIONS.includes(extname(name).slice(1).toLowerCase());
}
/** The episode the panel opens: the manifest's choice, else the first unstudied one. */
function pickCurrent(episodes, manifest) {
	if (manifest.current !== void 0 && episodes.some((entry) => entry.id === manifest.current)) return manifest.current;
	return episodes.find((entry) => entry.notes.count === 0)?.id ?? episodes[episodes.length - 1]?.id ?? null;
}
/** What the reader had open, resolved against what is on disk now. */
function describeCurrent(state, episodes, files) {
	const remembered = state.current;
	if (remembered === null) return {
		currentEpisode: null,
		currentUnavailable: null
	};
	if (remembered.kind === "folder") {
		const entry = episodes.find((candidate) => candidate.id === remembered.id) ?? null;
		return entry === null ? {
			currentEpisode: null,
			currentUnavailable: remembered
		} : {
			currentEpisode: entry,
			currentUnavailable: null
		};
	}
	const loose = files.find((candidate) => candidate.id === remembered.id);
	if (loose !== void 0) return {
		currentEpisode: loose,
		currentUnavailable: null
	};
	const record = findFileEpisode(state, remembered.id);
	if (record === null || !existsSync(record.path)) return {
		currentEpisode: null,
		currentUnavailable: remembered
	};
	const description = describeAudioFile(record.path);
	if (description === null) return {
		currentEpisode: null,
		currentUnavailable: remembered
	};
	return {
		currentEpisode: audioEntry(description, state),
		currentUnavailable: null
	};
}
/** Read the root and describe every episode in it. Never throws. */
function scanLibrary(root, state = EMPTY_STATE) {
	const bare = (ok, reason) => {
		const resolved = describeCurrent(state, [], []);
		return {
			ok,
			root,
			reason,
			current: null,
			episodes: [],
			files: [],
			currentEpisode: resolved.currentEpisode,
			currentUnavailable: resolved.currentUnavailable
		};
	};
	if (root.trim().length === 0) return bare(false, "媒体目录还没配置");
	if (!existsSync(root)) return bare(false, "媒体目录不存在");
	let entries;
	try {
		entries = readdirSync(root, { withFileTypes: true });
	} catch (error) {
		return bare(false, `读不了媒体目录：${String(error)}`);
	}
	const folderNames = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name);
	const looseNames = entries.filter((entry) => (entry.isFile() || entry.isSymbolicLink()) && !entry.name.startsWith(".") && isAudioName(entry.name)).map((entry) => entry.name);
	const manifest = readManifest(root);
	const ordered = manifest.episodes !== void 0 && manifest.episodes.length > 0 ? [...manifest.episodes.filter((id) => folderNames.includes(id)), ...[...folderNames].filter((id) => !manifest.episodes?.includes(id)).sort(compareIds)] : [...folderNames].sort(compareIds);
	const episodes = [];
	for (const id of ordered) try {
		episodes.push(scanEpisode(root, id, manifest.titles?.[id] ?? id));
	} catch {
		continue;
	}
	const files = scanLooseFiles(root, looseNames, state);
	const resolved = describeCurrent(state, episodes, files);
	return {
		ok: true,
		root,
		reason: null,
		current: pickCurrent(episodes, manifest),
		episodes,
		files,
		currentEpisode: resolved.currentEpisode,
		currentUnavailable: resolved.currentUnavailable
	};
}
/** Where a row's type sits in the listing: directories first, then by kind. */
const TYPE_RANK = {
	dir: 0,
	audio: 1,
	subtitle: 2,
	other: 3
};
/** An empty payload with a reason, for the refusals. */
function refusedBrowse(place, rel, reason) {
	return {
		ok: false,
		reason,
		place: place === null ? null : {
			id: place.id,
			kind: place.kind,
			label: place.label,
			path: place.path
		},
		rel,
		parentRel: parentOfRel(rel),
		entries: [],
		summary: {
			dirs: 0,
			audio: 0,
			subtitles: 0,
			other: 0
		},
		page: {
			limit: 0,
			returned: 0,
			truncated: false
		},
		folderEpisode: null
	};
}
/** Classify one directory entry by its extension, without touching it. */
function typeOf(name) {
	const ext = extname(name).slice(1).toLowerCase();
	if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
	if (SUBTITLE_EXTENSIONS.includes(ext)) return "subtitle";
	return "other";
}
/** Clamp the requested page size to something one listing can answer. */
function clampLimit(requested) {
	if (requested === void 0 || !Number.isFinite(requested) || requested <= 0) return 80;
	return Math.min(Math.floor(requested), 200);
}
/** Every entry worth showing, before the query and the page limit; `null` when unreadable. */
function candidatesOf(directory, rel) {
	const candidates = [];
	let entries;
	try {
		entries = readdirSync(directory, { withFileTypes: true });
	} catch {
		return null;
	}
	for (const entry of entries) {
		if (entry.name.startsWith(".")) continue;
		const childRel = rel.length === 0 ? entry.name : `${rel}/${entry.name}`;
		const path = join(directory, entry.name);
		if (entry.isSymbolicLink()) {
			if (!isInside(directory, path)) continue;
			try {
				if (statSync(path).isDirectory()) candidates.push({
					name: entry.name,
					rel: childRel,
					type: "dir",
					ext: ""
				});
				else {
					const type = typeOf(entry.name);
					candidates.push({
						name: entry.name,
						rel: childRel,
						type,
						ext: extname(entry.name).slice(1).toLowerCase()
					});
				}
			} catch {
				continue;
			}
			continue;
		}
		if (entry.isDirectory()) {
			candidates.push({
				name: entry.name,
				rel: childRel,
				type: "dir",
				ext: ""
			});
			continue;
		}
		const type = typeOf(entry.name);
		candidates.push({
			name: entry.name,
			rel: childRel,
			type,
			ext: extname(entry.name).slice(1).toLowerCase()
		});
	}
	return candidates;
}
/**
* List one directory under one place.
* @param request - the place, the relative path, and the page options.
* @returns the payload the picker renders, with a reason instead of throwing.
*/
function browsePlace(request) {
	const { place, libraryRoot, rel } = request;
	if (place.path.trim().length === 0) return refusedBrowse(place, "", "这个位置还没有设置目录");
	const resolved = resolveInPlace(place, rel);
	if (!resolved.ok) return refusedBrowse(place, "", resolved.reason);
	try {
		if (!statSync(resolved.abs).isDirectory()) return refusedBrowse(place, resolved.rel, "这不是一个目录");
	} catch {
		return refusedBrowse(place, resolved.rel, "读不了这个目录");
	}
	const candidates = candidatesOf(resolved.abs, resolved.rel);
	if (candidates === null) return refusedBrowse(place, resolved.rel, "读不了这个目录");
	const summary = {
		dirs: candidates.filter((entry) => entry.type === "dir").length,
		audio: candidates.filter((entry) => entry.type === "audio").length,
		subtitles: candidates.filter((entry) => entry.type === "subtitle").length,
		other: candidates.filter((entry) => entry.type === "other").length
	};
	const query = (request.query ?? "").trim().toLowerCase();
	const visible = candidates.filter((entry) => query.length === 0 || entry.name.toLowerCase().includes(query)).filter((entry) => entry.type !== "other" || request.includeOther === true).sort((left, right) => TYPE_RANK[left.type] - TYPE_RANK[right.type] || compareIds(left.name, right.name));
	const limit = clampLimit(request.limit);
	const page = visible.slice(0, limit);
	const names = candidates.map((entry) => entry.name);
	const entries = page.map((entry) => {
		if (entry.type !== "audio") return {
			name: entry.name,
			rel: entry.rel,
			type: entry.type,
			ext: entry.ext,
			subtitle: null,
			bytes: null
		};
		let bytes = null;
		try {
			bytes = statSync(join(resolved.abs, entry.name)).size;
		} catch {}
		return {
			name: entry.name,
			rel: entry.rel,
			type: entry.type,
			ext: entry.ext,
			subtitle: subtitleHint(names, stemOf(entry.name)),
			bytes
		};
	});
	return {
		ok: true,
		reason: null,
		place: {
			id: place.id,
			kind: place.kind,
			label: place.label,
			path: place.path
		},
		rel: resolved.rel,
		parentRel: parentOfRel(resolved.rel),
		entries,
		summary,
		page: {
			limit,
			returned: entries.length,
			truncated: visible.length > entries.length
		},
		folderEpisode: folderEpisodeOf(resolved.abs, summary.audio, libraryRoot)
	};
}
/**
* Whether the directory being listed is itself a folder episode.
*
* That is exactly the case the picker cannot tell from a name: a folder that is a
* direct child of the library root and holds audio is an episode the scan already
* knows, so the row offers to open it as one instead of making the reader walk into
* it and pick the file by hand.
*/
function folderEpisodeOf(directory, audioCount, libraryRoot) {
	if (audioCount === 0) return null;
	const root = libraryRoot.trim();
	if (root.length === 0) return null;
	const canonicalRoot = realPathOf(root);
	if (realPathOf(join(directory, "..")) !== canonicalRoot) return null;
	const id = basename(directory);
	if (id.length === 0 || id === "." || id === "..") return null;
	return {
		id,
		title: episodeTitle(canonicalRoot, id)
	};
}
//#endregion
//#region src/host/guard.ts
/** Whether a value is the host's connection service. */
function isConnection(value) {
	return typeof value === "object" && value !== null && typeof value.admit === "function";
}
/** The plain-text answer for a refused request. */
function refuse$2(res, status, text) {
	res.writeHead(status, {
		"content-type": "text/plain; charset=utf-8",
		"cache-control": "no-store"
	});
	res.end(`${text}\n`);
}
/**
* Decide whether a request may proceed, and answer it when it may not.
* @param ctx - the host context; the connection service is read through `ctx.get`.
* @param req - the request, read for its headers only.
* @param res - the response, written only on refusal.
* @returns true when the handler may run.
*/
function admitRequest(ctx, req, res) {
	let connection;
	try {
		connection = ctx.get?.("connection");
	} catch {
		connection = void 0;
	}
	if (!isConnection(connection)) {
		refuse$2(res, 403, "这个部署没有 connection 服务，没法确认请求来自哪里");
		return false;
	}
	let verdict;
	try {
		verdict = connection.admit(req);
	} catch {
		refuse$2(res, 403, "没法确认请求来自哪里");
		return false;
	}
	if ("rejection" in verdict) {
		refuse$2(res, verdict.rejection, verdict.rejection === 401 ? "请先登录" : "这个请求不被信任");
		return false;
	}
	return true;
}
/**
* Wrap a route so its handler only runs for an admitted request.
* @param ctx - the host context.
* @param route - the route to protect.
* @returns the same route, guarded.
*/
function guarded(ctx, route) {
	return {
		...route,
		handler: (req, res) => {
			if (!admitRequest(ctx, req, res)) return;
			return route.handler(req, res);
		}
	};
}
//#endregion
//#region src/host/import.ts
/**
* Receiving the files a reader drops on the page.
*
* This is the one place the plugin writes into the media folder, and it is narrow on
* purpose. The rule it bends is "the material folder is read-only": a panel that can
* only open what is already on disk cannot be the first thing a new reader does, and
* copying files into a folder by hand is the step that made the page unusable on day
* one. What survives of the rule is everything that made it worth having.
*
*   · **Nothing is overwritten.** A name that exists is reported as `exists` and the
*     existing file is left exactly as it was. Replacing someone's audio because a
*     drag landed twice is the failure this whole module is arranged to make impossible.
*   · **Only media goes in.** The extension must be one the scan would accept, so the
*     route cannot be used to put an arbitrary file on somebody's disk.
*   · **Names are cleaned, never trusted.** The folder and the file name come from the
*     browser. Separators, `..`, control characters and the names Windows reserves are
*     removed or refused, and the final path is checked to be inside the root after the
*     folder exists, so a symlinked folder cannot lead the write out of the library.
*   · **A write is whole or absent.** The body goes to a dot-prefixed temporary file in
*     the same folder, which the scan ignores, and is moved into place only when every
*     byte has arrived. An interrupted upload leaves no half-file that looks like audio,
*     and a .part left by a crash is swept the next time that folder is written to.
*   · **Bounded.** A file is capped at 2 GB, at most {@link MAX_CONCURRENT_IMPORTS} run at once,
*     and a request that is already known to be refused is cut off rather than read to the end.
*/
/** The longest folder or file name accepted, which is well under every filesystem's own limit. */
const MAX_NAME_LENGTH = 120;
/** Names Windows will not create, whatever their extension. */
const RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
/** Characters no mainstream filesystem accepts in a name, plus the control range. */
const FORBIDDEN = /[<>:"/\\|?*\u0000-\u001f]/g;
/**
* Make one path segment safe to create, or say there is nothing safe to make.
* @param raw - the name as the browser sent it.
* @returns the cleaned name, or `null` when nothing usable is left.
*/
function cleanName(raw) {
	let name = raw.replace(FORBIDDEN, "_").trim();
	name = name.replace(/^\.+/, "").replace(/[. ]+$/, "");
	if (name.length === 0) return null;
	if (name.length > MAX_NAME_LENGTH) {
		const extension = extname(name);
		name = `${name.slice(0, MAX_NAME_LENGTH - extension.length)}${extension}`;
	}
	const stem = name.includes(".") ? name.slice(0, name.indexOf(".")) : name;
	if (RESERVED.test(stem)) name = `_${name}`;
	return name;
}
/** What kind of file an extension is, or `null` for one this route will not take. */
function importKind(fileName) {
	const extension = extname(fileName).slice(1).toLowerCase();
	if (AUDIO_EXTENSIONS.includes(extension)) return "audio";
	if (SUBTITLE_EXTENSIONS.includes(extension)) return "subtitle";
	return null;
}
/** One refusal, shaped like every other answer from this route. */
function refuse$1(reason, root = null, retryable = false) {
	return {
		ok: false,
		code: "refused",
		reason,
		episode: null,
		file: null,
		bytes: 0,
		root,
		retryable
	};
}
/** Uploads in flight right now, across every request this process is serving. */
let inFlight = 0;
/** A leftover `.part` file older than this is from a request that is gone. */
const STALE_PART_MS = 36e5;
/**
* Stop reading the request, so the client sees the answer and not a reset.
*
* For a refusal known before any byte is wanted. Reading the rest to throw it away would
* make a refusal cost as much as an upload (up to 2 GB), which is the wrong way round, so
* a body that has not started is not read at all. The answer is written by the caller;
* `req.destroy()` here would cut the connection before it could be sent.
*/
function ignoreBody(req) {
	req.on("error", () => void 0);
	req.resume();
}
/** A transform that fails the pipeline the moment the body outgrows its ceiling. */
function limiter(limit, counted) {
	return new Transform({ transform(chunk, _encoding, callback) {
		counted.bytes += chunk.byteLength;
		if (counted.bytes > limit) {
			callback(/* @__PURE__ */ new Error("文件太大"));
			return;
		}
		callback(null, chunk);
	} });
}
/** Remove a file and say nothing if it is already gone. */
function quietUnlink(path) {
	try {
		unlinkSync(path);
	} catch {}
}
/**
* Delete stale `.part` files in an episode folder.
*
* A process that dies mid-upload cannot clean up after itself, and the scan hides
* dot-files, so without this they would sit in the folder for good. Only files this
* module names (a leading dot and a trailing `.part`) and only old ones are touched, so a
* live upload, which is minutes old at the most, is never in the way.
*/
function sweepStale(directory, now = Date.now()) {
	let names;
	try {
		names = readdirSync(directory);
	} catch {
		return;
	}
	for (const name of names) {
		if (!name.startsWith(".") || !name.endsWith(".part")) continue;
		const path = join(directory, name);
		try {
			if (now - statSync(path).mtimeMs > STALE_PART_MS) unlinkSync(path);
		} catch {}
	}
}
/** Remove an episode folder this request created and left empty. */
function removeIfEmpty(directory) {
	try {
		if (readdirSync(directory).length === 0) rmdirSync(directory);
	} catch {}
}
/**
* Move a finished temporary file to its final name without ever replacing a file.
*
* A hard link is the one call that fails when the target exists, on every filesystem that
* supports it. Where it does not (some network shares and removable volumes), the
* fallback is a copy with `COPYFILE_EXCL`, which is also an exclusive create: two writers
* racing for one name cannot both succeed. A rename would not be, because on every
* platform it replaces its target.
* @returns `false` when the name was taken by the time the file was ready.
* @throws when the file could not be placed for a reason other than the name being taken.
*/
function place(temp, final) {
	try {
		linkSync(temp, final);
	} catch (error) {
		if (error.code === "EEXIST" || existsSync(final)) {
			quietUnlink(temp);
			return false;
		}
		try {
			copyFileSync(temp, final, constants.COPYFILE_EXCL);
		} catch (copyError) {
			if (copyError.code === "EEXIST") {
				quietUnlink(temp);
				return false;
			}
			throw copyError;
		}
	}
	quietUnlink(temp);
	return true;
}
/**
* Receive one file into the library.
* @param request - the folder, the file name, and the library root.
* @param body - the request, read as a stream.
* @returns the payload to send; never throws.
*/
async function importFile(request, body) {
	const limit = request.maxBytes ?? 2147483648;
	const refusal = (reason, retryable = false) => {
		ignoreBody(body);
		return refuse$1(reason, request.root.length > 0 ? request.root : null, retryable);
	};
	if (request.root.trim().length === 0) return refusal("还没有媒体目录，没法放文件");
	if (forbiddenReason(request.root) !== null) return refusal("媒体目录不能是系统文件夹");
	const file = cleanName(request.file);
	if (file === null) return refusal("文件名不能用");
	if (importKind(file) === null) return refusal("只收音频和字幕（srt、vtt、lrc）");
	const folder = cleanName(request.episode.length > 0 ? request.episode : stemOf(file));
	if (folder === null) return refusal("剧集名不能用");
	if (request.declaredBytes !== null && request.declaredBytes > limit) return refusal("文件太大，单个最多 2 GB");
	if (inFlight >= 2) return refusal("正在导入别的文件，请稍后再试", true);
	inFlight += 1;
	try {
		return await receive(request, body, {
			file,
			folder,
			limit
		});
	} finally {
		inFlight -= 1;
	}
}
/** Create the folder, stream the body into a temporary file, and move it into place. */
async function receive(request, body, checked) {
	const { file, folder, limit } = checked;
	const fail = (reason) => {
		ignoreBody(body);
		return refuse$1(reason, request.root);
	};
	try {
		mkdirSync(request.root, { recursive: true });
	} catch (error) {
		return fail(`媒体目录建不出来：${String(error)}`);
	}
	const directory = join(request.root, folder);
	let created = false;
	try {
		if (existsSync(directory)) {
			if (!statSync(directory).isDirectory()) return fail("已经有一个同名的文件，换个剧集名");
		} else {
			mkdirSync(directory);
			created = true;
		}
	} catch (error) {
		return fail(`剧集文件夹建不出来：${String(error)}`);
	}
	if (!isInside(request.root, directory)) {
		if (created) removeIfEmpty(directory);
		return fail("这个剧集文件夹指到媒体目录外面了");
	}
	sweepStale(directory);
	const final = join(directory, file);
	const base = {
		episode: folder,
		file,
		root: request.root
	};
	if (existsSync(final)) {
		ignoreBody(body);
		return {
			ok: true,
			code: "exists",
			reason: null,
			bytes: 0,
			...base
		};
	}
	const temp = join(directory, `.${file}.${randomBytes(6).toString("hex")}.part`);
	const counted = { bytes: 0 };
	const abandon = (reason) => {
		quietUnlink(temp);
		if (created) removeIfEmpty(directory);
		return refuse$1(reason, request.root);
	};
	try {
		await pipeline(body, limiter(limit, counted), createWriteStream(temp, { flags: "wx" }));
	} catch (error) {
		return abandon(`没收完：${String(error instanceof Error ? error.message : error)}`);
	}
	if (counted.bytes === 0) return abandon("收到的是空文件");
	try {
		if (!place(temp, final)) return {
			ok: true,
			code: "exists",
			reason: null,
			bytes: 0,
			...base
		};
	} catch (error) {
		return abandon(`没能放到位：${String(error instanceof Error ? error.message : error)}`);
	}
	return {
		ok: true,
		code: "saved",
		reason: null,
		bytes: counted.bytes,
		...base
	};
}
//#endregion
//#region src/host/media.ts
/**
* Serving one media file out of the library.
*
* Two things here are not optional for a listening panel.
*
* **Range requests.** Without them the browser downloads a whole episode before
* the scrubber works, so "jump back three seconds and replay" — the single most
* frequent action in the whole study method — would wait on a 20 MB file every
* time. The handler answers `206 Partial Content` with the requested slice.
*
* **Containment.** The path comes from the URL, so it is untrusted input: the
* request is decoded, joined to the library root, and then compared with
* `path.relative`. A prefix comparison would be wrong the moment the filesystem
* normalises differently than the base string, and an allow-list of extensions
* means a request can only ever name a file this plugin is willing to serve.
*/
/** Extensions the media route will serve, with the type each is sent as. */
const CONTENT_TYPES = {
	mp3: "audio/mpeg",
	m4a: "audio/mp4",
	mp4: "audio/mp4",
	wav: "audio/wav",
	ogg: "audio/ogg",
	opus: "audio/ogg",
	flac: "audio/flac",
	srt: "text/plain; charset=utf-8",
	vtt: "text/vtt; charset=utf-8",
	lrc: "text/plain; charset=utf-8"
};
/** The content type a servable extension is sent as, or `null` when it is not one. */
function contentTypeOf(path) {
	return CONTENT_TYPES[extname(path).slice(1).toLowerCase()] ?? null;
}
/** Resolve a request path to a file inside the library, or `null` to refuse it. */
function resolveMediaPath(root, requestPath) {
	let decoded;
	try {
		decoded = decodeURIComponent(requestPath);
	} catch {
		return null;
	}
	if (decoded.includes("\0")) return null;
	const segments = decoded.split("/").filter((segment) => segment.length > 0 && segment !== ".");
	if (segments.length !== 2) return null;
	const [episode, file] = segments;
	if (episode === void 0 || file === void 0 || episode === ".." || file === "..") return null;
	if (!(extname(file).slice(1).toLowerCase() in CONTENT_TYPES)) return null;
	const target = join(root, episode, file);
	const within = relative(root, target);
	if (within.length === 0 || within.startsWith("..") || isAbsolute(within)) return null;
	return target;
}
/** Parse a single-range `Range` header against a known file size. */
function parseRange(header, size) {
	if (header === void 0) return null;
	const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
	if (match === null) return null;
	const [, rawStart = "", rawEnd = ""] = match;
	if (rawStart === "" && rawEnd === "") return null;
	if (rawStart === "") {
		const length = Number(rawEnd);
		if (!Number.isFinite(length) || length <= 0) return null;
		return {
			start: Math.max(0, size - length),
			end: size - 1
		};
	}
	const start = Number(rawStart);
	const end = rawEnd === "" ? size - 1 : Math.min(Number(rawEnd), size - 1);
	if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return null;
	return {
		start,
		end
	};
}
/** Send one file, honouring `Range`. Returns nothing; the response owns the socket. */
function serveMedia(req, res, root, requestPath) {
	const target = resolveMediaPath(root, requestPath);
	if (target === null) {
		res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
		res.end("没有这个文件\n");
		return;
	}
	serveFile(req, res, target);
}
/**
* Send one already-validated file, honouring `Range`.
*
* Split out of {@link serveMedia} because a file episode is served from a path the
* plugin remembered rather than from `<root>/<episode>/<file>`: the resolving
* differs, the bytes and the range handling do not, and duplicating this would mean
* two places to get `206` and `416` right.
*
* The caller owns containment. This function trusts `target`, and says so here
* because it is the only place a reader might wonder.
* @param req - the request, read for `Range` and for `HEAD`.
* @param res - the response to write.
* @param target - absolute path of the file to send.
*/
function serveFile(req, res, target) {
	if (!existsSync(target)) {
		res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
		res.end("没有这个文件\n");
		return;
	}
	const size = statSync(target).size;
	const type = CONTENT_TYPES[extname(target).slice(1).toLowerCase()] ?? "application/octet-stream";
	const range = parseRange(req.headers.range, size);
	if (req.headers.range !== void 0 && range === null) {
		res.writeHead(416, {
			"content-range": `bytes */${size}`,
			"accept-ranges": "bytes"
		});
		res.end();
		return;
	}
	if (range === null) {
		res.writeHead(200, {
			"content-type": type,
			"content-length": String(size),
			"accept-ranges": "bytes",
			"cache-control": "no-cache"
		});
		if (req.method === "HEAD") {
			res.end();
			return;
		}
		pipeFile(target, res);
		return;
	}
	res.writeHead(206, {
		"content-type": type,
		"content-length": String(range.end - range.start + 1),
		"content-range": `bytes ${range.start}-${range.end}/${size}`,
		"accept-ranges": "bytes",
		"cache-control": "no-cache"
	});
	if (req.method === "HEAD") {
		res.end();
		return;
	}
	pipeFile(target, res, range.start, range.end);
}
/**
* Stream a file into the response, and end the response if the read fails.
*
* A `ReadStream` with no `error` listener is an unhandled exception, and an
* unhandled exception in the host process takes the whole GUI with it. A file that
* disappears mid-read is a realistic case: the library folder is edited by hand.
*/
function pipeFile(path, res, start, end) {
	const stream = start === void 0 ? createReadStream(path) : createReadStream(path, {
		start,
		end
	});
	stream.on("error", () => {
		res.destroy();
	});
	res.on("close", () => {
		stream.destroy();
	});
	stream.pipe(res);
}
/** JSON helper shared by every route: one shape, one place to change it. */
function sendJson(res, status, body) {
	const text = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": String(Buffer.byteLength(text)),
		"cache-control": "no-store"
	});
	res.end(text);
}
/** Read a JSON request body with a ceiling, so a bad client cannot exhaust memory. */
async function readJsonBody(req, limitBytes = 262144) {
	const chunks = [];
	let total = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
		total += buffer.byteLength;
		if (total > limitBytes) {
			req.destroy();
			throw new Error("请求体太大");
		}
		chunks.push(buffer);
	}
	const text = Buffer.concat(chunks).toString("utf8");
	return text.trim().length === 0 ? null : JSON.parse(text);
}
//#endregion
//#region src/host/notes.ts
/**
* Reading and writing one episode's notes.
*
* The file is the hand-off between the panel and the agent: the panel writes it
* while listening, and the agent reads it later to run the next-day review and
* the weekly quiz. Both therefore go through {@link parseNotes} and
* {@link serializeNotes} rather than treating the markdown as opaque text.
*
* Writes are whole-file and last-writer-wins. That is deliberate for V1: one
* person, one browser, and a file small enough to rewrite in a single call. A
* merge strategy would be guessing at a conflict that does not exist yet.
*
* There are two stores behind one route, and the id decides which one answers. A
* folder episode writes `notes.md` inside its folder, where the agent's grep finds
* it. A file episode has no folder of its own inside the library — the audio is
* wherever the reader keeps it — so its phrases live in the plugin state instead.
* The ceiling and the phrase shape are the same in both, because
* {@link sanitizePhrases} and the ceiling check are the same in both.
*
* A folder episode cut into segments keeps one notes.md, with a heading per segment. The
* format module owns the headings; this module only tells it the order of the segments,
* which is the folder's own (the scan's), so the file reads in play order however the
* phrases arrived. The ceiling counts the whole file, not each segment.
*/
/** Episode ids name a folder, so they may not contain separators or escapes. */
function isSafeEpisodeId(id) {
	return id.length > 0 && !id.includes("/") && !id.includes("\\") && id !== "." && id !== "..";
}
/**
* The preamble a fresh notes file opens with: what the grades are, and how a line carries them,
* for whoever opens the file in an editor.
*/
function defaultPreamble(episode) {
	return [
		`# ${episode} 笔记`,
		"",
		"> 每句收藏只有一个状态，在页面上按 1 记住了、2 模糊、3 没记住。",
		"> 文件里打勾 `[x]` 是记住了，`#review` 是模糊，`#hard` 是没记住，都没有是新收藏。"
	].join("\n");
}
/** Where an episode's notes live. */
function notesPath(root, episode) {
	return join(root, episode, NOTES_FILE);
}
/**
* Whether the resolved notes path is still inside the library.
*
* The id check above rejects `..`, and this catches what it cannot: an episode
* folder that is a symlink pointing outside the root. The comparison has to be
* between *real* paths — a lexical `relative` answers "inside" for a symlink,
* because it never touches the filesystem. The containing directory is resolved
* rather than the file, so a notes file that does not exist yet can still be
* checked before it is written.
*/
function staysInside(root, target) {
	try {
		const within = relative(realpathSync(root), join(realpathSync(dirname(target)), basename(target)));
		return within.length > 0 && !within.startsWith("..") && !isAbsolute(within);
	} catch {
		return false;
	}
}
/**
* The segment ids of one episode folder in play order; empty for an episode without segments.
*
* Read from the folder at the moment of the call rather than remembered, so adding a scene
* and saving once is enough for the file to follow.
*/
function segmentIdsOf(folder) {
	try {
		return scanSegments(folder, readdirSync(folder).filter((name) => !name.startsWith("."))).map((segment) => segment.id);
	} catch {
		return [];
	}
}
/** Read the notes for one episode; a missing file is an empty list, not an error. */
function readNotes(root, episode, state = EMPTY_STATE) {
	if (!isSafeEpisodeId(episode)) return {
		ok: false,
		episode,
		reason: "剧集 id 不合法",
		phrases: []
	};
	if (isFileEpisodeId(episode)) return {
		ok: true,
		episode,
		reason: null,
		phrases: [...notesFor(state, episode)]
	};
	const path = notesPath(root, episode);
	if (!staysInside(root, path)) return {
		ok: false,
		episode,
		reason: "笔记路径跑到素材目录外面了",
		phrases: []
	};
	if (!existsSync(path)) return {
		ok: true,
		episode,
		reason: null,
		phrases: []
	};
	try {
		const { phrases } = parseNotes(readFileSync(path, "utf8"));
		const first = segmentIdsOf(dirname(path))[0];
		return {
			ok: true,
			episode,
			reason: null,
			phrases: [...withSegmentDefault(phrases, first)]
		};
	} catch (error) {
		return {
			ok: false,
			episode,
			reason: `读不了笔记：${String(error)}`,
			phrases: []
		};
	}
}
/**
* Replace an episode's notes.
*
* The sanity ceiling is enforced here, not only in the panel: the panel is a client
* and clients get bypassed, and a notes file is read back by the agent in full. Refusing
* is explicit — the caller gets `ok: false` and the reason, never a silently
* truncated list.
*
* The state comes back with the payload so the caller can persist it; a folder
* episode returns the state it was given, untouched.
*/
function writeNotes(root, episode, input, state = EMPTY_STATE) {
	if (!isSafeEpisodeId(episode)) return {
		payload: {
			ok: false,
			episode,
			reason: "剧集 id 不合法",
			phrases: []
		},
		state
	};
	const phrases = sanitizePhrases(input);
	if (phrases.length > 500) return {
		payload: {
			ok: false,
			episode,
			reason: `一集的笔记最多 500 条，收到 ${phrases.length} 条`,
			phrases: []
		},
		state
	};
	if (isFileEpisodeId(episode)) return {
		payload: {
			ok: true,
			episode,
			reason: null,
			phrases
		},
		state: withNotes(state, episode, phrases)
	};
	const path = notesPath(root, episode);
	if (!staysInside(root, path)) return {
		payload: {
			ok: false,
			episode,
			reason: "笔记路径跑到素材目录外面了",
			phrases: []
		},
		state
	};
	try {
		const preamble = existsSync(path) ? parseNotes(readFileSync(path, "utf8")).preamble : defaultPreamble(episode);
		const order = segmentIdsOf(dirname(path));
		writeFileSync(path, serializeNotes(preamble.length > 0 ? preamble : defaultPreamble(episode), phrases, order), "utf8");
	} catch (error) {
		return {
			payload: {
				ok: false,
				episode,
				reason: `写不了笔记：${String(error)}`,
				phrases: []
			},
			state
		};
	}
	return {
		payload: {
			ok: true,
			episode,
			reason: null,
			phrases
		},
		state
	};
}
//#endregion
//#region src/host/open.ts
/**
* Turning "the reader picked this" into an episode the page can play.
*
* Two shapes arrive here and they end in the same place. A **folder episode** is
* named by an id the scan already knows; a **file episode** is named by a place and
* a path, and from that moment on by the id derived from the audio file's canonical
* path — because the page stores one id, and every later request has to be able to
* turn it back into bytes.
*
* The subtitles are paired when the episode is described rather than stored once and
* trusted: the reader adds a translation the day after picking the audio, and the
* answer to "what subtitles does this have" should change with the directory, not
* with the memory of the last time it was opened. What *is* stored is the mapping
* from id to path, plus the file names as they were at open time — enough for the
* media route to answer a range request without re-reading a directory per seek.
*
* A folder episode may be made of segments (one scene per audio file). The request names
* the one to open, and the answer says which it opened; the host does not guess which to
* continue, because the reader's position is the page's knowledge, so an omitted segment
* is simply the first.
*
* Nothing here throws at the caller. A missing file, a directory with no audio and a
* place that no longer exists are all answers, because the picker is a browsing UI
* and every one of those is a state the reader can browse their way out of.
*/
/** One refusal: no episode, no media, and the reason to show instead. */
function refuse(state, reason) {
	return {
		payload: {
			ok: false,
			reason,
			episode: null,
			media: null,
			segment: null,
			warnings: []
		},
		state
	};
}
/** Whether a file name is audio this plugin plays. */
function isAudioFile(name) {
	return AUDIO_EXTENSIONS.includes(name.slice(name.lastIndexOf(".") + 1).toLowerCase());
}
/** The URL one file of a folder episode is served from. */
function folderUrl(episode, file) {
	return `${MEDIA_PATH}/${encodeURIComponent(episode)}/${encodeURIComponent(file)}`;
}
/** The URL one file of a file episode is served from. */
function fileUrl(id, file) {
	return `${FILE_MEDIA_PATH}/${encodeURIComponent(id)}/${encodeURIComponent(file)}`;
}
/** The media URLs of a folder episode or one of its segments, from the names the scan found. */
function folderMedia(episode, track) {
	return {
		audioUrl: track.audio === null ? "" : folderUrl(episode, track.audio),
		subtitleEnUrl: track.subtitleEn === null ? null : folderUrl(episode, track.subtitleEn),
		subtitleZhUrl: track.subtitleZh === null ? null : folderUrl(episode, track.subtitleZh)
	};
}
/**
* Describe one audio file and prepare the record that will outlive the request.
* @param options - the canonical audio path, and where it was picked from.
* @returns the entry, its media URLs and its record, or the reason it cannot be one.
*/
function describePicked(options) {
	const description = describeAudioFile(options.path);
	if (description === null) return { reason: "读不了这个目录" };
	return {
		entry: audioEntry(description, options.state),
		media: {
			audioUrl: fileUrl(description.id, description.audio),
			subtitleEnUrl: description.subtitleEn === null ? null : fileUrl(description.id, description.subtitleEn),
			subtitleZhUrl: description.subtitleZh === null ? null : fileUrl(description.id, description.subtitleZh)
		},
		record: {
			id: description.id,
			path: description.path,
			title: description.title,
			place: options.place,
			rel: options.rel,
			audio: description.audio,
			subtitleEn: description.subtitleEn,
			subtitleZh: description.subtitleZh,
			openedAt: options.openedAt
		}
	};
}
/** The warnings an opened episode carries: things true but not fatal. */
function warningsOf(track) {
	return track.subtitleEn === null && track.subtitleZh === null ? ["no-subtitle"] : [];
}
/**
* The success payload for one episode.
* @param segment - the segment that was opened, when the episode has segments.
*/
function accept(entry, media, state, segment = null) {
	return {
		payload: {
			ok: true,
			reason: null,
			episode: entry,
			media,
			segment: segment === null ? null : segment.id,
			warnings: warningsOf(segment ?? entry)
		},
		state
	};
}
/**
* Where a remembered file episode lives now.
*
* The record can be gone while the audio is still there — a fresh profile, a state
* field somebody cleared, a note written by hand — so before giving up, an id that
* matches a loose file in the library root is answered from the listing. That is
* also how a `files` row in the panel opens: the panel only ever has the id.
*/
function locateFileEpisode(id, deps) {
	const record = findFileEpisode(deps.state, id);
	if (record !== null) return {
		path: record.path,
		place: record.place,
		rel: record.rel
	};
	const loose = scanLibrary(deps.libraryRoot, deps.state).files.find((candidate) => candidate.id === id);
	if (loose === void 0) return null;
	return {
		path: realPathOf(loose.source),
		place: "lib",
		rel: loose.audio ?? basename(loose.source)
	};
}
/**
* Open a folder episode the scan knows, and one of its segments when it has any.
*
* Naming a segment that is not there is a refusal with the reason, not a quiet fallback to
* the first one: the page asked for a particular scene, and playing another under its name
* would put the reader's position and notes against the wrong audio.
*/
function openFolder(id, segment, deps) {
	const listing = scanLibrary(deps.libraryRoot, deps.state);
	if (!listing.ok) return refuse(deps.state, listing.reason ?? "媒体目录读不了");
	const entry = listing.episodes.find((candidate) => candidate.id === id);
	if (entry === void 0) return refuse(deps.state, "找不到这一集");
	if (entry.audio === null) return refuse(deps.state, "这一集没有音频文件");
	let chosen = null;
	if (entry.segments.length > 0) {
		chosen = segment === void 0 ? entry.segments[0] ?? null : entry.segments.find((item) => item.id === segment) ?? null;
		if (chosen === null) return refuse(deps.state, `这一集没有叫「${segment ?? ""}」的一段`);
	} else if (segment !== void 0) return refuse(deps.state, "这一集没有分段");
	const ref = {
		id: entry.id,
		title: entry.title,
		kind: "folder",
		source: entry.source
	};
	return accept(entry, folderMedia(entry.id, chosen ?? entry), withCurrent(deps.state, ref), chosen);
}
/** Open a file episode by its id, whether or not this plugin still has a record. */
function openRememberedFile(id, deps) {
	const located = locateFileEpisode(id, deps);
	if (located === null) return refuse(deps.state, "找不到这一集");
	if (!existsSync(located.path)) return refuse(deps.state, "这一集的音频文件已经不在了");
	const described = describePicked({
		...located,
		openedAt: Date.now(),
		state: deps.state
	});
	if ("reason" in described) return refuse(deps.state, described.reason);
	return accept(described.entry, described.media, withOpenedFile(deps.state, described.record));
}
/** Open one audio file named by a place and a relative path. */
function openPicked(request, deps) {
	const place = findPlace(deps.places, request.place ?? "");
	if (place === null) return refuse(deps.state, "找不到这个位置");
	const resolved = resolveInPlace(place, request.rel ?? "");
	if (!resolved.ok) return refuse(deps.state, resolved.reason);
	let path = resolved.abs;
	let rel = resolved.rel;
	try {
		if (statSync(path).isDirectory()) {
			const audio = pickAudioFile(readdirSync(path).filter((name) => !name.startsWith(".")));
			if (audio === null) return refuse(deps.state, "没有音频的文件夹");
			path = realPathOf(join(path, audio));
			rel = rel.length === 0 ? audio : `${rel}/${audio}`;
		} else if (!isAudioFile(path)) return refuse(deps.state, "这不是音频文件");
	} catch {
		return refuse(deps.state, "找不到这个文件");
	}
	if (!existsSync(path)) return refuse(deps.state, "找不到这个文件");
	const described = describePicked({
		path,
		place: place.id,
		rel,
		openedAt: Date.now(),
		state: deps.state
	});
	if ("reason" in described) return refuse(deps.state, described.reason);
	return accept(described.entry, described.media, withOpenedFile(deps.state, described.record));
}
/**
* Resolve `/file-media/<id>/<name>` into a file this episode may serve.
*
* The name is checked against the record first — the audio and the two subtitle
* files it was opened with — and then against the directory, for the case the
* record cannot know about: a translation added after the episode was opened. What
* is never allowed is a name that is not the audio's own stem, which is what keeps
* this route from serving the rest of the reader's disk through an id they happen
* to hold.
* @param state - the plugin state, which owns the id-to-path mapping.
* @param requestPath - the path after `/lingualab/file-media`.
* @returns the absolute path to send, or `null` to refuse.
*/
function resolveFileMedia(state, requestPath) {
	let decoded;
	try {
		decoded = decodeURIComponent(requestPath);
	} catch {
		return null;
	}
	if (decoded.includes("\0")) return null;
	const segments = decoded.split("/").filter((segment) => segment.length > 0 && segment !== ".");
	if (segments.length !== 2) return null;
	const [id, name] = segments;
	if (id === void 0 || name === void 0 || id === ".." || name === "..") return null;
	if (name.includes("/") || name.includes("\\")) return null;
	const record = findFileEpisode(state, id);
	if (record === null) return null;
	const directory = dirname(record.path);
	if (record.audio === name || record.subtitleEn === name || record.subtitleZh === name) return join(directory, name);
	if (!sameStem(name, stemOf(record.audio))) return null;
	if (contentTypeOf(name) === null) return null;
	const candidate = join(directory, name);
	try {
		if (!statSync(candidate).isFile()) return null;
	} catch {
		return null;
	}
	return isInside(directory, candidate) ? candidate : null;
}
/**
* Open the episode one request names.
*
* The request carries either an episode id or a place and a relative path, never
* both; the caller has already checked that, and this function treats a missing
* target as a refusal rather than a mistake.
* @param request - the parsed request body.
* @param deps - the library root, the browsable places, and the remembered state.
* @returns the payload, and the state after the open.
*/
function openEpisode(request, deps) {
	const id = request.episodeId;
	const segment = typeof request.segment === "string" && request.segment.length > 0 ? request.segment : void 0;
	if (typeof id === "string" && id.length > 0) {
		if (!isFileEpisodeId(id)) return openFolder(id, segment, deps);
		if (segment !== void 0) return refuse(deps.state, "一个音频文件没有分段");
		return openRememberedFile(id, deps);
	}
	if (typeof request.place === "string" && typeof request.rel === "string") {
		if (segment !== void 0) return refuse(deps.state, "segment 只能和 episodeId 一起给");
		return openPicked(request, deps);
	}
	return refuse(deps.state, "episodeId 和 place/rel 必须给一个");
}
//#endregion
//#region src/shared/progress.ts
/**
* The most positions remembered; the oldest bookmarks fall off first.
*
* One bookmark is kept per episode, and per segment for an episode that has them, so one
* TV episode cut into ten scenes takes ten entries where it used to take one.
*/
const MAX_PROGRESS_ENTRIES = 1e3;
/**
* The longest key kept; a longer one is not a key this plugin made.
*
* A segment key is an episode folder name, `::`, and a segment stem, and each of the two
* can be a whole file name (255 characters on the filesystems this runs on).
*/
const MAX_ID_LENGTH = 520;
/** The most steps one episode may carry; the method has five. */
const MAX_STEPS_PER_EPISODE = 12;
/** A clock a day ahead is a wrong clock; its entries are clamped so they cannot outrank every real one. */
const FUTURE_SLACK_MS = 864e5;
/** The empty table, for a library nobody has listened to yet. */
const EMPTY_PROGRESS = {
	progress: {},
	steps: {}
};
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isCount(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function isKey(value) {
	return value.length > 0 && value.length <= MAX_ID_LENGTH;
}
/** A timestamp made safe: finite, not negative, and not from the far future. */
function stamp(value, now) {
	if (!isCount(value)) return null;
	return Math.min(value, now + FUTURE_SLACK_MS);
}
/** Read one position, or `null` when it is not one. */
function sanitizeProgressEntry(value, now = Date.now()) {
	if (!isRecord(value)) return null;
	const updatedAt = stamp(value.updatedAt, now);
	if (!isCount(value.at) || !isCount(value.duration) || updatedAt === null) return null;
	return {
		at: value.at,
		duration: value.duration,
		updatedAt
	};
}
/** Read one episode's step ticks, or `null` when they are not that. */
function sanitizeEpisodeSteps(value, now = Date.now()) {
	if (!isRecord(value) || !isRecord(value.records)) return null;
	const updatedAt = stamp(value.updatedAt, now);
	if (updatedAt === null) return null;
	const records = /* @__PURE__ */ new Map();
	for (const [step, raw] of Object.entries(value.records)) {
		if (records.size >= MAX_STEPS_PER_EPISODE) break;
		if (step.length === 0 || step.length > 40 || !isRecord(raw)) continue;
		records.set(step, {
			done: raw.done === true,
			seconds: isCount(raw.seconds) ? Math.min(raw.seconds, 1e7) : 0
		});
	}
	return {
		updatedAt,
		records: Object.fromEntries(records)
	};
}
function newestFirst(table, limit) {
	return Object.fromEntries([...table].sort((left, right) => right[1].updatedAt - left[1].updatedAt).slice(0, limit));
}
/** Read a table of positions, dropping every entry that is not one. */
function sanitizeProgressTable(input, now = Date.now()) {
	const table = /* @__PURE__ */ new Map();
	if (isRecord(input)) for (const [id, value] of Object.entries(input)) {
		const entry = isKey(id) ? sanitizeProgressEntry(value, now) : null;
		if (entry !== null) table.set(id, entry);
	}
	return newestFirst(table, MAX_PROGRESS_ENTRIES);
}
/** Read a table of step ticks, dropping every entry that is not one. */
function sanitizeStepsTable(input, now = Date.now()) {
	const table = /* @__PURE__ */ new Map();
	if (isRecord(input)) for (const [id, value] of Object.entries(input)) {
		const entry = isKey(id) ? sanitizeEpisodeSteps(value, now) : null;
		if (entry !== null) table.set(id, entry);
	}
	return newestFirst(table, 200);
}
/** Read a whole table, whichever half is missing or malformed. */
function sanitizeProgress(input, now = Date.now()) {
	if (!isRecord(input)) return EMPTY_PROGRESS;
	return {
		progress: sanitizeProgressTable(input.progress, now),
		steps: sanitizeStepsTable(input.steps, now)
	};
}
/** Merge two tables key by key, the newer `updatedAt` winning; a tie keeps `base`. */
function mergeNewest(base, other, limit) {
	const merged = new Map(Object.entries(base));
	for (const [id, entry] of Object.entries(other)) {
		const existing = merged.get(id);
		if (existing === void 0 || entry.updatedAt > existing.updatedAt) merged.set(id, entry);
	}
	return newestFirst(merged, limit);
}
/** Merge two whole tables. `base` wins ties, so merging a copy with itself changes nothing. */
function mergeProgress(base, other) {
	return {
		progress: mergeNewest(base.progress, other.progress, MAX_PROGRESS_ENTRIES),
		steps: mergeNewest(base.steps, other.steps, 200)
	};
}
/** Whether `mine` has an entry the other side lacks or holds an older version of. */
function hasNewer(mine, theirs) {
	for (const [id, entry] of Object.entries(mine.progress)) {
		const other = theirs.progress[id];
		if (other === void 0 || entry.updatedAt > other.updatedAt) return true;
	}
	for (const [id, entry] of Object.entries(mine.steps)) {
		const other = theirs.steps[id];
		if (other === void 0 || entry.updatedAt > other.updatedAt) return true;
	}
	return false;
}
/** Whether two tables hold the same entries, whatever the key order. */
function sameProgress(left, right) {
	return !hasNewer(left, right) && !hasNewer(right, left);
}
//#endregion
//#region src/host/progress.ts
/**
* The host's copy of the reader's progress: where each episode was left, and which of the
* five steps are ticked.
*
* Notes already live on the host, in the library folder, so they follow the reader anywhere
* the folder goes. Positions and ticks used to live only in one browser's `localStorage`,
* which meant a second device, a private window or a cleared cache started from nothing.
* This is the shared copy, and it sits where the notes sit: one hidden JSON file at the
* library root. Two consequences are the point of putting it there:
*
*   · every browser that opens this plugin sees the same progress, because they all ask the
*     same host;
*   · a library folder that is itself synced (a cloud drive, a git checkout, rsync) carries
*     the progress to another machine together with the audio and `notes.md`.
*
* The file name starts with a dot, so the library scan and the picker both skip it.
*
* Writes go through a temporary file and a rename, so a crash mid-write leaves the old file
* rather than half of a new one. The merge rule (newest `updatedAt` per key wins) lives in
* `src/shared/progress.ts` because the browser applies the same rule to its cache.
*/
/** Where the library's progress file is. */
function progressPath(root) {
	return join(root, PROGRESS_FILE);
}
/** Whether the library root is a folder this plugin can keep a file in. */
function rootUsable(root) {
	if (root.trim().length === 0) return false;
	try {
		return existsSync(root) && statSync(root).isDirectory();
	} catch {
		return false;
	}
}
/**
* Read the library's progress. A missing file is an empty table; an unreadable or corrupt
* one is too, because a bookmark file must never take the page down. Only a missing library
* is reported as a problem.
*/
function readProgressFile(root, now = Date.now()) {
	if (!rootUsable(root)) return {
		ok: false,
		reason: "媒体目录还没配置或不存在，进度只能先存在浏览器里",
		table: EMPTY_PROGRESS
	};
	const path = progressPath(root);
	if (!existsSync(path)) return {
		ok: true,
		reason: null,
		table: EMPTY_PROGRESS
	};
	try {
		return {
			ok: true,
			reason: null,
			table: sanitizeProgress(JSON.parse(readFileSync(path, "utf8")), now)
		};
	} catch {
		return {
			ok: true,
			reason: null,
			table: EMPTY_PROGRESS
		};
	}
}
/** Write the table out with a fixed field order, so a diff of the file stays readable. */
function serializeProgress(table) {
	return `${JSON.stringify({
		version: 1,
		progress: table.progress,
		steps: table.steps
	}, null, 1)}\n`;
}
/** Replace the file through a temporary sibling, leaving the old one if anything fails. */
function writeAtomically$1(path, text) {
	const temporary = `${path}.${String(process.pid)}.tmp`;
	try {
		writeFileSync(temporary, text, "utf8");
		renameSync(temporary, path);
	} catch (error) {
		rmSync(temporary, { force: true });
		throw error;
	}
}
/**
* Fold one browser's entries into the library's file.
*
* The incoming body is cleaned by the same rules as stored data, so a hand-written request
* cannot put anything on disk that a later read would refuse. The file is only rewritten
* when something in the body was actually newer.
* @param root - the library root.
* @param body - the parsed request body, trusted for nothing.
* @returns the merged table and whether it could be kept on disk.
*/
function writeProgressFile(root, body, now = Date.now()) {
	const current = readProgressFile(root, now);
	if (!current.ok) return current;
	const merged = mergeProgress(current.table, sanitizeProgress(body, now));
	if (sameProgress(merged, current.table)) return {
		ok: true,
		reason: null,
		table: current.table
	};
	try {
		writeAtomically$1(progressPath(root), serializeProgress(merged));
	} catch (error) {
		return {
			ok: false,
			reason: `进度没写进媒体目录：${String(error)}`,
			table: merged
		};
	}
	return {
		ok: true,
		reason: null,
		table: merged
	};
}
//#endregion
//#region src/host/review.ts
/**
* The review list across the library: every kept sentence not yet graded 「记住了」.
*
* One read, so the home can say how much there is to review (and the review can start) without
* a request per episode. It walks the library as the scan lists it, folders first and then the
* loose files at the root, and reads each episode's phrases through {@link readNotes}, the same
* reader and the same safety checks as `GET /lingualab/notes`; a folder episode whose summary
* says it has no notes is not opened at all. Nothing here writes: a grade given during review
* is saved by the episode that is open, through the notes route, like any other edit.
*
* An episode opened from outside the library (through 「浏览已有文件」) is not in the scan, so it
* is not in this list either: the review spans the library, which is what the home shows.
*/
/** One episode's sentences still to review, or `null` when it has none or cannot be read. */
function reviewEpisode(root, entry, state) {
	if (entry.notes.count === 0) return null;
	const read = readNotes(root, entry.id, state);
	if (!read.ok) return null;
	const segments = entry.segments.map((segment) => segment.id);
	const phrases = inPlayOrder(read.phrases.filter((phrase) => !phrase.done), segments);
	if (phrases.length === 0) return null;
	return {
		episode: entry.id,
		title: entry.title,
		kind: entry.kind,
		segments,
		phrases
	};
}
/** Everything to review, in library order. */
function readReview(root, state = EMPTY_STATE) {
	const library = scanLibrary(root, state);
	if (!library.ok) return {
		ok: false,
		reason: library.reason,
		episodes: [],
		total: 0
	};
	const episodes = [...library.episodes, ...library.files].map((entry) => reviewEpisode(root, entry, state)).filter((entry) => entry !== null);
	return {
		ok: true,
		reason: null,
		episodes,
		total: episodes.reduce((sum, entry) => sum + entry.phrases.length, 0)
	};
}
//#endregion
//#region src/host/timing.ts
/**
* Moving a cue's start and end inside a subtitle file, and nothing else.
*
* The page loops one sentence at a time, so a cue whose edges are a beat off clips a word on
* every pass. The reader fixes it on the page, and the fix is written into the file itself, so
* other players and the agent read the corrected timing too and there is no second source of
* timing to reconcile.
*
* **Only the timecode changes.** The file is never parsed and written out again: the parser
* drops numbering, style tags and blocks it cannot read, and sorts the cues, so a round trip
* would rewrite far more than one sentence. Instead the cue's timecode is found in the text and
* the two times are replaced in place, in the format the line already used (`,` or `.` before
* the milliseconds, the width of the hours, two or three fraction digits in LRC).
*
* **Encodings survive because the timecode is ASCII.** UTF-8, GBK and GB18030 all write ASCII
* as the same single bytes, and none of their multi-byte sequences can spell a timecode, so the
* file is read as Latin-1 (one character per byte, and back again without loss) and the
* surrounding bytes are never decoded at all. Node has no GBK encoder, so this is also the only
* way a GBK file could come back as GBK. UTF-16 files, which start with a byte-order mark, are
* decoded and encoded again through Node's own UTF-16 support.
*
* **A neighbour can move with it.** When the reader pulls a start earlier than the previous cue's
* end (or an end later than the next cue's start), the page sends that neighbour's new edge too,
* so one request may carry several cues of one file. They are all looked for in the text as it
* was read and replaced in one pass, so moving one never changes how another is found.
*
* **A stale page is refused.** The request carries a hash of the bytes the page parsed and the
* cue's range as it read it. When either no longer matches, nothing is written and the answer
* says so, so an edit made elsewhere in the meantime is never overwritten blind. Every edit of a
* request is checked before any file is written, so a sentence whose Chinese lives in a second
* file never ends up moved in one file and not in the other.
*
* Before the first write to a file its original is copied beside it as `<name>.bak`, once; that
* copy is never overwritten, so the file as it arrived can always be had back.
*/
/** The most edits one request may carry: a cue and both neighbours, in an English file and a Chinese one. */
const MAX_EDITS = 6;
/** Subtitle formats this module can edit, by extension. */
const EDITABLE = /* @__PURE__ */ new Set([
	"srt",
	"vtt",
	"lrc"
]);
/** SRT and VTT timecode pairs. The same shape the page's parser accepts, so both find the same cues. */
const RANGE_LINE = /(\d{1,2}):(\d{2}):(\d{2})([.,])(\d{3})(\s*-->\s*)(\d{1,2}):(\d{2}):(\d{2})([.,])(\d{3})/g;
/** The first LRC time tag on a line, as the page's parser reads it: one per line, anywhere in it. */
const LRC_TAG = /\[(\d+):(\d{2})([.:])(\d{2,3})\]/;
/** The hex SHA-256 of some bytes; the page computes the same over what it fetched. */
function sha256Hex(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}
/** Write `ms` in the shape of an SRT/VTT time whose hours were `hourWidth` digits wide. */
function formatRangeTime(ms, hourWidth, separator) {
	const hours = Math.floor(ms / 36e5);
	const minutes = Math.floor(ms % 36e5 / 6e4);
	const seconds = Math.floor(ms % 6e4 / 1e3);
	const millis = ms % 1e3;
	return `${String(hours).padStart(hourWidth, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${separator}${String(millis).padStart(3, "0")}`;
}
/** Write `ms` as an LRC tag body, keeping the minute width, the separator and the fraction digits. */
function formatLrcTime(ms, minuteWidth, separator, fractionDigits) {
	const minutes = Math.floor(ms / 6e4);
	const seconds = Math.floor(ms % 6e4 / 1e3);
	const fraction = fractionDigits === 2 ? Math.floor(ms % 1e3 / 10) : ms % 1e3;
	return `${String(minutes).padStart(minuteWidth, "0")}:${String(seconds).padStart(2, "0")}${separator}${String(fraction).padStart(fractionDigits, "0")}`;
}
/** Milliseconds of `h:mm:ss.mmm`, from the captured parts. */
function rangeMs(hours, minutes, seconds, millis) {
	return Number(hours) * 36e5 + Number(minutes) * 6e4 + Number(seconds) * 1e3 + Number(millis);
}
/** Milliseconds of an LRC tag; two fraction digits are centiseconds. */
function lrcMs(minutes, seconds, fraction) {
	const part = fraction.length === 2 ? Number(fraction) * 10 : Number(fraction);
	return Number(minutes) * 6e4 + Number(seconds) * 1e3 + part;
}
/** The key of a range, the same for two cues with exactly the same times. */
function rangeKey(start, end) {
	return `${String(start)}-${String(end)}`;
}
/**
* Replace some cues' times in a subtitle text, in one pass over it.
*
* Every cue is looked for as the text was read, so an edit that moves one cue onto another's old
* range never changes which cue the other edit finds.
* @param text - the whole file as one string (Latin-1 or decoded UTF-16).
* @param format - `srt`, `vtt` or `lrc`.
* @param edits - which cues, and where each goes.
* @returns the new text, or why a cue could not be found.
*/
function retimeText(text, format, edits) {
	const seen = /* @__PURE__ */ new Map();
	const found = /* @__PURE__ */ new Set();
	/** Count one more cue at this range, and return the edit meant for it, if any. */
	const claim = (start, end) => {
		const key = rangeKey(start, end);
		const occurrence = seen.get(key) ?? 0;
		seen.set(key, occurrence + 1);
		const edit = edits.find((each) => each.from.start === start && each.from.end === end && each.from.occurrence === occurrence);
		if (edit !== void 0) found.add(edit);
		return edit;
	};
	let next;
	if (format === "lrc") next = text.split("\n").map((line) => {
		const match = LRC_TAG.exec(line);
		if (match === null) return line;
		const [tag, minutes = "", seconds = "", separator = "", fraction = ""] = match;
		const at = lrcMs(minutes, seconds, fraction);
		const edit = claim(at, at);
		if (edit === void 0) return line;
		const replaced = `[${formatLrcTime(edit.to.start, minutes.length, separator, fraction.length)}]`;
		return `${line.slice(0, match.index)}${replaced}${line.slice(match.index + tag.length)}`;
	}).join("\n");
	else next = text.replace(RANGE_LINE, (whole, h1, m1, s1, sep1, ms1, arrow, h2, m2, s2, sep2, ms2) => {
		const edit = claim(rangeMs(h1, m1, s1, ms1), rangeMs(h2, m2, s2, ms2));
		if (edit === void 0) return whole;
		return `${formatRangeTime(edit.to.start, h1.length, sep1)}${arrow}${formatRangeTime(edit.to.end, h2.length, sep2)}`;
	});
	return found.size === edits.length ? {
		ok: true,
		text: next
	} : {
		ok: false,
		reason: "文件里找不到这一句的时间"
	};
}
/**
* Apply one file's edits to its bytes, keeping every byte that is not a timecode.
* @param bytes - the file as it is on disk.
* @param format - `srt`, `vtt` or `lrc`.
* @param edits - the edits of this one file, each of whose `expect` is checked against `bytes`.
*/
function retimeBytes(bytes, format, edits) {
	const file = edits[0]?.file ?? "";
	const hash = sha256Hex(bytes);
	if (edits.some((edit) => edit.expect !== hash)) return {
		ok: false,
		code: "stale",
		reason: `「${file}」在页面读过之后改过了，重新加载字幕再调`
	};
	if (!(bytes.length >= 2 && (bytes[0] === 255 && bytes[1] === 254 || bytes[0] === 254 && bytes[1] === 255))) {
		const result = retimeText(bytes.toString("latin1"), format, edits);
		return result.ok ? {
			ok: true,
			bytes: Buffer.from(result.text, "latin1")
		} : {
			ok: false,
			code: "stale",
			reason: `「${file}」${result.reason}`
		};
	}
	const bigEndian = bytes[0] === 254;
	const body = Buffer.from(bytes.subarray(2));
	if (bigEndian) body.swap16();
	const result = retimeText(body.toString("utf16le"), format, edits);
	if (!result.ok) return {
		ok: false,
		code: "stale",
		reason: `「${file}」${result.reason}`
	};
	const encoded = Buffer.from(result.text, "utf16le");
	if (bigEndian) encoded.swap16();
	return {
		ok: true,
		bytes: Buffer.concat([bytes.subarray(0, 2), encoded])
	};
}
/** Why an edit's numbers cannot be used, or `null` when they can. */
function rangeProblem(edit, format) {
	const whole = (value) => typeof value === "number" && Number.isInteger(value) && value >= 0;
	const { from, to } = edit;
	if (!whole(from.start) || !whole(from.end) || !whole(from.occurrence) || !whole(to.start) || !whole(to.end)) return "时间要是非负的整数毫秒";
	if (format !== "lrc" && to.end - to.start < 200) return `结尾至少要比开头晚 ${String(200)} 毫秒`;
	if (to.end >= 36e7 || to.start >= 36e7) return "时间超出了字幕能写的范围";
	return null;
}
/** Narrow the request body to edits, or say what is wrong with it. */
function readEdits(body) {
	if (typeof body !== "object" || body === null) return "请求体不是对象";
	const { episode, edits } = body;
	if (typeof episode !== "string" || episode.length === 0) return "缺 episode";
	if (!Array.isArray(edits) || edits.length === 0 || edits.length > MAX_EDITS) return `edits 要有 1 到 ${String(MAX_EDITS)} 项`;
	const parsed = [];
	for (const item of edits) {
		if (typeof item !== "object" || item === null) return "edits 里有一项不是对象";
		const { file, from, to, expect } = item;
		if (typeof file !== "string" || typeof expect !== "string" || typeof from !== "object" || from === null || typeof to !== "object" || to === null) return "edits 里有一项缺 file、from、to 或 expect";
		parsed.push({
			file,
			from,
			to,
			expect: expect.toLowerCase()
		});
	}
	const cues = parsed.map((edit) => [
		edit.file,
		rangeKey(edit.from.start, edit.from.end),
		String(edit.from.occurrence)
	].join("\0"));
	if (new Set(cues).size !== cues.length) return "同一句只能改一次";
	return {
		episode,
		edits: parsed
	};
}
/**
* Where one subtitle file of one episode is, when it may be written.
*
* A folder episode's files are under the library root by construction. A file episode is one
* the reader picked; it may be written only when it sits inside the library too (a loose file at
* the root), never in a workspace somewhere else on the disk.
*/
function resolveSubtitle(root, state, episode, file) {
	const refuse = (status, reason) => ({
		ok: false,
		status,
		reason
	});
	if (file.length === 0 || file.includes("/") || file.includes("\\") || file.includes("\0") || file === "..") return refuse(400, "文件名不对");
	if (!EDITABLE.has(extname(file).slice(1).toLowerCase())) return refuse(400, "只能改 SRT、VTT 和 LRC 字幕");
	let target;
	if (isFileEpisodeId(episode)) target = resolveFileMedia(state, `/${encodeURIComponent(episode)}/${encodeURIComponent(file)}`);
	else target = isSafeEpisodeId(episode) ? join(root, episode, file) : null;
	try {
		if (target === null || !statSync(target).isFile()) return refuse(404, "找不到这个字幕文件");
	} catch {
		return refuse(404, "找不到这个字幕文件");
	}
	if (root.trim().length === 0 || !isInside(root, target)) return refuse(403, "这个字幕不在媒体库里，页面不改媒体库以外的文件");
	return {
		ok: true,
		path: target
	};
}
/** Replace a file through a temporary sibling, so a failed write leaves the old one whole. */
function writeAtomically(path, bytes) {
	const temporary = `${path}.${String(process.pid)}.tmp`;
	try {
		writeFileSync(temporary, bytes);
		renameSync(temporary, path);
	} catch (error) {
		rmSync(temporary, { force: true });
		throw error;
	}
}
/** A refusal or a stale answer, with nothing written. */
function answer(status, code, reason) {
	return {
		status,
		payload: {
			ok: false,
			code,
			reason,
			files: []
		}
	};
}
/**
* Carry out one `POST /lingualab/subtitle-timing`.
* @param root - the library root.
* @param state - the plugin state, which maps file episode ids to paths.
* @param body - the parsed request body, trusted for nothing.
*/
function writeTiming(root, state, body) {
	const request = readEdits(body);
	if (typeof request === "string") return answer(400, "refused", request);
	const byFile = /* @__PURE__ */ new Map();
	for (const edit of request.edits) byFile.set(edit.file, [...byFile.get(edit.file) ?? [], edit]);
	const planned = [];
	for (const [file, edits] of byFile) {
		const format = extname(file).slice(1).toLowerCase();
		for (const edit of edits) {
			const problem = rangeProblem(edit, format);
			if (problem !== null) return answer(400, "refused", problem);
		}
		const resolved = resolveSubtitle(root, state, request.episode, file);
		if (!resolved.ok) return answer(resolved.status, "refused", resolved.reason);
		const path = resolved.path;
		let bytes;
		try {
			bytes = readFileSync(path);
		} catch (error) {
			return answer(500, "refused", `读不了「${file}」：${String(error)}`);
		}
		const outcome = retimeBytes(bytes, format, edits);
		if (!outcome.ok) return answer(outcome.code === "stale" ? 409 : 400, outcome.code, outcome.reason);
		planned.push({
			path,
			bytes: outcome.bytes,
			file
		});
	}
	for (const write of planned) try {
		const backup = `${write.path}.bak`;
		if (!existsSync(backup)) copyFileSync(write.path, backup);
		writeAtomically(write.path, write.bytes);
	} catch (error) {
		return answer(500, "refused", `「${write.file}」没写进去：${String(error)}`);
	}
	return {
		status: 200,
		payload: {
			ok: true,
			code: "saved",
			reason: null,
			files: planned.map((write) => write.file)
		}
	};
}
//#endregion
//#region src/index.ts
/**
* dsh-lingualab — host half.
*
* The panel is a browser page, so the things it cannot do for itself are the
* things this half owns: say where the library is, list what is in it, let the
* reader browse to material that is not in the library yet, receive the files the
* reader drops on the page, hand over the bytes of one episode, and read or write the
* notes.
*
* Everything is read from disk on demand rather than cached at load time. The
* material arrives by hand between sessions or through the import route, so a library
* snapshot taken at boot would be stale exactly when it matters most: right after a
* new episode lands.
*
* Routes live under `/lingualab/`, clear of the module system's `/plugins` prefix
* route, and every one of them is declared in `dsh-plugin.naming.json` — `npm run
* verify` compares the two so a renamed route cannot silently outlive its record.
*
* The one thing this half *does* remember is which episode is open: a file episode
* is identified by a hash of its path, and only the plugin can turn that id back
* into a file. It is persisted in this plugin's own config (`openState`), through
* the settings service, so the profile remains the single home for plugin state.
*/
/** Stable plugin name (the composition row id is `lingualab`). */
const name = "lingualab";
/**
* Without a web carrier there is nowhere to serve the library from, and nowhere
* for the shell to fetch the client bundle either.
*/
const inject = ["webServer"];
const Config = z.object({
	libraryRoot: z.string().default("").volatile(),
	openState: z.string().default("").volatile()
});
/** Where the library sits when the config does not say. */
const DEFAULT_LIBRARY_SUBPATH = "notes/learning/english/media";
/**
* Every workspace this deployment knows, or none.
*
* Read through `ctx.get`, not through the context property: the property proxy is
* topology-sensitive, and touching an undeclared service through it throws — which
* turned every route into an empty `400` whenever the config was unset and the
* workspace guess had to run. Found by opening the panel with no `libraryRoot`.
*/
function workspacesOf(ctx) {
	try {
		return (ctx.get?.("workspaceRegistry"))?.list() ?? [];
	} catch {
		return [];
	}
}
/** The settings service, when this deployment has one. */
function settingsOf(ctx) {
	const service = ctx.get?.("settings");
	return typeof service === "object" && service !== null && "update" in service ? service : null;
}
/** Config first, workspace guess second. */
function resolveRoot(ctx, configured) {
	if (configured.trim().length > 0) return {
		root: configured,
		source: "config"
	};
	const workspace = workspacesOf(ctx)[0]?.path;
	if (workspace === void 0) return {
		root: "",
		source: "none"
	};
	return {
		root: join(workspace, DEFAULT_LIBRARY_SUBPATH),
		source: "workspace"
	};
}
/** Reject every method the route does not implement, so a typo is loud. */
function methodAllowed(req, res, allowed) {
	const method = req.method ?? "GET";
	if (allowed.includes(method)) return true;
	res.writeHead(405, {
		"content-type": "text/plain; charset=utf-8",
		allow: allowed.join(", ")
	});
	res.end("方法不对\n");
	return false;
}
/** One plain-text refusal, for the routes that answer a body of their own shape. */
function refuseText(res, status, text) {
	res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
	res.end(`${text}\n`);
}
/** `GET|POST /lingualab/config` — where the library is, and how to change it. */
function configRoute(ctx, configured) {
	return {
		kind: "exact",
		path: CONFIG_PATH,
		handler: async (req, res) => {
			if (!methodAllowed(req, res, ["GET", "POST"])) return;
			const settings = settingsOf(ctx);
			const workspaces = workspacesOf(ctx);
			if ((req.method ?? "GET") === "GET") {
				const resolved = resolveRoot(ctx, configured());
				sendJson(res, 200, configPayload(describeConfig(resolved.root, configured(), resolved.source, settings !== null), workspaces, resolved.root));
				return;
			}
			let body;
			try {
				body = await readJsonBody(req);
			} catch (error) {
				sendJson(res, 400, {
					ok: false,
					reason: `请求体读不了：${String(error)}`
				});
				return;
			}
			const fields = typeof body === "object" && body !== null ? body : {};
			const typed = typeof fields.libraryRoot === "string";
			const mentionsPlace = fields.place !== void 0 || fields.rel !== void 0;
			if (typed && mentionsPlace) {
				sendJson(res, 400, {
					ok: false,
					reason: "libraryRoot 与 place/rel 只能给一个"
				});
				return;
			}
			if (!typed && mentionsPlace && !(typeof fields.place === "string" && typeof fields.rel === "string")) {
				sendJson(res, 400, {
					ok: false,
					reason: "place 与 rel 要么都给，要么都不给"
				});
				return;
			}
			if (!typed && !mentionsPlace) {
				sendJson(res, 400, {
					ok: false,
					reason: "缺 libraryRoot；或者给 place 与 rel"
				});
				return;
			}
			let proposed;
			if (typeof fields.libraryRoot === "string") proposed = fields.libraryRoot;
			else {
				const place = findPlace(listPlaces(workspaces, resolveRoot(ctx, configured()).root), fields.place ?? "");
				if (place === null) {
					sendJson(res, 400, {
						ok: false,
						reason: "找不到这个位置"
					});
					return;
				}
				const resolved = resolveInPlace(place, fields.rel ?? "");
				if (!resolved.ok) {
					sendJson(res, 400, {
						ok: false,
						reason: resolved.reason
					});
					return;
				}
				proposed = resolved.abs;
			}
			const problem = validateRoot(proposed);
			if (problem !== null) {
				sendJson(res, 400, {
					ok: false,
					reason: problem
				});
				return;
			}
			if (settings === null) {
				sendJson(res, 409, {
					ok: false,
					reason: `这个部署没有 settings 服务，改不了配置。把下面这段写进 profile 的 cordis.patch.yml：
- id: lingualab\n  config:\n    libraryRoot: ${proposed.trim()}`
				});
				return;
			}
			try {
				await settings.update(name, { libraryRoot: proposed.trim() });
			} catch (error) {
				sendJson(res, 500, {
					ok: false,
					reason: `配置没写进去：${String(error)}`
				});
				return;
			}
			const resolved = resolveRoot(ctx, proposed.trim());
			sendJson(res, 200, configPayload(describeConfig(resolved.root, proposed.trim(), resolved.source, true), workspaces, resolved.root));
		}
	};
}
/** `GET /lingualab/places` — the roots the picker may browse, and what is open. */
function placesRoute(ctx, configured, readState) {
	return {
		kind: "exact",
		path: PLACES_PATH,
		handler: (req, res) => {
			if (!methodAllowed(req, res, ["GET"])) return;
			const root = resolveRoot(ctx, configured()).root;
			sendJson(res, 200, placesPayload(workspacesOf(ctx), root, readState().current));
		}
	};
}
/** `GET /lingualab/browse` — one directory under one place. */
function browseRoute(ctx, configured) {
	return {
		kind: "exact",
		path: BROWSE_PATH,
		handler: (req, res) => {
			if (!methodAllowed(req, res, ["GET"])) return;
			const url = new URL(req.url ?? "/lingualab/browse", "http://lingualab.invalid");
			const root = resolveRoot(ctx, configured()).root;
			const place = findPlace(listPlaces(workspacesOf(ctx), root), url.searchParams.get("place") ?? "");
			if (place === null) {
				sendJson(res, 400, refusedBrowse(null, "", "找不到这个位置"));
				return;
			}
			const requested = Number(url.searchParams.get("limit") ?? "");
			sendJson(res, 200, browsePlace({
				place,
				libraryRoot: root,
				rel: url.searchParams.get("rel") ?? "",
				query: url.searchParams.get("q") ?? "",
				limit: Number.isFinite(requested) && url.searchParams.get("limit") !== null ? requested : void 0,
				includeOther: url.searchParams.get("includeOther") === "1"
			}));
		}
	};
}
/** `POST /lingualab/open` — make one folder episode, or one audio file, current. */
function openRoute(ctx, configured, readState, writeState) {
	return {
		kind: "exact",
		path: OPEN_PATH,
		handler: async (req, res) => {
			if (!methodAllowed(req, res, ["POST"])) return;
			let body;
			try {
				body = await readJsonBody(req);
			} catch (error) {
				sendJson(res, 400, emptyOpen(`请求体读不了：${String(error)}`));
				return;
			}
			if (typeof body !== "object" || body === null) {
				sendJson(res, 400, emptyOpen("请求体不是对象"));
				return;
			}
			const request = body;
			if ((typeof request.episodeId === "string" && request.episodeId.length > 0) === (request.place !== void 0 || request.rel !== void 0)) {
				sendJson(res, 400, emptyOpen("episodeId 与 place/rel 只能给一个"));
				return;
			}
			if (request.segment !== void 0 && typeof request.segment !== "string") {
				sendJson(res, 400, emptyOpen("segment 必须是字符串"));
				return;
			}
			const root = resolveRoot(ctx, configured()).root;
			const state = readState();
			const result = openEpisode(request, {
				libraryRoot: root,
				places: listPlaces(workspacesOf(ctx), root),
				state
			});
			if (result.state !== state) await writeState(result.state);
			sendJson(res, result.payload.ok ? 200 : 400, result.payload);
		}
	};
}
/**
* `POST /lingualab/import` — one dropped file into the library.
*
* One of the routes that write into the media folder. Who may call it is decided by
* `guarded` in `register`, which asks the host's own request trust: a loopback `Host`, a
* matching `Origin` and the signed session cookie. That, and not the header below, is the
* access control. The custom header is a second, narrower check that only says "this came
* from the panel's code", and it would not stop a page that rebinds its hostname to
* 127.0.0.1 or another process on the machine. The host also decides everything that
* matters about the file (the folder, the cleaned name, whether it may land) rather than
* believing the page.
*/
function importRoute(ctx, configured) {
	return {
		kind: "exact",
		path: IMPORT_PATH,
		handler: async (req, res) => {
			if (!methodAllowed(req, res, ["POST"])) return;
			if (req.headers["x-lingualab-import"] !== "1") {
				sendJson(res, 403, {
					ok: false,
					code: "refused",
					reason: "缺少导入标记，这个请求不像是从面板发来的",
					episode: null,
					file: null,
					bytes: 0,
					root: null
				});
				return;
			}
			const url = new URL(req.url ?? "/lingualab/import", "http://lingualab.invalid");
			const declared = Number(req.headers["content-length"]);
			const payload = await importFile({
				root: resolveRoot(ctx, configured()).root,
				episode: url.searchParams.get("episode") ?? "",
				file: url.searchParams.get("file") ?? "",
				declaredBytes: Number.isFinite(declared) && req.headers["content-length"] !== void 0 ? declared : null
			}, req);
			sendJson(res, payload.ok ? 200 : payload.retryable === true ? 429 : 400, payload);
		}
	};
}
/** A refusal with no episode attached, for the request-level mistakes. */
function emptyOpen(reason) {
	return {
		ok: false,
		reason,
		episode: null,
		media: null,
		segment: null,
		warnings: []
	};
}
/** `GET /lingualab/library` — describe every episode folder under the root. */
function libraryRoute(ctx, configured, readState) {
	return {
		kind: "exact",
		path: LIBRARY_PATH,
		handler: (req, res) => {
			if (!methodAllowed(req, res, ["GET"])) return;
			sendJson(res, 200, scanLibrary(resolveRoot(ctx, configured()).root, readState()));
		}
	};
}
/** `GET /lingualab/media/<episode>/<file>` — audio and subtitle bytes, with Range. */
function mediaRoute(ctx, configured) {
	return {
		kind: "prefix",
		path: MEDIA_PATH,
		handler: (req, res) => {
			if (!methodAllowed(req, res, ["GET", "HEAD"])) return;
			const requestPath = (req.url ?? "").split("?")[0] ?? "";
			const rest = requestPath.startsWith("/lingualab/media") ? requestPath.slice(16) : "";
			serveMedia(req, res, resolveRoot(ctx, configured()).root, rest);
		}
	};
}
/** `GET|HEAD /lingualab/file-media/<id>/<file>` — one picked file's bytes, with Range. */
function fileMediaRoute(readState) {
	return {
		kind: "prefix",
		path: FILE_MEDIA_PATH,
		handler: (req, res) => {
			if (!methodAllowed(req, res, ["GET", "HEAD"])) return;
			const requestPath = (req.url ?? "").split("?")[0] ?? "";
			const rest = requestPath.startsWith("/lingualab/file-media") ? requestPath.slice(21) : "";
			const target = resolveFileMedia(readState(), rest);
			if (target === null) {
				refuseText(res, 404, "没有这个文件");
				return;
			}
			serveFile(req, res, target);
		}
	};
}
/** `GET` and `POST /lingualab/notes` — the hand-off file between panel and agent. */
function notesRoute(ctx, configured, readState, writeState) {
	return {
		kind: "exact",
		path: NOTES_PATH,
		handler: async (req, res) => {
			if (!methodAllowed(req, res, ["GET", "POST"])) return;
			const root = resolveRoot(ctx, configured()).root;
			const state = readState();
			if ((req.method ?? "GET") === "GET") {
				sendJson(res, 200, readNotes(root, new URL(req.url ?? "/lingualab/notes", "http://lingualab.invalid").searchParams.get("episode") ?? "", state));
				return;
			}
			let body;
			try {
				body = await readJsonBody(req);
			} catch (error) {
				sendJson(res, 400, {
					ok: false,
					episode: "",
					reason: `请求体读不了：${String(error)}`,
					phrases: []
				});
				return;
			}
			if (typeof body !== "object" || body === null) {
				sendJson(res, 400, {
					ok: false,
					episode: "",
					reason: "请求体不是对象",
					phrases: []
				});
				return;
			}
			const request = body;
			if (typeof request.episode !== "string" || !Array.isArray(request.phrases)) {
				sendJson(res, 400, {
					ok: false,
					episode: "",
					reason: "缺 episode 或 phrases",
					phrases: []
				});
				return;
			}
			const result = writeNotes(root, request.episode, request.phrases, state);
			if (result.state !== state) await writeState(result.state);
			sendJson(res, result.payload.ok ? 200 : 400, result.payload);
		}
	};
}
/** `GET /lingualab/review`: every kept sentence not graded 「记住了」, across the library. Read only. */
function reviewRoute(ctx, configured, readState) {
	return {
		kind: "exact",
		path: REVIEW_PATH,
		handler: (req, res) => {
			if (!methodAllowed(req, res, ["GET"])) return;
			sendJson(res, 200, readReview(resolveRoot(ctx, configured()).root, readState()));
		}
	};
}
/**
* `GET` and `POST /lingualab/progress` — positions and step ticks, shared across devices.
*
* A `POST` merges rather than replaces: the body is whatever this browser has, the newest
* entry per episode wins, and the answer is the merged table, so one round trip is both
* "upload mine" and "download everyone's".
*/
function progressRoute(ctx, configured) {
	const answer = (read) => ({
		ok: read.ok,
		reason: read.reason,
		...read.table
	});
	return {
		kind: "exact",
		path: PROGRESS_PATH,
		handler: async (req, res) => {
			if (!methodAllowed(req, res, ["GET", "POST"])) return;
			const root = resolveRoot(ctx, configured()).root;
			if ((req.method ?? "GET") === "GET") {
				sendJson(res, 200, answer(readProgressFile(root)));
				return;
			}
			let body;
			try {
				body = await readJsonBody(req, 524288);
			} catch (error) {
				sendJson(res, 400, {
					ok: false,
					reason: `请求体读不了：${String(error)}`,
					progress: {},
					steps: {}
				});
				return;
			}
			sendJson(res, 200, answer(writeProgressFile(root, body)));
		}
	};
}
/**
* `POST /lingualab/subtitle-timing` — move one sentence's start and end in its subtitle file.
*
* The second route that writes into the media folder, after the import, and admitted the same
* way (`guarded` in `register`). It only ever changes subtitle files inside the library, and only
* their timecodes; `host/timing.ts` holds the rules.
*/
function timingRoute(ctx, configured, readState) {
	return {
		kind: "exact",
		path: SUBTITLE_TIMING_PATH,
		handler: async (req, res) => {
			if (!methodAllowed(req, res, ["POST"])) return;
			let body;
			try {
				body = await readJsonBody(req);
			} catch (error) {
				sendJson(res, 400, {
					ok: false,
					code: "refused",
					reason: `请求体读不了：${String(error)}`,
					files: []
				});
				return;
			}
			const result = writeTiming(resolveRoot(ctx, configured()).root, readState(), body);
			sendJson(res, result.status, result.payload);
		}
	};
}
/** Mount every route. The config is read per request, so edits need no reload. */
function apply(ctx, config) {
	const configured = () => {
		try {
			return config.libraryRoot.get();
		} catch {
			return "";
		}
	};
	/**
	* The state as this process last saw it.
	*
	* The config field is the durable copy, but a plugin cannot assume the box it
	* reads reflects a write made moments ago in the same process — the settings
	* service owns when that lands. So the first read parses the field and every
	* write updates this copy, which is what the next request reads. A hand edit of
	* the profile is picked up at the next restart, which is when a hand edit of a
	* profile is expected to arrive.
	*/
	let live = null;
	const readState = () => {
		if (live !== null) return live;
		let raw = "";
		try {
			raw = config.openState.get();
		} catch {}
		live = parseState(raw);
		return live;
	};
	const writeState = async (next) => {
		live = next;
		const settings = settingsOf(ctx);
		if (settings === null) return;
		try {
			await settings.update(name, { openState: serializeState(next) });
		} catch {}
	};
	const routes = [
		configRoute(ctx, configured),
		placesRoute(ctx, configured, readState),
		browseRoute(ctx, configured),
		openRoute(ctx, configured, readState, writeState),
		importRoute(ctx, configured),
		libraryRoute(ctx, configured, readState),
		mediaRoute(ctx, configured),
		fileMediaRoute(readState),
		notesRoute(ctx, configured, readState, writeState),
		reviewRoute(ctx, configured, readState),
		progressRoute(ctx, configured),
		timingRoute(ctx, configured, readState)
	].map((route) => guarded(ctx, route));
	for (const route of routes) ctx.effect(() => ctx.webServer.register(route), `lingualab: ${route.kind} ${route.path}`);
}
//#endregion
export { Config, apply, inject, name };
