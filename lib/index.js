import z from "@deepseek-ai/schemastery";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { createReadStream, existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
/** Split a notes file into its preserved preamble and its phrases. */
function parseNotes(markdown) {
	const lines = markdown.split(/\r?\n/);
	const phrases = [];
	let firstPhraseAt = -1;
	for (let index = 0; index < lines.length; index += 1) {
		const phrase = parsePhraseLine(lines[index] ?? "");
		if (phrase === null) continue;
		if (firstPhraseAt === -1) firstPhraseAt = index;
		phrases.push(phrase);
	}
	return {
		preamble: (firstPhraseAt === -1 ? markdown : lines.slice(0, firstPhraseAt).join("\n")).replace(/\s+$/, ""),
		phrases
	};
}
/** The canonical file body. `preamble` is kept as-is, then one line per phrase. */
function serializeNotes(preamble, phrases) {
	const head = preamble.trim().length > 0 ? `${preamble.replace(/\s+$/, "")}\n\n` : "";
	const body = phrases.map((phrase) => {
		const tags = phrase.tags.map((tag) => `#${tag.replace(/^#+/, "")}`).join(" ");
		const fields = [
			formatTimestamp(phrase.at),
			phrase.text,
			phrase.zh,
			phrase.note
		].map(joinField);
		while (fields.length > 3 && (fields[fields.length - 1] ?? "").trim().length === 0) fields.pop();
		const tail = tags.length > 0 ? ` | ${tags}` : "";
		return `- [${phrase.done ? "x" : " "}] ${fields.join(" | ")}${tail}`;
	}).join("\n");
	return `${head}${body}${body.length > 0 ? "\n" : ""}`;
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
* is offered as *both* tracks, and the panel splits it line by line.
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
/** Extensions this module accepts as subtitles. */
const SUBTITLE_SET = new Set(SUBTITLE_EXTENSIONS);
/** How much of a file is read when the content has to break a tie. */
const SNIFF_BYTES = 4096;
/** The file name without its extension: `lesson.en.srt` becomes `lesson.en`. */
function stemOf(fileName) {
	const extension = extname(fileName);
	return extension.length === 0 ? fileName : fileName.slice(0, -extension.length);
}
/**
* Whether a file name belongs to the same stem as an audio file.
*
* `lesson.mp3` owns `lesson.srt`, `lesson.en.srt` and `lesson_zh.srt`; it does not
* own `lesson2.srt`. The separator is required so a numbered sequel is a different
* lesson rather than a second subtitle track.
* @param fileName - the candidate file name.
* @param stem - the audio file's stem.
* @returns true when the two belong together.
*/
function sameStem(fileName, stem) {
	const base = stemOf(fileName);
	if (base === stem) return true;
	const next = base.slice(stem.length, stem.length + 1);
	return base.startsWith(stem) && (next === "." || next === "_" || next === "-");
}
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
	}
	return "none";
}
/**
* Split a directory's names into the three groups, in natural order.
*
* A stem narrows the set as well as the reading: subtitles belong to one audio
* file by name, and `other.en.srt` sitting in the same directory is not this
* episode's English track. Without a stem — a folder episode — every subtitle in
* the folder is a candidate, because there the folder is the episode.
* @param names - the file names of one directory.
* @param stem - the audio stem, when the caller has one.
* @returns the classification.
*/
function classifySubtitles(names, stem) {
	const files = names.filter((name) => SUBTITLE_SET.has(extname(name).slice(1).toLowerCase())).filter((name) => stem === void 0 || sameStem(name, stem)).sort(compareIds);
	const en = [];
	const zh = [];
	const unmarked = [];
	for (const file of files) {
		const mark = markOf(file, stem);
		if (mark === "en") en.push(file);
		else if (mark === "zh") zh.push(file);
		else unmarked.push(file);
	}
	return {
		files,
		en,
		zh,
		unmarked,
		ambiguous: en.length > 1 || zh.length > 1 || unmarked.length > 1
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
* files decides which is which. `ambiguous` reports that this was a best effort —
* the picker shows that state, while the page opens what it is given.
* @param names - file names of one directory.
* @param options - the audio stem, and the directory when content may be read.
* @returns the pair, plus whether it was guessed.
*/
function pairSubtitles(names, options = {}) {
	const { stem, directory } = options;
	const { files, en, zh, unmarked, ambiguous } = classifySubtitles(names, stem);
	if (files.length === 0) return {
		en: null,
		zh: null,
		ambiguous: false
	};
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
	const { files, en, zh, unmarked, ambiguous } = classifySubtitles(names, stem);
	const shown = files.slice(0, 4);
	if (files.length === 0) return {
		state: "none",
		files: []
	};
	if (ambiguous) return {
		state: "unknown",
		files: shown
	};
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
		candidates.push(describe(path, workspace.path.split("/").pop() ?? workspace.path));
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
const FORBIDDEN_ROOTS = [
	"/etc",
	"/proc",
	"/sys",
	"/dev",
	"/run",
	"/boot",
	"/root"
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
		return realpathSync(path);
	} catch {
		return resolve(path);
	}
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
	const real = realPathOf(path);
	if (real === sep || real.length === 0) return "不允许浏览根目录";
	for (const forbidden of FORBIDDEN_ROOTS) if (real === forbidden || real.startsWith(`${forbidden}${sep}`)) return `${forbidden} 下面不允许浏览`;
	return null;
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
/** Normalise one incoming phrase, dropping anything that cannot be played back. */
function sanitizePhrase(input) {
	if (typeof input !== "object" || input === null) return null;
	const record = input;
	const at = typeof record.at === "number" && Number.isFinite(record.at) && record.at >= 0 ? record.at : null;
	const text = typeof record.text === "string" ? record.text.trim() : "";
	if (at === null || text.length === 0) return null;
	const tags = Array.isArray(record.tags) ? record.tags.filter((tag) => typeof tag === "string").map((tag) => tag.replace(/^#+/, "").trim()).filter((tag) => tag.length > 0) : [];
	return {
		at,
		text,
		zh: typeof record.zh === "string" ? record.zh.trim() : "",
		note: typeof record.note === "string" ? record.note.trim() : "",
		tags,
		done: record.done === true
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
* two subtitle files and an optional `notes.md`. Nothing else is required and
* nothing is generated here: the scan is read-only, because the material is
* copied in by hand, one episode at a time, and a plugin that rewrites a user's
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
/** Scan one episode folder. A folder with no audio is listed but not playable. */
function scanEpisode(root, id, title) {
	const folder = join(root, id);
	const names = readdirSync(folder).filter((name) => !name.startsWith("."));
	const audio = pickAudioFile(names);
	const { en, zh } = pairSubtitles(names, { directory: folder });
	let audioBytes = null;
	if (audio !== null) try {
		audioBytes = statSync(join(folder, audio)).size;
	} catch {}
	const notesPath = join(folder, NOTES_FILE);
	const notes = existsSync(notesPath) ? summarizeNotes(readFileSync(notesPath, "utf8")) : summarizeNotes(null);
	return {
		id,
		title,
		audio,
		audioBytes,
		subtitleEn: en,
		subtitleZh: zh,
		notes,
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
* {@link sanitizePhrases} is the same in both.
*/
/** Episode ids name a folder, so they may not contain separators or escapes. */
function isSafeEpisodeId(id) {
	return id.length > 0 && !id.includes("/") && !id.includes("\\") && id !== "." && id !== "..";
}
/** The preamble a fresh notes file opens with. */
function defaultPreamble(episode) {
	return [
		`# ${episode} 笔记`,
		"",
		`> 每集最多 7 条。写满了先删一条再记，或者替换掉最不想要的那条。`,
		"> 想不起的加 `#review`，周日还记不住的加 `#hard`。"
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
		return {
			ok: true,
			episode,
			reason: null,
			phrases
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
* The ceiling is enforced here as well as in the panel: the panel is a client
* and clients get bypassed, so the rule that gives the method its discipline is
* a property of the file, not of one UI. Refusing is explicit — the caller gets
* `ok: false` and the reason, never a silently truncated list.
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
	if (phrases.length > 7) return {
		payload: {
			ok: false,
			episode,
			reason: `一集最多 7 条，收到 ${phrases.length} 条`,
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
		writeFileSync(path, serializeNotes(preamble.length > 0 ? preamble : defaultPreamble(episode), phrases), "utf8");
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
/** The media URLs of a folder episode, from the names the scan found. */
function folderMedia(entry) {
	return {
		audioUrl: entry.audio === null ? "" : folderUrl(entry.id, entry.audio),
		subtitleEnUrl: entry.subtitleEn === null ? null : folderUrl(entry.id, entry.subtitleEn),
		subtitleZhUrl: entry.subtitleZh === null ? null : folderUrl(entry.id, entry.subtitleZh)
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
function warningsOf(entry) {
	return entry.subtitleEn === null && entry.subtitleZh === null ? ["no-subtitle"] : [];
}
/** The success payload for one episode. */
function accept(entry, media, state) {
	return {
		payload: {
			ok: true,
			reason: null,
			episode: entry,
			media,
			warnings: warningsOf(entry)
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
/** Open a folder episode the scan knows. */
function openFolder(id, deps) {
	const listing = scanLibrary(deps.libraryRoot, deps.state);
	if (!listing.ok) return refuse(deps.state, listing.reason ?? "媒体目录读不了");
	const entry = listing.episodes.find((candidate) => candidate.id === id);
	if (entry === void 0) return refuse(deps.state, "找不到这一集");
	if (entry.audio === null) return refuse(deps.state, "这一集没有音频文件");
	const ref = {
		id: entry.id,
		title: entry.title,
		kind: "folder",
		source: entry.source
	};
	return accept(entry, folderMedia(entry), withCurrent(deps.state, ref));
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
	if (typeof id === "string" && id.length > 0) return isFileEpisodeId(id) ? openRememberedFile(id, deps) : openFolder(id, deps);
	if (typeof request.place === "string" && typeof request.rel === "string") return openPicked(request, deps);
	return refuse(deps.state, "episodeId 和 place/rel 必须给一个");
}
//#endregion
//#region src/index.ts
/**
* dsh-lingualab — host half.
*
* The panel is a browser page, so the things it cannot do for itself are the
* things this half owns: say where the library is, list what is in it, let the
* reader browse to material that is not in the library yet, hand over the bytes of
* one episode, and read or write the notes.
*
* Everything is read from disk on demand rather than cached at load time. The
* material is copied into the workspace by hand between sessions, so a library
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
/** A refusal with no episode attached, for the request-level mistakes. */
function emptyOpen(reason) {
	return {
		ok: false,
		reason,
		episode: null,
		media: null,
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
		libraryRoute(ctx, configured, readState),
		mediaRoute(ctx, configured),
		fileMediaRoute(readState),
		notesRoute(ctx, configured, readState, writeState)
	];
	for (const route of routes) ctx.effect(() => ctx.webServer.register(route), `lingualab: ${route.kind} ${route.path}`);
}
//#endregion
export { Config, apply, inject, name };
