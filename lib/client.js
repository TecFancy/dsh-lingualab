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
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		react = __toESM(react, 1);
		//#region src/client/icons/rail.tsx
		function LingualabIcon({ size = 18 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.7,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 14v-2a8 8 0 0 1 16 0v2" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: 3,
						y: 13.5,
						width: 4,
						height: 6.5,
						rx: 2
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: 17,
						y: 13.5,
						width: 4,
						height: 6.5,
						rx: 2
					})
				]
			});
		}
		//#endregion
		//#region src/client/locale.ts
		/**
		* The page copy, in both languages.
		*
		* Keys are grouped by the part of the page that reads them so a missing
		* translation is visible next to its neighbours. The host's locale service picks
		* the dictionary; nothing here decides which language is active.
		*/
		/** Chinese copy — the primary side of every pair in this repository. */
		const zh = {
			panel: "语言实验室",
			title: "语言实验室",
			subtitle: "一次一集，逐句精听",
			back: "← 返回会话",
			episode: "剧集",
			noLibrary: "媒体目录还不存在",
			noLibraryHint: "把一集音频和字幕放进这个目录，再回到这一页。",
			noEpisodes: "目录里还没有剧集文件夹",
			noAudio: "这一集没有音频文件",
			loadFailed: "读取素材失败",
			notes: "笔记",
			notesHint: "每集最多 7 条，满了先替换一条",
			notesFull: "已经 7 条，选一条替换",
			notesEmpty: "还没有记东西。听到想留的句子，点「记下这一句」。",
			addPhrase: "记下这一句",
			replaceHint: "要替换哪一条？",
			cancel: "取消",
			remove: "删掉",
			seekHere: "从这里听",
			review: "想不起",
			hard: "还记不住",
			saved: "已保存",
			saving: "保存中",
			saveFailed: "保存失败",
			play: "播放",
			pause: "暂停",
			speed: "变速",
			loopOff: "不循环",
			loopSentence: "循环本句",
			loopAb: "循环 A-B",
			setA: "设 A",
			setB: "设 B",
			clearAb: "清掉 A-B",
			prevCue: "上一句",
			nextCue: "下一句",
			subtitles: "字幕",
			zhMode: "中文显示",
			zhAlways: "常显",
			zhDim: "弱化",
			zhActiveOnly: "仅当前句",
			zhHidden: "隐藏",
			noSubtitles: "这一集没有字幕文件",
			shortcutHint: "快捷键：空格播放，左右 3 秒，上下切句，L 循环本句，方括号设 A-B，S 变速。",
			steps: "五步",
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
			panel: "Language Lab",
			title: "Language Lab",
			subtitle: "One episode at a time, sentence by sentence",
			back: "← Back to conversation",
			episode: "Episode",
			noLibrary: "The media folder does not exist yet",
			noLibraryHint: "Copy one episode of audio and subtitles into that folder, then come back.",
			noEpisodes: "No episode folders in the library yet",
			noAudio: "This episode has no audio file",
			loadFailed: "Could not load the material",
			notes: "Notes",
			notesHint: "Seven phrases per episode; a full list replaces one",
			notesFull: "Seven already — pick one to replace",
			notesEmpty: "Nothing recorded yet. When a line is worth keeping, press “Keep this line”.",
			addPhrase: "Keep this line",
			replaceHint: "Replace which one?",
			cancel: "Cancel",
			remove: "Remove",
			seekHere: "Play from here",
			review: "Could not recall",
			hard: "Still forgetting",
			saved: "Saved",
			saving: "Saving",
			saveFailed: "Save failed",
			play: "Play",
			pause: "Pause",
			speed: "Speed",
			loopOff: "No loop",
			loopSentence: "Loop this sentence",
			loopAb: "Loop A-B",
			setA: "Set A",
			setB: "Set B",
			clearAb: "Clear A-B",
			prevCue: "Previous sentence",
			nextCue: "Next sentence",
			subtitles: "Subtitles",
			zhMode: "Chinese",
			zhAlways: "Always",
			zhDim: "Dimmed",
			zhActiveOnly: "Current only",
			zhHidden: "Hidden",
			noSubtitles: "This episode has no subtitle file",
			shortcutHint: "Keys: space plays, arrows move 3s, up/down change sentence, L loops it, brackets set A-B, S changes speed.",
			steps: "Five steps",
			stepBlind: "Watch with no subtitles",
			stepRead: "Read the English subtitles",
			stepShadow: "Shadow the lines",
			stepNextDay: "Next-day review",
			stepWeekly: "Weekly review",
			stepInSession: "Done in the conversation",
			stepStart: "Start the clock",
			stepStop: "Stop",
			stepDone: "Tick off",
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
		//#endregion
		//#region src/client/shared/lib/api.ts
		/**
		* Requests to the host half, and the one place the panel learns about files.
		*
		* Every call returns a payload rather than throwing on a bad answer: a missing
		* library is a normal state on a machine where nothing has been copied in yet,
		* and the page has to render that state instead of an error boundary.
		*/
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
					episodes: []
				};
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
		/** The URL one media file is served from; `<audio>` and `fetch` share it. */
		function mediaUrl(episode, file) {
			return `${MEDIA_PATH}/${encodeURIComponent(episode)}/${encodeURIComponent(file)}`;
		}
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
		*/
		/** Fetch, decode and parse one subtitle file. */
		async function fetchCues(episode, file) {
			const response = await fetch(mediaUrl(episode, file));
			if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
			return parseSubtitle(decodeSubtitleText(await response.arrayBuffer()), file);
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
		//#region src/client/features/library/model/useLibrary.ts
		/**
		* Loading one episode: the library listing, its subtitles, and nothing else.
		*
		* The cues are assembled here rather than in the page so the merge rule has one
		* home: an episode with one bilingual file parses it once, an episode with an
		* English and a Chinese track parses both and folds them together.
		*
		* The state keeps the episode id its cues belong to, and the returned list is
		* empty until they match. Without that, switching episodes would hand the player
		* the previous episode's cue list while the new subtitles were still in flight —
		* and a loop wrapping on a stale sentence is a wrong seek, not a cosmetic delay.
		*/
		const NOTHING_LOADED$1 = {
			id: null,
			cues: []
		};
		/** Load the library, then the selected episode's subtitles. */
		function useLibrary() {
			const [payload, setPayload] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const [episodeId, setEpisodeId] = (0, react.useState)(null);
			const [loaded, setLoaded] = (0, react.useState)(NOTHING_LOADED$1);
			(0, react.useEffect)(() => {
				let cancelled = false;
				(async () => {
					setLoading(true);
					const next = await fetchLibrary();
					if (cancelled) return;
					setPayload(next);
					setError(next.ok ? null : next.reason);
					setEpisodeId((current) => current ?? next.current);
					setLoading(false);
				})();
				return () => {
					cancelled = true;
				};
			}, []);
			const episode = payload?.episodes.find((entry) => entry.id === episodeId) ?? null;
			(0, react.useEffect)(() => {
				if (episode === null) return;
				let cancelled = false;
				(async () => {
					try {
						const english = episode.subtitleEn === null ? [] : await fetchCues(episode.id, episode.subtitleEn);
						const chinese = episode.subtitleZh === null || episode.subtitleZh === episode.subtitleEn ? [] : await fetchCues(episode.id, episode.subtitleZh);
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
					}
				})();
				return () => {
					cancelled = true;
				};
			}, [episode]);
			const selectEpisode = (0, react.useCallback)((id) => setEpisodeId(id), []);
			return {
				payload,
				loading,
				error,
				episode,
				cues: episode !== null && loaded.id === episode.id ? loaded.cues : [],
				selectEpisode
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
			const visible = loaded.id === episodeId ? loaded.phrases : [];
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
		/** `4 / 7`, the note counter that makes the ceiling visible before it is hit. */
		function formatCount(used, limit) {
			return `${used} / ${limit}`;
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
		*/
		const STYLES = `
.dsh-lingualab-page{display:flex;flex-direction:column;gap:14px;padding:20px 24px 40px;height:100%;overflow:auto;
  color:var(--dsw-alias-label-primary,inherit);font-size:14px;line-height:1.55}
.dsh-lingualab-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.dsh-lingualab-head h1{margin:0;font-size:20px;font-weight:600;letter-spacing:-0.01em}
.dsh-lingualab-sub{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:13px}
.dsh-lingualab-back{margin-left:auto;border:0;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);
  cursor:pointer;font-size:13px;padding:4px 6px;border-radius:6px}
.dsh-lingualab-back:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.1));
  color:var(--dsw-alias-label-primary,inherit)}

.dsh-lingualab-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));border-radius:12px;padding:8px 10px;
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,0.04))}
.dsh-lingualab-btn{border:0.5px solid transparent;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.1));
  color:inherit;cursor:pointer;font-size:13px;padding:4px 9px;border-radius:8px;white-space:nowrap}
.dsh-lingualab-btn:hover{border-color:var(--dsw-alias-border-l2,rgba(127,127,127,0.45))}
.dsh-lingualab-btn.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);color:#fff}
.dsh-lingualab-btn:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-spacer{flex:1}
.dsh-lingualab-time{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary,#8a8f98);font-size:13px}
.dsh-lingualab-select{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.1));color:inherit;border:0;
  border-radius:8px;padding:4px 6px;font-size:13px;max-width:220px}

.dsh-lingualab-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}
@media (max-width:900px){.dsh-lingualab-grid{grid-template-columns:minmax(0,1fr)}}
.dsh-lingualab-card{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));border-radius:12px;
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,0.04));padding:12px 14px}
.dsh-lingualab-card h2{margin:0 0 8px;font-size:14px;font-weight:600}
.dsh-lingualab-hint{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px}
.dsh-lingualab-empty{color:var(--dsw-alias-label-secondary,#8a8f98);padding:18px 4px;font-size:13px}

.dsh-lingualab-cues{max-height:52vh;overflow:auto;display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-cue{display:grid;grid-template-columns:52px minmax(0,1fr) 26px;gap:8px;align-items:start;
  padding:6px 8px;border-radius:8px;cursor:pointer;border:0.5px solid transparent}
.dsh-lingualab-cue:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.09))}
.dsh-lingualab-cue.is-active{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12));
  border-color:var(--dsw-alias-border-l2,rgba(127,127,127,0.4))}
.dsh-lingualab-cue-time{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px;font-variant-numeric:tabular-nums;
  padding-top:2px}
.dsh-lingualab-cue-en{min-width:0;word-break:break-word}
.dsh-lingualab-cue-zh{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12.5px;margin-top:2px}
.dsh-lingualab-cue-zh.is-hidden{display:none}
.dsh-lingualab-cue-loop{border:0;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;
  font-size:14px;padding:0;border-radius:6px;opacity:0}
.dsh-lingualab-cue:hover .dsh-lingualab-cue-loop,.dsh-lingualab-cue.is-active .dsh-lingualab-cue-loop{opacity:1}
.dsh-lingualab-cue-loop:hover{color:var(--dsw-alias-brand-primary,#4d6bfe)}

.dsh-lingualab-note{display:flex;gap:8px;padding:7px 0;border-bottom:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.18))}
.dsh-lingualab-note:last-of-type{border-bottom:0}
.dsh-lingualab-note-main{min-width:0;flex:1}
.dsh-lingualab-note-at{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px;cursor:pointer;
  font-variant-numeric:tabular-nums}
.dsh-lingualab-note-text{word-break:break-word}
.dsh-lingualab-note-zh{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12.5px}
.dsh-lingualab-note-note{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px;font-style:italic}
.dsh-lingualab-note-actions{display:flex;gap:4px;align-items:flex-start}
.dsh-lingualab-icon-btn{border:0;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;
  font-size:13px;padding:1px 4px;border-radius:6px}
.dsh-lingualab-icon-btn:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12));color:inherit}
.dsh-lingualab-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.dsh-lingualab-chip{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));background:none;color:inherit;
  cursor:pointer;font-size:12px;padding:1px 7px;border-radius:999px}
.dsh-lingualab-chip.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:#fff}
.dsh-lingualab-counter{color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums;font-size:12px}
.dsh-lingualab-actions{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}
.dsh-lingualab-warn{color:var(--dsw-alias-state-warn-primary,#b7791f);font-size:12.5px}

.dsh-lingualab-steps{display:flex;flex-direction:column;gap:6px}
.dsh-lingualab-step{display:flex;align-items:center;gap:8px;cursor:pointer;padding:4px 6px;border-radius:8px}
.dsh-lingualab-step:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.09))}
.dsh-lingualab-step.is-current{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12))}
.dsh-lingualab-step.is-done .dsh-lingualab-step-label{text-decoration:line-through;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-step-label{flex:1;min-width:0}
.dsh-lingualab-step-mins{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px}
`;
		//#endregion
		//#region src/client/widgets/control-bar/ui/ControlBar.tsx
		/**
		* Transport controls: what a listening session touches most often.
		*
		* Order follows frequency of use, left to right: sentence steps, play, speed,
		* then the loop controls, then the subtitle mode. The A-B pair keeps its own
		* undo (`清掉 A-B`) because setting a wrong B point is the one mistake that
		* silently changes what you hear next.
		*/
		/** Repeat counts offered by the loop counter; `0` means until stopped. */
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
		/** The row of buttons above the subtitle list. */
		function ControlBar({ t, zhMode, onZhMode, disabled = false }) {
			const isPlaying = useMediaPlayer((state) => state.isPlaying);
			const currentTime = useMediaPlayer((state) => state.currentTime);
			const duration = useMediaPlayer((state) => state.duration);
			const speedIndex = useMediaPlayer((state) => state.speedIndex);
			const loopMode = useMediaPlayer((state) => state.loopMode);
			const repeats = useMediaPlayer((state) => state.repeats);
			const pointA = useMediaPlayer((state) => state.pointA);
			const pointB = useMediaPlayer((state) => state.pointB);
			const store = useMediaPlayer.getState;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-bar",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-btn",
						onClick: () => store().stepCue(-1),
						disabled,
						title: t("prevCue"),
						children: "⏮"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-btn",
						onClick: () => store().toggle(),
						disabled,
						style: { minWidth: 64 },
						children: isPlaying ? `⏸ ${t("pause")}` : `▶ ${t("play")}`
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-btn",
						onClick: () => store().stepCue(1),
						disabled,
						title: t("nextCue"),
						children: "⏭"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-time",
						children: [
							formatClock(currentTime),
							" / ",
							formatClock(duration)
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-btn",
						onClick: () => store().cycleSpeed(-1),
						disabled,
						title: t("speed"),
						children: "−"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-time",
						children: [SPEED_PRESETS[speedIndex] ?? 1, "×"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-btn",
						onClick: () => store().cycleSpeed(1),
						disabled,
						title: t("speed"),
						children: "+"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `dsh-lingualab-btn${loopMode === "sentence" ? " is-on" : ""}`,
						onClick: () => loopMode === "sentence" ? store().setLoopMode("none") : store().loopSentence(),
						disabled,
						children: ["🔂 ", t("loopSentence")]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-btn",
						onClick: () => store().setPoint("a"),
						disabled,
						title: t("setA"),
						children: "A"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-btn",
						onClick: () => store().setPoint("b"),
						disabled,
						title: t("setB"),
						children: "B"
					}),
					pointA !== null || pointB !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-time",
						children: [
							pointA === null ? "–" : formatClock(pointA),
							"–",
							pointB === null ? "–" : formatClock(pointB)
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-btn",
						onClick: () => store().clearAB(),
						disabled,
						children: "✕"
					})] }) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						className: "dsh-lingualab-select",
						value: String(repeats),
						onChange: (event) => store().setRepeats(Number(event.target.value)),
						title: t("loopAb"),
						disabled,
						children: REPEAT_CHOICES.map((count) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: count,
							children: count === 0 ? "∞" : `×${count}`
						}, count))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						className: "dsh-lingualab-select",
						value: zhMode,
						onChange: (event) => onZhMode(event.target.value),
						title: t("zhMode"),
						children: SUBTITLE_ZH_MODES.map((mode) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: mode,
							children: t(ZH_MODE_KEYS[mode])
						}, mode))
					})
				]
			});
		}
		//#endregion
		//#region src/client/widgets/notes-panel/ui/NotesPanel.tsx
		/**
		* The notes list: the seven-phrase ceiling, made visible and slightly annoying.
		*
		* The ceiling is the point of the study method, so the counter is always on
		* screen and the eighth phrase cannot be added silently — the panel asks which
		* one it replaces. Tags are the method's own vocabulary (`review`, `hard`), and
		* the timestamp on each row seeks back, because "which line was that" is the
		* question the file exists to answer later.
		*/
		/** Tags the study method uses; a phrase may carry both. */
		const TAGS = ["review", "hard"];
		/** The right-hand notes card. */
		function NotesPanel({ t, notes, phraseFromCurrentCue }) {
			const [replacing, setReplacing] = (0, react.useState)(false);
			const store = useMediaPlayer.getState;
			const onAdd = () => {
				const phrase = phraseFromCurrentCue();
				if (phrase === null) return;
				if (!notes.add(phrase)) setReplacing(true);
			};
			const onReplace = (index) => {
				const phrase = phraseFromCurrentCue();
				if (phrase !== null) notes.replaceAt(index, phrase);
				setReplacing(false);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-card",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h2", { children: [
						t("notes"),
						" ",
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-counter",
							children: formatCount(notes.phrases.length, 7)
						})
					] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-hint",
						children: t("notesHint")
					}),
					notes.phrases.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-empty",
						children: t("notesEmpty")
					}) : null,
					notes.phrases.map((phrase, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-note-at",
										onClick: () => store().seek(phrase.at),
										children: formatClock(phrase.at)
									}),
									" ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-note-text",
										children: replacing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dsh-lingualab-btn",
											onClick: () => onReplace(index),
											children: phrase.text
										}) : phrase.text
									}),
									phrase.zh.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dsh-lingualab-note-zh",
										children: phrase.zh
									}) : null,
									phrase.note.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dsh-lingualab-note-note",
										children: phrase.note
									}) : null,
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dsh-lingualab-chips",
										children: TAGS.map((tag) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: `dsh-lingualab-chip${phrase.tags.includes(tag) ? " is-on" : ""}`,
											onClick: () => notes.update(index, { tags: phrase.tags.includes(tag) ? phrase.tags.filter((item) => item !== tag) : [...phrase.tags, tag] }),
											children: ["#", tag === "review" ? t("review") : t("hard")]
										}, tag))
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-note-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-icon-btn",
									title: t("seekHere"),
									onClick: () => store().seek(phrase.at),
									children: "▶"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-icon-btn",
									title: t("remove"),
									onClick: () => notes.remove(index),
									children: "✕"
								})]
							})
						]
					}, `${phrase.at}-${index}`)),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-actions",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dsh-lingualab-btn",
								onClick: onAdd,
								disabled: replacing,
								children: ["＋ ", t("addPhrase")]
							}),
							replacing ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-warn",
								children: t("replaceHint")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-btn",
								onClick: () => setReplacing(false),
								children: t("cancel")
							})] }) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-lingualab-counter",
								children: [
									notes.status === "saving" ? t("saving") : null,
									notes.status === "saved" ? t("saved") : null,
									notes.status === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-warn",
										children: t("saveFailed")
									}) : null
								]
							})
						]
					}),
					notes.full && !replacing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-hint",
						children: t("notesFull")
					}) : null
				]
			});
		}
		//#endregion
		//#region src/client/widgets/step-tracker/ui/StepTracker.tsx
		/**
		* The five steps of the study method, with a clock that only counts while you
		* say so.
		*
		* The method is a timed ritual — blind watch, subtitle read, shadowing, next-day
		* review, weekly review — and the reason the earlier standalone app went unused
		* was that nothing in it knew which step you were on. This card answers that one
		* question. It does not enforce anything: no alarms, no locks, no scolding. Ticks
		* and elapsed seconds are per episode and live in `localStorage`, because they are
		* progress through today's material rather than part of the notes file the agent
		* reads.
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
		/** Where one episode's step progress lives. */
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
		/** The five-step card. */
		function StepTracker({ t, episode }) {
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-card",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("steps") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
									children: step.inSession ? `${step.minutes} ${t("minutes")}` : t("stepInSession")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dsh-lingualab-time",
									children: [
										Math.floor(record.seconds / 60),
										":",
										String(record.seconds % 60).padStart(2, "0")
									]
								}),
								step.inSession ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `dsh-lingualab-btn${isRunning ? " is-on" : ""}`,
									onClick: () => setRunning(isRunning ? null : step.id),
									children: isRunning ? t("stepStop") : t("stepStart")
								}) : null
							]
						}, step.id);
					})
				})]
			});
		}
		//#endregion
		//#region src/client/widgets/subtitle-panel/ui/SubtitlePanel.tsx
		/**
		* The subtitle list — the page's spine.
		*
		* One row per cue, the active row kept in view, and a loop button on every row so
		* "play this sentence again" costs one click instead of two A/B keystrokes. The
		* Chinese line is rendered according to the current display mode rather than
		* hidden by hand, so the four modes stay in {@link visibleCueLines} where they
		* are tested.
		*/
		/** The scrolling list of cues. */
		function SubtitlePanel({ t, cues, activeIndex, zhMode }) {
			const activeRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				activeRef.current?.scrollIntoView({ block: "nearest" });
			}, [activeIndex]);
			if (cues.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-empty",
				children: t("noSubtitles")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-cues",
				children: cues.map((cue, index) => {
					const isActive = index === activeIndex;
					const lines = visibleCueLines(cue.text, zhMode, isActive);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						ref: isActive ? activeRef : null,
						className: `dsh-lingualab-cue${isActive ? " is-active" : ""}`,
						onClick: () => useMediaPlayer.getState().seek(cue.start),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-cue-time",
								children: formatClock(cue.start)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: lines.map((line, lineIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: line.secondary ? "dsh-lingualab-cue-zh" : "dsh-lingualab-cue-en",
								children: line.text
							}, lineIndex)) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-cue-loop",
								title: t("loopSentence"),
								onClick: (event) => {
									event.stopPropagation();
									useMediaPlayer.getState().loopSentence(index);
								},
								children: "🔂"
							})
						]
					}, `${cue.start}-${index}`);
				})
			});
		}
		//#endregion
		//#region src/client/pages/lingualab/ui/LingualabPage.tsx
		/**
		* The page body: one episode, one audio element, and the three cards around it.
		*
		* Keyboard handling lives here rather than on `window`. The earlier standalone app
		* bound its shortcuts globally and therefore owned the space bar, the arrow keys
		* and the bracket keys wherever it was open — inside a panel that shares a page
		* with a conversation, that is a hostile neighbour. The handler sits on the page
		* container, which is focusable, so the keys work while the panel has focus and
		* stop at its edge.
		*/
		/** How far the arrow keys move the position. */
		const NUDGE_SECONDS = 3;
		/** Whether a keystroke belongs to a field the reader is typing in. */
		function isTypingTarget(target) {
			if (!(target instanceof HTMLElement)) return false;
			const tag = target.tagName.toLowerCase();
			return tag === "input" || tag === "select" || tag === "textarea" || target.isContentEditable;
		}
		/** The panel's centre-column page. */
		function LingualabPage({ back, t }) {
			const { payload, loading, error, episode, cues, selectEpisode } = useLibrary();
			const notes = useNotes(episode?.id ?? null);
			const [zhMode, setZhMode] = (0, react.useState)("dim");
			const activeIndex = useMediaPlayer((state) => state.activeIndex);
			const containerRef = (0, react.useRef)(null);
			const audioRef = useAudioBinding(episode !== null && episode.audio !== null ? mediaUrl(episode.id, episode.audio) : null);
			const reset = useMediaPlayer((state) => state.reset);
			(0, react.useEffect)(() => {
				reset(cues);
			}, [cues, reset]);
			(0, react.useEffect)(() => {
				if (loading) return;
				containerRef.current?.focus();
			}, [loading]);
			const phraseFromCurrentCue = (0, react.useCallback)(() => {
				const state = useMediaPlayer.getState();
				const cue = state.cues[state.activeIndex];
				if (cue === void 0) return null;
				const lines = orderCueLines(cue.text);
				const english = lines.find((line) => !line.secondary)?.text ?? cue.text;
				const chinese = lines.find((line) => line.secondary)?.text ?? "";
				return {
					at: cue.start,
					text: english,
					zh: chinese,
					note: "",
					tags: [],
					done: false
				};
			}, []);
			const onKeyDown = (0, react.useCallback)((event) => {
				if (isTypingTarget(event.target)) return;
				const store = useMediaPlayer.getState();
				const handled = () => {
					event.preventDefault();
					event.stopPropagation();
				};
				switch (event.key) {
					case " ":
						handled();
						store.toggle();
						return;
					case "ArrowLeft":
						handled();
						store.seek(Math.max(0, store.currentTime - NUDGE_SECONDS));
						return;
					case "ArrowRight":
						handled();
						store.seek(store.currentTime + NUDGE_SECONDS);
						return;
					case "ArrowUp":
						handled();
						store.stepCue(-1);
						return;
					case "ArrowDown":
						handled();
						store.stepCue(1);
						return;
					case "l":
					case "L":
						handled();
						store.loopSentence();
						return;
					case "[":
						handled();
						store.setPoint("a");
						return;
					case "]":
						handled();
						store.setPoint("b");
						return;
					case "r":
					case "R":
						handled();
						store.clearAB();
						return;
					case "s":
					case "S":
						handled();
						store.cycleSpeed(1);
						return;
				}
			}, []);
			const episodeList = payload?.episodes ?? [];
			const hasAudio = episode?.audio != null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-page",
				ref: containerRef,
				tabIndex: -1,
				onKeyDown,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: STYLES }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-head",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: t("title") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-sub",
								children: t("subtitle")
							}),
							back !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-back",
								onClick: back,
								children: t("back")
							}) : null
						]
					}),
					episodeList.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-head",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-sub",
								children: t("episode")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
								className: "dsh-lingualab-select",
								value: episode?.id ?? "",
								onChange: (event) => selectEpisode(event.target.value),
								children: episodeList.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
									value: entry.id,
									children: [entry.title, entry.audioBytes === null ? "" : ` · ${formatBytes(entry.audioBytes)}`]
								}, entry.id))
							}),
							episode !== null && episode.audio !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-lingualab-sub",
								children: [episode.audio, episode.subtitleEn === null ? "" : ` · ${episode.subtitleEn}`]
							}) : null
						]
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("audio", {
						ref: audioRef,
						preload: "metadata",
						style: { display: "none" }
					}),
					loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-empty",
						children: "…"
					}) : null,
					!loading && payload !== null && !payload.ok && episodeList.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-card",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("noLibrary") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-hint",
								children: t("noLibraryHint")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-hint",
								children: payload.root
							})
						]
					}) : null,
					!loading && payload?.ok === true && episodeList.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-empty",
						children: t("noEpisodes")
					}) : null,
					!loading && error !== null && episodeList.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-warn",
						children: [
							t("loadFailed"),
							": ",
							error
						]
					}) : null,
					episode !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-grid",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: 12,
								minWidth: 0
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ControlBar, {
									t,
									zhMode,
									onZhMode: setZhMode,
									disabled: !hasAudio
								}),
								!hasAudio ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-warn",
									children: t("noAudio")
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-lingualab-card",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("subtitles") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubtitlePanel, {
											t,
											cues,
											activeIndex,
											zhMode
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "dsh-lingualab-hint",
											style: { marginTop: 8 },
											children: t("shortcutHint")
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: 12,
								minWidth: 0
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NotesPanel, {
								t,
								notes,
								phraseFromCurrentCue
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StepTracker, {
								t,
								episode: episode.id
							}, episode.id)]
						})]
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
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: 40,
				locale: NS,
				label: () => t("panel")
			}, LingualabIcon));
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
