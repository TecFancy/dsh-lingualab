---
name: dsh-lingualab
description: 在 dsh-lingualab 仓库里干活时的操作手册——两个半边怎么分工、改完必须跑什么、lib/ 为什么要提交、哪些坑已经踩过。主人说「继续做语言实验室 / 改精听面板 / lingualab 出问题了」时加载。
---

# dsh-lingualab 操作手册

「语言实验室」是 dsh 的一个整页面板插件：读工作区里的音频与字幕，做逐句精听，笔记写回磁盘给
agent 读。页面注册在 `main` 槽的 `lingualab` 键上，**入口是「应用」页上的卡片**——
`dsh-apps-panel` 的注册表里有一条 `panel: lingualab`，左栏没有它自己的一行。仓库自带 git，
默认分支 `development`，靠 PR 合进 `main` 出版本，**不发 npm**。

## 两个半边，两种生效方式

| 半边 | 入口 | 产物 | 生效方式 |
|---|---|---|---|
| host | `src/index.ts` | `lib/index.js` | **必须重启 dsh-web**，宿主代码只在启动时加载 |
| client | `src/client/index.tsx` | `lib/client.js` | 自动热替换，外壳每 500 毫秒轮询这个文件 |

改完客户端以为没生效，先看 `lib/` 是不是忘了重建（`npm run watch` 或 `npm run build`）。
`npm run build:check` 就是抓这个的：它重新构建到临时目录，跟提交进仓库的 `lib/` 逐字节比。

## 命令

```sh
npm run build        # 两个产物都要重建，lib/ 是提交进仓库的
npm run watch        # 开发时常驻
npm run verify       # 全套检查（CI 与发布前跑这个）
node scripts/verify.mjs --fast   # 提交前钩子跑的轻档
node scripts/verify.mjs --list   # 看检查表
```

`npm run verify` 里的每一条都可以单独跑，命令名见 `package.json`。

## 必须守住的约定

1. **路由路径只有一处定义**：`src/shared/protocol.ts` 的路径常量。它们同时写在
   `dsh-plugin.naming.json` 里，`check-host.mjs` 会把两边对上，改一边不改另一边会被拦下。
   新增路由写在它那个 feature 的 `src/host/features/<名字>/api/<名字>.route.ts`，从切片的 `index.ts` 导出，
   在 `src/index.ts` 里挂上，同时改这份 naming 记录与 README 的路由表。
2. **笔记格式只有一处解析**：`src/shared/notes-format.ts`。面板与 host 都走它，别在任一侧
   写第二份正则。文件剧集（`file.` 开头的 id）的笔记不走文件，存在插件 profile 的 `openState` 里。
   一条短语占文件的一行，所以备注字段里的换行写成 `<br>`、读回来再变成换行（`<br/>`、`<br />`、大小写都认，
   `\r` 丢掉），与 `|` 的转义在同一处；别让原始换行进文件，它会把这条短语截断。
3. **浏览只认 place id，不认路径**：页面传 `ws_<哈希>` 或 `lib`，由 host 自己解析成绝对路径
   （`src/host/entities/place`，路径检查在 `src/host/shared/fs`）。`/`、`/etc`、`/proc` 这类根一律拒绝，`rel` 拒绝 `..` 与绝对路径，
   每一步都 `realpath` 之后再确认仍在根内。**不要**为了让某条路由方便而接受浏览器传来的路径。
3a. **每一条路由都先过宿主的请求信任**（`src/host/shared/http/guard.ts`，`index.ts` 里 `.map(guarded)`）：它调
   `ctx.get('connection').admit(req)`，检查回环的 `Host`、匹配的 `Origin` 与签名的会话 cookie，不满足回
   `401`/`403`；没有 connection 服务时一律回 `403`，不是放行。**这才是访问控制。** 宿主的信任只罩 `/api`
   与 RPC，插件自己注册的路由不在其内，所以漏了这一步，任何把主机名重绑到 127.0.0.1 的页面、本机任何进程
   都能调。新增路由不要绕开 `guarded`，读路由也一样。`x-lingualab-import` 请求头只是第二道检查，防不住上面两种。
