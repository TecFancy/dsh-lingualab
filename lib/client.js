window.__ModuleLoader__.load({
	id: "dsh-lingualab",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locale.ts
		/**
		* The page copy, in both languages.
		*
		* Keys are grouped by the part of the page that reads them so a missing
		* translation is visible next to its neighbours. The host's locale service picks
		* the dictionary; nothing here decides which language is active.
		*
		* Chinese is the source of truth: a new string is written here first, then mirrored
		* in `en` in the same order, and the type below refuses a dictionary that is missing
		* one.
		*/
		/** Chinese copy — the primary side of every pair in this repository. */
		const zh = {
			back: "← 返回会话",
			close: "关闭",
			cancel: "取消",
			save: "保存",
			saving: "保存中",
			mediaFolderSaving: "保存中",
			saved: "已保存",
			saveFailed: "保存失败",
			retry: "重试",
			openEpisode: "打开一集",
			changeEpisode: "换一集",
			notesChip: "笔记",
			stepsChip: "五步",
			mediaFolder: "媒体目录",
			emptyTitle: "还没有剧集",
			emptyHint: "把一集音频放进媒体目录，或者到「浏览」里挑一个目录。",
			currentGone: "上次打开的一集不在了",
			noWorkspaces: "没有可浏览的工作区",
			dirUnreadable: "这个目录读不了",
			stageLoading: "正在读取这一集",
			play: "播放",
			pause: "暂停",
			prevCue: "上一句",
			nextCue: "下一句",
			loopSentence: "循环本句",
			loopShort: "循环",
			setA: "设 A",
			setB: "设 B",
			clearAb: "清掉 A-B",
			loopAb: "循环 A-B",
			speed: "变速",
			zhMode: "中文显示",
			zhAlways: "常显",
			zhDim: "弱化",
			zhActiveOnly: "仅当前句",
			zhHidden: "隐藏",
			noAudio: "这一集没有音频",
			noSubtitles: "这一集没有字幕，只能整段听",
			subtitleFailed: "字幕没有读出来",
			shortcutHint: "空格 播放 · ←→ 上下句 · L 循环 · N 记下 · C 中文 · A/B 设点",
			keysInactive: "点一下页面，快捷键才生效",
			notesMarked: "这一句有笔记",
			recordThis: "记下",
			recordHint: "把当前这一句记进笔记",
			subtitleBadgeNone: "没有字幕",
			subtitleBadgeEn: "英文字幕",
			subtitleBadgeZh: "中文字幕",
			subtitleBadgeBoth: "中英字幕",
			subtitleBadgeUnknown: "字幕待确认",
			notes: "笔记",
			notesHint: "每集最多 7 条，满了先替换一条",
			notesEmpty: "还没有记东西。听到想留的句子，点「记下」。",
			notesFull: "已经 7 条，选一条替换",
			replaceHint: "要替换哪一条？",
			notesEditorPlaceholder: "备注：谁说的、什么场景",
			notesReplace: "替换所选",
			notesEdit: "编辑",
			notesDelete: "删掉",
			notesDeleteConfirm: "再点一次删掉",
			review: "想不起",
			hard: "还记不住",
			pickerTitle: "打开一集",
			pickerLibrary: "媒体库",
			pickerBrowse: "浏览",
			pickerSearch: "按标题或文件名找",
			pickerEpisodes: "剧集文件夹",
			pickerFiles: "根目录里的音频",
			pickerEmptyFolder: "这里没有音频或剧集文件夹",
			pickerNoAudio: "没有音频",
			pickerNoLibrary: "还没设媒体库",
			pickerNoLibraryHint: "到「浏览」里进到目标目录，再用「用作媒体库」。",
			pickerParent: "上一级",
			pickerTruncated: "只列了一部分，输入关键词缩小范围",
			pickerOpenFolder: "作为剧集打开",
			pickerLoading: "正在读取",
			pickerConvention: "建议",
			mediaFolderHint: "一集一个文件夹，也可以直接把音频放在根目录。",
			mediaFolderCurrent: "当前",
			mediaFolderSourceConfig: "来自配置",
			mediaFolderSourceWorkspace: "按工作区约定",
			mediaFolderSourceNone: "还没设置",
			mediaFolderPlaceholder: "/绝对/路径/到/媒体目录",
			mediaFolderSave: "使用这个目录",
			mediaFolderUse: "用作媒体库",
			mediaFolderMissing: "不存在",
			mediaFolderEmpty: "空的",
			mediaFolderCount: "个子文件夹",
			mediaFolderReadOnly: "这个部署没有 settings 服务，页面改不了配置，只能看。",
			mediaFolderBrowseHint: "也可以到「浏览」里进到目标目录，再点「用作媒体库」。",
			stepBlind: "无字幕盲看",
			stepRead: "英文字幕精看",
			stepShadow: "跟读模仿",
			stepNextDay: "次日复习",
			stepWeekly: "周日复习",
			stepInSession: "会话里做",
			stepStart: "开始计时",
			stepStop: "停下",
			stepDone: "打勾",
			stepUndone: "取消打勾",
			minutes: "分钟"
		};
		/** English copy — same keys, same order. */
		const en = {
			back: "← Back to conversation",
			close: "Close",
			cancel: "Cancel",
			save: "Save",
			saving: "Saving",
			mediaFolderSaving: "Saving",
			saved: "Saved",
			saveFailed: "Could not save",
			retry: "Retry",
			openEpisode: "Open an episode",
			changeEpisode: "Change episode",
			notesChip: "Notes",
			stepsChip: "Steps",
			mediaFolder: "Media folder",
			emptyTitle: "No episodes yet",
			emptyHint: "Put one episode in the media folder, or pick a folder under 「Browse」.",
			currentGone: "The episode you had open is gone",
			noWorkspaces: "No workspace to browse",
			dirUnreadable: "This folder cannot be read",
			stageLoading: "Loading this episode",
			play: "Play",
			pause: "Pause",
			prevCue: "Previous sentence",
			nextCue: "Next sentence",
			loopSentence: "Loop this sentence",
			loopShort: "Loop",
			setA: "Set A",
			setB: "Set B",
			clearAb: "Clear A-B",
			loopAb: "Loop A-B",
			speed: "Speed",
			zhMode: "Chinese",
			zhAlways: "Always",
			zhDim: "Dimmed",
			zhActiveOnly: "Current only",
			zhHidden: "Hidden",
			noAudio: "This episode has no audio",
			noSubtitles: "No subtitles in this episode — listen straight through",
			subtitleFailed: "The subtitles did not load",
			shortcutHint: "Space play · ←→ sentences · L loop · N note · C Chinese · A/B marks",
			keysInactive: "Click the page to use the shortcuts",
			notesMarked: "Noted",
			recordThis: "Note",
			recordHint: "Note the sentence playing now",
			subtitleBadgeNone: "no subtitles",
			subtitleBadgeEn: "English subtitles",
			subtitleBadgeZh: "Chinese subtitles",
			subtitleBadgeBoth: "both tracks",
			subtitleBadgeUnknown: "subtitles unchecked",
			notes: "Notes",
			notesHint: "Seven phrases per episode; a full list replaces one",
			notesEmpty: "Nothing yet. Hit 「Note」 on a sentence worth keeping.",
			notesFull: "Seven already — pick one to replace",
			replaceHint: "Which one does it replace?",
			notesEditorPlaceholder: "Note: who said it, in what scene",
			notesReplace: "Replace selected",
			notesEdit: "Edit",
			notesDelete: "Delete",
			notesDeleteConfirm: "Click again to delete",
			review: "Review",
			hard: "Hard",
			pickerTitle: "Open an episode",
			pickerLibrary: "Library",
			pickerBrowse: "Browse",
			pickerSearch: "Filter by title or file name",
			pickerEpisodes: "Episode folders",
			pickerFiles: "Audio in the root",
			pickerEmptyFolder: "No audio or episode folders here",
			pickerNoAudio: "no audio",
			pickerNoLibrary: "No media folder yet",
			pickerNoLibraryHint: "Under 「Browse」, open the folder you want and choose 「Use as media folder」.",
			pickerParent: "Up one level",
			pickerTruncated: "Only part of the list is shown — type to narrow it",
			pickerOpenFolder: "Open as an episode",
			pickerLoading: "Loading",
			pickerConvention: "Suggested",
			mediaFolderHint: "One folder per episode, or audio straight in the root.",
			mediaFolderCurrent: "Current",
			mediaFolderSourceConfig: "from the config",
			mediaFolderSourceWorkspace: "by workspace convention",
			mediaFolderSourceNone: "not set yet",
			mediaFolderPlaceholder: "/absolute/path/to/media",
			mediaFolderSave: "Use this folder",
			mediaFolderUse: "Use as media folder",
			mediaFolderMissing: "missing",
			mediaFolderEmpty: "empty",
			mediaFolderCount: "subfolders",
			mediaFolderReadOnly: "This deployment has no settings service, so the page can only look.",
			mediaFolderBrowseHint: "Or open it under 「Browse」 and choose 「Use as media folder」.",
			stepBlind: "Blind watch",
			stepRead: "English subtitles",
			stepShadow: "Shadowing",
			stepNextDay: "Next-day review",
			stepWeekly: "Weekly review",
			stepInSession: "in the conversation",
			stepStart: "Start the clock",
			stepStop: "Stop",
			stepDone: "Tick",
			stepUndone: "Untick",
			minutes: "min"
		};
		//#endregion
		//#region src/client/entities/cue/model/types.ts
		/** Every mode, in the order a settings control should offer them. */
		const SUBTITLE_ZH_MODES = [
			"always",
			"dim",
			"active-only",
			"hidden"
		];
		//#endregion
		//#region src/client/entities/cue/lib/decode.ts
		/**
		* Reading subtitle bytes, and cleaning the text once they are decoded.
		*
		* Ported from `TecFancy/repeater` (`features/subtitle-parser/lib/`), where the
		* two hard cases were found the hard way.
		*
		* **Encoding.** A browser's `Blob.text()` always decodes as UTF-8, and a large
		* share of Chinese bilingual subtitles in the wild are GBK or GB18030. Decoded
		* as UTF-8 they turn into replacement characters while the ASCII English looks
		* fine — which reads like a rendering bug rather than an encoding one. The BOM
		* decides first, then a strict UTF-8 attempt, then GB18030 as the fallback.
		*
		* **Style tags.** Subtitles converted out of ASS/SSA carry inline override
		* blocks such as `{\fs16\an2\b0}`, hard line breaks written as `\N`, and HTML
		* font tags. Rendered as plain text they are noise in front of every line.
		*/
		/** Decode subtitle bytes: BOM first, then strict UTF-8, then GB18030. */
		function decodeSubtitleText(buffer) {
			const bytes = new Uint8Array(buffer);
			if (bytes[0] === 255 && bytes[1] === 254) return new TextDecoder("utf-16le").decode(bytes);
			if (bytes[0] === 254 && bytes[1] === 255) return new TextDecoder("utf-16be").decode(bytes);
			try {
				return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
			} catch {
				return new TextDecoder("gb18030").decode(bytes);
			}
		}
		/** Strip ASS/SSA override blocks, hard breaks and HTML tags; keep the words. */
		function stripStyleTags(text) {
			return text.replace(/\{\\[^}]*\}/g, "").replace(/\\[Nn]/g, "\n").replace(/\\h/g, " ").replace(/<\/?(?:font|i|b|u)\b[^>]*>/gi, "").trim();
		}
		//#endregion
		//#region src/client/entities/cue/lib/parse.ts
		const TIME_RANGE = /(\d{1,2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[.,]\d{3})/;
		const LRC_TIME = /\[(\d{1,}):(\d{2})[.:](\d{2,3})\](.*)/;
		/** `00:01:02,500` and `00:01:02.500` both mean 62.5 seconds. */
		function timecodeToSeconds(value) {
			const parts = value.replace(",", ".").split(":").map(Number);
			if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
			if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
			return parts[0] ?? 0;
		}
		/**
		* Parse SubRip text.
		*
		* Blank-line separated blocks; the first line matching the time pattern is the
		* timecode and everything else in the block is text. Out-of-order input is
		* sorted, and a block without a valid timecode is dropped rather than guessed
		* at — a wrong timestamp is worse than a missing cue, because the panel would
		* loop the wrong sentence.
		*/
		function parseSRT(text) {
			const blocks = text.trim().replace(/\r\n/g, "\n").split(/\n\n+/);
			const cues = [];
			for (const block of blocks) {
				const lines = block.split("\n").filter((line) => line.trim().length > 0);
				if (lines.length < 2) continue;
				const timeMatch = TIME_RANGE.exec(block);
				if (timeMatch === null) continue;
				const start = timecodeToSeconds(timeMatch[1] ?? "");
				const end = timecodeToSeconds(timeMatch[2] ?? "");
				const cleaned = stripStyleTags(lines.filter((line) => TIME_RANGE.exec(line) === null && !/^\d+$/.test(line.trim())).join("\n").trim());
				if (cleaned.length > 0) cues.push({
					start,
					end,
					text: cleaned
				});
			}
			return cues.sort((left, right) => left.start - right.start);
		}
		/**
		* Parse WebVTT text.
		*
		* VTT cues are the SRT shape with a dotted millisecond separator, so the work
		* is dropping what only VTT has: the `WEBVTT` header, `NOTE` and `STYLE` blocks,
		* and the optional cue identifier that precedes a timecode line. The identifier
		* has to go before SRT parsing sees it, because SRT would keep it as cue text.
		*/
		function parseVTT(text) {
			return parseSRT(text.replace(/\r\n/g, "\n").replace(/^WEBVTT[^\n]*\n/, "").split(/\n\n+/).filter((block) => !/^(NOTE|STYLE|REGION)\b/.test(block.trim())).map((block) => {
				const lines = block.split("\n");
				const timecodeAt = lines.findIndex((line) => TIME_RANGE.test(line));
				return timecodeAt <= 0 ? lines.join("\n") : lines.slice(timecodeAt).join("\n");
			}).join("\n\n"));
		}
		/**
		* Parse LRC text.
		*
		* LRC carries start times only, so each cue's end is chained to the next cue's
		* start and the final cue gets a three-second tail. Both centiseconds and
		* milliseconds are accepted, disambiguated by digit count. Minutes may run past
		* 99 so long-form audio is not silently dropped.
		*/
		function parseLRC(text) {
			const cues = [];
			for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
				const match = LRC_TIME.exec(line);
				if (match === null) continue;
				const minutes = Number(match[1]);
				const seconds = Number(match[2]);
				const fraction = Number(match[3]);
				const start = minutes * 60 + seconds + (fraction < 100 ? fraction / 100 : fraction / 1e3);
				const body = stripStyleTags((match[4] ?? "").trim());
				if (body.length > 0) cues.push({
					start,
					end: start + 3,
					text: body
				});
			}
			return cues.map((cue, index) => {
				const next = cues[index + 1];
				return next === void 0 ? cue : {
					...cue,
					end: Math.max(cue.start, next.start)
				};
			});
		}
		/** Parse by file extension, defaulting to SRT for an unknown one. */
		function parseSubtitle(text, fileName) {
			const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
			if (extension === "lrc") return parseLRC(text);
			if (extension === "vtt") return parseVTT(text);
			return parseSRT(text);
		}
		//#endregion
		//#region src/client/entities/cue/api/fetch-cues.ts
		/**
		* Loading one subtitle file over the host's media route.
		*
		* It lives in this entity rather than in `shared/` because it returns cues, and
		* FSD forbids a shared module from importing an entity. The bytes are read as an
		* `ArrayBuffer` on purpose: decoding happens in {@link decodeSubtitleText}, which
		* handles the GB18030 case that `response.text()` would turn into replacement
		* characters.
		*
		* The caller passes the URL rather than resolving `<episode>/<file>` itself: a file
		* episode is served from a different route, and which of the two applies is the
		* episode's business, not this module's.
		*/
		/**
		* Fetch, decode and parse one subtitle file.
		* @param url - where the bytes are, already encoded.
		* @param name - the file name, which decides the parser; `.lrc` is read as text lines.
		*/
		async function fetchCues(url, name) {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
			return parseSubtitle(decodeSubtitleText(await response.arrayBuffer()), name);
		}
		//#endregion
		//#region src/client/entities/cue/lib/merge.ts
		/** How far apart two starts may be and still count as the same line. */
		const MATCH_TOLERANCE_SECONDS = .6;
		/**
		* Append the Chinese text of the matching cue to each English cue.
		*
		* @param english Cues from the English track, already sorted by the parser.
		* @param chinese Cues from the Chinese track.
		* @returns A new list; the inputs are not modified.
		*/
		function mergeBilingual(english, chinese) {
			if (chinese.length === 0) return [...english];
			const sorted = [...chinese].sort((left, right) => left.start - right.start);
			let cursor = 0;
			return english.map((cue) => {
				while (cursor < sorted.length - 1 && (sorted[cursor + 1]?.start ?? Infinity) <= cue.start) cursor += 1;
				const candidate = sorted[cursor];
				if (candidate === void 0 || Math.abs(candidate.start - cue.start) > MATCH_TOLERANCE_SECONDS) return cue;
				return {
					...cue,
					text: `${cue.text}\n${candidate.text}`
				};
			});
		}
		//#endregion
		//#region src/client/entities/cue/lib/lines.ts
		/** CJK unified ideographs, including extension A. */
		const CJK = /[\u3400-\u4dbf\u4e00-\u9fff]/;
		/** True when a line carries Chinese characters. */
		function hasCjk(text) {
			return CJK.test(text);
		}
		/**
		* Split a cue's text into lines and put the English above the Chinese,
		* regardless of the order in the source file.
		*
		* The Chinese lines of a bilingual cue come back marked `secondary` so the
		* panel can dim them. A single-language cue is returned untouched and nothing is
		* marked, because dimming the only line on screen is just worse contrast.
		*/
		function orderCueLines(text) {
			const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
			const chinese = [];
			const latin = [];
			for (const line of lines) (hasCjk(line) ? chinese : latin).push(line);
			if (chinese.length === 0 || latin.length === 0) return lines.map((line) => ({
				text: line,
				secondary: false
			}));
			return [...latin.map((text) => ({
				text,
				secondary: false
			})), ...chinese.map((text) => ({
				text,
				secondary: true
			}))];
		}
		/**
		* Which lines of a cue survive the current mode.
		*
		* `activeOnly` needs to know whether this is the cue being played; every other
		* mode is a pure function of the lines themselves.
		*/
		function visibleCueLines(text, mode, isActive) {
			const lines = orderCueLines(text);
			if (mode === "always") return lines;
			if (mode === "hidden") {
				const latin = lines.filter((line) => !line.secondary);
				return latin.length > 0 ? latin : lines;
			}
			if (mode === "active-only" && !isActive) {
				const latin = lines.filter((line) => !line.secondary);
				return latin.length > 0 ? latin : lines;
			}
			return lines;
		}
		/**
		* Index of the cue covering `time`, or the last cue that started before it.
		*
		* Binary search rather than a scan: this runs on every `timeupdate`, and the
		* linear version it replaced was measurable on a 1000-cue episode.
		*/
		function findActiveCue(cues, time) {
			if (cues.length === 0) return -1;
			let low = 0;
			let high = cues.length - 1;
			let best = -1;
			while (low <= high) {
				const middle = low + high >> 1;
				const cue = cues[middle];
				if (cue === void 0) break;
				if (cue.start <= time) {
					best = middle;
					low = middle + 1;
				} else high = middle - 1;
			}
			if (best === -1) return -1;
			const candidate = cues[best];
			if (candidate !== void 0 && time <= candidate.end) return best;
			return best;
		}
		//#endregion
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
		//#endregion
		//#region src/client/shared/lib/api.ts
		/**
		* Requests to the host half, and the one place the panel learns about files.
		*
		* Every call returns a payload rather than throwing on a bad answer: a missing
		* library is a normal state on a machine where nothing has been copied in yet,
		* and the page has to render that state instead of an error boundary.
		*/
		/** One empty payload per failure shape, so callers never see `undefined`. */
		const EMPTY_CONFIG = (root, reason) => ({
			ok: false,
			reason,
			root,
			configured: "",
			source: "none",
			exists: false,
			episodes: null,
			writable: true,
			candidates: []
		});
		const EMPTY_BROWSE = (reason) => ({
			ok: false,
			reason,
			place: null,
			rel: "",
			parentRel: null,
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
		});
		const EMPTY_OPEN = (reason) => ({
			ok: false,
			reason,
			episode: null,
			media: null,
			warnings: []
		});
		/** Fetch the library listing. Network failures come back as an unreadable root. */
		async function fetchLibrary() {
			try {
				return await (await fetch(LIBRARY_PATH, { headers: { accept: "application/json" } })).json();
			} catch (error) {
				return {
					ok: false,
					root: "",
					reason: String(error),
					current: null,
					episodes: [],
					files: [],
					currentEpisode: null,
					currentUnavailable: null
				};
			}
		}
		/** Read where the library is, and which folders could be it. */
		async function fetchConfig() {
			try {
				return await (await fetch(CONFIG_PATH, { headers: { accept: "application/json" } })).json();
			} catch {
				return null;
			}
		}
		/**
		* Ask the host to make a folder the library root.
		*
		* The answer is the state now in effect, or the reason it was refused — a path that
		* does not exist is a normal answer here, not an exception, because the reader is
		* typing it.
		*/
		async function saveConfig(libraryRoot) {
			return await postConfig({ libraryRoot }, libraryRoot);
		}
		/** The same, for a folder the picker browsed to: a place id and a relative path. */
		async function saveConfigFromPlace(place, rel) {
			return await postConfig({
				place,
				rel
			}, rel);
		}
		async function postConfig(body, fallbackRoot) {
			try {
				const payload = await (await fetch(CONFIG_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body)
				})).json();
				if ("root" in payload) return payload;
				return EMPTY_CONFIG(fallbackRoot, payload.reason);
			} catch (error) {
				return EMPTY_CONFIG(fallbackRoot, String(error));
			}
		}
		/** The roots the picker may browse: every workspace, plus the library itself. */
		async function fetchPlaces() {
			try {
				return await (await fetch(PLACES_PATH, { headers: { accept: "application/json" } })).json();
			} catch (error) {
				return {
					ok: false,
					reason: String(error),
					places: [],
					current: null
				};
			}
		}
		/** List one directory under one place. */
		async function fetchBrowse(place, rel, query = "") {
			const params = new URLSearchParams({
				place,
				rel
			});
			if (query.trim().length > 0) params.set("q", query.trim());
			try {
				return await (await fetch(`${BROWSE_PATH}?${params.toString()}`, { headers: { accept: "application/json" } })).json();
			} catch (error) {
				return EMPTY_BROWSE(String(error));
			}
		}
		/** Open a folder episode the library scan already knows. */
		async function openEpisodeById(episodeId) {
			return await postOpen({ episodeId });
		}
		/** Open one audio file, with the subtitles beside it. */
		async function openEpisodeFile(place, rel) {
			return await postOpen({
				place,
				rel
			});
		}
		async function postOpen(body) {
			try {
				const payload = await (await fetch(OPEN_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body)
				})).json();
				if (typeof payload.ok !== "boolean") return EMPTY_OPEN("主机没有回答");
				return payload;
			} catch (error) {
				return EMPTY_OPEN(String(error));
			}
		}
		/** Read one episode's notes. */
		async function fetchNotes(episode) {
			try {
				return await (await fetch(`${NOTES_PATH}?episode=${encodeURIComponent(episode)}`, { headers: { accept: "application/json" } })).json();
			} catch (error) {
				return {
					ok: false,
					episode,
					reason: String(error),
					phrases: []
				};
			}
		}
		/** Replace one episode's notes. */
		async function saveNotes(episode, phrases) {
			try {
				return await (await fetch(NOTES_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						episode,
						phrases
					})
				})).json();
			} catch (error) {
				return {
					ok: false,
					episode,
					reason: String(error),
					phrases: []
				};
			}
		}
		//#endregion
		//#region src/client/features/library-config/model/useLibraryConfig.ts
		/**
		* The folder setting, as the page sees it.
		*
		* Two pieces of state matter and they are not the same: what the host says is in
		* effect, and what the reader has typed but not saved. Keeping the draft separate
		* means a failed save leaves the typed path on screen to be corrected instead of
		* snapping back to the old one.
		*/
		/** Load the folder setting and let the reader change it. */
		function useLibraryConfig() {
			const [payload, setPayload] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)("");
			const [saving, setSaving] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				let cancelled = false;
				(async () => {
					const next = await fetchConfig();
					if (cancelled || next === null) return;
					setPayload(next);
					setDraft(next.configured.length > 0 ? next.configured : next.root);
				})();
				return () => {
					cancelled = true;
				};
			}, []);
			return {
				payload,
				draft,
				saving,
				error,
				setDraft,
				save: (0, react.useCallback)(async (value) => {
					const target = (value ?? draft).trim();
					setSaving(true);
					setError(null);
					const result = await saveConfig(target);
					setSaving(false);
					setPayload(result);
					setError(result.ok ? null : result.reason);
					if (result.ok) setDraft(target);
					return result.ok;
				}, [draft]),
				useAsLibrary: (0, react.useCallback)(async (place, rel) => {
					setSaving(true);
					setError(null);
					const result = await saveConfigFromPlace(place, rel);
					setSaving(false);
					setPayload(result);
					setError(result.ok ? null : result.reason);
					if (result.ok) setDraft(result.configured.length > 0 ? result.configured : result.root);
					return result.ok;
				}, [])
			};
		}
		//#endregion
		//#region src/client/shared/lib/media.ts
		/** The URL for one file of one episode. */
		function mediaUrlFor(episode, file) {
			return `${episode.kind === "file" ? "/lingualab/file-media" : "/lingualab/media"}/${encodeURIComponent(episode.id)}/${encodeURIComponent(file)}`;
		}
		/** Every track of one episode, or `null` when it has no audio to play. */
		function mediaOf(episode) {
			if (episode.audio === null) return null;
			return {
				audioUrl: mediaUrlFor(episode, episode.audio),
				subtitleEnUrl: episode.subtitleEn === null ? null : mediaUrlFor(episode, episode.subtitleEn),
				subtitleZhUrl: episode.subtitleZh === null ? null : mediaUrlFor(episode, episode.subtitleZh)
			};
		}
		//#endregion
		//#region src/client/features/library/model/useLibrary.ts
		/**
		* Which episode is open, and its subtitles.
		*
		* Two things happen here and they are separate: the **library listing** (what the
		* picker offers) and the **open episode** (what the stage and the list show).
		* Opening goes through the host rather than through React state, because the host is
		* what remembers the choice and what knows where a file episode's bytes are.
		*
		* The cues are assembled here rather than in the page so the merge rule has one
		* home: an episode with one bilingual file parses it once, an episode with an
		* English and a Chinese track parses both and folds them together.
		*
		* The state keeps the episode id its cues belong to, and the returned list is empty
		* until they match. Without that, switching episodes would hand the player the
		* previous episode's cue list while the new subtitles were still in flight — and a
		* loop wrapping on a stale sentence is a wrong seek, not a cosmetic delay.
		*/
		const NOTHING_LOADED$1 = {
			id: null,
			cues: []
		};
		/**
		* The list handed out while the episode's subtitles are still in flight.
		*
		* One module-level constant, not a fresh `[]`: the page resets the player in an
		* effect keyed on this array, and a new identity on every render is an infinite
		* render loop, not a cosmetic detail.
		*/
		const NO_CUES = [];
		/**
		* The episode to open when the listing arrives.
		*
		* The reader's last choice wins, so a refresh lands where they left off. Otherwise
		* the scan's suggestion, and failing that the first folder and then the first loose
		* file — an empty library is the only case with nothing to open.
		*/
		function pickInitial(payload) {
			if (payload.currentEpisode !== null) return payload.currentEpisode;
			return payload.episodes.find((entry) => entry.id === payload.current) ?? payload.episodes[0] ?? payload.files[0] ?? null;
		}
		/** Load the library, then the open episode's subtitles. */
		function useLibrary() {
			const [payload, setPayload] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const [episode, setEpisode] = (0, react.useState)(null);
			const [media, setMedia] = (0, react.useState)(null);
			const [opening, setOpening] = (0, react.useState)(false);
			const [openError, setOpenError] = (0, react.useState)(null);
			const [loaded, setLoaded] = (0, react.useState)(NOTHING_LOADED$1);
			const [cuesLoading, setCuesLoading] = (0, react.useState)(false);
			const [reloadToken, setReloadToken] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				let cancelled = false;
				(async () => {
					setLoading(true);
					const next = await fetchLibrary();
					if (cancelled) return;
					setPayload(next);
					setError(next.ok ? null : next.reason);
					setEpisode((current) => {
						const chosen = current !== null && [...next.episodes, ...next.files].some((entry) => entry.id === current.id) ? current : pickInitial(next);
						setMedia(chosen === null ? null : mediaOf(chosen));
						return chosen;
					});
					setLoading(false);
				})();
				return () => {
					cancelled = true;
				};
			}, [reloadToken]);
			(0, react.useEffect)(() => {
				if (episode === null || media === null) return;
				const enUrl = media.subtitleEnUrl;
				const zhUrl = media.subtitleZhUrl;
				if (enUrl === null && zhUrl === null) return;
				let cancelled = false;
				(async () => {
					setCuesLoading(true);
					try {
						const english = enUrl === null ? [] : await fetchCues(enUrl, episode.subtitleEn ?? "");
						const chinese = zhUrl === null || zhUrl === enUrl ? [] : await fetchCues(zhUrl, episode.subtitleZh ?? "");
						if (cancelled) return;
						setLoaded({
							id: episode.id,
							cues: mergeBilingual(english, chinese)
						});
						setError(null);
					} catch (cause) {
						if (cancelled) return;
						setLoaded({
							id: episode.id,
							cues: []
						});
						setError(String(cause));
					} finally {
						if (!cancelled) setCuesLoading(false);
					}
				})();
				return () => {
					cancelled = true;
				};
			}, [episode, media]);
			/** One place both picks end: the host answers with the entry and its URLs. */
			const applyOpen = (0, react.useCallback)((result) => {
				if (!result.ok || result.episode === null) {
					setOpenError(result.reason ?? "打不开这一集");
					return false;
				}
				setOpenError(null);
				setEpisode(result.episode);
				setMedia(result.media ?? mediaOf(result.episode));
				return true;
			}, []);
			const openEpisode = (0, react.useCallback)(async (episodeId) => {
				setOpening(true);
				const result = await openEpisodeById(episodeId);
				setOpening(false);
				return applyOpen(result);
			}, [applyOpen]);
			const openFile = (0, react.useCallback)(async (place, rel) => {
				setOpening(true);
				const result = await openEpisodeFile(place, rel);
				setOpening(false);
				return applyOpen(result);
			}, [applyOpen]);
			const reload = (0, react.useCallback)(() => setReloadToken((token) => token + 1), []);
			return {
				payload,
				loading,
				error,
				episode,
				media,
				cues: episode !== null && loaded.id === episode.id ? loaded.cues : NO_CUES,
				cuesLoading,
				opening,
				openError,
				openEpisode,
				openFile,
				reload
			};
		}
		/** Whether another phrase fits, and what to do when it does not. */
		function phraseCapacity(phrases) {
			const remaining = Math.max(0, 7 - phrases.length);
			return {
				full: remaining === 0,
				remaining
			};
		}
		//#endregion
		//#region src/client/features/notes/model/useNotes.ts
		/**
		* The notes list for one episode, and the ceiling that gives it its point.
		*
		* Saving is debounced and whole-file: the panel writes after a pause in typing,
		* and each write replaces that episode's markdown. Two details are the difference
		* between "usually works" and "lost my notes once":
		*
		*   · every pending write is flushed when the episode changes, so an edit made
		*     half a second before switching is not thrown away with the timer;
		*   · the list is tagged with the episode it belongs to, and a mutation that
		*     arrives after a switch is dropped rather than written under the new id.
		*
		* The ceiling is enforced here so the UI can ask *which* phrase to replace, and
		* again in the host half so a client that skips the question is still refused.
		*/
		/** How long the panel waits after the last change before writing. */
		const SAVE_DEBOUNCE_MS = 600;
		const NOTHING_LOADED = {
			id: null,
			phrases: []
		};
		/** Same reason as `NO_CUES` in the library hook: a stable identity per render. */
		const NO_PHRASES = [];
		/** Load, edit and persist one episode's phrases. */
		function useNotes(episodeId) {
			const [loaded, setLoaded] = (0, react.useState)(NOTHING_LOADED);
			const [status, setStatus] = (0, react.useState)("idle");
			const [reason, setReason] = (0, react.useState)(null);
			/** The timer and the payload it will write, so a switch can flush them first. */
			const pending = (0, react.useRef)(null);
			/** Write what the timer was holding, right now. */
			const flush = (0, react.useCallback)(() => {
				const job = pending.current;
				pending.current = null;
				if (job === null) return;
				clearTimeout(job.timer);
				(async () => {
					const payload = await saveNotes(job.id, job.phrases);
					setReason(payload.reason);
					setStatus(payload.ok ? "saved" : "error");
				})();
			}, []);
			(0, react.useEffect)(() => {
				flush();
				if (episodeId === null) return;
				let cancelled = false;
				(async () => {
					const payload = await fetchNotes(episodeId);
					if (cancelled) return;
					setLoaded({
						id: episodeId,
						phrases: payload.phrases
					});
					setReason(payload.reason);
					setStatus(payload.ok ? "idle" : "error");
				})();
				return () => {
					cancelled = true;
				};
			}, [episodeId, flush]);
			const schedule = (0, react.useCallback)((next) => {
				const id = loaded.id;
				if (id === null) return;
				if (pending.current !== null) clearTimeout(pending.current.timer);
				setStatus("saving");
				const timer = setTimeout(() => {
					pending.current = null;
					(async () => {
						const payload = await saveNotes(id, next);
						setReason(payload.reason);
						setStatus(payload.ok ? "saved" : "error");
					})();
				}, SAVE_DEBOUNCE_MS);
				pending.current = {
					id,
					phrases: next,
					timer
				};
			}, [loaded.id]);
			const mutate = (0, react.useCallback)((update) => {
				if (loaded.id === null || loaded.id !== episodeId) return;
				const next = update(loaded.phrases);
				setLoaded({
					id: loaded.id,
					phrases: next
				});
				schedule(next);
			}, [
				episodeId,
				loaded,
				schedule
			]);
			const visible = loaded.id === episodeId ? loaded.phrases : NO_PHRASES;
			const capacity = phraseCapacity(visible);
			const add = (0, react.useCallback)((phrase) => {
				if (capacity.full) return false;
				mutate((current) => [...current, phrase]);
				return true;
			}, [capacity.full, mutate]);
			const replaceAt = (0, react.useCallback)((index, phrase) => {
				mutate((current) => current.map((item, at) => at === index ? phrase : item));
			}, [mutate]);
			const update = (0, react.useCallback)((index, patch) => {
				mutate((current) => current.map((item, at) => at === index ? {
					...item,
					...patch
				} : item));
			}, [mutate]);
			const remove = (0, react.useCallback)((index) => {
				mutate((current) => current.filter((_, at) => at !== index));
			}, [mutate]);
			return {
				phrases: visible,
				status,
				reason,
				full: capacity.full,
				remaining: capacity.remaining,
				add,
				replaceAt,
				update,
				remove
			};
		}
		//#endregion
		//#region node_modules/zustand/esm/vanilla.mjs
		const createStoreImpl = (createState) => {
			let state;
			const listeners = /* @__PURE__ */ new Set();
			const setState = (partial, replace) => {
				const nextState = typeof partial === "function" ? partial(state) : partial;
				if (!Object.is(nextState, state)) {
					const previousState = state;
					state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
					listeners.forEach((listener) => listener(state, previousState));
				}
			};
			const getState = () => state;
			const getInitialState = () => initialState;
			const subscribe = (listener) => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			};
			const api = {
				setState,
				getState,
				getInitialState,
				subscribe
			};
			const initialState = state = createState(setState, getState, api);
			return api;
		};
		const createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);
		//#endregion
		//#region node_modules/zustand/esm/react.mjs
		const identity = (arg) => arg;
		function useStore(api, selector = identity) {
			const slice = react.default.useSyncExternalStore(api.subscribe, react.default.useCallback(() => selector(api.getState()), [api, selector]), react.default.useCallback(() => selector(api.getInitialState()), [api, selector]));
			react.default.useDebugValue(slice);
			return slice;
		}
		const createImpl = (createState) => {
			const api = createStore(createState);
			const useBoundStore = (selector) => useStore(api, selector);
			Object.assign(useBoundStore, api);
			return useBoundStore;
		};
		const create = ((createState) => createState ? createImpl(createState) : createImpl);
		//#endregion
		//#region src/client/features/media-player/lib/loop.ts
		/**
		* Only float jitter is forgiven here. The value is deliberately tiny: a generous
		* tolerance would wrap the loop before the last syllable and cut it off, which is
		* exactly the artefact this whole feature exists to avoid.
		*/
		const END_TOLERANCE_SECONDS = .01;
		/** The window being repeated, or `null` when nothing is. */
		function loopWindow(input) {
			if (input.mode === "sentence") {
				const { cueStart, cueEnd } = input;
				if (cueStart === null || cueEnd === null || cueEnd <= cueStart) return null;
				return {
					start: cueStart,
					end: cueEnd
				};
			}
			if (input.mode === "ab") {
				const { pointA, pointB } = input;
				if (pointA === null || pointB === null || pointB <= pointA) return null;
				return {
					start: pointA,
					end: pointB
				};
			}
			return null;
		}
		/** Decide whether this tick wraps, stops, or does nothing. */
		function planLoop(input) {
			const window = loopWindow(input);
			if (window === null) return {
				seekTo: null,
				stop: false,
				playsDone: input.playsDone
			};
			if (input.time < window.end - END_TOLERANCE_SECONDS) return {
				seekTo: null,
				stop: false,
				playsDone: input.playsDone
			};
			const playsDone = input.playsDone + 1;
			if (input.repeats > 0 && playsDone >= input.repeats) return {
				seekTo: null,
				stop: true,
				playsDone
			};
			return {
				seekTo: window.start,
				stop: false,
				playsDone
			};
		}
		/** Where the player should jump when the user asks for "the previous sentence". */
		function stepCueIndex(currentIndex, delta, cueCount) {
			if (cueCount === 0) return -1;
			const next = currentIndex + delta;
			if (next < 0) return 0;
			if (next > cueCount - 1) return cueCount - 1;
			return next;
		}
		//#endregion
		//#region src/client/features/media-player/model/store.ts
		/**
		* Player state, and the rules that keep the scrubber honest.
		*
		* Two things here are worth reading before changing anything.
		*
		* **The seek gate.** When playback is moved programmatically, the browser keeps
		* emitting `timeupdate` for the position it had a moment ago. Written straight
		* through, that stale value puts the scrubber back where it was, and — worse — a
		* loop that wraps on it counts a pass that never played and can stop a repeat
		* early. So a programmatic seek raises a guard, every reported position is
		* dropped while the guard is up, and the guard comes down on the element's own
		* `seeked` event (see `useAudioBinding`). A timeout backs it up, because a seek
		* that never completes must not freeze the clock forever.
		*
		* **The loop decision.** Wrapping is delegated to {@link planLoop}, a pure
		* function with its own tests. This file owns the state it reads and the effects
		* it implies, nothing else.
		*/
		/** Ten steps, all of them pitch-preserving. Ported from the repealed repeater app. */
		const SPEED_PRESETS = [
			.5,
			.6,
			.7,
			.8,
			.9,
			1,
			1.15,
			1.25,
			1.5,
			2
		];
		/** How long a programmatic seek may keep ignoring reported positions. */
		const SEEK_GUARD_MS = 1200;
		/** How many times a wrap repeats before the loop stops by itself. `0` is endless. */
		const DEFAULT_REPEATS = 0;
		/** Clamp a speed index into range. */
		function clampSpeed(index) {
			if (!Number.isFinite(index)) return 5;
			return Math.min(SPEED_PRESETS.length - 1, Math.max(0, Math.trunc(index)));
		}
		const useMediaPlayer = create((set, get) => ({
			cues: [],
			activeIndex: -1,
			isPlaying: false,
			currentTime: 0,
			duration: 0,
			speedIndex: 5,
			loopMode: "none",
			repeats: DEFAULT_REPEATS,
			playsDone: 0,
			pointA: null,
			pointB: null,
			seekRequest: null,
			seekToken: 0,
			guard: null,
			reset: (cues) => set((state) => ({
				cues,
				activeIndex: findActiveCue(cues, 0),
				isPlaying: false,
				currentTime: 0,
				duration: 0,
				loopMode: "none",
				repeats: DEFAULT_REPEATS,
				playsDone: 0,
				pointA: null,
				pointB: null,
				seekRequest: null,
				seekToken: state.seekToken + 1,
				guard: null
			})),
			setPlaying: (playing) => set({ isPlaying: playing }),
			toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
			seek: (time) => set((state) => ({
				seekRequest: Math.max(0, time),
				seekToken: state.seekToken + 1,
				currentTime: Math.max(0, time),
				activeIndex: findActiveCue(state.cues, time),
				guard: {
					target: Math.max(0, time),
					expiresAt: Date.now() + SEEK_GUARD_MS
				}
			})),
			onTime: (time) => {
				const { guard, cues } = get();
				if (guard !== null) {
					if (Date.now() <= guard.expiresAt) return;
					set({ guard: null });
				}
				const state = get();
				const decision = planLoop({
					time,
					mode: state.loopMode,
					cueStart: state.cues[state.activeIndex]?.start ?? null,
					cueEnd: state.cues[state.activeIndex]?.end ?? null,
					pointA: state.pointA,
					pointB: state.pointB,
					repeats: state.repeats,
					playsDone: state.playsDone
				});
				if (decision.stop) {
					const window = loopWindow({
						mode: state.loopMode,
						cueStart: state.cues[state.activeIndex]?.start ?? null,
						cueEnd: state.cues[state.activeIndex]?.end ?? null,
						pointA: state.pointA,
						pointB: state.pointB
					});
					set({
						isPlaying: false,
						playsDone: decision.playsDone
					});
					if (window !== null) get().seek(window.start);
					return;
				}
				if (decision.seekTo !== null) {
					get().seek(decision.seekTo);
					set({ playsDone: decision.playsDone });
					return;
				}
				set({
					currentTime: time,
					activeIndex: findActiveCue(cues, time)
				});
			},
			clearGuard: () => set({ guard: null }),
			setDuration: (duration) => set({ duration: Number.isFinite(duration) ? duration : 0 }),
			setSpeedIndex: (index) => set({ speedIndex: clampSpeed(index) }),
			cycleSpeed: (delta) => set((state) => ({ speedIndex: clampSpeed(state.speedIndex + delta) })),
			setLoopMode: (mode) => set({
				loopMode: mode,
				playsDone: 0,
				isPlaying: mode === "none" ? get().isPlaying : true
			}),
			loopSentence: (index) => {
				const state = get();
				const target = index ?? state.activeIndex;
				const cue = state.cues[target];
				if (cue === void 0) return;
				set({
					activeIndex: target,
					loopMode: "sentence",
					playsDone: 0
				});
				state.seek(cue.start);
				set({ isPlaying: true });
			},
			setPoint: (which) => {
				const state = get();
				const time = state.currentTime;
				if (which === "a") {
					set({
						pointA: time,
						loopMode: "ab",
						playsDone: 0
					});
					return;
				}
				if (state.pointA !== null && time <= state.pointA) return;
				set({
					pointB: time,
					loopMode: "ab",
					playsDone: 0
				});
			},
			clearAB: () => set({
				pointA: null,
				pointB: null,
				loopMode: "none",
				playsDone: 0
			}),
			setRepeats: (repeats) => set({
				repeats: Math.max(0, Math.trunc(repeats)),
				playsDone: 0
			}),
			stepCue: (delta) => {
				const state = get();
				const next = stepCueIndex(state.activeIndex, delta, state.cues.length);
				const cue = state.cues[next];
				if (cue === void 0) return;
				set({
					activeIndex: next,
					playsDone: 0
				});
				state.seek(cue.start);
			}
		}));
		/** The speed currently in effect. */
		function currentSpeed(state) {
			return SPEED_PRESETS[state.speedIndex] ?? 1;
		}
		//#endregion
		//#region src/client/features/media-player/lib/useAudioBinding.ts
		/**
		* Binding the store to one `<audio>` element.
		*
		* The element is the only thing that actually plays, so it owns the browser
		* events and the store owns the intent; this hook is the wire between them. Every
		* write to the element is derived from store state, which is what makes the panel
		* renderable from the store alone — the page never reads `audio.currentTime`
		* during render.
		*/
		/**
		* Create the audio element ref and keep it in step with the store.
		*
		* @param src Media URL of the current episode's audio, or `null` while loading.
		* @returns The ref to attach.
		*/
		function useAudioBinding(src) {
			const ref = (0, react.useRef)(null);
			const isPlaying = useMediaPlayer((state) => state.isPlaying);
			const speed = useMediaPlayer(currentSpeed);
			const seekRequest = useMediaPlayer((state) => state.seekRequest);
			const seekToken = useMediaPlayer((state) => state.seekToken);
			/** The last seek request this element has been given, so a source change cannot re-apply one. */
			const appliedSeek = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				const audio = ref.current;
				appliedSeek.current = useMediaPlayer.getState().seekToken;
				if (audio === null) return;
				if (src === null) {
					audio.removeAttribute("src");
					audio.load();
					return;
				}
				audio.src = src;
				audio.load();
			}, [src]);
			(0, react.useEffect)(() => {
				const audio = ref.current;
				if (audio === null) return;
				if (!isPlaying) {
					audio.pause();
					return;
				}
				audio.play().catch(() => useMediaPlayer.getState().setPlaying(false));
			}, [isPlaying, src]);
			(0, react.useEffect)(() => {
				const audio = ref.current;
				if (audio === null) return;
				audio.playbackRate = speed;
				audio.preservesPitch = true;
			}, [speed, src]);
			(0, react.useEffect)(() => {
				const audio = ref.current;
				if (audio === null || seekRequest === null || seekToken === appliedSeek.current) return;
				appliedSeek.current = seekToken;
				audio.currentTime = seekRequest;
			}, [seekToken, seekRequest]);
			(0, react.useEffect)(() => {
				const audio = ref.current;
				if (audio === null) return;
				const store = useMediaPlayer.getState;
				const onTime = () => store().onTime(audio.currentTime);
				const onMeta = () => store().setDuration(audio.duration);
				const onEnded = () => store().setPlaying(false);
				const onError = () => store().setPlaying(false);
				const onSeeked = () => store().clearGuard();
				audio.addEventListener("timeupdate", onTime);
				audio.addEventListener("loadedmetadata", onMeta);
				audio.addEventListener("durationchange", onMeta);
				audio.addEventListener("seeked", onSeeked);
				audio.addEventListener("ended", onEnded);
				audio.addEventListener("error", onError);
				return () => {
					audio.removeEventListener("timeupdate", onTime);
					audio.removeEventListener("loadedmetadata", onMeta);
					audio.removeEventListener("durationchange", onMeta);
					audio.removeEventListener("seeked", onSeeked);
					audio.removeEventListener("ended", onEnded);
					audio.removeEventListener("error", onError);
				};
			}, [src]);
			return ref;
		}
		//#endregion
		//#region src/client/shared/lib/format.ts
		/**
		* Small formatting helpers shared by the panels.
		*/
		/** `03:41` — clock format for a position inside an episode. */
		function formatClock(seconds) {
			if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
			const total = Math.floor(seconds);
			const hours = Math.floor(total / 3600);
			const minutes = Math.floor(total % 3600 / 60);
			const secs = total % 60;
			const mm = String(minutes).padStart(2, "0");
			const ss = String(secs).padStart(2, "0");
			return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
		}
		/** `18.4 MB`, for the size hint next to an episode's audio. */
		function formatBytes(bytes) {
			if (bytes === null || !Number.isFinite(bytes)) return "";
			if (bytes < 1024) return `${bytes} B`;
			const units = [
				"KB",
				"MB",
				"GB"
			];
			let value = bytes / 1024;
			let unit = 0;
			while (value >= 1024 && unit < units.length - 1) {
				value /= 1024;
				unit += 1;
			}
			return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
		}
		//#endregion
		//#region src/client/shared/lib/styles.ts
		/**
		* The page stylesheet, rendered as an element by the page.
		*
		* Same rule as the other panels in this workspace: read the host's
		* `--dsw-alias-*` theme tokens and keep a fallback for each, so the page follows
		* the active theme without importing a single Harness Client package. Class names
		* carry the plugin prefix because a stylesheet rendered into the host document is
		* not scoped by anything.
		*
		* The shape is four horizontal bands rather than cards: a fixed top bar, a stage
		* that holds the sentence being worked on, the subtitle list as the only scroller,
		* and a one-line keyboard reminder. Cards were what made the previous version read
		* as a settings page — every block weighed the same, so nothing led.
		*/
		const STYLES = `
.dsh-lingualab-page{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;
  background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-label-primary,inherit);
  font-size:14px;line-height:1.5;outline:none}
.dsh-lingualab-page:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-alias-brand-primary,#4d6bfe)}

/* ── top bar ─────────────────────────────────────────────────── */
.dsh-lingualab-top{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-episode{display:flex;align-items:baseline;gap:8px;min-width:0;max-width:380px;padding:5px 10px;
  border:0;border-radius:8px;background:none;color:inherit;font:inherit;font-weight:600;cursor:pointer;text-align:left}
.dsh-lingualab-episode:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.1))}
.dsh-lingualab-episode-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-episode-caret{color:var(--dsw-alias-label-tertiary,#8a8f98);font-size:11px}
.dsh-lingualab-spacer{flex:1;min-width:8px}
.dsh-lingualab-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));background:none;cursor:pointer;
  color:var(--dsw-alias-label-secondary,#8a8f98);font:inherit;font-size:12px;white-space:nowrap}
.dsh-lingualab-chip:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12));
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-chip.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-chip:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  padding:0;border:0;border-radius:8px;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer}
.dsh-lingualab-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12));
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-icon-btn:disabled{opacity:0.4;cursor:default}

/* ── stage: the sentence being worked on ─────────────────────── */
.dsh-lingualab-stage{flex:none;display:flex;flex-direction:column;gap:10px;padding:14px 20px 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-stage-meta{display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--dsw-alias-label-tertiary,#8a8f98);font-variant-numeric:tabular-nums}
.dsh-lingualab-stage-en{font-size:20px;line-height:1.35;font-weight:600;max-height:5.4em;overflow:auto;
  word-break:break-word}
.dsh-lingualab-stage-zh{margin-top:4px;font-size:14px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-stage-zh.is-hidden{display:none}
.dsh-lingualab-transport{display:flex;align-items:center;gap:8px;overflow:hidden}
.dsh-lingualab-play{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;flex:none;
  border:0;border-radius:999px;background:var(--dsw-alias-brand-primary,#4d6bfe);color:#fff;cursor:pointer}
.dsh-lingualab-play:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-bar-btn{display:inline-flex;align-items:center;justify-content:center;height:36px;min-width:36px;
  padding:0 8px;border:0.5px solid transparent;border-radius:9px;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);
  cursor:pointer;font:inherit;font-size:12px;white-space:nowrap}
.dsh-lingualab-bar-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12));
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-bar-btn.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-bar-btn:disabled{opacity:0.4;cursor:default}
/* The sentence's own progress. It takes a fixed slice rather than all the slack: a
   flexible bar would push the modes to the far edge of a wide page, away from the
   sentence they act on. */
.dsh-lingualab-progress{position:relative;flex:0 1 140px;min-width:48px;height:3px;border-radius:999px;
  background:var(--dsw-alias-bg-layer-3,rgba(127,127,127,0.18))}
.dsh-lingualab-progress-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-time{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);font-variant-numeric:tabular-nums}

/* ── subtitle list: the only scroller ────────────────────────── */
.dsh-lingualab-mid{position:relative;display:flex;flex:1;min-height:0}
.dsh-lingualab-list{flex:1;min-width:0;min-height:0;overflow:auto;padding:4px 0}
.dsh-lingualab-row{display:grid;grid-template-columns:76px minmax(0,1fr) auto;gap:12px;align-items:start;
  padding:8px 16px;cursor:pointer;border-left:2px solid transparent}
.dsh-lingualab-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.09))}
.dsh-lingualab-row.is-active{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12));
  border-left-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-row-time{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);
  font-variant-numeric:tabular-nums;padding-top:2px}
.dsh-lingualab-row-en{min-width:0;word-break:break-word;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-en{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-row-zh{margin-top:2px;font-size:12.5px;color:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-zh{color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-row-actions{display:flex;align-items:center;gap:4px;opacity:0;visibility:hidden;
  transition:opacity .12s ease}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions,.dsh-lingualab-row.is-active .dsh-lingualab-row-actions{
  opacity:1;visibility:visible}
.dsh-lingualab-row-flag{font-size:11px;color:var(--dsw-alias-state-warn-primary,#b7791f)}

/* ── bottom bar ──────────────────────────────────────────────── */
.dsh-lingualab-foot{flex:none;display:flex;align-items:center;gap:12px;height:32px;padding:0 16px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98)}

/* ── notes layer (a side panel; an overlay on a narrow page) ─── */
.dsh-lingualab-notes{display:flex;flex-direction:column;width:300px;flex:none;min-height:0;
  border-left:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,0.04))}
.dsh-lingualab-notes-head{display:flex;align-items:center;gap:8px;padding:10px 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.18));font-weight:600;font-size:13px}
.dsh-lingualab-notes-body{flex:1;min-height:0;overflow:auto;padding:8px 12px}
.dsh-lingualab-note{display:flex;gap:8px;padding:8px 0;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.16))}
.dsh-lingualab-note:last-of-type{border-bottom:0}
.dsh-lingualab-note-main{flex:1;min-width:0}
.dsh-lingualab-note-at{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);cursor:pointer;
  font-variant-numeric:tabular-nums;background:none;border:0;padding:0;font-family:inherit}
.dsh-lingualab-note-at:hover{color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-note-text{display:block;word-break:break-word}
.dsh-lingualab-note-zh{font-size:12.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-note-note{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);font-style:italic}
.dsh-lingualab-note-actions{display:flex;align-items:center;gap:4px}
.dsh-lingualab-note .dsh-lingualab-row-actions{opacity:1;visibility:visible}
.dsh-lingualab-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.dsh-lingualab-tag{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));background:none;color:inherit;
  cursor:pointer;font:inherit;font-size:11px;padding:0 7px;border-radius:999px}
.dsh-lingualab-tag.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:#fff}
.dsh-lingualab-composer{display:flex;flex-direction:column;gap:8px;padding:10px 12px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-composer-quote{font-size:13px;color:var(--dsw-alias-label-primary,inherit);max-height:3.6em;overflow:auto}
.dsh-lingualab-composer-actions{display:flex;align-items:center;gap:8px}
@media (max-width:1100px){
  .dsh-lingualab-notes{position:absolute;top:0;right:0;bottom:0;z-index:12;
    background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f))}
}

/* ── layers: picker, media folder, steps ─────────────────────── */
.dsh-lingualab-mask{position:absolute;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;
  padding:44px 24px;background:var(--dsw-alias-bg-mask-1,rgba(0,0,0,0.35))}
.dsh-lingualab-modal{display:flex;flex-direction:column;width:min(620px,100%);max-height:100%;overflow:hidden;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:14px;
  background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f));
  box-shadow:0 18px 48px rgba(0,0,0,0.35)}
.dsh-lingualab-modal-head{display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-modal-title{font-weight:600;font-size:14px}
.dsh-lingualab-tabs{display:flex;gap:4px;padding:8px 14px 0}
.dsh-lingualab-tab{border:0;border-bottom:2px solid transparent;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);
  cursor:pointer;font:inherit;font-size:13px;padding:6px 8px}
.dsh-lingualab-tab.is-on{border-bottom-color:var(--dsw-alias-brand-primary,#4d6bfe);
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-modal-body{flex:1;min-height:0;overflow:auto;padding:8px 10px 12px}
.dsh-lingualab-input{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.1));
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));border-radius:8px;color:inherit;
  font:inherit;font-size:13px;padding:6px 9px}
.dsh-lingualab-pick{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:7px 9px;
  border:0;border-radius:8px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.dsh-lingualab-pick:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12))}
.dsh-lingualab-pick.is-current{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12))}
.dsh-lingualab-pick-main{flex:1;min-width:0}
.dsh-lingualab-pick-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-pick-sub{display:block;font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-badge{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary,#8a8f98);
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));border-radius:999px;padding:1px 7px}
.dsh-lingualab-group{margin:10px 4px 4px;font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-empty{color:var(--dsw-alias-label-tertiary,#8a8f98);padding:14px 12px;font-size:13px}
.dsh-lingualab-warn{color:var(--dsw-alias-state-warn-primary,#b7791f);font-size:12.5px;padding:6px 12px}
.dsh-lingualab-error{color:var(--dsw-alias-state-error-primary,#c53030);font-size:12.5px;padding:6px 12px}
.dsh-lingualab-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));background:none;color:inherit;
  font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.dsh-lingualab-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12))}
.dsh-lingualab-btn.is-primary{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:#fff}
.dsh-lingualab-btn:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-popover{position:absolute;top:44px;right:12px;z-index:25;width:300px;padding:8px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:12px;
  background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f));
  box-shadow:0 18px 48px rgba(0,0,0,0.35)}

/* ── five steps ──────────────────────────────────────────────── */
.dsh-lingualab-steps{display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-step{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;
  border:0;background:none;color:inherit;font:inherit;text-align:left;width:100%}
.dsh-lingualab-step:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12))}
.dsh-lingualab-step.is-current{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12))}
.dsh-lingualab-step.is-done .dsh-lingualab-step-label{text-decoration:line-through;
  color:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-step-label{flex:1;min-width:0}
.dsh-lingualab-step-mins{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);
  font-variant-numeric:tabular-nums}

/* ── whole-page states: empty library, settings ──────────────── */
.dsh-lingualab-blank{display:flex;flex:1;min-height:0;flex-direction:column;align-items:center;
  justify-content:center;gap:12px;padding:24px}
.dsh-lingualab-blank-card{width:min(520px,100%);display:flex;flex-direction:column;gap:10px}
.dsh-lingualab-blank h1{margin:0;font-size:20px;font-weight:600}
.dsh-lingualab-hint{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;
  word-break:break-all}
.dsh-lingualab-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

.dsh-lingualab-cards{display:flex;flex-direction:column;gap:10px}
.dsh-lingualab-card{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));border-radius:12px;
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,0.04));padding:12px 14px}
.dsh-lingualab-card h2{margin:0 0 8px;font-size:14px;font-weight:600}
.dsh-lingualab-counter{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);font-variant-numeric:tabular-nums}
`;
		//#endregion
		//#region src/client/shared/ui/icons.tsx
		/** Shared geometry: one viewBox, one stroke weight, one set of caps. */
		function Svg({ size = 16, children, ...rest }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.5,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": true,
				...rest,
				children
			});
		}
		function PlayIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M5 3.4 12.5 8 5 12.6Z",
					fill: "currentColor",
					stroke: "none"
				})
			});
		}
		function PauseIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: 4.5,
					y: 3.5,
					width: 2.6,
					height: 9,
					rx: .8,
					fill: "currentColor",
					stroke: "none"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: 8.9,
					y: 3.5,
					width: 2.6,
					height: 9,
					rx: .8,
					fill: "currentColor",
					stroke: "none"
				})]
			});
		}
		function PrevIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M12 3.6 5.5 8 12 12.4Z",
					fill: "currentColor",
					stroke: "none"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 4v8" })]
			});
		}
		function NextIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M4 3.6 10.5 8 4 12.4Z",
					fill: "currentColor",
					stroke: "none"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 4v8" })]
			});
		}
		function LoopIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 8a5 5 0 0 1 8.6-3.4M13 8a5 5 0 0 1-8.6 3.4" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11.4 2.6v2.4H9M4.6 13.4V11H7" })]
			});
		}
		function NoteIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 2.8h8v10.4L8 10.6l-4 2.6Z" })
			});
		}
		function CloseIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 4l8 8M12 4l-8 8" })
			});
		}
		function ChevronIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 4l4 4-4 4" })
			});
		}
		function FolderIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 4.2h4l1.2 1.6h5.8v6.4a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1Z" })
			});
		}
		function AudioIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6.5 11.5V4.2l5-1v7.3" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 5,
						cy: 12,
						r: 1.6
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 10,
						cy: 11,
						r: 1.6
					})
				]
			});
		}
		function SubtitleIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: 2.2,
					y: 4,
					width: 11.6,
					height: 8,
					rx: 1.4
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4.8 9.4h2.2M9 9.4h2.2" })]
			});
		}
		//#endregion
		//#region src/client/widgets/control-bar/ui/ControlBar.tsx
		/**
		* The transport row at the bottom of the stage.
		*
		* It sits under the sentence rather than in a bar of its own, because "play this
		* sentence again" and "which sentence" are one thought. Order follows frequency:
		* sentence steps, play, then the sentence's own progress, then the modes that change
		* what the next pass sounds like — speed, loop, A-B — and finally the one action that
		* leaves the player alone, `记下`.
		*
		* The modes are chips, not form controls: a chip says its state by being outlined,
		* which a `<select>` cannot do, and the two dropdowns that used to live here were the
		* main reason the row wrapped on a narrow page.
		*/
		/** Repeat counts offered while an A-B loop is on; `0` means until stopped. */
		const REPEAT_CHOICES = [
			0,
			1,
			2,
			3,
			5
		];
		/** Labels for the four Chinese display modes, in the order they are offered. */
		const ZH_MODE_KEYS = {
			always: "zhAlways",
			dim: "zhDim",
			"active-only": "zhActiveOnly",
			hidden: "zhHidden"
		};
		/** The row under the sentence. */
		function ControlBar({ t, zhMode, onZhMode, onRecord, disabled = false }) {
			const isPlaying = useMediaPlayer((state) => state.isPlaying);
			const currentTime = useMediaPlayer((state) => state.currentTime);
			const speedIndex = useMediaPlayer((state) => state.speedIndex);
			const loopMode = useMediaPlayer((state) => state.loopMode);
			const repeats = useMediaPlayer((state) => state.repeats);
			const pointA = useMediaPlayer((state) => state.pointA);
			const pointB = useMediaPlayer((state) => state.pointB);
			const cues = useMediaPlayer((state) => state.cues);
			const activeIndex = useMediaPlayer((state) => state.activeIndex);
			const store = useMediaPlayer.getState;
			const cue = cues[activeIndex];
			const start = cue?.start ?? 0;
			const end = cue?.end ?? 0;
			const span = Math.max(.001, end - start);
			const within = Math.min(1, Math.max(0, (currentTime - start) / span));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-transport",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-bar-btn",
						onClick: () => store().stepCue(-1),
						disabled,
						title: t("prevCue"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PrevIcon, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-play",
						onClick: () => store().toggle(),
						disabled,
						title: isPlaying ? t("pause") : t("play"),
						children: isPlaying ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PauseIcon, { size: 18 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlayIcon, { size: 18 })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-bar-btn",
						onClick: () => store().stepCue(1),
						disabled,
						title: t("nextCue"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NextIcon, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-time",
						children: [
							formatClock(currentTime),
							" / ",
							formatClock(end)
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-progress",
						title: `${formatClock(start)} – ${formatClock(end)}`,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-progress-fill",
							style: { width: `${String(within * 100)}%` }
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dsh-lingualab-bar-btn",
						onClick: () => store().cycleSpeed(1),
						disabled,
						title: t("speed"),
						children: [SPEED_PRESETS[speedIndex] ?? 1, "×"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `dsh-lingualab-bar-btn${loopMode === "sentence" ? " is-on" : ""}`,
						onClick: () => loopMode === "sentence" ? store().setLoopMode("none") : store().loopSentence(),
						disabled,
						title: t("loopSentence"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(LoopIcon, {}),
							" ",
							t("loopShort")
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: `dsh-lingualab-bar-btn${pointA !== null ? " is-on" : ""}`,
						onClick: () => pointA === null ? store().setPoint("a") : store().clearAB(),
						disabled,
						title: pointA === null ? t("setA") : t("clearAb"),
						children: "A"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: `dsh-lingualab-bar-btn${pointB !== null ? " is-on" : ""}`,
						onClick: () => store().setPoint("b"),
						disabled,
						title: t("setB"),
						children: "B"
					}),
					pointA !== null || pointB !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-time",
						title: t("loopAb"),
						children: [
							pointA === null ? "–" : formatClock(pointA),
							"–",
							pointB === null ? "–" : formatClock(pointB)
						]
					}) : null,
					loopMode === "ab" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						className: "dsh-lingualab-bar-btn",
						value: String(repeats),
						onChange: (event) => store().setRepeats(Number(event.target.value)),
						title: t("loopAb"),
						disabled,
						children: REPEAT_CHOICES.map((count) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: count,
							children: count === 0 ? "∞" : `×${count}`
						}, count))
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-bar-btn",
						onClick: () => onZhMode(nextZhMode(zhMode)),
						title: t("zhMode"),
						children: t(ZH_MODE_KEYS[zhMode])
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dsh-lingualab-bar-btn",
						onClick: onRecord,
						disabled,
						title: t("recordHint"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteIcon, {}),
							" ",
							t("recordThis")
						]
					})
				]
			});
		}
		/** The next Chinese mode in the cycle: the chip shows one name and means "the next one". */
		function nextZhMode(mode) {
			const index = SUBTITLE_ZH_MODES.indexOf(mode);
			return SUBTITLE_ZH_MODES[(index + 1) % SUBTITLE_ZH_MODES.length] ?? "dim";
		}
		//#endregion
		//#region src/client/widgets/episode-picker/model/usePicker.ts
		/**
		* The picker's data: which places exist, and what is inside the one being browsed.
		*
		* Kept apart from the picker's markup because these are two different questions with
		* two different failure modes. Places come once per open and rarely change; a directory
		* listing changes under you (the reader is copying files in by hand) and is the one that
		* can be slow, so it is fetched per directory with a small debounce on the filter.
		*
		* The chosen place and relative path are the picker's own memory: closing and reopening
		* the layer returns to the directory you were in, not to the root. That memory is
		* deliberately not persisted — it is where you were looking, not what you opened.
		*/
		/** How long the filter box waits before it asks the host again. */
		const FILTER_DEBOUNCE_MS = 250;
		/** Places plus the listing of the directory currently being browsed. */
		function usePicker(open) {
			const [places, setPlaces] = (0, react.useState)([]);
			const [placeId, setPlaceId] = (0, react.useState)(null);
			const [rel, setRel] = (0, react.useState)("");
			const [query, setQuery] = (0, react.useState)("");
			const [entries, setEntries] = (0, react.useState)([]);
			const [summary, setSummary] = (0, react.useState)({
				dirs: 0,
				audio: 0,
				subtitles: 0,
				other: 0
			});
			const [truncated, setTruncated] = (0, react.useState)(false);
			const [folderEpisode, setFolderEpisode] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const loadedPlaces = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				if (!open || loadedPlaces.current) return;
				loadedPlaces.current = true;
				(async () => {
					const payload = await fetchPlaces();
					setPlaces(payload.places);
					const first = payload.places.find((entry) => entry.readable) ?? payload.places[0] ?? null;
					setPlaceId((current) => current ?? first?.id ?? null);
					setRel((current) => current === "" && first?.suggested === true ? first.conventionRel ?? "" : current);
				})();
			}, [open]);
			(0, react.useEffect)(() => {
				if (!open || placeId === null) return;
				let cancelled = false;
				const timer = setTimeout(() => {
					(async () => {
						setLoading(true);
						const payload = await fetchBrowse(placeId, rel, query);
						if (cancelled) return;
						setLoading(false);
						setError(payload.ok ? null : payload.reason);
						setEntries(payload.entries);
						setSummary(payload.summary);
						setTruncated(payload.page.truncated);
						setFolderEpisode(payload.folderEpisode);
					})();
				}, query.trim().length > 0 ? FILTER_DEBOUNCE_MS : 0);
				return () => {
					cancelled = true;
					clearTimeout(timer);
				};
			}, [
				open,
				placeId,
				rel,
				query
			]);
			const enter = (0, react.useCallback)((nextPlaceId, nextRel) => {
				setPlaceId(nextPlaceId);
				setRel(nextRel);
				setQuery("");
			}, []);
			const up = (0, react.useCallback)(() => {
				setRel((current) => {
					const parts = current.split("/").filter((part) => part.length > 0);
					parts.pop();
					return parts.join("/");
				});
			}, []);
			return {
				places,
				place: places.find((entry) => entry.id === placeId) ?? null,
				rel,
				entries,
				summary,
				truncated,
				folderEpisode,
				loading,
				error,
				query,
				setQuery,
				enter,
				up
			};
		}
		//#endregion
		//#region src/client/widgets/episode-picker/ui/EpisodePicker.tsx
		/**
		* The picker: one layer, two ways in.
		*
		* 「媒体库」 is for the thing you do most — switch to another episode of a library that
		* is already set up — so it opens first and lists what the scan knows: episode folders,
		* and audio files sitting loose in the root. 「浏览」 is for the thing that used to be
		* impossible: reach into a directory and open a single audio file, subtitles and all,
		* without copying it anywhere or typing an absolute path.
		*
		* The rows say what the previous `<select>` could not: whether an episode has audio,
		* whether subtitles were found, and which files those are. Picking therefore becomes a
		* reading decision rather than a guess.
		*/
		/** The badge one library row shows about its subtitles. */
		function subtitleBadge(t, entry) {
			if (entry.audio === null) return t("pickerNoAudio");
			if (entry.subtitleEn !== null && entry.subtitleZh !== null) return t("subtitleBadgeBoth");
			if (entry.subtitleEn !== null) return t("subtitleBadgeEn");
			if (entry.subtitleZh !== null) return t("subtitleBadgeZh");
			return t("subtitleBadgeNone");
		}
		/** What the browse list says about one audio file's subtitle pairing. */
		function hintBadge(t, hint) {
			if (hint === null || hint.state === "none") return t("subtitleBadgeNone");
			if (hint.state === "both") return t("subtitleBadgeBoth");
			if (hint.state === "en") return t("subtitleBadgeEn");
			if (hint.state === "zh") return t("subtitleBadgeZh");
			return t("subtitleBadgeUnknown");
		}
		/** The one line under a library row: the files behind it. */
		function episodeSub(entry) {
			const parts = [];
			if (entry.audio !== null) parts.push(entry.audio);
			if (entry.subtitleEn !== null) parts.push(entry.subtitleEn);
			if (entry.subtitleZh !== null && entry.subtitleZh !== entry.subtitleEn) parts.push(entry.subtitleZh);
			return parts.join(" · ");
		}
		/** The picker layer. */
		function EpisodePicker({ t, onClose, library, currentId, opening, openError, onOpenEpisode, onOpenFile, onUseFolder, savingFolder }) {
			const picker = usePicker(true);
			const [tab, setTab] = (0, react.useState)("library");
			const pickFile = (rel) => {
				if (picker.place === null) return;
				onOpenFile(picker.place.id, rel);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-mask",
				onClick: onClose,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-modal",
					onClick: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-modal-head",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-modal-title",
									children: t("pickerTitle")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
								opening ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dsh-lingualab-counter",
									children: [t("pickerLoading"), "…"]
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-icon-btn",
									onClick: onClose,
									title: t("close"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-tabs",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `dsh-lingualab-tab${tab === "library" ? " is-on" : ""}`,
								onClick: () => setTab("library"),
								children: t("pickerLibrary")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `dsh-lingualab-tab${tab === "browse" ? " is-on" : ""}`,
								onClick: () => setTab("browse"),
								children: t("pickerBrowse")
							})]
						}),
						openError !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-error",
							children: openError
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-modal-body",
							children: tab === "library" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LibraryTab, {
								t,
								library,
								currentId,
								onPick: (id) => onOpenEpisode(id)
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrowseTab, {
								t,
								picker,
								onPickFile: pickFile,
								onPickEpisode: (id) => onOpenEpisode(id),
								onUseFolder: () => {
									if (picker.place !== null) onUseFolder(picker.place.id, picker.rel);
								},
								savingFolder
							})
						})
					]
				})
			});
		}
		/** The library tab: what the scan knows, folders first. */
		function LibraryTab({ t, library, currentId, onPick }) {
			const [filter, setFilter] = (0, react.useState)("");
			const needle = filter.trim().toLowerCase();
			const match = (entry) => needle.length === 0 || entry.title.toLowerCase().includes(needle) || (entry.audio ?? "").toLowerCase().includes(needle);
			const folders = (library?.episodes ?? []).filter(match);
			const files = (library?.files ?? []).filter(match);
			const empty = library === null || folders.length === 0 && files.length === 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: "dsh-lingualab-input",
					value: filter,
					placeholder: t("pickerSearch"),
					onChange: (event) => setFilter(event.target.value),
					onKeyDown: (event) => event.stopPropagation()
				}),
				library?.ok === false ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-warn",
					children: library.reason ?? t("pickerNoLibrary")
				}) : null,
				empty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-empty",
					children: library === null || library.ok === false ? t("pickerNoLibraryHint") : t("pickerEmptyFolder")
				}) : null,
				folders.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-group",
					children: t("pickerEpisodes")
				}) : null,
				folders.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `dsh-lingualab-pick${entry.id === currentId ? " is-current" : ""}`,
					onClick: () => onPick(entry.id),
					disabled: entry.audio === null,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderIcon, {}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-lingualab-pick-main",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-pick-name",
								children: entry.title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-pick-sub",
								children: episodeSub(entry)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-badge",
							children: subtitleBadge(t, entry)
						})
					]
				}, entry.id)),
				files.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-group",
					children: t("pickerFiles")
				}) : null,
				files.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `dsh-lingualab-pick${entry.id === currentId ? " is-current" : ""}`,
					onClick: () => onPick(entry.id),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AudioIcon, {}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-lingualab-pick-main",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-pick-name",
								children: entry.title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-pick-sub",
								children: episodeSub(entry)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-badge",
							children: formatBytes(entry.audioBytes)
						})
					]
				}, entry.id))
			] });
		}
		/** The browse tab: places, then directories, then the one audio file you came for. */
		function BrowseTab({ t, picker, onPickFile, onPickEpisode, onUseFolder, savingFolder }) {
			const { place, places, rel, entries, folderEpisode, loading, error, query, setQuery } = picker;
			const segments = rel.split("/").filter((part) => part.length > 0);
			if (places.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-empty",
				children: t("noWorkspaces")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-actions",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
							className: "dsh-lingualab-bar-btn",
							value: place?.id ?? "",
							onChange: (event) => picker.enter(event.target.value, ""),
							onKeyDown: (event) => event.stopPropagation(),
							children: places.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
								value: entry.id,
								disabled: !entry.readable,
								children: [
									entry.label,
									entry.suggested ? ` · ${t("pickerConvention")}` : "",
									entry.readable ? "" : ` · ${entry.reason ?? t("dirUnreadable")}`
								]
							}, entry.id))
						}),
						rel !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-btn",
							onClick: picker.up,
							children: t("pickerParent")
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-btn",
							onClick: onUseFolder,
							disabled: place === null || savingFolder || !place.readable,
							children: t("mediaFolderUse")
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-hint",
					title: place?.path ?? "",
					children: [place?.label ?? "", segments.map((segment, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [" / ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-note-at",
						onClick: () => picker.enter(place?.id ?? "", segments.slice(0, index + 1).join("/")),
						children: segment
					})] }, `${segment}-${index}`))]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: "dsh-lingualab-input",
					value: query,
					placeholder: t("pickerSearch"),
					onChange: (event) => setQuery(event.target.value),
					onKeyDown: (event) => event.stopPropagation()
				}),
				error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-error",
					children: error
				}) : null,
				loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-empty",
					children: [t("pickerLoading"), "…"]
				}) : null,
				!loading && error === null && entries.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-empty",
					children: t("pickerEmptyFolder")
				}) : null,
				picker.truncated ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-hint",
					children: t("pickerTruncated")
				}) : null,
				folderEpisode !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "dsh-lingualab-pick",
					onClick: () => onPickEpisode(folderEpisode.id),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderIcon, {}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-lingualab-pick-main",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-pick-name",
								children: folderEpisode.title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-pick-sub",
								children: t("pickerOpenFolder")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-badge",
							children: t("pickerEpisodes")
						})
					]
				}) : null,
				entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrowseRow, {
					t,
					entry,
					onPickFile,
					onEnter: (next) => picker.enter(place?.id ?? "", next)
				}, entry.rel))
			] });
		}
		/** One row of a directory listing. */
		function BrowseRow({ t, entry, onEnter, onPickFile }) {
			if (entry.type === "dir") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "dsh-lingualab-pick",
				onClick: () => onEnter(entry.rel),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderIcon, {}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-pick-main",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-pick-name",
							children: entry.name
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronIcon, {})
				]
			});
			if (entry.type === "audio") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "dsh-lingualab-pick",
				onClick: () => onPickFile(entry.rel),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AudioIcon, {}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-pick-main",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-pick-name",
							children: entry.name
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-pick-sub",
							children: entry.subtitle !== null && entry.subtitle.files.length > 0 ? entry.subtitle.files.join(" · ") : formatBytes(entry.bytes)
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-badge",
						children: hintBadge(t, entry.subtitle)
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-pick",
				style: { cursor: "default" },
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubtitleIcon, {}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-pick-main",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-pick-name",
							children: entry.name
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-badge",
						children: entry.ext
					})
				]
			});
		}
		//#endregion
		//#region src/client/widgets/media-folder/ui/MediaFolderPanel.tsx
		/** How the source of the current path is described. */
		function sourceKey(source) {
			if (source === "config") return "mediaFolderSourceConfig";
			return source === "workspace" ? "mediaFolderSourceWorkspace" : "mediaFolderSourceNone";
		}
		/** The folder form: what is in effect, how to walk to a new one, and the typed fallback. */
		function MediaFolderPanel({ t, config, onSaved, bare = false }) {
			const current = config.payload;
			const onSave = (value) => {
				(async () => {
					if (await config.save(value)) onSaved();
				})();
			};
			const body = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-hint",
					children: t("mediaFolderHint")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-actions",
					style: { marginTop: 8 },
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-hint",
							children: t("mediaFolderCurrent")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
							className: "dsh-lingualab-path",
							children: current?.root ?? t("mediaFolderSourceNone")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-counter",
							children: t(sourceKey(current?.source ?? "none"))
						})
					]
				}),
				config.error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-error",
					children: config.error
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-hint",
					children: t("mediaFolderBrowseHint")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-actions",
					style: { marginTop: 8 },
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "dsh-lingualab-input",
						style: {
							flex: 1,
							minWidth: 200
						},
						value: config.draft,
						placeholder: t("mediaFolderPlaceholder"),
						onChange: (event) => config.setDraft(event.target.value),
						onKeyDown: (event) => {
							if (event.key === "Enter") onSave();
							event.stopPropagation();
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-btn is-primary",
						onClick: () => onSave(),
						disabled: config.saving,
						children: config.saving ? t("mediaFolderSaving") : t("mediaFolderSave")
					})]
				}),
				current !== null && current.candidates.length > 0 ? current.candidates.map((candidate) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dsh-lingualab-pick",
					onClick: () => config.setDraft(candidate.path),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-pick-main",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-pick-name dsh-lingualab-path",
							children: candidate.path
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-lingualab-pick-sub",
							children: [
								candidate.label,
								" ·",
								" ",
								!candidate.exists ? t("mediaFolderMissing") : candidate.episodes === 0 ? t("mediaFolderEmpty") : `${String(candidate.episodes ?? 0)} ${t("mediaFolderCount")}`
							]
						})]
					})
				}, candidate.path)) : null,
				current !== null && !current.writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-warn",
					children: t("mediaFolderReadOnly")
				}) : null
			] });
			if (bare) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-card",
				children: body
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-mask",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-modal",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-modal-head",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-modal-title",
							children: t("mediaFolder")
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-modal-body",
						children: body
					})]
				})
			});
		}
		//#endregion
		//#region src/client/widgets/notes-panel/ui/NotesComposer.tsx
		/**
		* The composer: the sentence being kept, and one line of commentary.
		*
		* It deliberately asks for one thing. The English is read-only — it came from the
		* subtitle, and editing it would break the link back to the timestamp — and the only
		* input is the note in the reader's own words, which is what the file is for. Enter
		* saves, Escape cancels, and the playing audio is never paused to type.
		*/
		/** The quote plus its one input. */
		function NotesComposer({ t, quote, full, onSubmit, onCancel }) {
			const [note, setNote] = (0, react.useState)("");
			const submit = () => {
				if (quote === null) return;
				onSubmit(note.trim());
				setNote("");
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-composer",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-hint",
						children: full ? t("notesFull") : t("notesHint")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-composer-quote",
						children: quote === null ? t("notesEmpty") : quote.text
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "dsh-lingualab-input",
						value: note,
						placeholder: t("notesEditorPlaceholder"),
						disabled: quote === null,
						onChange: (event) => setNote(event.target.value),
						onKeyDown: (event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								submit();
							}
							if (event.key === "Escape") {
								event.preventDefault();
								onCancel?.();
							}
							event.stopPropagation();
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-composer-actions",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-btn is-primary",
							onClick: submit,
							disabled: quote === null,
							children: full ? t("notesReplace") : t("save")
						}), onCancel === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-btn",
							onClick: onCancel,
							children: t("cancel")
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/widgets/notes-panel/ui/NotesPanel.tsx
		/**
		* The notes layer: the seven-phrase ceiling, made visible and slightly annoying.
		*
		* The ceiling is the point of the study method, so the counter is always on screen
		* and the eighth phrase cannot go in silently — the panel asks which one it replaces.
		* That question is the whole reason this is a layer rather than a card: choosing
		* between seven recorded sentences needs the list in front of you, not a corner of a
		* sidebar.
		*
		* Tags are the method's own vocabulary (`review`, `hard`), and the timestamp on each
		* row seeks back, because "which line was that" is the question the file exists to
		* answer later.
		*/
		/** Tags the study method uses; a phrase may carry both. */
		const TAGS = ["review", "hard"];
		/** The right-hand notes layer. */
		function NotesPanel({ t, notes, onClose, quote, pending, onCancelPending, onChoose, onSubmit }) {
			const [editing, setEditing] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)("");
			const [confirming, setConfirming] = (0, react.useState)(null);
			const store = useMediaPlayer.getState;
			/** Replaying a phrase is one gesture: seek there and loop that sentence. */
			const replay = (at) => {
				store().seek(at);
				store().setLoopMode("sentence");
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: "dsh-lingualab-notes",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-notes-head",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								t("notes"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dsh-lingualab-counter",
									children: [
										notes.phrases.length,
										" / ",
										7
									]
								})
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-icon-btn",
								onClick: onClose,
								title: t("close"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
							})
						]
					}),
					pending !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-warn",
						children: [
							t("replaceHint"),
							" · ",
							pending.text
						]
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-notes-body",
						children: [notes.phrases.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-empty",
							children: t("notesEmpty")
						}) : null, notes.phrases.map((phrase, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-note",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: phrase.done,
									onChange: (event) => notes.update(index, { done: event.target.checked }),
									title: phrase.done ? t("stepUndone") : t("stepDone")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-lingualab-note-main",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dsh-lingualab-note-at",
											onClick: () => replay(phrase.at),
											children: formatClock(phrase.at)
										}),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dsh-lingualab-note-text",
											children: phrase.text
										}),
										phrase.zh.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "dsh-lingualab-note-zh",
											children: phrase.zh
										}) : null,
										editing === index ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											className: "dsh-lingualab-input",
											value: draft,
											autoFocus: true,
											onChange: (event) => setDraft(event.target.value),
											onKeyDown: (event) => {
												if (event.key === "Enter") {
													notes.update(index, { note: draft.trim() });
													setEditing(null);
												}
												if (event.key === "Escape") setEditing(null);
												event.stopPropagation();
											}
										}) : phrase.note.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "dsh-lingualab-note-note",
											children: phrase.note
										}) : null,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "dsh-lingualab-chips",
											children: TAGS.map((tag) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: `dsh-lingualab-tag${phrase.tags.includes(tag) ? " is-on" : ""}`,
												onClick: () => notes.update(index, { tags: phrase.tags.includes(tag) ? phrase.tags.filter((item) => item !== tag) : [...phrase.tags, tag] }),
												children: ["#", tag === "review" ? t("review") : t("hard")]
											}, tag))
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-row-actions",
									style: { opacity: 1 },
									children: pending !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-btn",
										onClick: () => onChoose(index),
										children: t("notesReplace")
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-icon-btn",
										title: t("notesEdit"),
										onClick: () => {
											setEditing(index);
											setDraft(phrase.note);
										},
										children: "✎"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-icon-btn",
										title: t("notesDelete"),
										onClick: () => {
											if (confirming === index) {
												notes.remove(index);
												setConfirming(null);
												return;
											}
											setConfirming(index);
										},
										children: confirming === index ? t("notesDeleteConfirm") : "✕"
									})] })
								})
							]
						}, `${phrase.at}-${index}`))]
					}),
					pending !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-composer",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-composer-actions",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-btn",
								onClick: onCancelPending,
								children: t("cancel")
							})
						})
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NotesComposer, {
						t,
						quote,
						full: notes.full,
						onSubmit
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-hint",
						style: { padding: "0 12px 10px" },
						children: [
							notes.status === "saving" ? t("saving") : null,
							notes.status === "saved" ? t("saved") : null,
							notes.status === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-error",
								children: t("saveFailed")
							}) : null
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/widgets/step-tracker/ui/StepTracker.tsx
		/**
		* The five steps of the study method, as a chip with a popover.
		*
		* The method is a timed ritual — blind watch, subtitle read, shadowing, next-day
		* review, weekly review — and the reason the earlier standalone app went unused was
		* that nothing in it knew which step you were on. This answers that one question.
		*
		* It is a chip rather than a card because it is not what you look at while listening:
		* a permanent panel spent a third of the page on something consulted twice a session,
		* and made every other block look equally important. It does not enforce anything —
		* no alarms, no locks, no scolding — and opening it never pauses the audio. Ticks and
		* elapsed seconds are per episode and live in `localStorage`, because they are progress
		* through today's material rather than part of the notes file the agent reads.
		*/
		/** The method's five steps, in order. */
		const STEPS = [
			{
				id: "blind",
				labelKey: "stepBlind",
				minutes: 22,
				inSession: true
			},
			{
				id: "read",
				labelKey: "stepRead",
				minutes: 22,
				inSession: true
			},
			{
				id: "shadow",
				labelKey: "stepShadow",
				minutes: 10,
				inSession: true
			},
			{
				id: "next-day",
				labelKey: "stepNextDay",
				minutes: 3,
				inSession: false
			},
			{
				id: "weekly",
				labelKey: "stepWeekly",
				minutes: 15,
				inSession: false
			}
		];
		const EMPTY = {
			done: false,
			seconds: 0
		};
		/** Where one episode's step progress is kept. */
		function storageKey(episode) {
			return `dsh-lingualab:steps:${episode}`;
		}
		/** Read the stored progress, tolerating a cleared or corrupted entry. */
		function readRecords(episode) {
			try {
				const raw = window.localStorage.getItem(storageKey(episode));
				if (raw === null) return {};
				const parsed = JSON.parse(raw);
				return typeof parsed === "object" && parsed !== null ? parsed : {};
			} catch {
				return {};
			}
		}
		/** The chip plus, when open, the checklist under it. */
		function StepTracker({ t, episode, open, onToggle }) {
			const [records, setRecords] = (0, react.useState)(() => readRecords(episode));
			const [running, setRunning] = (0, react.useState)(null);
			const persist = (0, react.useCallback)((next) => {
				setRecords(next);
				try {
					window.localStorage.setItem(storageKey(episode), JSON.stringify(next));
				} catch {}
			}, [episode]);
			(0, react.useEffect)(() => {
				if (running === null) return;
				const timer = setInterval(() => {
					setRecords((current) => {
						const record = current[running] ?? EMPTY;
						const next = {
							...current,
							[running]: {
								...record,
								seconds: record.seconds + 1
							}
						};
						try {
							window.localStorage.setItem(storageKey(episode), JSON.stringify(next));
						} catch {}
						return next;
					});
				}, 1e3);
				return () => clearInterval(timer);
			}, [running, episode]);
			const done = STEPS.filter((step) => (records[step.id] ?? EMPTY).done).length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `dsh-lingualab-chip${open ? " is-on" : ""}`,
				onClick: onToggle,
				children: [
					t("stepsChip"),
					" ",
					done,
					"/",
					STEPS.length
				]
			}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-popover",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-steps",
					children: STEPS.map((step) => {
						const record = records[step.id] ?? EMPTY;
						const isRunning = running === step.id;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: `dsh-lingualab-step${record.done ? " is-done" : ""}${isRunning ? " is-current" : ""}`,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: record.done,
									onChange: (event) => persist({
										...records,
										[step.id]: {
											...record,
											done: event.target.checked
										}
									}),
									title: record.done ? t("stepUndone") : t("stepDone")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-step-label",
									children: t(step.labelKey)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-step-mins",
									children: step.inSession ? `${step.minutes} ${t("minutes")} · ${Math.floor(record.seconds / 60)}:${String(record.seconds % 60).padStart(2, "0")}` : t("stepInSession")
								}),
								step.inSession ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `dsh-lingualab-btn${isRunning ? " is-primary" : ""}`,
									onClick: () => setRunning(isRunning ? null : step.id),
									children: isRunning ? t("stepStop") : t("stepStart")
								}) : null
							]
						}, step.id);
					})
				})
			}) : null] });
		}
		//#endregion
		//#region src/client/widgets/subtitle-panel/ui/SubtitlePanel.tsx
		/**
		* The subtitle list — the page's spine, and its only scroller.
		*
		* One row per cue, the playing row kept in view, and a second, independent highlight
		* for keyboard selection: `↑`/`↓` move the selection without moving the audio, and
		* `Enter` plays it. That split matters in a listening session — scanning ahead for the
		* next phrase to work on must not cost you your place in what is playing.
		*
		* The two actions a row owns sit on the active or selected row only: loop it, or note
		* it. They used to appear on hover, which put the control you needed out of sight
		* exactly when the pointer was somewhere else.
		*/
		/** The scrolling list of cues. */
		function SubtitlePanel({ t, cues, activeIndex, selectedIndex, zhMode, notedIndexes, onSelect, onPlay, onRecord }) {
			const activeRef = (0, react.useRef)(null);
			const selectedRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				activeRef.current?.scrollIntoView({ block: "nearest" });
			}, [activeIndex]);
			(0, react.useEffect)(() => {
				selectedRef.current?.scrollIntoView({ block: "nearest" });
			}, [selectedIndex]);
			if (cues.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-empty",
				children: t("noSubtitles")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-list",
				children: cues.map((cue, index) => {
					const isActive = index === activeIndex;
					const isSelected = index === selectedIndex;
					const lines = visibleCueLines(cue.text, zhMode, isActive);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						ref: isActive ? activeRef : isSelected ? selectedRef : null,
						className: `dsh-lingualab-row${isActive ? " is-active" : ""}`,
						style: isSelected && !isActive ? { background: "var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,0.1))" } : void 0,
						onClick: () => {
							onSelect(index);
							onPlay(index);
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-lingualab-row-time",
								children: [formatClock(cue.start), notedIndexes.has(index) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-row-flag",
									title: t("notesMarked"),
									children: " ●"
								}) : null]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: lines.map((line, lineIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: line.secondary ? "dsh-lingualab-row-zh" : "dsh-lingualab-row-en",
								children: line.text
							}, lineIndex)) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-lingualab-row-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-icon-btn",
									title: t("loopSentence"),
									onClick: (event) => {
										event.stopPropagation();
										onSelect(index);
										useMediaPlayer.getState().loopSentence(index);
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LoopIcon, {})
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-icon-btn",
									title: t("recordHint"),
									onClick: (event) => {
										event.stopPropagation();
										onRecord(index);
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteIcon, {})
								})]
							})
						]
					}, `${cue.start}-${index}`);
				})
			});
		}
		//#endregion
		//#region src/client/pages/lingualab/ui/LingualabPage.tsx
		/**
		* The page: four bands, and the layers that do not fit in them.
		*
		* The shape answers the two complaints that started this. The page no longer reads as
		* a settings screen — there is one thing to look at, the sentence being worked on, and
		* it is pinned above the list rather than scrolling away with it. And everything that
		* is not listening — the picker, the notes, the media folder — is behind a layer that
		* appears when asked for and gets out of the way.
		*
		* Keyboard handling lives here rather than on `window`. The earlier standalone app bound
		* its shortcuts globally and therefore owned the space bar, the arrow keys and the
		* bracket keys wherever it was open — inside a panel that shares a page with a
		* conversation, that is a hostile neighbour. The handler sits on the page container,
		* which is focusable, so the keys work while the panel has focus and stop at its edge.
		*/
		/** Whether a keystroke belongs to a field the reader is typing in. */
		function isTypingTarget(target) {
			if (!(target instanceof HTMLElement)) return false;
			const tag = target.tagName.toLowerCase();
			return tag === "input" || tag === "select" || tag === "textarea" || target.isContentEditable;
		}
		/** The English and Chinese halves of one cue, split the way the notes file wants them. */
		function splitCue(cue) {
			const lines = orderCueLines(cue.text);
			return {
				english: lines.find((line) => !line.secondary)?.text ?? cue.text,
				chinese: lines.find((line) => line.secondary)?.text ?? ""
			};
		}
		/** The panel's centre-column page. */
		function LingualabPage({ back, t }) {
			const library = useLibrary();
			const folder = useLibraryConfig();
			const notes = useNotes(library.episode?.id ?? null);
			const [zhMode, setZhMode] = (0, react.useState)("dim");
			const [layer, setLayer] = (0, react.useState)("none");
			const [stepsOpen, setStepsOpen] = (0, react.useState)(false);
			const [composerOpen, setComposerOpen] = (0, react.useState)(false);
			const [pending, setPending] = (0, react.useState)(null);
			const [selection, setSelection] = (0, react.useState)(null);
			const [focused, setFocused] = (0, react.useState)(false);
			const containerRef = (0, react.useRef)(null);
			const activeIndex = useMediaPlayer((state) => state.activeIndex);
			const cues = library.cues;
			const audioRef = useAudioBinding(library.media?.audioUrl ?? null);
			const reset = useMediaPlayer((state) => state.reset);
			(0, react.useEffect)(() => {
				reset(cues);
			}, [cues, reset]);
			(0, react.useEffect)(() => {
				if (library.loading) return;
				containerRef.current?.focus({ preventScroll: true });
			}, [library.loading]);
			/** The sentence a new note would carry: whatever is playing. */
			const quote = (0, react.useMemo)(() => {
				const cue = cues[activeIndex];
				if (cue === void 0) return null;
				const { english, chinese } = splitCue(cue);
				return {
					text: english,
					zh: chinese,
					at: cue.start
				};
			}, [cues, activeIndex]);
			/** Cue indexes that already carry a note, so the list can mark them. */
			const notedIndexes = (0, react.useMemo)(() => {
				const marked = /* @__PURE__ */ new Set();
				for (const phrase of notes.phrases) {
					const index = findActiveCue(cues, phrase.at);
					if (index >= 0) marked.add(index);
				}
				return marked;
			}, [notes.phrases, cues]);
			/**
			* Put one sentence into the notes.
			*
			* The ceiling decides what happens next: with room, the phrase lands and the reader
			* keeps listening; full, the notes layer opens as a chooser, because "which of the
			* seven goes" is a question only they can answer.
			*/
			const record = (0, react.useCallback)((index, note = "") => {
				const target = cues[index ?? activeIndex];
				if (target === void 0) return;
				const { english, chinese } = splitCue(target);
				const phrase = {
					at: target.start,
					text: english,
					zh: chinese,
					note,
					tags: [],
					done: false
				};
				if (notes.add(phrase)) {
					setComposerOpen(false);
					return;
				}
				setPending(phrase);
				setLayer("notes");
			}, [
				cues,
				activeIndex,
				notes
			]);
			const onKeyDown = (0, react.useCallback)((event) => {
				if (isTypingTarget(event.target)) return;
				const store = useMediaPlayer.getState;
				const handled = () => {
					event.preventDefault();
					event.stopPropagation();
				};
				if (event.key === "Escape") {
					handled();
					if (layer !== "none") setLayer("none");
					else if (stepsOpen) setStepsOpen(false);
					else if (composerOpen) setComposerOpen(false);
					else store().clearAB();
					return;
				}
				if (layer !== "none") return;
				const current = selection ?? store().activeIndex;
				switch (event.key) {
					case " ":
						handled();
						store().toggle();
						return;
					case "ArrowLeft":
						handled();
						setSelection(null);
						store().stepCue(-1);
						return;
					case "ArrowRight":
						handled();
						setSelection(null);
						store().stepCue(1);
						return;
					case "ArrowUp":
						handled();
						setSelection(Math.max(0, current - 1));
						return;
					case "ArrowDown":
						handled();
						setSelection(Math.min(Math.max(0, cues.length - 1), current + 1));
						return;
					case "Enter": {
						handled();
						const cue = cues[current];
						if (cue !== void 0) {
							setSelection(null);
							store().seek(cue.start);
							store().setPlaying(true);
						}
						return;
					}
					case "l":
					case "L":
						handled();
						if (store().loopMode === "sentence") store().setLoopMode("none");
						else store().loopSentence(current);
						return;
					case "n":
					case "N":
						handled();
						setComposerOpen(true);
						return;
					case "c":
					case "C":
						handled();
						setZhMode(nextZhMode(zhMode));
						return;
					case "a":
					case "A":
						handled();
						if (store().pointA === null) store().setPoint("a");
						else store().clearAB();
						return;
					case "b":
					case "B":
						handled();
						store().setPoint("b");
						return;
					case "[":
						handled();
						store().cycleSpeed(-1);
						return;
					case "]":
						handled();
						store().cycleSpeed(1);
						return;
				}
			}, [
				composerOpen,
				cues,
				layer,
				selection,
				stepsOpen,
				zhMode
			]);
			const episode = library.episode;
			const hasAudio = library.media !== null;
			const selectedIndex = selection === null ? activeIndex : Math.min(Math.max(0, selection), Math.max(0, cues.length - 1));
			const stageCue = cues[activeIndex];
			const stageLines = stageCue === void 0 ? null : splitCue(stageCue);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-page",
				ref: containerRef,
				tabIndex: 0,
				onKeyDown,
				onFocus: () => setFocused(true),
				onBlur: (event) => {
					if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
				},
				onMouseDown: (event) => {
					if (!isTypingTarget(event.target)) containerRef.current?.focus({ preventScroll: true });
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: STYLES }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("audio", {
						ref: audioRef,
						preload: "metadata",
						style: { display: "none" }
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-top",
						children: [
							back !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-chip",
								onClick: back,
								children: t("back")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dsh-lingualab-episode",
								onClick: () => setLayer("picker"),
								title: episode === null ? t("openEpisode") : t("changeEpisode"),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-episode-name",
									children: episode?.title ?? t("openEpisode")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-episode-caret",
									children: "▾"
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `dsh-lingualab-chip${layer === "notes" ? " is-on" : ""}`,
								onClick: () => setLayer(layer === "notes" ? "none" : "notes"),
								children: [
									t("notesChip"),
									" ",
									notes.phrases.length,
									"/",
									7
								]
							}),
							episode !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StepTracker, {
								t,
								episode: episode.id,
								open: stepsOpen,
								onToggle: () => setStepsOpen(!stepsOpen)
							}, episode.id) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `dsh-lingualab-chip${layer === "folder" ? " is-on" : ""}`,
								onClick: () => setLayer(layer === "folder" ? "none" : "folder"),
								children: t("mediaFolder")
							})
						]
					}),
					episode === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-blank",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-blank-card",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: library.loading ? t("stageLoading") : t("emptyTitle") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-hint",
									children: library.payload?.ok === false ? library.payload.reason : t("emptyHint")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MediaFolderPanel, {
									t,
									config: folder,
									onSaved: library.reload,
									bare: true
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-actions",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-btn is-primary",
										onClick: () => setLayer("picker"),
										children: t("pickerBrowse")
									})
								})
							]
						})
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-stage",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-lingualab-stage-meta",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: stageCue === void 0 ? "--:--" : `${formatClock(stageCue.start)} – ${formatClock(stageCue.end)}` }),
										library.cuesLoading ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [t("stageLoading"), "…"] }) : null,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
										episode.audio === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: episode.audio })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-stage-en",
									children: stageLines?.english ?? t("noSubtitles")
								}),
								zhMode !== "hidden" && stageLines !== null && stageLines.chinese.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-stage-zh",
									children: stageLines.chinese
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ControlBar, {
									t,
									zhMode,
									onZhMode: setZhMode,
									onRecord: () => setComposerOpen(true),
									disabled: !hasAudio || cues.length === 0
								}),
								!hasAudio ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-warn",
									children: t("noAudio")
								}) : null,
								library.error !== null && cues.length === 0 && hasAudio ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-lingualab-error",
									children: [
										t("subtitleFailed"),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dsh-lingualab-btn",
											onClick: library.reload,
											children: t("retry")
										})
									]
								}) : null,
								composerOpen && !notes.full ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NotesComposer, {
									t,
									quote,
									full: notes.full,
									onSubmit: (note) => record(void 0, note),
									onCancel: () => setComposerOpen(false)
								}) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-mid",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubtitlePanel, {
								t,
								cues,
								activeIndex,
								selectedIndex,
								zhMode,
								notedIndexes,
								onSelect: setSelection,
								onPlay: (index) => {
									const cue = cues[index];
									if (cue === void 0) return;
									setSelection(null);
									useMediaPlayer.getState().seek(cue.start);
									useMediaPlayer.getState().setPlaying(true);
								},
								onRecord: (index) => record(index)
							}), layer === "notes" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NotesPanel, {
								t,
								notes,
								onClose: () => setLayer("none"),
								quote,
								pending,
								onCancelPending: () => {
									setPending(null);
									setLayer("none");
								},
								onChoose: (index) => {
									if (pending !== null) notes.replaceAt(index, pending);
									setPending(null);
								},
								onSubmit: (note) => record(void 0, note)
							}) : null]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-foot",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("shortcutHint") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
								library.payload?.currentUnavailable != null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-warn",
									children: t("currentGone")
								}) : null,
								!focused ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("keysInactive") }) : null
							]
						})
					] }),
					layer === "picker" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EpisodePicker, {
						t,
						onClose: () => setLayer("none"),
						library: library.payload,
						currentId: episode?.id ?? null,
						opening: library.opening,
						openError: library.openError,
						onOpenEpisode: (id) => {
							(async () => {
								if (!await library.openEpisode(id)) return;
								setSelection(null);
								setPending(null);
								setComposerOpen(false);
								setLayer("none");
							})();
						},
						onOpenFile: (place, rel) => {
							(async () => {
								if (!await library.openFile(place, rel)) return;
								setSelection(null);
								setPending(null);
								setComposerOpen(false);
								setLayer("none");
							})();
						},
						onUseFolder: (place, rel) => {
							(async () => {
								if (await folder.useAsLibrary(place, rel)) {
									library.reload();
									setLayer("none");
								}
							})();
						},
						savingFolder: folder.saving
					}) : null,
					layer === "folder" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MediaFolderPanel, {
						t,
						config: folder,
						onSaved: () => {
							library.reload();
							setLayer("none");
						}
					}) : null
				]
			});
		}
		//#endregion
		//#region src/client/index.tsx
		const NS = "dsh-lingualab";
		const PANEL_ID = "lingualab";
		/** Client packages whose services this plugin uses; the loader orders them first. */
		const inject = [
			"slots",
			"locale",
			"layout"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "lingualab: dictionaries");
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: PANEL_ID,
				locale: NS,
				inject: () => ({ back: () => ctx.layout.selectPanel(null) })
			}, LingualabPage));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
