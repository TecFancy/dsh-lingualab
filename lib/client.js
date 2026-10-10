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
			appTitle: "语言实验室",
			backToList: "全部剧集",
			close: "关闭",
			saving: "保存中",
			mediaFolderSaving: "保存中",
			saved: "已保存",
			saveFailed: "保存失败",
			retry: "重试",
			openEpisode: "打开一集",
			notesChip: "笔记",
			stepsChip: "五步",
			mediaFolder: "媒体目录",
			more: "更多",
			change: "更改",
			welcomeTitle: "把音频拖进来，就能开始",
			welcomeBody: "拖入一个音频文件和它的字幕（srt、vtt、lrc），语言实验室会替你放好。也可以一次拖入很多集。",
			welcomeNaming: "字幕文件名以音频文件名开头就会自动配对，例如 s01e01.mp3 与 s01e01.en.srt、s01e01.zh.srt。",
			chooseFiles: "选择文件",
			addFiles: "添加文件",
			browseExisting: "浏览已有的文件",
			homeStart: "从这里开始",
			homeContinue: "接着上次",
			homeEpisodes: "全部剧集",
			homeOthers: "其他剧集",
			dropStrip: "把更多音频和字幕拖到这里",
			startPractice: "开始练习",
			resumePractice: "继续练习",
			stoppedAt: "听到 {time}",
			notesKept: "收藏",
			filesLiveIn: "文件放在",
			currentGone: "上次打开的一集不在了",
			noWorkspaces: "没有可浏览的工作区",
			dirUnreadable: "这个目录读不了",
			dropRelease: "松手就导入",
			dropAccepts: "音频：mp3 m4a wav ogg opus flac；字幕：srt vtt lrc",
			importing: "正在导入 {done} / {total}",
			importDone: "已导入 {saved} / {total} 个文件",
			importExisted: "有 {count} 个文件原来就在，没有覆盖（{folders}）。要换掉它，先把原文件删了再拖一次",
			importFailed: "没有导入",
			importUnmatched: "这些字幕没有导入，找不到对应的音频，也没有同名的剧集",
			importIgnored: "这些不是音频或字幕，已跳过",
			openImported: "打开这一集",
			dismiss: "知道了",
			stageLoading: "正在读取这一集",
			libraryLoading: "正在读取你的素材库",
			play: "播放",
			pause: "暂停",
			prevCue: "上一句",
			nextCue: "下一句",
			loopSentence: "循环本句",
			loopShort: "循环",
			setA: "设 A 点",
			setB: "设 B 点",
			clearAb: "清掉 A-B",
			loopAb: "循环一段（A 到 B）",
			repeatTimes: "重复次数",
			speed: "变速",
			zhMode: "中文显示",
			zhAlways: "中文：常显",
			zhDim: "中文：弱化",
			zhActiveOnly: "中文：仅当前句",
			zhHidden: "中文：隐藏",
			noAudio: "这一集没有音频",
			noSubtitles: "这一集没有字幕，只能整段听",
			subtitleFailed: "字幕没有读出来",
			shortcutHint: "空格 播放 · ←→ 上下句 · L 循环 · S 收藏",
			keepWith: "S 收藏当前句",
			keysInactive: "点一下页面，快捷键才生效",
			keyPlay: "播放或暂停",
			keySentence: "上一句 / 下一句",
			keyBrowse: "浏览列表，回车播放那一句",
			keyLoop: "循环这一句",
			keyKeep: "收藏或取消收藏",
			keyChinese: "切换中文显示",
			keySpeed: "变慢 / 变快",
			keyMarks: "设 A 点 / 设 B 点",
			keyReveal: "跟读时揭晓英文",
			cueOf: "第 {n} / {total} 句",
			seekBar: "播放进度",
			noAudioHint: "回到全部剧集，换一集，或者把音频拖进来。",
			noSubtitlesHint: "可以先整段听，字幕拖进来以后重新打开这一集。",
			transcript: "字幕",
			transcriptCount: "{count} 句",
			follow: "自动跟随",
			followHint: "开着时，列表跟着播放的句子滚动",
			shadowShort: "跟读",
			shadowHint: "跟读模式：每句播完停住并遮住英文，你先说，再按 R 揭晓",
			reveal: "揭晓",
			copy: "复制",
			copied: "已复制",
			wordAdd: "记进备注",
			wordAdded: "已记下",
			hintPlay: "播放",
			hintSentence: "上下句",
			hintLoop: "循环",
			hintKeep: "收藏",
			hintChinese: "中文",
			hintReveal: "揭晓",
			finishTitle: "这一集听完了",
			finishSentences: "句听过",
			finishKept: "句收藏",
			finishPractising: "句还在练",
			finishNext: "下一集：{title}",
			finishAgain: "再听一遍",
			finishClose: "先不管，留在这里",
			keep: "收藏",
			kept: "已收藏",
			keepHint: "收藏这一句（S）",
			unkeepHint: "取消收藏（S）",
			subtitleBadgeNone: "没有字幕",
			subtitleBadgeEn: "英文字幕",
			subtitleBadgeZh: "中文字幕",
			subtitleBadgeBoth: "中英字幕",
			subtitleBadgeUnknown: "字幕待确认",
			notes: "收藏的句子",
			viewActive: "还在练",
			viewDone: "已记住",
			viewAll: "全部",
			notesEmpty: "还没有收藏。听到想留的句子，点一下星标。",
			notesAllDone: "都记住了，这一集没有要练的句子了。",
			notesNoneHere: "这里没有句子。",
			notesFootnote: "打勾表示记住了，勾掉的句子会从「还在练」里退出，不会被删掉。",
			notesMarkDone: "记住了，打勾",
			notesEditorPlaceholder: "备注：谁说的、什么场景",
			notesEdit: "编辑备注",
			notesDelete: "删掉",
			notesDeleted: "已删掉 {time} 那一句",
			notesUndo: "撤销",
			notesReplay: "回放并循环这一句",
			notesSubtitle: "{episode} · 共 {count} 句",
			review: "想不起",
			hard: "还记不住",
			pickerBrowseTitle: "浏览已有的文件",
			pickerSearch: "按标题或文件名找",
			pickerEpisodes: "剧集文件夹",
			pickerEmptyFolder: "这里没有音频或剧集文件夹",
			pickerNoAudio: "没有音频",
			pickerParent: "上一级",
			pickerTruncated: "只列了一部分，输入关键词缩小范围",
			pickerOpenFolder: "作为剧集打开",
			pickerLoading: "正在读取",
			pickerConvention: "建议",
			pickerPlace: "工作区",
			pickerGroupFolders: "文件夹 · {count}",
			pickerGroupAudio: "音频 · {count}",
			pickerGroupOther: "其他文件 · {count}",
			pickerEmptyHint: "把音频放进这个文件夹，或者回到首页直接拖进来。",
			pickerNoMatch: "没有名字里带「{query}」的文件",
			pickerKeys: "↑↓ 选择 · Enter 打开 · Backspace 上一级 · Esc 关闭",
			pickerFooterHint: "把「{name}」设为媒体库",
			mediaFolderHint: "导入的文件会放进这个目录，一集一个文件夹；也可以直接把音频放在根目录。",
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
			mediaFolderBrowseHint: "也可以到「浏览已有的文件」里进到目标目录，再点「用作媒体库」。",
			stepsTitle: "五步法",
			stepsProgress: "已完成 {done} / {total} 步",
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
		/** English copy, same keys, same order. */
		const en = {
			back: "← Back to conversation",
			appTitle: "Language Lab",
			backToList: "All episodes",
			close: "Close",
			saving: "Saving",
			mediaFolderSaving: "Saving",
			saved: "Saved",
			saveFailed: "Could not save",
			retry: "Retry",
			openEpisode: "Open an episode",
			notesChip: "Notes",
			stepsChip: "Steps",
			mediaFolder: "Media folder",
			more: "More",
			change: "Change",
			welcomeTitle: "Drop audio here to begin",
			welcomeBody: "Drop an audio file with its subtitles (srt, vtt, lrc) and Language Lab files them for you. Dropping a whole season at once works too.",
			welcomeNaming: "Subtitles pair up by name: a file that starts with the audio file name belongs to it, such as s01e01.mp3 with s01e01.en.srt and s01e01.zh.srt.",
			chooseFiles: "Choose files",
			addFiles: "Add files",
			browseExisting: "Browse existing files",
			homeStart: "Start here",
			homeContinue: "Pick up where you left off",
			homeEpisodes: "All episodes",
			homeOthers: "Other episodes",
			dropStrip: "Drop more audio and subtitles here",
			startPractice: "Start practising",
			resumePractice: "Continue practising",
			stoppedAt: "Stopped at {time}",
			notesKept: "Kept",
			filesLiveIn: "Files live in",
			currentGone: "The episode you had open is gone",
			noWorkspaces: "No workspace to browse",
			dirUnreadable: "This folder cannot be read",
			dropRelease: "Release to import",
			dropAccepts: "Audio: mp3 m4a wav ogg opus flac. Subtitles: srt vtt lrc",
			importing: "Importing {done} of {total}",
			importDone: "Imported {saved} of {total} files",
			importExisted: "{count} files were already there and were not overwritten ({folders}). To replace one, delete the original and drop it again",
			importFailed: "Not imported",
			importUnmatched: "Not imported: no audio for these subtitles, and no episode of that name",
			importIgnored: "Not audio or subtitles, skipped",
			openImported: "Open this episode",
			dismiss: "Got it",
			stageLoading: "Loading this episode",
			libraryLoading: "Loading your library",
			play: "Play",
			pause: "Pause",
			prevCue: "Previous sentence",
			nextCue: "Next sentence",
			loopSentence: "Loop this sentence",
			loopShort: "Loop",
			setA: "Set point A",
			setB: "Set point B",
			clearAb: "Clear A-B",
			loopAb: "Loop a stretch (A to B)",
			repeatTimes: "Repeat",
			speed: "Speed",
			zhMode: "Chinese",
			zhAlways: "Chinese: always",
			zhDim: "Chinese: dimmed",
			zhActiveOnly: "Chinese: current only",
			zhHidden: "Chinese: hidden",
			noAudio: "This episode has no audio",
			noSubtitles: "No subtitles in this episode, listen straight through",
			subtitleFailed: "The subtitles did not load",
			shortcutHint: "Space play · ←→ sentences · L loop · S keep",
			keepWith: "S keeps this sentence",
			keysInactive: "Click the page to use the shortcuts",
			keyPlay: "Play or pause",
			keySentence: "Previous / next sentence",
			keyBrowse: "Browse the list, Enter plays it",
			keyLoop: "Loop this sentence",
			keyKeep: "Keep or unkeep",
			keyChinese: "Cycle the Chinese display",
			keySpeed: "Slower / faster",
			keyMarks: "Set point A / point B",
			keyReveal: "Reveal the English while shadowing",
			cueOf: "Sentence {n} of {total}",
			seekBar: "Playback position",
			noAudioHint: "Go back to all episodes and pick another, or drop the audio in.",
			noSubtitlesHint: "You can listen straight through; drop the subtitles in, then open this episode again.",
			transcript: "Subtitles",
			transcriptCount: "{count} sentences",
			follow: "Auto-follow",
			followHint: "When on, the list scrolls with the sentence that is playing",
			shadowShort: "Shadow",
			shadowHint: "Shadowing: each sentence stops after it plays with the English hidden, you say it first, then press R",
			reveal: "Reveal",
			copy: "Copy",
			copied: "Copied",
			wordAdd: "Add to note",
			wordAdded: "Added",
			hintPlay: "play",
			hintSentence: "sentences",
			hintLoop: "loop",
			hintKeep: "keep",
			hintChinese: "Chinese",
			hintReveal: "reveal",
			finishTitle: "Episode finished",
			finishSentences: "sentences heard",
			finishKept: "kept",
			finishPractising: "still practising",
			finishNext: "Next: {title}",
			finishAgain: "Listen again",
			finishClose: "Not now, stay here",
			keep: "Keep",
			kept: "Kept",
			keepHint: "Keep this sentence (S)",
			unkeepHint: "Unkeep (S)",
			subtitleBadgeNone: "no subtitles",
			subtitleBadgeEn: "English subtitles",
			subtitleBadgeZh: "Chinese subtitles",
			subtitleBadgeBoth: "both tracks",
			subtitleBadgeUnknown: "subtitles unchecked",
			notes: "Kept sentences",
			viewActive: "Practising",
			viewDone: "Learned",
			viewAll: "All",
			notesEmpty: "Nothing kept yet. Tap the star on a sentence worth keeping.",
			notesAllDone: "All learned, nothing left to practise in this episode.",
			notesNoneHere: "No sentences here.",
			notesFootnote: "Tick a sentence once it sticks. It leaves the practising list but is never deleted.",
			notesMarkDone: "Learned, tick it",
			notesEditorPlaceholder: "Note: who said it, in what scene",
			notesEdit: "Edit note",
			notesDelete: "Delete",
			notesDeleted: "Deleted the sentence at {time}",
			notesUndo: "Undo",
			notesReplay: "Replay and loop this sentence",
			notesSubtitle: "{episode} · {count} kept",
			review: "Review",
			hard: "Hard",
			pickerBrowseTitle: "Browse existing files",
			pickerSearch: "Filter by title or file name",
			pickerEpisodes: "Episode folders",
			pickerEmptyFolder: "No audio or episode folders here",
			pickerNoAudio: "no audio",
			pickerParent: "Up one level",
			pickerTruncated: "Only part of the list is shown, type to narrow it",
			pickerOpenFolder: "Open as an episode",
			pickerLoading: "Loading",
			pickerConvention: "Suggested",
			pickerPlace: "Workspace",
			pickerGroupFolders: "Folders · {count}",
			pickerGroupAudio: "Audio · {count}",
			pickerGroupOther: "Other files · {count}",
			pickerEmptyHint: "Put audio in this folder, or go back to the home page and drop it in.",
			pickerNoMatch: "No file name contains \"{query}\"",
			pickerKeys: "↑↓ select · Enter open · Backspace up · Esc close",
			pickerFooterHint: "Make \"{name}\" the media folder",
			mediaFolderHint: "Imported files go into this folder, one folder per episode, or audio straight in the root.",
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
			mediaFolderBrowseHint: "Or open it under 「Browse existing files」 and choose 「Use as media folder」.",
			stepsTitle: "The five steps",
			stepsProgress: "{done} of {total} steps done",
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
				const addition = chineseLinesOf(candidate.text, cue.text);
				return addition.length === 0 ? cue : {
					...cue,
					text: `${cue.text}\n${addition}`
				};
			});
		}
		/**
		* What of a Chinese-track cue is worth appending to an English cue.
		*
		* The track is often a bilingual file (`xxx_双语.srt`) paired with a plain English
		* one, so its cues already carry the English line. Appending them whole would show
		* the English twice, so only the lines with Chinese in them are kept. A track with
		* no Chinese at all is a mislabelled one: its lines are kept except the ones the
		* English cue already says.
		*/
		function chineseLinesOf(chineseText, englishText) {
			const lines = chineseText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
			const chinese = lines.filter(hasCjk);
			if (chinese.length > 0) return chinese.join("\n");
			const known = new Set(englishText.split("\n").map((line) => line.trim()));
			return lines.filter((line) => !known.has(line)).join("\n");
		}
		//#endregion
		//#region src/client/entities/cue/lib/split.ts
		/** The English and Chinese halves of one cue, split the way the notes file wants them. */
		function splitCue(cue) {
			const lines = orderCueLines(cue.text);
			return {
				english: lines.find((line) => !line.secondary)?.text ?? cue.text,
				chinese: lines.find((line) => line.secondary)?.text ?? ""
			};
		}
		//#endregion
		//#region src/client/entities/cue/lib/tokenize.ts
		/** Letters and digits, with `'`, `’` and `-` allowed between two of them. */
		const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
		/** Split a line into alternating gaps and words; joining the texts gives the line back. */
		function tokenizeEnglish(line) {
			const tokens = [];
			let cursor = 0;
			for (const match of line.matchAll(WORD)) {
				const at = match.index;
				if (at > cursor) tokens.push({
					text: line.slice(cursor, at),
					word: false
				});
				tokens.push({
					text: match[0],
					word: true
				});
				cursor = at + match[0].length;
			}
			if (cursor < line.length) tokens.push({
				text: line.slice(cursor),
				word: false
			});
			return tokens;
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
		/** The header an import request must carry, so a cross-origin page cannot send one blind. */
		const IMPORT_HEADER = "x-lingualab-import";
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
		/**
		* Send one dropped file to the library.
		*
		* `fetch` is the only way to stream a `File` as a body without reading it into memory
		* first, and the custom header is what the host checks to know the request came from
		* this page. A refusal is an answer, not an exception: a wrong file type is a normal
		* thing to drop.
		* @param file - the file the reader dropped or picked.
		* @param episode - the folder to put it in; empty lets the host name it after the file.
		*/
		async function importMedia(file, episode) {
			const refused = (reason) => ({
				ok: false,
				code: "refused",
				reason,
				episode: null,
				file: file.name,
				bytes: 0,
				root: null
			});
			if (file.size > 2147483648) return refused("文件太大，单个最多 2 GB");
			const params = new URLSearchParams({
				file: file.name,
				episode
			});
			try {
				const payload = await (await fetch(`${IMPORT_PATH}?${params.toString()}`, {
					method: "POST",
					headers: {
						[IMPORT_HEADER]: "1",
						"content-type": "application/octet-stream"
					},
					body: file
				})).json();
				return typeof payload.ok === "boolean" ? payload : refused("主机没有回答");
			} catch (error) {
				return refused(String(error));
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
		/**
		* Send this browser's progress to the host and take the merged table back.
		*
		* `null` means the host did not answer (down, signed out, no library), which the caller
		* treats as "keep working from the cache". `keepalive` lets the request outlive a closing
		* tab, at the price of a 64 KB body limit the caller checks first.
		*/
		async function syncProgress(table, keepalive = false) {
			try {
				const payload = await (await fetch(PROGRESS_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(table),
					keepalive
				})).json();
				return typeof payload.ok === "boolean" ? payload : null;
			} catch {
				return null;
			}
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
		//#endregion
		//#region src/client/features/import-media/lib/group.ts
		/**
		* Turning a handful of dropped files into episodes.
		*
		* A reader drags what they have: an audio file and its subtitles, or a whole season's
		* worth of both. The page has to decide which files belong together without asking,
		* because the question "which subtitle goes with which audio" is the one thing the
		* drop was supposed to spare them.
		*
		* The rule is the host's pairing rule, kept in step with `src/host/pairing.ts`: a
		* subtitle belongs to the audio file whose stem it starts with, followed by a separator
		* (`lesson.mp3` owns `lesson.srt`, `lesson.en.srt`, `lesson_zh.srt`; it does not own
		* `lesson2.srt`). The longest matching stem wins, so `lesson-2.mp3` takes `lesson-2.srt`
		* even though `lesson.mp3` is also a prefix of it.
		*
		* A subtitle that matches no audio file is not dropped silently: when exactly one audio
		* file was dropped it joins that episode (a lone `.srt` beside a lone `.mp3` is
		* obviously a pair even when the names disagree), and otherwise it is reported as
		* unmatched so the page can say so.
		*/
		/** What a dropped file is, by name alone. The host re-checks every file it receives. */
		function kindOf(name) {
			if (name.lastIndexOf(".") < 0) return "other";
			const extension = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
			if (AUDIO_EXTENSIONS.includes(extension)) return "audio";
			if (SUBTITLE_EXTENSIONS.includes(extension)) return "subtitle";
			return "other";
		}
		/**
		* Pair a drop's subtitles with its audio files.
		* @param files - the dropped items.
		* @param nameOf - how to read an item's file name, so the logic needs no `File`.
		*/
		function planDrop(files, nameOf) {
			const audio = files.filter((file) => kindOf(nameOf(file)) === "audio");
			const subtitles = files.filter((file) => kindOf(nameOf(file)) === "subtitle");
			const ignored = files.filter((file) => kindOf(nameOf(file)) === "other");
			const owned = new Map(audio.map((file) => [file, []]));
			const unmatched = [];
			for (const subtitle of subtitles) {
				const name = nameOf(subtitle);
				let best = null;
				let bestLength = -1;
				for (const candidate of audio) {
					const stem = stemOf(nameOf(candidate));
					if (sameStem(name, stem) && stem.length > bestLength) {
						best = candidate;
						bestLength = stem.length;
					}
				}
				if (best === null && audio.length === 1) best = audio[0] ?? null;
				if (best === null) unmatched.push(subtitle);
				else owned.get(best)?.push(subtitle);
			}
			return {
				groups: audio.map((file) => ({
					episode: stemOf(nameOf(file)),
					audio: file,
					subtitles: owned.get(file) ?? []
				})),
				unmatched,
				ignored
			};
		}
		//#endregion
		//#region src/client/features/import-media/model/useImport.ts
		/**
		* Dropping files on the page, and what the page is told about it.
		*
		* Uploads run one file at a time, audio before its subtitles. Parallel uploads would
		* finish sooner on paper and be worse in use: two gigabyte files competing for one
		* local connection both take longer to show anything, while a sequence gives the page
		* a true "2 of 5" and lets the first episode become playable as soon as it is whole.
		*
		* Every file's outcome is kept, not just the overall one. "Saved", "already there" and
		* "refused, and why" are three different things to tell somebody who dropped twelve
		* files, and collapsing them into a single success flag would hide exactly the file
		* they are about to wonder about.
		*
		* Two rules about a group of files that belong together:
		*
		*   · **Subtitles follow their audio.** If the audio is refused, its subtitles are not
		*     sent. They would create a folder with subtitles and nothing to play, which the home
		*     hides and which cannot be opened.
		*   · **A subtitle with no audio in the drop** joins the episode folder it names, when
		*     one exists. Adding a translation the next day is a normal thing to do, and "no audio
		*     found" would be the wrong answer to it.
		*/
		/** How often a "the host is busy" answer is retried, and how long to wait between tries. */
		const BUSY_RETRIES = 6;
		const BUSY_WAIT_MS = 800;
		/** Wait, for the retry. A function so a test can stand in for the clock. */
		const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		/**
		* The folder an episode's loose subtitle belongs to, if the library has one.
		*
		* Matches the subtitle's stem against existing episode folder names with the same rule the
		* host pairs by (the folder name, then a separator), longest name first.
		* @param subtitle - the subtitle file's name.
		* @param folders - the episode folder names the library lists.
		*/
		function folderForSubtitle(subtitle, folders) {
			let best = null;
			for (const folder of folders) if (sameStem(subtitle, folder) && (best === null || folder.length > best.length)) best = folder;
			return best;
		}
		/** Import dropped or picked files into the library. */
		function useImport(onFinished, existingFolders = []) {
			const [busy, setBusy] = (0, react.useState)(false);
			const [done, setDone] = (0, react.useState)(0);
			const [total, setTotal] = (0, react.useState)(0);
			const [current, setCurrent] = (0, react.useState)(null);
			const [outcomes, setOutcomes] = (0, react.useState)([]);
			const [unmatched, setUnmatched] = (0, react.useState)([]);
			const [ignored, setIgnored] = (0, react.useState)([]);
			const [lastEpisode, setLastEpisode] = (0, react.useState)(null);
			const running = (0, react.useRef)(false);
			return {
				busy,
				done,
				total,
				current,
				outcomes,
				unmatched,
				ignored,
				lastEpisode,
				start: (0, react.useCallback)(async (files) => {
					if (running.current || files.length === 0) return null;
					running.current = true;
					const plan = planDrop(files, (file) => file.name);
					const adopted = [];
					const orphans = [];
					for (const file of plan.unmatched) {
						const folder = folderForSubtitle(file.name, existingFolders);
						if (folder === null) orphans.push(file);
						else adopted.push({
							file,
							episode: folder
						});
					}
					const groups = plan.groups.map((group) => ({
						episode: group.episode,
						audio: group.audio,
						subtitles: group.subtitles
					}));
					const total = groups.reduce((sum, group) => sum + 1 + group.subtitles.length, 0) + adopted.length;
					setBusy(true);
					setDone(0);
					setTotal(total);
					setOutcomes([]);
					setUnmatched(orphans.map((file) => file.name));
					setIgnored(plan.ignored.map((file) => file.name));
					setLastEpisode(null);
					const results = [];
					let first = null;
					/** Send one file, retrying while the host says it is busy, and record the outcome. */
					const send = async (file, episode) => {
						setCurrent(file.name);
						let answer = await importMedia(file, episode);
						for (let attempt = 0; attempt < BUSY_RETRIES && answer.retryable === true; attempt += 1) {
							await pause(BUSY_WAIT_MS);
							answer = await importMedia(file, episode);
						}
						results.push({
							name: file.name,
							episode: answer.episode ?? episode,
							status: answer.code,
							reason: answer.reason
						});
						setOutcomes([...results]);
						setDone(results.length);
						if (first === null && answer.ok && answer.episode !== null) first = answer.episode;
						return answer.ok;
					};
					try {
						for (const group of groups) {
							const audioOk = await send(group.audio, group.episode);
							for (const subtitle of group.subtitles) {
								if (audioOk) {
									await send(subtitle, group.episode);
									continue;
								}
								results.push({
									name: subtitle.name,
									episode: group.episode,
									status: "skipped",
									reason: `没有导入，因为 ${group.audio.name} 没有导入成功`
								});
								setOutcomes([...results]);
								setDone(results.length);
							}
						}
						for (const item of adopted) await send(item.file, item.episode);
					} finally {
						running.current = false;
						setBusy(false);
						setCurrent(null);
					}
					setLastEpisode(first);
					if (results.some((result) => result.status === "saved")) onFinished();
					return first;
				}, [onFinished, existingFolders]),
				dismiss: (0, react.useCallback)(() => {
					setOutcomes([]);
					setUnmatched([]);
					setIgnored([]);
					setLastEpisode(null);
					setDone(0);
					setTotal(0);
				}, [])
			};
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
		/** How far past a sentence's end a position still counts as having just finished it. */
		const SHADOW_WINDOW_S = 1.5;
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
			pauseAfterSentence: false,
			finished: false,
			finishCount: 0,
			revealed: -1,
			reset: (cues) => set((state) => ({
				cues,
				activeIndex: findActiveCue(cues, 0),
				isPlaying: false,
				currentTime: 0,
				loopMode: "none",
				repeats: DEFAULT_REPEATS,
				playsDone: 0,
				pointA: null,
				pointB: null,
				seekRequest: null,
				seekToken: state.seekToken + 1,
				guard: null,
				finished: false,
				revealed: -1
			})),
			setPlaying: (playing) => set((state) => ({
				isPlaying: playing,
				finished: playing ? false : state.finished,
				revealed: playing ? -1 : state.revealed
			})),
			setPauseAfterSentence: (on) => set({ pauseAfterSentence: on }),
			markFinished: () => set((state) => ({
				isPlaying: false,
				finished: true,
				finishCount: state.finishCount + 1
			})),
			reveal: (index) => set({ revealed: index }),
			toggle: () => set((state) => ({
				isPlaying: !state.isPlaying,
				finished: false,
				revealed: state.isPlaying ? state.revealed : -1
			})),
			seek: (time) => set((state) => ({
				seekRequest: Math.max(0, time),
				seekToken: state.seekToken + 1,
				currentTime: Math.max(0, time),
				activeIndex: findActiveCue(state.cues, time),
				guard: {
					target: Math.max(0, time),
					expiresAt: Date.now() + SEEK_GUARD_MS
				},
				finished: false
			})),
			onTime: (time) => {
				const { guard, cues } = get();
				if (guard !== null) {
					if (Date.now() <= guard.expiresAt) return;
					set({ guard: null });
				}
				const state = get();
				const heard = state.cues[state.activeIndex];
				if (state.pauseAfterSentence && state.loopMode === "none" && state.isPlaying && heard !== void 0 && time >= heard.end && time < heard.end + SHADOW_WINDOW_S) {
					set({
						isPlaying: false,
						revealed: state.activeIndex
					});
					get().seek(heard.start);
					return;
				}
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
			nextSpeedWrapping: () => set((state) => ({ speedIndex: (clampSpeed(state.speedIndex) + 1) % SPEED_PRESETS.length })),
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
				if (state.pauseAfterSentence) set({ isPlaying: true });
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
				useMediaPlayer.getState().setDuration(0);
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
				const onEnded = () => store().markFinished();
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
		/** Whether another phrase fits under the sanity ceiling. */
		function phraseCapacity(phrases) {
			const remaining = Math.max(0, 500 - phrases.length);
			return {
				full: remaining === 0,
				remaining
			};
		}
		/**
		* Whether two phrases are the same kept sentence.
		*
		* `notes.md` stores whole seconds (`00:12`), so a sentence kept at 12.48 s reads back as
		* 12. Comparing the raw numbers therefore stopped matching the moment a page reloaded:
		* the star showed empty, the wrong row showed a filled one, and pressing it again added a
		* second copy that nothing could remove. The comparison is on the whole second the file
		* can actually hold, and on the text as well, because two short sentences can start in
		* the same second and must not be mistaken for each other.
		* @param left - one phrase, or a timestamp and the sentence's text.
		* @param right - the other.
		* @returns true when they name the same sentence.
		*/
		function sameKeptSentence(left, right) {
			return keptSentenceKey(left) === keptSentenceKey(right);
		}
		/**
		* The key two phrases share when they are the same kept sentence.
		*
		* Exposed so a list of hundreds of cues can be checked against hundreds of phrases with a
		* set lookup instead of a nested loop, and so the loop and sameKeptSentence cannot
		* disagree: one is defined by the other.
		* @param sentence - a phrase, or a cue's start and its English text.
		* @returns the key.
		*/
		function keptSentenceKey(sentence) {
			return `${String(Math.floor(sentence.at))}\u0000${sentence.text.trim()}`;
		}
		//#endregion
		//#region src/client/features/notes/model/useNotes.ts
		/**
		* The notes list for one episode.
		*
		* Saving is debounced and whole-file: the panel writes after a pause, and each write
		* replaces that episode's markdown. Two details are the difference between "usually
		* works" and "lost my notes once":
		*
		*   · every pending write is flushed when the episode changes, so an edit made
		*     half a second before switching is not thrown away with the timer;
		*   · the list is tagged with the episode it belongs to, and a mutation that
		*     arrives after a switch is dropped rather than written under the new id.
		*
		* There is no ceiling to ask about any more. Keeping a sentence is one gesture, and
		* the same gesture on the same sentence takes it back, so the star on a row is a
		* switch and not a button with a side effect.
		*/
		/** How long the panel waits after the last change before writing. */
		const SAVE_DEBOUNCE_MS = 600;
		const NOTHING_LOADED = {
			id: null,
			phrases: []
		};
		/** Same reason as `NO_CUES` in the library hook: a stable identity per render. */
		const NO_PHRASES = [];
		/** Whether the reader has done anything to a kept sentence beyond keeping it. */
		function hasUserWork(phrase) {
			return phrase.note.length > 0 || phrase.tags.length > 0 || phrase.done;
		}
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
			const has = (0, react.useCallback)((sentence) => visible.some((phrase) => sameKeptSentence(phrase, sentence)), [visible]);
			const add = (0, react.useCallback)((phrase) => {
				if (capacity.full) return false;
				mutate((current) => [...current, phrase]);
				return true;
			}, [capacity.full, mutate]);
			const toggle = (0, react.useCallback)((phrase) => {
				const existing = visible.find((item) => sameKeptSentence(item, phrase));
				if (existing !== void 0) {
					if (hasUserWork(existing)) return "protected";
					mutate((current) => current.filter((item) => !sameKeptSentence(item, phrase)));
					return "removed";
				}
				return add(phrase) ? "added" : "full";
			}, [
				add,
				mutate,
				visible
			]);
			const update = (0, react.useCallback)((index, patch) => {
				mutate((current) => current.map((item, at) => at === index ? {
					...item,
					...patch
				} : item));
			}, [mutate]);
			const remove = (0, react.useCallback)((index) => {
				mutate((current) => current.filter((_, at) => at !== index));
			}, [mutate]);
			const restore = (0, react.useCallback)((phrase, index) => {
				mutate((current) => {
					if (current.some((item) => sameKeptSentence(item, phrase))) return current;
					const at = Math.min(Math.max(index, 0), current.length);
					return [
						...current.slice(0, at),
						phrase,
						...current.slice(at)
					];
				});
			}, [mutate]);
			return {
				phrases: visible,
				status,
				reason,
				full: capacity.full,
				add,
				toggle,
				has,
				update,
				remove,
				restore
			};
		}
		//#endregion
		//#region src/client/features/notes/lib/words.ts
		/**
		* Words kept inside a sentence's note.
		*
		* A word picked from the stage is stored in the note of the sentence it came from,
		* as `[word]`, so it stays in the one file the agent already reads and needs no new
		* field in the notes format. The brackets are what make a word findable again: the
		* popover asks whether `[word]` is already there, and a note the reader typed by hand
		* is never mistaken for one.
		*/
		/** The marker a word carries inside a note. */
		function marked(word) {
			return `[${word.trim()}]`;
		}
		/** Whether the note already holds this word, ignoring case. */
		function noteHasWord(note, word) {
			return note.toLowerCase().includes(marked(word).toLowerCase());
		}
		/** The note with the word added at the end; unchanged when it is already there. */
		function addWordToNote(note, word) {
			const clean = word.trim();
			if (clean.length === 0 || noteHasWord(note, clean)) return note;
			return note.length === 0 ? marked(clean) : `${note} ${marked(clean)}`;
		}
		/**
		* A note pulled apart for display: the [word] markers as a list, and what is left as text.
		* The stored note is never changed by this, only shown differently.
		*/
		function splitNote(note) {
			const words = [];
			return {
				words,
				text: note.replace(/\[([^\]]+)\]/g, (_match, word) => {
					words.push(word.trim());
					return " ";
				}).replace(/\s+/g, " ").trim()
			};
		}
		/** The longest episode id kept as a key; a longer one is not an id this plugin made. */
		const MAX_ID_LENGTH = 300;
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
			return newestFirst(table, 100);
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
				progress: mergeNewest(base.progress, other.progress, 100),
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
		//#region src/client/features/resume/model/store.ts
		/**
		* This browser's cache of the reader's progress.
		*
		* The host holds the shared copy (see `src/host/progress.ts`); this is what the page reads
		* and writes synchronously, so the home page never waits on a request and a closed tab
		* loses nothing the host had not yet seen. Two keys, both whole tables:
		*
		*   · `dsh-lingualab:progress` — listening position per episode, the shape this plugin has
		*     always stored, so an existing bookmark survives the upgrade;
		*   · `dsh-lingualab:steps`    — the five-step ticks per episode.
		*
		* Earlier versions kept the ticks under one key per episode (`dsh-lingualab:steps:<id>`).
		* They are folded into the table once and the old keys removed, stamped just above zero so
		* any tick made since on another device wins over them.
		*
		* Every read tolerates a cleared, full or hand-edited storage: a cache that throws would
		* take the home page down with it.
		*/
		const PROGRESS_KEY = "dsh-lingualab:progress";
		const STEPS_KEY = "dsh-lingualab:steps";
		const LEGACY_STEPS_PREFIX = "dsh-lingualab:steps:";
		let migrated = false;
		/** Parse one stored value, or `null` when it is absent or not JSON. */
		function readJson(key) {
			try {
				const raw = window.localStorage.getItem(key);
				return raw === null ? null : JSON.parse(raw);
			} catch {
				return null;
			}
		}
		/** Fold the per-episode step keys of earlier versions into the table, once per page load. */
		function migrateLegacySteps() {
			if (migrated) return;
			migrated = true;
			try {
				const storage = window.localStorage;
				const legacy = [];
				for (let index = 0; index < storage.length; index += 1) {
					const key = storage.key(index);
					if (key !== null && key.startsWith(LEGACY_STEPS_PREFIX) && key.length > 20) legacy.push(key);
				}
				if (legacy.length === 0) return;
				const steps = { ...sanitizeStepsTable(readJson(STEPS_KEY)) };
				for (const key of legacy) {
					const episode = key.slice(20);
					const entry = sanitizeEpisodeSteps({
						updatedAt: 1,
						records: readJson(key)
					});
					if (entry !== null && steps[episode] === void 0) steps[episode] = entry;
					storage.removeItem(key);
				}
				storage.setItem(STEPS_KEY, JSON.stringify(steps));
			} catch {}
		}
		/** Read the whole cache. */
		function readTable() {
			migrateLegacySteps();
			return {
				progress: sanitizeProgressTable(readJson(PROGRESS_KEY)),
				steps: sanitizeStepsTable(readJson(STEPS_KEY))
			};
		}
		/** Replace the whole cache. A full or disabled storage costs the cache, not the session. */
		function writeTable(table) {
			try {
				window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(table.progress));
				window.localStorage.setItem(STEPS_KEY, JSON.stringify(table.steps));
			} catch {}
		}
		//#endregion
		//#region src/client/features/resume/model/sync.ts
		/**
		* Keeping this browser's cache and the host's copy of the progress in step.
		*
		* One request does both directions: the page posts everything it has, the host merges it
		* into the library's progress file (newest `updatedAt` per episode wins) and answers with
		* the merged table, which becomes the new cache. That is why a second device needs nothing
		* special: on load it asks, and what the first device left comes back.
		*
		* When it runs:
		*
		*   · once when the page opens, so the home shows the place you stopped on another device;
		*   · a few seconds after a local change, throttled rather than debounced, because the step
		*     timer changes the cache every second and a debounce would never fire while it ran;
		*   · when the tab becomes visible again, so a device left open picks up the other one's
		*     progress without a reload;
		*   · when the tab is hidden, with `keepalive`, so closing the tab does not lose the last
		*     seconds.
		*
		* Nothing here is allowed to be loud: a host that is down or has no library just leaves the
		* cache as it was, and the page keeps working from it.
		*/
		/** How long after a local change the host is told. */
		const PUSH_DELAY_MS = 4e3;
		/** A keepalive request body may not exceed 64 KB; leave room for headers. */
		const KEEPALIVE_LIMIT = 6e4;
		let started = 0;
		let pushTimer = null;
		let running = false;
		let again = false;
		const listeners = /* @__PURE__ */ new Set();
		function notify() {
			for (const listener of listeners) listener();
		}
		/** Exchange tables with the host once, and adopt what comes back. Resolves true when the host answered. */
		async function syncNow(keepalive = false) {
			if (running) {
				again = true;
				return false;
			}
			running = true;
			try {
				const sent = readTable();
				const payload = await syncProgress(sent, keepalive && JSON.stringify(sent).length < KEEPALIVE_LIMIT);
				if (payload === null) return false;
				const current = readTable();
				const merged = mergeProgress(current, sanitizeProgress(payload));
				if (!sameProgress(merged, current)) {
					writeTable(merged);
					notify();
				}
				return payload.ok;
			} finally {
				running = false;
				if (again) {
					again = false;
					schedulePush();
				}
			}
		}
		/** Tell the host about a local change soon. Does nothing until the page has started syncing. */
		function schedulePush() {
			if (started === 0 || pushTimer !== null) return;
			pushTimer = setTimeout(() => {
				pushTimer = null;
				syncNow();
			}, PUSH_DELAY_MS);
		}
		/**
		* Start syncing for as long as the page is mounted.
		* @param onMerged - called when a sync changed the cache, so the page can re-read it.
		* @returns the disposer.
		*/
		function startProgressSync(onMerged) {
			started += 1;
			listeners.add(onMerged);
			syncNow();
			const onVisibility = () => {
				if (document.visibilityState === "hidden") {
					if (pushTimer !== null) {
						clearTimeout(pushTimer);
						pushTimer = null;
					}
					syncNow(true);
				} else syncNow();
			};
			document.addEventListener("visibilitychange", onVisibility);
			return () => {
				document.removeEventListener("visibilitychange", onVisibility);
				listeners.delete(onMerged);
				started -= 1;
				if (started === 0 && pushTimer !== null) {
					clearTimeout(pushTimer);
					pushTimer = null;
					syncNow(true);
				}
			};
		}
		//#endregion
		//#region src/client/features/resume/model/progress.ts
		/**
		* Where the reader stopped, per episode, so the home page can say "continue".
		*
		* Reads and writes go to this browser's cache (`store.ts`), which is synchronous so the
		* page never waits; `sync.ts` carries the cache to the host and back, which is what lets a
		* second device pick up the same place. Every write stamps `updatedAt`, and that stamp is
		* what decides a disagreement between devices: the newest stop wins.
		*
		* Everything here tolerates a cleared or hand-edited entry, because a bookmark that throws
		* would take the home page down with it.
		*/
		/** Read every bookmark, dropping anything that is not one. */
		function readAllProgress() {
			return readTable().progress;
		}
		/** One episode's bookmark, or `null`. */
		function readProgress(episode) {
			return readAllProgress()[episode] ?? null;
		}
		/**
		* Record where listening stopped.
		*
		* Positions under a few seconds are not worth a bookmark: they are what a fresh episode
		* reports before anyone has listened, and "continue from 0:02" is noise. A position that
		* has not moved since the last write is not rewritten either, so a paused page does not
		* keep bumping the stamp and winning every disagreement with another device.
		*/
		function writeProgress(episode, at, duration, now = Date.now()) {
			if (!Number.isFinite(at) || at < 3) return;
			const entry = sanitizeProgressEntry({
				at,
				duration: Number.isFinite(duration) ? duration : 0,
				updatedAt: now
			}, now);
			if (entry === null) return;
			const table = readTable();
			const existing = table.progress[episode];
			if (existing !== void 0 && Math.abs(existing.at - entry.at) < .5) return;
			writeTable({
				...table,
				progress: {
					...table.progress,
					[episode]: entry
				}
			});
			schedulePush();
		}
		/** How far through an episode the bookmark is, from 0 to 1. */
		function fractionOf(progress) {
			if (progress === null || progress.duration <= 0) return 0;
			return Math.min(1, Math.max(0, progress.at / progress.duration));
		}
		//#endregion
		//#region src/client/features/resume/model/steps.ts
		/**
		* The five-step ticks and stopwatches, per episode.
		*
		* Same cache and same sync as the listening position (see `progress.ts`): the table is read
		* and written synchronously here, and `sync.ts` shares it with the host. An episode's steps
		* are stamped as a unit, so when two devices disagree the one that touched them last wins
		* whole rather than being stitched together field by field.
		*/
		/** One episode's step records, keyed by step id; empty when nothing was ticked. */
		function readSteps(episode) {
			return readTable().steps[episode]?.records ?? {};
		}
		/** Replace one episode's step records and stamp them. */
		function writeSteps(episode, records, now = Date.now()) {
			const entry = sanitizeEpisodeSteps({
				updatedAt: now,
				records
			}, now);
			if (entry === null) return;
			const table = readTable();
			writeTable({
				...table,
				steps: {
					...table.steps,
					[episode]: entry
				}
			});
			schedulePush();
		}
		//#endregion
		//#region src/client/shared/lib/styles.ts
		/**
		* The page stylesheet, rendered as an element by the page.
		*
		* Same rule as the other panels in this workspace: read the host's `--dsw-alias-*`
		* theme tokens and keep a fallback for each, so the page follows the active theme
		* without importing a single Harness Client package. Class names carry the plugin
		* prefix because a stylesheet rendered into the host document is not scoped by anything.
		*
		* **Only tokens the host declares.** The theme lists a fixed set (`bg-base`,
		* `bg-layer-1/2`, `bg-overlay`, `border-l1/l2`, `brand-primary`, `label-primary/
		* secondary`, and the four states). An earlier version also read `label-tertiary`,
		* `bg-layer-3`, `bg-mask-1` and `interactive-bg-hover`, none of which exist, and got
		* by on their fallbacks, which are tuned for one theme. The four derived values below
		* are the replacements, built from declared tokens with `color-mix`, so light and dark
		* both follow the theme instead of the fallback.
		*/
		const STYLES = `
.dsh-lingualab-page{
  --ll-muted:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 80%,transparent);
  --ll-hover:color-mix(in srgb,var(--dsw-alias-label-primary,#888) 8%,transparent);
  --ll-track:color-mix(in srgb,var(--dsw-alias-label-primary,#888) 14%,transparent);
  --ll-mask:color-mix(in srgb,var(--dsw-alias-bg-base,#000) 55%,rgba(0,0,0,0.35));
  --ll-on-brand:var(--dsw-alias-bg-base,#fff);
  /* Panels that float (drawers, cards, popovers). Not the host's bg-overlay: that token is
     its scrim colour, a mid gray in dark, and a panel painted with it reads as washed out. */
  --ll-surface:var(--dsw-alias-bg-layer-1,#1b1c1f);
  position:relative;display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;
  background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-label-primary,inherit);
  font-size:14px;line-height:1.5;outline:none}
.dsh-lingualab-page button{font-family:inherit}
.dsh-lingualab-page button:focus-visible,.dsh-lingualab-page select:focus-visible,
.dsh-lingualab-page input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:1px}

/* ── top bar ─────────────────────────────────────────────────── */
.dsh-lingualab-top{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-top-title{min-width:0;max-width:420px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-weight:600;padding:0 4px}
.dsh-lingualab-spacer{flex:1;min-width:8px}
.dsh-lingualab-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:none;cursor:pointer;
  color:var(--dsw-alias-label-secondary,#8a8f98);font:inherit;font-size:12px;white-space:nowrap}
.dsh-lingualab-chip:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-chip.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-chip:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  padding:0;border:0;border-radius:8px;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer}
.dsh-lingualab-icon-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-icon-btn:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-icon-btn.is-star.is-on{color:var(--dsw-alias-state-warn-primary,#b7791f)}

/* ── home ────────────────────────────────────────────────────── */
.dsh-lingualab-home{flex:1;min-height:0;display:flex;flex-direction:column}
.dsh-lingualab-drop{position:relative;flex:1;min-height:0;overflow:auto}
.dsh-lingualab-home-inner{display:flex;flex-direction:column;gap:22px;width:min(900px,100%);
  margin:0 auto;padding:28px 24px 32px;box-sizing:border-box}
.dsh-lingualab-welcome{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;
  padding:40px 24px;border:1.5px dashed var(--dsw-alias-border-l2,rgba(127,127,127,0.4));border-radius:16px;
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-welcome h1{margin:0;font-size:20px;font-weight:600}
.dsh-lingualab-welcome p{margin:0;max-width:460px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-welcome-icon{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;
  border-radius:999px;background:var(--ll-hover);color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-drop.is-over .dsh-lingualab-welcome{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-drop-veil{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;
  background:var(--ll-mask);pointer-events:none}
.dsh-lingualab-drop-veil-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:28px 40px;
  border:2px dashed var(--dsw-alias-brand-primary,#4d6bfe);border-radius:16px;
  background:var(--ll-surface);font-size:16px}
.dsh-lingualab-drop-veil-card span{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98)}

.dsh-lingualab-resume{display:flex;flex-direction:column;gap:12px;padding:26px 28px;border-radius:20px;
  border:0.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 35%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 9%,var(--dsw-alias-bg-base,transparent))}
.dsh-lingualab-resume-label{font-size:12px;color:var(--dsw-alias-brand-primary,#4d6bfe);font-weight:600;letter-spacing:.02em}
.dsh-lingualab-resume-title{margin:0;font-size:28px;line-height:1.25;font-weight:700;letter-spacing:-.01em;word-break:break-word}
.dsh-lingualab-resume-meta{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-section{display:flex;flex-direction:column;gap:8px}
.dsh-lingualab-section-head{display:flex;align-items:center;gap:8px}
.dsh-lingualab-section-head h2{margin:0;font-size:14px;font-weight:600}
.dsh-lingualab-episodes{display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-episodes.is-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.dsh-lingualab-episode-card{display:flex;flex-direction:column;align-items:stretch;gap:8px;padding:16px;border-radius:16px;
  text-align:left;color:inherit;font:inherit;cursor:pointer;background:var(--dsw-alias-bg-layer-1,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));
  transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}
.dsh-lingualab-episode-card:hover:not(:disabled){transform:translateY(-2px);
  border-color:var(--dsw-alias-brand-primary,#4d6bfe);box-shadow:0 10px 26px rgba(0,0,0,0.14)}
.dsh-lingualab-episode-card:active:not(:disabled){transform:none}
.dsh-lingualab-episode-card:disabled{opacity:0.6;cursor:default}
.dsh-lingualab-episode-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-lingualab-episode-icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  border-radius:10px;color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent)}
.dsh-lingualab-episode-title{font-size:16px;font-weight:600;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.dsh-lingualab-dropstrip{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;
  border:1.5px dashed var(--dsw-alias-border-l2,rgba(127,127,127,0.4));color:var(--dsw-alias-label-secondary,#8a8f98);
  transition:border-color .15s ease,background .15s ease}
.dsh-lingualab-drop.is-over .dsh-lingualab-dropstrip{border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 8%,transparent)}
.dsh-lingualab-episode-row{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:10px 12px;
  border:0;border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.dsh-lingualab-episode-row:hover{background:var(--ll-hover)}
.dsh-lingualab-episode-row:disabled{opacity:0.6;cursor:default}
.dsh-lingualab-resume .dsh-lingualab-bar{height:6px}
.dsh-lingualab-bar{position:relative;height:4px;border-radius:999px;background:var(--ll-track);overflow:hidden}
.dsh-lingualab-bar.is-small{flex:none;width:64px;height:3px}
.dsh-lingualab-bar-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-report{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:12px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-folderline{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98);padding-top:4px}
.dsh-lingualab-link{border:0;background:none;padding:0;cursor:pointer;font:inherit;font-size:12px;
  color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-link:hover{text-decoration:underline}

/* ── practice: a stage on the left, the transcript on the right ─ */
.dsh-lingualab-body{flex:1;min-height:0;display:flex}
.dsh-lingualab-practice{position:relative;flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;
  padding:0 24px 20px}
.dsh-lingualab-top-heading{display:flex;flex-direction:column;min-width:0;line-height:1.25;padding:0 4px}
.dsh-lingualab-top-heading .dsh-lingualab-top-title{padding:0}
.dsh-lingualab-top-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}
.dsh-lingualab-pill{display:inline-flex;align-items:center;height:22px;padding:0 10px;border-radius:999px;font-size:12px;
  font-weight:600;color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent)}

.dsh-lingualab-stage{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:14px;padding:20px 12px;text-align:center}
.dsh-lingualab-stage-meta{display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}
.dsh-lingualab-stage-side{width:100%;max-width:760px;min-height:1.5em;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;font-size:15px;color:var(--ll-muted);opacity:.7;
  -webkit-mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent);
  mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent)}
.dsh-lingualab-stage-now{position:relative;width:100%;max-width:860px;display:flex;flex-direction:column;align-items:center;
  gap:12px;animation:ll-sentence-in .2s ease-out}
@keyframes ll-sentence-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.dsh-lingualab-stage-en{font-size:clamp(26px,3.1vw,44px);line-height:1.25;font-weight:700;letter-spacing:-.01em;
  word-break:break-word;transition:filter .2s ease}
.dsh-lingualab-stage-en.is-long{font-size:clamp(20px,2.2vw,30px);line-height:1.35}
.dsh-lingualab-stage-en.is-masked{filter:blur(12px);user-select:none;pointer-events:none}
.dsh-lingualab-stage-en .is-word{cursor:pointer;border-radius:8px;transition:background .12s ease,color .12s ease}
.dsh-lingualab-stage-en .is-word:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 14%,transparent)}
.dsh-lingualab-stage-en .is-word.is-pinned{color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 14%,transparent)}
.dsh-lingualab-stage-zh{font-size:clamp(15px,1.5vw,20px);color:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 80%,transparent)}
.dsh-lingualab-stage-zh[data-zh="always"]{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-stage-empty{display:flex;flex-direction:column;align-items:center;gap:6px;max-width:420px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-stage-empty strong{font-size:16px;font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-reveal{position:absolute;top:calc(50% - 18px);left:50%;transform:translateX(-50%);display:inline-flex;
  align-items:center;gap:8px;height:34px;padding:0 14px;border-radius:999px;cursor:pointer;font:inherit;font-size:13px;
  color:var(--dsw-alias-label-primary,inherit);background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));box-shadow:0 6px 20px rgba(0,0,0,0.18)}
.dsh-lingualab-reveal:hover{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-stage-now:has(.is-masked) .dsh-lingualab-stage-zh{opacity:0.5}

/* The word popover: small, over the word, and never in the way of the audio. */
.dsh-lingualab-word-pop{position:absolute;z-index:6;display:flex;align-items:center;gap:6px;padding:6px 8px;
  transform:translate(-50%,calc(-100% - 8px));white-space:nowrap;border-radius:12px;font-size:13px;
  background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));box-shadow:0 12px 32px rgba(0,0,0,0.28);
  animation:ll-pop-in .12s ease-out}
@keyframes ll-pop-in{from{opacity:0;transform:translate(-50%,calc(-100% - 2px))}
  to{opacity:1;transform:translate(-50%,calc(-100% - 8px))}}
.dsh-lingualab-word-pop b{padding:0 6px;font-weight:600}
.dsh-lingualab-pop-btn{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 9px;border-radius:8px;cursor:pointer;
  font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3))}
.dsh-lingualab-pop-btn:hover:not(:disabled){background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-pop-btn:disabled{cursor:default;color:var(--dsw-alias-state-success-primary,#2f855a)}

/* The player card: scrubber on top, then the controls in three groups. */
.dsh-lingualab-deck{flex:none;display:flex;flex-direction:column;gap:12px;width:min(720px,100%);align-self:center;
  box-sizing:border-box;padding:16px 20px 14px;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-transport{display:flex;flex-direction:column;gap:12px;width:100%}
.dsh-lingualab-transport-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px}
.dsh-lingualab-transport-side{display:flex;align-items:center;gap:4px;min-width:0;flex-wrap:wrap}
.dsh-lingualab-transport-side.is-end{justify-content:flex-end}
.dsh-lingualab-transport-main{display:flex;align-items:center;gap:14px}
.dsh-lingualab-play{display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;flex:none;
  border:0;border-radius:999px;background:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--ll-on-brand);cursor:pointer;
  box-shadow:0 8px 22px color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 38%,transparent);
  transition:transform .12s ease,filter .12s ease}
.dsh-lingualab-play:hover:not(:disabled){filter:brightness(1.08)}
.dsh-lingualab-play:active:not(:disabled){transform:scale(.94)}
.dsh-lingualab-play:disabled{opacity:0.45;cursor:default;box-shadow:none}
.dsh-lingualab-round{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;
  border-radius:999px;cursor:pointer;color:var(--dsw-alias-label-primary,inherit);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));transition:transform .12s ease,background .12s ease}
.dsh-lingualab-round:hover:not(:disabled){background:var(--ll-hover)}
.dsh-lingualab-round:active:not(:disabled){transform:scale(.92)}
.dsh-lingualab-round:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-bar-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:32px;min-width:32px;
  padding:0 10px;border:0.5px solid transparent;border-radius:9px;background:none;
  color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;font:inherit;font-size:12px;white-space:nowrap}
.dsh-lingualab-bar-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-bar-btn.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 10%,transparent)}
.dsh-lingualab-bar-btn.is-star.is-on{border-color:var(--dsw-alias-state-warn-primary,#b7791f);
  color:var(--dsw-alias-state-warn-primary,#b7791f);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b7791f) 10%,transparent)}
.dsh-lingualab-bar-btn:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-time{flex:none;min-width:40px;font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-time:last-child{text-align:right}
.dsh-lingualab-menu-holder{position:relative;display:inline-flex}
.dsh-lingualab-menu{position:absolute;right:0;bottom:calc(100% + 6px);z-index:25;display:flex;flex-direction:column;gap:10px;
  width:300px;padding:12px;border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:12px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3);
  text-align:left}
.dsh-lingualab-menu-title{font-size:12px;font-weight:600}
.dsh-lingualab-menu-keys{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:0;padding-top:8px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-menu-keys dt{font-weight:600;color:var(--dsw-alias-label-primary,inherit);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-menu-keys dd{margin:0}
.dsh-lingualab-menu-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px}

/* The scrubber. The hit area is 22px tall and the rail 6px, so it is easy to land on. */
.dsh-lingualab-scrub{display:flex;align-items:center;gap:12px;width:100%}
.dsh-lingualab-scrub.is-disabled{opacity:0.5}
.dsh-lingualab-scrub-track{position:relative;flex:1;min-width:0;height:22px;cursor:pointer;touch-action:none;user-select:none}
.dsh-lingualab-scrub.is-disabled .dsh-lingualab-scrub-track{cursor:default}
.dsh-lingualab-scrub-rail{position:absolute;left:0;right:0;top:50%;height:6px;margin-top:-3px;border-radius:999px;
  overflow:hidden;background:var(--ll-track);transition:height .12s ease,margin .12s ease}
.dsh-lingualab-scrub-track:hover .dsh-lingualab-scrub-rail{height:8px;margin-top:-4px}
.dsh-lingualab-scrub-ticks{position:absolute;inset:0;width:100%;height:100%}
.dsh-lingualab-scrub-ticks path{stroke:var(--dsw-alias-label-secondary,#8a8f98);stroke-width:1;opacity:0.35}
.dsh-lingualab-scrub-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-scrub-ghost{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;
  background:var(--dsw-alias-label-primary,#888);opacity:0.45}
.dsh-lingualab-scrub-knob{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#4d6bfe);transform:scale(.8);transition:transform .12s ease;
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 24%,transparent)}
.dsh-lingualab-scrub-track:hover .dsh-lingualab-scrub-knob{transform:scale(1.1)}
.dsh-lingualab-scrub-tip{position:absolute;bottom:calc(100% + 6px);z-index:8;display:flex;flex-direction:column;gap:2px;
  width:max-content;max-width:220px;transform:translateX(-50%);padding:6px 10px;border-radius:10px;font-size:12px;
  text-align:left;pointer-events:none;color:var(--dsw-alias-label-primary,inherit);
  background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));box-shadow:0 10px 28px rgba(0,0,0,0.25)}
.dsh-lingualab-scrub-tip b{font-variant-numeric:tabular-nums}
.dsh-lingualab-scrub-tip span{color:var(--dsw-alias-label-secondary,#8a8f98);display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden}

/* Key caps: they light up when the page handles that key. */
.dsh-lingualab-keyhints{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px 16px;
  font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);transition:opacity .15s ease}
.dsh-lingualab-keyhints.is-idle{opacity:0.55}
.dsh-lingualab-keyhint{display:inline-flex;align-items:center;gap:4px}
.dsh-lingualab-page kbd{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;
  box-sizing:border-box;border-radius:6px;font:inherit;font-size:11px;font-weight:600;
  color:var(--dsw-alias-label-secondary,#8a8f98);background:var(--dsw-alias-bg-base,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));
  border-bottom-width:2px;transition:background .1s ease,color .1s ease,transform .1s ease}
.dsh-lingualab-keyhint.is-hit kbd{background:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--ll-on-brand);
  border-color:var(--dsw-alias-brand-primary,#4d6bfe);transform:translateY(1px)}
.dsh-lingualab-keyhint.is-hit{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-reveal kbd{margin-left:2px}

/* ── transcript: the only scroller ───────────────────────────── */
.dsh-lingualab-transcript{flex:none;width:clamp(300px,34%,440px);min-height:0;display:flex;flex-direction:column;
  border-left:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-transcript-head{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 16px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-transcript-title{font-weight:600}
.dsh-lingualab-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-switch-track{position:relative;width:30px;height:18px;border-radius:999px;background:var(--ll-track);
  transition:background .15s ease}
.dsh-lingualab-switch-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;
  background:var(--dsw-alias-bg-base,#fff);box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform .15s ease}
.dsh-lingualab-switch input:checked + .dsh-lingualab-switch-track{background:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-switch input:checked + .dsh-lingualab-switch-track .dsh-lingualab-switch-knob{transform:translateX(12px)}
.dsh-lingualab-switch input:focus-visible + .dsh-lingualab-switch-track{
  outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:2px}
.dsh-lingualab-list{position:relative;flex:1;min-width:0;min-height:0;overflow:auto;padding:8px}
.dsh-lingualab-row{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:10px;align-items:start;
  padding:9px 10px;margin-bottom:2px;cursor:pointer;border-radius:10px;transition:background .12s ease}
.dsh-lingualab-row:hover,.dsh-lingualab-row.is-selected{background:var(--ll-hover)}
.dsh-lingualab-row.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 11%,transparent);
  box-shadow:inset 3px 0 0 var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-row-time{font-size:11.5px;color:var(--ll-muted);font-variant-numeric:tabular-nums;padding-top:3px}
.dsh-lingualab-row.is-active .dsh-lingualab-row-time{color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-row-en{min-width:0;word-break:break-word;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-en{color:var(--dsw-alias-label-primary,inherit);font-weight:600}
/* Dimmed is small and faint, so the English leads; always is the same size and weight of
   colour as the English, so both languages read as one block. */
.dsh-lingualab-row-zh{margin-top:2px;font-size:12px;
  color:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 55%,transparent)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-zh{
  color:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 80%,transparent)}
.dsh-lingualab-list[data-zh="always"] .dsh-lingualab-row-zh{font-size:inherit;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-list[data-zh="always"] .dsh-lingualab-row.is-active .dsh-lingualab-row-zh{
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-row-actions{display:flex;align-items:center;gap:2px;opacity:0;visibility:hidden;transition:opacity .12s ease}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions,.dsh-lingualab-row.is-active .dsh-lingualab-row-actions{
  opacity:1;visibility:visible}
/* A kept sentence shows its star at rest, so the list reads as a map of what you took. */
.dsh-lingualab-row-actions.is-kept{opacity:1;visibility:visible}
.dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn:not(.is-star){opacity:0;visibility:hidden}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn,
.dsh-lingualab-row.is-active .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn{opacity:1;visibility:visible}

/* ── finish card ─────────────────────────────────────────────── */
.dsh-lingualab-finish{position:absolute;inset:0;z-index:15;display:flex;align-items:center;justify-content:center;
  padding:16px;background:var(--ll-mask);backdrop-filter:blur(2px);animation:ll-fade-in .18s ease-out}
@keyframes ll-fade-in{from{opacity:0}to{opacity:1}}
.dsh-lingualab-finish-card{display:flex;flex-direction:column;align-items:center;gap:12px;width:min(460px,100%);
  box-sizing:border-box;padding:28px 28px 20px;text-align:center;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.4));
  background:var(--ll-surface);box-shadow:0 24px 64px rgba(0,0,0,0.38);
  animation:ll-sentence-in .22s ease-out}
.dsh-lingualab-finish-card h2{margin:0;font-size:20px;font-weight:700}
.dsh-lingualab-finish-card p{margin:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-finish-badge{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;
  border-radius:999px;color:var(--ll-on-brand);background:var(--dsw-alias-state-success-primary,#2f855a);
  animation:ll-badge-in .35s cubic-bezier(.2,1.4,.4,1)}
@keyframes ll-badge-in{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.dsh-lingualab-finish-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin:4px 0 6px}
.dsh-lingualab-finish-stats div{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px;
  border-radius:12px;background:var(--dsw-alias-bg-layer-1,transparent);
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25))}
.dsh-lingualab-finish-stats dt{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.dsh-lingualab-finish-stats dd{margin:0;font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}

/* ── loading: skeletons that mirror the real layout ──────────── */
/* The delay keeps a fast load from flashing a placeholder for a single frame. */
.dsh-lingualab-sk-wrap{display:flex;flex-direction:column;gap:22px;animation:ll-fade-in .28s ease-out .18s both}
.dsh-lingualab-sk{display:block;flex:none;max-width:100%;
  background:linear-gradient(90deg,var(--ll-track) 25%,color-mix(in srgb,var(--dsw-alias-label-primary,#888) 5%,transparent) 50%,var(--ll-track) 75%);
  background-size:300% 100%;animation:ll-shimmer 1.5s ease-in-out infinite}
@keyframes ll-shimmer{from{background-position:100% 0}to{background-position:0 0}}
.dsh-lingualab-sk-row{display:flex;align-items:center;gap:14px}
.dsh-lingualab-sk-row.is-between{justify-content:space-between}
.dsh-lingualab-sk-resume{display:flex;flex-direction:column;align-items:flex-start;gap:14px;padding:26px 28px;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-sk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.dsh-lingualab-sk-card{display:flex;flex-direction:column;align-items:stretch;gap:10px;padding:16px;border-radius:16px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-sk-list{gap:6px;padding:10px 12px}
.dsh-lingualab-sk-item{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:12px}
.dsh-lingualab-sk-stage{flex:1;align-items:center;justify-content:center;gap:28px;width:100%}
.dsh-lingualab-sk-lines{display:flex;flex-direction:column;align-items:center;gap:14px;width:min(640px,80%)}
.dsh-lingualab-sk-label{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-spinner{width:14px;height:14px;border-radius:999px;box-sizing:border-box;
  border:2px solid var(--ll-track);border-top-color:var(--dsw-alias-brand-primary,#4d6bfe);animation:ll-spin .8s linear infinite}
.dsh-lingualab-btn .dsh-lingualab-spinner{border-color:color-mix(in srgb,currentColor 30%,transparent);border-top-color:currentColor}
@keyframes ll-spin{to{transform:rotate(360deg)}}

@media (prefers-reduced-motion:reduce){
  .dsh-lingualab-sk{animation:none}
  .dsh-lingualab-spinner{animation-duration:2.4s}
  .dsh-lingualab-stage-now,.dsh-lingualab-word-pop,.dsh-lingualab-finish,.dsh-lingualab-finish-card,
  .dsh-lingualab-finish-badge,.dsh-lingualab-notes,.dsh-lingualab-popover{animation:none}
  .dsh-lingualab-page *{transition-duration:0s !important}
}

/* ── drawers: notes and the five steps slide in over a scrim ─── */
.dsh-lingualab-scrim{position:absolute;inset:0;z-index:21;background:var(--ll-mask);animation:ll-fade-in .18s ease-out}
.dsh-lingualab-notes,.dsh-lingualab-popover{position:absolute;top:0;right:0;bottom:0;z-index:22;display:flex;
  flex-direction:column;width:min(420px,100%);min-height:0;box-sizing:border-box;
  border-left:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));
  background:var(--ll-surface);box-shadow:-18px 0 48px rgba(0,0,0,0.22);
  animation:ll-slide-in .2s ease-out}
@keyframes ll-slide-in{from{transform:translateX(28px);opacity:0}to{transform:none;opacity:1}}
.dsh-lingualab-notes-head{display:flex;align-items:center;gap:8px;height:64px;padding:0 16px 0 24px;flex:none;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.18))}
.dsh-lingualab-drawer-titles{display:flex;flex-direction:column;min-width:0;gap:1px}
.dsh-lingualab-drawer-title{font-weight:600;font-size:16px;line-height:1.3}
.dsh-lingualab-drawer-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-notes-body{flex:1;min-height:0;overflow:auto;padding:6px 24px 16px;display:flex;flex-direction:column;gap:12px}
.dsh-lingualab-note{display:flex;flex-direction:column;gap:8px;padding:14px 16px 16px;border-radius:14px;flex:none;
  background:color-mix(in srgb,var(--dsw-alias-label-primary,#888) 4%,var(--ll-surface));
  border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));transition:border-color .12s ease}
.dsh-lingualab-note:hover{border-color:var(--dsw-alias-border-l2,rgba(127,127,127,0.4))}
.dsh-lingualab-note.is-done .dsh-lingualab-note-text{color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-note-top{display:flex;align-items:center;gap:10px;min-height:28px}
.dsh-lingualab-note-check{display:inline-flex;cursor:pointer;position:relative}
.dsh-lingualab-box{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;
  box-sizing:border-box;border:1.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.5));
  color:var(--ll-on-brand);transition:background .12s ease,border-color .12s ease}
.dsh-lingualab-note-check:hover .dsh-lingualab-box{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-note-check:focus-within .dsh-lingualab-box{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:2px}
.dsh-lingualab-box.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent}
.dsh-lingualab-note-at{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:999px;border:0;
  font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;font-variant-numeric:tabular-nums;
  color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent)}
.dsh-lingualab-note-at:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 22%,transparent)}
.dsh-lingualab-note .dsh-lingualab-icon-btn.is-small{color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-icon-btn.is-danger:hover{color:var(--dsw-alias-state-error-primary,#d92d20);
  background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d92d20) 12%,transparent)}
.dsh-lingualab-note-text{display:block;word-break:break-word;font-weight:600;font-size:16px;line-height:1.4}
.dsh-lingualab-note-zh{font-size:13px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-memo{display:flex;flex-direction:column;gap:6px;padding:8px 12px;border-radius:8px;margin-top:2px;
  background:var(--dsw-alias-bg-base,transparent);border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25))}
.dsh-lingualab-memo-words{display:flex;align-items:center;flex-wrap:wrap;gap:6px;color:var(--ll-muted)}
.dsh-lingualab-word-chip{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:6px;font-size:12px;
  font-weight:500;color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent)}
.dsh-lingualab-memo-text{font-size:13px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.dsh-lingualab-tag{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:none;
  color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;font:inherit;font-size:12px;font-weight:500;height:26px;
  padding:0 11px;border-radius:999px}
.dsh-lingualab-tag:hover{background:var(--ll-hover)}
.dsh-lingualab-tag.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:var(--ll-on-brand)}
.dsh-lingualab-note input[type=checkbox],.dsh-lingualab-step input[type=checkbox]{accent-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-drawer-foot{flex:none;padding:12px 24px;font-size:12px;line-height:1.5;
  color:var(--dsw-alias-label-secondary,#8a8f98);border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.18))}
/* Undo toast: floats over the drawer's bottom, inverted so it reads as a message and not as content. */
.dsh-lingualab-toast{position:absolute;left:50%;bottom:64px;transform:translateX(-50%);z-index:3;display:flex;align-items:center;
  gap:12px;height:44px;padding:0 8px 0 16px;border-radius:12px;white-space:nowrap;font-size:13px;
  background:var(--dsw-alias-label-primary,#16181d);color:var(--dsw-alias-bg-base,#fff);
  box-shadow:0 8px 24px rgba(0,0,0,0.28);animation:ll-toast-in .18s ease-out}
.dsh-lingualab-toast-undo{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border:0;border-radius:8px;
  background:none;cursor:pointer;font:inherit;font-weight:600;color:inherit;text-decoration:underline;text-underline-offset:3px}
.dsh-lingualab-toast-undo:hover{background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 16%,transparent)}
@keyframes ll-toast-in{from{transform:translate(-50%,8px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
@media (max-width:860px){
  .dsh-lingualab-transcript{width:260px}
  .dsh-lingualab-transport-row{grid-template-columns:1fr;justify-items:center}
  .dsh-lingualab-transport-side.is-end{justify-content:center}
}
/* ── layers: browse, media folder, steps ─────────────────────── */
.dsh-lingualab-mask{position:absolute;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;
  padding:44px 24px;background:var(--ll-mask)}
.dsh-lingualab-modal{display:flex;flex-direction:column;width:min(620px,100%);max-height:100%;overflow:hidden;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:14px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3)}
.dsh-lingualab-modal-head{display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-modal-title{font-weight:600;font-size:14px}
.dsh-lingualab-tabs{display:flex;gap:8px;padding:14px 24px}
.dsh-lingualab-tab{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));border-radius:999px;background:none;
  color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;font:inherit;font-size:12px;font-weight:500;height:28px;padding:0 12px}
.dsh-lingualab-tab:hover{background:var(--ll-hover)}
.dsh-lingualab-tab.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:var(--ll-on-brand)}
.dsh-lingualab-tab.is-on .dsh-lingualab-counter{color:inherit;opacity:.85}
.dsh-lingualab-modal-body{flex:1;min-height:0;overflow:auto;padding:8px 10px 12px}
.dsh-lingualab-input{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-layer-2,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));border-radius:8px;color:inherit;
  font:inherit;font-size:13px;padding:6px 9px}
.dsh-lingualab-pick{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:7px 9px;
  border:0;border-radius:8px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.dsh-lingualab-pick:hover{background:var(--ll-hover)}
.dsh-lingualab-pick.is-current{background:var(--dsw-alias-bg-layer-2,var(--ll-hover))}
.dsh-lingualab-pick-main{flex:1;min-width:0}
.dsh-lingualab-pick-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-pick-sub{display:block;font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-badge{flex:none;font-size:11px;color:var(--dsw-alias-label-secondary,#8a8f98);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));border-radius:999px;padding:1px 7px}
.dsh-lingualab-group{margin:12px 6px 4px;font-size:11.5px;font-weight:600;letter-spacing:.03em;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-group:first-child{margin-top:4px}

/* The browse layer: a card that floats (stronger mask, a ring and a deeper shadow), a
   toolbar that stays put, a list that scrolls, and a footer that owns the one big action. */
.dsh-lingualab-mask:has(.is-browse){align-items:center;padding:24px;
  backdrop-filter:blur(3px)}
.dsh-lingualab-modal.is-browse{width:min(720px,100%);height:min(620px,100%);
  border-color:var(--dsw-alias-border-l2,rgba(127,127,127,0.4));
  box-shadow:0 0 0 1px var(--ll-hover),0 24px 64px rgba(0,0,0,0.38)}
.dsh-lingualab-browse-bar{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-pathrow{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-lingualab-select{flex:none;max-width:180px;height:28px;padding:0 8px;border-radius:8px;cursor:pointer;
  background:var(--dsw-alias-bg-layer-2,transparent);color:inherit;font:inherit;font-size:12.5px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3))}
.dsh-lingualab-select:hover{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-icon-btn.is-small{width:28px;height:28px}
.dsh-lingualab-crumbs{flex:1;min-width:0;display:flex;align-items:center;flex-wrap:nowrap;overflow:hidden}
.dsh-lingualab-crumbs-root{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 7px;
  font-size:12px;color:var(--ll-muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.dsh-lingualab-crumb-item{display:inline-flex;align-items:center;flex:0 1 auto;min-width:0;color:var(--ll-muted)}
.dsh-lingualab-crumb{flex:none;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  height:26px;padding:0 7px;border:0;border-radius:6px;background:none;cursor:pointer;font:inherit;font-size:12.5px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-crumb:hover:not(:disabled){background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-crumb.is-here,.dsh-lingualab-crumb:disabled{cursor:default;font-weight:600;
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-browse-bar .dsh-lingualab-input{height:34px;padding:0 11px;border-radius:9px;
  background:var(--dsw-alias-bg-base,transparent)}
.dsh-lingualab-browse-bar .dsh-lingualab-input:focus{outline:none;
  border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 22%,transparent)}
.dsh-lingualab-modal.is-browse .dsh-lingualab-modal-body{padding:6px 10px 10px;transition:opacity .12s}
.dsh-lingualab-modal-body.is-loading{opacity:0.55}
.dsh-lingualab-pick{min-height:40px}
.dsh-lingualab-pick svg{flex:none;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-pick.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent);
  box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-pick.is-active svg{color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-pick.is-episode{border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));margin:4px 0 2px}
.dsh-lingualab-pick.is-inert{cursor:default;opacity:0.55;min-height:32px}
.dsh-lingualab-pick.is-inert:hover{background:none}
.dsh-lingualab-badge.is-ok{color:var(--dsw-alias-state-success-primary,#2f855a);
  border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2f855a) 45%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2f855a) 10%,transparent)}
.dsh-lingualab-badge.is-warn{color:var(--dsw-alias-state-warn-primary,#b7791f);
  border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b7791f) 45%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b7791f) 10%,transparent)}
.dsh-lingualab-empty.is-center{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;
  padding:56px 24px}
.dsh-lingualab-empty.is-center strong{font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-error.is-pad,.dsh-lingualab-hint.is-pad{padding:8px 14px}
.dsh-lingualab-modal-foot{flex:none;display:flex;align-items:center;gap:10px;padding:9px 14px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-keys{font-size:11.5px;color:var(--ll-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  min-width:0}
.dsh-lingualab-foot-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;max-width:220px}
@media (max-width:640px){.dsh-lingualab-keys,.dsh-lingualab-foot-hint{display:none}}
.dsh-lingualab-empty{color:var(--dsw-alias-label-secondary,#8a8f98);padding:14px 12px;font-size:13px}
.dsh-lingualab-warn{color:var(--dsw-alias-state-warn-primary,#b7791f);font-size:12.5px;padding:6px 0}
.dsh-lingualab-error{color:var(--dsw-alias-state-error-primary,#c53030);font-size:12.5px;padding:6px 0}
.dsh-lingualab-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:none;color:inherit;
  font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.dsh-lingualab-btn:hover{background:var(--ll-hover)}
.dsh-lingualab-btn.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-btn.is-primary{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:var(--ll-on-brand)}
.dsh-lingualab-btn.is-primary:hover{background:var(--dsw-alias-brand-primary,#4d6bfe);filter:brightness(1.08)}
.dsh-lingualab-btn.is-large{height:38px;padding:0 18px;font-size:14px;border-radius:10px}
.dsh-lingualab-btn:disabled{opacity:0.45;cursor:default}


/* ── five steps ──────────────────────────────────────────────── */
.dsh-lingualab-steps-body{flex:1;min-height:0;overflow:auto;padding:14px 24px 20px;display:flex;flex-direction:column;gap:14px}
.dsh-lingualab-steps-total{display:flex;flex-direction:column;gap:8px;font-size:12.5px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-steps{display:flex;flex-direction:column;gap:8px}
.dsh-lingualab-step{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;
  background:var(--dsw-alias-bg-base,transparent);border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));
  transition:background .15s ease,border-color .15s ease}
.dsh-lingualab-step.is-current{border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 9%,transparent)}
.dsh-lingualab-step.is-done .dsh-lingualab-step-label{color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-step-check{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:28px;height:28px;border-radius:999px;cursor:pointer;font-size:12px;font-weight:600;
  color:var(--dsw-alias-label-secondary,#8a8f98);border:1.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.4));
  transition:background .15s ease,border-color .15s ease,color .15s ease}
.dsh-lingualab-step-check:hover{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-step-check:focus-within{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:2px}
.dsh-lingualab-step-check.is-on{color:var(--ll-on-brand);background:var(--dsw-alias-state-success-primary,#2f855a);
  border-color:transparent;animation:ll-badge-in .3s cubic-bezier(.2,1.4,.4,1)}
.dsh-lingualab-step-main{flex:1;min-width:0;display:flex;flex-direction:column}
.dsh-lingualab-step-label{font-weight:600}
.dsh-lingualab-step-mins{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}
/* A real input that cannot be seen: it stays focusable, so the label around it works from
   the keyboard, which \`display:none\` would break. */
.dsh-lingualab-visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;
  overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
label.dsh-lingualab-btn{position:relative}
label.dsh-lingualab-btn:focus-within{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:1px}
label.dsh-lingualab-btn.is-disabled{opacity:0.45;cursor:default;pointer-events:none}

/* ── shared bits ─────────────────────────────────────────────── */
.dsh-lingualab-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;word-break:break-all}
.dsh-lingualab-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsh-lingualab-card{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));border-radius:12px;
  background:var(--dsw-alias-bg-layer-1,transparent);padding:12px 14px}
.dsh-lingualab-counter{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}
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
		function UploadIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 10.5V3M5 5.6 8 2.8l3 2.8" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 10.5v1.8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1.8" })]
			});
		}
		function StarIcon({ filled = false, ...props }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M8 2.2l1.7 3.6 3.9.5-2.9 2.7.8 3.9L8 10.9l-3.5 2 .8-3.9L2.4 6.3l3.9-.5Z",
					fill: filled ? "currentColor" : "none"
				})
			});
		}
		function MoreIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 3.6,
						cy: 8,
						r: 1.1,
						fill: "currentColor",
						stroke: "none"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 8,
						cy: 8,
						r: 1.1,
						fill: "currentColor",
						stroke: "none"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 12.4,
						cy: 8,
						r: 1.1,
						fill: "currentColor",
						stroke: "none"
					})
				]
			});
		}
		function EditIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 13v-2.4L10.6 3a1.1 1.1 0 0 1 1.5 0l.9.9a1.1 1.1 0 0 1 0 1.5L5.4 13Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9.4 4.2l2.4 2.4" })]
			});
		}
		function MicIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: 6,
					y: 2.2,
					width: 4,
					height: 7,
					rx: 2
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.8 7.8a4.2 4.2 0 0 0 8.4 0M8 12v2" })]
			});
		}
		function CopyIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: 5.2,
					y: 5.2,
					width: 7.6,
					height: 7.6,
					rx: 1.4
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10.8 5.2V4a1.2 1.2 0 0 0-1.2-1.2H4A1.2 1.2 0 0 0 2.8 4v5.6A1.2 1.2 0 0 0 4 10.8h1.2" })]
			});
		}
		function EyeIcon({ off = false, ...props }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M1.8 8S4 3.8 8 3.8 14.2 8 14.2 8 12 12.2 8 12.2 1.8 8 1.8 8Z" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 8,
						cy: 8,
						r: 1.8
					}),
					off ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 13 13 3" }) : null
				]
			});
		}
		function CheckIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.4 8.4 6.6 11.4 12.6 4.8" })
			});
		}
		function UpIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 13V3.5M4 7l4-3.5L12 7" })
			});
		}
		function BackIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 3.5 5.5 8 10 12.5" })
			});
		}
		function TrashIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.8 4.4h10.4M6.2 4.4V3a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v1.4M4 4.4l.6 8a1.2 1.2 0 0 0 1.2 1.1h4.4a1.2 1.2 0 0 0 1.2-1.1l.6-8M6.8 7v4M9.2 7v4" })
			});
		}
		function UndoIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.8 5v3.4h3.4M2.8 8.4A5.2 5.2 0 1 0 4.6 4.5L2.8 6" })
			});
		}
		function BookIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 12.6A1.6 1.6 0 0 1 4.6 11H13V2.6H4.6A1.6 1.6 0 0 0 3 4.2ZM3 12.6v.8h10" })
			});
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
		//#region src/client/widgets/control-bar/ui/Scrubber.tsx
		/**
		* The whole-episode progress bar: where you are, what is around it, and a way to jump.
		*
		* The previous bar only showed how far into the *sentence* you were, and was read-only on
		* purpose, because dragging inside one sentence is a different gesture from moving
		* through the episode. This one is the other bar: it spans the episode, every sentence
		* start is a hairline on it so the shape of the dialogue is visible, hovering shows the
		* time and the sentence under the pointer without moving anything, and a click or a drag
		* lands on the sentence that contains the point.
		*
		* A drag is previewed locally and committed once on release. A seek per pointer move
		* would raise the player's seek gate dozens of times a second and make the audio stutter
		* through every sentence the pointer crossed.
		*
		* It is not a tab stop. The arrow keys already mean "previous / next sentence" on the
		* page, and a focused slider would claim them for itself.
		*/
		/** The SVG's own coordinate width; the element is stretched over the bar. */
		const TICK_SPACE = 1e3;
		/** Half the tooltip's width, so it stays inside the bar near either end. */
		const TIP_HALF = 110;
		/** Hairlines at every sentence start, drawn as a single path so a long episode stays cheap. */
		const Ticks = (0, react.memo)(function Ticks({ cues, duration }) {
			const path = (0, react.useMemo)(() => {
				if (!(duration > 0)) return "";
				let d = "";
				for (const cue of cues) {
					const x = Math.min(duration, Math.max(0, cue.start)) / duration * TICK_SPACE;
					d += `M${x.toFixed(1)} 0V6`;
				}
				return d;
			}, [cues, duration]);
			if (path === "") return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "dsh-lingualab-scrub-ticks",
				viewBox: `0 0 ${String(TICK_SPACE)} 6`,
				preserveAspectRatio: "none",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: path,
					vectorEffect: "non-scaling-stroke"
				})
			});
		});
		/** The scrubber with its two clocks. */
		function Scrubber({ t, disabled = false }) {
			const currentTime = useMediaPlayer((state) => state.currentTime);
			const duration = useMediaPlayer((state) => state.duration);
			const cues = useMediaPlayer((state) => state.cues);
			const track = (0, react.useRef)(null);
			const [hover, setHover] = (0, react.useState)(null);
			const [drag, setDrag] = (0, react.useState)(null);
			const usable = !disabled && duration > 0;
			/** Where along the bar a pointer is, as 0..1, with the bar's pixel width for the tooltip. */
			const measure = (event) => {
				const rect = (track.current ?? event.currentTarget).getBoundingClientRect();
				const x = Math.min(rect.width, Math.max(0, event.clientX - rect.left));
				return {
					fraction: rect.width > 0 ? x / rect.width : 0,
					x,
					width: rect.width
				};
			};
			const live = drag ?? (duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0);
			const pointed = hover === null ? null : hover.fraction * duration;
			const cueIndex = pointed === null ? -1 : findActiveCue(cues, pointed);
			const cue = cueIndex >= 0 ? cues[cueIndex] : void 0;
			const preview = cue === void 0 ? "" : splitCue(cue).english;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `dsh-lingualab-scrub${usable ? "" : " is-disabled"}`,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-time",
						children: formatClock(drag === null ? currentTime : drag * duration)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						ref: track,
						className: "dsh-lingualab-scrub-track",
						role: "slider",
						"aria-label": t("seekBar"),
						"aria-valuemin": 0,
						"aria-valuemax": Math.floor(duration),
						"aria-valuenow": Math.floor(currentTime),
						"aria-valuetext": formatClock(currentTime),
						"aria-disabled": !usable,
						onPointerMove: (event) => {
							if (!usable) return;
							const next = measure(event);
							setHover(next);
							if (drag !== null) setDrag(next.fraction);
						},
						onPointerLeave: () => setHover(null),
						onPointerDown: (event) => {
							if (!usable || event.button !== 0) return;
							event.currentTarget.setPointerCapture(event.pointerId);
							const next = measure(event);
							setHover(next);
							setDrag(next.fraction);
						},
						onPointerUp: (event) => {
							if (drag === null) return;
							const next = measure(event);
							setDrag(null);
							useMediaPlayer.getState().seek(Math.min(next.fraction * duration, Math.max(0, duration - .05)));
						},
						onPointerCancel: () => setDrag(null),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-scrub-rail",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Ticks, {
										cues,
										duration
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dsh-lingualab-scrub-fill",
										style: { width: `${String(live * 100)}%` }
									}),
									hover !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dsh-lingualab-scrub-ghost",
										style: { left: `${String(hover.fraction * 100)}%` }
									}) : null
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-scrub-knob",
								style: { left: `${String(live * 100)}%` }
							}),
							hover !== null && pointed !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-scrub-tip",
								style: { left: `${String(Math.min(Math.max(hover.x, TIP_HALF), Math.max(TIP_HALF, hover.width - TIP_HALF)))}px` },
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatClock(pointed) }), preview.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: preview }) : null]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-time",
						children: formatClock(duration)
					})
				]
			});
		}
		//#endregion
		//#region src/client/widgets/control-bar/ui/ControlBar.tsx
		/**
		* The transport row at the bottom of the stage.
		*
		* It sits under the sentence rather than in a bar of its own, because "play this
		* sentence again" and "which sentence" are one thought. Only the controls used every
		* minute stay on the row: sentence steps, play, speed, loop-this-sentence, and the
		* Chinese display. Everything that is a setup step rather than a gesture — the A and
		* B marks, how many times an A-B loop repeats — lives in the 「更多」 menu, because a
		* row of thirteen controls was the reason a first-time reader did not know which one
		* to press.
		*
		* The modes are chips, not form controls: a chip says its state by being outlined,
		* which a `<select>` cannot do.
		*/
		/** Repeat counts offered while an A-B loop is on; `0` means until stopped. */
		const REPEAT_CHOICES = [
			0,
			1,
			2,
			3,
			5
		];
		/** The keys the page listens for, with the dictionary key that says what each does. */
		const SHORTCUTS = [
			["Space", "keyPlay"],
			["← →", "keySentence"],
			["↑ ↓  Enter", "keyBrowse"],
			["L", "keyLoop"],
			["S", "keyKeep"],
			["C", "keyChinese"],
			["[  ]", "keySpeed"],
			["A  B", "keyMarks"]
		];
		/** Labels for the four Chinese display modes, in the order they are offered. */
		const ZH_MODE_KEYS = {
			always: "zhAlways",
			dim: "zhDim",
			"active-only": "zhActiveOnly",
			hidden: "zhHidden"
		};
		/** The row under the sentence. */
		function ControlBar({ t, zhMode, onZhMode, kept, onToggleKeep, disabled = false }) {
			const isPlaying = useMediaPlayer((state) => state.isPlaying);
			const speedIndex = useMediaPlayer((state) => state.speedIndex);
			const loopMode = useMediaPlayer((state) => state.loopMode);
			const repeats = useMediaPlayer((state) => state.repeats);
			const pointA = useMediaPlayer((state) => state.pointA);
			const pointB = useMediaPlayer((state) => state.pointB);
			const shadow = useMediaPlayer((state) => state.pauseAfterSentence);
			const [menu, setMenu] = (0, react.useState)(false);
			const holder = (0, react.useRef)(null);
			const store = useMediaPlayer.getState;
			(0, react.useEffect)(() => {
				if (!menu) return;
				const onDown = (event) => {
					if (holder.current !== null && !holder.current.contains(event.target)) setMenu(false);
				};
				window.addEventListener("mousedown", onDown);
				return () => window.removeEventListener("mousedown", onDown);
			}, [menu]);
			const abOn = pointA !== null || pointB !== null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-transport",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Scrubber, {
					t,
					disabled
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-transport-row",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-transport-side",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "dsh-lingualab-bar-btn",
									onClick: () => store().nextSpeedWrapping(),
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
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `dsh-lingualab-bar-btn${shadow ? " is-on" : ""}`,
									onClick: () => store().setPauseAfterSentence(!shadow),
									disabled,
									title: t("shadowHint"),
									"aria-pressed": shadow,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MicIcon, {}),
										" ",
										t("shadowShort")
									]
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-transport-main",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-round",
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
									children: isPlaying ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PauseIcon, { size: 22 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlayIcon, { size: 22 })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-round",
									onClick: () => store().stepCue(1),
									disabled,
									title: t("nextCue"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NextIcon, {})
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-transport-side is-end",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-bar-btn",
									onClick: () => onZhMode(nextZhMode(zhMode)),
									title: t("zhMode"),
									children: t(ZH_MODE_KEYS[zhMode])
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `dsh-lingualab-bar-btn is-star${kept ? " is-on" : ""}`,
									onClick: onToggleKeep,
									disabled,
									title: kept ? t("unkeepHint") : t("keepHint"),
									"aria-pressed": kept,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StarIcon, { filled: kept }),
										" ",
										kept ? t("kept") : t("keep")
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dsh-lingualab-menu-holder",
									ref: holder,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `dsh-lingualab-bar-btn${menu || abOn ? " is-on" : ""}`,
										onClick: () => setMenu(!menu),
										disabled,
										title: t("more"),
										"aria-expanded": menu,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MoreIcon, {})
									}), menu ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-lingualab-menu",
										role: "menu",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "dsh-lingualab-menu-title",
												children: t("loopAb")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: "dsh-lingualab-actions",
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: `dsh-lingualab-btn${pointA !== null ? " is-on" : ""}`,
														onClick: () => pointA === null ? store().setPoint("a") : store().clearAB(),
														title: pointA === null ? t("setA") : t("clearAb"),
														children: pointA === null ? t("setA") : `A ${formatClock(pointA)}`
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: `dsh-lingualab-btn${pointB !== null ? " is-on" : ""}`,
														onClick: () => store().setPoint("b"),
														disabled: pointA === null,
														title: t("setB"),
														children: pointB === null ? t("setB") : `B ${formatClock(pointB)}`
													}),
													abOn ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: "dsh-lingualab-btn",
														onClick: () => store().clearAB(),
														children: t("clearAb")
													}) : null
												]
											}),
											loopMode === "ab" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												className: "dsh-lingualab-menu-row",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("repeatTimes") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
													className: "dsh-lingualab-bar-btn",
													value: String(repeats),
													onChange: (event) => store().setRepeats(Number(event.target.value)),
													children: REPEAT_CHOICES.map((count) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: count,
														children: count === 0 ? "∞" : `×${count}`
													}, count))
												})]
											}) : null,
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dl", {
												className: "dsh-lingualab-menu-keys",
												children: SHORTCUTS.map(([keys, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: { display: "contents" },
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: keys }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t(label) })]
												}, keys))
											})
										]
									}) : null]
								})
							]
						})
					]
				})]
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
		* The browse layer: reach into a directory and open one audio file, subtitles and all.
		*
		* The library is the home page now, so this layer no longer lists episodes. It exists
		* for the thing the home page cannot do: material that is not in the media folder,
		* opened without copying it anywhere or typing an absolute path.
		*
		* The rows say whether a file has subtitles and which, so picking is a reading
		* decision rather than a guess. The layer is keyboard-first: the filter box owns focus
		* on open, arrows move a highlight, Enter opens it, Backspace on an empty filter goes up.
		*/
		/** What the browse list says about one audio file's subtitle pairing. */
		function hintBadge(t, hint) {
			if (hint === null || hint.state === "none") return t("subtitleBadgeNone");
			if (hint.state === "both") return t("subtitleBadgeBoth");
			if (hint.state === "en") return t("subtitleBadgeEn");
			if (hint.state === "zh") return t("subtitleBadgeZh");
			return t("subtitleBadgeUnknown");
		}
		/** Badge tone: a complete pair reads as good news, a bare file as a warning, the rest as neutral. */
		function hintTone(hint) {
			if (hint === null || hint.state === "none") return "warn";
			if (hint.state === "both") return "ok";
			return "plain";
		}
		/** The browse layer. */
		function EpisodePicker({ t, onClose, opening, openError, onOpenEpisode, onOpenFile, onUseFolder, savingFolder }) {
			const picker = usePicker(true);
			const { place, rel, entries, folderEpisode, query } = picker;
			const listingKey = `${place?.id ?? ""}\u0000${rel}\u0000${query}`;
			const [moved, setMoved] = (0, react.useState)({
				key: "",
				index: 0
			});
			const cursor = moved.key === listingKey ? moved.index : 0;
			const setCursor = (next) => {
				setMoved({
					key: listingKey,
					index: typeof next === "function" ? next(cursor) : next
				});
			};
			const filterRef = (0, react.useRef)(null);
			const listRef = (0, react.useRef)(null);
			const keyMoved = (0, react.useRef)(false);
			const folders = (0, react.useMemo)(() => entries.filter((entry) => entry.type === "dir"), [entries]);
			const audio = (0, react.useMemo)(() => entries.filter((entry) => entry.type === "audio"), [entries]);
			const others = (0, react.useMemo)(() => entries.filter((entry) => entry.type !== "dir" && entry.type !== "audio"), [entries]);
			const nav = (0, react.useMemo)(() => [
				...folderEpisode !== null ? [{
					kind: "episode",
					id: folderEpisode.id
				}] : [],
				...folders.map((entry) => ({
					kind: "dir",
					rel: entry.rel
				})),
				...audio.map((entry) => ({
					kind: "audio",
					rel: entry.rel
				}))
			], [
				folderEpisode,
				folders,
				audio
			]);
			(0, react.useEffect)(() => {
				filterRef.current?.focus();
			}, [place?.id, rel]);
			(0, react.useEffect)(() => {
				if (!keyMoved.current) return;
				keyMoved.current = false;
				listRef.current?.querySelector("[data-active=\"true\"]")?.scrollIntoView({ block: "nearest" });
			}, [cursor]);
			const pickFile = (fileRel) => {
				if (place === null) return;
				onOpenFile(place.id, fileRel);
			};
			const activate = (item) => {
				if (item === void 0) return;
				if (item.kind === "episode") onOpenEpisode(item.id);
				else if (item.kind === "dir") picker.enter(place?.id ?? "", item.rel);
				else pickFile(item.rel);
			};
			const onKeyDown = (event) => {
				const target = event.target;
				if (target instanceof HTMLSelectElement) {
					if (event.key === "Escape") {
						event.stopPropagation();
						onClose();
					}
					return;
				}
				const onButton = target instanceof HTMLButtonElement;
				const emptyFilter = target instanceof HTMLInputElement && target.value.length === 0;
				switch (event.key) {
					case "Escape":
						event.preventDefault();
						event.stopPropagation();
						onClose();
						return;
					case "ArrowDown":
					case "ArrowUp": {
						if (nav.length === 0) return;
						event.preventDefault();
						event.stopPropagation();
						keyMoved.current = true;
						const step = event.key === "ArrowDown" ? 1 : -1;
						setCursor((current) => (current + step + nav.length) % nav.length);
						return;
					}
					case "Enter":
						if (onButton) return;
						event.preventDefault();
						event.stopPropagation();
						activate(nav[Math.min(cursor, nav.length - 1)]);
						return;
					case "Backspace":
						if (!emptyFilter || rel === "") return;
						event.preventDefault();
						event.stopPropagation();
						picker.up();
						return;
					default: event.stopPropagation();
				}
			};
			const folderName = rel === "" ? place?.label ?? "" : rel.split("/").filter(Boolean).pop() ?? "";
			const segments = rel.split("/").filter((part) => part.length > 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-mask",
				onClick: onClose,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-modal is-browse",
					role: "dialog",
					"aria-label": t("pickerBrowseTitle"),
					onClick: (event) => event.stopPropagation(),
					onKeyDown,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-modal-head",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-modal-title",
								children: t("pickerBrowseTitle")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							opening || picker.loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
					}), picker.places.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-modal-body",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-empty",
							children: t("noWorkspaces")
						})
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-browse-bar",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-pathrow",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
										className: "dsh-lingualab-select",
										"aria-label": t("pickerPlace"),
										value: place?.id ?? "",
										onChange: (event) => picker.enter(event.target.value, ""),
										children: picker.places.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
											value: entry.id,
											disabled: !entry.readable,
											children: [
												entry.label,
												entry.suggested ? ` · ${t("pickerConvention")}` : "",
												entry.readable ? "" : ` · ${entry.reason ?? t("dirUnreadable")}`
											]
										}, entry.id))
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-icon-btn is-small",
										onClick: picker.up,
										disabled: rel === "",
										title: t("pickerParent"),
										"aria-label": t("pickerParent"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UpIcon, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
										className: "dsh-lingualab-crumbs",
										title: place?.path ?? "",
										children: [segments.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dsh-lingualab-crumbs-root",
											children: place?.path ?? ""
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dsh-lingualab-crumb",
											onClick: () => picker.enter(place?.id ?? "", ""),
											title: place?.path ?? "",
											children: place?.label ?? ""
										}), segments.map((segment, index) => {
											const here = index === segments.length - 1;
											return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: "dsh-lingualab-crumb-item",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronIcon, { size: 12 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: `dsh-lingualab-crumb${here ? " is-here" : ""}`,
													disabled: here,
													onClick: () => picker.enter(place?.id ?? "", segments.slice(0, index + 1).join("/")),
													children: segment
												})]
											}, `${segment}-${index}`);
										})]
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: filterRef,
								className: "dsh-lingualab-input",
								value: query,
								placeholder: t("pickerSearch"),
								onChange: (event) => picker.setQuery(event.target.value)
							})]
						}),
						openError !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-error is-pad",
							children: openError
						}) : null,
						picker.error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-error is-pad",
							children: picker.error
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							ref: listRef,
							className: `dsh-lingualab-modal-body${picker.loading && entries.length > 0 ? " is-loading" : ""}`,
							children: [
								!picker.loading && picker.error === null && nav.length === 0 && others.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-lingualab-empty is-center",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: query.trim().length > 0 ? t("pickerNoMatch", { query: query.trim() }) : t("pickerEmptyFolder") }), query.trim().length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("pickerEmptyHint") }) : null]
								}) : null,
								folderEpisode !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `dsh-lingualab-pick is-episode${cursor === 0 ? " is-active" : ""}`,
									"data-active": cursor === 0,
									onMouseMove: () => setCursor(0),
									onClick: () => onOpenEpisode(folderEpisode.id),
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
											className: "dsh-lingualab-badge is-ok",
											children: t("pickerEpisodes")
										})
									]
								}) : null,
								folders.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-group",
									children: t("pickerGroupFolders", { count: folders.length })
								}) : null,
								folders.map((entry, index) => {
									const at = (folderEpisode !== null ? 1 : 0) + index;
									return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrowseRow, {
										t,
										entry,
										active: cursor === at,
										onHover: () => setCursor(at),
										onEnter: (next) => picker.enter(place?.id ?? "", next),
										onPickFile: pickFile
									}, entry.rel);
								}),
								audio.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-group",
									children: t("pickerGroupAudio", { count: audio.length })
								}) : null,
								audio.map((entry, index) => {
									const at = (folderEpisode !== null ? 1 : 0) + folders.length + index;
									return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrowseRow, {
										t,
										entry,
										active: cursor === at,
										onHover: () => setCursor(at),
										onEnter: (next) => picker.enter(place?.id ?? "", next),
										onPickFile: pickFile
									}, entry.rel);
								}),
								others.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-group",
									children: t("pickerGroupOther", { count: others.length })
								}) : null,
								others.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrowseRow, {
									t,
									entry,
									active: false,
									onHover: () => void 0,
									onEnter: () => void 0,
									onPickFile: () => void 0
								}, entry.rel)),
								picker.truncated ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-hint is-pad",
									children: t("pickerTruncated")
								}) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-modal-foot",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-keys",
									children: t("pickerKeys")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-foot-hint",
									title: t("pickerFooterHint", { name: folderName }),
									children: t("pickerFooterHint", { name: folderName })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-btn",
									onClick: () => {
										if (place !== null) onUseFolder(place.id, rel);
									},
									disabled: place === null || savingFolder || !place.readable,
									children: t("mediaFolderUse")
								})
							]
						})
					] })]
				})
			});
		}
		/** One row of a directory listing. */
		function BrowseRow({ t, entry, active, onHover, onEnter, onPickFile }) {
			if (entry.type === "dir") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `dsh-lingualab-pick${active ? " is-active" : ""}`,
				"data-active": active,
				onMouseMove: onHover,
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
				className: `dsh-lingualab-pick${active ? " is-active" : ""}`,
				"data-active": active,
				onMouseMove: onHover,
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
							children: entry.subtitle !== null && entry.subtitle.files.length > 0 ? `${formatBytes(entry.bytes)} · ${entry.subtitle.files.join(" · ")}` : formatBytes(entry.bytes)
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `dsh-lingualab-badge is-${hintTone(entry.subtitle)}`,
						children: hintBadge(t, entry.subtitle)
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-pick is-inert",
				"aria-disabled": true,
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
		//#region src/client/shared/ui/Skeleton.tsx
		/**
		* Placeholders shown while the library or an episode's subtitles are on their way.
		*
		* They mirror the real layout (the resume card, the episode grid, the big sentence), so
		* the page does not jump when the content arrives. The wrapper fades in after a short
		* delay (see `.dsh-lingualab-sk-wrap`): a load that finishes within that delay never
		* shows a placeholder at all, which beats a skeleton that flashes for one frame.
		*/
		/** One shimmering bar. */
		function Bar({ width, height, radius }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dsh-lingualab-sk",
				style: {
					width,
					height,
					borderRadius: radius ?? 8
				}
			});
		}
		/** The home page while the library listing loads. */
		function HomeSkeleton({ label }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-sk-wrap",
				role: "status",
				"aria-live": "polite",
				"aria-label": label,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-sk-resume",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
								width: "84px",
								height: 12
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
								width: "62%",
								height: 30
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-sk-row",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
										width: "72px",
										height: 12
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
										width: "56px",
										height: 12
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
										width: "96px",
										height: 12
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
								width: "100%",
								height: 6,
								radius: 999
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
								width: "148px",
								height: 40,
								radius: 999
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-sk-row",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
							width: "96px",
							height: 16
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-sk-grid",
						children: [
							0,
							1,
							2
						].map((index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-sk-card",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-lingualab-sk-row is-between",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
										width: "32px",
										height: 32,
										radius: 10
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
										width: "56px",
										height: 20,
										radius: 999
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
									width: "86%",
									height: 16
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
									width: "52%",
									height: 12
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
									width: "100%",
									height: 4,
									radius: 999
								})
							]
						}, index))
					})
				]
			});
		}
		/** The transcript column while an episode's subtitles load. */
		function ListSkeleton({ label }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-sk-wrap dsh-lingualab-sk-list",
				role: "status",
				"aria-live": "polite",
				"aria-label": label,
				children: [
					"88%",
					"64%",
					"92%",
					"48%",
					"80%",
					"70%"
				].map((width, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-sk-item",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
							width: "36px",
							height: 11
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
							width,
							height: 14
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
							width: `calc(${width} - 16%)`,
							height: 11
						})
					]
				}, index))
			});
		}
		/** The practice stage while an episode's subtitles load. */
		function StageSkeleton({ label }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-sk-wrap dsh-lingualab-sk-stage",
				role: "status",
				"aria-live": "polite",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-sk-lines",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
							width: "78%",
							height: 34
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
							width: "54%",
							height: 34
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bar, {
							width: "40%",
							height: 16
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "dsh-lingualab-sk-label",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-spinner",
						"aria-hidden": true
					}), label]
				})]
			});
		}
		//#endregion
		//#region src/client/widgets/library-home/ui/DropZone.tsx
		/**
		* The place files are dropped, and the control that does the same thing.
		*
		* Dragging is the fast path and a file picker is the one that always works: a reader
		* on a trackpad, on a touch screen, or with the files in a window the browser will not
		* accept a drag from needs the button. Both end in the same call, which is why they sit
		* in one file even though they are two components.
		*
		* The zone reacts to a drag over the *page*, not just over itself. A target the size of
		* a card is hard to hit when you are carrying a file across a whole window, so the
		* page-wide overlay turns "aim at the box" into "let go anywhere". The drag counter is
		* what makes that reliable: `dragenter` and `dragleave` fire for every child element
		* the pointer crosses, so a boolean would flicker off the moment the cursor moved over
		* a button.
		*/
		/** The extensions the file picker offers; the host re-checks every file it receives. */
		const ACCEPT = ".mp3,.m4a,.wav,.ogg,.opus,.flac,.srt,.vtt,.lrc";
		/** Whether a drag carries files, as opposed to text or a link being moved around. */
		function carriesFiles(event) {
			return Array.from(event.dataTransfer.types).includes("Files");
		}
		/** A drag-and-drop target covering the page. */
		function DropZone({ t, onFiles, disabled = false, children }) {
			const [over, setOver] = (0, react.useState)(false);
			const depth = (0, react.useRef)(0);
			const reset = (0, react.useCallback)(() => {
				depth.current = 0;
				setOver(false);
			}, []);
			(0, react.useEffect)(() => {
				window.addEventListener("dragend", reset);
				window.addEventListener("drop", reset);
				return () => {
					window.removeEventListener("dragend", reset);
					window.removeEventListener("drop", reset);
				};
			}, [reset]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `dsh-lingualab-drop${over ? " is-over" : ""}`,
				onDragEnter: (event) => {
					if (!carriesFiles(event)) return;
					event.preventDefault();
					if (disabled) return;
					depth.current += 1;
					setOver(true);
				},
				onDragOver: (event) => {
					if (!carriesFiles(event)) return;
					event.preventDefault();
					event.dataTransfer.dropEffect = disabled ? "none" : "copy";
				},
				onDragLeave: (event) => {
					if (disabled || !carriesFiles(event)) return;
					depth.current = Math.max(0, depth.current - 1);
					if (depth.current === 0) setOver(false);
				},
				onDrop: (event) => {
					if (!carriesFiles(event)) return;
					event.preventDefault();
					reset();
					if (disabled) return;
					if (event.dataTransfer.files.length > 0) onFiles(Array.from(event.dataTransfer.files));
				},
				children: [children, over ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-drop-veil",
					"aria-hidden": true,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-drop-veil-card",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("dropRelease") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("dropAccepts") })]
					})
				}) : null]
			});
		}
		/**
		* A button that opens the browser's file chooser.
		*
		* A `<label>` around a hidden input, rather than a button that calls `.click()` on a
		* ref: the label is the platform's own way to forward a press to a file input, it works
		* from the keyboard, and it needs no ref to be read at all.
		*/
		function FilePicker({ onFiles, disabled = false, className = "dsh-lingualab-btn", children }) {
			const onChange = (event) => {
				const list = event.target.files;
				if (list !== null && list.length > 0) onFiles(Array.from(list));
				event.target.value = "";
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: `${className}${disabled ? " is-disabled" : ""}`,
				"aria-disabled": disabled,
				children: [children, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "file",
					multiple: true,
					accept: ACCEPT,
					disabled,
					onChange,
					className: "dsh-lingualab-visually-hidden",
					"data-testid": "lingualab-file-input"
				})]
			});
		}
		//#endregion
		//#region src/client/widgets/library-home/ui/LibraryHome.tsx
		/**
		* The page you land on: what you can practise, and the one thing to do next.
		*
		* The old page opened straight into a player with nothing in it and asked about a
		* "media folder", which is a setting, to a reader who had come to listen. This page
		* answers the question they actually have, in the order they have it:
		*
		*   1. **Is there something to continue?** The episode they stopped in, as the biggest
		*      thing on the page, with a single button that resumes it.
		*   2. **What else is there?** The rest of the library as a list of rows that open on a
		*      click. A row says what it is (title, length of audio, whether it has subtitles,
		*      how many phrases are kept) and nothing that is a decision about files.
		*   3. **How do I add more?** Drop files anywhere, or press the button. With an empty
		*      library this is the whole page, because it is the only useful thing on it.
		*
		* Where the files live is one quiet line at the bottom, with a way to change it.
		* It is a setting touched twice a month, and a page that leads with it reads as a
		* settings page.
		*/
		/**
		* Every episode worth listing: the library's, folders first, plus the one open now when
		* it lives somewhere the scan does not look.
		*/
		function allEpisodes(library, current) {
			const listed = library === null ? [] : [...library.episodes, ...library.files];
			if (current === null || listed.some((entry) => entry.id === current.id)) return listed;
			return [current, ...listed];
		}
		/** What an episode's subtitles amount to, in one short word. */
		function subtitleWord(t, entry) {
			if (entry.audio === null) return t("pickerNoAudio");
			if (entry.subtitleEn !== null && entry.subtitleZh !== null) return t("subtitleBadgeBoth");
			if (entry.subtitleEn !== null) return t("subtitleBadgeEn");
			if (entry.subtitleZh !== null) return t("subtitleBadgeZh");
			return t("subtitleBadgeNone");
		}
		/** The badge tone for an episode: a full pair is good news, a bare file a warning, the rest neutral. */
		function subtitleTone(entry) {
			if (entry.audio === null) return "plain";
			if (entry.subtitleEn !== null && entry.subtitleZh !== null) return "ok";
			if (entry.subtitleEn === null && entry.subtitleZh === null) return "warn";
			return "plain";
		}
		/** The home page of the panel. */
		function LibraryHome({ t, library, loading, importer, progress, currentId, current, opening, openError, onOpen, onFiles, onBrowse, onFolder }) {
			const playable = allEpisodes(library, current).filter((entry) => entry.audio !== null);
			const resume = playable.find((entry) => entry.id === currentId) ?? [...playable].sort((a, b) => (progress[b.id]?.updatedAt ?? 0) - (progress[a.id]?.updatedAt ?? 0)).find((entry) => progress[entry.id] !== void 0) ?? null;
			const rest = playable.filter((entry) => entry.id !== resume?.id);
			const empty = !loading && playable.length === 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-home",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DropZone, {
					t,
					onFiles,
					disabled: importer.busy,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-home-inner",
						children: [
							importer.busy || importer.outcomes.length > 0 || importer.unmatched.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImportReport, {
								t,
								importer,
								onOpen
							}) : null,
							openError !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-error",
								children: openError
							}) : null,
							loading && playable.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HomeSkeleton, { label: t("libraryLoading") }) : null,
							empty ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-welcome",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dsh-lingualab-welcome-icon",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UploadIcon, { size: 28 })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: t("welcomeTitle") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("welcomeBody") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-lingualab-actions",
										style: { justifyContent: "center" },
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePicker, {
											className: "dsh-lingualab-btn is-primary",
											onFiles,
											disabled: importer.busy,
											children: t("chooseFiles")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dsh-lingualab-btn",
											onClick: onBrowse,
											children: t("browseExisting")
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "dsh-lingualab-hint",
										children: t("welcomeNaming")
									})
								]
							}) : null,
							resume !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ResumeCard, {
								t,
								entry: resume,
								progress: progress[resume.id] ?? null,
								opening,
								onOpen
							}) : null,
							rest.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: "dsh-lingualab-section",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-lingualab-section-head",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: resume === null ? t("homeEpisodes") : t("homeOthers") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(FilePicker, {
											onFiles,
											disabled: importer.busy,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(UploadIcon, {}),
												" ",
												t("addFiles")
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dsh-lingualab-btn",
											onClick: onBrowse,
											children: t("browseExisting")
										})
									]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-lingualab-episodes is-grid",
									children: rest.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EpisodeRow, {
										t,
										entry,
										progress: progress[entry.id] ?? null,
										onOpen,
										disabled: opening
									}, entry.id))
								})]
							}) : null,
							!empty && resume !== null && rest.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(FilePicker, {
									onFiles,
									disabled: importer.busy,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(UploadIcon, {}),
										" ",
										t("addFiles")
									]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-btn",
									onClick: onBrowse,
									children: t("browseExisting")
								})]
							}) : null,
							!empty && !loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-dropstrip",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(UploadIcon, { size: 18 }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("dropStrip") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePicker, {
										onFiles,
										disabled: importer.busy,
										children: t("chooseFiles")
									})
								]
							}) : null,
							loading && playable.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderLine, {
								t,
								library,
								onChange: onFolder
							})
						]
					})
				})
			});
		}
		/** The big "continue where you stopped" card. */
		function ResumeCard({ t, entry, progress, opening, onOpen }) {
			const fraction = fractionOf(progress);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dsh-lingualab-resume",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-resume-label",
						children: progress === null ? t("homeStart") : t("homeContinue")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: "dsh-lingualab-resume-title",
						children: entry.title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-resume-meta",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: subtitleWord(t, entry) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: formatBytes(entry.audioBytes) }),
							entry.notes.count > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								t("notesKept"),
								" ",
								entry.notes.count
							] }) : null,
							progress !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("stoppedAt", { time: formatClock(progress.at) }) }) : null
						]
					}),
					progress !== null && fraction > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-bar",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-bar-fill",
							style: { width: `${String(fraction * 100)}%` }
						})
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-actions",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "dsh-lingualab-btn is-primary is-large",
							onClick: () => onOpen(entry.id),
							disabled: opening,
							children: [
								opening ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-spinner",
									"aria-hidden": true
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlayIcon, { size: 16 }),
								" ",
								progress === null ? t("startPractice") : t("resumePractice")
							]
						})
					})
				]
			});
		}
		/** One card of the episode grid. */
		function EpisodeRow({ t, entry, progress, disabled, onOpen }) {
			const fraction = fractionOf(progress);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "dsh-lingualab-episode-card",
				onClick: () => onOpen(entry.id),
				disabled,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-episode-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-episode-icon",
							children: entry.kind === "folder" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderIcon, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AudioIcon, {})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `dsh-lingualab-badge is-${subtitleTone(entry)}`,
							children: subtitleWord(t, entry)
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-episode-title",
						title: entry.title,
						children: entry.title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-pick-sub",
						children: [
							formatBytes(entry.audioBytes),
							entry.notes.count > 0 ? ` · ${t("notesKept")} ${String(entry.notes.count)}` : "",
							progress !== null ? ` · ${t("stoppedAt", { time: formatClock(progress.at) })}` : ""
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-bar",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-bar-fill",
							style: { width: `${String(fraction * 100)}%` }
						})
					})
				]
			});
		}
		/** The progress and result of a drop, shown where the reader is already looking. */
		function ImportReport({ t, importer, onOpen }) {
			const saved = importer.outcomes.filter((item) => item.status === "saved").length;
			const existing = importer.outcomes.filter((item) => item.status === "exists");
			const existedFolders = [...new Set(existing.map((item) => item.episode))];
			const refused = importer.outcomes.filter((item) => item.status === "refused" || item.status === "skipped");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-report",
				role: "status",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-actions",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: importer.busy ? t("importing", {
								done: importer.done,
								total: importer.total
							}) : t("importDone", {
								saved,
								total: importer.total
							}) }),
							importer.busy && importer.current !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-hint",
								children: importer.current
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							!importer.busy && importer.lastEpisode !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-btn is-primary",
								onClick: () => {
									if (importer.lastEpisode !== null) onOpen(importer.lastEpisode);
									importer.dismiss();
								},
								children: t("openImported")
							}) : null,
							!importer.busy ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-btn",
								onClick: importer.dismiss,
								children: t("dismiss")
							}) : null
						]
					}),
					importer.busy ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-bar",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-bar-fill",
							style: { width: `${String(importer.total === 0 ? 0 : importer.done / importer.total * 100)}%` }
						})
					}) : null,
					existing.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-hint",
						children: t("importExisted", {
							count: existing.length,
							folders: existedFolders.join("、")
						})
					}) : null,
					refused.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-error",
						children: [
							item.name,
							"：",
							item.reason ?? t("importFailed")
						]
					}, `${item.episode}/${item.name}`)),
					importer.unmatched.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-warn",
						children: [
							t("importUnmatched"),
							"：",
							importer.unmatched.join("、")
						]
					}) : null,
					importer.ignored.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-hint",
						children: [
							t("importIgnored"),
							"：",
							importer.ignored.join("、")
						]
					}) : null
				]
			});
		}
		/** One quiet line about where the files live. */
		function FolderLine({ t, library, onChange }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-folderline",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("filesLiveIn") }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
						className: "dsh-lingualab-path",
						title: library?.root ?? "",
						children: library?.root !== void 0 && library.root.length > 0 ? library.root : t("mediaFolderSourceNone")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-link",
						onClick: onChange,
						children: t("change")
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
		function MediaFolderPanel({ t, config, onSaved, onClose }) {
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-mask",
				onClick: onClose,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-modal",
					onClick: (event) => event.stopPropagation(),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-modal-head",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-modal-title",
								children: t("mediaFolder")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-icon-btn",
								onClick: onClose,
								title: t("close"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
							})
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-modal-body",
						children: body
					})]
				})
			});
		}
		//#endregion
		//#region src/client/widgets/practice-stage/ui/Stage.tsx
		/**
		* The stage: the sentence you are working on, large, with its neighbours around it.
		*
		* Four small behaviours live here, and each one answers a specific annoyance.
		*
		*   · **The sentence changes with a motion, not a jump.** The block is keyed by the cue,
		*     so React remounts it and a CSS animation fades and lifts the new line in. A 30 ms
		*     swap read as the text flickering; 180 ms reads as the sentence having moved on.
		*     The animation is off under `prefers-reduced-motion`.
		*   · **Words can be pointed at.** A click on an English word opens a small popover to
		*     copy it or add it to the sentence's note, and playback carries on: stopping the
		*     audio to look at a word would cost the next sentence.
		*   · **Shadowing hides the English.** While the pause-after-sentence mode is on, the
		*     line is blurred until the sentence has ended (or you press R), so the first thing
		*     you do is say it from what you heard, and the text is the answer key.
		*   · **Nothing is a blank.** No subtitles, no audio and "finished" each get a message
		*     that says what to do next, because an empty stage looks like a crash.
		*/
		/** Past this many characters the sentence is set a size smaller so it still fits. */
		const LONG_LINE = 90;
		/** How long a confirmation ("copied") stays on the popover. */
		const CONFIRM_MS = 1400;
		/** The centre of the practice view. */
		function Stage({ t, cues, activeIndex, zhMode, masked, onReveal, onAddWord, hasWord, loading, hasAudio }) {
			const cue = cues[activeIndex];
			const previous = cues[activeIndex - 1];
			const next = cues[activeIndex + 1];
			const lines = cue === void 0 ? null : splitCue(cue);
			const block = (0, react.useRef)(null);
			const [pinned, setPinned] = (0, react.useState)(null);
			const [done, setDone] = (0, react.useState)(null);
			const timer = (0, react.useRef)(null);
			const close = (0, react.useCallback)(() => {
				setPinned(null);
				setDone(null);
			}, []);
			const [owner, setOwner] = (0, react.useState)(activeIndex);
			if (owner !== activeIndex) {
				setOwner(activeIndex);
				if (pinned !== null) close();
			}
			(0, react.useEffect)(() => {
				if (pinned === null) return;
				const onKey = (event) => {
					if (event.key !== "Escape") return;
					event.stopPropagation();
					event.preventDefault();
					close();
				};
				const onDown = (event) => {
					if (!(event.target instanceof Element) || event.target.closest(".dsh-lingualab-word-pop, .is-word") === null) close();
				};
				document.addEventListener("keydown", onKey, true);
				document.addEventListener("mousedown", onDown);
				return () => {
					document.removeEventListener("keydown", onKey, true);
					document.removeEventListener("mousedown", onDown);
				};
			}, [pinned, close]);
			(0, react.useEffect)(() => () => {
				if (timer.current !== null) clearTimeout(timer.current);
			}, []);
			const confirm = (kind) => {
				setDone(kind);
				if (timer.current !== null) clearTimeout(timer.current);
				timer.current = setTimeout(() => setDone(null), CONFIRM_MS);
			};
			const pick = (event, word) => {
				const host = block.current;
				if (host === null) return;
				const box = host.getBoundingClientRect();
				const rect = event.currentTarget.getBoundingClientRect();
				setDone(null);
				setPinned({
					word,
					left: rect.left - box.left + rect.width / 2,
					top: rect.top - box.top
				});
			};
			const copy = (word) => {
				navigator.clipboard.writeText(word).then(() => confirm("copied"), () => void 0);
			};
			if (!hasAudio) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-stage",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-stage-empty",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("noAudio") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("noAudioHint") })]
				})
			});
			if ((cue === void 0 || lines === null) && loading) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-stage",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StageSkeleton, { label: `${t("stageLoading")}…` })
			});
			if (cue === void 0 || lines === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-stage",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-stage-empty",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: loading ? `${t("stageLoading")}…` : t("noSubtitles") }), loading ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("noSubtitlesHint") })]
				})
			});
			const showChinese = zhMode !== "hidden" && lines.chinese.length > 0;
			const tokens = tokenizeEnglish(lines.english);
			const long = lines.english.length > LONG_LINE;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-stage",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-stage-meta",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-pill",
							children: t("cueOf", {
								n: activeIndex + 1,
								total: cues.length
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							formatClock(cue.start),
							" – ",
							formatClock(cue.end)
						] })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-stage-side is-prev",
						"aria-hidden": true,
						children: previous === void 0 ? " " : splitCue(previous).english
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-stage-now",
						ref: block,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: `dsh-lingualab-stage-en${long ? " is-long" : ""}${masked ? " is-masked" : ""}`,
								children: masked ? lines.english : tokens.map((token, index) => token.word ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: `is-word${pinned?.word === token.text ? " is-pinned" : ""}`,
									onClick: (event) => pick(event, token.text),
									children: token.text
								}, index) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: token.text }, index))
							}),
							masked ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dsh-lingualab-reveal",
								onClick: onReveal,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EyeIcon, { size: 14 }),
									" ",
									t("reveal"),
									" ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "R" })
								]
							}) : null,
							showChinese ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-stage-zh",
								"data-zh": zhMode,
								children: lines.chinese
							}) : null,
							pinned !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-word-pop",
								role: "dialog",
								style: {
									left: pinned.left,
									top: pinned.top
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: pinned.word }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "dsh-lingualab-pop-btn",
										onClick: () => copy(pinned.word),
										children: [done === "copied" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 13 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyIcon, { size: 13 }), done === "copied" ? t("copied") : t("copy")]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "dsh-lingualab-pop-btn",
										disabled: hasWord(pinned.word),
										onClick: () => {
											onAddWord(pinned.word);
											confirm("added");
										},
										children: [done === "added" || hasWord(pinned.word) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 13 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteIcon, { size: 13 }), done === "added" || hasWord(pinned.word) ? t("wordAdded") : t("wordAdd")]
									})
								]
							}) : null
						]
					}, `${String(cue.start)}-${String(activeIndex)}`),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-stage-side is-next",
						"aria-hidden": true,
						children: next === void 0 || masked ? " " : splitCue(next).english
					})
				]
			});
		}
		//#endregion
		//#region src/client/widgets/practice-stage/ui/KeyHints.tsx
		const HINTS = [
			{
				id: "space",
				caps: ["Space"],
				label: "hintPlay"
			},
			{
				id: "arrows",
				caps: ["←", "→"],
				label: "hintSentence"
			},
			{
				id: "l",
				caps: ["L"],
				label: "hintLoop"
			},
			{
				id: "s",
				caps: ["S"],
				label: "hintKeep"
			},
			{
				id: "c",
				caps: ["C"],
				label: "hintChinese"
			},
			{
				id: "r",
				caps: ["R"],
				label: "hintReveal"
			}
		];
		/** The caps row. */
		function KeyHints({ t, flash, active }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `dsh-lingualab-keyhints${active ? "" : " is-idle"}`,
				children: HINTS.map((hint) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: `dsh-lingualab-keyhint${flash === hint.id ? " is-hit" : ""}`,
					children: [hint.caps.map((cap) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: cap }, cap)), t(hint.label)]
				}, hint.id))
			});
		}
		//#endregion
		//#region src/client/widgets/practice-stage/ui/FinishCard.tsx
		/**
		* What the page says when an episode reaches its end.
		*
		* Playback that just stops is the page not noticing that you finished something. This
		* card does the one useful thing: it counts what the session produced (sentences heard,
		* sentences kept, how many of those are still being practised), and it offers the three
		* next moves in the order people take them: listen again, the next episode, or the list.
		* It floats over the stage rather than replacing it, and closing it leaves the finished
		* episode exactly where it was.
		*/
		/** The end-of-episode summary. */
		function FinishCard({ t, title, sentences, kept, practising, nextTitle, onAgain, onNext, onHome, onClose }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-finish",
				role: "dialog",
				"aria-label": t("finishTitle"),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-finish-card",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-finish-badge",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 22 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("finishTitle") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: title }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
							className: "dsh-lingualab-finish-stats",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: sentences }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t("finishSentences") })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: kept }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t("finishKept") })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: practising }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t("finishPractising") })] })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-actions",
							style: { justifyContent: "center" },
							children: [
								nextTitle !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "dsh-lingualab-btn is-primary is-large",
									onClick: onNext,
									autoFocus: true,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlayIcon, { size: 15 }),
										" ",
										t("finishNext", { title: nextTitle })
									]
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `dsh-lingualab-btn is-large${nextTitle === null ? " is-primary" : ""}`,
									onClick: onAgain,
									children: t("finishAgain")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsh-lingualab-btn is-large",
									onClick: onHome,
									children: t("backToList")
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-link",
							onClick: onClose,
							children: t("finishClose")
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/widgets/notes-panel/ui/NotesPanel.tsx
		/**
		* The notes drawer: the sentences you kept, and what you did with them.
		*
		* Keeping a sentence is one tap on the star, so this panel is where the thinking
		* happens afterwards, not where it is blocked. Each row can be replayed (one click
		* seeks there and loops it), given a note of your own, tagged with the method's two
		* words, and ticked off once it sticks. Ticked phrases drop out of the default
		* 「还在练」 view rather than being deleted, which is what the old seven-phrase ceiling
		* was trying to achieve by force: a short working set. A filter does the same thing
		* without asking for a decision in the middle of a sentence.
		*/
		/** Tags the study method uses; a phrase may carry both. */
		const TAGS = ["review", "hard"];
		/** How long the undo stays on screen. */
		const UNDO_MS = 6e3;
		/** The right-hand notes drawer. */
		function NotesPanel({ t, notes, episodeTitle, onClose }) {
			const [view, setView] = (0, react.useState)("active");
			const [editing, setEditing] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)("");
			const [removed, setRemoved] = (0, react.useState)(null);
			const timer = (0, react.useRef)(null);
			const store = useMediaPlayer.getState;
			(0, react.useEffect)(() => () => {
				if (timer.current !== null) clearTimeout(timer.current);
			}, []);
			/** Replaying a phrase is one gesture: seek there and loop that sentence. */
			const replay = (at) => {
				store().seek(at);
				store().setLoopMode("sentence");
			};
			const remove = (phrase, index) => {
				notes.remove(index);
				setEditing(null);
				setRemoved({
					phrase,
					index
				});
				if (timer.current !== null) clearTimeout(timer.current);
				timer.current = setTimeout(() => setRemoved(null), UNDO_MS);
			};
			const undo = () => {
				if (removed === null) return;
				notes.restore(removed.phrase, removed.index);
				setRemoved(null);
				if (timer.current !== null) clearTimeout(timer.current);
			};
			const activeCount = notes.phrases.filter((phrase) => !phrase.done).length;
			const doneCount = notes.phrases.length - activeCount;
			const rows = notes.phrases.map((phrase, index) => ({
				phrase,
				index
			})).filter(({ phrase }) => view === "all" ? true : view === "done" ? phrase.done : !phrase.done);
			/** Words are kept in the note as [word]; editing the text must not lose them. */
			const commit = (index, words) => {
				const note = [draft.trim(), ...words.map((word) => `[${word}]`)].filter((part) => part.length > 0).join(" ");
				notes.update(index, { note });
				setEditing(null);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: "dsh-lingualab-notes",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-notes-head",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-lingualab-drawer-titles",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-drawer-title",
									children: t("notes")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-drawer-sub",
									children: t("notesSubtitle", {
										episode: episodeTitle,
										count: notes.phrases.length
									})
								})]
							}),
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-tabs",
						children: [
							[
								"active",
								t("viewActive"),
								activeCount
							],
							[
								"done",
								t("viewDone"),
								doneCount
							],
							[
								"all",
								t("viewAll"),
								notes.phrases.length
							]
						].map(([id, label, count]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `dsh-lingualab-tab${view === id ? " is-on" : ""}`,
							onClick: () => setView(id),
							children: [
								label,
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-counter",
									children: count
								})
							]
						}, id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-notes-body",
						children: [
							notes.phrases.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-empty is-center",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StarIcon, { size: 22 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("notesEmpty") })]
							}) : null,
							notes.phrases.length > 0 && rows.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-empty is-center",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 22 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: view === "active" ? t("notesAllDone") : t("notesNoneHere") })]
							}) : null,
							rows.map(({ phrase, index }) => {
								const { words, text } = splitNote(phrase.note);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: `dsh-lingualab-note${phrase.done ? " is-done" : ""}`,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dsh-lingualab-note-top",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
													className: "dsh-lingualab-note-check",
													title: phrase.done ? t("stepUndone") : t("notesMarkDone"),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
														type: "checkbox",
														className: "dsh-lingualab-visually-hidden",
														checked: phrase.done,
														onChange: (event) => notes.update(index, { done: event.target.checked })
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: `dsh-lingualab-box${phrase.done ? " is-on" : ""}`,
														children: phrase.done ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 13 }) : null
													})]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "dsh-lingualab-note-at",
													onClick: () => replay(phrase.at),
													title: t("notesReplay"),
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlayIcon, { size: 10 }),
														" ",
														formatClock(phrase.at)
													]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: "dsh-lingualab-icon-btn is-small",
													title: t("notesEdit"),
													onClick: () => {
														setEditing(index);
														setDraft(text);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditIcon, {})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: "dsh-lingualab-icon-btn is-small is-danger",
													title: t("notesDelete"),
													onClick: () => remove(phrase, index),
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrashIcon, {})
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
											placeholder: t("notesEditorPlaceholder"),
											onChange: (event) => setDraft(event.target.value),
											onBlur: () => commit(index, words),
											onKeyDown: (event) => {
												if (event.key === "Enter") commit(index, words);
												if (event.key === "Escape") setEditing(null);
												event.stopPropagation();
											}
										}) : words.length > 0 || text.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dsh-lingualab-memo",
											children: [words.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: "dsh-lingualab-memo-words",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BookIcon, { size: 13 }), words.map((word) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "dsh-lingualab-word-chip",
													children: word
												}, word))]
											}) : null, text.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "dsh-lingualab-memo-text",
												children: text
											}) : null]
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
								}, `${phrase.at}-${index}`);
							})
						]
					}),
					removed !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-toast",
						role: "status",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrashIcon, { size: 15 }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("notesDeleted", { time: formatClock(removed.phrase.at) }) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dsh-lingualab-toast-undo",
								onClick: undo,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(UndoIcon, { size: 14 }),
									" ",
									t("notesUndo")
								]
							})
						]
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-drawer-foot",
						children: [
							notes.status === "saving" ? t("saving") : null,
							notes.status === "saved" ? t("saved") : null,
							notes.status === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-error",
								children: t("saveFailed")
							}) : null,
							notes.status === "idle" ? t("notesFootnote") : null
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
		* elapsed seconds are per episode and are progress through today's material rather than
		* part of the notes file the agent reads. They are cached in this browser and shared
		* through the host, so another device shows the same ticks.
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
		/** The chip plus, when open, the checklist under it. */
		function StepTracker({ t, episode, open, onToggle }) {
			const [records, setRecords] = (0, react.useState)(() => readSteps(episode));
			const [running, setRunning] = (0, react.useState)(null);
			const persist = (0, react.useCallback)((next) => {
				setRecords(next);
				writeSteps(episode, next);
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
						writeSteps(episode, next);
						return next;
					});
				}, 1e3);
				return () => clearInterval(timer);
			}, [running, episode]);
			const done = STEPS.filter((step) => (records[step.id] ?? EMPTY).done).length;
			const fraction = done / STEPS.length;
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
			}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: "dsh-lingualab-popover",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-notes-head",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-lingualab-drawer-titles",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-drawer-title",
								children: t("stepsTitle")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-drawer-sub",
								children: t("stepsProgress", {
									done,
									total: STEPS.length
								})
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-icon-btn",
							onClick: onToggle,
							title: t("close"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-steps-body",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-steps-total",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-bar",
							"aria-hidden": true,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-bar-fill",
								style: { width: `${String(fraction * 100)}%` }
							})
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-steps",
						children: STEPS.map((step, index) => {
							const record = records[step.id] ?? EMPTY;
							const isRunning = running === step.id;
							const isNext = !record.done && STEPS.slice(0, index).every((before) => (records[before.id] ?? EMPTY).done);
							const clock = `${String(Math.floor(record.seconds / 60))}:${String(record.seconds % 60).padStart(2, "0")}`;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: `dsh-lingualab-step${record.done ? " is-done" : ""}${isRunning || isNext ? " is-current" : ""}`,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: `dsh-lingualab-step-check${record.done ? " is-on" : ""}`,
										title: record.done ? t("stepUndone") : t("stepDone"),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											className: "dsh-lingualab-visually-hidden",
											checked: record.done,
											onChange: (event) => persist({
												...records,
												[step.id]: {
													...record,
													done: event.target.checked
												}
											})
										}), record.done ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: index + 1 })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dsh-lingualab-step-main",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dsh-lingualab-step-label",
											children: t(step.labelKey)
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dsh-lingualab-step-mins",
											children: step.inSession ? `${String(step.minutes)} ${t("minutes")} · ${clock}` : t("stepInSession")
										})]
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
					})]
				})]
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
		* The two actions a row owns sit on the active or selected row only: loop it, or keep
		* it with the star. A kept row shows its star all the time, filled, so the list reads
		* as a map of what you have already taken from the episode.
		*/
		/** Whether the reader asked the system for less motion. */
		function reducedMotion() {
			return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		}
		/**
		* Bring one row into the list's middle band by scrolling the list itself.
		*
		* `scrollIntoView` also scrolls every ancestor, which on a page that shares a document
		* with a conversation moves the wrong thing. Scrolling the one container we own does not.
		*/
		function bringIntoView(list, row, smooth) {
			const top = row.offsetTop;
			const bottom = top + row.offsetHeight;
			const margin = list.clientHeight * .28;
			if (top >= list.scrollTop + margin && bottom <= list.scrollTop + list.clientHeight - margin) return;
			list.scrollTo({
				top: Math.max(0, top - list.clientHeight / 2 + row.offsetHeight / 2),
				behavior: smooth && !reducedMotion() ? "smooth" : "auto"
			});
		}
		/** The scrolling list of cues. */
		function SubtitlePanel({ t, cues, loading, activeIndex, selectedIndex, zhMode, notedIndexes, follow, onFollow, onSelect, onPlay, onKeep }) {
			const listRef = (0, react.useRef)(null);
			const activeRef = (0, react.useRef)(null);
			const selectedRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!follow || listRef.current === null || activeRef.current === null) return;
				bringIntoView(listRef.current, activeRef.current, true);
			}, [activeIndex, follow]);
			(0, react.useEffect)(() => {
				if (listRef.current === null || selectedRef.current === null) return;
				bringIntoView(listRef.current, selectedRef.current, false);
			}, [selectedIndex]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: "dsh-lingualab-transcript",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-transcript-head",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-transcript-title",
							children: t("transcript")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-counter",
							children: t("transcriptCount", { count: cues.length })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "dsh-lingualab-switch",
							title: t("followHint"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "dsh-lingualab-visually-hidden",
									checked: follow,
									onChange: (event) => onFollow(event.target.checked)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-switch-track",
									"aria-hidden": true,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-switch-knob" })
								}),
								t("follow")
							]
						})
					]
				}), cues.length === 0 && loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ListSkeleton, { label: `${t("stageLoading")}…` }) : cues.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-empty",
					children: t("noSubtitles")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-list",
					"data-zh": zhMode,
					ref: listRef,
					children: cues.map((cue, index) => {
						const isActive = index === activeIndex;
						const isSelected = index === selectedIndex;
						const kept = notedIndexes.has(index);
						const lines = visibleCueLines(cue.text, zhMode, isActive);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							ref: isActive ? activeRef : isSelected ? selectedRef : null,
							className: `dsh-lingualab-row${isActive ? " is-active" : ""}${isSelected && !isActive ? " is-selected" : ""}`,
							onClick: () => {
								onSelect(index);
								onPlay(index);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-row-time",
									children: formatClock(cue.start)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: lines.map((line, lineIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: line.secondary ? "dsh-lingualab-row-zh" : "dsh-lingualab-row-en",
									children: line.text
								}, lineIndex)) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: `dsh-lingualab-row-actions${kept ? " is-kept" : ""}`,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-icon-btn is-small",
										title: t("loopSentence"),
										onClick: (event) => {
											event.stopPropagation();
											onSelect(index);
											useMediaPlayer.getState().loopSentence(index);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LoopIcon, {})
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `dsh-lingualab-icon-btn is-small is-star${kept ? " is-on" : ""}`,
										title: kept ? t("unkeepHint") : t("keepHint"),
										"aria-pressed": kept,
										onClick: (event) => {
											event.stopPropagation();
											onKeep(index);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StarIcon, { filled: kept })
									})]
								})
							]
						}, `${cue.start}-${index}`);
					})
				})]
			});
		}
		//#endregion
		//#region src/client/pages/lingualab/ui/LingualabPage.tsx
		/**
		* The page: a home to choose from, and a practice view to listen in.
		*
		* Two views, one rule for moving between them. The page opens on the **home**: what you
		* can practise, the episode to continue, and where to drop new files. Opening an episode
		* switches to the **practice** view, whose back button returns to the home rather than
		* leaving the panel, so "pick another episode" is one click and not a layer to open.
		*
		* The practice view keeps the shape the last redesign settled on: a top bar, a stage that
		* pins the sentence being worked on above the transport, the subtitle list as the only
		* scroller, and a short line of reminders. What changed is everything around it — the
		* episode picker became the home, keeping a sentence became a star on the transport, and
		* the notes layer became a drawer of what you kept.
		*
		* Keyboard handling lives here rather than on `window`. The earlier standalone app bound
		* its shortcuts globally and therefore owned the space bar, the arrow keys and the
		* bracket keys wherever it was open; inside a panel that shares a page with a
		* conversation, that is a hostile neighbour. The handler sits on the page container,
		* which is focusable, so the keys work while the panel has focus and stop at its edge.
		*/
		/** How often the listening position is written down while an episode plays. */
		const BOOKMARK_MS = 5e3;
		/** How long a key cap stays lit after the page handles its key. */
		const FLASH_MS = 260;
		/** Whether a keystroke belongs to a field the reader is typing in. */
		function isTypingTarget(target) {
			if (!(target instanceof HTMLElement)) return false;
			const tag = target.tagName.toLowerCase();
			if (target instanceof HTMLInputElement) return ![
				"checkbox",
				"radio",
				"button",
				"submit",
				"range",
				"file"
			].includes(target.type);
			return tag === "select" || tag === "textarea" || target.isContentEditable;
		}
		/** The panel's centre-column page. */
		function LingualabPage({ back, t }) {
			const library = useLibrary();
			const folder = useLibraryConfig();
			const notes = useNotes(library.episode?.id ?? null);
			const folderNames = (0, react.useMemo)(() => (library.payload?.episodes ?? []).map((entry) => entry.id), [library.payload]);
			const importer = useImport(library.reload, folderNames);
			const [view, setView] = (0, react.useState)("home");
			const [zhMode, setZhMode] = (0, react.useState)("dim");
			const [layer, setLayer] = (0, react.useState)("none");
			const [stepsOpen, setStepsOpen] = (0, react.useState)(false);
			const [selection, setSelection] = (0, react.useState)(null);
			const [focused, setFocused] = (0, react.useState)(false);
			const [follow, setFollow] = (0, react.useState)(true);
			const [flashed, setFlashed] = (0, react.useState)(null);
			const [dismissedFinish, setDismissedFinish] = (0, react.useState)(0);
			const flashTimer = (0, react.useRef)(null);
			const [progress, setProgress] = (0, react.useState)(() => readAllProgress());
			const containerRef = (0, react.useRef)(null);
			const activeIndex = useMediaPlayer((state) => state.activeIndex);
			const shadow = useMediaPlayer((state) => state.pauseAfterSentence);
			const revealed = useMediaPlayer((state) => state.revealed);
			const finished = useMediaPlayer((state) => state.finished);
			const finishCount = useMediaPlayer((state) => state.finishCount);
			const cues = library.cues;
			const audioRef = useAudioBinding(library.media?.audioUrl ?? null);
			const reset = useMediaPlayer((state) => state.reset);
			(0, react.useEffect)(() => {
				reset(cues);
			}, [cues, reset]);
			/**
			* Where to start the episode that was just opened, or `null` when it starts at the top.
			*
			* A ref, not state: it is a note to the effect below, set in an event handler and
			* consumed once, and nothing on screen depends on it.
			*/
			const resumeAt = (0, react.useRef)(null);
			const media = library.media;
			const subtitled = media !== null && (media.subtitleEnUrl !== null || media.subtitleZhUrl !== null);
			const cuesReady = cues.length > 0 || media !== null && !subtitled;
			(0, react.useEffect)(() => {
				const target = resumeAt.current;
				const audio = audioRef.current;
				if (target === null || audio === null || !cuesReady) return;
				const apply = () => {
					if (resumeAt.current === null) return;
					const at = resumeAt.current;
					resumeAt.current = null;
					if (Number.isFinite(audio.duration) && at >= audio.duration - 1) return;
					useMediaPlayer.getState().seek(at);
				};
				if (audio.readyState >= 1) {
					apply();
					return;
				}
				audio.addEventListener("loadedmetadata", apply, { once: true });
				return () => audio.removeEventListener("loadedmetadata", apply);
			}, [
				audioRef,
				cues,
				cuesReady,
				media
			]);
			(0, react.useEffect)(() => {
				if (library.loading) return;
				containerRef.current?.focus({ preventScroll: true });
			}, [library.loading, view]);
			const episode = library.episode;
			const episodeId = episode?.id ?? null;
			/**
			* Write the listening position down while an episode is on screen.
			*
			* On an interval and on the way out, not on every `timeupdate`: that event fires
			* several times a second, and a `localStorage` write per tick is wasted work for a
			* bookmark nobody reads until the next visit.
			*/
			const bookmark = (0, react.useCallback)(() => {
				if (episodeId === null) return;
				if (resumeAt.current !== null) return;
				const state = useMediaPlayer.getState();
				writeProgress(episodeId, state.currentTime, state.duration);
			}, [episodeId]);
			(0, react.useEffect)(() => {
				if (view !== "practice") return;
				const timer = setInterval(bookmark, BOOKMARK_MS);
				return () => {
					clearInterval(timer);
					bookmark();
				};
			}, [view, bookmark]);
			(0, react.useEffect)(() => startProgressSync(() => setProgress(readAllProgress())), []);
			/** Go home: save the position first, then refresh what the home shows about it. */
			const goHome = (0, react.useCallback)(() => {
				bookmark();
				useMediaPlayer.getState().setPlaying(false);
				setProgress(readAllProgress());
				setLayer("none");
				setStepsOpen(false);
				setView("home");
			}, [bookmark]);
			/**
			* Cue indexes whose sentence is kept, so the list can mark them.
			*
			* Decided by the same key the toggle uses (whole second plus text), not by asking
			* which cue is playing at a phrase's timestamp: `notes.md` stores whole seconds, and
			* the cue playing at `00:12` can be the one before the one that was kept.
			*/
			const notedIndexes = (0, react.useMemo)(() => {
				const kept = new Set(notes.phrases.map((phrase) => keptSentenceKey(phrase)));
				const marked = /* @__PURE__ */ new Set();
				cues.forEach((cue, index) => {
					if (kept.has(keptSentenceKey({
						at: cue.start,
						text: splitCue(cue).english
					}))) marked.add(index);
				});
				return marked;
			}, [notes.phrases, cues]);
			/**
			* Keep or un-keep one sentence; the same star on the row and on the transport.
			*
			* A sentence the reader has already worked on (a note, a tag, a tick) is not removed by
			* a star, because a star is a reflex and the work behind it is not. The drawer opens
			* on it instead, where removing it takes a confirmation.
			*/
			const keep = (0, react.useCallback)((index) => {
				const target = cues[index ?? activeIndex];
				if (target === void 0) return;
				const { english, chinese } = splitCue(target);
				if (notes.toggle({
					at: target.start,
					text: english,
					zh: chinese,
					note: "",
					tags: [],
					done: false
				}) === "protected") setLayer("notes");
			}, [
				cues,
				activeIndex,
				notes
			]);
			/** Light the key cap for a key the page just handled. */
			const flash = (0, react.useCallback)((id) => {
				setFlashed(id);
				if (flashTimer.current !== null) clearTimeout(flashTimer.current);
				flashTimer.current = setTimeout(() => setFlashed(null), FLASH_MS);
			}, []);
			(0, react.useEffect)(() => () => {
				if (flashTimer.current !== null) clearTimeout(flashTimer.current);
			}, []);
			/** The kept phrase for the sentence on stage, with its place in the stored list. */
			const stagePhrase = (0, react.useMemo)(() => {
				const cue = cues[activeIndex];
				if (cue === void 0) return null;
				const key = {
					at: cue.start,
					text: splitCue(cue).english
				};
				const index = notes.phrases.findIndex((phrase) => sameKeptSentence(phrase, key));
				return index < 0 ? null : {
					index,
					phrase: notes.phrases[index]
				};
			}, [
				cues,
				activeIndex,
				notes.phrases
			]);
			/** Put a clicked word into the note of the sentence on stage, keeping the sentence if it was not. */
			const addWord = (0, react.useCallback)((word) => {
				const cue = cues[activeIndex];
				if (cue === void 0) return;
				const existing = stagePhrase?.phrase;
				if (stagePhrase !== null && existing !== void 0) {
					notes.update(stagePhrase.index, { note: addWordToNote(existing.note, word) });
					return;
				}
				const { english, chinese } = splitCue(cue);
				notes.add({
					at: cue.start,
					text: english,
					zh: chinese,
					note: addWordToNote("", word),
					tags: [],
					done: false
				});
			}, [
				cues,
				activeIndex,
				notes,
				stagePhrase
			]);
			/** The episodes that can be played, in library order; "next" is the one after the open one. */
			const playable = (0, react.useMemo)(() => [...library.payload?.episodes ?? [], ...library.payload?.files ?? []].filter((entry) => entry.audio !== null), [library.payload]);
			const nextEpisode = (0, react.useMemo)(() => {
				const at = playable.findIndex((entry) => entry.id === library.episode?.id);
				return at >= 0 ? playable[at + 1] ?? null : null;
			}, [playable, library.episode]);
			/** Open an episode by id and move to the practice view when the host agrees. */
			const openEpisode = (0, react.useCallback)((id) => {
				(async () => {
					if (!await library.openEpisode(id)) return;
					resumeAt.current = readProgress(id)?.at ?? null;
					setSelection(null);
					setLayer("none");
					setView("practice");
				})();
			}, [library]);
			/**
			* Take dropped files into the library.
			*
			* Opening is left to the report's button: the reader dropped files to add them to a
			* library, which is not the same as asking to start listening to the first one.
			*/
			const importFiles = (0, react.useCallback)((files) => {
				importer.start(files);
			}, [importer]);
			const finishOpen = view === "practice" && finished && finishCount > dismissedFinish && cues.length > 0;
			const onKeyDown = (0, react.useCallback)((event) => {
				if (isTypingTarget(event.target)) return;
				if (event.ctrlKey || event.metaKey || event.altKey) return;
				const store = useMediaPlayer.getState;
				const handled = () => {
					event.preventDefault();
					event.stopPropagation();
				};
				if (event.key === "Escape") {
					if (finishOpen) {
						handled();
						setDismissedFinish(finishCount);
					} else if (layer !== "none") {
						handled();
						setLayer("none");
					} else if (view === "practice") {
						handled();
						if (stepsOpen) setStepsOpen(false);
						else store().clearAB();
					}
					return;
				}
				if (view !== "practice") return;
				if (layer !== "none" && layer !== "notes") return;
				const current = selection ?? store().activeIndex;
				switch (event.key) {
					case " ":
						handled();
						flash("space");
						store().toggle();
						return;
					case "ArrowLeft":
						handled();
						flash("arrows");
						setSelection(null);
						store().stepCue(-1);
						return;
					case "ArrowRight":
						handled();
						flash("arrows");
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
						flash("l");
						if (store().loopMode === "sentence") store().setLoopMode("none");
						else store().loopSentence(current);
						return;
					case "s":
					case "S":
					case "n":
					case "N":
						handled();
						flash("s");
						keep(selection ?? void 0);
						return;
					case "c":
					case "C":
						handled();
						flash("c");
						setZhMode(nextZhMode(zhMode));
						return;
					case "r":
					case "R":
						handled();
						flash("r");
						store().reveal(store().activeIndex);
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
				cues,
				finishCount,
				finishOpen,
				flash,
				keep,
				layer,
				selection,
				stepsOpen,
				view,
				zhMode
			]);
			const hasAudio = library.media !== null;
			const selectedIndex = selection === null ? activeIndex : Math.min(Math.max(0, selection), Math.max(0, cues.length - 1));
			const stageCue = cues[activeIndex];
			const stageLines = stageCue === void 0 ? null : splitCue(stageCue);
			const keptNow = stageCue !== void 0 && stageLines !== null && notes.has({
				at: stageCue.start,
				text: stageLines.english
			});
			const masked = shadow && stageCue !== void 0 && revealed !== activeIndex;
			const practising = notes.phrases.filter((phrase) => !phrase.done).length;
			const drawerOpen = layer === "notes" || stepsOpen;
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
				onDragOver: (event) => {
					if (Array.from(event.dataTransfer.types).includes("Files")) event.preventDefault();
				},
				onDrop: (event) => {
					if (Array.from(event.dataTransfer.types).includes("Files")) event.preventDefault();
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: STYLES }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("audio", {
						ref: audioRef,
						preload: "metadata",
						style: { display: "none" }
					}),
					view === "home" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-top",
						children: [
							back !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-chip",
								onClick: back,
								children: t("back")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-top-title",
								children: t("appTitle")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" })
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LibraryHome, {
						t,
						library: library.payload,
						loading: library.loading,
						importer,
						progress,
						currentId: episodeId,
						current: episode,
						opening: library.opening,
						openError: library.openError,
						onOpen: openEpisode,
						onFiles: importFiles,
						onBrowse: () => setLayer("browse"),
						onFolder: () => setLayer("folder")
					})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-top",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "dsh-lingualab-chip",
									onClick: goHome,
									title: t("backToList"),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BackIcon, { size: 14 }),
										" ",
										t("backToList")
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dsh-lingualab-top-heading",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-top-title",
										title: episode?.title ?? "",
										children: episode?.title ?? t("openEpisode")
									}), cues.length > 0 && stageCue !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-top-sub",
										children: t("cueOf", {
											n: activeIndex + 1,
											total: cues.length
										})
									}) : null]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `dsh-lingualab-chip${layer === "notes" ? " is-on" : ""}`,
									onClick: () => {
										setStepsOpen(false);
										setLayer(layer === "notes" ? "none" : "notes");
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteIcon, { size: 13 }),
										" ",
										t("notesChip"),
										" ",
										notes.phrases.length > 0 ? notes.phrases.length : ""
									]
								}),
								episode !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StepTracker, {
									t,
									episode: episode.id,
									open: stepsOpen,
									onToggle: () => {
										setLayer("none");
										setStepsOpen(!stepsOpen);
									}
								}, episode.id) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-body",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-practice",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stage, {
										t,
										cues,
										activeIndex,
										zhMode,
										masked,
										onReveal: () => useMediaPlayer.getState().reveal(useMediaPlayer.getState().activeIndex),
										onAddWord: addWord,
										hasWord: (word) => noteHasWord(stagePhrase?.phrase?.note ?? "", word),
										loading: library.cuesLoading,
										hasAudio
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-lingualab-deck",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ControlBar, {
											t,
											zhMode,
											onZhMode: setZhMode,
											kept: keptNow,
											onToggleKeep: () => keep(),
											disabled: !hasAudio || cues.length === 0
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(KeyHints, {
											t,
											flash: flashed,
											active: focused
										})]
									}),
									library.error !== null && cues.length === 0 && hasAudio ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-lingualab-error",
										style: { textAlign: "center" },
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
									finishOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FinishCard, {
										t,
										title: episode?.title ?? "",
										sentences: cues.length,
										kept: notes.phrases.length,
										practising,
										nextTitle: nextEpisode?.title ?? null,
										onAgain: () => {
											setDismissedFinish(finishCount);
											useMediaPlayer.getState().seek(0);
											useMediaPlayer.getState().setPlaying(true);
										},
										onNext: () => {
											setDismissedFinish(finishCount);
											if (nextEpisode !== null) openEpisode(nextEpisode.id);
										},
										onHome: () => {
											setDismissedFinish(finishCount);
											goHome();
										},
										onClose: () => setDismissedFinish(finishCount)
									}) : null
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubtitlePanel, {
								t,
								cues,
								loading: library.cuesLoading,
								activeIndex,
								selectedIndex,
								zhMode,
								notedIndexes,
								follow,
								onFollow: setFollow,
								onSelect: setSelection,
								onPlay: (index) => {
									const cue = cues[index];
									if (cue === void 0) return;
									setSelection(null);
									useMediaPlayer.getState().seek(cue.start);
									useMediaPlayer.getState().setPlaying(true);
								},
								onKeep: (index) => keep(index)
							})]
						}),
						drawerOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-scrim",
							onClick: () => {
								setLayer("none");
								setStepsOpen(false);
							}
						}) : null,
						layer === "notes" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NotesPanel, {
							t,
							notes,
							episodeTitle: episode?.title ?? "",
							onClose: () => setLayer("none")
						}) : null
					] }),
					layer === "browse" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EpisodePicker, {
						t,
						onClose: () => setLayer("none"),
						opening: library.opening,
						openError: library.openError,
						onOpenEpisode: (id) => openEpisode(id),
						onOpenFile: (place, rel) => {
							(async () => {
								if (!await library.openFile(place, rel)) return;
								setSelection(null);
								setLayer("none");
								setView("practice");
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
						onClose: () => setLayer("none"),
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