4. **写素材目录只有六处，都很窄**：一是文件夹剧集里的 `notes.md`（先写临时文件再 `rename`；读时回内容哈希 `version`，存时带 `expect`，对不上回 409 不写，页面重读；路由不收没有 `expect` 的文件夹剧集保存）；二是媒体库根目录的隐藏文件
   `.lingualab-progress.json`（`src/host/features/progress/model/progress.ts`，听到哪里与五步勾选；分段的位置键是
   `<集>::<段>`（`segmentKey`），五步仍按集；POST 按「每个键取最新 `updatedAt`」合并而不是覆盖，先写临时文件再 `rename`，因为这个文件本来就是要被替换的；坏文件按空读；
   不要把进度塞回 `openState` 配置，那会让每几秒一次的写入去重写 profile）；三是 `src/host/features/import/model/import.ts`，
   收用户拖进来的音频与字幕。库扫描、浏览、打开仍然全部只读。导入的底线不许松：**不覆盖已有文件**
   （名字在就报 `exists`，放到位用 `link`，不支持硬链接的卷退回 `COPYFILE_EXCL`，**不用 `rename`**，它在
   所有平台上都会替换目标）、只收扫描读的扩展名、名字在 host 清洗、媒体目录不能是系统文件夹
   （`forbiddenReason`）、建好文件夹后再确认仍在根内、先写随机命名的隐藏 `.part` 再放到位、崩溃留下的旧
   `.part` 下次写这个文件夹时清掉、同时最多两个上传（超了回 `429`）、单个文件 2 GB（流式限额，不信
   `content-length`）。文件剧集的笔记仍然落在 profile 里，不要改成在音频旁边建文件。
   见 `.agents/notes/implemented/feature/2026-10-09-home-first-and-drop-to-import.md`。
   四是 `src/host/features/timing/model/timing.ts`，把一句的开头和结尾写回媒体库里的字幕文件：只换那一句（和被它推动的相邻句）的时间行，同一文件的几句在原文上一遍找齐再替换，其余字节不动（按 Latin-1
   读写，GBK 与 GB18030 因此原样保留，UTF-16 带 BOM 的走 Node 自带编码）；请求带页面读到的字节的 SHA-256，
   对不上回 `409`；按文件里写的毫秒和「同一范围里的第几句」找句子，不按解析后的序号（解析器会排序、丢块）；第一次写某个文件前
   复制一份 `<名>.bak`，只复制一次；两个文件都检查通过才写；媒体库以外的文件剧集一律 `403`。页面的出处记在 `Cue.origin` /
   `zhOrigin`，客户端的计数规则必须和 host 一致（没有文本的块也要计数）。
   见 `.agents/notes/implemented/feature/2026-10-11-edit-subtitle-timing.md`。
   五是视频缓存，`src/host/features/video/model/video-jobs.ts`：只写每集文件夹里自己的隐藏文件夹 `.lingualab/`（`<词干>.mp4` 是画面复制加声音转成立体声 AAC，
   `<词干>.m4a` 只是声音，`<词干>.smooth.mp4` 是读者手动要的流畅版，画面重新编码），先写 `<名>.part` 再 `rename`，一次只跑一个任务，失败或取消删掉 `.part`，崩溃或重启留下的在下次起任务时清掉；
   源视频从不被改。路由只收「哪一集哪一段、要画面、只要声音、流畅版，还是改回原画质」，路径、命令行全由 host 自己的扫描算出来，ffmpeg 用参数数组起，不过 shell。
   流畅版一到位就删掉同一词干的原尺寸 `<词干>.mp4`，「改回原画质」删掉流畅版再走普通的准备（删除只发生在没有任务在跑的时候）。
   缓存文件比源文件旧就不算数。只有媒体库里的文件夹剧集有视频，文件剧集没有。
   见 `.agents/notes/implemented/feature/2026-10-12-video-episodes.md` 与 `.agents/notes/implemented/feature/2026-10-13-smooth-video.md`。
   六是手选字幕，`src/host/entities/subtitle-choice/model/subtitle-choice.ts`：文件夹剧集的选择写在剧集文件夹里隐藏的 `.lingualab-subtitles.json`（按段记，没有分段的记在 `folder`），
   先写临时文件再 `rename`，全部改回「按文件名」时删掉这个文件；文件剧集的选择记在 `openState` 里它那条记录的 `subtitles`，重新打开不会冲掉。
   选择只覆盖它点名的槽，其余照旧走 `pairing.ts`；选的文件不在了就按文件名配对，并在 `subtitleChoice.missing` 里报出来，选择本身保留。
   存的时候选的文件必须是那个文件夹里现有的字幕文件。配对规则不再加新标记，规则管不到的命名交给手选。
   见 `.agents/notes/implemented/feature/2026-10-12-choose-subtitles-by-hand.md`。
