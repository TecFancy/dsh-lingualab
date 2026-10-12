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
			cancel: "取消",
			save: "保存",
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
			stoppedAtSegment: "听到 {segment} · {time}",
			upNextSegment: "下一段 {segment}",
			episodeSegments: "{title} · {n} / {total} 段",
			notesKept: "收藏",
			filesLiveIn: "文件放在",
			currentGone: "上次打开的一集不在了",
			noWorkspaces: "没有可浏览的工作区",
			dirUnreadable: "这个目录读不了",
			dropRelease: "松手就导入",
			dropAccepts: "音频：mp3 m4a wav ogg opus flac；视频：mp4 webm mkv mov；字幕：srt vtt lrc",
			importing: "正在导入 {done} / {total}",
			importDone: "已导入 {saved} / {total} 个文件",
			importExisted: "有 {count} 个文件原来就在，没有覆盖（{folders}）。要换掉它，先把原文件删了再拖一次",
			importFailed: "没有导入",
			importUnmatched: "这些字幕没有导入，找不到对应的音频，也没有同名的剧集",
			importIgnored: "这些不是音频、视频或字幕，已跳过",
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
			leadIn: "提前起播",
			leadInHint: "跳到一句时从它开头前这么多秒起播，字幕比人声晚的时候第一个音节不会被切掉",
			leadInOff: "关",
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
			keyTiming: "调整这一句的开头和结尾",
			keyGrade: "给这一句评级：记住了、模糊、没记住",
			keyColumn: "右栏切换字幕和收藏",
			cueOf: "第 {n} / {total} 句",
			seekBar: "播放进度",
			noAudioHint: "回到全部剧集，换一集，或者把音频拖进来。",
			noSubtitlesHint: "可以先整段听，字幕拖进来以后重新打开这一集。",
			transcript: "字幕",
			follow: "自动跟随",
			followHint: "开着时，列表跟着播放的句子滚动",
			shadowShort: "跟读",
			shadowHint: "跟读模式：每句播完停住并遮住英文，你先说，再按 R 揭晓",
			reveal: "揭晓",
			copy: "复制",
			copied: "已复制",
			wordAdd: "记进备注",
			wordAdded: "已记下",
			timingOpen: "调整这一句的时间（T）",
			timingTitle: "调整时间",
			timingStart: "开头",
			timingEnd: "结尾",
			timingEndLrc: "结尾随下一行",
			timingEarlier: "提前 50 毫秒",
			timingLater: "推后 50 毫秒",
			timingAtPlayhead: "设为播放位置",
			timingSave: "保存到字幕文件",
			timingCancel: "取消",
			timingClose: "关闭（Esc）",
			timingLooping: "正在循环这一句",
			timingPaused: "已暂停",
			timingDelta: "{delta} 秒",
			timingNudgeKeys: "← → 微调",
			timingReset: "还原",
			timingKeySwitch: "换一端",
			timingKeyShift: "一步 {ms} 毫秒",
			timingOutside: "这一集的字幕不在媒体库里。页面只改媒体库里的文件，所以这里可以试听，不能保存。",
			timingPushedPrevious: "上一句的结尾跟着提前到 {time}，一起保存",
			timingPushedNext: "下一句的开头跟着推后到 {time}，一起保存",
			timingNoSource: "这一句对不上字幕文件里的哪一行，没法保存。",
			timingReload: "重新加载字幕",
			hintPlay: "播放",
			hintSentence: "上下句",
			hintLoop: "循环",
			hintKeep: "收藏",
			hintChinese: "中文",
			hintReveal: "揭晓",
			segmentsChip: "分段 {n} / {total}",
			segmentsTitle: "这一集的分段",
			segmentFinished: "已听完",
			segmentCurrent: "正在听",
			finishTitle: "这一集听完了",
			finishSegmentTitle: "这一段听完了",
			finishNextSegment: "下一段：{title}",
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
			notesFootnote: "按 1、2、3 给舞台上的句子评级。评为「记住了」的句子从「还在练」里退出，不会被删掉。",
			notesEditorPlaceholder: "语境、易错的音、想到的用法……",
			notesNoteLabel: "备注",
			notesAddNote: "写一条备注",
			notesEditorHint: "Ctrl + Enter 保存，Enter 换行",
			notesHasNote: "有备注",
			notesPlay: "播放这一句",
			notesPause: "暂停这一句",
			notesEdit: "点击编辑备注",
			notesDelete: "删掉",
			notesDeleted: "已删掉 {time} 那一句",
			notesUndo: "撤销",
			notesReplay: "回放并循环这一句",
			columnLabel: "右栏显示",
			columnKept: "收藏",
			gradeNew: "新收藏",
			gradeFuzzy: "模糊",
			gradeNotYet: "没记住",
			gradeGot: "记住了",
			wordRemove: "去掉「{word}」",
			wordRemoveHint: "再点一下，从备注里去掉",
			reviewStart: "复习",
			reviewStartHint: "把还在练的句子逐句过一遍：先听，按 R 看英文，再按 1 到 3 评级",
			reviewProgress: "复习 {n} / {total}",
			reviewBack: "上一句",
			reviewSkip: "跳过",
			reviewExit: "结束复习",
			reviewFinishTitle: "这一轮复习完了",
			reviewSkipped: "跳过",
			reviewGone: "有 {count} 句所在的剧集打不开了，已跳过。",
			reviewAgain: "再过一遍没记住的 {count} 句",
			reviewHomeTitle: "复习收藏",
			reviewHomeSub: "还在练 {count} 句，来自 {episodes} 集",
			reviewHomeStart: "开始复习",
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
			stepsFootnote: "勾选和计时按集保存，会同步到其他设备。打开这里不会暂停播放。",
			stepBlind: "无字幕盲看",
			stepRead: "英文字幕精看",
			stepShadow: "跟读模仿",
			stepNextDay: "次日复习",
			stepWeekly: "周日复习",
			stepTipBlind: "只听，不看字",
			stepTipRead: "逐句停，收藏生词",
			stepTipShadow: "开跟读，录一遍对比",
			stepInSession: "会话里做",
			stepSuggested: "建议 {minutes} 分钟",
			stepUsed: "已用 {clock}",
			stepTook: "用了 {clock}",
			stepStart: "开始计时",
			stepResume: "继续计时",
			stepStop: "暂停计时",
			stepDone: "标记完成",
			stepUndone: "取消完成",
			settingsOpen: "设置",
			settingsTitle: "设置",
			settingsSub: "只影响语言实验室，不改 dsh 本身",
			settingsAppearance: "外观",
			settingsScheme: "明暗",
			settingsAppearanceAuto: "跟随 dsh",
			settingsAppearanceLight: "浅色",
			settingsAppearanceDark: "深色",
			settingsTheme: "主题",
			themeDshName: "默认",
			themeDshDesc: "跟随 dsh 的黑白灰",
			themeInkName: "墨蓝",
			themeInkDesc: "冷静的蓝，适合长时间精听",
			themePineName: "松绿",
			themePineDesc: "柔和的绿，看久了不累",
			themePaperName: "纸张",
			themePaperDesc: "暖色纸面，像在读书",
			themeDuskName: "暮紫",
			themeDuskDesc: "低饱和的紫，夜里更柔和",
			themeContrastName: "高对比",
			themeContrastDesc: "更深的文字，更清楚的边框",
			settingsSubtitles: "字幕",
			settingsStageSize: "舞台字号",
			settingsStageSmall: "小",
			settingsStageMedium: "中",
			settingsStageLarge: "大",
			settingsPlayback: "播放",
			settingsLeadInHint: "每句从开头前一点开始放",
			settingsFootnote: "设置存在这台设备上，换一台设备按默认来。",
			videoMark: "视频",
			videoMarkUnprepared: "视频 · 未准备",
			videoMarkSegment: "有视频",
			videoOnlyHint: "只有视频，声音取自视频",
			pictureLabel: "画面：{state}",
			pictureShown: "显示",
			pictureLarge: "大画面",
			pictureHidden: "隐藏",
			pictureHint: "切换画面：显示、大画面、隐藏（V）",
			keyPicture: "切换画面：显示、大画面、隐藏",
			hintPicture: "画面",
			pictureHiddenChip: "画面已隐藏，声音仍来自视频",
			pictureLargeBadge: "大画面 · 字幕已隐藏",
			peekSentence: "看一眼这句",
			cardPrepareTitle: "这一集有视频",
			cardPrepareAudio: "音频是 {codec}，浏览器放不出声音，要先转换一次。",
			cardPrepareContainer: "这个文件浏览器不能直接放，要先转换一次。",
			cardPrepareSize: "另占约 {size}。",
			cardPrepareAction: "准备视频",
			cardPrepareNote: "转换时照常听音频，不打断播放",
			cardPrepareNoteNoAudio: "转好之后才有声音",
			cardPreparingTitle: "正在准备视频",
			cardPreparingSub: "画面原样复制，只转换声音",
			cardPreparingPercent: "{percent}% · {done} / {total}",
			cardPreparingEta: "还剩约 {seconds} 秒",
			cardPreparingBody: "现在放的是音频。转好后自动换成视频，从当前位置接着放。",
			cardPreparingBodyNoAudio: "转好后就能放。",
			cardCancel: "取消",
			cardFfmpegTitle: "需要 ffmpeg",
			cardFfmpegBody: "这个视频要先转换，但 host 上没找到 ffmpeg。装好后重启 dsh 就能准备。",
			cardFfmpegPath: "装在别处的话，在插件配置里填 {field}。",
			cardCopy: "复制",
			cardCopied: "已复制",
			cardFfmpegNote: "声音照常用音频文件",
			cardSoundTitle: "只能听声音",
			cardSoundCodec: "画面编码 {codec} · 这一段没有音频文件",
			cardSoundBody: "浏览器解不了这种画面，重新编码比看完一集还慢。可以只把声音取出来，这一段照样能精听。",
			cardSoundNote: "盲看那一步还是用外部播放器。",
			cardSoundAction: "只准备声音",
			cardSoundReadyBody: "浏览器解不了这个画面，声音已经取出来了，可以照常精听。",
			cardUnplayableTitle: "这个视频放不了",
			cardUnplayableCodec: "画面编码 {codec}，浏览器解不了。",
			cardUnplayableBrowser: "浏览器放不了这个视频。",
			cardUnplayableAudio: "声音照常用音频文件。",
			cardFailedTitle: "没准备成功",
			cardRetry: "重试",
			cardGotIt: "知道了",
			videoLabelUnplayable: "视频放不了 · 详情",
			videoLabelPrepare: "这一集有视频 · 没准备",
			noticeReady: "视频准备好了，从 {time} 接着放",
			noticeMismatch: "视频比音频长 {seconds} 秒，字幕可能对不上",
			noticeMismatchShorter: "视频比音频短 {seconds} 秒，字幕可能对不上",
			noticeBlind: "盲看开始计时，已切到大画面",
			noticeUndo: "撤销"
		};
		/** English copy, same keys, same order. */
		const en = {
			back: "← Back to conversation",
			appTitle: "Language Lab",
			backToList: "All episodes",
			close: "Close",
			cancel: "Cancel",
			save: "Save",
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
			stoppedAtSegment: "Stopped at {segment} · {time}",
			upNextSegment: "Up next: {segment}",
			episodeSegments: "{title} · {n} / {total} parts",
			notesKept: "Kept",
			filesLiveIn: "Files live in",
			currentGone: "The episode you had open is gone",
			noWorkspaces: "No workspace to browse",
			dirUnreadable: "This folder cannot be read",
			dropRelease: "Release to import",
			dropAccepts: "Audio: mp3 m4a wav ogg opus flac. Video: mp4 webm mkv mov. Subtitles: srt vtt lrc",
			importing: "Importing {done} of {total}",
			importDone: "Imported {saved} of {total} files",
			importExisted: "{count} files were already there and were not overwritten ({folders}). To replace one, delete the original and drop it again",
			importFailed: "Not imported",
			importUnmatched: "Not imported: no audio for these subtitles, and no episode of that name",
			importIgnored: "Not audio, video or subtitles, skipped",
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
			leadIn: "Lead-in",
			leadInHint: "Jumping to a sentence starts this much before it, so a subtitle that starts after the voice doesn't clip the first syllable",
			leadInOff: "Off",
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
			keyTiming: "Adjust this sentence's start and end",
			keyGrade: "Grade the sentence: got it, fuzzy, not yet",
			keyColumn: "Switch the right column between subtitles and kept",
			cueOf: "Sentence {n} of {total}",
			seekBar: "Playback position",
			noAudioHint: "Go back to all episodes and pick another, or drop the audio in.",
			noSubtitlesHint: "You can listen straight through; drop the subtitles in, then open this episode again.",
			transcript: "Subtitles",
			follow: "Auto-follow",
			followHint: "When on, the list scrolls with the sentence that is playing",
			shadowShort: "Shadow",
			shadowHint: "Shadowing: each sentence stops after it plays with the English hidden, you say it first, then press R",
			reveal: "Reveal",
			copy: "Copy",
			copied: "Copied",
			wordAdd: "Add to note",
			wordAdded: "Added",
			timingOpen: "Adjust this sentence's timing (T)",
			timingTitle: "Adjust timing",
			timingStart: "Start",
			timingEnd: "End",
			timingEndLrc: "End follows the next line",
			timingEarlier: "50 ms earlier",
			timingLater: "50 ms later",
			timingAtPlayhead: "Set to the playhead",
			timingSave: "Save to the subtitle file",
			timingCancel: "Cancel",
			timingClose: "Close (Esc)",
			timingLooping: "Looping this sentence",
			timingPaused: "Paused",
			timingDelta: "{delta} s",
			timingNudgeKeys: "← → nudge",
			timingReset: "Reset",
			timingKeySwitch: "switch edge",
			timingKeyShift: "step {ms} ms",
			timingOutside: "This episode's subtitles are outside the library. The page only changes files in the library, so you can listen here but not save.",
			timingPushedPrevious: "The previous sentence now ends at {time} too, saved with this one",
			timingPushedNext: "The next sentence now starts at {time} too, saved with this one",
			timingNoSource: "This sentence cannot be matched to a line of the subtitle file, so it cannot be saved.",
			timingReload: "Reload the subtitles",
			hintPlay: "play",
			hintSentence: "sentences",
			hintLoop: "loop",
			hintKeep: "keep",
			hintChinese: "Chinese",
			hintReveal: "reveal",
			segmentsChip: "Part {n} / {total}",
			segmentsTitle: "Parts of this episode",
			segmentFinished: "Finished",
			segmentCurrent: "Playing",
			finishTitle: "Episode finished",
			finishSegmentTitle: "Part finished",
			finishNextSegment: "Next part: {title}",
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
			notesFootnote: "Press 1, 2 or 3 to grade the sentence on stage. One graded \"got it\" leaves the practising list but is never deleted.",
			notesEditorPlaceholder: "Context, tricky sounds, ways to use it...",
			notesNoteLabel: "Note",
			notesAddNote: "Write a note",
			notesEditorHint: "Ctrl + Enter saves, Enter adds a line",
			notesHasNote: "Has a note",
			notesPlay: "Play this sentence",
			notesPause: "Pause this sentence",
			notesEdit: "Click to edit the note",
			notesDelete: "Delete",
			notesDeleted: "Deleted the sentence at {time}",
			notesUndo: "Undo",
			notesReplay: "Replay and loop this sentence",
			columnLabel: "Right column shows",
			columnKept: "Kept",
			gradeNew: "New",
			gradeFuzzy: "Fuzzy",
			gradeNotYet: "Not yet",
			gradeGot: "Got it",
			wordRemove: "Remove \"{word}\"",
			wordRemoveHint: "Click again to take it out of the note",
			reviewStart: "Review",
			reviewStartHint: "Go through the sentences still being practised: listen, press R to see the English, then 1 to 3 to grade",
			reviewProgress: "Review {n} / {total}",
			reviewBack: "Back",
			reviewSkip: "Skip",
			reviewExit: "End review",
			reviewFinishTitle: "Review done",
			reviewSkipped: "skipped",
			reviewGone: "{count} could not be opened any more and were skipped.",
			reviewAgain: "Again over the {count} not yet",
			reviewHomeTitle: "Review kept sentences",
			reviewHomeSub: "{count} still practising, from {episodes} episodes",
			reviewHomeStart: "Start review",
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
			stepsFootnote: "Ticks and timers are saved per episode and sync to your other devices. Opening this does not pause playback.",
			stepBlind: "Blind watch",
			stepRead: "English subtitles",
			stepShadow: "Shadowing",
			stepNextDay: "Next-day review",
			stepWeekly: "Weekly review",
			stepTipBlind: "Just listen, no text",
			stepTipRead: "Stop on each line, keep new words",
			stepTipShadow: "Turn on shadowing, record once to compare",
			stepInSession: "in the conversation",
			stepSuggested: "Suggested {minutes} min",
			stepUsed: "used {clock}",
			stepTook: "took {clock}",
			stepStart: "Start the clock",
			stepResume: "Resume the clock",
			stepStop: "Pause the clock",
			stepDone: "Mark done",
			stepUndone: "Undo done",
			settingsOpen: "Settings",
			settingsTitle: "Settings",
			settingsSub: "Only changes Language Lab, not dsh itself",
			settingsAppearance: "Appearance",
			settingsScheme: "Light or dark",
			settingsAppearanceAuto: "Follow dsh",
			settingsAppearanceLight: "Light",
			settingsAppearanceDark: "Dark",
			settingsTheme: "Theme",
			themeDshName: "Default",
			themeDshDesc: "dsh's own black, white and gray",
			themeInkName: "Ink",
			themeInkDesc: "A calm blue for long listening sessions",
			themePineName: "Pine",
			themePineDesc: "A soft green that stays easy on the eyes",
			themePaperName: "Paper",
			themePaperDesc: "Warm paper, like reading a book",
			themeDuskName: "Dusk",
			themeDuskDesc: "A muted violet, gentler at night",
			themeContrastName: "High contrast",
			themeContrastDesc: "Darker text and clearer borders",
			settingsSubtitles: "Subtitles",
			settingsStageSize: "Stage text size",
			settingsStageSmall: "Small",
			settingsStageMedium: "Medium",
			settingsStageLarge: "Large",
			settingsPlayback: "Playback",
			settingsLeadInHint: "Start each sentence a little before it begins",
			settingsFootnote: "Settings are kept on this device. Another device starts from the defaults.",
			videoMark: "Video",
			videoMarkUnprepared: "Video · not prepared",
			videoMarkSegment: "Has video",
			videoOnlyHint: "Video only, the sound comes from the video",
			pictureLabel: "Picture: {state}",
			pictureShown: "shown",
			pictureLarge: "large",
			pictureHidden: "hidden",
			pictureHint: "Cycle the picture: shown, large, hidden (V)",
			keyPicture: "Cycle the picture: shown, large, hidden",
			hintPicture: "picture",
			pictureHiddenChip: "Picture hidden, the sound still comes from the video",
			pictureLargeBadge: "Large picture · subtitles hidden",
			peekSentence: "Peek at this sentence",
			cardPrepareTitle: "This episode has a video",
			cardPrepareAudio: "Its audio is {codec}, which a browser cannot play, so it has to be converted once.",
			cardPrepareContainer: "A browser cannot play this file as it is, so it has to be converted once.",
			cardPrepareSize: "It takes about {size} more.",
			cardPrepareAction: "Prepare video",
			cardPrepareNote: "The audio keeps playing while it converts",
			cardPrepareNoteNoAudio: "There is no sound until it is done",
			cardPreparingTitle: "Preparing the video",
			cardPreparingSub: "The picture is copied as it is, only the sound is converted",
			cardPreparingPercent: "{percent}% · {done} / {total}",
			cardPreparingEta: "About {seconds} s left",
			cardPreparingBody: "The audio is playing now. When it is done the video takes over, from where you are.",
			cardPreparingBodyNoAudio: "It plays as soon as it is done.",
			cardCancel: "Cancel",
			cardFfmpegTitle: "ffmpeg is needed",
			cardFfmpegBody: "This video has to be converted first, but the host has no ffmpeg. Install it and restart dsh, then it can be prepared.",
			cardFfmpegPath: "If it is installed somewhere else, set {field} in the plugin config.",
			cardCopy: "Copy",
			cardCopied: "Copied",
			cardFfmpegNote: "The sound keeps coming from the audio file",
			cardSoundTitle: "Sound only",
			cardSoundCodec: "Picture codec {codec} · this segment has no audio file",
			cardSoundBody: "A browser cannot decode this picture, and re-encoding it takes longer than the episode lasts. The sound can be taken out on its own, and the segment can still be studied by ear.",
			cardSoundNote: "For the blind watch, keep using an external player.",
			cardSoundAction: "Prepare sound only",
			cardSoundReadyBody: "A browser cannot decode this picture. The sound has been taken out, and the segment can be studied by ear as usual.",
			cardUnplayableTitle: "This video cannot be played",
			cardUnplayableCodec: "Picture codec {codec}, which a browser cannot decode.",
			cardUnplayableBrowser: "The browser cannot play this video.",
			cardUnplayableAudio: "The sound keeps coming from the audio file.",
			cardFailedTitle: "Preparing failed",
			cardRetry: "Retry",
			cardGotIt: "Got it",
			videoLabelUnplayable: "Video cannot play · details",
			videoLabelPrepare: "This episode has a video · not prepared",
			noticeReady: "The video is ready, continuing from {time}",
			noticeMismatch: "The video is {seconds} s longer than the audio, so the subtitles may be out of step",
			noticeMismatchShorter: "The video is {seconds} s shorter than the audio, so the subtitles may be out of step",
			noticeBlind: "The blind watch has started, switched to the large picture",
			noticeUndo: "Undo"
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
		//#region src/client/shared/lib/sha256.ts
		/**
		* SHA-256 of a byte array, as lower-case hex.
		*
		* The page sends the hash of the subtitle bytes it parsed with every timing edit, and the host
		* refuses the edit when the file on disk no longer hashes the same. `crypto.subtle` would do
		* this in one line, but it only exists in a secure context, and dsh web is often opened over
		* plain HTTP from another machine on the LAN, where the editor would then simply not work. A
		* subtitle file is a few hundred kilobytes at most, which this hashes in milliseconds.
		*
		* The algorithm is FIPS 180-4, written out once; the test compares it with Node's.
		*/
		/** The first 32 bits of the fractional parts of the cube roots of the first 64 primes. */
		const K = new Uint32Array([
			1116352408,
			1899447441,
			3049323471,
			3921009573,
			961987163,
			1508970993,
			2453635748,
			2870763221,
			3624381080,
			310598401,
			607225278,
			1426881987,
			1925078388,
			2162078206,
			2614888103,
			3248222580,
			3835390401,
			4022224774,
			264347078,
			604807628,
			770255983,
			1249150122,
			1555081692,
			1996064986,
			2554220882,
			2821834349,
			2952996808,
			3210313671,
			3336571891,
			3584528711,
			113926993,
			338241895,
			666307205,
			773529912,
			1294757372,
			1396182291,
			1695183700,
			1986661051,
			2177026350,
			2456956037,
			2730485921,
			2820302411,
			3259730800,
			3345764771,
			3516065817,
			3600352804,
			4094571909,
			275423344,
			430227734,
			506948616,
			659060556,
			883997877,
			958139571,
			1322822218,
			1537002063,
			1747873779,
			1955562222,
			2024104815,
			2227730452,
			2361852424,
			2428436474,
			2756734187,
			3204031479,
			3329325298
		]);
		/** Rotate a 32-bit word right. */
		function rotr(value, bits) {
			return value >>> bits | value << 32 - bits;
		}
		/**
		* Hash some bytes.
		* @param input - the bytes, as fetched.
		* @returns 64 lower-case hex characters.
		*/
		function sha256Hex(input) {
			const length = input.length;
			const padded = new Uint8Array(length + 9 + 63 >> 6 << 6);
			padded.set(input);
			padded[length] = 128;
			const view = new DataView(padded.buffer);
			const bits = length * 8;
			view.setUint32(padded.length - 8, Math.floor(bits / 4294967296));
			view.setUint32(padded.length - 4, bits >>> 0);
			const hash = new Uint32Array([
				1779033703,
				3144134277,
				1013904242,
				2773480762,
				1359893119,
				2600822924,
				528734635,
				1541459225
			]);
			const words = /* @__PURE__ */ new Uint32Array(64);
			for (let offset = 0; offset < padded.length; offset += 64) {
				for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4);
				for (let index = 16; index < 64; index += 1) {
					const w15 = words[index - 15] ?? 0;
					const w2 = words[index - 2] ?? 0;
					const s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ w15 >>> 3;
					const s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ w2 >>> 10;
					words[index] = (words[index - 16] ?? 0) + s0 + (words[index - 7] ?? 0) + s1 >>> 0;
				}
				let [a, b, c, d, e, f, g, h] = [
					hash[0] ?? 0,
					hash[1] ?? 0,
					hash[2] ?? 0,
					hash[3] ?? 0,
					hash[4] ?? 0,
					hash[5] ?? 0,
					hash[6] ?? 0,
					hash[7] ?? 0
				];
				for (let index = 0; index < 64; index += 1) {
					const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
					const choice = e & f ^ ~e & g;
					const t1 = h + s1 + choice + (K[index] ?? 0) + (words[index] ?? 0) >>> 0;
					const t2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + (a & b ^ a & c ^ b & c) >>> 0;
					h = g;
					g = f;
					f = e;
					e = d + t1 >>> 0;
					d = c;
					c = b;
					b = a;
					a = t1 + t2 >>> 0;
				}
				hash[0] = (hash[0] ?? 0) + a;
				hash[1] = (hash[1] ?? 0) + b;
				hash[2] = (hash[2] ?? 0) + c;
				hash[3] = (hash[3] ?? 0) + d;
				hash[4] = (hash[4] ?? 0) + e;
				hash[5] = (hash[5] ?? 0) + f;
				hash[6] = (hash[6] ?? 0) + g;
				hash[7] = (hash[7] ?? 0) + h;
			}
			return Array.from(hash, (word) => word.toString(16).padStart(8, "0")).join("");
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
		/**
		* `00:01:02,500` and `00:01:02.500` both mean 62 500 milliseconds.
		*
		* Whole milliseconds rather than float seconds, because the host finds the cue again by this
		* number and `62.5 * 1000` style arithmetic is not always the integer the file wrote.
		*/
		function timecodeToMs(value) {
			const [clock = "", millis = "0"] = value.split(/[.,]/);
			return clock.split(":").map(Number).reduce((total, part) => total * 60 + part, 0) * 1e3 + Number(millis);
		}
		/**
		* Number the cues that share one exact range, in the order the file has them.
		*
		* Every timecode the file holds is counted, including a block whose text turns out empty and is
		* dropped, because the host counts the file's timecodes and the two must agree on "the second
		* cue at 00:01:02,500".
		*/
		function occurrenceCounter() {
			const seen = /* @__PURE__ */ new Map();
			return (start, end) => {
				const key = `${String(start)}-${String(end)}`;
				const occurrence = seen.get(key) ?? 0;
				seen.set(key, occurrence + 1);
				return {
					start,
					end,
					occurrence
				};
			};
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
			const originOf = occurrenceCounter();
			for (const block of blocks) {
				const timeMatch = TIME_RANGE.exec(block);
				if (timeMatch === null) continue;
				const origin = originOf(timecodeToMs(timeMatch[1] ?? ""), timecodeToMs(timeMatch[2] ?? ""));
				const lines = block.split("\n").filter((line) => line.trim().length > 0);
				if (lines.length < 2) continue;
				const cleaned = stripStyleTags(lines.filter((line) => TIME_RANGE.exec(line) === null && !/^\d+$/.test(line.trim())).join("\n").trim());
				if (cleaned.length > 0) cues.push({
					start: origin.start / 1e3,
					end: origin.end / 1e3,
					text: cleaned,
					origin
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
		* milliseconds are accepted, disambiguated by digit count (so `.050` is fifty
		* milliseconds, not half a second). Minutes may run past 99 so long-form audio
		* is not silently dropped.
		*/
		function parseLRC(text) {
			const cues = [];
			const originOf = occurrenceCounter();
			for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
				const match = LRC_TIME.exec(line);
				if (match === null) continue;
				const fraction = match[3] ?? "0";
				const ms = Number(match[1]) * 6e4 + Number(match[2]) * 1e3 + Number(fraction) * (fraction.length === 2 ? 10 : 1);
				const origin = originOf(ms, ms);
				const body = stripStyleTags((match[4] ?? "").trim());
				if (body.length > 0) cues.push({
					start: ms / 1e3,
					end: ms / 1e3 + 3,
					text: body,
					origin
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
		*
		* The bytes are hashed as well. A change to a sentence's timing is written back into this
		* file, and the host refuses it when the file is no longer the one hashed here.
		*/
		/**
		* Fetch, decode and parse one subtitle file.
		* @param url - where the bytes are, already encoded.
		* @param name - the file name, which decides the parser; `.lrc` is read as text lines.
		*/
		async function fetchSubtitle(url, name) {
			const response = await fetch(url, { cache: "no-store" });
			if (!response.ok) throw new Error(`${String(response.status)} ${response.statusText}`);
			const buffer = await response.arrayBuffer();
			return {
				cues: parseSubtitle(decodeSubtitleText(buffer), name),
				hash: sha256Hex(new Uint8Array(buffer))
			};
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
				if (addition.length === 0) return cue;
				return {
					...cue,
					text: `${cue.text}\n${addition}`,
					...candidate.origin === void 0 ? {} : { zhOrigin: candidate.origin }
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
		/**
		* What a segment's video amounts to, and how far preparing it has got.
		*
		* `GET` answers for one segment (`episode` and `segment` in the query): whether its video plays as
		* it is, needs preparing, is being prepared, or cannot be played, and the URL to play when it can.
		* Probing the file with `ffprobe` is what decides, so this route is asynchronous and cached per
		* file. Only folder episodes in the library have a video; anything else answers `none`.
		*/
		const VIDEO_PATH = "/lingualab/video";
		/**
		* Starting the one preparing job: `POST` with `episode`, `segment` and a `mode` (`video` or
		* `sound`). One job runs at a time; asking for another while one runs is answered `busy`.
		*/
		const VIDEO_PREPARE_PATH = "/lingualab/video-prepare";
		/** Cancelling the running preparing job, if there is one; its partial file is removed. */
		const VIDEO_CANCEL_PATH = "/lingualab/video-cancel";
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
		/**
		* Video extensions the scan accepts, in the order it prefers them when one stem has several.
		*
		* A video is another source for the same segment, never an episode of its own kind. `mp4` and
		* `webm` can play as they are; `mkv` and `mov` are prepared first (see `host/video.ts`).
		*/
		const VIDEO_EXTENSIONS = [
			"mp4",
			"webm",
			"mkv",
			"mov"
		];
		/** Subtitle extensions the scan accepts. `srt` and `vtt` parse; `lrc` is text-only. */
		const SUBTITLE_EXTENSIONS = [
			"srt",
			"vtt",
			"lrc"
		];
		//#endregion
		//#region src/client/entities/cue/lib/retime.ts
		/**
		* The rules for moving one cue's edges, and the request that writes the move back.
		*
		* The page lets the reader nudge the start and the end of the sentence on stage while it loops,
		* and saves the result into the subtitle file. Everything here is a pure function of the cue
		* list, so the limits can be tested without a player:
		*
		*   · **An edge pushes its neighbour.** Many files cut sentences back to back, so the start of
		*     one is the end of the one before. When speech begins before the cue does, the start has to
		*     go earlier than the previous end; the previous cue's end then moves with it, and the same
		*     for an end pushed past the next cue's start (see {@link pushedNeighbours}). The two never
		*     overlap after a push, and the push stops where the neighbour would get shorter than the
		*     minimum. A file whose cues already overlap keeps the overlap until an edge is pushed into
		*     it, because refusing to touch such a cue would leave exactly the badly timed files without
		*     a fix.
		*   · **A cue is at least {@link MIN_CUE_MS} long.** Shorter, the loop is a click.
		*   · **LRC has starts only.** A line ends where the next begins, so only the start moves, and
		*     it stays clear of both neighbours' starts; the previous line's end follows by itself.
		*
		* Times here are whole milliseconds, the unit the file writes and the host matches on.
		*/
		/** Whether a file name is LRC, whose lines carry a start only. */
		function isLrc(file) {
			return file.toLowerCase().endsWith(".lrc");
		}
		/** A cue's range as the file writes it: its origin when known, its seconds otherwise. */
		function originalRange(cue) {
			return cue.origin === void 0 ? {
				start: Math.round(cue.start * 1e3),
				end: Math.round(cue.end * 1e3)
			} : {
				start: cue.origin.start,
				end: cue.origin.end
			};
		}
		/** The range the editor opens with: the file's start, and the end the page plays (for LRC, the next start). */
		function initialRange(cue) {
			return {
				start: originalRange(cue).start,
				end: Math.round(cue.end * 1e3)
			};
		}
		/**
		* The limits for one cue.
		* @param cues - the cue list on screen, sorted by start.
		* @param index - the cue being edited.
		* @param lrc - whether its file is LRC.
		* @param durationMs - the audio's length, or `null` when not known yet.
		*/
		function retimeLimits(cues, index, lrc, durationMs) {
			const cue = cues[index];
			const previous = cues[index - 1];
			const next = cues[index + 1];
			const ceiling = durationMs !== null && durationMs > 0 ? durationMs : Number.POSITIVE_INFINITY;
			if (cue === void 0) return {
				minStart: 0,
				maxStart: 0,
				minEnd: 0,
				maxEnd: 0,
				endEditable: false
			};
			const own = originalRange(cue);
			if (lrc) {
				const minStart = previous === void 0 ? 0 : originalRange(previous).start + 200;
				const maxStart = (next === void 0 ? ceiling : originalRange(next).start) - 200;
				return {
					minStart: Math.min(minStart, own.start),
					maxStart: Math.max(maxStart, own.start),
					minEnd: 0,
					maxEnd: Number.POSITIVE_INFINITY,
					endEditable: false
				};
			}
			return {
				minStart: previous === void 0 ? 0 : Math.min(originalRange(previous).start + 200, own.start),
				maxStart: Number.POSITIVE_INFINITY,
				minEnd: 0,
				maxEnd: next === void 0 ? Math.max(ceiling, own.end) : Math.max(originalRange(next).end - 200, own.end),
				endEditable: true
			};
		}
		/**
		* The neighbours a range pushes: the previous cue when the start went earlier than both its own
		* old start and the previous end, the next cue when the end went later than both its own old end
		* and the next start. Their other edge stays. LRC pushes nothing, a line's end being the next
		* line's start already.
		* @param cues - the cue list on screen, sorted by start.
		* @param index - the cue being edited.
		* @param range - its range as it stands, within {@link retimeLimits}.
		* @param lrc - whether its file is LRC.
		*/
		function pushedNeighbours(cues, index, range, lrc) {
			const cue = cues[index];
			if (cue === void 0 || lrc) return [];
			const own = originalRange(cue);
			const pushed = [];
			const previous = cues[index - 1];
			if (previous !== void 0) {
				const before = originalRange(previous);
				if (range.start < before.end && range.start < own.start) pushed.push({
					index: index - 1,
					side: "previous",
					before,
					after: {
						start: before.start,
						end: range.start
					}
				});
			}
			const next = cues[index + 1];
			if (next !== void 0) {
				const before = originalRange(next);
				if (range.end > before.start && range.end > own.end) pushed.push({
					index: index + 1,
					side: "next",
					before,
					after: {
						start: range.end,
						end: before.end
					}
				});
			}
			return pushed;
		}
		/** Keep `value` within `[low, high]`; when the two cross, `high` wins. */
		function clamp(value, low, high) {
			return Math.min(Math.max(value, low), high);
		}
		/**
		* Move one edge to a new value, within the limits and the minimum length.
		* @returns the new range; the other edge never moves.
		*/
		function moveEdge(range, edge, value, limits) {
			const target = Math.round(value);
			if (edge === "start") {
				const high = limits.endEditable ? Math.min(limits.maxStart, range.end - 200) : limits.maxStart;
				return {
					start: clamp(target, limits.minStart, high),
					end: range.end
				};
			}
			if (!limits.endEditable) return range;
			return {
				start: range.start,
				end: clamp(target, Math.max(limits.minEnd, range.start + 200), limits.maxEnd)
			};
		}
		/**
		* The request that writes a cue's new range into its file, and into the Chinese file too when the
		* cue's Chinese came from one.
		*
		* The Chinese cue is moved by the same amount rather than to the same range: the two tracks are
		* cut independently, so the Chinese often starts a little apart, and keeping that offset is what
		* keeps the two folded together on the next load.
		*
		* A pushed neighbour ({@link pushedNeighbours}) is written too. Its Chinese moves only as far as
		* clears the sentence's own Chinese, and not at all when the two English cues share one Chinese cue.
		* @param cues - the cue list on screen, sorted by start.
		* @param index - the cue being edited.
		* @param range - its new range.
		* @returns the edits, or `null` when a cue to write does not know where it came from.
		*/
		function timingEdits(cues, index, range, english, chinese) {
			const cue = cues[index];
			if (cue?.origin === void 0 || english === null) return null;
			const origin = cue.origin;
			const pushed = pushedNeighbours(cues, index, range, isLrc(english.file));
			if (pushed.some((neighbour) => cues[neighbour.index]?.origin === void 0)) return null;
			const to = (file, from, start, end) => {
				const lrc = isLrc(file);
				const safeStart = Math.max(0, start);
				return {
					file,
					from,
					to: {
						start: safeStart,
						end: lrc ? safeStart : Math.max(end, safeStart + 200)
					},
					expect: english.file === file ? english.hash : chinese?.hash ?? ""
				};
			};
			const englishEnd = isLrc(english.file) ? range.start : range.end;
			const edits = [to(english.file, origin, range.start, englishEnd)];
			for (const neighbour of pushed) {
				const from = cues[neighbour.index]?.origin;
				if (from !== void 0) edits.push(to(english.file, from, neighbour.after.start, neighbour.after.end));
			}
			if (cue.zhOrigin === void 0 || chinese === null || chinese.file === english.file) return edits;
			const zhOrigin = cue.zhOrigin;
			const shiftStart = range.start - origin.start;
			const shiftEnd = isLrc(english.file) ? shiftStart : range.end - origin.end;
			const zh = to(chinese.file, zhOrigin, zhOrigin.start + shiftStart, zhOrigin.end + shiftEnd);
			edits.push(zh);
			for (const neighbour of pushed) {
				const from = cues[neighbour.index]?.zhOrigin;
				if (from === void 0 || from.start === zhOrigin.start && from.end === zhOrigin.end && from.occurrence === zhOrigin.occurrence) continue;
				if (neighbour.side === "previous" && from.end > zh.to.start) edits.push(to(chinese.file, from, from.start, zh.to.start));
				if (neighbour.side === "next" && from.start < zh.to.end) edits.push(to(chinese.file, from, zh.to.end, from.end));
			}
			return edits;
		}
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
			segment: null,
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
		/** Open a folder episode the library scan already knows, and one of its segments when it has any. */
		async function openEpisodeById(episodeId, segment) {
			return await postOpen(segment === void 0 ? { episodeId } : {
				episodeId,
				segment
			});
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
		/** Everything left to review across the library; a host that does not answer is an empty list with the reason. */
		async function fetchReview() {
			try {
				const payload = await (await fetch(REVIEW_PATH, { headers: { accept: "application/json" } })).json();
				return Array.isArray(payload.episodes) ? payload : {
					ok: false,
					reason: "主机没有回答",
					episodes: [],
					total: 0
				};
			} catch (error) {
				return {
					ok: false,
					reason: String(error),
					episodes: [],
					total: 0
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
		/**
		* Move one sentence's edges in its subtitle file (and in the Chinese file, when it has its own).
		*
		* A host that does not answer comes back as a refusal with the reason, never as a throw.
		*/
		async function saveSubtitleTiming(episode, edits) {
			try {
				const payload = await (await fetch(SUBTITLE_TIMING_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						episode,
						edits
					})
				})).json();
				return typeof payload.ok === "boolean" ? payload : {
					ok: false,
					code: "refused",
					reason: "主机没有回答",
					files: []
				};
			} catch (error) {
				return {
					ok: false,
					code: "refused",
					reason: String(error),
					files: []
				};
			}
		}
		/** A status that says nothing, for a host that did not answer. */
		const NO_VIDEO = (reason) => ({
			ok: false,
			reason,
			state: "none",
			file: null,
			bytes: null,
			url: null,
			via: null,
			videoCodec: null,
			audioCodec: null,
			duration: null,
			mismatch: null,
			estimateBytes: null,
			progress: null,
			installCommand: null
		});
		/** What the host knows about one segment's video; a host that does not answer is "no video", with the reason. */
		async function fetchVideoStatus(episode, segment) {
			const params = new URLSearchParams({ episode });
			if (segment !== null) params.set("segment", segment);
			try {
				const payload = await (await fetch(`${VIDEO_PATH}?${params.toString()}`, { headers: { accept: "application/json" } })).json();
				return typeof payload.state === "string" ? payload : NO_VIDEO("主机没有回答");
			} catch (error) {
				return NO_VIDEO(String(error));
			}
		}
		/** Ask the host to start preparing one segment's video (or only its sound); the answer is the status after the start. */
		async function startVideoPrepare(request) {
			try {
				const payload = await (await fetch(VIDEO_PREPARE_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(request)
				})).json();
				return typeof payload.state === "string" ? payload : NO_VIDEO("主机没有回答");
			} catch (error) {
				return NO_VIDEO(String(error));
			}
		}
		/** Stop the running preparing job. */
		async function cancelVideoPrepare() {
			try {
				const payload = await (await fetch(VIDEO_CANCEL_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: "{}"
				})).json();
				return typeof payload.ok === "boolean" ? payload : {
					ok: false,
					cancelled: false,
					reason: "主机没有回答"
				};
			} catch (error) {
				return {
					ok: false,
					cancelled: false,
					reason: String(error)
				};
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
		/**
		* The segment stem a video file belongs to.
		*
		* A video pairs with its audio file the way a subtitle does: the longest audio stem that
		* {@link sameStem} accepts owns it, so `MDJT S01E01.mkv` belongs to `MDJT S01E01.mp3` and
		* `04_Dunphy家-Luke射击.mkv` to the longer of two sibling stems. A video no audio stem owns is a
		* segment of its own, named by its own stem.
		* @param fileName - the video file name, extension included.
		* @param audioStems - the audio stems in the same folder.
		* @returns the stem of the segment the video belongs to.
		*/
		function videoStemFor(fileName, audioStems) {
			return owningStem(fileName, audioStems) ?? stemOf(fileName);
		}
		//#endregion
		//#region src/client/features/import-media/lib/group.ts
		/**
		* Turning a handful of dropped files into episodes.
		*
		* A reader drags what they have: an audio file and its subtitles, or a whole season's
		* worth of both, and now a video beside them. The page has to decide which files belong together
		* without asking, because the question "which subtitle goes with which audio" is the one thing the
		* drop was supposed to spare them.
		*
		* The rule is the host's pairing rule, kept in step with `src/host/pairing.ts`: a
		* subtitle belongs to the audio file whose stem it starts with, followed by a separator
		* (`lesson.mp3` owns `lesson.srt`, `lesson.en.srt`, `lesson_zh.srt`; it does not own
		* `lesson2.srt`). The longest matching stem wins, so `lesson-2.mp3` takes `lesson-2.srt`
		* even though `lesson.mp3` is also a prefix of it. A video pairs the same way (`lesson.mkv` goes with
		* `lesson.mp3`), and one that no audio file owns is an episode of its own, named after it, which its
		* subtitles can join by the same rule.
		*
		* A subtitle that matches no audio file is not dropped silently: when exactly one episode was dropped
		* it joins that episode (a lone `.srt` beside a lone `.mp3` is
		* obviously a pair even when the names disagree), and otherwise it is reported as
		* unmatched so the page can say so.
		*/
		/** What a dropped file is, by name alone. The host re-checks every file it receives. */
		function kindOf(name) {
			if (name.lastIndexOf(".") < 0) return "other";
			const extension = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
			if (AUDIO_EXTENSIONS.includes(extension)) return "audio";
			if (VIDEO_EXTENSIONS.includes(extension)) return "video";
			if (SUBTITLE_EXTENSIONS.includes(extension)) return "subtitle";
			return "other";
		}
		/**
		* Pair a drop's videos and subtitles with its audio files.
		* @param files - the dropped items.
		* @param nameOf - how to read an item's file name, so the logic needs no `File`.
		*/
		function planDrop(files, nameOf) {
			const audio = files.filter((file) => kindOf(nameOf(file)) === "audio");
			const videos = files.filter((file) => kindOf(nameOf(file)) === "video");
			const subtitles = files.filter((file) => kindOf(nameOf(file)) === "subtitle");
			const ignored = files.filter((file) => kindOf(nameOf(file)) === "other");
			const groups = audio.map((file) => ({
				episode: stemOf(nameOf(file)),
				audio: file,
				videos: [],
				subtitles: []
			}));
			/** The group each stem belongs to: the first audio file of that stem, else the video-only group made for it. */
			const byStem = /* @__PURE__ */ new Map();
			for (const group of groups) if (!byStem.has(group.episode)) byStem.set(group.episode, group);
			const audioStems = groups.map((group) => group.episode);
			for (const video of videos) {
				const stem = videoStemFor(nameOf(video), audioStems);
				let group = byStem.get(stem);
				if (group === void 0) {
					group = {
						episode: stem,
						audio: null,
						videos: [],
						subtitles: []
					};
					groups.push(group);
					byStem.set(stem, group);
				}
				group.videos.push(video);
			}
			const stems = [...byStem.keys()];
			const unmatched = [];
			for (const subtitle of subtitles) {
				const owner = owningStem(nameOf(subtitle), stems);
				let best = owner === null ? null : byStem.get(owner) ?? null;
				if (best === null && groups.length === 1) best = groups[0] ?? null;
				if (best === null) unmatched.push(subtitle);
				else best.subtitles.push(subtitle);
			}
			return {
				groups,
				unmatched,
				ignored
			};
		}
		//#endregion
		//#region src/client/features/import-media/model/useImport.ts
		/**
		* Dropping files on the page, and what the page is told about it.
		*
		* Uploads run one file at a time, audio before its subtitles, and a video last (it is the big one). Parallel uploads would
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
		*   · **Everything follows the first file.** That is the audio, or the video of an episode that is only a
		*     video. If it is refused, the subtitles and the other videos are not sent. They would create a folder
		*     with subtitles and nothing to play, which the home hides and which cannot be opened.
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
			return owningStem(subtitle, folders);
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
					const groups = plan.groups.map((group) => {
						const first = group.audio ?? group.videos[0];
						const rest = group.audio === null ? group.videos.slice(1) : group.videos;
						return {
							episode: group.episode,
							first,
							followers: [...group.subtitles, ...rest]
						};
					});
					const total = groups.reduce((sum, group) => sum + (group.first === void 0 ? 0 : 1) + group.followers.length, 0) + adopted.length;
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
							if (group.first === void 0) continue;
							const firstOk = await send(group.first, group.episode);
							for (const follower of group.followers) {
								if (firstOk) {
									await send(follower, group.episode);
									continue;
								}
								results.push({
									name: follower.name,
									episode: group.episode,
									status: "skipped",
									reason: `没有导入，因为 ${group.first.name} 没有导入成功`
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
		//#region src/client/features/library/lib/segments.ts
		/**
		* The number a segment is shown under: the one in its file name, else its place in the list.
		*
		* Scene files are numbered by whoever cut them (`01_`, `02_`), and the reader sees those
		* numbers in the file manager. Showing the same ones keeps the page and the folder talking
		* about the same scene; a stem with no number falls back to the position, two digits wide.
		*/
		function segmentNumber(segment) {
			return splitSegmentStem(segment.id).number ?? String(segment.index).padStart(2, "0");
		}
		/** `01 · Dunphy家的早晨`: the number and the title, as the top bar and the lists show a segment. */
		function segmentLabel(segment) {
			return `${segmentNumber(segment)} · ${segment.title}`;
		}
		/** The segment with this id, or `null`. */
		function findSegment(segments, id) {
			if (id === null) return null;
			return segments.find((segment) => segment.id === id) ?? null;
		}
		/**
		* The segment to play after this one, or `null` when this is the last (or is not there).
		*
		* The finish card asks this: for a segment that has a next one it offers 「下一段」, and only
		* the last segment says the whole episode is done.
		*/
		function nextSegment(segments, id) {
			const at = segments.findIndex((segment) => segment.id === id);
			return at < 0 ? null : segments[at + 1] ?? null;
		}
		//#endregion
		//#region src/client/features/library/lib/video.ts
		/**
		* The mark for an episode: the video of the folder, or of any of its segments.
		*
		* One segment still to be prepared is enough to say so, because that is the one thing the reader
		* might want to know before opening the episode.
		*/
		function videoMarkOf(entry) {
			const present = (entry.segments.length > 0 ? entry.segments.map((segment) => segment.video) : [entry.video]).filter((video) => video !== null);
			if (present.length === 0) return "none";
			return present.some((video) => video.state === "unprepared") ? "unprepared" : "ready";
		}
		/** Whether an episode has anything to play: an audio file or a video. */
		function hasMedia(entry) {
			return entry.audio !== null || entry.video !== null;
		}
		//#endregion
		//#region src/client/shared/lib/media.ts
		/** The URL for one file of one episode. */
		function mediaUrlFor(episode, file) {
			return `${episode.kind === "file" ? "/lingualab/file-media" : "/lingualab/media"}/${encodeURIComponent(episode.id)}/${encodeURIComponent(file)}`;
		}
		/**
		* Every track of one episode, or `null` when it has neither audio nor video to play.
		*
		* An episode that is only a video has an empty `audioUrl`: its sound is the video's, and the player
		* takes that from the video feature once it is prepared.
		*/
		function mediaOf(episode) {
			if (episode.audio === null && episode.video === null) return null;
			return {
				audioUrl: episode.audio === null ? "" : mediaUrlFor(episode, episode.audio),
				subtitleEnUrl: episode.subtitleEn === null ? null : mediaUrlFor(episode, episode.subtitleEn),
				subtitleZhUrl: episode.subtitleZh === null ? null : mediaUrlFor(episode, episode.subtitleZh)
			};
		}
		/**
		* Every track of one segment of a folder episode.
		*
		* The URLs are the same shape as the episode's own: the media route serves any file in the
		* folder, so a segment needs no route of its own, only its own file names. A segment that is only a
		* video has an empty `audioUrl`, as an episode like that does.
		*/
		function mediaOfSegment(episode, segment) {
			return {
				audioUrl: segment.audio === null ? "" : mediaUrlFor(episode, segment.audio),
				subtitleEnUrl: segment.subtitleEn === null ? null : mediaUrlFor(episode, segment.subtitleEn),
				subtitleZhUrl: segment.subtitleZh === null ? null : mediaUrlFor(episode, segment.subtitleZh)
			};
		}
		//#endregion
		//#region src/client/features/library/lib/subtitleKey.ts
		/**
		* What decides whether an episode's subtitles need parsing again.
		*
		* Opening the episode that is already on screen hands back a fresh entry and a fresh media
		* object with the same values. Parsing again would give the same sentences in a new array,
		* and the page treats a new array as a new episode: it resets the player, which puts the
		* position on the first sentence while the audio, left alone, stays where it was. So the
		* question "is this the same subtitle source" is answered by value, here, and not by the
		* identity of the objects the host returned.
		*
		* The segment is part of the answer. Two segments of one episode share its id and differ in
		* their files, and switching from one to the other has to parse again, while opening the
		* segment that is already on screen must not.
		*/
		function subtitleKey(episode, media, segment = null) {
			return JSON.stringify([
				episode.id,
				segment === null ? null : segment.id,
				media.subtitleEnUrl,
				media.subtitleZhUrl,
				segment === null ? episode.subtitleEn : segment.subtitleEn,
				segment === null ? episode.subtitleZh : segment.subtitleZh
			]);
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
		*
		* An episode cut into segments plays one segment at a time, and a segment is an audio
		* file with its own subtitles. So "what is open" is an episode and a segment, the cues
		* belong to that pair, and switching segment parses again where opening the segment
		* that is already on screen parses nothing. Which segment to open is the caller's
		* decision (the page knows the reader's position); with none named the host opens the first.
		*/
		const NO_TRACKS = {
			english: null,
			chinese: null
		};
		const NOTHING_LOADED$1 = {
			owner: null,
			cues: [],
			tracks: NO_TRACKS
		};
		/** What an episode without segments hands out for its segment list: one list, not a new one per render. */
		const NO_SEGMENTS = [];
		/** Who a list of cues belongs to: the episode, and the segment when it has them. */
		function cuesOwner(episode, segment) {
			return JSON.stringify([episode.id, segment === null ? null : segment.id]);
		}
		/** The media of what is open: the segment's files when there is a segment, the episode's otherwise. */
		function mediaFor(episode, segment) {
			return segment === null ? mediaOf(episode) : mediaOfSegment(episode, segment);
		}
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
			/** The segment the host opened, `null` for an episode without segments. */
			const [segmentId, setSegmentId] = (0, react.useState)(null);
			const [opening, setOpening] = (0, react.useState)(false);
			const [openError, setOpenError] = (0, react.useState)(null);
			const [loaded, setLoaded] = (0, react.useState)(NOTHING_LOADED$1);
			const [cuesLoading, setCuesLoading] = (0, react.useState)(false);
			const [reloadToken, setReloadToken] = (0, react.useState)(0);
			/** Bumped to read the same subtitle files again. */
			const [cuesToken, setCuesToken] = (0, react.useState)(0);
			const segments = episode?.segments ?? NO_SEGMENTS;
			const segment = findSegment(segments, segmentId) ?? segments[0] ?? null;
			const owner = episode === null ? null : cuesOwner(episode, segment);
			/** What the cues in `loaded` were parsed from, so opening the same episode again parses nothing. */
			const parsedKey = (0, react.useRef)(null);
			/** The segment id as the reload below needs it: read inside a state updater, so not state itself. */
			const segmentRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				segmentRef.current = segmentId;
			}, [segmentId]);
			(0, react.useEffect)(() => {
				let cancelled = false;
				(async () => {
					setLoading(true);
					const next = await fetchLibrary();
					if (cancelled) return;
					setPayload(next);
					setError(next.ok ? null : next.reason);
					setEpisode((current) => {
						const listed = current === null ? null : [...next.episodes, ...next.files].find((entry) => entry.id === current.id) ?? null;
						const chosen = listed ?? pickInitial(next);
						const segments = chosen?.segments ?? NO_SEGMENTS;
						const opened = (listed === null ? null : findSegment(segments, segmentRef.current)) ?? segments[0] ?? null;
						setSegmentId(opened === null ? null : opened.id);
						setMedia(chosen === null ? null : mediaFor(chosen, opened));
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
				const key = subtitleKey(episode, media, segment);
				if (parsedKey.current === key) return;
				const track = segment ?? episode;
				let cancelled = false;
				(async () => {
					setCuesLoading(true);
					try {
						const enName = track.subtitleEn ?? "";
						const zhName = track.subtitleZh ?? "";
						const english = enUrl === null ? null : await fetchSubtitle(enUrl, enName);
						const chinese = zhUrl === null || zhUrl === enUrl ? null : await fetchSubtitle(zhUrl, zhName);
						if (cancelled) return;
						parsedKey.current = key;
						setLoaded({
							owner,
							cues: mergeBilingual(english?.cues ?? [], chinese?.cues ?? []),
							tracks: {
								english: english === null ? null : {
									file: enName,
									hash: english.hash
								},
								chinese: chinese === null ? null : {
									file: zhName,
									hash: chinese.hash
								}
							}
						});
						setError(null);
					} catch (cause) {
						if (cancelled) return;
						parsedKey.current = null;
						setLoaded({
							owner,
							cues: [],
							tracks: NO_TRACKS
						});
						setError(String(cause));
					} finally {
						if (!cancelled) setCuesLoading(false);
					}
				})();
				return () => {
					cancelled = true;
				};
			}, [
				episode,
				media,
				segment,
				owner,
				cuesToken
			]);
			/** One place both picks end: the host answers with the entry and its URLs. */
			const applyOpen = (0, react.useCallback)((result) => {
				if (!result.ok || result.episode === null) {
					setOpenError(result.reason ?? "打不开这一集");
					return false;
				}
				setOpenError(null);
				setEpisode(result.episode);
				setSegmentId(result.segment);
				setMedia(result.media ?? mediaFor(result.episode, findSegment(result.episode.segments, result.segment)));
				return true;
			}, []);
			const openEpisode = (0, react.useCallback)(async (episodeId, segment) => {
				setOpening(true);
				const result = await openEpisodeById(episodeId, segment);
				setOpening(false);
				return applyOpen(result);
			}, [applyOpen]);
			const openFile = (0, react.useCallback)(async (place, rel) => {
				setOpening(true);
				const result = await openEpisodeFile(place, rel);
				setOpening(false);
				return applyOpen(result);
			}, [applyOpen]);
			const reload = (0, react.useCallback)(() => {
				parsedKey.current = null;
				setReloadToken((token) => token + 1);
			}, []);
			const refreshListing = (0, react.useCallback)(() => {
				fetchLibrary().then((next) => setPayload(next));
			}, []);
			const reloadCues = (0, react.useCallback)(() => {
				parsedKey.current = null;
				setCuesToken((token) => token + 1);
			}, []);
			const current = episode !== null && loaded.owner === owner;
			return {
				payload,
				loading,
				error,
				episode,
				media,
				segments,
				segment,
				cues: current ? loaded.cues : NO_CUES,
				tracks: current ? loaded.tracks : NO_TRACKS,
				cuesLoading,
				opening,
				openError,
				openEpisode,
				openFile,
				reload,
				refreshListing,
				reloadCues
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
		*
		* **The lead-in.** Subtitles found in the wild often start a beat after the voice,
		* so jumping to a sentence's start clips its first syllable. With a lead-in set,
		* every jump *to a sentence* (stepping, looping it, replaying it, rewinding after
		* shadowing) starts that much earlier. The playhead is then inside the previous
		* sentence, so the store remembers which sentence it is running up to and keeps
		* that one active until the start is reached: otherwise the previous sentence
		* would be the one looped, or the one shadowing pauses after. A seek to a plain
		* time (the scrubber, a bookmark) and the timing strip never get a lead-in.
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
		/** The lead-ins offered, in seconds; `0` is off. */
		const LEAD_IN_CHOICES = [
			0,
			.1,
			.2,
			.3,
			.5
		];
		/** Where the chosen lead-in is remembered, per browser. */
		const LEAD_IN_KEY = "dsh-lingualab:lead-in";
		/** How far before a run-up's start a position still counts as the run-up (a seek lands a little early). */
		const RUN_UP_SLACK_S = .25;
		/** The lead-in this browser chose last, or off when none was (or storage is not there). */
		function readLeadIn() {
			try {
				const stored = Number(globalThis.localStorage.getItem(LEAD_IN_KEY));
				return LEAD_IN_CHOICES.includes(stored) ? stored : 0;
			} catch {
				return 0;
			}
		}
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
			editWindow: null,
			leadIn: readLeadIn(),
			runUp: null,
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
				revealed: -1,
				editWindow: null,
				runUp: null
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
				activeIndex: state.editWindow?.index ?? findActiveCue(state.cues, time),
				guard: {
					target: Math.max(0, time),
					expiresAt: Date.now() + SEEK_GUARD_MS
				},
				finished: false,
				runUp: null
			})),
			seekCue: (index) => {
				const state = get();
				const cue = state.cues[index];
				if (cue === void 0) return;
				const from = Math.max(0, cue.start - state.leadIn);
				state.seek(from);
				if (from < cue.start) set({
					activeIndex: state.editWindow?.index ?? index,
					runUp: {
						index,
						at: cue.start
					}
				});
			},
			seekCueAt: (time) => {
				const state = get();
				const index = findActiveCue(state.cues, time);
				const cue = state.cues[index];
				if (cue !== void 0 && Math.abs(cue.start - time) < .001) state.seekCue(index);
				else state.seek(time);
			},
			setLeadIn: (seconds) => {
				const leadIn = LEAD_IN_CHOICES.includes(seconds) ? seconds : 0;
				set({ leadIn });
				try {
					globalThis.localStorage.setItem(LEAD_IN_KEY, String(leadIn));
				} catch {}
			},
			onTime: (time) => {
				const { guard, cues } = get();
				if (guard !== null) {
					if (Date.now() <= guard.expiresAt) return;
					set({ guard: null });
				}
				const state = get();
				const edit = state.editWindow;
				if (edit !== null) {
					if (state.isPlaying && time >= edit.end - .01) {
						get().seek(edit.start);
						return;
					}
					set({
						currentTime: time,
						activeIndex: edit.index
					});
					return;
				}
				const runUp = state.runUp;
				if (runUp !== null) {
					if (time < runUp.at && time >= runUp.at - state.leadIn - RUN_UP_SLACK_S) {
						set({
							currentTime: time,
							activeIndex: runUp.index
						});
						return;
					}
					set({ runUp: null });
				}
				const heard = state.cues[state.activeIndex];
				if (state.pauseAfterSentence && state.loopMode === "none" && state.isPlaying && heard !== void 0 && time >= heard.end && time < heard.end + SHADOW_WINDOW_S) {
					set({
						isPlaying: false,
						revealed: state.activeIndex
					});
					get().seekCue(state.activeIndex);
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
					if (state.loopMode === "sentence") get().seekCue(state.activeIndex);
					else if (window !== null) get().seek(window.start);
					return;
				}
				if (decision.seekTo !== null) {
					if (state.loopMode === "sentence") get().seekCue(state.activeIndex);
					else get().seek(decision.seekTo);
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
				if (state.cues[target] === void 0) return;
				set({
					activeIndex: target,
					loopMode: "sentence",
					playsDone: 0,
					editWindow: null
				});
				get().seekCue(target);
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
				if (state.cues[next] === void 0) return;
				set({
					activeIndex: next,
					playsDone: 0,
					editWindow: null
				});
				get().seekCue(next);
				if (state.pauseAfterSentence) set({ isPlaying: true });
			},
			setEditWindow: (window) => set((state) => ({
				editWindow: window,
				activeIndex: window?.index ?? state.activeIndex,
				playsDone: 0
			}))
		}));
		/** The speed currently in effect. */
		function currentSpeed(state) {
			return SPEED_PRESETS[state.speedIndex] ?? 1;
		}
		//#endregion
		//#region src/client/features/media-player/lib/useMediaBinding.ts
		/**
		* Binding the store to the one media element that plays.
		*
		* The element is the only thing that actually plays, so it owns the browser events and the store owns
		* the intent; this hook is the wire between them. Every write to the element is derived from store
		* state, which is what makes the panel renderable from the store alone: the page never reads
		* `currentTime` during render.
		*
		* It is a `<video>` element whichever the source is. A `<video>` plays an audio file as well as a
		* video (it simply has nothing to draw), and using one element for both is what lets a segment's sound
		* come from its video, with the same loop, seek and speed, on one timeline: the sources are swapped under
		* the element, never played in two elements that would have to be kept in step.
		*
		* The element is not always there: it lives inside the practice view, so the effects below have to run
		* again when it appears. It is kept in a ref, which the effects read and write to the element, and in state,
		* which is what makes them run again and what the page can depend on. Swapping the source inside one session (the
		* audio file for the video that was just prepared, or the audio again when the video cannot be decoded)
		* keeps the position; a source of another session starts from the top, as it always did.
		*/
		/** `MediaError.code` values that mean the file cannot be decoded, as opposed to a network hiccup. */
		const MEDIA_ERR_DECODE = 3;
		const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
		/**
		* Create the element binding and keep it in step with the store.
		*
		* @param src Media URL to play, or `null` while loading or when there is nothing to play.
		* @param session What the source belongs to (the episode and segment). A new `src` under the same session
		*   is a swap and keeps the position.
		* @param onUndecodable Called with the URL that failed when the browser says it cannot decode it.
		* @returns The binding to attach.
		*/
		function useMediaBinding(src, session, onUndecodable) {
			const node = (0, react.useRef)(null);
			const [element, setElement] = (0, react.useState)(null);
			const attach = (0, react.useCallback)((next) => {
				node.current = next;
				setElement(next);
			}, []);
			const isPlaying = useMediaPlayer((state) => state.isPlaying);
			const speed = useMediaPlayer(currentSpeed);
			const seekRequest = useMediaPlayer((state) => state.seekRequest);
			const seekToken = useMediaPlayer((state) => state.seekToken);
			/** The last seek request this element has been given, so a source change cannot re-apply one. */
			const appliedSeek = (0, react.useRef)(0);
			const loaded = (0, react.useRef)(null);
			const undecodable = (0, react.useRef)(onUndecodable);
			(0, react.useEffect)(() => {
				undecodable.current = onUndecodable;
			}, [onUndecodable]);
			(0, react.useEffect)(() => {
				appliedSeek.current = useMediaPlayer.getState().seekToken;
				useMediaPlayer.getState().setDuration(0);
				const element = node.current;
				if (element === null) return;
				const before = loaded.current;
				const keep = before !== null && before.element === element && before.session === session && before.src !== null && before.src !== src && src !== null ? element.currentTime : 0;
				loaded.current = {
					element,
					src,
					session
				};
				if (src === null) {
					element.removeAttribute("src");
					element.load();
					return;
				}
				element.src = src;
				element.load();
				if (keep <= 0) return;
				const restore = () => {
					element.currentTime = keep;
				};
				element.addEventListener("loadedmetadata", restore, { once: true });
				return () => element.removeEventListener("loadedmetadata", restore);
			}, [
				src,
				session,
				element
			]);
			(0, react.useEffect)(() => {
				const element = node.current;
				if (element === null) return;
				if (!isPlaying) {
					element.pause();
					return;
				}
				element.play().catch(() => useMediaPlayer.getState().setPlaying(false));
			}, [
				isPlaying,
				src,
				element
			]);
			(0, react.useEffect)(() => {
				const element = node.current;
				if (element === null) return;
				element.playbackRate = speed;
				element.preservesPitch = true;
			}, [
				speed,
				src,
				element
			]);
			(0, react.useEffect)(() => {
				const element = node.current;
				if (element === null || seekRequest === null || seekToken === appliedSeek.current) return;
				appliedSeek.current = seekToken;
				element.currentTime = seekRequest;
			}, [
				seekToken,
				seekRequest,
				element
			]);
			(0, react.useEffect)(() => {
				const element = node.current;
				if (element === null) return;
				const store = useMediaPlayer.getState;
				const onTime = () => store().onTime(element.currentTime);
				const onMeta = () => store().setDuration(element.duration);
				const onEnded = () => store().markFinished();
				const onError = () => {
					store().setPlaying(false);
					const code = element.error?.code;
					if (code === MEDIA_ERR_DECODE || code === MEDIA_ERR_SRC_NOT_SUPPORTED) {
						const failed = element.getAttribute("src");
						if (failed !== null) undecodable.current?.(failed);
					}
				};
				const onSeeked = () => store().clearGuard();
				element.addEventListener("timeupdate", onTime);
				element.addEventListener("loadedmetadata", onMeta);
				element.addEventListener("durationchange", onMeta);
				element.addEventListener("seeked", onSeeked);
				element.addEventListener("ended", onEnded);
				element.addEventListener("error", onError);
				return () => {
					element.removeEventListener("timeupdate", onTime);
					element.removeEventListener("loadedmetadata", onMeta);
					element.removeEventListener("durationchange", onMeta);
					element.removeEventListener("seeked", onSeeked);
					element.removeEventListener("ended", onEnded);
					element.removeEventListener("error", onError);
				};
			}, [element]);
			return {
				attach,
				element
			};
		}
		/** Tags the study method uses; anything else is allowed but not offered. */
		const KNOWN_TAGS = ["review", "hard"];
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
		* the same second and must not be mistaken for each other. The segment counts too: two
		* scenes can both open on 「Kids?」 at 00:02, and the star on one must not light the other.
		* @param left - one phrase, or a timestamp, the sentence's text and its segment.
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
		* @param sentence - a phrase, or a cue's start, its English text and the segment it is in.
		* @returns the key.
		*/
		function keptSentenceKey(sentence) {
			return `${sentence.segment ?? ""}\u0000${String(Math.floor(sentence.at))}\u0000${sentence.text.trim()}`;
		}
		/** The grades a reader can give, in the order the keys `1` to `3` give them. */
		const GIVEN_GRADES = [
			"got",
			"fuzzy",
			"notyet"
		];
		/** Read a phrase's grade off its tick and tags. */
		function gradeOf(phrase) {
			if (phrase.done) return "got";
			if (phrase.tags.includes("hard")) return "notyet";
			if (phrase.tags.includes("review")) return "fuzzy";
			return "new";
		}
		/**
		* The phrase with a grade given: the tick and both of the method's tags are cleared, then the
		* grade's own mark is set. Any other tag the reader wrote by hand stays where it was.
		*/
		function withGrade(phrase, grade) {
			const others = phrase.tags.filter((tag) => !KNOWN_TAGS.includes(tag));
			if (grade === "got") return {
				...phrase,
				done: true,
				tags: others
			};
			return {
				...phrase,
				done: false,
				tags: [...others, grade === "fuzzy" ? "review" : "hard"]
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
		* The phrases of an episode cut into segments carry the segment they are from, and the
		* same sentence in two segments is two phrases: matching goes through
		* `sameKeptSentence`, which takes the segment into account.
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
			const flush = (0, react.useCallback)(async () => {
				const job = pending.current;
				pending.current = null;
				if (job === null) return;
				clearTimeout(job.timer);
				const payload = await saveNotes(job.id, job.phrases);
				setReason(payload.reason);
				setStatus(payload.ok ? "saved" : "error");
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
				episode: loaded.id === episodeId ? loaded.id : null,
				phrases: visible,
				status,
				reason,
				full: capacity.full,
				add,
				toggle,
				has,
				update,
				remove,
				restore,
				flush
			};
		}
		//#endregion
		//#region src/client/features/notes/lib/group.ts
		/**
		* Group the notes drawer's rows by the segment they are from.
		*
		* The groups come in the episode's segment order, so the drawer reads the way the episode
		* plays, and a segment with no rows has no group. A phrase from a segment the episode no longer
		* has (the file was renamed) keeps a group of its own after the known ones, in the order its
		* phrases first appear, rather than vanishing from the drawer. A phrase with no segment in an
		* episode that has them belongs to the first one, the same rule the notes file applies.
		* Within a group the rows keep the order they came in.
		*
		* An episode without segments is one group with no heading.
		* @param rows - the rows to show, after the view's filter.
		* @param order - the episode's segment ids in order; empty for an episode without segments.
		*/
		function groupBySegment(rows, order) {
			if (order.length === 0 && rows.every((row) => row.phrase.segment === void 0)) return rows.length === 0 ? [] : [{
				segment: void 0,
				rows
			}];
			const groups = /* @__PURE__ */ new Map();
			for (const row of rows) {
				const segment = row.phrase.segment ?? order[0];
				const group = groups.get(segment);
				if (group === void 0) groups.set(segment, [row]);
				else group.push(row);
			}
			const known = order.filter((id) => groups.has(id));
			const strangers = [...groups.keys()].filter((id) => id !== void 0 && !known.includes(id));
			return [
				...groups.has(void 0) ? [void 0] : [],
				...known,
				...strangers
			].map((segment) => ({
				segment,
				rows: groups.get(segment) ?? []
			}));
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
		*
		* A "word" may be several: a phrase picked across words on the stage is kept as one marker,
		* `[her skirt]`, which the brackets already allow.
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
		* The note with the word taken out again, whatever its case; unchanged when it is not there.
		*
		* Only the `[...]` marker goes, and the one space that joined it to the rest, so the text the
		* reader typed around it reads as it did before the word was added.
		*/
		function removeWordFromNote(note, word) {
			const target = marked(word).toLowerCase();
			const at = note.toLowerCase().indexOf(target);
			if (word.trim().length === 0 || at < 0) return note;
			const before = note.slice(0, at).replace(/ $/, "");
			const after = note.slice(at + target.length).replace(/^ /, "");
			return (before.length > 0 && after.length > 0 && !before.endsWith("\n") && !after.startsWith("\n") ? `${before} ${after}` : `${before}${after}`).replace(/^\n+|\n+$/g, "");
		}
		/**
		* A note pulled apart for display: the [word] markers as a list, and what is left as text.
		* The stored note is never changed by this, only shown differently. A note may run over several
		* lines; the line breaks stay, and only runs of spaces and blank lines are tidied.
		*/
		function splitNote(note) {
			const words = [];
			return {
				words,
				text: note.replace(/\[([^\]]+)\]/g, (_match, word) => {
					words.push(word.trim());
					return " ";
				}).replace(/[^\S\n]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
			};
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
		/** What joins an episode id and a segment id in a position key. */
		const SEGMENT_KEY_SEPARATOR = "::";
		/**
		* The key a segment's position is stored under: `<episode id>::<segment id>`.
		*
		* One function so the page that writes a position and the page that reads it back cannot
		* spell it two ways. The step ticks do not use it: they describe watching a whole episode,
		* so they keep the episode id as their key.
		* @param episode - the folder episode's id.
		* @param segment - the segment's id (its audio stem).
		* @returns the key.
		*/
		function segmentKey$1(episode, segment) {
			return `${episode}${SEGMENT_KEY_SEPARATOR}${segment}`;
		}
		/**
		* One segment's stored position, with the legacy fallback.
		*
		* Before an episode had segments its single position sat under the bare episode id, and that
		* position was recorded against the first audio file, which is now the first segment. So the
		* first segment reads the bare entry until it has written one of its own; every other segment
		* reads only its own key.
		* @param progress - the table of positions.
		* @param episode - the folder episode's id.
		* @param segment - the segment's id.
		* @param segments - every segment id of the episode, in order.
		* @returns the entry, or `undefined` when there is none.
		*/
		function segmentProgress(progress, episode, segment, segments) {
			const own = progress[segmentKey$1(episode, segment)];
			if (own !== void 0) return own;
			return segments[0] === segment ? progress[episode] : void 0;
		}
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
		/**
		* The key one thing's position is stored under: the episode id, or the segment's key.
		* @param episode - the episode id.
		* @param segment - the segment id, or `null` for an episode without segments.
		*/
		function progressKeyOf(episode, segment) {
			return segment === null ? episode : segmentKey$1(episode, segment);
		}
		/** Whether a position is at the end: its length is known and the position is within a second of it. */
		function isFinished$1(entry) {
			if (entry === null || entry === void 0 || entry.duration <= 0) return false;
			return entry.at >= entry.duration - 1;
		}
		/** The stored position of each segment of an episode, in segment order; `undefined` where there is none. */
		function positionsOf(progress, episode) {
			const ids = episode.segments.map((segment) => segment.id);
			return ids.map((id) => segmentProgress(progress, episode.id, id, ids));
		}
		/** The ids of the segments that are finished. */
		function finishedSegments(progress, episode) {
			const positions = positionsOf(progress, episode);
			const finished = /* @__PURE__ */ new Set();
			for (const [index, segment] of episode.segments.entries()) if (isFinished$1(positions[index])) finished.add(segment.id);
			return finished;
		}
		/**
		* The segment listened to most recently: the one whose position was stored last.
		* @returns its id, or `null` when none of the segments has a position yet.
		*/
		function newestSegment(progress, episode) {
			const positions = positionsOf(progress, episode);
			let best = null;
			let bestStamp = -1;
			for (const [index, segment] of episode.segments.entries()) {
				const stamp = positions[index]?.updatedAt;
				if (stamp !== void 0 && stamp > bestStamp) {
					best = segment.id;
					bestStamp = stamp;
				}
			}
			return best;
		}
		/**
		* The segment 「继续练习」 opens.
		*
		* The newest one while it is still in progress. Once it was heard to the end, continuing
		* means the next segment that is not finished, after it first and then from the top; a
		* finished segment opened again only starts over, which is "再听一遍", not "继续". When
		* every segment is finished the newest one is reopened.
		* @returns the id, or `null` for an episode without segments.
		*/
		function continueSegment(progress, episode) {
			const newest = newestSegment(progress, episode);
			if (newest === null) return episode.segments[0]?.id ?? null;
			const finished = finishedSegments(progress, episode);
			if (!finished.has(newest)) return newest;
			const at = episode.segments.findIndex((segment) => segment.id === newest);
			return [...episode.segments.slice(at + 1), ...episode.segments.slice(0, at)].find((segment) => !finished.has(segment.id))?.id ?? newest;
		}
		/**
		* Sum up an episode's stored progress for the home.
		* @param progress - the table of positions.
		* @param episode - the episode, with its segments if it has any.
		*/
		function episodeProgress(progress, episode) {
			if (episode.segments.length === 0) {
				const entry = progress[episode.id] ?? null;
				return {
					entry,
					segment: null,
					next: null,
					finished: 0,
					total: 0,
					fraction: fractionOf(entry)
				};
			}
			const newest = newestSegment(progress, episode);
			const ids = episode.segments.map((segment) => segment.id);
			const entry = newest === null ? null : segmentProgress(progress, episode.id, newest, ids) ?? null;
			const finished = finishedSegments(progress, episode).size;
			const total = episode.segments.length;
			const partial = entry === null || isFinished$1(entry) ? 0 : fractionOf(entry);
			return {
				entry,
				segment: newest,
				next: continueSegment(progress, episode),
				finished,
				total,
				fraction: Math.min(1, (finished + partial) / total)
			};
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
		//#region src/client/features/review/lib/session.ts
		/**
		* A review: a queue of kept sentences, gone through one at a time, each graded or skipped.
		*
		* Everything here is a pure function of the session value, so the page can ask for the next item
		* in the same event that records a grade, and the rules (what is in the queue, in which order,
		* what 「再过一遍」 takes) are tested without a player. Where an item is heard, and how a grade is
		* written to its episode's notes, is the page's: it owns the player and the open episode.
		*
		* Two scopes share the shape. An **episode** review is the open episode's sentences not yet
		* 「记住了」; a **library** review is the same across every episode, from `GET /lingualab/review`.
		* Both are in play order: episode by episode in library order, then segment, then time.
		*/
		/** The open episode's sentences still to review, in play order. */
		function episodeQueue(episode, title, phrases, segmentOrder) {
			return inPlayOrder(phrases.filter((phrase) => !phrase.done), segmentOrder).map((phrase) => ({
				episode,
				title,
				phrase
			}));
		}
		/** Every episode's sentences still to review, in the order the host listed them. */
		function libraryQueue(payload) {
			return payload.episodes.flatMap((entry) => inPlayOrder(entry.phrases, entry.segments).map((phrase) => ({
				episode: entry.episode,
				title: entry.title,
				phrase
			})));
		}
		/** A session over these items, or `null` when there is nothing to review. */
		function startReview(items, scope) {
			if (items.length === 0) return null;
			return {
				scope,
				items,
				at: 0,
				outcomes: items.map(() => null)
			};
		}
		/** The item being reviewed, or `null` once the queue is through. */
		function currentItem(session) {
			return session.items[session.at] ?? null;
		}
		/** Whether every item has been through. */
		function isFinished(session) {
			return session.at >= session.items.length;
		}
		/** Record what happened to the current item and move to the next one. */
		function recordOutcome(session, outcome) {
			if (isFinished(session)) return session;
			const outcomes = session.outcomes.map((item, index) => index === session.at ? outcome : item);
			return {
				...session,
				at: session.at + 1,
				outcomes
			};
		}
		/** Go back one item, keeping what was recorded for it until it is graded again. */
		function stepBack(session) {
			return session.at === 0 ? session : {
				...session,
				at: session.at - 1
			};
		}
		/** Count the outcomes. */
		function tallyReview(session) {
			const count = (outcome) => session.outcomes.filter((item) => item === outcome).length;
			return {
				got: count("got"),
				fuzzy: count("fuzzy"),
				notyet: count("notyet"),
				skipped: count("skipped"),
				gone: count("gone")
			};
		}
		/** Another pass over the items graded 「没记住」, in the same order, or `null` when there are none. */
		function retryNotYet(session) {
			return startReview(session.items.filter((_, index) => session.outcomes[index] === "notyet"), session.scope);
		}
		//#endregion
		//#region src/client/features/review/model/useReviewList.ts
		/**
		* What there is to review across the library, read while the home is on screen.
		*
		* Read again each time the home comes back, because grading in an episode changes it; never
		* read while practising, where the open episode's own notes are the list that matters.
		*/
		/** Read the list whenever `active` turns true. */
		function useReviewList(active) {
			const [payload, setPayload] = (0, react.useState)(null);
			const load = (0, react.useCallback)(() => {
				let cancelled = false;
				(async () => {
					const answer = await fetchReview();
					if (!cancelled) setPayload(answer);
				})();
				return () => {
					cancelled = true;
				};
			}, []);
			(0, react.useEffect)(() => active ? load() : void 0, [active, load]);
			return {
				payload,
				reload: (0, react.useCallback)(() => {
					load();
				}, [load])
			};
		}
		//#endregion
		//#region src/client/features/settings/lib/picture.ts
		/**
		* The picture's three states, and the rules that move it between them.
		*
		* A segment with a playable video can show its picture three ways: **shown** (above the sentence), **large**
		* (the picture takes the stage and the sentence text is hidden: the blind-watch step) and **hidden** (the
		* stage as it is without a video, the sound still coming from the video). The reader cycles them with `V`
		* or the button in the play card, and the choice is kept per device like the other settings.
		*
		* The five steps touch it in one place only. Starting the blind-watch step's timer switches the picture to
		* large, once, and remembers what it was; pausing that timer or marking the step done puts it back; and
		* the reader's own change (a `V`, the button, the 「撤销」 of the notice) always wins, so nothing the
		* steps remembered is applied over a choice made since. Opening the page or the drawer never switches it.
		* These are pure functions over {@link PictureState} so every one of those sentences is a test.
		*/
		/** The three states, in the order `V` cycles through them. */
		const PICTURES = [
			"shown",
			"large",
			"hidden"
		];
		/** What the page default is: the picture above the sentence. */
		const DEFAULT_PICTURE = "shown";
		/** The state `V` moves to: shown, large, hidden, and round again. */
		function nextPicture(picture) {
			return PICTURES[(PICTURES.indexOf(picture) + 1) % PICTURES.length] ?? "shown";
		}
		/** The reader chose a state: it is the state, and nothing from the steps is waiting to be put back. */
		function choose(picture) {
			return {
				picture,
				restore: null
			};
		}
		/**
		* The blind-watch timer started.
		* @returns the new state, and whether the picture was switched (the notice with 「撤销」 is shown only then).
		*   Already large means nothing to switch and nothing to restore.
		*/
		function startBlind(state) {
			if (state.picture === "large") return {
				state,
				switched: false
			};
			return {
				state: {
					picture: "large",
					restore: state.picture
				},
				switched: true
			};
		}
		/**
		* The blind-watch timer stopped, or its step was marked done: the picture goes back to what it was, if the
		* steps are what moved it and the reader has not chosen anything since.
		*/
		function endBlind(state) {
			return state.restore === null ? state : {
				picture: state.restore,
				restore: null
			};
		}
		//#endregion
		//#region src/client/features/settings/lib/themes.ts
		/**
		* The colour themes, as palettes over the host's own tokens.
		*
		* Every colour on the page is read from eleven host tokens with a fallback
		* (`var(--dsw-alias-brand-primary,#0f1115)` and so on; see `styles.ts`). A theme is therefore not
		* a second colour system: it is a value for each of those eleven, set as inline custom properties
		* on the page's root element. Custom properties inherit, so they override the host's values for
		* everything inside the page and for nothing outside it, and the derived `--ll-*` values on the same
		* element resolve against them. The theme 「默认」 in 「跟随 dsh」 mode sets nothing at all, which is
		* exactly the page as it was before themes existed.
		*
		* Each theme has a light and a dark palette. Which one is in effect is the reader's 「明暗」 choice:
		* 「跟随 dsh」 takes whatever the host is showing (see `useHostDark`), the other two force one.
		*
		* The palettes are curated rather than computed: a free colour picker would need contrast checks to
		* stay readable, and eleven hand-tuned values per mode are cheaper than that and easier to review.
		*/
		/** The themes on offer, in the order the settings drawer lists them. */
		const THEME_IDS = [
			"dsh",
			"ink",
			"pine",
			"paper",
			"dusk",
			"contrast"
		];
		/** How the theme's light and dark palettes are chosen. */
		const APPEARANCES = [
			"auto",
			"light",
			"dark"
		];
		/** The host token each palette entry overrides. */
		const TOKEN_OF = {
			bg: "--dsw-alias-bg-base",
			l1: "--dsw-alias-bg-layer-1",
			l2: "--dsw-alias-bg-layer-2",
			label: "--dsw-alias-label-primary",
			sec: "--dsw-alias-label-secondary",
			b1: "--dsw-alias-border-l1",
			b2: "--dsw-alias-border-l2",
			brand: "--dsw-alias-brand-primary",
			success: "--dsw-alias-state-success-primary",
			warn: "--dsw-alias-state-warn-primary",
			error: "--dsw-alias-state-error-primary"
		};
		/** The default theme, which is also what an id this table does not know falls back to. */
		const DSH_THEME = {
			id: "dsh",
			light: {
				bg: "#ffffff",
				l1: "#ffffff",
				l2: "#ffffff",
				label: "#0f1115",
				sec: "#61666b",
				b1: "rgba(0,0,0,0.04)",
				b2: "rgba(0,0,0,0.1)",
				brand: "#0f1115",
				success: "#22c55e",
				warn: "#f59e0b",
				error: "#ec1313"
			},
			dark: {
				bg: "#151517",
				l1: "#232324",
				l2: "#2c2c2e",
				label: "#f9fafb",
				sec: "#cfd3d6",
				b1: "rgba(255,255,255,0.06)",
				b2: "rgba(255,255,255,0.12)",
				brand: "#f9fafb",
				success: "#22c55e",
				warn: "#f59e0b",
				error: "#f25a5a"
			}
		};
		/** Every theme, with the palettes it paints in light and in dark. */
		const THEMES = [
			DSH_THEME,
			{
				id: "ink",
				light: {
					bg: "#f7f8fb",
					l1: "#ffffff",
					l2: "#ffffff",
					label: "#121826",
					sec: "#5a6478",
					b1: "rgba(18,32,74,0.05)",
					b2: "rgba(18,32,74,0.12)",
					brand: "#3651c9",
					success: "#1f9d55",
					warn: "#e6900a",
					error: "#d92d2d"
				},
				dark: {
					bg: "#12151d",
					l1: "#1a1f2a",
					l2: "#222836",
					label: "#eef1f8",
					sec: "#a7b0c2",
					b1: "rgba(160,180,255,0.07)",
					b2: "rgba(160,180,255,0.14)",
					brand: "#8ea2ff",
					success: "#3ccf7e",
					warn: "#f5a524",
					error: "#f26d6d"
				}
			},
			{
				id: "pine",
				light: {
					bg: "#f6f8f6",
					l1: "#ffffff",
					l2: "#ffffff",
					label: "#14201b",
					sec: "#56655e",
					b1: "rgba(20,60,40,0.05)",
					b2: "rgba(20,60,40,0.12)",
					brand: "#23735a",
					success: "#3aa76d",
					warn: "#e39309",
					error: "#d0342c"
				},
				dark: {
					bg: "#111613",
					l1: "#18201c",
					l2: "#1f2924",
					label: "#e9f1ec",
					sec: "#a3b4ab",
					b1: "rgba(160,230,200,0.06)",
					b2: "rgba(160,230,200,0.13)",
					brand: "#6fcfa6",
					success: "#4ad48a",
					warn: "#f2a93b",
					error: "#f07167"
				}
			},
			{
				id: "paper",
				light: {
					bg: "#f6f1e7",
					l1: "#fbf8f1",
					l2: "#fffdf8",
					label: "#2a241d",
					sec: "#6a5f52",
					b1: "rgba(60,40,10,0.06)",
					b2: "rgba(60,40,10,0.14)",
					brand: "#9c4f22",
					success: "#4f9a52",
					warn: "#d98a0b",
					error: "#c43b2b"
				},
				dark: {
					bg: "#1a1714",
					l1: "#23201b",
					l2: "#2b2721",
					label: "#eee5d6",
					sec: "#b8ab97",
					b1: "rgba(255,230,190,0.06)",
					b2: "rgba(255,230,190,0.13)",
					brand: "#e3a86f",
					success: "#7cc47f",
					warn: "#f0b13c",
					error: "#ef7a62"
				}
			},
			{
				id: "dusk",
				light: {
					bg: "#f8f7fb",
					l1: "#ffffff",
					l2: "#ffffff",
					label: "#1a1726",
					sec: "#615c74",
					b1: "rgba(40,20,90,0.05)",
					b2: "rgba(40,20,90,0.12)",
					brand: "#5f4bc4",
					success: "#22a35a",
					warn: "#e8940c",
					error: "#d6334a"
				},
				dark: {
					bg: "#16141d",
					l1: "#1e1b28",
					l2: "#262232",
					label: "#f0eef7",
					sec: "#b3adc7",
					b1: "rgba(200,180,255,0.07)",
					b2: "rgba(200,180,255,0.14)",
					brand: "#b3a5ff",
					success: "#46cf85",
					warn: "#f5a83a",
					error: "#f27088"
				}
			},
			{
				id: "contrast",
				light: {
					bg: "#ffffff",
					l1: "#ffffff",
					l2: "#ffffff",
					label: "#000000",
					sec: "#33373c",
					b1: "rgba(0,0,0,0.18)",
					b2: "rgba(0,0,0,0.45)",
					brand: "#0040d6",
					success: "#00843d",
					warn: "#b86e00",
					error: "#c4000f"
				},
				dark: {
					bg: "#000000",
					l1: "#0d0d0e",
					l2: "#161618",
					label: "#ffffff",
					sec: "#d6d9dd",
					b1: "rgba(255,255,255,0.22)",
					b2: "rgba(255,255,255,0.5)",
					brand: "#7fa7ff",
					success: "#3ee07f",
					warn: "#ffc53d",
					error: "#ff6b6b"
				}
			}
		];
		/** The scheme in effect: the reader's pin, or the host's own day and night. */
		function resolveScheme(appearance, hostDark) {
			if (appearance === "auto") return hostDark ? "dark" : "light";
			return appearance;
		}
		/** One theme's palette for a scheme; an unknown id gets the first theme's. */
		function paletteOf(theme, scheme) {
			const found = THEMES.find((entry) => entry.id === theme) ?? DSH_THEME;
			return scheme === "dark" ? found.dark : found.light;
		}
		/**
		* What to set on the page root for the reader's choices.
		*
		* `null` means set nothing: the default theme with the appearance left to the host is the page
		* exactly as the host styles it, with no override for anything to disagree with.
		*
		* @param hostDark - whether the host is showing its dark theme, which only matters for `auto`.
		*/
		function resolveThemeVars(theme, appearance, hostDark) {
			if (theme === "dsh" && appearance === "auto") return null;
			const scheme = resolveScheme(appearance, hostDark);
			const palette = paletteOf(theme, scheme);
			const vars = {};
			for (const key of Object.keys(TOKEN_OF)) vars[TOKEN_OF[key]] = palette[key];
			return {
				vars,
				scheme
			};
		}
		//#endregion
		//#region src/client/features/settings/model/store.ts
		/**
		* The page's settings: the colour theme, whether it follows the host's day and night, and the size
		* of the sentence on stage.
		*
		* They are preferences of the reader about how the page looks, so they live in this browser and
		* nowhere else: `localStorage` under one JSON key, the same place the lead-in is remembered.
		* Nothing goes to the host, which means no route, no profile write and no merge rule, at the cost
		* of a second device starting from the defaults (the drawer says so).
		*
		* Storage can be missing or throw (a private window, blocked site data), and what is stored can be
		* anything a past version or a hand edit left there. So every read and write is guarded, and a
		* value that is not one of the choices falls back to its default on its own, field by field: one
		* bad field does not throw away the others.
		*/
		/** How big the English and Chinese lines on stage are: small, medium (the page's own size) and large. */
		const STAGE_SIZES = [
			"s",
			"m",
			"l"
		];
		/** Where the settings are remembered, per browser. */
		const SETTINGS_KEY = "dsh-lingualab:settings";
		/** What a browser that has chosen nothing gets: the host's own look, at the page's own size, the picture above the sentence. */
		const DEFAULT_SETTINGS = {
			theme: "dsh",
			appearance: "auto",
			stageSize: "m",
			picture: DEFAULT_PICTURE
		};
		/** The choice among `choices` that equals `value`, or `fallback` when none does. */
		function pick(choices, value, fallback) {
			return choices.find((choice) => choice === value) ?? fallback;
		}
		/** Read stored text back into settings: anything unreadable, or not one of the choices, is the default. */
		function parseSettings(raw) {
			let data = null;
			try {
				data = raw === null ? null : JSON.parse(raw);
			} catch {}
			const record = typeof data === "object" && data !== null ? data : {};
			return {
				theme: pick(THEME_IDS, record.theme, DEFAULT_SETTINGS.theme),
				appearance: pick(APPEARANCES, record.appearance, DEFAULT_SETTINGS.appearance),
				stageSize: pick(STAGE_SIZES, record.stageSize, DEFAULT_SETTINGS.stageSize),
				picture: pick(PICTURES, record.picture, DEFAULT_SETTINGS.picture)
			};
		}
		/** The settings this browser stored, or the defaults when there are none (or storage is not there). */
		function readSettings() {
			try {
				return parseSettings(globalThis.localStorage.getItem(SETTINGS_KEY));
			} catch {
				return DEFAULT_SETTINGS;
			}
		}
		/** Remember the settings; a browser without storage keeps them for this visit only. */
		function writeSettings(settings) {
			try {
				globalThis.localStorage.setItem(SETTINGS_KEY, JSON.stringify({
					theme: settings.theme,
					appearance: settings.appearance,
					stageSize: settings.stageSize,
					picture: settings.picture
				}));
			} catch {}
		}
		const useSettings = create((set, get) => {
			/** Apply a change and remember the result. */
			const change = (patch) => {
				set(patch);
				writeSettings(get());
			};
			/** The picture state as the pure rules see it. */
			const pictureOf = () => ({
				picture: get().picture,
				restore: get().pictureRestore
			});
			/** Apply a picture state: the picture is remembered, the restore is not. */
			const applyPicture = (state) => {
				set({
					picture: state.picture,
					pictureRestore: state.restore
				});
				writeSettings(get());
			};
			return {
				...readSettings(),
				pictureRestore: null,
				setTheme: (theme) => change({ theme: pick(THEME_IDS, theme, get().theme) }),
				setAppearance: (appearance) => change({ appearance: pick(APPEARANCES, appearance, get().appearance) }),
				setStageSize: (size) => change({ stageSize: pick(STAGE_SIZES, size, get().stageSize) }),
				setPicture: (picture) => applyPicture(choose(pick(PICTURES, picture, get().picture))),
				cyclePicture: () => applyPicture(choose(nextPicture(get().picture))),
				blindStarted: () => {
					const started = startBlind(pictureOf());
					if (started.switched) applyPicture(started.state);
					return started.switched;
				},
				blindEnded: () => {
					const before = pictureOf();
					const after = endBlind(before);
					if (after !== before) applyPicture(after);
				}
			};
		});
		//#endregion
		//#region src/client/features/settings/model/useHostDark.ts
		/**
		* Whether the host is showing its dark theme.
		*
		* dsh switches between day and night by putting the attribute `data-ds-dark-theme` on `<body>` (and
		* taking it off again), so that attribute's presence is the whole answer. It is read through
		* `useSyncExternalStore` with a `MutationObserver` on that one attribute, so a switch in the host
		* reaches the page without a reload, and the observer goes away with the last component that uses it.
		* Where there is no document (a test, a render on the server) the answer is light.
		*/
		/** The attribute the host sets on `<body>` while it is dark. */
		const DARK_ATTRIBUTE = "data-ds-dark-theme";
		/** Whether the attribute is on the body right now. */
		function readHostDark() {
			return typeof document !== "undefined" && document.body !== null && document.body.hasAttribute(DARK_ATTRIBUTE);
		}
		/** Tell React when the attribute changes. */
		function subscribe(onChange) {
			if (typeof document === "undefined" || document.body === null || typeof MutationObserver === "undefined") return () => void 0;
			const observer = new MutationObserver(onChange);
			observer.observe(document.body, {
				attributes: true,
				attributeFilter: [DARK_ATTRIBUTE]
			});
			return () => observer.disconnect();
		}
		/** True while the host is dark, kept current. */
		function useHostDark() {
			return (0, react.useSyncExternalStore)(subscribe, readHostDark, () => false);
		}
		//#endregion
		//#region src/client/features/video/lib/source.ts
		/**
		* Choose what to play.
		* @param audioUrl - the segment's audio file URL; empty or `null` for a segment that has none.
		* @param status - what the host said about the segment's video, or `null` while unknown.
		* @param failedUrl - a URL the browser said it cannot decode, or `null`.
		*/
		function playSource(audioUrl, status, failedUrl) {
			const audio = audioUrl === null || audioUrl.length === 0 ? null : audioUrl;
			if (status !== null && status.url !== null && status.url !== failedUrl) {
				if (status.state === "playable") return {
					url: status.url,
					picture: true
				};
				if (status.state === "sound-ready" && audio === null) return {
					url: status.url,
					picture: false
				};
			}
			return {
				url: audio,
				picture: false
			};
		}
		/**
		* Which card, if any, the segment's video needs.
		* @param status - what the host said, or `null` while unknown (no card).
		* @param failedUrl - the URL the browser could not decode, which makes an otherwise playable video unplayable.
		* @returns the card kind, or `null` when the picture plays or there is no video.
		*/
		function cardOf(status, failedUrl) {
			if (status === null) return null;
			if (status.state === "playable") return status.url !== null && status.url === failedUrl ? "unplayable" : null;
			switch (status.state) {
				case "prepare": return "prepare";
				case "preparing": return "preparing";
				case "no-ffmpeg": return "no-ffmpeg";
				case "sound-only": return "sound-only";
				case "sound-ready": return "sound-ready";
				case "failed": return "failed";
				case "unplayable": return "unplayable";
				default: return null;
			}
		}
		/** Whether a card only informs: shown in full once per page session, then as a small label. */
		function isInformational(kind) {
			return kind === "unplayable" || kind === "sound-only" || kind === "sound-ready";
		}
		/**
		* The segment a status is about, as one string, for the "have I shown this card already" memory.
		* @returns the key, or `null` when there is no episode.
		*/
		function segmentKey(episodeId, segmentId) {
			return episodeId === null ? null : JSON.stringify([episodeId, segmentId]);
		}
		/**
		* How long until a job is done, from how long it has run and how far it has got.
		* @param elapsedSeconds - wall time since the job was first seen running.
		* @param fraction - 0 to 1.
		* @returns whole seconds, or `null` when it is too early to say.
		*/
		function etaSeconds(elapsedSeconds, fraction) {
			if (!(fraction > .02) || !(elapsedSeconds > .5) || fraction >= 1) return null;
			return Math.max(1, Math.round(elapsedSeconds / fraction * (1 - fraction)));
		}
		//#endregion
		//#region src/client/features/video/model/useVideo.ts
		/**
		* The open segment's video: what the host says about it, the job that prepares it, and the memory of
		* what the stage has already told the reader.
		*
		* The host decides everything about a file (is it playable, what would preparing do, is `ffmpeg` there);
		* this hook only asks, polls while a job runs (once a second, which is as often as a progress bar needs),
		* and tells the page when a job has just finished, so the page can swap the media element over to the
		* prepared video at the same position.
		*
		* State belongs to a segment: a status fetched for one segment is never handed out for another, the same
		* guard the cues have, so switching segments cannot show the previous one's card for a moment.
		*/
		/** How often a running job is asked about. */
		const POLL_MS = 1e3;
		/**
		* Follow one segment's video.
		* @param episodeId - the open episode, or `null`.
		* @param segmentId - the open segment, or `null` for an episode without segments.
		* @param hasVideo - whether the scan found a video for this segment; without one nothing is asked.
		* @param onReady - called once when a job that was running has produced something to play.
		*/
		function useVideo(episodeId, segmentId, hasVideo, onReady) {
			const key = hasVideo ? segmentKey(episodeId, segmentId) : null;
			const [fetched, setFetched] = (0, react.useState)(null);
			const [failed, setFailed] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [eta, setEta] = (0, react.useState)(null);
			const ready = (0, react.useRef)(onReady);
			(0, react.useEffect)(() => {
				ready.current = onReady;
			}, [onReady]);
			/** When the job was first seen running, for the guess at how long is left. */
			const runningSince = (0, react.useRef)(null);
			/** The state seen last, to tell "a job just finished" from "this segment was already prepared". */
			const lastState = (0, react.useRef)({
				key: null,
				state: null
			});
			/** Take a status in, if it is still about the open segment. */
			const accept = (0, react.useCallback)((forKey, payload) => {
				setFetched({
					key: forKey,
					value: payload
				});
				const last = lastState.current;
				const wasRunning = last.key === forKey && last.state === "preparing";
				lastState.current = {
					key: forKey,
					state: payload.state
				};
				if (payload.state === "preparing") {
					runningSince.current ??= Date.now();
					const fraction = payload.progress?.fraction ?? 0;
					setEta(etaSeconds((Date.now() - runningSince.current) / 1e3, fraction));
					return;
				}
				runningSince.current = null;
				setEta(null);
				if (wasRunning && (payload.state === "playable" || payload.state === "sound-ready")) ready.current?.(payload);
			}, []);
			(0, react.useEffect)(() => {
				if (key === null || episodeId === null) return;
				let cancelled = false;
				(async () => {
					const payload = await fetchVideoStatus(episodeId, segmentId);
					if (!cancelled) accept(key, payload);
				})();
				return () => {
					cancelled = true;
				};
			}, [
				key,
				episodeId,
				segmentId,
				accept
			]);
			const status = fetched !== null && fetched.key === key ? fetched.value : null;
			const running = status?.state === "preparing";
			(0, react.useEffect)(() => {
				if (!running || key === null || episodeId === null) return;
				const timer = setInterval(() => {
					fetchVideoStatus(episodeId, segmentId).then((payload) => accept(key, payload));
				}, POLL_MS);
				return () => clearInterval(timer);
			}, [
				running,
				key,
				episodeId,
				segmentId,
				accept
			]);
			const prepare = (0, react.useCallback)((mode) => {
				if (key === null || episodeId === null) return;
				setBusy(true);
				runningSince.current = null;
				startVideoPrepare(segmentId === null ? {
					episode: episodeId,
					mode
				} : {
					episode: episodeId,
					segment: segmentId,
					mode
				}).then((payload) => accept(key, payload)).finally(() => setBusy(false));
			}, [
				key,
				episodeId,
				segmentId,
				accept
			]);
			const cancel = (0, react.useCallback)(() => {
				if (key === null || episodeId === null) return;
				setBusy(true);
				cancelVideoPrepare().then(() => fetchVideoStatus(episodeId, segmentId)).then((payload) => accept(key, payload)).finally(() => setBusy(false));
			}, [
				key,
				episodeId,
				segmentId,
				accept
			]);
			const markUndecodable = (0, react.useCallback)((url) => {
				if (key !== null) setFailed({
					key,
					value: url
				});
			}, [key]);
			return {
				status,
				failedUrl: failed !== null && failed.key === key ? failed.value : null,
				markUndecodable,
				prepare,
				cancel,
				busy,
				eta: running ? eta : null
			};
		}
		/** The segments whose informational card has been shown in full during this page session. */
		const shownCards = /* @__PURE__ */ new Set();
		/**
		* The card that says once, and then leaves a label.
		*
		* Open the first time `key` is seen in this page session (module memory, never stored), closed after,
		* and reopened by the label. `key` is `null` while there is nothing to say.
		* @param key - the segment (with the thing to say), or `null`.
		*/
		function useFirstTimeCard(key) {
			const [card, setCard] = (0, react.useState)({
				key: null,
				open: false
			});
			if (card.key !== key) setCard({
				key,
				open: key !== null && !shownCards.has(key)
			});
			(0, react.useEffect)(() => {
				if (card.open && card.key !== null) shownCards.add(card.key);
			}, [card]);
			const show = (0, react.useCallback)(() => setCard((current) => ({
				...current,
				open: true
			})), []);
			const hide = (0, react.useCallback)(() => setCard((current) => ({
				...current,
				open: false
			})), []);
			return {
				open: card.key === key && card.open,
				show,
				hide
			};
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
		/** `00:18.250` — the clock to the millisecond, for a sentence edge being moved. */
		function formatClockMs(ms) {
			const whole = Number.isFinite(ms) && ms > 0 ? Math.round(ms) : 0;
			return `${formatClock(Math.floor(whole / 1e3))}.${String(whole % 1e3).padStart(3, "0")}`;
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
		//#region src/client/shared/lib/grades.ts
		/**
		* How a grade is named and keyed on screen, the same on a kept sentence's card and on the review
		* strip. What a grade *is* lives with the notes format (`gradeOf`, `withGrade`).
		*/
		/** The dictionary key of each grade's name. */
		const GRADE_LABELS = {
			new: "gradeNew",
			fuzzy: "gradeFuzzy",
			notyet: "gradeNotYet",
			got: "gradeGot"
		};
		/** The key that gives a grade: `1` 「记住了」, `2` 「模糊」, `3` 「没记住」. */
		function gradeKey(grade) {
			return String(GIVEN_GRADES.indexOf(grade) + 1);
		}
		/** The grade a key gives, or `null` for any other key. */
		function gradeForKey(key) {
			return GIVEN_GRADES[Number(key) - 1] ?? null;
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
		* secondary`, and the four states, the warning one spelled `state-warn-primary`). An
		* earlier version also read `label-tertiary`, `bg-layer-3`, `bg-mask-1` and
		* `interactive-bg-hover`, none of which exist, and got by on their fallbacks, which are
		* tuned for one theme. The five derived values below are the replacements, built from
		* declared tokens with `color-mix`, so light and dark both follow the theme instead of
		* the fallback.
		*
		* **The fallbacks are dsh's light theme** (a near-black brand, `#61666b` for the secondary
		* label, hairline black borders, `#22c55e` / `#f59e0b` / `#ec1313` for the states), so a page
		* rendered without the host still looks like dsh. The look is monochrome: the brand is near
		* black in the light theme and near white in the dark one, and the state colours appear only
		* as small dots (a grade) or on a danger hover.
		*/
		const STYLES = `
.dsh-lingualab-page{
  --ll-muted:color-mix(in srgb,var(--dsw-alias-label-secondary,#61666b) 80%,transparent);
  --ll-hover:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 8%,transparent);
  --ll-track:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 14%,transparent);
  --ll-wash:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 4%,transparent);
  --ll-mask:color-mix(in srgb,var(--dsw-alias-bg-base,#000) 55%,rgba(0,0,0,0.35));
  --ll-on-brand:var(--dsw-alias-bg-base,#fff);
  /* One timing for every hover, press, focus and on/off fade, so the page feels like a single
     surface: quick enough to never lag a click, slow enough to read as a fade and not a flicker.
     Change it here, not in a rule. Slower things (the masked sentence's blur, the entrance
     keyframes) keep their own timings on purpose. */
  --ll-fast:.12s;
  --ll-ease:ease;
  --ll-fade:var(--ll-fast) var(--ll-ease);
  /* Panels that float (drawers, cards, popovers). Not the host's bg-overlay: that token is
     its scrim colour, a mid gray in dark, and a panel painted with it reads as washed out. */
  --ll-surface:var(--dsw-alias-bg-layer-1,#ffffff);
  /* How much the sentence on stage is scaled by: the settings drawer's stage size (see below). */
  --ll-stage-scale:1;
  position:relative;display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;
  background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-label-primary,inherit);
  font-size:14px;line-height:1.5;outline:none;
  /* A theme switch fades instead of flashing; the reduced-motion rule below zeroes it with the rest. */
  transition:background-color .2s ease,color .2s ease}
/* The stage size from the settings drawer. Only the two stage lines scale, so the rest of the page
   keeps the size the host's type scale gives it. */
.dsh-lingualab-page[data-ll-stage-size="s"]{--ll-stage-scale:.85}
.dsh-lingualab-page[data-ll-stage-size="l"]{--ll-stage-scale:1.2}
.dsh-lingualab-page button{font-family:inherit}
.dsh-lingualab-page button:focus-visible,.dsh-lingualab-page select:focus-visible,
.dsh-lingualab-page input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:1px}

/* ── top bar ─────────────────────────────────────────────────── */
.dsh-lingualab-top{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-top-title{min-width:0;max-width:420px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-weight:600;padding:0 4px}
.dsh-lingualab-spacer{flex:1;min-width:8px}
.dsh-lingualab-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));background:none;cursor:pointer;
  color:var(--dsw-alias-label-secondary,#61666b);font:inherit;font-size:12px;white-space:nowrap;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-chip kbd{font:inherit;font-size:11px;opacity:.6}
.dsh-lingualab-chip:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-chip.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-chip:disabled{opacity:0.45;cursor:default}
/* The segment button and its list: a popover under the top bar, a listbox the keyboard walks. */
.dsh-lingualab-seg-holder{position:relative;display:inline-flex}
.dsh-lingualab-chevron{display:inline-flex;transform:rotate(90deg);transition:transform var(--ll-fade)}
.dsh-lingualab-chevron.is-open{transform:rotate(-90deg)}
.dsh-lingualab-seglist{position:absolute;left:0;top:calc(100% + 6px);z-index:25;display:flex;flex-direction:column;gap:2px;
  box-sizing:border-box;width:min(320px,80vw);max-height:min(380px,60vh);overflow:auto;padding:6px;outline:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:12px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3)}
.dsh-lingualab-seglist:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:1px}
.dsh-lingualab-segopt{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;
  font-size:13px;line-height:1.4;transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-segopt.is-active{background:var(--ll-hover)}
.dsh-lingualab-segopt.is-current{color:var(--dsw-alias-brand-primary,#0f1115);font-weight:600}
.dsh-lingualab-segopt-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-segopt-now{flex:none;font-size:11px;font-weight:500;opacity:.85}
.dsh-lingualab-segopt-done{flex:none;display:inline-flex;color:var(--dsw-alias-state-success-primary,#22c55e)}
/* A section heading inside the 「收藏」 column: the segment the cards under it are from. */
.dsh-lingualab-notes-group{flex:none;margin:6px 0 -4px;font-size:12px;font-weight:600;letter-spacing:.02em;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-notes-group:first-child{margin-top:0}
.dsh-lingualab-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  padding:0;border:0;border-radius:8px;background:none;color:var(--dsw-alias-label-secondary,#61666b);cursor:pointer;
  transition:background var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-icon-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-icon-btn:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-icon-btn.is-star.is-on{color:var(--dsw-alias-state-warn-primary,#f59e0b)}
.dsh-lingualab-icon-btn.is-on{color:var(--dsw-alias-brand-primary,#0f1115)}

/* ── home ────────────────────────────────────────────────────── */
.dsh-lingualab-home{flex:1;min-height:0;display:flex;flex-direction:column}
.dsh-lingualab-drop{position:relative;flex:1;min-height:0;overflow:auto}
.dsh-lingualab-home-inner{display:flex;flex-direction:column;gap:22px;width:min(900px,100%);
  margin:0 auto;padding:28px 24px 32px;box-sizing:border-box}
.dsh-lingualab-welcome{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;
  padding:40px 24px;border:1.5px dashed var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:16px;
  background:var(--dsw-alias-bg-layer-1,transparent);transition:border-color var(--ll-fade)}
.dsh-lingualab-welcome h1{margin:0;font-size:20px;font-weight:600}
.dsh-lingualab-welcome p{margin:0;max-width:460px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-welcome-icon{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;
  border-radius:999px;background:var(--ll-hover);color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-drop.is-over .dsh-lingualab-welcome{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-drop-veil{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;
  background:var(--ll-mask);pointer-events:none}
.dsh-lingualab-drop-veil-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:28px 40px;
  border:2px dashed var(--dsw-alias-brand-primary,#0f1115);border-radius:16px;
  background:var(--ll-surface);font-size:16px}
.dsh-lingualab-drop-veil-card span{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}

.dsh-lingualab-resume{display:flex;flex-direction:column;gap:12px;padding:26px 28px;border-radius:20px;
  border:0.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 35%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 9%,var(--dsw-alias-bg-base,transparent))}
.dsh-lingualab-resume-label{font-size:12px;color:var(--dsw-alias-brand-primary,#0f1115);font-weight:600;letter-spacing:.02em}
.dsh-lingualab-resume-title{margin:0;font-size:28px;line-height:1.25;font-weight:700;letter-spacing:-.01em;word-break:break-word}
.dsh-lingualab-resume-meta{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-section{display:flex;flex-direction:column;gap:8px}
/* The home's weekly pass: how much is left to review across the library, and its button. */
.dsh-lingualab-reviewcard{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:14px;
  background:var(--dsw-alias-bg-layer-1,transparent);border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-reviewcard-icon{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;
  flex:none;border-radius:10px;color:var(--dsw-alias-state-warn-primary,#f59e0b);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 13%,transparent)}
.dsh-lingualab-reviewcard-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.dsh-lingualab-reviewcard-text span{font-size:12.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-section-head{display:flex;align-items:center;gap:8px}
.dsh-lingualab-section-head h2{margin:0;font-size:14px;font-weight:600}
.dsh-lingualab-episodes{display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-episodes.is-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.dsh-lingualab-episode-card{display:flex;flex-direction:column;align-items:stretch;gap:8px;padding:16px;border-radius:16px;
  text-align:left;color:inherit;font:inherit;cursor:pointer;background:var(--dsw-alias-bg-layer-1,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:transform var(--ll-fade),border-color var(--ll-fade),box-shadow var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-episode-card:hover:not(:disabled){transform:translateY(-2px);
  border-color:var(--dsw-alias-brand-primary,#0f1115);box-shadow:0 10px 26px rgba(0,0,0,0.14)}
.dsh-lingualab-episode-card:active:not(:disabled){transform:none}
.dsh-lingualab-episode-card:disabled{opacity:0.6;cursor:default}
.dsh-lingualab-episode-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-lingualab-episode-icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  border-radius:10px;color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent)}
.dsh-lingualab-episode-title{font-size:16px;font-weight:600;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.dsh-lingualab-dropstrip{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;
  border:1.5px dashed var(--dsw-alias-border-l2,rgba(0,0,0,0.1));color:var(--dsw-alias-label-secondary,#61666b);
  transition:border-color var(--ll-fade),background var(--ll-fade)}
.dsh-lingualab-drop.is-over .dsh-lingualab-dropstrip{border-color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 8%,transparent)}
.dsh-lingualab-episode-row{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:10px 12px;
  border:0;border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left;
  transition:background var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-episode-row:hover{background:var(--ll-hover)}
.dsh-lingualab-episode-row:disabled{opacity:0.6;cursor:default}
.dsh-lingualab-resume .dsh-lingualab-bar{height:6px}
.dsh-lingualab-bar{position:relative;height:4px;border-radius:999px;background:var(--ll-track);overflow:hidden}
.dsh-lingualab-bar.is-small{flex:none;width:64px;height:3px}
.dsh-lingualab-bar-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-report{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:12px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-folderline{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b);padding-top:4px}
.dsh-lingualab-link{border:0;background:none;padding:0;cursor:pointer;font:inherit;font-size:12px;
  color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-link:hover{text-decoration:underline}

/* ── practice: a stage on the left, the transcript on the right ─ */
.dsh-lingualab-body{flex:1;min-height:0;display:flex}
.dsh-lingualab-practice{position:relative;flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;
  padding:0 24px 20px}
.dsh-lingualab-top-heading{display:flex;flex-direction:column;min-width:0;line-height:1.25;padding:0 4px}
.dsh-lingualab-top-heading .dsh-lingualab-top-title{padding:0}
.dsh-lingualab-top-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
.dsh-lingualab-pill{display:inline-flex;align-items:center;height:22px;padding:0 10px;border-radius:999px;font-size:12px;
  font-weight:600;color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent)}

.dsh-lingualab-stage{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:14px;padding:20px 12px;text-align:center}
.dsh-lingualab-stage-meta{display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
.dsh-lingualab-stage-side{width:100%;max-width:760px;min-height:1.5em;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;font-size:15px;color:var(--ll-muted);opacity:.7;
  -webkit-mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent);
  mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent)}
.dsh-lingualab-stage-now{position:relative;width:100%;max-width:860px;display:flex;flex-direction:column;align-items:center;
  gap:12px;animation:ll-sentence-in .2s ease-out}
@keyframes ll-sentence-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.dsh-lingualab-stage-en{font-size:calc(clamp(26px,3.1vw,44px) * var(--ll-stage-scale));line-height:1.25;font-weight:700;letter-spacing:-.01em;
  word-break:break-word;transition:filter .2s ease}
.dsh-lingualab-stage-en.is-long{font-size:calc(clamp(20px,2.2vw,30px) * var(--ll-stage-scale));line-height:1.35}
.dsh-lingualab-stage-en.is-masked{filter:blur(12px);user-select:none;pointer-events:none}
/* A tinted word reaches a little past its letters on both sides, through a box shadow (drawn only
   outside the box, so the tint never doubles) rather than padding, which would shift the line. */
.dsh-lingualab-stage-en{--ll-word-tint:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 14%,transparent)}
.dsh-lingualab-stage-en .is-word{cursor:pointer;border-radius:.18em;
  transition:background var(--ll-fade),color var(--ll-fade),box-shadow var(--ll-fade),border-radius var(--ll-fade)}
/* The gaps of a picked phrase carry no class until the phrase is picked, so the fade is set on
   every plain span of the sentence: the band fades out with its words instead of snapping off. */
.dsh-lingualab-stage-en>span{transition:background var(--ll-fade)}
.dsh-lingualab-stage-en .is-word:hover{background:var(--ll-word-tint);
  box-shadow:-.12em 0 0 var(--ll-word-tint),.12em 0 0 var(--ll-word-tint)}
/* A picked phrase is one band: the gaps are tinted too, and only its two ends are rounded. */
.dsh-lingualab-stage-en .is-between{background:var(--ll-word-tint)}
.dsh-lingualab-stage-en .is-word.is-pinned{color:var(--dsw-alias-brand-primary,#0f1115);background:var(--ll-word-tint);
  border-radius:0;box-shadow:none}
.dsh-lingualab-stage-en .is-word.is-pinned.is-from{border-top-left-radius:.18em;border-bottom-left-radius:.18em;
  box-shadow:-.12em 0 0 var(--ll-word-tint)}
.dsh-lingualab-stage-en .is-word.is-pinned.is-to{border-top-right-radius:.18em;border-bottom-right-radius:.18em;
  box-shadow:.12em 0 0 var(--ll-word-tint)}
.dsh-lingualab-stage-en .is-word.is-pinned.is-from.is-to{box-shadow:-.12em 0 0 var(--ll-word-tint),.12em 0 0 var(--ll-word-tint)}
.dsh-lingualab-stage-zh{font-size:calc(clamp(15px,1.5vw,20px) * var(--ll-stage-scale));color:color-mix(in srgb,var(--dsw-alias-label-secondary,#61666b) 80%,transparent);
  transition:color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-stage-zh[data-zh="always"]{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-stage-empty{display:flex;flex-direction:column;align-items:center;gap:6px;max-width:420px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-stage-empty strong{font-size:16px;font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-reveal{position:absolute;top:calc(50% - 18px);left:50%;transform:translateX(-50%);display:inline-flex;
  align-items:center;gap:8px;height:34px;padding:0 14px;border-radius:999px;cursor:pointer;font:inherit;font-size:13px;
  color:var(--dsw-alias-label-primary,inherit);background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 6px 20px rgba(0,0,0,0.18);
  transition:border-color var(--ll-fade)}
.dsh-lingualab-reveal:hover{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-stage-now:has(.is-masked) .dsh-lingualab-stage-zh{opacity:0.5}

/* The word popover: small, over the word, and never in the way of the audio. */
.dsh-lingualab-word-pop{position:absolute;z-index:6;display:flex;align-items:center;gap:6px;padding:6px 8px;
  transform:translate(-50%,calc(-100% - 8px));white-space:nowrap;border-radius:12px;font-size:13px;
  background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 12px 32px rgba(0,0,0,0.28);
  animation:ll-pop-in .12s ease-out}
@keyframes ll-pop-in{from{opacity:0;transform:translate(-50%,calc(-100% - 2px))}
  to{opacity:1;transform:translate(-50%,calc(-100% - 8px))}}
.dsh-lingualab-word-pop b{padding:0 6px;font-weight:600}
.dsh-lingualab-pop-btn{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 9px;border-radius:8px;cursor:pointer;
  font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:background var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-pop-btn:hover:not(:disabled){background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-pop-btn:disabled{cursor:default;opacity:.45}
/* A word or phrase already in the note: the button says so, and takes it out on a click. */
.dsh-lingualab-pop-btn.is-on{color:var(--dsw-alias-state-success-primary,#22c55e)}

/* The stage time range opens the timing panel, so it reads as a quiet button, and a ringed one while open. */
.dsh-lingualab-stage-time{font:inherit;font-variant-numeric:tabular-nums;color:inherit;background:none;
  border:1px solid transparent;padding:1px 7px;border-radius:6px;cursor:pointer;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade)}
.dsh-lingualab-stage-time:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-stage-time.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-label-primary,inherit);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 8%,transparent)}

/* The timing panel, between the stage and the player card. It opens by growing a grid row from nothing
   (so the stage above it re-centres instead of jumping) while the card inside fades and lifts in, and it
   stays mounted for as long as the way out takes; see usePresence. */
.dsh-lingualab-timing-wrap{flex:none;display:grid;grid-template-rows:0fr;width:min(720px,100%);align-self:center;
  transition:grid-template-rows .24s cubic-bezier(.2,.8,.2,1)}
.dsh-lingualab-timing-wrap.is-open{grid-template-rows:1fr}
.dsh-lingualab-timing-wrap:not(.is-open){pointer-events:none}
.dsh-lingualab-timing-clip{min-height:0;overflow:hidden}
.dsh-lingualab-timing{display:flex;flex-direction:column;gap:12px;box-sizing:border-box;margin-bottom:10px;
  padding:14px 16px 12px;border-radius:14px;background:var(--ll-surface);
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 8px 24px rgba(0,0,0,0.08);
  opacity:0;transform:translateY(12px) scale(.98);
  transition:opacity .18s ease,transform .24s cubic-bezier(.2,.8,.2,1)}
.dsh-lingualab-timing-wrap.is-open .dsh-lingualab-timing{opacity:1;transform:none}
.dsh-lingualab-timing-row{display:flex;align-items:center;gap:10px}
.dsh-lingualab-timing-title{font-size:14px;font-weight:600}
.dsh-lingualab-timing-status{display:inline-flex;align-items:center;gap:6px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-timing-status::before{content:'';width:6px;height:6px;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115);animation:ll-pulse 1.6s ease-in-out infinite}
.dsh-lingualab-timing-status.is-paused::before{display:none}
@keyframes ll-pulse{0%,100%{opacity:1}50%{opacity:.35}}

/* The mini timeline: the sentence before, the range being edited, the sentence after, and the playhead. */
.dsh-lingualab-timing-line{position:relative;padding-bottom:16px}
.dsh-lingualab-timing-track{position:relative;height:34px;border-radius:8px;background:var(--ll-wash)}
.dsh-lingualab-timing-block{position:absolute;top:9px;height:16px;border-radius:4px;box-sizing:border-box;
  background:var(--ll-track);transition:left var(--ll-fade),width var(--ll-fade)}
.dsh-lingualab-timing-block.is-current{top:5px;height:24px;border-radius:5px;
  border:1.5px solid var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 14%,transparent)}
.dsh-lingualab-timing-head{position:absolute;top:2px;bottom:2px;width:2px;margin-left:-1px;border-radius:1px;
  background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-timing-end{position:absolute;bottom:0;font-size:11px;color:var(--ll-muted);font-variant-numeric:tabular-nums}
.dsh-lingualab-timing-end.is-from{left:8px}
.dsh-lingualab-timing-end.is-to{right:8px}

/* The two edge cards: the focused one is the one the arrow keys move. */
.dsh-lingualab-timing-edges{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.dsh-lingualab-timing-edge{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:12px;cursor:pointer;
  background:var(--ll-surface);border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:border-color var(--ll-fade),background var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-timing-edge.is-readonly{cursor:default}
.dsh-lingualab-timing-edge.is-focus{border-color:var(--dsw-alias-brand-primary,#0f1115);background:var(--ll-wash);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent)}
.dsh-lingualab-timing-edge-head{display:flex;align-items:center;gap:8px;min-height:18px}
.dsh-lingualab-timing-label{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-timing-delta{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}
.dsh-lingualab-timing-keys{font-size:11px;color:var(--ll-muted);opacity:0;transition:opacity var(--ll-fade)}
.dsh-lingualab-timing-edge.is-focus .dsh-lingualab-timing-keys{opacity:1}
.dsh-lingualab-timing-edge-body{display:flex;align-items:center;gap:8px}
.dsh-lingualab-timing-value{padding:0;border:0;background:none;cursor:pointer;font:inherit;font-size:22px;font-weight:600;
  letter-spacing:-.01em;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-timing-value:disabled{cursor:default;font-weight:500;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-timing-step{display:inline-flex;overflow:hidden;border-radius:8px;
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-timing-step button{width:36px;height:30px;padding:0;border:0;background:none;cursor:pointer;font:inherit;
  font-size:12px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary,inherit);
  transition:background var(--ll-fade)}
.dsh-lingualab-timing-step button:hover{background:var(--ll-hover)}
.dsh-lingualab-timing-step button+button{border-left:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-timing-ghost{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 8px;
  margin-left:-8px;border:0;border-radius:6px;background:none;cursor:pointer;font:inherit;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b);transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-timing-ghost:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-page .dsh-lingualab-timing-ghost kbd{height:16px;min-width:16px;padding:0 4px;font-size:11px;font-weight:500;
  border-bottom-width:0.5px}

/* A neutral bar for what the strip wants to say: a neighbour that moves along, a save that cannot happen. */
.dsh-lingualab-timing-note{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;font-size:12px;
  background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-timing-note svg{flex:none}
.dsh-lingualab-timing-note.is-warn::before{content:'';flex:none;width:6px;height:6px;border-radius:999px;
  background:var(--dsw-alias-state-warn-primary,#f59e0b)}
.dsh-lingualab-timing .dsh-lingualab-error{padding:0}

/* Footer: the keys on the left, then undo, cancel and save. */
.dsh-lingualab-timing-foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding-top:10px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-timing-hints{display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px 10px;font-size:11.5px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-page .dsh-lingualab-timing-hints kbd{height:18px;min-width:18px;padding:0 4px;font-size:11px;
  font-weight:500;border-bottom-width:0.5px}
.dsh-lingualab-timing-foot .dsh-lingualab-btn{height:32px;padding:0 12px;font-size:13px}
.dsh-lingualab-timing-foot .dsh-lingualab-btn.is-primary{padding:0 14px;font-weight:600}
.dsh-lingualab-page .dsh-lingualab-timing-foot .dsh-lingualab-btn.is-primary kbd{height:auto;min-width:0;padding:0;border:0;background:none;
  color:inherit;font-size:11px;font-weight:500;opacity:.75}

/* The player card: scrubber on top, then the controls in three groups. */
.dsh-lingualab-deck{flex:none;display:flex;flex-direction:column;gap:12px;width:min(720px,100%);align-self:center;
  box-sizing:border-box;padding:16px 20px 14px;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-transport{display:flex;flex-direction:column;gap:12px;width:100%}
.dsh-lingualab-transport-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px}
.dsh-lingualab-transport-side{display:flex;align-items:center;gap:4px;min-width:0;flex-wrap:wrap}
.dsh-lingualab-transport-side.is-end{justify-content:flex-end}
.dsh-lingualab-transport-main{display:flex;align-items:center;gap:14px}
.dsh-lingualab-play{display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;flex:none;
  border:0;border-radius:999px;background:var(--dsw-alias-brand-primary,#0f1115);color:var(--ll-on-brand);cursor:pointer;
  box-shadow:0 8px 22px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 38%,transparent);
  transition:transform var(--ll-fade),filter var(--ll-fade),opacity var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-play:hover:not(:disabled){filter:brightness(1.08)}
.dsh-lingualab-play:active:not(:disabled){transform:scale(.94)}
.dsh-lingualab-play:disabled{opacity:0.45;cursor:default;box-shadow:none}
.dsh-lingualab-round{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;
  border-radius:999px;cursor:pointer;color:var(--dsw-alias-label-primary,inherit);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:transform var(--ll-fade),background var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-round:hover:not(:disabled){background:var(--ll-hover)}
.dsh-lingualab-round:active:not(:disabled){transform:scale(.92)}
.dsh-lingualab-round:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-bar-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:32px;min-width:32px;
  padding:0 10px;border:0.5px solid transparent;border-radius:9px;background:none;
  color:var(--dsw-alias-label-secondary,#61666b);cursor:pointer;font:inherit;font-size:12px;white-space:nowrap;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-bar-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-bar-btn.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 10%,transparent)}
.dsh-lingualab-bar-btn.is-star.is-on{border-color:var(--dsw-alias-state-warn-primary,#f59e0b);
  color:var(--dsw-alias-state-warn-primary,#f59e0b);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 10%,transparent)}
.dsh-lingualab-bar-btn:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-time{flex:none;min-width:40px;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-time:last-child{text-align:right}
.dsh-lingualab-menu-holder{position:relative;display:inline-flex}
.dsh-lingualab-menu{position:absolute;right:0;bottom:calc(100% + 6px);z-index:25;display:flex;flex-direction:column;gap:10px;
  width:300px;padding:12px;border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:12px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3);
  text-align:left}
.dsh-lingualab-menu-title{font-size:12px;font-weight:600}
.dsh-lingualab-menu-keys{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:0;padding-top:8px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b)}
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
  overflow:hidden;background:var(--ll-track);transition:height var(--ll-fade),margin var(--ll-fade)}
.dsh-lingualab-scrub-track:hover .dsh-lingualab-scrub-rail{height:8px;margin-top:-4px}
.dsh-lingualab-scrub-ticks{position:absolute;inset:0;width:100%;height:100%}
.dsh-lingualab-scrub-ticks path{stroke:var(--dsw-alias-label-secondary,#61666b);stroke-width:1;opacity:0.35}
.dsh-lingualab-scrub-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-scrub-ghost{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;
  background:var(--dsw-alias-label-primary,#0f1115);opacity:0.45}
.dsh-lingualab-scrub-knob{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115);transform:scale(.8);transition:transform var(--ll-fade);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 24%,transparent)}
.dsh-lingualab-scrub-track:hover .dsh-lingualab-scrub-knob{transform:scale(1.1)}
.dsh-lingualab-scrub-tip{position:absolute;bottom:calc(100% + 6px);z-index:8;display:flex;flex-direction:column;gap:2px;
  width:max-content;max-width:220px;transform:translateX(-50%);padding:6px 10px;border-radius:10px;font-size:12px;
  text-align:left;pointer-events:none;color:var(--dsw-alias-label-primary,inherit);
  background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 10px 28px rgba(0,0,0,0.25)}
.dsh-lingualab-scrub-tip b{font-variant-numeric:tabular-nums}
.dsh-lingualab-scrub-tip span{color:var(--dsw-alias-label-secondary,#61666b);display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden}

/* Key caps: they light up when the page handles that key. */
.dsh-lingualab-keyhints{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px 16px;
  font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);transition:opacity var(--ll-fade)}
.dsh-lingualab-keyhints.is-idle{opacity:0.55}
.dsh-lingualab-keyhint{display:inline-flex;align-items:center;gap:4px}
.dsh-lingualab-page kbd{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;
  box-sizing:border-box;border-radius:6px;font:inherit;font-size:11px;font-weight:600;
  color:var(--dsw-alias-label-secondary,#61666b);background:var(--dsw-alias-bg-base,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  border-bottom-width:2px;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade),transform var(--ll-fade)}
.dsh-lingualab-keyhint.is-hit kbd{background:var(--dsw-alias-brand-primary,#0f1115);color:var(--ll-on-brand);
  border-color:var(--dsw-alias-brand-primary,#0f1115);transform:translateY(1px)}
.dsh-lingualab-keyhint{transition:color var(--ll-fade)}
.dsh-lingualab-keyhint.is-hit{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-reveal kbd{margin-left:2px}

/* ── transcript: the only scroller ───────────────────────────── */
.dsh-lingualab-transcript{flex:none;width:clamp(300px,34%,440px);min-height:0;display:flex;flex-direction:column;
  border-left:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-transcript-head{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 16px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-transcript-title{font-weight:600}
.dsh-lingualab-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-switch-track{position:relative;width:30px;height:18px;border-radius:999px;background:var(--ll-track);
  transition:background var(--ll-fade)}
.dsh-lingualab-switch-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;
  background:var(--dsw-alias-bg-base,#fff);box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform var(--ll-fade)}
.dsh-lingualab-switch input:checked + .dsh-lingualab-switch-track{background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-switch input:checked + .dsh-lingualab-switch-track .dsh-lingualab-switch-knob{transform:translateX(12px)}
.dsh-lingualab-switch input:focus-visible + .dsh-lingualab-switch-track{
  outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:2px}
.dsh-lingualab-list{position:relative;flex:1;min-width:0;min-height:0;overflow:auto;padding:8px}
.dsh-lingualab-row{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:10px;align-items:start;
  padding:9px 10px;margin-bottom:2px;cursor:pointer;border-radius:10px;transition:background var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-row:hover,.dsh-lingualab-row.is-selected{background:var(--ll-hover)}
.dsh-lingualab-row.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 11%,transparent);
  box-shadow:inset 3px 0 0 var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-row-time{font-size:11.5px;color:var(--ll-muted);font-variant-numeric:tabular-nums;padding-top:3px;
  transition:color var(--ll-fade)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-time{color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-row-en{min-width:0;word-break:break-word;color:var(--dsw-alias-label-secondary,#61666b);
  transition:color var(--ll-fade)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-en{color:var(--dsw-alias-label-primary,inherit);font-weight:600}
/* Dimmed is small and faint, so the English leads; always is the same size and weight of
   colour as the English, so both languages read as one block. */
.dsh-lingualab-row-zh{margin-top:2px;font-size:12px;
  color:color-mix(in srgb,var(--dsw-alias-label-secondary,#61666b) 55%,transparent);transition:color var(--ll-fade)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-zh{
  color:color-mix(in srgb,var(--dsw-alias-label-secondary,#61666b) 80%,transparent)}
.dsh-lingualab-list[data-zh="always"] .dsh-lingualab-row-zh{font-size:inherit;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-list[data-zh="always"] .dsh-lingualab-row.is-active .dsh-lingualab-row-zh{
  color:var(--dsw-alias-label-primary,inherit)}
/* Hidden actions drop out of the tab order and hit testing, but only once the fade has finished:
   the visibility change waits one beat when hiding and happens at once when showing. */
.dsh-lingualab-row-actions{display:flex;align-items:center;gap:2px;opacity:0;visibility:hidden;
  transition:opacity var(--ll-fade),visibility 0s linear var(--ll-fast)}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions,.dsh-lingualab-row.is-active .dsh-lingualab-row-actions{
  opacity:1;visibility:visible;transition:opacity var(--ll-fade),visibility 0s}
/* A kept sentence shows its star at rest, so the list reads as a map of what you took. */
.dsh-lingualab-row-actions.is-kept{opacity:1;visibility:visible}
.dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn:not(.is-star){opacity:0;visibility:hidden;
  transition:background var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade),visibility 0s linear var(--ll-fast)}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn,
.dsh-lingualab-row.is-active .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn{opacity:1;visibility:visible;
  transition:background var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade),visibility 0s}

/* ── finish card ─────────────────────────────────────────────── */
.dsh-lingualab-finish{position:absolute;inset:0;z-index:15;display:flex;align-items:center;justify-content:center;
  padding:16px;background:var(--ll-mask);backdrop-filter:blur(2px);animation:ll-fade-in .18s ease-out}
@keyframes ll-fade-in{from{opacity:0}to{opacity:1}}
.dsh-lingualab-finish-card{display:flex;flex-direction:column;align-items:center;gap:12px;width:min(460px,100%);
  box-sizing:border-box;padding:28px 28px 20px;text-align:center;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  background:var(--ll-surface);box-shadow:0 24px 64px rgba(0,0,0,0.38);
  animation:ll-sentence-in .22s ease-out}
.dsh-lingualab-finish-card h2{margin:0;font-size:20px;font-weight:700}
.dsh-lingualab-finish-card p{margin:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-finish-badge{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;
  border-radius:999px;color:var(--ll-on-brand);background:var(--dsw-alias-state-success-primary,#22c55e);
  animation:ll-badge-in .35s cubic-bezier(.2,1.4,.4,1)}
@keyframes ll-badge-in{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.dsh-lingualab-finish-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin:4px 0 6px}
.dsh-lingualab-finish-stats div{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px;
  border-radius:12px;background:var(--dsw-alias-bg-layer-1,transparent);
  border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-finish-stats dt{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.dsh-lingualab-finish-stats dd{margin:0;font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-finish-stats.is-four{grid-template-columns:repeat(4,1fr)}

/* ── review: the strip above the stage ───────────────────────── */
.dsh-lingualab-review{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:min(860px,100%);
  align-self:center;box-sizing:border-box;margin-top:14px;padding:8px 10px 8px 12px;border-radius:14px;
  background:var(--ll-surface);border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-review-source{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-review .dsh-lingualab-pop-btn kbd{font:inherit;font-size:11px;opacity:.7}

/* ── segmented control: the right column's switch and the kept filter ── */
.dsh-lingualab-segmented{display:inline-flex;gap:2px;padding:2px;border-radius:9px;background:var(--ll-hover)}
.dsh-lingualab-segmented button{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border:0;
  border-radius:7px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;background:none;
  color:var(--dsw-alias-label-secondary,#61666b);
  transition:background var(--ll-fade),color var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-segmented button:hover{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-segmented button.is-on{color:var(--dsw-alias-label-primary,inherit);background:var(--ll-surface);
  box-shadow:0 1px 3px rgba(0,0,0,0.14)}
.dsh-lingualab-segmented.is-small button{height:24px;padding:0 9px;font-size:12px;font-weight:500}
.dsh-lingualab-segmented-count{font-weight:400;font-variant-numeric:tabular-nums;opacity:.7}

/* ── loading: skeletons that mirror the real layout ──────────── */
/* The delay keeps a fast load from flashing a placeholder for a single frame. */
.dsh-lingualab-sk-wrap{display:flex;flex-direction:column;gap:22px;animation:ll-fade-in .28s ease-out .18s both}
.dsh-lingualab-sk{display:block;flex:none;max-width:100%;
  background:linear-gradient(90deg,var(--ll-track) 25%,color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 5%,transparent) 50%,var(--ll-track) 75%);
  background-size:300% 100%;animation:ll-shimmer 1.5s ease-in-out infinite}
@keyframes ll-shimmer{from{background-position:100% 0}to{background-position:0 0}}
.dsh-lingualab-sk-row{display:flex;align-items:center;gap:14px}
.dsh-lingualab-sk-row.is-between{justify-content:space-between}
.dsh-lingualab-sk-resume{display:flex;flex-direction:column;align-items:flex-start;gap:14px;padding:26px 28px;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-sk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.dsh-lingualab-sk-card{display:flex;flex-direction:column;align-items:stretch;gap:10px;padding:16px;border-radius:16px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-sk-list{gap:6px;padding:10px 12px}
.dsh-lingualab-sk-item{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:12px}
.dsh-lingualab-sk-stage{flex:1;align-items:center;justify-content:center;gap:28px;width:100%}
.dsh-lingualab-sk-lines{display:flex;flex-direction:column;align-items:center;gap:14px;width:min(640px,80%)}
.dsh-lingualab-sk-label{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-spinner{width:14px;height:14px;border-radius:999px;box-sizing:border-box;
  border:2px solid var(--ll-track);border-top-color:var(--dsw-alias-brand-primary,#0f1115);animation:ll-spin .8s linear infinite}
.dsh-lingualab-btn .dsh-lingualab-spinner{border-color:color-mix(in srgb,currentColor 30%,transparent);border-top-color:currentColor}
@keyframes ll-spin{to{transform:rotate(360deg)}}

@media (prefers-reduced-motion:reduce){
  .dsh-lingualab-sk{animation:none}
  .dsh-lingualab-spinner{animation-duration:2.4s}
  .dsh-lingualab-stage-now,.dsh-lingualab-word-pop,.dsh-lingualab-finish,.dsh-lingualab-finish-card,
  .dsh-lingualab-finish-badge,.dsh-lingualab-popover,.dsh-lingualab-scrim,.dsh-lingualab-step-panel,
  .dsh-lingualab-editor,.dsh-lingualab-timing-status::before,.dsh-lingualab-notice{animation:none}
  .dsh-lingualab-page,.dsh-lingualab-page *{transition-duration:0s !important;transition-delay:0s !important}
}

/* ── drawer: the five steps slide in over a scrim, and slide out again ──────────── */
.dsh-lingualab-scrim{position:absolute;inset:0;z-index:21;background:var(--ll-mask);animation:ll-fade-in .18s ease-out}
.dsh-lingualab-scrim.is-leaving{animation:ll-fade-out .2s ease forwards;pointer-events:none}
@keyframes ll-fade-out{from{opacity:1}to{opacity:0}}
.dsh-lingualab-popover{position:absolute;top:0;right:0;bottom:0;z-index:22;display:flex;
  flex-direction:column;width:min(440px,100%);min-height:0;box-sizing:border-box;
  border-left:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  background:var(--ll-surface);box-shadow:-18px 0 48px rgba(0,0,0,0.22);
  animation:ll-slide-in .2s ease-out}
.dsh-lingualab-popover.is-leaving{animation:ll-slide-out .2s ease-in forwards;pointer-events:none}
@keyframes ll-slide-in{from{transform:translateX(28px);opacity:0}to{transform:none;opacity:1}}
@keyframes ll-slide-out{from{transform:none;opacity:1}to{transform:translateX(28px);opacity:0}}
.dsh-lingualab-drawer-head{flex:none;display:flex;align-items:flex-start;gap:12px;padding:20px 20px 16px}
.dsh-lingualab-drawer-head .dsh-lingualab-icon-btn{margin:-4px -6px 0 0}
.dsh-lingualab-drawer-titles{flex:1;display:flex;flex-direction:column;min-width:0;gap:2px}
.dsh-lingualab-drawer-title{font-weight:700;font-size:18px;line-height:1.3}
.dsh-lingualab-drawer-sub{font-size:12.5px;color:var(--dsw-alias-label-secondary,#61666b);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
/* ── the 「收藏」 column: one card per kept sentence, the one on stage open ── */
.dsh-lingualab-transcript.is-kept{position:relative}
.dsh-lingualab-kept-filter{flex:none;padding:10px 12px 4px}
.dsh-lingualab-notes-body{position:relative;flex:1;min-height:0;overflow:auto;padding:8px 12px 16px;display:flex;
  flex-direction:column;gap:8px}
.dsh-lingualab-note{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:12px;flex:none;cursor:pointer;
  background:var(--ll-wash);border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:border-color var(--ll-fade),background var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-note:hover{border-color:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 22%,transparent)}
/* The open card is the sentence on stage: a surface with a stronger edge and a soft lift, no tint. */
.dsh-lingualab-note.is-open{gap:10px;padding:14px;cursor:default;background:var(--ll-surface);
  border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 50%,transparent);
  box-shadow:0 6px 20px rgba(0,0,0,0.07)}
.dsh-lingualab-note-text{transition:color var(--ll-fade)}
.dsh-lingualab-note.is-done .dsh-lingualab-note-text{color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-note-top{display:flex;align-items:center;gap:8px;min-height:26px}
.dsh-lingualab-note-check{display:inline-flex;cursor:pointer;position:relative}
.dsh-lingualab-box{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;
  box-sizing:border-box;border:1.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  color:var(--ll-on-brand);transition:background var(--ll-fade),border-color var(--ll-fade)}
.dsh-lingualab-note-check:hover .dsh-lingualab-box{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-note-check:focus-within .dsh-lingualab-box{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:2px}
.dsh-lingualab-box.is-on{background:var(--dsw-alias-brand-primary,#0f1115);border-color:transparent}
/* The time chip: gray at rest, and on the open card it is the play button, filled while it plays. */
.dsh-lingualab-note-at{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:999px;border:0;
  font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;font-variant-numeric:tabular-nums;
  color:var(--dsw-alias-label-secondary,#61666b);background:var(--ll-hover);
  transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-note-at:hover{background:var(--ll-track);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-note.is-open .dsh-lingualab-note-at:not(.is-playing){color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-note-at.is-playing,.dsh-lingualab-note-at.is-playing:hover{color:var(--ll-on-brand);
  background:var(--dsw-alias-brand-primary,#0f1115)}
/* A collapsed card that carries a note says so, quietly, at the end of its top row. */
.dsh-lingualab-note-has{display:inline-flex;flex:none;color:var(--ll-muted)}
.dsh-lingualab-note .dsh-lingualab-icon-btn.is-small{color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-icon-btn.is-danger:hover{color:var(--dsw-alias-state-error-primary,#ec1313);
  background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#ec1313) 12%,transparent)}
.dsh-lingualab-note-text{display:block;word-break:break-word;font-weight:500;font-size:14px;line-height:1.4}
.dsh-lingualab-note.is-open .dsh-lingualab-note-text{font-weight:600;font-size:17px;line-height:1.35}
/* A sentence's one state, as a quiet gray pill on every card. The state is a 6px dot before the
   text, the only colour on it: 「新收藏」 has no state yet, so it has no dot. */
.dsh-lingualab-grade{--ll-grade:var(--dsw-alias-label-secondary,#61666b);display:inline-flex;align-items:center;gap:6px;
  flex:none;height:20px;padding:0 8px;border-radius:999px;font-size:11.5px;font-weight:600;
  color:var(--dsw-alias-label-secondary,#61666b);background:var(--ll-hover);
  transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-grade::before,.dsh-lingualab-grade-btn::before{content:'';flex:none;width:6px;height:6px;border-radius:999px;
  background:var(--ll-grade)}
.dsh-lingualab-grade.is-new{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-grade.is-new::before{display:none}
.dsh-lingualab-grade.is-got,.dsh-lingualab-grade-btn.is-got{--ll-grade:var(--dsw-alias-state-success-primary,#22c55e)}
.dsh-lingualab-grade.is-fuzzy,.dsh-lingualab-grade-btn.is-fuzzy{--ll-grade:var(--dsw-alias-state-warn-primary,#f59e0b)}
.dsh-lingualab-grade.is-notyet,.dsh-lingualab-grade-btn.is-notyet{--ll-grade:var(--dsw-alias-state-error-primary,#ec1313)}
/* The three grades as buttons, on the open card and on the review strip: neutral outlined, the dot
   says which grade it is, and the one that is on fills with the brand. */
.dsh-lingualab-grades{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding-top:4px}
.dsh-lingualab-grade-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:30px;padding:0 11px;
  border-radius:8px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;white-space:nowrap;
  color:var(--dsw-alias-label-primary,inherit);background:none;
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:background var(--ll-fade),border-color var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-grades .dsh-lingualab-grade-btn{height:34px;padding:0 6px;gap:5px;border-radius:9px;font-size:13px}
.dsh-lingualab-grade-btn kbd{font:inherit;font-size:11px;opacity:.6}
.dsh-lingualab-grade-btn:disabled{opacity:.45;cursor:default}
.dsh-lingualab-grade-btn:hover:not(:disabled){background:var(--ll-hover)}
.dsh-lingualab-grade-btn.is-on{color:var(--ll-on-brand);background:var(--dsw-alias-brand-primary,#0f1115);border-color:transparent}
.dsh-lingualab-grade-btn.is-on:hover:not(:disabled){background:var(--dsw-alias-brand-primary,#0f1115);filter:brightness(1.08)}
.dsh-lingualab-grade-btn.is-on kbd{opacity:.75}
.dsh-lingualab-note-zh{font-size:13px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-memo-words{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.dsh-lingualab-word-chip{display:inline-flex;align-items:center;gap:2px;height:24px;padding:0 3px 0 9px;border-radius:6px;
  font-size:12.5px;font-weight:500;color:var(--dsw-alias-label-primary,inherit);background:var(--ll-hover)}
.dsh-lingualab-word-chip-x{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;
  border:0;border-radius:4px;cursor:pointer;color:inherit;background:none;opacity:.6;
  transition:background var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-word-chip-x:hover{opacity:1;background:var(--ll-track)}
/* The note, as text you click to edit: it keeps the line breaks it was written with. */
.dsh-lingualab-memo-text{display:block;width:100%;box-sizing:border-box;padding:9px 12px;border:0;border-radius:10px;
  background:var(--ll-wash);color:var(--dsw-alias-label-primary,inherit);font:inherit;font-size:13.5px;line-height:1.6;
  text-align:left;white-space:pre-wrap;word-break:break-word;cursor:text;transition:background var(--ll-fade)}
.dsh-lingualab-memo-text:hover{background:var(--ll-hover)}
.dsh-lingualab-memo-add{display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:10px;cursor:text;
  font:inherit;font-size:13px;color:var(--dsw-alias-label-secondary,#61666b);background:none;
  border:1px dashed var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:border-color var(--ll-fade),color var(--ll-fade),background var(--ll-fade)}
.dsh-lingualab-memo-add:hover{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-label-primary,inherit);
  background:var(--ll-wash)}
/* The note editor: a box with its own label and footer, lit as a whole while the field has focus. */
.dsh-lingualab-editor{display:flex;flex-direction:column;border-radius:10px;background:var(--ll-surface);
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));animation:ll-step-in .16s ease-out;
  transition:border-color var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-editor:focus-within{border-color:var(--dsw-alias-brand-primary,#0f1115);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 14%,transparent)}
.dsh-lingualab-editor-label{padding:8px 12px 0;font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-editor textarea{display:block;width:100%;box-sizing:border-box;margin:0;padding:4px 12px 8px;border:0;outline:none;
  resize:none;overflow-y:auto;background:transparent;color:var(--dsw-alias-label-primary,inherit);
  font:inherit;font-size:13.5px;line-height:1.6;min-height:calc(3 * 1.6em + 12px);max-height:calc(8 * 1.6em + 12px)}
.dsh-lingualab-editor textarea::placeholder{color:var(--ll-muted)}
.dsh-lingualab-editor-foot{display:flex;align-items:center;gap:8px;padding:6px 8px 6px 12px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-editor-hint{min-width:0;font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-btn.is-ghost{border-color:transparent;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-btn.is-ghost:hover{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-drawer-foot{flex:none;padding:12px 20px 16px;font-size:12px;line-height:1.5;
  color:var(--dsw-alias-label-secondary,#61666b);border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
/* Undo toast: floats over the drawer's bottom, inverted so it reads as a message and not as content. */
.dsh-lingualab-toast{position:absolute;left:50%;bottom:64px;transform:translateX(-50%);z-index:3;display:flex;align-items:center;
  gap:12px;height:44px;padding:0 8px 0 16px;border-radius:12px;white-space:nowrap;font-size:13px;
  background:var(--dsw-alias-label-primary,#0f1115);color:var(--dsw-alias-bg-base,#fff);
  box-shadow:0 8px 24px rgba(0,0,0,0.28);animation:ll-toast-in .18s ease-out}
.dsh-lingualab-toast-undo{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border:0;border-radius:8px;
  background:none;cursor:pointer;font:inherit;font-weight:600;color:inherit;text-decoration:underline;text-underline-offset:3px;
  transition:background var(--ll-fade)}
.dsh-lingualab-toast-undo:hover{background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 16%,transparent)}
@keyframes ll-toast-in{from{transform:translate(-50%,8px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
@media (max-width:860px){
  .dsh-lingualab-transcript{width:260px}
  .dsh-lingualab-grades .dsh-lingualab-grade-btn kbd{display:none}
  .dsh-lingualab-transport-row{grid-template-columns:1fr;justify-items:center}
  .dsh-lingualab-transport-side.is-end{justify-content:center}
}
/* ── layers: browse, media folder, steps ─────────────────────── */
.dsh-lingualab-mask{position:absolute;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;
  padding:44px 24px;background:var(--ll-mask)}
.dsh-lingualab-modal{display:flex;flex-direction:column;width:min(620px,100%);max-height:100%;overflow:hidden;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:14px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3)}
.dsh-lingualab-modal-head{display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-modal-title{font-weight:600;font-size:14px}
.dsh-lingualab-tabs{display:flex;gap:8px;padding:14px 24px}
.dsh-lingualab-tab{border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:999px;background:none;
  color:var(--dsw-alias-label-secondary,#61666b);cursor:pointer;font:inherit;font-size:12px;font-weight:500;height:28px;padding:0 12px;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade)}
.dsh-lingualab-tab:hover{background:var(--ll-hover)}
.dsh-lingualab-tab.is-on{background:var(--dsw-alias-brand-primary,#0f1115);border-color:transparent;color:var(--ll-on-brand)}
.dsh-lingualab-tab.is-on .dsh-lingualab-counter{color:inherit;opacity:.85}
.dsh-lingualab-modal-body{flex:1;min-height:0;overflow:auto;padding:8px 10px 12px}
.dsh-lingualab-input{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-layer-2,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:8px;color:inherit;
  font:inherit;font-size:13px;padding:6px 9px;
  transition:border-color var(--ll-fade),box-shadow var(--ll-fade),background var(--ll-fade)}
.dsh-lingualab-pick{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:7px 9px;
  border:0;border-radius:8px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left;
  transition:background var(--ll-fade),box-shadow var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-pick:hover{background:var(--ll-hover)}
.dsh-lingualab-pick.is-current{background:var(--dsw-alias-bg-layer-2,var(--ll-hover))}
.dsh-lingualab-pick-main{flex:1;min-width:0}
.dsh-lingualab-pick-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-pick-sub{display:block;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-badge{flex:none;font-size:11px;color:var(--dsw-alias-label-secondary,#61666b);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:999px;padding:1px 7px}
.dsh-lingualab-group{margin:12px 6px 4px;font-size:11.5px;font-weight:600;letter-spacing:.03em;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-group:first-child{margin-top:4px}

/* The browse layer: a card that floats (stronger mask, a ring and a deeper shadow), a
   toolbar that stays put, a list that scrolls, and a footer that owns the one big action. */
.dsh-lingualab-mask:has(.is-browse){align-items:center;padding:24px;
  backdrop-filter:blur(3px)}
.dsh-lingualab-modal.is-browse{width:min(720px,100%);height:min(620px,100%);
  border-color:var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  box-shadow:0 0 0 1px var(--ll-hover),0 24px 64px rgba(0,0,0,0.38)}
.dsh-lingualab-browse-bar{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-pathrow{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-lingualab-select{flex:none;max-width:180px;height:28px;padding:0 8px;border-radius:8px;cursor:pointer;
  background:var(--dsw-alias-bg-layer-2,transparent);color:inherit;font:inherit;font-size:12.5px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));transition:border-color var(--ll-fade)}
.dsh-lingualab-select:hover{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-icon-btn.is-small{width:28px;height:28px}
.dsh-lingualab-crumbs{flex:1;min-width:0;display:flex;align-items:center;flex-wrap:nowrap;overflow:hidden}
.dsh-lingualab-crumbs-root{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 7px;
  font-size:12px;color:var(--ll-muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.dsh-lingualab-crumb-item{display:inline-flex;align-items:center;flex:0 1 auto;min-width:0;color:var(--ll-muted)}
.dsh-lingualab-crumb{flex:none;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  height:26px;padding:0 7px;border:0;border-radius:6px;background:none;cursor:pointer;font:inherit;font-size:12.5px;
  color:var(--dsw-alias-label-secondary,#61666b);transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-crumb:hover:not(:disabled){background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-crumb.is-here,.dsh-lingualab-crumb:disabled{cursor:default;font-weight:600;
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-browse-bar .dsh-lingualab-input{height:34px;padding:0 11px;border-radius:9px;
  background:var(--dsw-alias-bg-base,transparent)}
.dsh-lingualab-browse-bar .dsh-lingualab-input:focus{outline:none;
  border-color:var(--dsw-alias-brand-primary,#0f1115);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 22%,transparent)}
.dsh-lingualab-modal.is-browse .dsh-lingualab-modal-body{padding:6px 10px 10px;transition:opacity var(--ll-fade)}
.dsh-lingualab-modal-body.is-loading{opacity:0.55}
.dsh-lingualab-pick{min-height:40px}
.dsh-lingualab-pick svg{flex:none;color:var(--dsw-alias-label-secondary,#61666b);transition:color var(--ll-fade)}
.dsh-lingualab-pick.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent);
  box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-pick.is-active svg{color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-pick.is-episode{border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));margin:4px 0 2px}
.dsh-lingualab-pick.is-inert{cursor:default;opacity:0.55;min-height:32px}
.dsh-lingualab-pick.is-inert:hover{background:none}
.dsh-lingualab-badge.is-ok{color:var(--dsw-alias-state-success-primary,#22c55e);
  border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary,#22c55e) 45%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#22c55e) 10%,transparent)}
.dsh-lingualab-badge.is-warn{color:var(--dsw-alias-state-warn-primary,#f59e0b);
  border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 45%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 10%,transparent)}
.dsh-lingualab-empty.is-center{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;
  padding:56px 24px}
.dsh-lingualab-empty.is-center strong{font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-error.is-pad,.dsh-lingualab-hint.is-pad{padding:8px 14px}
.dsh-lingualab-modal-foot{flex:none;display:flex;align-items:center;gap:10px;padding:9px 14px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-keys{font-size:11.5px;color:var(--ll-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  min-width:0}
.dsh-lingualab-foot-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;max-width:220px}
@media (max-width:640px){.dsh-lingualab-keys,.dsh-lingualab-foot-hint{display:none}}
.dsh-lingualab-empty{color:var(--dsw-alias-label-secondary,#61666b);padding:14px 12px;font-size:13px}
.dsh-lingualab-warn{color:var(--dsw-alias-state-warn-primary,#f59e0b);font-size:12.5px;padding:6px 0}
.dsh-lingualab-error{color:var(--dsw-alias-state-error-primary,#ec1313);font-size:12.5px;padding:6px 0}
.dsh-lingualab-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));background:none;color:inherit;
  font:inherit;font-size:13px;cursor:pointer;white-space:nowrap;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade),filter var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-btn:hover{background:var(--ll-hover)}
.dsh-lingualab-btn.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-btn.is-primary{background:var(--dsw-alias-brand-primary,#0f1115);border-color:transparent;color:var(--ll-on-brand)}
.dsh-lingualab-btn.is-primary:hover{background:var(--dsw-alias-brand-primary,#0f1115);filter:brightness(1.08)}
.dsh-lingualab-btn.is-large{height:38px;padding:0 18px;font-size:14px;border-radius:10px}
.dsh-lingualab-btn.is-small{height:26px;padding:0 10px;font-size:12px;gap:5px}
.dsh-lingualab-btn:disabled{opacity:.45;cursor:default}
.dsh-lingualab-btn:disabled{opacity:0.45;cursor:default}


/* ── five steps: a header, one bar of five segments, then a vertical stepper ── */
.dsh-lingualab-steps-bar{flex:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding:0 20px 18px}
.dsh-lingualab-steps-seg{height:4px;border-radius:999px;background:var(--ll-hover);overflow:hidden}
.dsh-lingualab-steps-seg span,.dsh-lingualab-step-progress span{display:block;height:100%;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115);transition:width .3s ease}
.dsh-lingualab-steps-body{flex:1;min-height:0;overflow:auto;padding:0 12px 16px}
.dsh-lingualab-steps{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.dsh-lingualab-step{position:relative;display:flex;gap:12px;padding:0 8px}
.dsh-lingualab-step-rail{position:relative;flex:none;width:28px;display:flex;flex-direction:column;align-items:center}
/* The round check is the done toggle: a number, or a tick once the step is done. */
.dsh-lingualab-step-check{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;
  width:28px;height:28px;margin-top:12px;padding:0;border-radius:999px;cursor:pointer;font:inherit;font-size:12px;
  font-weight:700;color:var(--dsw-alias-label-secondary,#61666b);background:var(--ll-surface);
  border:1.5px solid color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 22%,transparent);
  transition:background var(--ll-fade),border-color var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-step-check:hover{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-step.is-open .dsh-lingualab-step-check{border-color:var(--dsw-alias-brand-primary,#0f1115);
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-step-check.is-on{color:var(--ll-on-brand);background:var(--dsw-alias-brand-primary,#0f1115);
  border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-step-line{flex:1;width:2px;margin-top:4px;border-radius:1px;background:var(--ll-hover);
  transition:background var(--ll-fade)}
.dsh-lingualab-step.is-done .dsh-lingualab-step-line{
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 35%,transparent)}
.dsh-lingualab-step-body{flex:1;min-width:0;display:flex;flex-direction:column;padding:8px 0 10px}
.dsh-lingualab-step-row{display:flex;align-items:center;gap:10px;margin:0 -10px;padding:6px 10px;border:0;border-radius:10px;
  background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background var(--ll-fade)}
.dsh-lingualab-step-row:hover:not(:disabled){background:var(--ll-wash)}
.dsh-lingualab-step-row:disabled{cursor:default}
.dsh-lingualab-step-main{flex:1;min-width:0;display:flex;flex-direction:column}
.dsh-lingualab-step-label{font-size:14.5px;font-weight:600;transition:color var(--ll-fade)}
.dsh-lingualab-step.is-done .dsh-lingualab-step-label{color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-step-meta{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
.dsh-lingualab-step-pill{display:inline-flex;align-items:center;gap:6px;flex:none;height:22px;padding:0 8px;
  border-radius:999px;background:var(--ll-track);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}
.dsh-lingualab-step-pill::before{content:'';width:6px;height:6px;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-step-tag{display:inline-flex;align-items:center;flex:none;height:22px;padding:0 8px;border-radius:999px;
  font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b);
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
/* The one step that is open: its clock against the suggested time, a tip, and the two buttons. */
.dsh-lingualab-step-panel{display:flex;flex-direction:column;gap:12px;margin-top:8px;padding:14px;border-radius:12px;
  background:var(--ll-wash);animation:ll-step-in .18s ease-out}
@keyframes ll-step-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.dsh-lingualab-step-clock{display:flex;align-items:baseline;gap:6px;font-variant-numeric:tabular-nums}
.dsh-lingualab-step-clock b{font-size:30px;font-weight:700;letter-spacing:-.02em;line-height:1}
.dsh-lingualab-step-clock span{font-size:13px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-step-clock .dsh-lingualab-step-tip{margin-left:auto;font-size:12px}
.dsh-lingualab-step-progress{height:4px;border-radius:999px;background:var(--ll-hover);overflow:hidden}
.dsh-lingualab-step-actions{display:flex;gap:8px}
.dsh-lingualab-step-actions .dsh-lingualab-btn{justify-content:center;height:36px;padding:0 14px;border-radius:9px;font-size:13.5px}
.dsh-lingualab-step-actions .dsh-lingualab-btn.is-primary{flex:1;font-weight:600}
.dsh-lingualab-step-actions .dsh-lingualab-btn.is-primary.is-running{
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 82%,var(--ll-surface))}
/* ── settings drawer: the five-steps drawer's frame, a little narrower, with radio groups inside ── */
.dsh-lingualab-popover.is-settings{width:min(420px,100%);outline:none}
/* The drawer is painted with the surface colour, so a chosen segment painted with it too would read as sunk
   in dark; layer 2 lifts it (and is the same white in light). */
.dsh-lingualab-popover.is-settings .dsh-lingualab-segmented button.is-on{background:var(--dsw-alias-bg-layer-2,#ffffff)}
.dsh-lingualab-settings-body{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px;
  padding:0 20px 20px}
.dsh-lingualab-settings-label{margin:18px 0 2px;font-size:12px;font-weight:600;letter-spacing:.02em;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-settings-label:first-child{margin-top:4px}
.dsh-lingualab-setting-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:40px}
.dsh-lingualab-setting-block{display:flex;flex-direction:column;gap:10px;padding-top:6px}
.dsh-lingualab-setting-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.dsh-lingualab-setting-name{font-size:13px;font-weight:500}
.dsh-lingualab-setting-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-theme-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.dsh-lingualab-theme{display:flex;flex-direction:column;align-items:stretch;gap:3px;box-sizing:border-box;padding:8px 8px 10px;
  border-radius:12px;text-align:left;cursor:pointer;font:inherit;color:inherit;background:none;
  border:1.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:border-color var(--ll-fade),background var(--ll-fade)}
.dsh-lingualab-theme:hover{background:var(--ll-wash)}
.dsh-lingualab-theme.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-theme-preview{display:flex;flex-direction:column;justify-content:center;gap:7px;box-sizing:border-box;
  height:64px;margin-bottom:5px;padding:0 12px;border-radius:8px;border:1px solid transparent;
  transition:background-color var(--ll-fade),border-color var(--ll-fade)}
.dsh-lingualab-theme-line{display:flex;align-items:center;gap:6px}
.dsh-lingualab-theme-dot{flex:none;width:8px;height:8px;border-radius:999px}
.dsh-lingualab-theme-bar{display:block;height:6px;border-radius:3px}
.dsh-lingualab-theme-bar.is-long{width:72%}
.dsh-lingualab-theme-bar.is-short{width:46%;height:5px}
.dsh-lingualab-theme-track{display:block;height:4px;border-radius:2px;overflow:hidden}
.dsh-lingualab-theme-track span{display:block;width:58%;height:100%;border-radius:2px}
.dsh-lingualab-theme-name{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-theme-name svg{flex:none;color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-theme-desc{font-size:11.5px;line-height:1.4;color:var(--dsw-alias-label-secondary,#61666b)}

/* A real input that cannot be seen: it stays focusable, so the label around it works from
   the keyboard, which \`display:none\` would break. */
.dsh-lingualab-visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;
  overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
label.dsh-lingualab-btn{position:relative}
label.dsh-lingualab-btn:focus-within{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:1px}
label.dsh-lingualab-btn.is-disabled{opacity:0.45;cursor:default;pointer-events:none}

/* ── video: the picture on the stage, the cards that stand in for it, the notices ──────────── */
/* One media element plays everything and lives in the picture box; with no picture the box is not displayed
   and the audio plays on. The stage keeps the shapes it had: shown puts the picture above the sentence,
   large gives it the whole stage (the sentence is hidden then), hidden leaves a chip. The screen colour is the
   picture's own black, not a theme colour: a video has no theme. */
.dsh-lingualab-videostage{flex:none;display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0}
.dsh-lingualab-videostage.is-empty{display:none}
.dsh-lingualab-videostage.is-shown{padding:20px 12px 0}
.dsh-lingualab-videostage.is-hidden{padding:14px 12px 0}
.dsh-lingualab-videostage.is-large{flex:1;min-height:0;padding:16px 0 8px}
.dsh-lingualab-picture{position:relative;flex:none;box-sizing:border-box;width:min(64%,720px);min-width:min(100%,300px);
  aspect-ratio:16/9;max-height:42vh;border-radius:12px;overflow:hidden;background:#0e100f}
.dsh-lingualab-picture.is-off{display:none}
.dsh-lingualab-videostage.is-large .dsh-lingualab-picture{flex:1;min-height:0;width:min(100%,1100px);max-height:none;aspect-ratio:auto}
.dsh-lingualab-video{display:block;width:100%;height:100%;object-fit:contain;background:#0e100f}
.dsh-lingualab-picture-time{position:absolute;left:12px;bottom:10px;font-size:11px;color:rgba(255,255,255,0.55);
  font-variant-numeric:tabular-nums;pointer-events:none}
.dsh-lingualab-picture-badge{position:absolute;left:14px;top:12px;display:inline-flex;align-items:center;height:24px;
  padding:0 10px;border-radius:999px;font-size:11.5px;color:rgba(255,255,255,0.86);background:rgba(0,0,0,0.5);pointer-events:none}
.dsh-lingualab-picture-peek{position:absolute;right:14px;bottom:12px;display:inline-flex;align-items:center;gap:6px;height:28px;
  padding:0 10px;border:0;border-radius:999px;cursor:pointer;font:inherit;font-size:12px;color:rgba(255,255,255,0.86);
  background:rgba(0,0,0,0.5);transition:background var(--ll-fade)}
.dsh-lingualab-picture-peek:hover{background:rgba(0,0,0,0.7)}
.dsh-lingualab-page .dsh-lingualab-picture-peek kbd{height:18px;min-width:18px;padding:0 5px;font-size:11px;font-weight:500;
  color:inherit;background:none;border:0.5px solid rgba(255,255,255,0.4);border-bottom-width:0.5px}
.dsh-lingualab-picture-caption{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);box-sizing:border-box;
  max-width:min(760px,90%);padding:8px 16px;border-radius:8px;font-size:calc(22px * var(--ll-stage-scale));font-weight:600;
  line-height:1.35;text-align:center;color:#fff;background:rgba(0,0,0,0.62);pointer-events:none}
.dsh-lingualab-videochip{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 12px;border-radius:999px;
  font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-videochip.is-button{cursor:pointer;transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-videochip.is-button:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-videocard{box-sizing:border-box;display:flex;flex-direction:column;gap:10px;width:min(64%,720px);
  min-width:min(100%,300px);min-height:min(342px,42vh);padding:18px;border-radius:12px;text-align:left;
  background:var(--dsw-alias-bg-layer-1,transparent);border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-videocard-icon{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex:none;
  border-radius:10px;color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent)}
.dsh-lingualab-videocard-icon.is-quiet{color:var(--dsw-alias-label-secondary,#61666b);
  background:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 7%,transparent)}
.dsh-lingualab-videocard-icon.is-warn{color:var(--dsw-alias-state-warn-primary,#f59e0b);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 14%,transparent)}
.dsh-lingualab-videocard-title{font-size:15px;font-weight:700}
.dsh-lingualab-videocard-sub{font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-videocard-sub.is-mono,.dsh-lingualab-videocard-body.is-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  word-break:break-all}
.dsh-lingualab-videocard-body{margin:0;font-size:12.5px;line-height:1.6;
  color:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 82%,transparent)}
.dsh-lingualab-videocard-note{font-size:11.5px;text-align:center;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-videocard-row{display:flex;justify-content:space-between;gap:8px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
.dsh-lingualab-videocard-code{display:flex;align-items:center;gap:8px;padding:8px 8px 8px 12px;border-radius:8px;
  background:var(--ll-wash);border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-videocard-code code{flex:1;min-width:0;font-size:12px;word-break:break-all;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.dsh-lingualab-videocard>.dsh-lingualab-btn:not(.is-small){height:36px;justify-content:center;border-radius:10px;font-size:13.5px}
.dsh-lingualab-videocard>.dsh-lingualab-btn.is-primary{font-weight:600}
.dsh-lingualab-bar.is-thick{height:6px;margin-top:6px}
.dsh-lingualab-bar.is-thick .dsh-lingualab-bar-fill{transition:width .4s ease}
.dsh-lingualab-notice{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:6;display:flex;align-items:center;
  gap:10px;box-sizing:border-box;min-height:44px;max-width:min(560px,calc(100% - 32px));padding:6px 8px 6px 14px;
  border-radius:12px;font-size:13px;background:var(--ll-surface);animation:ll-notice-in .16s ease-out;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 6px 20px rgba(0,0,0,0.12)}
@keyframes ll-notice-in{from{opacity:0;transform:translate(-50%,-6px)}to{opacity:1;transform:translate(-50%,0)}}
.dsh-lingualab-notice>svg{flex:none;color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-notice.is-mismatch{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 12%,var(--ll-surface));
  border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 35%,transparent)}
.dsh-lingualab-notice.is-mismatch>svg{color:var(--dsw-alias-state-warn-primary,#f59e0b)}
.dsh-lingualab-notice-text{flex:1;min-width:0}
.dsh-lingualab-notice-action{flex:none;height:28px;padding:0 10px;border:0;border-radius:8px;cursor:pointer;font:inherit;
  font-size:12.5px;font-weight:600;color:var(--dsw-alias-brand-primary,#0f1115);background:none;
  transition:background var(--ll-fade)}
.dsh-lingualab-notice-action:hover{background:var(--ll-hover)}
.dsh-lingualab-notice.is-mismatch .dsh-lingualab-notice-action{color:inherit}
.dsh-lingualab-episode-badges{display:inline-flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:6px;min-width:0}
.dsh-lingualab-videomark{display:inline-flex;align-items:center;gap:4px;flex:none;height:20px;padding:0 7px;border-radius:999px;
  font-size:11px;white-space:nowrap;color:var(--dsw-alias-label-secondary,#61666b);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-videomark.is-ready{border-color:transparent;color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 10%,transparent)}
.dsh-lingualab-segopt-sub{display:block;font-size:11px;font-weight:400;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-segopt-video{flex:none;display:inline-flex;color:var(--dsw-alias-brand-primary,#0f1115)}

/* ── shared bits ─────────────────────────────────────────────── */
.dsh-lingualab-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;word-break:break-all}
.dsh-lingualab-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsh-lingualab-card{border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));border-radius:12px;
  background:var(--dsw-alias-bg-layer-1,transparent);padding:12px 14px}
.dsh-lingualab-counter{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
`;
		//#endregion
		//#region src/client/shared/lib/usePresence.ts
		/**
		* Keep something on screen for as long as its way out takes.
		*
		* A panel that is rendered only while it is open disappears the instant it closes, which leaves
		* nothing to animate. `usePresence` splits "open" into the two things a transition needs: `mounted`,
		* which stays true for `ms` after `open` turns false so the element is still there to fade out, and
		* `shown`, which only turns true a couple of frames after the element is mounted so the browser has
		* painted its closed look first and the change to the open look runs as a transition instead of
		* being the first style it ever sees.
		*
		*   const { mounted, shown } = usePresence(open, 240)
		*   return mounted ? <div className={shown ? 'is-open' : ''} /> : null
		*
		* `ms` should match the CSS duration of the way out. Under `prefers-reduced-motion` the page's
		* stylesheet zeroes every transition, so the delay is zeroed here too and nothing lingers.
		*/
		/** Whether the reader asked the system for less motion. False where there is no `matchMedia` to ask. */
		function prefersReducedMotion() {
			return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
		}
		/** How long to keep an element mounted on its way out: `ms`, or nothing when motion is reduced. */
		function presenceDelay(ms, reducedMotion) {
			return reducedMotion ? 0 : Math.max(0, ms);
		}
		/**
		* @param open - whether the thing is open.
		* @param ms - how long its way out takes, in milliseconds.
		*/
		function usePresence(open, ms) {
			const [mounted, setMounted] = (0, react.useState)(open);
			/** True once the closed look has been painted; `shown` is this while open. */
			const [armed, setArmed] = (0, react.useState)(false);
			if (open && !mounted) setMounted(true);
			(0, react.useEffect)(() => {
				if (!open) return;
				let second = 0;
				const first = requestAnimationFrame(() => {
					second = requestAnimationFrame(() => setArmed(true));
				});
				return () => {
					cancelAnimationFrame(first);
					cancelAnimationFrame(second);
				};
			}, [open]);
			(0, react.useEffect)(() => {
				if (open || !mounted) return;
				const timer = setTimeout(() => {
					setMounted(false);
					setArmed(false);
				}, presenceDelay(ms, prefersReducedMotion()));
				return () => clearTimeout(timer);
			}, [
				open,
				mounted,
				ms
			]);
			return {
				mounted: mounted || open,
				shown: open && armed
			};
		}
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
		function PlusIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 3.2v9.6M3.2 8h9.6" })
			});
		}
		/** Three lines of text, the second one longer than the third: a note. */
		function LinesIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
				...props,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.2 4.4h9.6M3.2 8h9.6M3.2 11.6h6" })
			});
		}
		/** Two horizontal sliders, each with a knob: the settings. */
		function SettingsIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 5h6.4M12.1 5h1.4M2.5 11h1.4M7.1 11h6.4" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 10.5,
						cy: 5,
						r: 1.6
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: 5.5,
						cy: 11,
						r: 1.6
					})
				]
			});
		}
		/** A camera: the mark for a video; `off` draws it struck through, for a picture that is hidden or cannot play. */
		function VideoIcon({ off = false, ...props }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: 1.5,
						y: 3.5,
						width: 9,
						height: 9,
						rx: 1.5
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m10.5 7 4-2.5v7l-4-2.5z" }),
					off ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 2l12 12" }) : null
				]
			});
		}
		/** A warning triangle, for the card that says something is missing. */
		function WarnIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 2.5 14 13H2z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 6.5v3M8 11.5v.01" })]
			});
		}
		/** A stopwatch, for the notice that the blind watch has started. */
		function TimerIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
				...props,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: 8,
					cy: 8.5,
					r: 5.5
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 5.5v3l2 1.5M6.5 1.5h3" })]
			});
		}
		//#endregion
		//#region src/client/shared/ui/Segmented.tsx
		/** The control. */
		function Segmented({ options, value, onChange, label, size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `dsh-lingualab-segmented${size === "small" ? " is-small" : ""}`,
				role: "group",
				"aria-label": label,
				children: options.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: option.id === value ? "is-on" : "",
					"aria-pressed": option.id === value,
					onClick: () => onChange(option.id),
					children: [option.label, option.count === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-segmented-count",
						children: option.count
					})]
				}, option.id))
			});
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
		* Chinese display. Everything that is a setup step rather than a gesture (the A and
		* B marks, how many times an A-B loop repeats, the lead-in) lives in the 「更多」 menu, because a
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
			["1  2  3", "keyGrade"],
			["N", "keyColumn"],
			["C", "keyChinese"],
			["R", "keyReveal"],
			["V", "keyPicture"],
			["[  ]", "keySpeed"],
			["A  B", "keyMarks"],
			["T", "keyTiming"]
		];
		/** Labels for the four Chinese display modes, in the order they are offered. */
		const ZH_MODE_KEYS = {
			always: "zhAlways",
			dim: "zhDim",
			"active-only": "zhActiveOnly",
			hidden: "zhHidden"
		};
		/** The dictionary key of each picture state's name. */
		const PICTURE_KEYS = {
			shown: "pictureShown",
			large: "pictureLarge",
			hidden: "pictureHidden"
		};
		/** The row under the sentence. */
		const ControlBar = (0, react.forwardRef)(function ControlBar({ t, zhMode, onZhMode, kept, onToggleKeep, onRetime, picture = null, disabled = false }, handle) {
			const isPlaying = useMediaPlayer((state) => state.isPlaying);
			const speedIndex = useMediaPlayer((state) => state.speedIndex);
			const loopMode = useMediaPlayer((state) => state.loopMode);
			const repeats = useMediaPlayer((state) => state.repeats);
			const pointA = useMediaPlayer((state) => state.pointA);
			const pointB = useMediaPlayer((state) => state.pointB);
			const shadow = useMediaPlayer((state) => state.pauseAfterSentence);
			const leadIn = useMediaPlayer((state) => state.leadIn);
			const [menu, setMenu] = (0, react.useState)(false);
			const holder = (0, react.useRef)(null);
			const moreButton = (0, react.useRef)(null);
			const store = useMediaPlayer.getState;
			const closeMenu = () => {
				if (!menu) return false;
				setMenu(false);
				moreButton.current?.focus({ preventScroll: true });
				return true;
			};
			(0, react.useImperativeHandle)(handle, () => ({ closeMenu }));
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
								picture === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "dsh-lingualab-bar-btn is-on",
									onClick: picture.onCycle,
									title: t("pictureHint"),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VideoIcon, {
											size: 14,
											off: picture.mode === "hidden"
										}),
										" ",
										t("pictureLabel", { state: t(PICTURE_KEYS[picture.mode]) })
									]
								}),
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
									onKeyDown: (event) => {
										if (event.key !== "Escape" || !closeMenu()) return;
										event.preventDefault();
										event.stopPropagation();
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										ref: moreButton,
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
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												className: "dsh-lingualab-menu-row",
												title: t("leadInHint"),
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("leadIn") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
													className: "dsh-lingualab-bar-btn",
													value: String(leadIn),
													onChange: (event) => store().setLeadIn(Number(event.target.value)),
													children: LEAD_IN_CHOICES.map((seconds) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: seconds,
														children: seconds === 0 ? t("leadInOff") : `${String(seconds)} s`
													}, seconds))
												})]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "dsh-lingualab-btn",
												onClick: () => {
													setMenu(false);
													onRetime();
												},
												children: [
													t("keyTiming"),
													" ",
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "T" })
												]
											}),
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
		});
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
		* Between the first two sits the weekly pass the method asks for: how many kept sentences are
		* still being practised across the library, and a button that reviews them all in one go.
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
			if (!hasMedia(entry)) return t("pickerNoAudio");
			if (entry.subtitleEn !== null && entry.subtitleZh !== null) return t("subtitleBadgeBoth");
			if (entry.subtitleEn !== null) return t("subtitleBadgeEn");
			if (entry.subtitleZh !== null) return t("subtitleBadgeZh");
			return t("subtitleBadgeNone");
		}
		/**
		* What a card calls an episode: its title, and for one cut into segments how many of them
		* are finished, `S01E01 · 3 / 10 段`.
		*/
		function cardTitle(t, entry, summary) {
			if (summary.total === 0) return entry.title;
			return t("episodeSegments", {
				title: entry.title,
				n: summary.finished,
				total: summary.total
			});
		}
		/** Where listening stopped, in words: the time, and the segment when the episode has them. */
		function stoppedWord(t, entry, summary) {
			if (summary.entry === null) return null;
			const next = summary.next === summary.segment ? null : findSegment(entry.segments, summary.next);
			if (next !== null) return t("upNextSegment", { segment: segmentLabel(next) });
			const time = formatClock(summary.entry.at);
			const segment = findSegment(entry.segments, summary.segment);
			return segment === null ? t("stoppedAt", { time }) : t("stoppedAtSegment", {
				segment: segmentLabel(segment),
				time
			});
		}
		/** The badge tone for an episode: a full pair is good news, a bare file a warning, the rest neutral. */
		function subtitleTone(entry) {
			if (!hasMedia(entry)) return "plain";
			if (entry.subtitleEn !== null && entry.subtitleZh !== null) return "ok";
			if (entry.subtitleEn === null && entry.subtitleZh === null) return "warn";
			return "plain";
		}
		/**
		* The small mark on a card for an episode that has video: 「视频」, or 「视频 · 未准备」 while a video still
		* has to be prepared. An episode with no video has none, and nothing else about the card changes.
		*/
		function VideoMark({ t, entry }) {
			const mark = videoMarkOf(entry);
			if (mark === "none") return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: `dsh-lingualab-videomark${mark === "ready" ? " is-ready" : ""}`,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VideoIcon, { size: 11 }),
					" ",
					mark === "ready" ? t("videoMark") : t("videoMarkUnprepared")
				]
			});
		}
		/** The size an episode card shows: the audio's, or the video's for an episode that is only a video. */
		function sizeOf(entry) {
			return entry.audioBytes ?? entry.video?.bytes ?? null;
		}
		/** The home page of the panel. */
		function LibraryHome({ t, library, loading, importer, progress, currentId, current, opening, openError, onOpen, onFiles, onBrowse, onFolder, review, onReview }) {
			const playable = allEpisodes(library, current).filter(hasMedia);
			const lastHeard = (entry) => episodeProgress(progress, entry).entry?.updatedAt ?? 0;
			const resume = playable.find((entry) => entry.id === currentId) ?? [...playable].sort((a, b) => lastHeard(b) - lastHeard(a)).find((entry) => lastHeard(entry) > 0) ?? null;
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
								summary: episodeProgress(progress, resume),
								opening,
								onOpen
							}) : null,
							review !== null && review.total > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: "dsh-lingualab-reviewcard",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-reviewcard-icon",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StarIcon, {
											size: 18,
											filled: true
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dsh-lingualab-reviewcard-text",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("reviewHomeTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("reviewHomeSub", {
											count: review.total,
											episodes: review.episodes.length
										}) })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "dsh-lingualab-btn",
										onClick: onReview,
										disabled: opening,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlayIcon, { size: 13 }),
											" ",
											t("reviewHomeStart")
										]
									})
								]
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
										summary: episodeProgress(progress, entry),
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
		/**
		* The big "continue where you stopped" card.
		*
		* For an episode cut into segments the button continues the segment listened to most
		* recently; the page chooses it when it opens the episode, so this card only says where
		* that is.
		*/
		function ResumeCard({ t, entry, summary, opening, onOpen }) {
			const { fraction } = summary;
			const progress = summary.entry;
			const stopped = stoppedWord(t, entry, summary);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dsh-lingualab-resume",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-resume-label",
						children: progress === null ? t("homeStart") : t("homeContinue")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: "dsh-lingualab-resume-title",
						children: cardTitle(t, entry, summary)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-resume-meta",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: subtitleWord(t, entry) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: formatBytes(sizeOf(entry)) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VideoMark, {
								t,
								entry
							}),
							entry.notes.count > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								t("notesKept"),
								" ",
								entry.notes.count
							] }) : null,
							stopped !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: stopped }) : null
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
		function EpisodeRow({ t, entry, summary, disabled, onOpen }) {
			const { fraction } = summary;
			const stopped = stoppedWord(t, entry, summary);
			const title = cardTitle(t, entry, summary);
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
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-lingualab-episode-badges",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VideoMark, {
								t,
								entry
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `dsh-lingualab-badge is-${subtitleTone(entry)}`,
								children: subtitleWord(t, entry)
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-episode-title",
						title,
						children: title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-pick-sub",
						children: [
							formatBytes(sizeOf(entry)),
							entry.notes.count > 0 ? ` · ${t("notesKept")} ${String(entry.notes.count)}` : "",
							stopped !== null ? ` · ${stopped}` : ""
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
		*     audio to look at a word would cost the next sentence. Dragging across words, or
		*     `Shift`-clicking a second one, picks the phrase between them, because a collocation
		*     is often the thing worth keeping; it is kept as one `[her skirt]`. Once kept, the
		*     popover's 「已记下」 takes it out again.
		*   · **Shadowing hides the English.** While the pause-after-sentence mode is on, the
		*     line is blurred until the sentence has ended (or you press R), so the first thing
		*     you do is say it from what you heard, and the text is the answer key.
		*   · **Nothing is a blank.** No subtitles, no audio and "finished" each get a message
		*     that says what to do next, because an empty stage looks like a crash.
		*
		* The sentence's time range is also a button: it opens the strip that moves the sentence's
		* start and end, because the range is where a reader looks when a loop clips a word.
		*/
		/** Past this many characters the sentence is set a size smaller so it still fits. */
		const LONG_LINE = 90;
		/** How long a confirmation ("copied") stays on the popover. */
		const CONFIRM_MS = 1400;
		/** A span from two token indexes in either order. */
		function spanOf(one, two) {
			return {
				from: Math.min(one, two),
				to: Math.max(one, two)
			};
		}
		/**
		* The classes that tint a word inside the picked span. Only the span's two ends are rounded, so
		* the words and the gaps between them read as one band rather than a row of separate pills.
		*/
		function wordMark(span, index) {
			if (span === null || index < span.from || index > span.to) return "";
			return ` is-pinned${index === span.from ? " is-from" : ""}${index === span.to ? " is-to" : ""}`;
		}
		/** The centre of the practice view. */
		function Stage({ t, cues, activeIndex, zhMode, masked, onReveal, onToggleWord, hasWord, loading, hasAudio, onRetime, retiming }) {
			const cue = cues[activeIndex];
			const previous = cues[activeIndex - 1];
			const next = cues[activeIndex + 1];
			const lines = cue === void 0 ? null : splitCue(cue);
			const block = (0, react.useRef)(null);
			const [pinned, setPinned] = (0, react.useState)(null);
			/** The words under a drag that has not been let go yet. */
			const [dragging, setDragging] = (0, react.useState)(null);
			/**
			* Where the drag started, the word it is over now and the sentence it is in; read when the
			* button comes up, and dropped then when the sentence has moved on under it.
			*/
			const drag = (0, react.useRef)(null);
			const [done, setDone] = (0, react.useState)(null);
			const timer = (0, react.useRef)(null);
			/** The sentence on stage, for a handler that outlives the render it was made in. */
			const shown = (0, react.useRef)(activeIndex);
			const close = (0, react.useCallback)(() => {
				setPinned(null);
				setDragging(null);
				setDone(null);
			}, []);
			const [owner, setOwner] = (0, react.useState)(activeIndex);
			if (owner !== activeIndex) {
				setOwner(activeIndex);
				if (pinned !== null || dragging !== null) close();
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
			(0, react.useEffect)(() => {
				shown.current = activeIndex;
			}, [activeIndex]);
			const confirm = (kind) => {
				setDone(kind);
				if (timer.current !== null) clearTimeout(timer.current);
				timer.current = setTimeout(() => setDone(null), CONFIRM_MS);
			};
			/** Pin the popover over the words from one token to another, in either order. */
			const settle = (one, two) => {
				const host = block.current;
				if (host === null || cue === void 0) return;
				const span = spanOf(one, two);
				const first = host.querySelector(`[data-token="${String(span.from)}"]`);
				const last = host.querySelector(`[data-token="${String(span.to)}"]`);
				if (first === null || last === null) return;
				const box = host.getBoundingClientRect();
				const start = first.getBoundingClientRect();
				const end = last.getBoundingClientRect();
				const word = tokenizeEnglish(splitCue(cue).english).slice(span.from, span.to + 1).map((token) => token.text).join("").trim();
				setDone(null);
				setDragging(null);
				const oneLine = Math.abs(start.top - end.top) < 2;
				setPinned({
					...span,
					word,
					left: (oneLine ? (start.left + end.right) / 2 : start.left + start.width / 2) - box.left,
					top: Math.min(start.top, end.top) - box.top
				});
			};
			/**
			* A press on a word: `Shift` extends the picked span to it, anything else starts a drag that
			* picks the word itself when the button comes up where it went down.
			*
			* The press is the browser's default too, a text selection, which would paint over the span and
			* copy the wrong thing, so it is cancelled.
			*/
			const press = (event, index) => {
				if (event.button !== 0) return;
				event.preventDefault();
				if (event.shiftKey && pinned !== null) {
					settle(pinned.from, index);
					return;
				}
				drag.current = {
					anchor: index,
					over: index,
					sentence: activeIndex
				};
				setDragging(spanOf(index, index));
				const release = () => {
					document.removeEventListener("mouseup", release);
					const held = drag.current;
					drag.current = null;
					if (held !== null && held.sentence === shown.current) settle(held.anchor, held.over);
				};
				document.addEventListener("mouseup", release);
			};
			/** The pointer moved onto another word while the button is down. */
			const sweep = (index) => {
				const held = drag.current;
				if (held === null) return;
				drag.current = {
					...held,
					over: index
				};
				setDragging(spanOf(held.anchor, index));
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
			const marked = dragging ?? pinned;
			const kept = pinned !== null && hasWord(pinned.word);
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
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `dsh-lingualab-stage-time${retiming ? " is-on" : ""}`,
							onClick: onRetime,
							title: t("timingOpen"),
							"aria-pressed": retiming,
							children: [
								formatClock(cue.start),
								" – ",
								formatClock(cue.end)
							]
						})]
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
									"data-token": index,
									className: `is-word${wordMark(marked, index)}`,
									onMouseDown: (event) => press(event, index),
									onMouseEnter: () => sweep(index),
									children: token.text
								}, index) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: marked !== null && index > marked.from && index < marked.to ? "is-between" : void 0,
									children: token.text
								}, index))
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
										className: `dsh-lingualab-pop-btn${kept ? " is-on" : ""}`,
										"aria-pressed": kept,
										title: kept ? t("wordRemoveHint") : void 0,
										onClick: () => {
											onToggleWord(pinned.word);
											if (kept) close();
											else confirm("added");
										},
										children: [kept ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 13 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteIcon, { size: 13 }), kept ? t("wordAdded") : t("wordAdd")]
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
		/** The picture key, shown only while the segment has a video, and placed before the reveal the way the design has it. */
		const PICTURE_HINT = {
			id: "v",
			caps: ["V"],
			label: "hintPicture"
		};
		/** The caps row. */
		function KeyHints({ t, flash, active, video = false }) {
			const hints = video ? [
				...HINTS.slice(0, 5),
				PICTURE_HINT,
				...HINTS.slice(5)
			] : HINTS;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `dsh-lingualab-keyhints${active ? "" : " is-idle"}`,
				children: hints.map((hint) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
		*
		* An episode cut into segments finishes one segment at a time. For a segment that is not the
		* last the card says the segment is done and its first action, focused, is the next segment;
		* only the last segment says the episode is done, and then the next thing is the next episode.
		* The counts are the segment's own, because a segment is the unit that was just listened to.
		*/
		/** The end-of-episode summary. */
		function FinishCard({ t, title, scope, sentences, kept, practising, nextTitle, onAgain, onNext, onHome, onClose }) {
			const heading = scope === "segment" ? t("finishSegmentTitle") : t("finishTitle");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-finish",
				role: "dialog",
				"aria-label": heading,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-finish-card",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-finish-badge",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 22 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: heading }),
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
										t(scope === "segment" ? "finishNextSegment" : "finishNext", { title: nextTitle })
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
		//#region src/client/widgets/notes-panel/ui/NoteEditor.tsx
		/**
		* The editor for one kept sentence's note: a box with a label, a text field and a footer.
		*
		* The note may run over several lines (it is stored with each break as `<br>`, see the notes
		* format), so the field is a textarea that grows with what is typed, from three lines up to eight and
		* then scrolls. `Enter` adds a line; `Ctrl` or `Cmd` with `Enter` saves, and `Esc` throws the edit
		* away. Leaving the field saves too, so a click elsewhere does not lose what was typed; the two
		* buttons hold the focus on mouse-down for that reason (see `holdFocus`), otherwise the field would
		* save before 「取消」 got its click.
		*
		* Every key stops here: the page reads shortcuts on its container, and a space or an `S` typed into
		* a note must not play or keep a sentence.
		*/
		/**
		* Keep the focus where it is while a button is pressed.
		*
		* Preventing the default is not enough on its own: the page's container takes the focus back on
		* every mouse-down that is not in a field (so the shortcuts keep working), and that would blur the
		* field and save before 「取消」 got its click. So the press stops here too.
		*/
		function holdFocus(event) {
			event.preventDefault();
			event.stopPropagation();
		}
		/** The editor, focused with the caret at the end of the text. */
		function NoteEditor({ t, initial, onSave, onCancel }) {
			const [draft, setDraft] = (0, react.useState)(initial);
			const field = (0, react.useRef)(null);
			/** Whether the editor has been answered, so the blur that closing it causes does not answer it twice. */
			const settled = (0, react.useRef)(false);
			const id = (0, react.useId)();
			(0, react.useLayoutEffect)(() => {
				const element = field.current;
				if (element === null) return;
				element.style.height = "auto";
				element.style.height = `${String(element.scrollHeight)}px`;
			}, [draft]);
			(0, react.useEffect)(() => {
				const element = field.current;
				if (element === null) return;
				element.focus({ preventScroll: true });
				element.setSelectionRange(element.value.length, element.value.length);
			}, []);
			/**
			* Answer the editor once. When the answer came from a key or one of the buttons the field still
			* has the focus, and it is about to be unmounted, which would drop the focus to the document and
			* leave the page's shortcuts dead; it goes back to the page instead. A save from leaving the field
			* leaves the focus wherever the click put it.
			*/
			const settle = (answer) => {
				if (settled.current) return;
				settled.current = true;
				const element = field.current;
				if (element !== null && document.activeElement === element) element.closest(".dsh-lingualab-page")?.focus({ preventScroll: true });
				answer();
			};
			const save = () => settle(() => onSave(draft));
			const cancel = () => settle(onCancel);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-editor",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						className: "dsh-lingualab-editor-label",
						htmlFor: id,
						children: t("notesNoteLabel")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						id,
						ref: field,
						rows: 3,
						value: draft,
						placeholder: t("notesEditorPlaceholder"),
						onChange: (event) => setDraft(event.target.value),
						onBlur: save,
						onKeyDown: (event) => {
							event.stopPropagation();
							if (event.nativeEvent.isComposing) return;
							if (event.key === "Escape") {
								event.preventDefault();
								cancel();
							} else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
								event.preventDefault();
								save();
							}
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-editor-foot",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-editor-hint",
								children: t("notesEditorHint")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-btn is-small is-ghost",
								onMouseDown: holdFocus,
								onClick: cancel,
								title: "Esc",
								children: t("cancel")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-btn is-small is-primary",
								onMouseDown: holdFocus,
								onClick: save,
								children: t("save")
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/widgets/notes-panel/ui/NotesPanel.tsx
		/**
		* The right column's 「收藏」 view: the sentences you kept, each with one grade.
		*
		* It takes the subtitle list's place rather than sliding over the page, so the stage and the
		* transport stay in reach while you go through what you kept: clicking a card puts its sentence
		* on stage and loops it, as clicking a subtitle line plays one, and `Space` pauses it as anywhere
		* else. Only the card of the sentence on stage is open. Its note, its words and its grade show
		* there, which keeps the rest of the column a list of sentences rather than a wall of controls.
		*
		* A sentence has one state, set by grading it (see `Grade`): 「新收藏」 until it is graded, then
		* 「记住了」, 「模糊」 or 「没记住」. The three filters read off that state, so a sentence graded
		* 「记住了」 leaves 「还在练」 without being deleted, which is what the old seven-phrase ceiling was
		* after: a short working set, chosen while listening rather than by ticking boxes afterwards.
		*
		* An episode cut into segments keeps all its kept sentences in one list, grouped under a heading
		* per segment in play order. Replaying a card from another segment is the page's to do (it has to
		* open that segment first), so a card only says which phrase to replay.
		*/
		/** How long the undo stays on screen. */
		const UNDO_MS = 6e3;
		/** A group's heading: the segment's number and title, or the bare id for a segment that is gone. */
		function segmentName(segments, id) {
			const segment = findSegment(segments, id);
			return segment === null ? id : segmentLabel(segment);
		}
		/** The 「收藏」 column. */
		function NotesPanel({ t, notes, segments, switcher, currentIndex, onReplay, onReview, reviewing }) {
			const [view, setView] = (0, react.useState)("active");
			const [editing, setEditing] = (0, react.useState)(null);
			const [removed, setRemoved] = (0, react.useState)(null);
			const timer = (0, react.useRef)(null);
			const listRef = (0, react.useRef)(null);
			const currentRef = (0, react.useRef)(null);
			const playing = useMediaPlayer((player) => player.isPlaying);
			(0, react.useEffect)(() => () => {
				if (timer.current !== null) clearTimeout(timer.current);
			}, []);
			(0, react.useEffect)(() => {
				const list = listRef.current;
				const card = currentRef.current;
				if (list === null || card === null) return;
				const top = card.offsetTop;
				if (top >= list.scrollTop && top + card.offsetHeight <= list.scrollTop + list.clientHeight) return;
				list.scrollTo({ top: Math.max(0, top - 12) });
			}, [currentIndex]);
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
			const order = segments.map((segment) => segment.id);
			const rows = inPlayOrder(notes.phrases.map((phrase, index) => ({
				phrase,
				index,
				at: phrase.at,
				segment: phrase.segment
			})).filter(({ phrase }) => view === "all" ? true : view === "done" ? phrase.done : !phrase.done), order);
			const groups = groupBySegment(rows, order);
			/** Words are kept in the note as [word]; editing the text must not lose them. */
			const commit = (index, phrase, words, value) => {
				const note = [value.replace(/\r/g, "").trim(), ...words.map((word) => `[${word}]`)].filter((part) => part.length > 0).join(" ");
				if (note !== phrase.note) notes.update(index, { note });
				setEditing(null);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: "dsh-lingualab-transcript is-kept",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-transcript-head",
						children: [
							switcher,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dsh-lingualab-btn is-primary is-small",
								onClick: onReview,
								disabled: activeCount === 0 || reviewing,
								title: t("reviewStartHint"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlayIcon, { size: 12 }),
									" ",
									t("reviewStart")
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-kept-filter",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Segmented, {
							size: "small",
							label: t("notes"),
							value: view,
							onChange: setView,
							options: [
								{
									id: "active",
									label: t("viewActive"),
									count: activeCount
								},
								{
									id: "done",
									label: t("viewDone"),
									count: doneCount
								},
								{
									id: "all",
									label: t("viewAll"),
									count: notes.phrases.length
								}
							]
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-notes-body",
						ref: listRef,
						children: [
							notes.phrases.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-empty is-center",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StarIcon, { size: 22 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("notesEmpty") })]
							}) : null,
							notes.phrases.length > 0 && rows.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-empty is-center",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 22 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: view === "active" ? t("notesAllDone") : t("notesNoneHere") })]
							}) : null,
							groups.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [group.segment === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-notes-group",
								children: segmentName(segments, group.segment)
							}), group.rows.map(({ phrase, index }) => {
								const grade = gradeOf(phrase);
								const open = index === currentIndex;
								const { words, text } = splitNote(phrase.note);
								const chipPlaying = open && playing;
								const chipLabel = open ? playing ? t("notesPause") : t("notesPlay") : t("notesReplay");
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									ref: open ? currentRef : null,
									className: `dsh-lingualab-note${open ? " is-open" : ""}${phrase.done ? " is-done" : ""}`,
									onClick: () => {
										if (!open) onReplay(phrase);
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dsh-lingualab-note-top",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: `dsh-lingualab-note-at${chipPlaying ? " is-playing" : ""}`,
													onClick: (event) => {
														event.stopPropagation();
														if (open) useMediaPlayer.getState().toggle();
														else onReplay(phrase);
													},
													"aria-pressed": open ? playing : void 0,
													"aria-label": chipLabel,
													title: chipLabel,
													children: [
														chipPlaying ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PauseIcon, { size: 10 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlayIcon, { size: 10 }),
														" ",
														formatClock(phrase.at)
													]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: `dsh-lingualab-grade is-${grade}`,
													children: t(GRADE_LABELS[grade])
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
												open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: "dsh-lingualab-icon-btn is-small is-danger",
													title: t("notesDelete"),
													"aria-label": t("notesDelete"),
													onClick: () => remove(phrase, index),
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrashIcon, {})
												}) : text.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "dsh-lingualab-note-has",
													role: "img",
													"aria-label": t("notesHasNote"),
													title: t("notesHasNote"),
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LinesIcon, { size: 13 })
												}) : null
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "dsh-lingualab-note-text",
											children: phrase.text
										}),
										open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											phrase.zh.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "dsh-lingualab-note-zh",
												children: phrase.zh
											}) : null,
											words.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "dsh-lingualab-memo-words",
												children: words.map((word) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "dsh-lingualab-word-chip",
													children: [word, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: "dsh-lingualab-word-chip-x",
														title: t("wordRemove", { word }),
														"aria-label": t("wordRemove", { word }),
														onClick: () => notes.update(index, { note: removeWordFromNote(phrase.note, word) }),
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, { size: 10 })
													})]
												}, word))
											}) : null,
											editing === index ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteEditor, {
												t,
												initial: text,
												onSave: (value) => commit(index, phrase, words, value),
												onCancel: () => setEditing(null)
											}) : text.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "dsh-lingualab-memo-text",
												title: t("notesEdit"),
												onClick: () => setEditing(index),
												children: text
											}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "dsh-lingualab-memo-add",
												onClick: () => setEditing(index),
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlusIcon, { size: 13 }),
													" ",
													t("notesAddNote")
												]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "dsh-lingualab-grades",
												role: "group",
												"aria-label": t("keyGrade"),
												children: GIVEN_GRADES.map((given) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: `dsh-lingualab-grade-btn is-${given}${grade === given ? " is-on" : ""}`,
													"aria-pressed": grade === given,
													onClick: () => notes.update(index, withGrade(phrase, given)),
													children: [
														t(GRADE_LABELS[given]),
														" ",
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: gradeKey(given) })
													]
												}, given))
											})
										] }) : null
									]
								}, `${phrase.segment ?? ""}-${phrase.at}-${index}`);
							})] }, group.segment ?? ""))
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
		//#region src/client/widgets/review-strip/ui/ReviewStrip.tsx
		/**
		* The strip above the stage while a review runs: where you are in the queue, and the grades.
		*
		* The sentence itself is on the stage below, its English hidden until you ask for it, and loops
		* there; the strip only says which one of how many it is, where it is from, and offers the three
		* grades, the skip and the way out. The same keys work without it: `1` to `3`, `→`, `Esc`.
		*/
		/** The strip. */
		function ReviewStrip({ t, position, total, source, ready, onGrade, onSkip, onBack, onExit }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-review",
				role: "group",
				"aria-label": t("reviewStart"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-pill",
						children: t("reviewProgress", {
							n: position,
							total
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-review-source",
						title: source,
						children: source
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
					GIVEN_GRADES.map((grade) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `dsh-lingualab-grade-btn is-${grade}`,
						onClick: () => onGrade(grade),
						disabled: !ready,
						children: [
							t(GRADE_LABELS[grade]),
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: gradeKey(grade) })
						]
					}, grade)),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-pop-btn",
						onClick: onBack,
						disabled: position <= 1,
						title: "←",
						children: t("reviewBack")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dsh-lingualab-pop-btn",
						onClick: onSkip,
						title: "→",
						children: [
							t("reviewSkip"),
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "→" })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-icon-btn is-small",
						onClick: onExit,
						title: `${t("reviewExit")} (Esc)`,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
					})
				]
			});
		}
		//#endregion
		//#region src/client/widgets/review-strip/ui/ReviewFinish.tsx
		/**
		* What the page says when a review reaches the end of its queue.
		*
		* It counts the grades given, and offers the one next move the method asks for: another pass
		* over the sentences graded 「没记住」, while they are still fresh. Sentences passed over are
		* counted too, and those whose episode could not be opened are named apart, so a short count is
		* never a mystery.
		*/
		/** The end-of-review card. */
		function ReviewFinish({ t, tally, onAgain, onExit }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-lingualab-finish",
				role: "dialog",
				"aria-label": t("reviewFinishTitle"),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-lingualab-finish-card",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-finish-badge",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 22 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("reviewFinishTitle") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
							className: "dsh-lingualab-finish-stats is-four",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: tally.got }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t("gradeGot") })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: tally.fuzzy }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t("gradeFuzzy") })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: tally.notyet }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t("gradeNotYet") })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: tally.skipped }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t("reviewSkipped") })] })
							]
						}),
						tally.gone > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsh-lingualab-hint",
							children: t("reviewGone", { count: tally.gone })
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-actions",
							style: { justifyContent: "center" },
							children: [tally.notyet > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-btn is-primary is-large",
								onClick: onAgain,
								autoFocus: true,
								children: t("reviewAgain", { count: tally.notyet })
							}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `dsh-lingualab-btn is-large${tally.notyet > 0 ? "" : " is-primary"}`,
								onClick: onExit,
								autoFocus: tally.notyet === 0,
								children: t("reviewExit")
							})]
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/widgets/segment-picker/ui/SegmentPicker.tsx
		/**
		* The button in the top bar that lists the segments of an episode, and the list itself.
		*
		* An episode cut into scenes has a dozen of them and the reader moves between them: back to
		* the one with the sentence they could not catch, ahead to the one they have not heard. So the
		* list shows every segment at once, marks the ones already finished, and works from the
		* keyboard the way a listbox does: the arrows move, Enter chooses, Home and End jump.
		*
		* Whether the list is open is the page's business, not this widget's. The page's keyboard
		* handler gives Escape to the topmost layer, and this list is one of those layers, so it
		* closes through the same chain as the notes drawer and the finish card instead of keeping a
		* second state that Escape would have to know about. The keys this list handles stop here, so
		* a space bar meant for the list never reaches the page and starts playback behind it.
		*/
		/** The segment button and, while it is open, the list under it. */
		function SegmentPicker({ t, segments, currentId, finished, open, onToggle, onClose, onSelect }) {
			const holder = (0, react.useRef)(null);
			const current = segments.find((segment) => segment.id === currentId) ?? segments[0];
			(0, react.useEffect)(() => {
				if (!open) return;
				const onDown = (event) => {
					if (holder.current !== null && !holder.current.contains(event.target)) onClose();
				};
				window.addEventListener("mousedown", onDown);
				return () => window.removeEventListener("mousedown", onDown);
			}, [open, onClose]);
			if (current === void 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "dsh-lingualab-seg-holder",
				ref: holder,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `dsh-lingualab-chip${open ? " is-on" : ""}`,
					"aria-haspopup": "listbox",
					"aria-expanded": open,
					onClick: onToggle,
					title: t("segmentsTitle"),
					children: [t("segmentsChip", {
						n: current.index,
						total: segments.length
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `dsh-lingualab-chevron${open ? " is-open" : ""}`,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronIcon, { size: 12 })
					})]
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SegmentList, {
					t,
					segments,
					currentId: current.id,
					finished,
					onSelect
				}) : null]
			});
		}
		/** The list: focused when it opens, with the segment on screen as the one the arrows start from. */
		function SegmentList({ t, segments, currentId, finished, onSelect }) {
			const base = (0, react.useId)();
			const list = (0, react.useRef)(null);
			const [active, setActive] = (0, react.useState)(() => Math.max(0, segments.findIndex((segment) => segment.id === currentId)));
			const optionId = (index) => `${base}-${String(index)}`;
			(0, react.useEffect)(() => {
				list.current?.focus({ preventScroll: true });
			}, []);
			(0, react.useEffect)(() => {
				document.getElementById(`${base}-${String(active)}`)?.scrollIntoView({ block: "nearest" });
			}, [active, base]);
			const move = (event, next) => {
				event.preventDefault();
				event.stopPropagation();
				setActive(Math.min(Math.max(0, next), segments.length - 1));
			};
			const onKeyDown = (event) => {
				if (event.ctrlKey || event.metaKey || event.altKey) return;
				switch (event.key) {
					case "ArrowDown":
						move(event, active + 1);
						return;
					case "ArrowUp":
						move(event, active - 1);
						return;
					case "Home":
						move(event, 0);
						return;
					case "End":
						move(event, segments.length - 1);
						return;
					case "Enter":
					case " ": {
						event.preventDefault();
						event.stopPropagation();
						const chosen = segments[active];
						if (chosen !== void 0) onSelect(chosen.id);
						return;
					}
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: list,
				className: "dsh-lingualab-seglist",
				role: "listbox",
				tabIndex: -1,
				"aria-label": t("segmentsTitle"),
				"aria-activedescendant": optionId(active),
				onKeyDown,
				children: segments.map((segment, index) => {
					const isCurrent = segment.id === currentId;
					const isDone = finished.has(segment.id);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						id: optionId(index),
						role: "option",
						"aria-selected": isCurrent,
						className: `dsh-lingualab-segopt${index === active ? " is-active" : ""}${isCurrent ? " is-current" : ""}`,
						onMouseEnter: () => setActive(index),
						onClick: () => onSelect(segment.id),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-segopt-name",
								title: segmentLabel(segment),
								children: segmentLabel(segment)
							}),
							isCurrent ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-segopt-now",
								children: t("segmentCurrent")
							}) : null,
							isDone ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-lingualab-segopt-done",
								title: t("segmentFinished"),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-visually-hidden",
									children: t("segmentFinished")
								})]
							}) : null
						]
					}, segment.id);
				})
			});
		}
		//#endregion
		//#region src/client/widgets/settings-panel/ui/RadioGroup.tsx
		/** How far an arrow key moves the choice, or `null` for a key the group does not read. */
		function stepOf(key) {
			if (key === "ArrowRight" || key === "ArrowDown") return 1;
			if (key === "ArrowLeft" || key === "ArrowUp") return -1;
			return null;
		}
		/** The control. */
		function RadioGroup({ label, value, options, onChange, className, optionClassName, render }) {
			const onKeyDown = (event) => {
				const step = stepOf(event.key);
				const jump = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : null;
				if (step === null && jump === null) return;
				const buttons = Array.from(event.currentTarget.querySelectorAll("[role=\"radio\"]"));
				const focused = buttons.findIndex((button) => button === document.activeElement);
				const from = focused >= 0 ? focused : options.indexOf(value);
				const to = jump ?? (from + (step ?? 0) + options.length) % options.length;
				const next = options[to];
				if (next === void 0) return;
				event.preventDefault();
				onChange(next);
				buttons[to]?.focus({ preventScroll: true });
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className,
				role: "radiogroup",
				"aria-label": label,
				onKeyDown,
				children: options.map((option) => {
					const checked = option === value;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						role: "radio",
						"aria-checked": checked,
						tabIndex: checked ? 0 : -1,
						className: `${optionClassName ?? ""}${checked ? " is-on" : ""}`.trim(),
						onClick: () => onChange(option),
						children: render(option, checked)
					}, option);
				})
			});
		}
		/** The dictionary key of each choice's label. */
		const APPEARANCE_KEYS = {
			auto: "settingsAppearanceAuto",
			light: "settingsAppearanceLight",
			dark: "settingsAppearanceDark"
		};
		const STAGE_SIZE_KEYS = {
			s: "settingsStageSmall",
			m: "settingsStageMedium",
			l: "settingsStageLarge"
		};
		const THEME_NAME_KEYS = {
			dsh: "themeDshName",
			ink: "themeInkName",
			pine: "themePineName",
			paper: "themePaperName",
			dusk: "themeDuskName",
			contrast: "themeContrastName"
		};
		const THEME_DESC_KEYS = {
			dsh: "themeDshDesc",
			ink: "themeInkDesc",
			pine: "themePineDesc",
			paper: "themePaperDesc",
			dusk: "themeDuskDesc",
			contrast: "themeContrastDesc"
		};
		/** A theme in miniature, painted in its own colours: a page with a line of text, a quiet line and a progress bar. */
		function Preview({ palette }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "dsh-lingualab-theme-preview",
				"aria-hidden": true,
				style: {
					background: palette.bg,
					borderColor: palette.b2
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsh-lingualab-theme-line",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-theme-dot",
							style: { background: palette.brand }
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-lingualab-theme-bar is-long",
							style: { background: palette.label }
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-theme-bar is-short",
						style: { background: palette.sec }
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-theme-track",
						style: { background: palette.b2 },
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: { background: palette.brand } })
					})
				]
			});
		}
		/** The drawer, mounted from the moment it opens until it has finished leaving. */
		function SettingsPanel({ t, open, onClose }) {
			const { mounted } = usePresence(open, 200);
			const drawer = (0, react.useRef)(null);
			const theme = useSettings((state) => state.theme);
			const appearance = useSettings((state) => state.appearance);
			const stageSize = useSettings((state) => state.stageSize);
			const setTheme = useSettings((state) => state.setTheme);
			const setAppearance = useSettings((state) => state.setAppearance);
			const setStageSize = useSettings((state) => state.setStageSize);
			const leadIn = useMediaPlayer((state) => state.leadIn);
			/** The cards show the palette that is in effect, so a card is what choosing it would give. */
			const scheme = resolveScheme(appearance, useHostDark());
			(0, react.useEffect)(() => {
				if (open) drawer.current?.focus({ preventScroll: true });
			}, [open]);
			(0, react.useEffect)(() => {
				if (open) return;
				const element = drawer.current;
				if (element === null || !element.contains(document.activeElement)) return;
				element.closest(".dsh-lingualab-page")?.focus({ preventScroll: true });
			}, [open]);
			if (!mounted) return null;
			const inertProps = open ? {} : { inert: "" };
			const onKeyDown = (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					onClose();
				}
				event.stopPropagation();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				ref: drawer,
				className: `dsh-lingualab-popover is-settings${open ? "" : " is-leaving"}`,
				role: "dialog",
				"aria-label": t("settingsTitle"),
				"aria-hidden": !open,
				tabIndex: -1,
				onKeyDown,
				...inertProps,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-drawer-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-lingualab-drawer-titles",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-drawer-title",
								children: t("settingsTitle")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-drawer-sub",
								children: t("settingsSub")
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-icon-btn",
							onClick: onClose,
							title: t("close"),
							"aria-label": t("close"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, { size: 16 })
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-settings-body",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								className: "dsh-lingualab-settings-label",
								children: t("settingsAppearance")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-setting-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-setting-name",
									children: t("settingsScheme")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RadioGroup, {
									label: t("settingsScheme"),
									className: "dsh-lingualab-segmented",
									options: APPEARANCES,
									value: appearance,
									onChange: setAppearance,
									render: (option) => t(APPEARANCE_KEYS[option])
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-setting-block",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-setting-name",
									children: t("settingsTheme")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RadioGroup, {
									label: t("settingsTheme"),
									className: "dsh-lingualab-theme-grid",
									optionClassName: "dsh-lingualab-theme",
									options: THEME_IDS,
									value: theme,
									onChange: setTheme,
									render: (option, checked) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Preview, { palette: paletteOf(option, scheme) }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "dsh-lingualab-theme-name",
											children: [t(THEME_NAME_KEYS[option]), checked ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 14 }) : null]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dsh-lingualab-theme-desc",
											children: t(THEME_DESC_KEYS[option])
										})
									] })
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								className: "dsh-lingualab-settings-label",
								children: t("settingsSubtitles")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-setting-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-lingualab-setting-name",
									children: t("settingsStageSize")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RadioGroup, {
									label: t("settingsStageSize"),
									className: "dsh-lingualab-segmented",
									options: STAGE_SIZES,
									value: stageSize,
									onChange: setStageSize,
									render: (option) => t(STAGE_SIZE_KEYS[option])
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								className: "dsh-lingualab-settings-label",
								children: t("settingsPlayback")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "dsh-lingualab-setting-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dsh-lingualab-setting-text",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-setting-name",
										children: t("leadIn")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-setting-hint",
										children: t("settingsLeadInHint")
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
									className: "dsh-lingualab-select",
									value: String(leadIn),
									onChange: (event) => useMediaPlayer.getState().setLeadIn(Number(event.target.value)),
									children: LEAD_IN_CHOICES.map((seconds) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: seconds,
										children: seconds === 0 ? t("leadInOff") : `${String(seconds)} s`
									}, seconds))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("footer", {
						className: "dsh-lingualab-drawer-foot",
						children: t("settingsFootnote")
					})
				]
			});
		}
		//#endregion
		//#region src/client/widgets/step-tracker/ui/StepTracker.tsx
		/**
		* The five steps of the study method, as a chip with a drawer.
		*
		* The method is a timed ritual (blind watch, subtitle read, shadowing, next-day
		* review, weekly review) and the reason the earlier standalone app went unused was
		* that nothing in it knew which step you were on. This answers that one question.
		*
		* It is a chip rather than a card because it is not what you look at while listening:
		* a permanent panel spent a third of the page on something consulted twice a session,
		* and made every other block look equally important. It does not enforce anything —
		* no alarms, no locks, no scolding — and opening it never pauses the audio. Ticks and
		* elapsed seconds are per episode and are progress through today's material rather than
		* part of the notes file the agent reads. They are cached in this browser and shared
		* through the host, so another device shows the same ticks.
		*
		* The drawer is a header, one bar of five segments (a step fills its segment as its clock runs, and
		* all of it once ticked), and a vertical stepper. Exactly one step on this page is open at a time,
		* the one with a clock and its two buttons: the one that is running, else the one the reader
		* picked, else the first not yet done. The last two steps happen in the conversation, so they
		* only say so. The drawer slides out as it slid in, which is why it outlives `open` for a moment.
		*/
		/** The method's five steps, in order. */
		const STEPS = [
			{
				id: "blind",
				labelKey: "stepBlind",
				tipKey: "stepTipBlind",
				minutes: 22,
				inSession: true
			},
			{
				id: "read",
				labelKey: "stepRead",
				tipKey: "stepTipRead",
				minutes: 22,
				inSession: true
			},
			{
				id: "shadow",
				labelKey: "stepShadow",
				tipKey: "stepTipShadow",
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
		/** `0:19`, `22:04`: seconds as minutes and seconds. */
		function clockOf(seconds) {
			return `${String(Math.floor(seconds / 60))}:${String(seconds % 60).padStart(2, "0")}`;
		}
		/** How full a step's segment is, in percent: all of it once done, else the clock against the suggested time. */
		function fillOf(step, record) {
			if (record.done) return 100;
			if (!step.inSession) return 0;
			return Math.min(100, record.seconds / (step.minutes * 60) * 100);
		}
		/** The step whose timer the picture follows: the blind watch, which is the first one. */
		const BLIND_STEP = "blind";
		/** The chip plus, when open, the drawer. */
		function StepTracker({ t, episode, open, onToggle, onBlindRunning }) {
			const [records, setRecords] = (0, react.useState)(() => readSteps(episode));
			const [running, setRunning] = (0, react.useState)(null);
			/** The step the reader clicked, which is the open one unless a clock is running. */
			const [picked, setPicked] = (0, react.useState)(null);
			const { mounted } = usePresence(open, 200);
			const drawer = (0, react.useRef)(null);
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
			const blindRunning = running === BLIND_STEP;
			const report = (0, react.useRef)(onBlindRunning);
			(0, react.useEffect)(() => {
				report.current = onBlindRunning;
			}, [onBlindRunning]);
			(0, react.useEffect)(() => {
				report.current?.(blindRunning);
			}, [blindRunning]);
			(0, react.useEffect)(() => () => {
				report.current?.(false);
			}, []);
			(0, react.useEffect)(() => {
				if (open) return;
				const element = drawer.current;
				if (element === null || !element.contains(document.activeElement)) return;
				element.closest(".dsh-lingualab-page")?.focus({ preventScroll: true });
			}, [open]);
			const recordOf = (step) => records[step.id] ?? EMPTY;
			const done = STEPS.filter((step) => recordOf(step).done).length;
			/** A step the reader can open: one done on this page that is not done yet. */
			const openable = (step) => step.inSession && !recordOf(step).done;
			const firstOpenable = STEPS.find(openable)?.id ?? null;
			const pickedStep = STEPS.find((step) => step.id === picked);
			const openId = running ?? (pickedStep !== void 0 && openable(pickedStep) ? pickedStep.id : null) ?? firstOpenable;
			/** Tick a step, or take the tick back; a clock running on a step that is ticked stops. */
			const toggleDone = (step) => {
				const record = recordOf(step);
				if (running === step.id) setRunning(null);
				setPicked(null);
				persist({
					...records,
					[step.id]: {
						...record,
						done: !record.done
					}
				});
			};
			const metaOf = (step, record) => {
				const suggested = t("stepSuggested", { minutes: step.minutes });
				if (!step.inSession) return suggested;
				if (record.seconds === 0) return suggested;
				if (record.done) return t("stepTook", { clock: clockOf(record.seconds) });
				return `${suggested} · ${t("stepUsed", { clock: clockOf(record.seconds) })}`;
			};
			const inertProps = open ? {} : { inert: "" };
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
			}), mounted ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				ref: drawer,
				className: `dsh-lingualab-popover${open ? "" : " is-leaving"}`,
				"aria-hidden": !open,
				...inertProps,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-drawer-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-icon-btn",
							onClick: onToggle,
							title: t("close"),
							"aria-label": t("close"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, { size: 16 })
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-steps-bar",
						"aria-hidden": true,
						children: STEPS.map((step) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-steps-seg",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: { width: `${fillOf(step, recordOf(step)).toFixed(1)}%` } })
						}, step.id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-steps-body",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", {
							className: "dsh-lingualab-steps",
							children: STEPS.map((step, index) => {
								const record = recordOf(step);
								const isRunning = running === step.id;
								const expanded = openId === step.id && openable(step);
								const doneLabel = record.done ? t("stepUndone") : t("stepDone");
								const clock = clockOf(record.seconds);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									className: `dsh-lingualab-step${record.done ? " is-done" : ""}${expanded ? " is-open" : ""}`,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-lingualab-step-rail",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: `dsh-lingualab-step-check${record.done ? " is-on" : ""}`,
											"aria-pressed": record.done,
											"aria-label": doneLabel,
											title: doneLabel,
											onClick: () => toggleDone(step),
											children: record.done ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: index + 1 })
										}), index < STEPS.length - 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dsh-lingualab-step-line",
											"aria-hidden": true
										}) : null]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-lingualab-step-body",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "dsh-lingualab-step-row",
											disabled: !openable(step),
											onClick: () => setPicked(step.id),
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "dsh-lingualab-step-main",
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: "dsh-lingualab-step-label",
														children: t(step.labelKey)
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: "dsh-lingualab-step-meta",
														children: metaOf(step, record)
													})]
												}),
												isRunning && !expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "dsh-lingualab-step-pill",
													children: clock
												}) : null,
												step.inSession ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "dsh-lingualab-step-tag",
													children: t("stepInSession")
												})
											]
										}), expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dsh-lingualab-step-panel",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: "dsh-lingualab-step-clock",
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: clock }),
														/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["/ ", clockOf(step.minutes * 60)] }),
														step.tipKey === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
															className: "dsh-lingualab-step-tip",
															children: t(step.tipKey)
														})
													]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													className: "dsh-lingualab-step-progress",
													"aria-hidden": true,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: { width: `${fillOf(step, record).toFixed(1)}%` } })
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: "dsh-lingualab-step-actions",
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: `dsh-lingualab-btn is-primary${isRunning ? " is-running" : ""}`,
														onClick: () => setRunning(isRunning ? null : step.id),
														children: isRunning ? t("stepStop") : record.seconds > 0 ? t("stepResume") : t("stepStart")
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: "dsh-lingualab-btn",
														onClick: () => toggleDone(step),
														children: t("stepDone")
													})]
												})
											]
										}) : null]
									})]
								}, step.id);
							})
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("footer", {
						className: "dsh-lingualab-drawer-foot",
						children: t("stepsFootnote")
					})
				]
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
		*
		* The column is shared with the kept sentences; the switch between the two is the page's and
		* sits in this heading in place of a title.
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
		function SubtitlePanel({ t, switcher, cues, loading, activeIndex, selectedIndex, zhMode, notedIndexes, follow, onFollow, onSelect, onPlay, onKeep }) {
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
						switcher,
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
		/**
		* The window for a range and its neighbours.
		* @param range - the range being edited.
		* @param previous - the sentence before it, where it lands, or `null`.
		* @param next - the sentence after it, where it lands, or `null`.
		*/
		function timelineWindow(range, previous, next) {
			const from = Math.min(previous?.start ?? range.start - 1500, range.start);
			const to = Math.max(next?.end ?? range.end + 1500, range.end);
			return {
				from: Math.max(0, from),
				to: Math.max(to, Math.max(0, from) + 1)
			};
		}
		/** Where a time falls on the track, in percent, held to the track. */
		function percentAt(ms, bounds) {
			const span = bounds.to - bounds.from;
			return Math.min(100, Math.max(0, (ms - bounds.from) / span * 100));
		}
		/** A range as a block on the track. */
		function blockOf(range, bounds) {
			const left = percentAt(range.start, bounds);
			return {
				left,
				width: Math.max(0, percentAt(range.end, bounds) - left)
			};
		}
		/** How much of a sentence's end is replayed after the end moves. */
		const END_PREVIEW_MS = 1500;
		/** A neighbour's range for the timeline: where a push puts it, otherwise where the file has it. */
		function neighbour(cues, index, side, pushed, range, lrc) {
			const cue = cues[index];
			if (cue === void 0) return null;
			const moved = pushed.find((entry) => entry.side === side);
			if (moved !== void 0) return moved.after;
			const own = originalRange(cue);
			if (lrc && side === "previous") return {
				start: own.start,
				end: Math.max(own.start, range.start)
			};
			return own;
		}
		/** Drive the strip. */
		function useTimingEditor({ cues, tracks, episodeId, blocked, onSaved, onStale }) {
			/**
			* What the strip holds. The cue list it was opened on is kept with it: a new list (another
			* segment, or the same file read again) means the index names a different sentence, and the
			* session is over without anything having to clear it.
			*/
			const [state, setState] = (0, react.useState)(null);
			const [saving, setSaving] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const duration = useMediaPlayer((player) => player.duration);
			const pinned = useMediaPlayer((player) => player.editWindow);
			const file = tracks.english?.file ?? null;
			const lrc = file !== null && isLrc(file);
			const session = (0, react.useMemo)(() => {
				if (state === null || state.cues !== cues || pinned === null || pinned.index !== state.index) return null;
				const cue = cues[state.index];
				if (cue === void 0) return null;
				const pushed = pushedNeighbours(cues, state.index, state.range, lrc);
				return {
					index: state.index,
					cue,
					range: state.range,
					base: initialRange(cue),
					focus: state.focus,
					limits: retimeLimits(cues, state.index, lrc, duration > 0 ? Math.round(duration * 1e3) : null),
					lrc,
					pushed,
					previous: neighbour(cues, state.index - 1, "previous", pushed, state.range, lrc),
					next: neighbour(cues, state.index + 1, "next", pushed, state.range, lrc)
				};
			}, [
				state,
				cues,
				pinned,
				lrc,
				duration
			]);
			/** Put a range on screen and in the player, and move the playhead to where the change is heard. */
			const apply = (0, react.useCallback)((index, range, focus, heard) => {
				setState({
					index,
					range,
					focus,
					cues
				});
				setError(null);
				const player = useMediaPlayer.getState();
				player.setEditWindow({
					index,
					start: range.start / 1e3,
					end: range.end / 1e3
				});
				if (heard === "start") player.seek(range.start / 1e3);
				if (heard === "end") player.seek(Math.max(range.start, range.end - END_PREVIEW_MS) / 1e3);
			}, [cues]);
			const open = (0, react.useCallback)((index) => {
				const cue = cues[index];
				if (cue === void 0) return;
				apply(index, initialRange(cue), "start", "start");
				useMediaPlayer.getState().setPlaying(true);
			}, [cues, apply]);
			const close = (0, react.useCallback)(() => {
				setState(null);
				setError(null);
				useMediaPlayer.getState().setEditWindow(null);
			}, []);
			(0, react.useEffect)(() => () => useMediaPlayer.getState().setEditWindow(null), []);
			const setEdge = (0, react.useCallback)((edge, value) => {
				if (session === null || edge === "end" && !session.limits.endEditable) return;
				apply(session.index, moveEdge(session.range, edge, value, session.limits), edge, edge);
			}, [session, apply]);
			const nudge = (0, react.useCallback)((edge, deltaMs) => {
				if (session === null) return;
				setEdge(edge, (edge === "start" ? session.range.start : session.range.end) + deltaMs);
			}, [session, setEdge]);
			const toPlayhead = (0, react.useCallback)((edge) => setEdge(edge, useMediaPlayer.getState().currentTime * 1e3), [setEdge]);
			const reset = (0, react.useCallback)(() => {
				if (session === null) return;
				apply(session.index, session.base, session.focus, session.focus);
			}, [session, apply]);
			const setFocus = (0, react.useCallback)((edge) => {
				if (session === null) return;
				setState({
					index: session.index,
					range: session.range,
					focus: session.limits.endEditable ? edge : "start",
					cues
				});
			}, [session, cues]);
			const save = (0, react.useCallback)(() => {
				if (session === null || saving || blocked !== null || episodeId === null) return;
				const edits = timingEdits(cues, session.index, session.range, tracks.english, tracks.chinese);
				if (edits === null) return;
				if (session.range.start === session.base.start && session.range.end === session.base.end) {
					close();
					return;
				}
				setSaving(true);
				(async () => {
					const result = await saveSubtitleTiming(episodeId, edits);
					setSaving(false);
					if (!result.ok) {
						setError({
							reason: result.reason ?? "",
							stale: result.code === "stale"
						});
						return;
					}
					const saved = {
						index: session.index,
						cue: session.cue,
						before: session.base,
						after: session.range,
						pushed: session.pushed.flatMap((neighbour) => {
							const cue = cues[neighbour.index];
							return cue === void 0 ? [] : [{
								cue,
								before: neighbour.before,
								after: neighbour.after
							}];
						})
					};
					close();
					onSaved(saved);
				})();
			}, [
				session,
				saving,
				blocked,
				episodeId,
				cues,
				tracks,
				close,
				onSaved
			]);
			const reloadStale = (0, react.useCallback)(() => {
				close();
				onStale();
			}, [close, onStale]);
			const handleKey = (0, react.useCallback)((event) => {
				if (session === null) return false;
				const step = event.shiftKey ? 250 : 50;
				switch (event.key) {
					case "Tab":
						setFocus(session.focus === "start" ? "end" : "start");
						return true;
					case "ArrowLeft":
						nudge(session.focus, -step);
						return true;
					case "ArrowRight":
						nudge(session.focus, step);
						return true;
					case "i":
					case "I":
						toPlayhead("start");
						return true;
					case "o":
					case "O":
						toPlayhead("end");
						return true;
					case " ":
						useMediaPlayer.getState().toggle();
						return true;
					case "Enter":
						save();
						return true;
					case "Escape":
						close();
						return true;
					default: return true;
				}
			}, [
				session,
				setFocus,
				nudge,
				toPlayhead,
				save,
				close
			]);
			return {
				session,
				saving,
				error: error?.reason ?? null,
				stale: error?.stale ?? false,
				open,
				close,
				setFocus,
				nudge,
				toPlayhead,
				reset,
				save,
				reloadStale,
				handleKey
			};
		}
		//#endregion
		//#region src/client/widgets/timing-editor/ui/TimingStrip.tsx
		/**
		* The panel under the stage where one sentence's start and end are moved.
		*
		* It is a card with four parts. A header says what the loop is doing (the sentence repeats while the
		* panel is open, and the ear is the instrument: there is no waveform, see the note on editing a
		* sentence's timing) and closes the panel. A mini timeline shows the sentence before, the range
		* being edited, the sentence after and the playhead, so a moved edge is seen against its neighbours
		* as well as heard. Two edge cards, start and end, each hold the value, a nudge either way and a
		* "set to the playhead" button; the one with focus is the one the arrow keys move, and clicking a
		* card gives it focus. A footer lists the keys and has undo, cancel and save.
		*
		* An edge pushed into a neighbour moves the neighbour's shared edge too, and a bar under the cards
		* says where it goes, because that sentence is not on screen; the timeline draws the neighbour
		* where the push puts it.
		*
		* The panel opens and closes with a motion (a grid row growing from nothing, the card fading and
		* lifting in), so it stays mounted for the way out, drawn from the last session it held. While it
		* leaves it is inert: its buttons are not reachable and its keys are the page's again.
		*/
		/** How long the way out takes; the stylesheet's grid row and the card fade run for about this long. */
		const EXIT_MS = 240;
		/** `+0.10` or `−0.45`, a signed number of seconds with a true minus sign. */
		function formatDelta(ms) {
			return `${ms < 0 ? "−" : "+"}${(Math.abs(ms) / 1e3).toFixed(2)}`;
		}
		/** One edge: its label and how far it moved, its value, the nudges and the playhead button. */
		function EdgeCard({ t, editor, session, which }) {
			const value = which === "start" ? session.range.start : session.range.end;
			const delta = value - (which === "start" ? session.base.start : session.base.end);
			const editable = which === "start" || session.limits.endEditable;
			const focused = session.focus === which && editable;
			const label = which === "start" ? t("timingStart") : session.lrc ? t("timingEndLrc") : t("timingEnd");
			const inside = (action) => (event) => {
				event.stopPropagation();
				action();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `dsh-lingualab-timing-edge${focused ? " is-focus" : ""}${editable ? "" : " is-readonly"}`,
				onClick: editable ? () => editor.setFocus(which) : void 0,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-timing-edge-head",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-timing-label",
								children: label
							}),
							delta === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-timing-delta",
								children: t("timingDelta", { delta: formatDelta(delta) })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							editable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-timing-keys",
								"aria-hidden": true,
								children: t("timingNudgeKeys")
							}) : null
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-timing-edge-body",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-timing-value",
							onClick: editable ? () => editor.setFocus(which) : void 0,
							disabled: !editable,
							"aria-pressed": focused,
							children: formatClockMs(value)
						}), editable ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-lingualab-timing-step",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: inside(() => editor.nudge(which, -50)),
								title: t("timingEarlier"),
								"aria-label": t("timingEarlier"),
								children: `−${String(50)}`
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: inside(() => editor.nudge(which, 50)),
								title: t("timingLater"),
								"aria-label": t("timingLater"),
								children: `+${String(50)}`
							})]
						})] }) : null]
					}),
					editable ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dsh-lingualab-timing-ghost",
						onClick: inside(() => editor.toPlayhead(which)),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(UpIcon, { size: 12 }),
							" ",
							t("timingAtPlayhead"),
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: which === "start" ? "I" : "O" })
						]
					}) : null
				]
			});
		}
		/** The panel; renders nothing while no sentence is being edited and the way out is over. */
		function TimingStrip({ t, editor, blocked }) {
			const { mounted, shown } = usePresence(editor.session !== null, EXIT_MS);
			const playing = useMediaPlayer((player) => player.isPlaying);
			const currentTime = useMediaPlayer((player) => player.currentTime);
			const root = (0, react.useRef)(null);
			const [held, setHeld] = (0, react.useState)(null);
			if (editor.session !== null && (held?.session !== editor.session || held.blocked !== blocked)) setHeld({
				session: editor.session,
				blocked
			});
			(0, react.useEffect)(() => {
				if (shown) return;
				const element = root.current;
				if (element === null || !element.contains(document.activeElement)) return;
				element.closest(".dsh-lingualab-page")?.focus({ preventScroll: true });
			}, [shown]);
			const current = editor.session === null ? held : {
				session: editor.session,
				blocked
			};
			if (!mounted || current === null) return null;
			const { session } = current;
			const changed = session.range.start !== session.base.start || session.range.end !== session.base.end;
			const bounds = timelineWindow(session.range, session.previous, session.next);
			const range = blockOf(session.range, bounds);
			const previous = session.previous === null ? null : blockOf(session.previous, bounds);
			const next = session.next === null ? null : blockOf(session.next, bounds);
			const block = (place) => ({
				left: `${place.left.toFixed(2)}%`,
				width: `${place.width.toFixed(2)}%`
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: root,
				className: `dsh-lingualab-timing-wrap${shown ? " is-open" : ""}`,
				"aria-hidden": !shown,
				...shown ? {} : { inert: "" },
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-lingualab-timing-clip",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dsh-lingualab-timing",
						"aria-label": t("timingTitle"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-timing-row",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-timing-title",
										children: t("timingTitle")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: `dsh-lingualab-timing-status${playing ? "" : " is-paused"}`,
										role: "status",
										children: playing ? t("timingLooping") : t("timingPaused")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-icon-btn is-small",
										onClick: editor.close,
										title: t("timingClose"),
										"aria-label": t("timingClose"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, { size: 14 })
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-timing-line",
								"aria-hidden": true,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-lingualab-timing-track",
										children: [
											previous === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "dsh-lingualab-timing-block",
												style: block(previous)
											}),
											next === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "dsh-lingualab-timing-block",
												style: block(next)
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "dsh-lingualab-timing-block is-current",
												style: block(range)
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "dsh-lingualab-timing-head",
												style: { left: `${percentAt(currentTime * 1e3, bounds).toFixed(2)}%` }
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-timing-end is-from",
										children: formatClock(bounds.from / 1e3)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-timing-end is-to",
										children: formatClock(bounds.to / 1e3)
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-timing-edges",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EdgeCard, {
									t,
									editor,
									session,
									which: "start"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EdgeCard, {
									t,
									editor,
									session,
									which: "end"
								})]
							}),
							session.pushed.map((neighbour) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-timing-note",
								children: [neighbour.side === "previous" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BackIcon, { size: 13 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronIcon, { size: 13 }), neighbour.side === "previous" ? t("timingPushedPrevious", { time: formatClockMs(neighbour.after.end) }) : t("timingPushedNext", { time: formatClockMs(neighbour.after.start) })]
							}, neighbour.side)),
							current.blocked !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-timing-note is-warn",
								children: current.blocked
							}) : null,
							editor.error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-error",
								children: [
									editor.error,
									" ",
									editor.stale ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-btn",
										onClick: editor.reloadStale,
										children: t("timingReload")
									}) : null
								]
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-timing-foot",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dsh-lingualab-timing-hints",
										children: [
											session.limits.endEditable ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "Tab" }),
												" ",
												t("timingKeySwitch")
											] }) : null,
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "Shift" }),
												" ",
												t("timingKeyShift", { ms: 250 })
											] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "Space" }),
												" ",
												playing ? t("pause") : t("play")
											] })
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-btn is-ghost",
										onClick: editor.reset,
										disabled: !changed || editor.saving,
										children: t("timingReset")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-btn",
										onClick: editor.close,
										title: "Esc",
										children: t("timingCancel")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsh-lingualab-btn is-primary",
										onClick: editor.save,
										disabled: current.blocked !== null || editor.saving || !changed,
										title: "Enter",
										children: editor.saving ? `${t("saving")}…` : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 13 }),
											" ",
											t("timingSave"),
											" ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "Enter" })
										] })
									})
								]
							})
						]
					})
				})
			});
		}
		//#endregion
		//#region src/client/widgets/video-stage/ui/VideoStage.tsx
		/**
		* The video's place on the stage: the picture, or the card that says why there is none.
		*
		* One `<video>` element plays everything (see the media-player feature), and it lives here, inside the
		* practice view, so the page can put it where the picture goes. It is always rendered, because it is
		* also what plays an audio file; when there is no picture to show it is simply not displayed, and the
		* stage underneath looks as it always did.
		*
		* What the slot shows follows two things: the reader's choice of picture state and what the video is.
		*
		*   · **Playing a picture.** *Shown* puts it above the sentence at a modest size; *large* gives it the
		*     whole stage (the page hides the sentence then, for the blind-watch step), with a button and the
		*     `R` key to peek at the English of the current sentence as a caption that folds away when the next
		*     sentence starts; *hidden* shows only a small chip saying the sound still comes from the video.
		*   · **Not playing one.** A card in the same place says what is needed: prepare it, wait for it, install
		*     ffmpeg, or that only the sound can be had or that nothing can. The cards that only inform are shown in
		*     full the first time and then as a small label that opens them again; hiding the picture hides the
		*     cards too, leaving that label.
		*
		* The notice bar at the top of the practice view is also drawn here, since it speaks about the same things.
		*/
		/** How long "copied" stays on the copy button. */
		const COPIED_MS = 1400;
		/** Audio codecs a browser plays, so the card knows whether the sound or only the box is the trouble. */
		const BROWSER_AUDIO = [
			"aac",
			"opus",
			"mp3"
		];
		/** A codec name as it is written on a card: `hevc` becomes `HEVC`. */
		function codecName(codec) {
			return codec === null ? "?" : codec.toUpperCase();
		}
		/** The slot. */
		function VideoStage({ t, mediaRef, picture, playing, status, card, cardOpen, hasAudioFile, busy, eta, caption, onPeek, onPrepare, onCancel, onCardShow, onCardHide, onShowPicture }) {
			const time = useMediaPlayer((state) => state.currentTime);
			const mode = picture === "hidden" ? "hidden" : picture === "large" && playing ? "large" : "shown";
			const showScreen = playing && mode !== "hidden";
			const fullCard = card !== null && !playing && mode !== "hidden" && (!isInformational(card) || cardOpen);
			const chip = playing && mode === "hidden";
			const label = card === null || playing || fullCard ? null : isInformational(card) ? "unplayable" : "prepare";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `dsh-lingualab-videostage is-${!showScreen && !fullCard && !chip && label === null ? "empty" : mode}`,
				children: [
					chip ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-videochip",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VideoIcon, {
								size: 13,
								off: true
							}),
							t("pictureHiddenChip"),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "V" })
						]
					}) : null,
					label !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dsh-lingualab-videochip is-button",
						onClick: () => {
							if (mode === "hidden") onShowPicture();
							if (card !== null && isInformational(card)) onCardShow();
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VideoIcon, {
							size: 13,
							off: label === "unplayable"
						}), label === "unplayable" ? t("videoLabelUnplayable") : t("videoLabelPrepare")]
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `dsh-lingualab-picture${showScreen ? "" : " is-off"}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("video", {
							ref: mediaRef,
							className: "dsh-lingualab-video",
							playsInline: true,
							preload: "metadata"
						}), showScreen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							mode === "shown" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-picture-time",
								children: formatClock(time)
							}) : null,
							mode === "large" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-lingualab-picture-badge",
								children: t("pictureLargeBadge")
							}) : null,
							mode === "large" && caption !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-picture-caption",
								children: caption
							}) : null,
							mode === "large" && caption === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dsh-lingualab-picture-peek",
								onClick: onPeek,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "R" }),
									" ",
									t("peekSentence")
								]
							}) : null
						] }) : null]
					}),
					fullCard && card !== null && status !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						t,
						kind: card,
						status,
						hasAudioFile,
						busy,
						eta,
						onPrepare,
						onCancel,
						onHide: onCardHide
					}) : null
				]
			});
		}
		/** One card, drawn the size of the picture it stands in for. */
		function Card({ t, kind, status, hasAudioFile, busy, eta, onPrepare, onCancel, onHide }) {
			const file = [status.file, formatBytes(status.bytes)].filter((part) => part !== null && part.length > 0).join(" · ");
			const refusal = !status.ok && status.reason !== null && kind !== "failed" ? status.reason : null;
			if (kind === "preparing") {
				const progress = status.progress;
				const fraction = progress === null ? 0 : progress.fraction;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "dsh-lingualab-videocard",
					role: "status",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-title",
							children: t("cardPreparingTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-sub",
							children: t("cardPreparingSub")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-bar is-thick",
							"aria-hidden": true,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-lingualab-bar-fill",
								style: { width: `${String(Math.round(fraction * 100))}%` }
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-videocard-row",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("cardPreparingPercent", {
								percent: Math.round(fraction * 100),
								done: formatClock(progress?.seconds ?? 0),
								total: formatClock(progress?.total ?? 0)
							}) }), eta === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("cardPreparingEta", { seconds: eta }) })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsh-lingualab-videocard-body",
							children: hasAudioFile ? t("cardPreparingBody") : t("cardPreparingBodyNoAudio")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-btn",
							onClick: onCancel,
							disabled: busy,
							children: t("cardCancel")
						})
					]
				});
			}
			if (kind === "no-ffmpeg") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoFfmpegCard, {
				t,
				command: status.installCommand ?? "",
				hasAudioFile
			});
			const soundOnlyLine = t("cardSoundCodec", { codec: codecName(status.videoCodec) });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dsh-lingualab-videocard",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `dsh-lingualab-videocard-icon${kind === "prepare" ? "" : " is-quiet"}`,
						children: kind === "failed" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WarnIcon, { size: 18 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VideoIcon, {
							size: 18,
							off: kind !== "prepare"
						})
					}),
					kind === "prepare" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-title",
							children: t("cardPrepareTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-sub is-mono",
							children: file
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							className: "dsh-lingualab-videocard-body",
							children: [
								status.audioCodec !== null && !BROWSER_AUDIO.includes(status.audioCodec) ? t("cardPrepareAudio", { codec: codecName(status.audioCodec) }) : t("cardPrepareContainer"),
								" ",
								status.estimateBytes === null ? "" : t("cardPrepareSize", { size: formatBytes(status.estimateBytes) })
							]
						}),
						refusal === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-error",
							children: refusal
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-btn is-primary",
							onClick: () => onPrepare("video"),
							disabled: busy,
							children: t("cardPrepareAction")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-note",
							children: hasAudioFile ? t("cardPrepareNote") : t("cardPrepareNoteNoAudio")
						})
					] }) : null,
					kind === "sound-only" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-title",
							children: t("cardSoundTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-sub is-mono",
							children: soundOnlyLine
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsh-lingualab-videocard-body",
							children: t("cardSoundBody")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-sub",
							children: t("cardSoundNote")
						}),
						refusal === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-error",
							children: refusal
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-btn is-primary",
								onClick: () => onPrepare("sound"),
								disabled: busy,
								children: t("cardSoundAction")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-lingualab-btn is-ghost",
								onClick: onHide,
								children: t("cardGotIt")
							})]
						})
					] }) : null,
					kind === "sound-ready" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-title",
							children: t("cardSoundTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-sub is-mono",
							children: file
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsh-lingualab-videocard-body",
							children: t("cardSoundReadyBody")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-btn",
							onClick: onHide,
							children: t("cardGotIt")
						})
					] }) : null,
					kind === "unplayable" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-title",
							children: t("cardUnplayableTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-sub is-mono",
							children: file
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							className: "dsh-lingualab-videocard-body",
							children: [
								status.videoCodec !== null && status.state === "unplayable" ? t("cardUnplayableCodec", { codec: codecName(status.videoCodec) }) : status.reason ?? t("cardUnplayableBrowser"),
								" ",
								hasAudioFile ? t("cardUnplayableAudio") : ""
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-btn",
							onClick: onHide,
							children: t("cardGotIt")
						})
					] }) : null,
					kind === "failed" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-title",
							children: t("cardFailedTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-lingualab-videocard-sub is-mono",
							children: file
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsh-lingualab-videocard-body is-mono",
							children: status.reason ?? ""
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsh-lingualab-btn is-primary",
							onClick: () => onPrepare("video"),
							disabled: busy,
							children: t("cardRetry")
						})
					] }) : null
				]
			});
		}
		/** The card for a host with no ffmpeg: what to run, a button to copy it, and where the path can be set. */
		function NoFfmpegCard({ t, command, hasAudioFile }) {
			const [copied, setCopied] = (0, react.useState)(false);
			const timer = (0, react.useRef)(null);
			(0, react.useEffect)(() => () => {
				if (timer.current !== null) clearTimeout(timer.current);
			}, []);
			const copy = () => {
				navigator.clipboard.writeText(command).then(() => {
					setCopied(true);
					if (timer.current !== null) clearTimeout(timer.current);
					timer.current = setTimeout(() => setCopied(false), COPIED_MS);
				}, () => void 0);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dsh-lingualab-videocard",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-videocard-icon is-warn",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WarnIcon, { size: 18 })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-videocard-title",
						children: t("cardFfmpegTitle")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsh-lingualab-videocard-body",
						children: t("cardFfmpegBody")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-lingualab-videocard-code",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: command }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "dsh-lingualab-btn is-small",
							onClick: copy,
							children: [copied ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 12 }) : null, copied ? t("cardCopied") : t("cardCopy")]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-videocard-sub",
						children: t("cardFfmpegPath", { field: "ffmpegPath" })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
					hasAudioFile ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-lingualab-videocard-note",
						children: t("cardFfmpegNote")
					}) : null
				]
			});
		}
		/** The bar at the top of the practice view: the video is ready, the lengths differ, the blind watch started. */
		function VideoNotice({ notice, onAction }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `dsh-lingualab-notice is-${notice.kind}`,
				role: "status",
				children: [
					notice.kind === "ready" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 16 }) : notice.kind === "blind" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TimerIcon, { size: 16 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WarnIcon, { size: 16 }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-lingualab-notice-text",
						children: notice.text
					}),
					notice.action === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-lingualab-notice-action",
						onClick: onAction,
						children: notice.action
					})
				]
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
		* what you kept became the right column's other view, 「收藏」, next to the subtitles.
		*
		* A review is a mode of this page rather than a page of its own: it puts each kept sentence on
		* the stage in turn, hidden until revealed and looping, and the grade the reader gives is written
		* to the episode's notes like any other edit. A review over the whole library opens each
		* sentence's episode (and segment) through the same path the home uses, so the page is where the
		* queue, the player, the open episode and its notes meet.
		*
		* A segment with a video plays it in the one media element, so its sound is the video's: the picture sits on
		* the stage in three states the reader cycles with `V` (shown, large, hidden), the five steps switch it to
		* large for the blind watch and put it back, and the video is prepared on the host the first time it is asked for.
		*
		* An episode cut into segments (one scene per audio file) plays one segment at a time. The
		* page is where the pieces meet: it knows the reader's positions (so it decides which segment
		* 「继续」 opens), the library feature opens a segment, the notes feature keeps the sentences,
		* and the segment list is one more layer for the Escape key to close.
		*
		* Keyboard handling lives here rather than on `window`. The earlier standalone app bound
		* its shortcuts globally and therefore owned the space bar, the arrow keys and the
		* bracket keys wherever it was open; inside a panel that shares a page with a
		* conversation, that is a hostile neighbour. The handler sits on the page container,
		* which is focusable, so the keys work while the panel has focus and stop at its edge.
		*/
		/** The set of finished segments of an episode that has none. One value, so the memo below stays stable. */
		const NO_FINISHED = /* @__PURE__ */ new Set();
		/** How often the listening position is written down while an episode plays. */
		const BOOKMARK_MS = 5e3;
		/** How long a key cap stays lit after the page handles its key. */
		const FLASH_MS = 260;
		/** How long the 「视频准备好了」 and 「盲看开始计时」 notices stay; the length warning stays until it is dismissed. */
		const NOTICE_MS = 7e3;
		/**
		* Where a kept sentence starts in the cue list on screen.
		*
		* `notes.md` holds whole seconds, so a sentence that starts at 135.08 s reads back as 135,
		* which can sit in the gap before it: seeking there made the previous sentence the active
		* one, and that was the sentence the replay looped. The cue with the same second and the
		* same English is the one that was kept, by the rule the star already uses.
		*/
		function keptCueStart(cues, at, text) {
			const key = keptSentenceKey({
				at,
				text
			});
			return cues.find((cue) => keptSentenceKey({
				at: cue.start,
				text: splitCue(cue).english
			}) === key)?.start ?? at;
		}
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
			const [column, setColumn] = (0, react.useState)("transcript");
			const [review, setReview] = (0, react.useState)(null);
			/**
			* Whether a review is running, for the bookmark: a review jumps between kept sentences, and
			* writing those places down would move 「继续」 to wherever the review last was. A ref, set in the
			* handlers that start and end a review, because the bookmark's own cleanup runs after them.
			*/
			const reviewing = (0, react.useRef)(false);
			const reviewList = useReviewList(view === "home");
			const [stepsOpen, setStepsOpen] = (0, react.useState)(false);
			const scrim = usePresence(stepsOpen, 200);
			const [settingsOpen, setSettingsOpen] = (0, react.useState)(false);
			const settingsScrim = usePresence(settingsOpen, 200);
			const theme = useSettings((state) => state.theme);
			const appearance = useSettings((state) => state.appearance);
			const stageSize = useSettings((state) => state.stageSize);
			const hostDark = useHostDark();
			/**
			* The reader's theme as inline custom properties on the root, or `undefined` when it is the
			* default following the host (nothing is set, and the page is exactly as the host styles it).
			*/
			const themeStyle = (0, react.useMemo)(() => {
				const resolved = resolveThemeVars(theme, appearance, hostDark);
				return resolved === null ? void 0 : {
					...resolved.vars,
					colorScheme: resolved.scheme
				};
			}, [
				theme,
				appearance,
				hostDark
			]);
			const [selection, setSelection] = (0, react.useState)(null);
			const [focused, setFocused] = (0, react.useState)(false);
			const [follow, setFollow] = (0, react.useState)(true);
			const [flashed, setFlashed] = (0, react.useState)(null);
			const [dismissedFinish, setDismissedFinish] = (0, react.useState)(0);
			const flashTimer = (0, react.useRef)(null);
			const [progress, setProgress] = (0, react.useState)(() => readAllProgress());
			const containerRef = (0, react.useRef)(null);
			const controlBar = (0, react.useRef)(null);
			const activeIndex = useMediaPlayer((state) => state.activeIndex);
			const shadow = useMediaPlayer((state) => state.pauseAfterSentence);
			const revealed = useMediaPlayer((state) => state.revealed);
			const finished = useMediaPlayer((state) => state.finished);
			const finishCount = useMediaPlayer((state) => state.finishCount);
			const cues = library.cues;
			const episode = library.episode;
			const episodeId = episode?.id ?? null;
			const segments = library.segments;
			const segment = library.segment;
			const segmentId = segment?.id ?? null;
			const hasVideoFile = (segment === null ? episode?.video ?? null : segment.video) !== null;
			/** The audio file of what is open, null for a video-only segment. */
			const audioFile = segment === null ? episode?.audio ?? null : segment.audio;
			const picture = useSettings((state) => state.picture);
			const pictureRestore = useSettings((state) => state.pictureRestore);
			const [notice, setNotice] = (0, react.useState)(null);
			/** The segments whose length warning was dismissed, for this visit. */
			const [dismissedMismatch, setDismissedMismatch] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const refreshListing = library.refreshListing;
			const video = useVideo(episodeId, segmentId, hasVideoFile, (0, react.useCallback)(() => {
				const at = useMediaPlayer.getState().currentTime;
				setNotice({
					kind: "ready",
					text: t("noticeReady", { time: formatClock(at) }),
					action: null
				});
				refreshListing();
			}, [t, refreshListing]));
			/** What plays: the video once it plays, else the audio file (or nothing, for a video that is not prepared). */
			const source = playSource(library.media?.audioUrl ?? null, video.status, video.failedUrl);
			const binding = useMediaBinding(source.url, segmentKey(episodeId, segmentId), video.markUndecodable);
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
			/** Whether to loop the sentence at `resumeAt` once it has been seeked to: a replayed note, not a resume. */
			const resumeLoop = (0, react.useRef)(false);
			/** The English of the replayed note, so the seek lands on its cue rather than on its whole second. */
			const resumeText = (0, react.useRef)(null);
			const media = library.media;
			const subtitled = media !== null && (media.subtitleEnUrl !== null || media.subtitleZhUrl !== null);
			const cuesReady = cues.length > 0 || media !== null && !subtitled;
			(0, react.useEffect)(() => {
				const target = resumeAt.current;
				const audio = binding.element;
				if (target === null || audio === null || !cuesReady) return;
				const apply = () => {
					if (resumeAt.current === null) return;
					const text = resumeText.current;
					const at = text === null ? resumeAt.current : keptCueStart(cues, resumeAt.current, text);
					const loop = resumeLoop.current;
					resumeAt.current = null;
					resumeLoop.current = false;
					resumeText.current = null;
					if (Number.isFinite(audio.duration) && at >= audio.duration - 1) return;
					useMediaPlayer.getState().seek(at);
					if (loop) {
						useMediaPlayer.getState().setLoopMode("sentence");
						useMediaPlayer.getState().setPlaying(true);
					}
				};
				if (audio.readyState >= 1) {
					apply();
					return;
				}
				audio.addEventListener("loadedmetadata", apply, { once: true });
				return () => audio.removeEventListener("loadedmetadata", apply);
			}, [
				binding.element,
				cues,
				cuesReady,
				media,
				source.url
			]);
			const previousLayer = (0, react.useRef)("none");
			(0, react.useEffect)(() => {
				if (previousLayer.current === "segments" && layer !== "segments") containerRef.current?.focus({ preventScroll: true });
				previousLayer.current = layer;
			}, [layer]);
			(0, react.useEffect)(() => {
				if (library.loading) return;
				containerRef.current?.focus({ preventScroll: true });
			}, [library.loading, view]);
			/** What the position is stored under: the episode's id, or its segment's key. */
			const positionKey = episodeId === null ? null : progressKeyOf(episodeId, segmentId);
			/**
			* Write the listening position down while an episode is on screen.
			*
			* On an interval and on the way out, not on every `timeupdate`: that event fires
			* several times a second, and a `localStorage` write per tick is wasted work for a
			* bookmark nobody reads until the next visit.
			*/
			const bookmark = (0, react.useCallback)(() => {
				if (positionKey === null) return;
				if (resumeAt.current !== null || reviewing.current) return;
				const state = useMediaPlayer.getState();
				writeProgress(positionKey, state.currentTime, state.duration);
			}, [positionKey]);
			(0, react.useEffect)(() => {
				if (view !== "practice") return;
				const timer = setInterval(bookmark, BOOKMARK_MS);
				return () => {
					clearInterval(timer);
					bookmark();
				};
			}, [view, bookmark]);
			const seenFinishCount = (0, react.useRef)(finishCount);
			(0, react.useEffect)(() => {
				if (finishCount === seenFinishCount.current) return;
				seenFinishCount.current = finishCount;
				const state = useMediaPlayer.getState();
				if (positionKey !== null && view === "practice" && state.duration > 0 && !reviewing.current) writeProgress(positionKey, state.duration, state.duration);
			}, [
				finishCount,
				positionKey,
				view
			]);
			(0, react.useEffect)(() => startProgressSync(() => setProgress(readAllProgress())), []);
			/** Go home: save the position first, then refresh what the home shows about it. */
			const goHome = (0, react.useCallback)(() => {
				bookmark();
				reviewing.current = false;
				setReview(null);
				notes.flush().then(reviewList.reload);
				useMediaPlayer.getState().setPlaying(false);
				setProgress(readAllProgress());
				setLayer("none");
				setStepsOpen(false);
				setView("home");
			}, [
				bookmark,
				notes,
				reviewList.reload
			]);
			/** The segments of this episode that are finished, which the segment list marks. */
			const finishedIds = (0, react.useMemo)(() => episode === null || segments.length === 0 ? NO_FINISHED : finishedSegments(progress, episode), [
				progress,
				episode,
				segments
			]);
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
						text: splitCue(cue).english,
						segment: segmentId ?? void 0
					}))) marked.add(index);
				});
				return marked;
			}, [
				notes.phrases,
				cues,
				segmentId
			]);
			/**
			* Keep or un-keep one sentence; the same star on the row and on the transport.
			*
			* A sentence the reader has already worked on (a note, a grade) is not removed by a star,
			* because a star is a reflex and the work behind it is not. The 「收藏」 column shows it
			* instead, where removing it is a button with an undo.
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
					done: false,
					segment: segmentId ?? void 0
				}) === "protected") setColumn("kept");
			}, [
				cues,
				activeIndex,
				notes,
				segmentId
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
					text: splitCue(cue).english,
					segment: segmentId ?? void 0
				};
				const index = notes.phrases.findIndex((phrase) => sameKeptSentence(phrase, key));
				return index < 0 ? null : {
					index,
					phrase: notes.phrases[index]
				};
			}, [
				cues,
				activeIndex,
				notes.phrases,
				segmentId
			]);
			/**
			* Put a picked word or phrase into the note of the sentence on stage, keeping the sentence if it
			* was not; take it out again when the note already holds it.
			*/
			const toggleWord = (0, react.useCallback)((word) => {
				const cue = cues[activeIndex];
				if (cue === void 0) return;
				const existing = stagePhrase?.phrase;
				if (stagePhrase !== null && existing !== void 0) {
					const note = noteHasWord(existing.note, word) ? removeWordFromNote(existing.note, word) : addWordToNote(existing.note, word);
					notes.update(stagePhrase.index, { note });
					return;
				}
				const { english, chinese } = splitCue(cue);
				notes.add({
					at: cue.start,
					text: english,
					zh: chinese,
					note: addWordToNote("", word),
					tags: [],
					done: false,
					segment: segmentId ?? void 0
				});
			}, [
				cues,
				activeIndex,
				notes,
				stagePhrase,
				segmentId
			]);
			/** Grade the kept sentence on stage; a sentence that is not kept has no grade to give. */
			const gradeStage = (0, react.useCallback)((grade) => {
				const phrase = stagePhrase?.phrase;
				if (stagePhrase === null || phrase === void 0) return;
				notes.update(stagePhrase.index, withGrade(phrase, grade));
			}, [notes, stagePhrase]);
			/** The episodes that can be played, in library order; "next" is the one after the open one. */
			const playable = (0, react.useMemo)(() => [...library.payload?.episodes ?? [], ...library.payload?.files ?? []].filter(hasMedia), [library.payload]);
			const nextEpisode = (0, react.useMemo)(() => {
				const at = playable.findIndex((entry) => entry.id === library.episode?.id);
				return at >= 0 ? playable[at + 1] ?? null : null;
			}, [playable, library.episode]);
			/** The entry for an episode id: from the listing, or the open one when it lives outside it. */
			const entryFor = (0, react.useCallback)((id) => [...library.payload?.episodes ?? [], ...library.payload?.files ?? []].find((entry) => entry.id === id) ?? (library.episode?.id === id ? library.episode : null), [library.payload, library.episode]);
			/**
			* Open an episode by id and move to the practice view when the host agrees.
			*
			* For an episode cut into segments this is where 「继续」 is decided, in one place: the segment
			* listened to most recently, or the first when none has been. The host opens whichever it is
			* told, because the host knows no more than the progress file and the page has the reader's
			* positions to hand.
			*/
			const openEpisode = (0, react.useCallback)((id) => {
				(async () => {
					const entry = entryFor(id);
					const positions = readAllProgress();
					const chosen = entry === null || entry.segments.length === 0 ? null : continueSegment(positions, entry);
					if (!await library.openEpisode(id, chosen ?? void 0)) return;
					resumeAt.current = chosen === null ? readProgress(id)?.at ?? null : segmentProgress(positions, id, chosen, entry?.segments.map((item) => item.id) ?? [])?.at ?? null;
					resumeLoop.current = false;
					setSelection(null);
					setLayer("none");
					setView("practice");
				})();
			}, [library, entryFor]);
			/**
			* Move to another segment of the open episode.
			*
			* The outgoing segment's position is saved first. The incoming one resumes where it was left
			* unless `to` says where to go, which is what replaying a kept sentence does: it names the
			* second to seek to and asks for the sentence to be looped, and the drawer it came from stays open.
			*/
			const openSegment = (0, react.useCallback)((id, to) => {
				if (episode === null || id === segmentId) return;
				(async () => {
					bookmark();
					if (!await library.openEpisode(episode.id, id)) return;
					const ids = episode.segments.map((item) => item.id);
					const positions = readAllProgress();
					resumeAt.current = to?.at ?? segmentProgress(positions, episode.id, id, ids)?.at ?? null;
					resumeLoop.current = to?.loop === true;
					resumeText.current = to?.text ?? null;
					setSelection(null);
					if (to === void 0) setLayer("none");
					setProgress(positions);
				})();
			}, [
				episode,
				segmentId,
				bookmark,
				library
			]);
			/**
			* Replay a kept sentence: seek to it and loop it, opening its segment first when it is in another.
			*
			* A segment the episode no longer has (the file was renamed) cannot be opened, so the
			* sentence is replayed at its second in the one on screen rather than doing nothing.
			*/
			const replayPhrase = (0, react.useCallback)((phrase) => {
				if (phrase.segment !== void 0 && phrase.segment !== segmentId && findSegment(segments, phrase.segment) !== null) {
					openSegment(phrase.segment, {
						at: phrase.at,
						loop: true,
						text: phrase.text
					});
					return;
				}
				useMediaPlayer.getState().seekCueAt(keptCueStart(cues, phrase.at, phrase.text));
				useMediaPlayer.getState().setLoopMode("sentence");
				useMediaPlayer.getState().setPlaying(true);
			}, [
				cues,
				segmentId,
				segments,
				openSegment
			]);
			/**
			* Why this episode's subtitles cannot be saved from the timing strip, or `null`.
			*
			* The page only writes files inside the library: a folder episode always is, a file episode only
			* when it is a loose file at the library root. The host checks the same thing again.
			*/
			const timingBlocked = (0, react.useMemo)(() => {
				if (episode === null || episode.kind === "folder") return null;
				return (library.payload?.files ?? []).some((entry) => entry.id === episode.id) ? null : t("timingOutside");
			}, [
				episode,
				library.payload,
				t
			]);
			/**
			* After a timing save: keep the star on the sentence, read the file again, and stay on the sentence.
			*
			* A kept sentence is matched by its whole second, so a start that crossed a second would leave
			* the star behind; the phrase's `at` moves with it, and the same for a next sentence whose start
			* the end pushed. Reading the file again gives the cues their
			* new edges and the hash the next save needs; the position is put back on the sentence the way a
			* replayed note is, looping it when it was playing.
			*/
			const onTimingSaved = (0, react.useCallback)((saved) => {
				for (const moved of [saved, ...saved.pushed]) {
					const before = moved.before.start / 1e3;
					const after = moved.after.start / 1e3;
					if (Math.floor(before) === Math.floor(after)) continue;
					const key = {
						at: before,
						text: splitCue(moved.cue).english,
						segment: segmentId ?? void 0
					};
					const index = notes.phrases.findIndex((phrase) => sameKeptSentence(phrase, key));
					if (index >= 0) notes.update(index, { at: after });
				}
				const after = saved.after.start / 1e3;
				resumeAt.current = after;
				resumeLoop.current = useMediaPlayer.getState().isPlaying;
				resumeText.current = null;
				library.reloadCues();
			}, [
				notes,
				segmentId,
				library
			]);
			/** The file changed under the page: read it again and stay where the playhead is. */
			const onTimingStale = (0, react.useCallback)(() => {
				resumeAt.current = useMediaPlayer.getState().currentTime;
				resumeLoop.current = false;
				resumeText.current = null;
				library.reloadCues();
			}, [library]);
			const timing = useTimingEditor({
				cues,
				tracks: library.tracks,
				episodeId,
				blocked: timingBlocked,
				onSaved: onTimingSaved,
				onStale: onTimingStale
			});
			/** Open the strip for the sentence on stage; layers close, because the strip takes the keyboard. */
			const openTiming = (0, react.useCallback)(() => {
				if (cues[activeIndex] === void 0) return;
				setLayer("none");
				setStepsOpen(false);
				setSelection(null);
				timing.open(activeIndex);
			}, [
				cues,
				activeIndex,
				timing
			]);
			/**
			* Put one review item on stage: replay it in the open episode, or open its episode (at its
			* segment) first and replay it there, the way a kept sentence from another segment is replayed.
			* @returns false when its episode could not be opened, which the review counts as gone.
			*/
			const goToItem = (0, react.useCallback)(async (item) => {
				if (item.episode === episodeId) {
					setSelection(null);
					setView("practice");
					replayPhrase(item.phrase);
					return true;
				}
				const entry = entryFor(item.episode);
				const wanted = item.phrase.segment;
				const segmentOf = wanted !== void 0 && entry !== null && findSegment(entry.segments, wanted) !== null ? wanted : void 0;
				if (!await library.openEpisode(item.episode, segmentOf)) return false;
				resumeAt.current = item.phrase.at;
				resumeLoop.current = true;
				resumeText.current = item.phrase.text;
				setSelection(null);
				setView("practice");
				return true;
			}, [
				episodeId,
				replayPhrase,
				entryFor,
				library
			]);
			/**
			* Move a review to the session given, and put its current item on stage.
			*
			* An item whose episode cannot be opened is recorded as gone and the next one is tried, so a
			* renamed folder costs a line in the summary rather than a stuck review.
			*/
			const runReview = (0, react.useCallback)((session) => {
				(async () => {
					let next = session;
					for (;;) {
						setReview(next);
						const item = currentItem(next);
						if (item === null) {
							useMediaPlayer.getState().setPlaying(false);
							return;
						}
						if (await goToItem(item)) return;
						next = recordOutcome(next, "gone");
					}
				})();
			}, [goToItem]);
			/** Start a review over these items; nothing happens for an empty queue. */
			const beginReview = (0, react.useCallback)((items, scope) => {
				const session = startReview(items, scope);
				if (session === null) return;
				bookmark();
				reviewing.current = true;
				setLayer("none");
				setStepsOpen(false);
				timing.close();
				runReview(session);
			}, [
				bookmark,
				runReview,
				timing
			]);
			/** Review this episode's sentences still being practised. */
			const reviewEpisode = (0, react.useCallback)(() => {
				if (episode === null) return;
				beginReview(episodeQueue(episode.id, episode.title, notes.phrases, segments.map((item) => item.id)), "episode");
			}, [
				episode,
				notes.phrases,
				segments,
				beginReview
			]);
			/** Review every episode's, from the home. */
			const reviewLibrary = (0, react.useCallback)(() => {
				if (reviewList.payload === null) return;
				beginReview(libraryQueue(reviewList.payload), "library");
			}, [reviewList.payload, beginReview]);
			/** End the review where it is: the sentence on stage stays there. */
			const endReview = (0, react.useCallback)(() => {
				reviewing.current = false;
				setReview(null);
			}, []);
			const reviewItem = review === null ? null : currentItem(review);
			/** The stored index of the review item in the open episode's notes, once they are read; -1 before. */
			const reviewIndex = reviewItem === null || notes.episode !== reviewItem.episode ? -1 : notes.phrases.findIndex((phrase) => sameKeptSentence(phrase, reviewItem.phrase));
			/** Record what happened to the item on stage and go on to the next one. */
			const answerReview = (0, react.useCallback)((outcome) => {
				if (review === null || isFinished(review)) return;
				if (outcome !== "skipped" && outcome !== "gone") {
					const phrase = notes.phrases[reviewIndex];
					if (phrase === void 0) return;
					notes.update(reviewIndex, withGrade(phrase, outcome));
				}
				runReview(recordOutcome(review, outcome));
			}, [
				review,
				notes,
				reviewIndex,
				runReview
			]);
			/**
			* Take dropped files into the library.
			*
			* Opening is left to the report's button: the reader dropped files to add them to a
			* library, which is not the same as asking to start listening to the first one.
			*/
			const importFiles = (0, react.useCallback)((files) => {
				importer.start(files);
			}, [importer]);
			(0, react.useEffect)(() => {
				if (notice === null) return;
				const timer = setTimeout(() => setNotice(null), NOTICE_MS);
				return () => clearTimeout(timer);
			}, [notice]);
			/**
			* The blind-watch step's timer started or stopped (the step tracker says so; opening its drawer says nothing).
			*
			* Starting switches the picture to large, once, and shows the notice with 「撤销」; pausing or ticking the
			* step off puts the previous state back. Without a picture playing there is nothing to switch.
			*/
			const onBlindRunning = (0, react.useCallback)((running) => {
				const settings = useSettings.getState();
				if (!running) {
					settings.blindEnded();
					setNotice((current) => current?.kind === "blind" ? null : current);
					return;
				}
				if (!source.picture) return;
				if (settings.blindStarted()) setNotice({
					kind: "blind",
					text: t("noticeBlind"),
					action: t("noticeUndo")
				});
			}, [source.picture, t]);
			const card = cardOf(video.status, video.failedUrl);
			const firstTimeCard = useFirstTimeCard(card !== null && isInformational(card) ? JSON.stringify([segmentKey(episodeId, segmentId), card]) : null);
			const mismatchKey = segmentKey(episodeId, segmentId);
			const mismatch = source.picture ? video.status?.mismatch ?? null : null;
			const mismatchNotice = mismatch === null || mismatchKey === null || dismissedMismatch.has(mismatchKey) ? null : {
				kind: "mismatch",
				text: t(mismatch > 0 ? "noticeMismatch" : "noticeMismatchShorter", { seconds: String(Math.abs(mismatch)) }),
				action: t("cardGotIt")
			};
			const shownNotice = (notice !== null && notice.kind === "blind" && pictureRestore === null ? null : notice) ?? mismatchNotice;
			const onNoticeAction = () => {
				if (shownNotice === null) return;
				if (shownNotice.kind === "blind") {
					useSettings.getState().setPicture(pictureRestore ?? "shown");
					setNotice(null);
				} else if (shownNotice.kind === "mismatch" && mismatchKey !== null) setDismissedMismatch(new Set(dismissedMismatch).add(mismatchKey));
				else setNotice(null);
			};
			const followingSegment = nextSegment(segments, segmentId);
			const segmentPhrases = (0, react.useMemo)(() => segmentId === null ? notes.phrases : notes.phrases.filter((phrase) => (phrase.segment ?? segments[0]?.id) === segmentId), [
				notes.phrases,
				segmentId,
				segments
			]);
			const finishOpen = view === "practice" && finished && finishCount > dismissedFinish && cues.length > 0 && review === null;
			const onKeyDown = (0, react.useCallback)((event) => {
				if (isTypingTarget(event.target)) return;
				if (event.ctrlKey || event.metaKey || event.altKey) return;
				const store = useMediaPlayer.getState;
				const handled = () => {
					event.preventDefault();
					event.stopPropagation();
				};
				if (event.key === "Escape") {
					if (controlBar.current?.closeMenu() === true) handled();
					else if (settingsOpen) {
						handled();
						setSettingsOpen(false);
					} else if (timing.session !== null) {
						handled();
						timing.close();
					} else if (review !== null) {
						handled();
						endReview();
					} else if (finishOpen) {
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
				if (settingsOpen) return;
				if (view !== "practice") return;
				if (timing.session !== null) {
					if (timing.handleKey(event)) handled();
					return;
				}
				if (layer !== "none") return;
				if (finishOpen || review !== null && isFinished(review)) return;
				const grade = gradeForKey(event.key);
				if (grade !== null) {
					handled();
					if (review !== null) answerReview(grade);
					else gradeStage(grade);
					return;
				}
				if (review !== null && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
					handled();
					flash("arrows");
					if (event.key === "ArrowRight") answerReview("skipped");
					else runReview(stepBack(review));
					return;
				}
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
					case "Enter":
						handled();
						if (cues[current] !== void 0) {
							setSelection(null);
							store().seekCue(current);
							store().setPlaying(true);
						}
						return;
					case "l":
					case "L":
						handled();
						flash("l");
						if (store().loopMode === "sentence") store().setLoopMode("none");
						else store().loopSentence(current);
						return;
					case "s":
					case "S":
						handled();
						flash("s");
						keep(selection ?? void 0);
						return;
					case "n":
					case "N":
						handled();
						setColumn(column === "kept" ? "transcript" : "kept");
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
					case "v":
					case "V":
						if (!hasVideoFile) return;
						handled();
						flash("v");
						useSettings.getState().cyclePicture();
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
					case "t":
					case "T":
						handled();
						openTiming();
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
				answerReview,
				column,
				cues,
				endReview,
				finishCount,
				finishOpen,
				flash,
				gradeStage,
				hasVideoFile,
				keep,
				layer,
				openTiming,
				review,
				runReview,
				selection,
				settingsOpen,
				stepsOpen,
				timing,
				view,
				zhMode
			]);
			const hasAudio = library.media !== null;
			const canPlay = source.url !== null;
			/** Large hides the sentence, because the picture is what is being watched; it only applies while a picture plays. */
			const stageHidden = picture === "large" && source.picture;
			const pictureControl = hasVideoFile ? {
				mode: picture,
				onCycle: () => useSettings.getState().cyclePicture()
			} : null;
			const selectedIndex = selection === null ? activeIndex : Math.min(Math.max(0, selection), Math.max(0, cues.length - 1));
			const stageCue = cues[activeIndex];
			const stageLines = stageCue === void 0 ? null : splitCue(stageCue);
			const keptNow = stageCue !== void 0 && stageLines !== null && notes.has({
				at: stageCue.start,
				text: stageLines.english,
				segment: segmentId ?? void 0
			});
			const reviewOn = review !== null && !isFinished(review);
			const masked = (shadow || reviewOn) && stageCue !== void 0 && revealed !== activeIndex;
			const practising = segmentPhrases.filter((phrase) => !phrase.done).length;
			const reviewSegment = reviewItem?.phrase.segment === void 0 ? null : findSegment(segments, reviewItem.phrase.segment);
			const switcher = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Segmented, {
				label: t("columnLabel"),
				value: column,
				onChange: setColumn,
				options: [{
					id: "transcript",
					label: t("transcript"),
					count: cues.length
				}, {
					id: "kept",
					label: t("columnKept"),
					count: notes.phrases.length
				}]
			});
			/** The icon at the right end of both top bars; it opens the settings and closes the five steps. */
			const settingsButton = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: `dsh-lingualab-icon-btn${settingsOpen ? " is-on" : ""}`,
				onClick: () => {
					setStepsOpen(false);
					setLayer("none");
					setSettingsOpen(!settingsOpen);
				},
				title: t("settingsOpen"),
				"aria-label": t("settingsOpen"),
				"aria-expanded": settingsOpen,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsIcon, { size: 16 })
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-lingualab-page",
				style: themeStyle,
				"data-ll-stage-size": stageSize,
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
							settingsButton
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
						onFolder: () => setLayer("folder"),
						review: reviewList.payload,
						onReview: reviewLibrary
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
									}), segment !== null || cues.length > 0 && stageCue !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-lingualab-top-sub",
										children: [segment === null ? null : segmentLabel(segment), cues.length > 0 && stageCue !== void 0 ? t("cueOf", {
											n: activeIndex + 1,
											total: cues.length
										}) : null].filter((part) => part !== null).join(" · ")
									}) : null]
								}),
								segments.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SegmentPicker, {
									t,
									segments,
									currentId: segmentId,
									finished: finishedIds,
									open: layer === "segments",
									onToggle: () => {
										setStepsOpen(false);
										setSettingsOpen(false);
										if (layer !== "segments") setProgress(readAllProgress());
										setLayer(layer === "segments" ? "none" : "segments");
									},
									onClose: () => setLayer("none"),
									onSelect: (id) => {
										if (id === segmentId) setLayer("none");
										else openSegment(id);
									}
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-lingualab-spacer" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `dsh-lingualab-chip${column === "kept" ? " is-on" : ""}`,
									onClick: () => setColumn(column === "kept" ? "transcript" : "kept"),
									title: t("keyColumn"),
									"aria-pressed": column === "kept",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteIcon, { size: 13 }),
										" ",
										t("notesChip"),
										" ",
										notes.phrases.length > 0 ? notes.phrases.length : "",
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", { children: "N" })
									]
								}),
								episode !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StepTracker, {
									t,
									episode: episode.id,
									open: stepsOpen,
									onToggle: () => {
										setLayer("none");
										setSettingsOpen(false);
										setStepsOpen(!stepsOpen);
									},
									onBlindRunning
								}, episode.id) : null,
								settingsButton
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-lingualab-body",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-lingualab-practice",
								children: [
									shownNotice === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VideoNotice, {
										notice: shownNotice,
										onAction: onNoticeAction
									}),
									review !== null && reviewOn && reviewItem !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewStrip, {
										t,
										position: review.at + 1,
										total: review.items.length,
										source: reviewSegment === null ? reviewItem.title : `${reviewItem.title} · ${segmentLabel(reviewSegment)}`,
										ready: reviewIndex >= 0,
										onGrade: answerReview,
										onSkip: () => answerReview("skipped"),
										onBack: () => runReview(stepBack(review)),
										onExit: endReview
									}) : null,
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VideoStage, {
										t,
										mediaRef: binding.attach,
										picture,
										playing: source.picture,
										status: video.status,
										card,
										cardOpen: firstTimeCard.open,
										hasAudioFile: audioFile !== null,
										busy: video.busy,
										eta: video.eta,
										caption: picture === "large" && source.picture && revealed === activeIndex && stageLines !== null ? stageLines.english : null,
										onPeek: () => useMediaPlayer.getState().reveal(useMediaPlayer.getState().activeIndex),
										onPrepare: video.prepare,
										onCancel: video.cancel,
										onCardShow: firstTimeCard.show,
										onCardHide: firstTimeCard.hide,
										onShowPicture: () => useSettings.getState().setPicture("shown")
									}),
									stageHidden ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stage, {
										t,
										cues,
										activeIndex,
										zhMode,
										masked,
										onReveal: () => useMediaPlayer.getState().reveal(useMediaPlayer.getState().activeIndex),
										onToggleWord: toggleWord,
										hasWord: (word) => noteHasWord(stagePhrase?.phrase?.note ?? "", word),
										loading: library.cuesLoading,
										hasAudio,
										onRetime: () => timing.session === null ? openTiming() : timing.close(),
										retiming: timing.session !== null
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TimingStrip, {
										t,
										editor: timing,
										blocked: timingBlocked ?? (timing.session !== null && (timing.session.cue.origin === void 0 || library.tracks.english === null) ? t("timingNoSource") : null)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dsh-lingualab-deck",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ControlBar, {
											ref: controlBar,
											t,
											zhMode,
											onZhMode: setZhMode,
											kept: keptNow,
											onToggleKeep: () => keep(),
											onRetime: openTiming,
											picture: pictureControl,
											disabled: !canPlay || cues.length === 0
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(KeyHints, {
											t,
											flash: flashed,
											active: focused,
											video: hasVideoFile
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
									review !== null && !reviewOn ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewFinish, {
										t,
										tally: tallyReview(review),
										onAgain: () => {
											const again = retryNotYet(review);
											if (again === null) endReview();
											else runReview(again);
										},
										onExit: endReview
									}) : null,
									finishOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FinishCard, {
										t,
										title: followingSegment !== null && segment !== null ? segmentLabel(segment) : episode?.title ?? "",
										scope: followingSegment === null ? "episode" : "segment",
										sentences: cues.length,
										kept: segmentPhrases.length,
										practising,
										nextTitle: followingSegment === null ? nextEpisode?.title ?? null : followingSegment.title,
										onAgain: () => {
											setDismissedFinish(finishCount);
											useMediaPlayer.getState().seek(0);
											useMediaPlayer.getState().setPlaying(true);
										},
										onNext: () => {
											setDismissedFinish(finishCount);
											if (followingSegment !== null) openSegment(followingSegment.id);
											else if (nextEpisode !== null) openEpisode(nextEpisode.id);
										},
										onHome: () => {
											setDismissedFinish(finishCount);
											goHome();
										},
										onClose: () => setDismissedFinish(finishCount)
									}) : null
								]
							}), column === "kept" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NotesPanel, {
								t,
								notes,
								segments,
								switcher,
								currentIndex: stagePhrase?.index ?? null,
								onReplay: (phrase) => {
									timing.close();
									replayPhrase(phrase);
								},
								onReview: reviewEpisode,
								reviewing: review !== null
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubtitlePanel, {
								t,
								switcher,
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
									if (cues[index] === void 0) return;
									setSelection(null);
									timing.close();
									useMediaPlayer.getState().seekCue(index);
									useMediaPlayer.getState().setPlaying(true);
								},
								onKeep: (index) => keep(index)
							})]
						}),
						scrim.mounted ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: `dsh-lingualab-scrim${stepsOpen ? "" : " is-leaving"}`,
							onClick: () => setStepsOpen(false)
						}) : null
					] }),
					settingsScrim.mounted ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: `dsh-lingualab-scrim${settingsOpen ? "" : " is-leaving"}`,
						onClick: () => setSettingsOpen(false)
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsPanel, {
						t,
						open: settingsOpen,
						onClose: () => setSettingsOpen(false)
					}),
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
