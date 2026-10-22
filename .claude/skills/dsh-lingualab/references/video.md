# 视频与流畅版

改视频的准备、播放来源、流畅版或大画面时读这份。

- **视频在页面里播（2026-10-12 起）**，决定与取舍见 `.agents/notes/implemented/feature/2026-10-12-video-episodes.md`。
  第一版留在外部播放器看的理由还在
  `.agents/notes/implemented/simplification/2026-10-08-v1-without-waveform.md`，那是当时的决定，不要改它。几处别拆：
  整页只有**一个媒体元素**，一个 `<video>`（`useMediaBinding`），音频文件也走它，这样视频的声音和字幕、循环、跟读在一条时间线上，
  不用管两个元素漂不漂；它画在练习页的 `VideoStage` 里，所以元素既在 ref 里（effect 里改它）也在 state 里（出现时让 effect 重跑），
  光放 state 会被 `react-hooks/immutability` 拦。同一段里换来源（先放音频，视频准备好了换成视频）靠 `session` 保持位置，换集不保持。
  换来源与 seek 一起由 `media-player/lib/load-source.ts` 管：保留的位置等新来源的 `loadedmetadata` 才还原，等的期间来的 seek（切句、耳机下一首）
  改成这次换来源的起点（`swap.ts` 的 `seekDuringSwap`），否则会被还原盖掉，计数和播放位置对不上；等的期间元素报的位置是加载归 0，
  `positionKnown` 让它不进 store。换集时没有等着的起点，seek 照旧直接给元素。
  放什么由 `features/video/lib/source.ts` 的 `playSource` 一处决定，浏览器报解不了的 URL 记进 `failedUrl`，退回音频文件。
  ffmpeg 与 ffprobe 在 `PATH` 里或可选的 `ffmpegPath`（volatile 字段，同样 `.get()`，配了就只认它）；没有 ffprobe 时 mp4 与 webm 当直接放、
  mkv 与 mov 报需要 ffmpeg。规划（`video-plan.ts`）只认 H.264、VP9、AV1，H.264 还要 yuv420p：10 位的一律「只取声音」，这是拿真 ffmpeg 测出来的
  （`video.ffmpeg.test.ts`，没装 ffmpeg 的机器自动跳过）。准备时**不转码**是定死的，别让「准备视频」为一个 HEVC 去转码；要转码的只有读者手动点的「准备流畅版」，
  它是单独的一档（`planSmooth`、`cacheKindOf`，对任何有画面有声音的文件都成立）。探测结果按「路径、大小、修改时间」记住，
  不然轮询进度时每秒探一次。取消靠杀进程，等进程关了再删 `.part`（Windows 删不了打开着的文件）。五步法的盲看只通过计时器碰画面状态
  （`features/settings/lib/picture.ts` 的纯函数），手动的选择清掉要恢复的状态，所以不会盖过读者自己选的。
- **流畅版的几处别拆**，决定与取舍见 `.agents/notes/implemented/feature/2026-10-13-smooth-video.md`。它是唯一一个在画面正放着时跑的任务，
  所以状态路由在它运行时让能放的状态保持原样（`playable`、`sound-ready`），只加上 `progress`、`jobKind: 'smooth'`，页面不再把画面换成卡片；
  没有东西在放的状态才变成 `preparing`。客户端靠 `progress !== null` 判断「有任务」而不是靠状态，「准备好了」的提示只在放的文件真换了的时候出
  （`producedNewFile`），所以被取消或失败的流畅版不会说「准备好了」。失败的流畅版不进 `failed` 状态（那会盖住正在放的画面），进 `smooth.error`。
  `-vf` 里 `min(720\,ih)` 的逗号必须转义，否则滤镜图把它读成滤镜的分隔；它与「每 2 秒一个关键帧」都是拿真 ffmpeg 测的（`video.ffmpeg.test.ts`）。
  降优先级靠 `os.setPriority`，进程号来自 `Child.pid`，测试里的假进程没有进程号就不降，别让测试给真进程降优先级。
- **大画面的外框贴着画面**：`.is-large` 舞台是 `container-type:size`，外框宽是 `min(100cqw,1100px,100cqh * 比例)` 加 `aspect-ratio`，
  比例是 `--ll-video-ratio`，由 `VideoStage` 在元素 `loadedmetadata` 与 `resize` 后写成真实的 videoWidth/videoHeight，之前按 16:9。
  不要把外框改回 `flex:1`，那会让上下出黑边，角标和按钮就落在黑边里。