5. **笔记没有 7 条上限了**：`MAX_PHRASES` 是 500，只防失控的客户端，host 拒绝超长写入。
   「短的工作集」靠评级：一条收藏只有一个状态（`gradeOf` / `withGrade`），从勾和两个标签读出来，勾优先，
   `#hard` 压过 `#review`；评级先清掉勾和这两个标签再设自己的，读者手写的其他标签保留。行格式没有新字段，
   别加。右栏「收藏」的「还在练 / 已记住」视图按它过滤，不靠上限。**不要**再加回弹层询问用户
   替换哪一条。旧的取舍记在 `.agents/notes/implemented/feature/2026-10-08-seven-phrase-ceiling.md`，
   那是当时的决定，不要改它。**收藏的句子按「段 + 整秒 + 文本」匹配**（`keptSentenceKey`），因为 `notes.md`
   只存整秒；别改回比较原始浮点时间。重播收藏也走这把钥匙找回原句（页面的 `keptCueStart`），
   直接 seek 到整秒会落进前一句后面的空隙。段写在 `notes.md` 的 `## <段 id>` 标题里，不进收藏行。
6. **两个半边都按 FSD 分层**：客户端是 `shared → entities → features → widgets → pages`，没有 `app` 层；
   host 只有下三层 `shared → entities → features`，`src/index.ts` 在分层之外收集各个 feature 导出的路由。
   跨切片导入一律走该切片的 `index.ts`，feature 之间不许互相导入，客户端需要组合就在页面里做。
   host 的实体之间要互读，只能经过被读那一方的 `@x/<读者>.ts`；host 的 `shared` 里除 `lib` 外每段都有
   `index.ts`。`npm run lint:fsd` 对两个半边各跑一遍 Steiger，会拦。
7. **快捷键挂在面板容器上**，不许挂 `window`：会话与面板共处一页，抢空格键是敌意行为。
   浮层打开时，容器把键盘让给浮层（页面里那个 `layer` 的提前返回）；收藏已经不是浮层，是右栏的另一个视图。
   复习进行时 `1` 到 `3` 评级、`←` `→` 在队列里走，而不是在句子之间走。带 Ctrl/Cmd/Alt 的组合键
   一律不处理，那是浏览器和宿主的。
8. **跨半边契约走三座桥**：`src/client/shared/protocol.ts`、`notes-format.ts` 与 `stem.ts`（文件名配对只有这一份规则：
   字幕归 `owningStem` 给出的最长词干，`双语` / `bilingual` 是「一个文件两种语言」的标记）。
9. **每篇 note 是三件套**：`.md`、`.zh.md`、`.i18n.yaml`。中文那份是真翻译，不是英文副本。
   改了一侧就跑 `npm run bilingual:check -- --write` 重记哈希。

## 已经踩过的坑

- **TypeScript 钉在 6.0.2**：`typescript-eslint@8` 的 peer 范围还不接受 TS 7。升级前先确认。
- **`zod-validation-error` 直接钉在 4.x**：`eslint-plugin-react-hooks@7` 要
  `zod-validation-error/v4` 这个子路径，而 steiger 依赖的 3.x 会被 npm 提到顶层导致 ESLint
  起不来。根上放一份 4.x，steiger 自己那份嵌在它下面。
- **装依赖要指 registry 与缓存目录**：本机默认 registry 慢，用
  `--registry=https://registry.npmmirror.com --cache <可写目录>`。
- **素材不进 git**：剧集音频放在工作区的 `notes/learning/english/media/`，那个目录自带
  `.gitignore`。别把音频提交进任何仓库。视频转音频、字幕配对见技能 `lingualab-media-prep`。
- **可选服务一律用 `ctx.get(name)` 读**：当成上下文属性读（`ctx.workspaceRegistry`）在服务缺席时会抛错，
  而路由里抛错会被 web 服务兜成一个**空的 400**，页面上看起来就是「什么都没有」。这个坑吃过一次，
  四条路由全中。
- **volatile 的配置字段是盒子**：`z.string().default('').volatile()` 解析出来不是字符串，要 `config.x.get()`
  才是值；写错的话路由同样全炸。它的好处是 settings 服务能在线改，改完下次读就是新值，不用重启。
