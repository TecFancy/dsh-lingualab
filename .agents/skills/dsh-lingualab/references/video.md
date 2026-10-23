# 视频与流畅版

改视频的准备、播放来源、流畅版或大画面时读这份。

## 视频在页面里播放

2026-10-12 起视频在页面里播放，决定与取舍见 `.agents/notes/implemented/feature/2026-10-12-video-episodes.md`。
第一版让视频留在外部播放器里看，理由仍记在 `.agents/notes/implemented/simplification/2026-10-08-v1-without-waveform.md`，
那是当时的决定，不要改它。下面几处不要拆。

### 只有一个媒体元素

- 整页只有**一个媒体元素**，即一个 `<video>`（`useMediaBinding`），音频文件也用它播。这样视频的声音和字幕、循环、跟读
  在同一条时间线上，不用担心两个元素不同步。
- 它画在练习页的 `VideoStage` 里，所以元素同时放在 ref 里（供 effect 修改）和 state 里（元素出现时让 effect 重新运行）。
  只放 state 会被 `react-hooks/immutability` 拦下。
- 同一段里换来源（先放音频，视频准备好后换成视频）时，靠 `session` 保持播放位置；换集时不保持。

### 换来源与跳转

- 换来源和跳转都由 `media-player/lib/load-source.ts` 管理。保留的位置要等新来源触发 `loadedmetadata` 后才还原。
- 等待期间来的跳转（切句、耳机的下一首）会改写成这次换来源的起点（`swap.ts` 的 `seekDuringSwap`）；
  否则会被还原操作覆盖，计数和播放位置就对不上。
- 等待期间元素报告的位置是加载时归零的值，`positionKnown` 让它不写进 store。
- 换集时没有等待中的起点，跳转照常直接交给元素。

### 放什么

- 由 `features/video/lib/source.ts` 的 `playSource` 一处决定。浏览器报告无法解码的 URL 记进 `failedUrl`，退回播放音频文件。
- ffmpeg 与 ffprobe 从 `PATH` 里找，或者用可选的 `ffmpegPath`（volatile 字段，同样要 `.get()`，配置了就只用它）。
  没有 ffprobe 时，mp4 与 webm 当作可以直接播放，mkv 与 mov 提示需要 ffmpeg。
- 规划（`video-plan.ts`）只接受 H.264、VP9、AV1，H.264 还要求 yuv420p；10 位视频一律只取声音。
  这些都是用真实的 ffmpeg 测出来的（`video.ffmpeg.test.ts`，没装 ffmpeg 的机器会自动跳过）。
- 准备视频时**不转码**，这一点是定死的，不要为了一个 HEVC 文件让「准备视频」去转码。
  只有用户手动点的「准备流畅版」会转码，它是单独的一档（`planSmooth`、`cacheKindOf`），对任何有画面又有声音的文件都适用。

### 其他

- 探测结果按「路径、大小、修改时间」缓存，否则轮询进度时每秒都要探测一次。
- 取消靠结束进程，等进程退出后再删 `.part`（Windows 删不掉仍被打开的文件）。
- 五步法的盲看只通过计时器改变画面状态（`features/settings/lib/picture.ts` 里的纯函数）。用户手动选择时会清掉待恢复的状态，
  所以计时器不会覆盖用户自己的选择。

## 流畅版

决定与取舍见 `.agents/notes/implemented/feature/2026-10-13-smooth-video.md`。下面几处不要拆。

- 流畅版是唯一一个在画面正在播放时运行的任务。所以它运行期间，状态路由让可播放的状态保持原样（`playable`、`sound-ready`），
  只加上 `progress` 与 `jobKind: 'smooth'`，页面不会把画面换成卡片。只有没有东西在播放时，状态才变成 `preparing`。
- 前端靠 `progress !== null` 判断「有任务」，不靠状态判断。「准备好了」的提示只在播放的文件真的换了时出现（`producedNewFile`），
  所以被取消或失败的流畅版不会提示「准备好了」。
- 失败的流畅版不进入 `failed` 状态（那会盖住正在播放的画面），而是记在 `smooth.error`。
- `-vf` 里 `min(720\,ih)` 的逗号必须转义，否则滤镜图会把它当成滤镜之间的分隔符。这一点和「每 2 秒一个关键帧」
  都是用真实的 ffmpeg 测过的（`video.ffmpeg.test.ts`）。
- 用 `os.setPriority` 降低优先级，进程号来自 `Child.pid`。测试里的假进程没有进程号，就不降，以免测试去改真实进程的优先级。

## 大画面

- 大画面的外框紧贴画面。`.is-large` 舞台是 `container-type:size`，外框宽度取 `min(100cqw,1100px,100cqh * 比例)`，再加 `aspect-ratio`。
- 比例是 `--ll-video-ratio`。`VideoStage` 在元素触发 `loadedmetadata` 与 `resize` 之后，把它写成真实的 videoWidth/videoHeight，在此之前按 16:9。
- 不要把外框改回 `flex:1`，那会在上下留出黑边，角标和按钮就会落在黑边里。
