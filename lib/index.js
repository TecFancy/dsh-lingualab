import z from "@deepseek-ai/schemastery";
import { basename, dirname, extname, isAbsolute, join, relative } from "node:path";
import { createReadStream, existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
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
/** Extensions this module recognises as subtitles. */
const SUBTITLE_SET = new Set(SUBTITLE_EXTENSIONS);
/** Whether a file name reads as Chinese rather than English. */
function looksChinese(fileName) {
	return /(^|[^a-z])(zh|chs|cht|cn|chi|中文|双语)([^a-z]|$)/i.test(fileName);
}
/** Whether the first bytes of a file carry CJK text, used only to break ties. */
function fileHasCjk(path) {
	try {
		const head = readFileSync(path, "utf8").slice(0, 4096);
		return /[\u4e00-\u9fff]/.test(head);
	} catch {
		return false;
	}
}
/** Pick the audio file: the first extension in preference order wins. */
function pickAudio(names) {
	for (const extension of AUDIO_EXTENSIONS) {
		const hit = names.find((name) => extname(name).slice(1).toLowerCase() === extension);
		if (hit !== void 0) return hit;
	}
	return null;
}
/**
* Decide which subtitle file is English and which is Chinese.
*
* The names decide when they say so. When they do not, one file is treated as
* English and, if a second exists, as Chinese; a single file that itself carries
* CJK text is offered as both, because a bilingual subtitle is one file with two
* languages in it, and the panel splits it line by line.
*/
function pickSubtitles(folder, names) {
	const files = names.filter((name) => SUBTITLE_SET.has(extname(name).slice(1).toLowerCase()));
	if (files.length === 0) return {
		en: null,
		zh: null
	};
	const chinese = files.filter((name) => looksChinese(name));
	const rest = files.filter((name) => !looksChinese(name));
	if (rest.length > 0) return {
		en: rest[0] ?? null,
		zh: chinese[0] ?? rest[1] ?? null
	};
	const first = chinese[0] ?? files[0] ?? null;
	return {
		en: first,
		zh: first !== null && fileHasCjk(join(folder, first)) ? first : chinese[1] ?? null
	};
}
/** Scan one episode folder. A folder with no audio is listed but not playable. */
function scanEpisode(root, id, title) {
	const folder = join(root, id);
	const names = readdirSync(folder).filter((name) => !name.startsWith("."));
	const audio = pickAudio(names);
	const { en, zh } = pickSubtitles(folder, names);
	let audioBytes = null;
	if (audio !== null) try {
		audioBytes = statSync(join(folder, audio)).size;
	} catch {
		audioBytes = null;
	}
	const notesPath = join(folder, NOTES_FILE);
	const notes = existsSync(notesPath) ? summarizeNotes(readFileSync(notesPath, "utf8")) : summarizeNotes(null);
	return {
		id,
		title,
		audio,
		audioBytes,
		subtitleEn: en,
		subtitleZh: zh,
		notes
	};
}
/** The episode the panel opens: the manifest's choice, else the first unstudied one. */
function pickCurrent(episodes, manifest) {
	if (manifest.current !== void 0 && episodes.some((entry) => entry.id === manifest.current)) return manifest.current;
	return episodes.find((entry) => entry.notes.count === 0)?.id ?? episodes[episodes.length - 1]?.id ?? null;
}
/** Read the root and describe every episode in it. Never throws. */
function scanLibrary(root) {
	if (root.trim().length === 0) return {
		ok: false,
		root,
		reason: "媒体目录还没配置",
		current: null,
		episodes: []
	};
	if (!existsSync(root)) return {
		ok: false,
		root,
		reason: "媒体目录不存在",
		current: null,
		episodes: []
	};
	let folderNames;
	try {
		folderNames = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name);
	} catch (error) {
		return {
			ok: false,
			root,
			reason: `读不了媒体目录：${String(error)}`,
			current: null,
			episodes: []
		};
	}
	const manifest = readManifest(root);
	const ordered = manifest.episodes !== void 0 && manifest.episodes.length > 0 ? [...manifest.episodes.filter((id) => folderNames.includes(id)), ...[...folderNames].filter((id) => !manifest.episodes?.includes(id)).sort(compareIds)] : [...folderNames].sort(compareIds);
	const episodes = [];
	for (const id of ordered) try {
		episodes.push(scanEpisode(root, id, manifest.titles?.[id] ?? id));
	} catch {
		continue;
	}
	return {
		ok: true,
		root,
		reason: null,
		current: pickCurrent(episodes, manifest),
		episodes
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
function readNotes(root, episode) {
	if (!isSafeEpisodeId(episode)) return {
		ok: false,
		episode,
		reason: "剧集 id 不合法",
		phrases: []
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
* Replace an episode's notes.
*
* The ceiling is enforced here as well as in the panel: the panel is a client
* and clients get bypassed, so the rule that gives the method its discipline is
* a property of the file, not of one UI. Refusing is explicit — the caller gets
* `ok: false` and the reason, never a silently truncated list.
*/
function writeNotes(root, episode, input) {
	if (!isSafeEpisodeId(episode)) return {
		ok: false,
		episode,
		reason: "剧集 id 不合法",
		phrases: []
	};
	const phrases = [];
	for (const item of input) {
		const phrase = sanitizePhrase(item);
		if (phrase !== null) phrases.push(phrase);
	}
	if (phrases.length > 7) return {
		ok: false,
		episode,
		reason: `一集最多 7 条，收到 ${phrases.length} 条`,
		phrases: []
	};
	const path = notesPath(root, episode);
	if (!staysInside(root, path)) return {
		ok: false,
		episode,
		reason: "笔记路径跑到素材目录外面了",
		phrases: []
	};
	try {
		const preamble = existsSync(path) ? parseNotes(readFileSync(path, "utf8")).preamble : defaultPreamble(episode);
		writeFileSync(path, serializeNotes(preamble.length > 0 ? preamble : defaultPreamble(episode), phrases), "utf8");
	} catch (error) {
		return {
			ok: false,
			episode,
			reason: `写不了笔记：${String(error)}`,
			phrases: []
		};
	}
	return {
		ok: true,
		episode,
		reason: null,
		phrases
	};
}
//#endregion
//#region src/index.ts
/**
* dsh-lingualab — host half.
*
* The panel is a browser page, so the three things it cannot do for itself are
* the three things this half owns: list what is in the library, hand over the
* bytes of one episode, and read or write the notes file.
*
* Everything is read from disk on demand rather than cached at load time. The
* material is copied into the workspace by hand between sessions, so a library
* snapshot taken at boot would be stale exactly when it matters most: right after
* a new episode lands.
*
* Routes live under `/lingualab/`, clear of the module system's `/plugins` prefix
* route, and the same three are declared in `dsh-plugin.naming.json` — `npm run
* verify` compares the two so a renamed route cannot silently outlive its record.
*/
/** Stable plugin name (the composition row id is `lingualab`). */
const name = "lingualab";
/**
* Without a web carrier there is nowhere to serve the library from, and nowhere
* for the shell to fetch the client bundle either.
*/
const inject = ["webServer"];
const Config = z.object({ libraryRoot: z.string().default("") });
/** Where the library sits when the config does not say. */
const DEFAULT_LIBRARY_SUBPATH = "notes/learning/english/media";
/** Resolve the library root for one request: config first, workspace guess second. */
function resolveRoot(ctx, configured) {
	if (configured.trim().length > 0) return configured;
	const workspace = ctx.workspaceRegistry?.list()[0]?.path;
	return workspace === void 0 ? "" : join(workspace, DEFAULT_LIBRARY_SUBPATH);
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
/** `GET /lingualab/library` — describe every episode folder under the root. */
function libraryRoute(ctx, configured) {
	return {
		kind: "exact",
		path: LIBRARY_PATH,
		handler: (req, res) => {
			if (!methodAllowed(req, res, ["GET"])) return;
			sendJson(res, 200, scanLibrary(resolveRoot(ctx, configured())));
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
			serveMedia(req, res, resolveRoot(ctx, configured()), rest);
		}
	};
}
/** `GET` and `POST /lingualab/notes` — the hand-off file between panel and agent. */
function notesRoute(ctx, configured) {
	return {
		kind: "exact",
		path: NOTES_PATH,
		handler: async (req, res) => {
			if (!methodAllowed(req, res, ["GET", "POST"])) return;
			const root = resolveRoot(ctx, configured());
			if ((req.method ?? "GET") === "GET") {
				sendJson(res, 200, readNotes(root, new URL(req.url ?? "/lingualab/notes", "http://lingualab.invalid").searchParams.get("episode") ?? ""));
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
			const result = writeNotes(root, request.episode, request.phrases);
			sendJson(res, result.ok ? 200 : 400, result);
		}
	};
}
/** Mount the three routes. The config is read per request, so edits need no reload. */
function apply(ctx, config) {
	const configured = () => config.libraryRoot;
	for (const route of [
		libraryRoute(ctx, configured),
		mediaRoute(ctx, configured),
		notesRoute(ctx, configured)
	]) ctx.effect(() => ctx.webServer.register(route), `lingualab: ${route.kind} ${route.path}`);
}
//#endregion
export { Config, apply, inject, name };