- **视频在页面里播（2026-10-12 起）**，决定与取舍见 `.agents/notes/implemented/feature/2026-10-12-video-episodes.md`。
  第一版留在外部播放器看的理由还在
  `.agents/notes/implemented/simplification/2026-10-08-v1-without-waveform.md`，那是当时的决定，不要改它。几处别拆：
  整页只有**一个媒体元素**，一个 `<video>`（`useMediaBinding`），音频文件也走它，这样视频的声音和字幕、循环、跟读在一条时间线上，
  不用管两个元素漂不漂；它画在练习页的 `VideoStage` 里，所以元素既在 ref 里（effect 里改它）也在 state 里（出现时让 effect 重跑），
  光放 state 会被 `react-hooks/immutability` 拦。同一段里换来源（先放音频，视频准备好了换成视频）靠 `session` 保持位置，换集不保持。
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
- **布局看练习栏自己的大小，不看窗口**，决定与取舍见 `.agents/notes/implemented/architecture/2026-10-14-layout-answers-to-the-practice-column.md`。
  `.dsh-lingualab-practice` 是 `container:ll-practice/size`，响应式规则写成 `@container ll-practice (...)`，都在 `styles.ts` 末尾那一段
  （要压过前面同优先级的规则，所以放最后）。两个坑：**尺寸查询量的是内容盒**，栏宽要减 48、栏高要减 20 才是写进阈值的数；
  侧栏和字幕栏让窗口宽度几乎说明不了栏有多大，别再写视口断点（样式表测试只放行浏览层的 640）。卡片以上的内容在
  `.dsh-lingualab-practice-main` 里，它是唯一的滚动容器，卡片留在下面；句子是 `flex:1 0 auto`，别改回会缩的。触屏的规则看
  `(hover:none) and (pointer:coarse)`，不看宽度。想看改动的效果，把真组件渲染成静态标记、配真样式表、在浏览器里按 iPad 的各个尺寸读高度。
  **调整时间是一种模式**：页面在调时间面板在场（`usePresence(timing.session !== null, TIMING_EXIT_MS)` 的 `mounted`，比会话多留退出那一会儿）时给练习栏加
  `is-timing`（用类名，不用 `:has()`）。布局跟在场走，按键与舞台上的按钮跟会话走；`mounted` 与 `shown` 由页面算出来传给 `TimingStrip`，
  面板自己不再带计时器，所以栏离开调时间模式与面板卸载是同一次提交。面板从第一帧起就占满高度，只有卡片淡入淡出，**不要**改回长出一个网格行：
  那会让画面先跳到最大再缩小，关闭时布局动两次。这时播放卡片折成进度条加
  「变速 | 上一句、播放、下一句」一行，其余按钮、按键提示和菜单用类名隐藏（不卸载）；在播放的画面是 `ll-video` 尺寸容器，拿走剩余高度；
  剩下不到 120px 时画面的舞台整个收起，句子舞台改成 `flex:1 1 auto` 把句子居中（尺寸容器缩不了自己，所以由页面里
  `usePictureRoom`（开关是面板在场，不是会话）量出来、给练习栏加 `is-picture-squeezed`，128px 才回来；量的是滚动容器高度减去不随画面变的部分，绝不读画面自己的盒子，不然自己追自己；
  别再加回画面上的 `@container ll-video (max-height)` 规则）；调时间面板在栏宽不到 648px 或栏高不到 780px 时是一行一个边缘的紧凑布局。文字长的按钮同时画长短两个文字
  （`dsh-lingualab-label-long` / `-short`），样式表挑一个，全文留作 `aria-label` 与 `title`。新增一个调时间时要隐藏的东西，加进
  `styles.ts` 末尾 `.is-timing` 那一段，别写成对面板的 `:has()`。
- **舞台上的拖选走指针事件，不走鼠标事件**：iOS 的手指在拖动时不发任何鼠标事件（只在点一下之后补发合成的），所以 `mousedown`、`mouseenter`、
  `mouseup` 的拖选在 iPad 上只剩单点能用；手指在滚动栏里拖是滚动，长按则是系统的文字选择。触摸指针还会被按下的那个元素隐式捕获，**别的单词永远收不到
  进入事件**，所以不能靠每个词上的 `onMouseEnter`，要在 `pointermove` 里用 `document.elementFromPoint` 按坐标找词。`touch-action` 对非替换的行内元素
  **不生效**（词是 `span`），所以写在整块英文 `.dsh-lingualab-stage-en:not(.is-masked)` 上，连同关掉文字选择与长按菜单；整句因此不能当滚动的起点，
  舞台其余部分仍可以。拖选的逻辑是 `widgets/practice-stage/lib/word-drag.ts` 里不依赖 React 的纯模块，用假的指针源在 node 里测；
  鼠标的 `mousedown` 仍要 `preventDefault`，否则文字选择会盖住选中的词组。点气泡外面关闭也挂在 `pointerdown` 上。
- **点过按钮空格还得管用，靠的是鼠标不把焦点留在按钮上**：Windows 上 Chrome 点按钮会把焦点给按钮，而点了就消失的按钮
  （大画面的「R 看一眼这句」、舞台上的「R」揭开）会把焦点丢给文档，落到面板容器外，快捷键就死到下次点页面。页面根的 `onMouseDown`
  对按钮 `preventDefault`（`shared/lib/focus.ts` 的 `holdsMouseFocus`，模态层与设置抽屉除外，它们自己读键盘），容器的 `onKeyDown`
  则让按钮上的空格与回车归按钮自己（`keepsKeyForTarget`，Tab 过去的人照常能按）。会在被按下时消失的按钮，点击里先
  `returnFocusToPage` 再改状态，键盘按下时焦点也不会丢。新加会自己消失的按钮照做。
- **大画面的外框贴着画面**：`.is-large` 舞台是 `container-type:size`，外框宽是 `min(100cqw,1100px,100cqh * 比例)` 加 `aspect-ratio`，
  比例是 `--ll-video-ratio`，由 `VideoStage` 在元素 `loadedmetadata` 与 `resize` 后写成真实的 videoWidth/videoHeight，之前按 16:9。
  不要把外框改回 `flex:1`，那会让上下出黑边，角标和按钮就落在黑边里。
- **改了源码要重启隔离实例并强刷安装副本**：宿主半边要重启才生效；而 profile 用 `file:` 装 tar 包时，
  版本号没变是不会换新文件的，得 `rm -rf node_modules/<包名> && npx pnpm@11.22.0 install --force`，
  否则你在浏览器里验的还是上一版。
- **只有真在浏览器里打开面板才能发现的 bug**：空列表返回新的 `[]` 会让页面的 reset 副作用每次渲染
  都跑一遍，React 报 #185。typecheck、ESLint、单测全绿也拦不住，所以改完客户端一定要在隔离实例里
  打开看一眼 console。
- **页面有两个视图**：首页（接着上次大卡片、剧集卡片网格、虚线拖放区）与练习。练习视图是顶栏 48，
  下面左右分栏：左边是舞台（当前句、前后句、播放卡片、按键标签），右边是字幕栏（唯一滚动区，
  宽度 `clamp(300px,34%,440px)`），栏头的分段控件或 `N` 把它换成「收藏」，宽度和滚动都一样。改布局时不要把整页变成滚动容器：舞台必须钉住，否则「听这一句」
  又要跟着列表滚走。播放卡片只放每分钟都用的控件，低频的收进「更多」。设计稿在 Figma，链接在 README
  与 AGENTS.md，稿里是写死的色值和 Inter，落地只用宿主 token。
- **练习页的几个行为各有出处，别拆**：进度条（`Scrubber`）拖动期间只在松手时 seek 一次；
  跟读模式（store 的 `pauseAfterSentence` 与 `revealed`）在 `onTime` 里判断，只对刚播完的那一句生效，
  有循环时让循环管结尾；点词气泡把词写进备注的 `[word]`（`features/notes/lib/words.ts`），拖选或 `Shift` 点选的词组
  也是一个 `[her skirt]`，再点「已记下」就去掉，不新增笔记字段；复习（`features/review`）是练习页的一种模式，
  英文用跟读的同一套遮挡，复习期间不写听到哪里；
  听完小结靠 store 的 `finishCount`，卡片按次数关闭，不按剧集。`reset` **不能**清掉 `duration`，字幕
  通常晚于音频元数据读完，清掉进度条就废了。
- **进度合并没有删除记号**：两边都是「每个键取最新」的并集，所以从 `.lingualab-progress.json` 删掉一条，
  任何见过它的浏览器缓存（`dsh-lingualab:progress` / `dsh-lingualab:steps`）下次同步都会把它写回来。
  清测试数据要连同测试用的浏览器缓存一起清。
- **浮起来的面板用 `--ll-surface`（即 `bg-layer-1`），不用 `bg-overlay`**：后者是宿主的遮罩色，
  深色下是偏亮的灰（实测 `#61666b`），抽屉、卡片涂上它会发白。验深色一定要真截图，别凭 token 名猜。
- **复选框不算「正在输入」**：`isTypingTarget` 把 `input` 一律当输入框，打勾后焦点留在复选框上，
  `Esc` 和快捷键全部失效。现在只有文本类输入才拦。- **样式只读宿主声明过的 token**：`bg-base`、`bg-layer-1/2`、`bg-overlay`、`border-l1/l2`、
  `brand-primary`、`label-primary/secondary` 和四个 state。用 `cordis_inspect_query` 的 `Theme.listTokens`
  核对。`label-tertiary`、`bg-layer-3`、`bg-mask-1`、`interactive-bg-hover` 不存在，会静默落到只对
  一种主题调好的回退值；需要这些深浅时用 `color-mix`（见 `styles.ts` 顶部的 `--ll-*`）。
- **React Compiler 的 lint 不让在渲染里读 ref**：把 ref 传给子元素或在 render 里调 `.current` 都会被
  `react-hooks/refs` 拦。文件选择按钮用 `<label>` 包隐藏的 `<input>`（`FilePicker`），不要写成
  `ref.click()` 再传下去。
- **`layout.selectPanel` 之外的入口只有一处**：这一页由「应用」页的卡片打开，`panel` 字段写的是
  `lingualab`。改 `PANEL_ID` 就要同步改 `dsh-apps-panel` 的注册表，否则卡片点了没反应。
- **主题是覆盖宿主 token，不是第二套颜色**：`features/settings/lib/themes.ts` 里每套主题有浅、深两份调色板，键就是页面读的那十一个
  `--dsw-alias-*`。`resolveThemeVars(theme, appearance, hostDark)` 是纯函数：默认主题加「跟随 dsh」返回 `null`（什么也不设，和以前一模一样），
  否则返回要写到 `.dsh-lingualab-page` 根元素 inline style 上的变量和 `colorScheme`，`--ll-*` 派生值在同一个元素上跟着重算。
  宿主的明暗看 `<body>` 上有没有 `data-ds-dark-theme` 属性，`useHostDark` 用 MutationObserver 盯它。样式继续只读那十一个 token，
  不要写死色值；加一套主题就是改 `THEMES` 表，再补 locale 里的名字与描述。设置存在 `localStorage` 的 `dsh-lingualab:settings`，
  只在这台设备上，不进 host，也不进进度文件。舞台字号靠根元素的 `data-ll-stage-size` 与 `--ll-stage-scale`。「中文显示」也在这份设置里，控制栏按钮和 `C` 键都写 `setZhMode`，页面不再自己存一份。设置抽屉（`widgets/settings-panel`）
  照着五步法抽屉做，和它互相关闭，抽屉里的按键不冒泡给页面快捷键。

## 发版与 Release（2026-10-08 定）

```sh
npm run release -- patch|minor|major   # 抬版本 + 把 Unreleased 挪成带日期的版本节 + 提交
npm run release:notes [版本号]          # 打印这一版的正文（GitHub Release 用的就是它）
git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z   # 合并到 main 之后，唯一手动的一步
```

- 版本号的唯一来源是 `package.json`。更新日志是中英一对文件（`CHANGELOG.md` 与 `CHANGELOG.zh.md`），
  `check-changelog` 对两侧都要求「最新的发行版标题跟版本号一致」且那一节非空；`release` 一次把
  两侧的 Unreleased 都挪成新版本节，漏掉一侧下次跑检查就会报出来。
- Release 正文两侧都带，先中文后英文，由 `release-notes.mjs` 合成。
- PR 到 `main` 时 CI 的 `version-bump` job 会比对 base 分支的版本，没抬高就合不进去。
- 标签推上去后 `.github/workflows/release.yml` 建 GitHub Release，并且会先核对标签名与
  `package.json` 的版本是否一致，不一致直接失败。
- **不发 npm**，全仓没有 publish 步骤。

## 文档分工

**为什么** → `.agents/notes/`；**是什么** → README 与源码注释；**怎么干活** → 这份技能；
**每轮必读** → `AGENTS.md`。没有 `docs/INDEX.md`，README 加链接就是索引。
