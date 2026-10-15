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
npm run betterer     # 体量门：把现状记进 .betterer.results（拆小之后收紧用）
npm run betterer:ci  # 体量门：只检查，从不写文件（全档里跑这个）
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

- **页面的键盘是数据（2026-10-15 起）**：`pages/lingualab/lib/keymap.ts` 的 `keyAction(按键, 上下文)` 是纯函数，返回一个动作
  （`toggle-play`、`step`、`review-back`……）或 `null`（不归面板）。按键怎么判是它的，判完做什么是 `key-actions.ts` 的一张表，
  事件怎么拦、哪个键帽亮是 `useKeyboard.ts`。新增快捷键就是三处各加一条：keymap 里的判定与它的测试、key-actions 里这个动作做什么
  （类型会提醒漏了哪个）、需要亮键帽就在 `flashOf` 里加。DOM 才答得了的两个问题（在输入框里、焦点在按钮上）由 `useKeyboard` 问好当布尔值传进去，
  所以 keymap 不碰 DOM。「更多」菜单的 Escape 是动作 `close-menu`，带着菜单没开时 Escape 的含义（`otherwise`），一次按键只关一层。
- **体量门，`npm run betterer:ci`（2026-10-15 起）**：Betterer 用 ESLint 数 `src/` 两个半边里超标的点（`complexity` 15、`max-lines` 250、
  `max-lines-per-function` 80，后两个不数空行与注释；测试与 `testing/` 不管；阈值与 fsd-react 一致），现状记在 `.betterer.results`。
  这是一道棘轮：**超标的点只能变少、变小，不能变多、不能变大**。`.betterer.ts` 没有直接用 `@betterer/eslint` 的 `eslint()`，而是照它的写法包了一层，
  把问题记成「与大小成比例、与位置无关」的一组，原因与取舍见 `.agents/notes/implemented/process/2026-10-15-size-gate-and-page-split.md`：
  - **记法**：文件每超出 250 行（不足 10 行按 10 行算）一档记一个问题，函数每超出 80 行一档记一个，复杂度每超出 15 一点记一个；问题都记在文件开头，
    身份是规则、函数名（匿名函数用它那一行的文本）、同名的第几个、第几档，不含行号。所以 `.betterer.results` 里没有行号，也没有文件哈希。
  - **变大就失败**：已超标的函数或文件长过当前这一档，多出一个问题，`betterer:ci` 说「变差了」。一档里的 10 行是松动，档内多写几行不失败；
    复杂度每多一点就失败。
  - **新超标也失败**：新写一个超 80 行或复杂度超 15 的函数、一个超 250 行的文件，包括加在 baseline 里已有文件里的新函数，一样失败，并指出那一处。
  - **改文案、改样式、在上面加行都不碍事**：只要没有跨档，`.betterer.results` 就不变，`betterer:ci` 照过，不需要为此重跑 `npm run betterer`。
    改了函数名，或改了匿名函数那一行的文本，身份就变了，会读成「修好一个、出现一个」而失败。这时要么改回去，要么顺手拆小；
    `npm run betterer` 遇到变差不会写（退出码 7），只有在评审里说明之后才用 `--update`。
  - **拆小之后收紧**：把超标的函数或文件缩过一档，`betterer:ci` 说「变好了」并因为文件过期失败（退出码 7）；跑 `npm run betterer`，baseline 里对应的
    问题消失，把改过的 `.betterer.results` 一起提交，之后它就回不去了。
  - **`.betterer.results` 合并冲突不要手改**，跑 `npx betterer merge`，再跑一遍 `npm run betterer` 确认。
  - **给新工作的规矩**：新逻辑进切片自己 `lib/` 里带测试的 hook 或纯函数；一个组件眼看要过 80 行就拆成几个小组件，不是把它记进 baseline。
    页面（`LingualabPage`）因为要组合很多 feature 仍在 baseline 里，那是现状，不是许可：它回不到更大。
  - 它只在全档里跑，约 20 秒，所以提交前钩子不拦；拆了大函数的提交要自己记得跑一遍 `npm run betterer`。
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
  **画面在收起面板时也会让位**：播放中的画面舞台（`:not(.is-timing) .videostage.is-shown.has-screen`）的 `flex-basis` 是画面本来的高度
  （份额、720px、高度上限三者最小，用 `--ll-pic-share` 与 `--ll-pic-h`，这两个变量舞台和画面都要有），`flex-shrink:1`，是 `ll-video` 尺寸容器；
  舞台写了 `box-sizing:content-box`，别删，宿主若有全局 border-box 重置，基准值会少 20px。`usePictureRoom` 的开关是「画面在显示状态下播放」，
  不再是面板在场；不到 120px 收起舞台的规则不带 `is-timing`，但句子舞台的 `flex:1 1 auto` 只在调时间时给，收起面板时句子不许缩到文字以下。
  不到 160px 的画面不画角落的胶囊（`ll-video (max-height:159px)`，只管画面上画什么）。**量布局要按真实 Safari 的可见高度**：iPad 的状态栏加工具栏
  占 74px（紧凑标签）到 110px（单独标签栏），所以 iPad mini 横屏是 1133 乘 670 与 634，Air 11 寸是 1180 乘 746 与 710，Pro 11 寸是 1194 乘 760 与 724，
  Pro 13 寸是 1366 乘 950 与 914，不是整机分辨率；滚动条按 iPad 的悬浮式量（桌面 Chrome 的 15px 滚动条会多换一行）。
  **代替画面的卡片也会让位，而且是分步的**：卡片是一段文字加按钮，高度随它是哪张、带不带流畅版与本地文件而变，样式表算不出来，所以由页面试出来。
  `useCardFit(practiceMain, card !== null && !videoPlays)` 每次从完整的卡片开始，依次给滚动容器 `.dsh-lingualab-practice-main` 加
  `is-card-compact`（收紧）、`is-card-lean`（去掉图标、说明、备注、流畅版与本地文件，正文最多两行）、`is-card-line`（一行）、`is-card-hidden`（整个舞台不画），
  看 `scrollHeight` 是否还大于 `clientHeight`，第一个不再滚动的就是答案；都不行就留 `line`，因为藏起卡片也解决不了，准备视频的入口得留着。选择与类名的逻辑是
  `card-fit.ts` 里的纯函数，测试也在那里。类名由钩子直接设在这个元素上，React 从不写它的 class，所以没有状态也不重渲染；`VideoStage` 画着卡片时给舞台加
  `has-card`，钩子靠它找卡片，调时间期间舞台是 `display:none`，钩子就不量。每次都从头试，所以答案只看空间与卡片，不看上一步，不需要滞回。每一步各画什么在
  `styles.ts` 里 `.is-card-*` 那一段，新增卡片内容时想好它在哪一步消失；按钮的 44px 是 `min-height`，任何一步都不许设按钮的 `min-height`。
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
  有循环时让循环管结尾；播完之后做什么交给纯函数 `planShadow`（`features/media-player/lib/shadow.ts`），复述停顿是
  store 里的 `shadowWait` 状态，计时器在 `useMediaBinding` 里，读者的任何操作（`toggle`、`seek`、切句、循环、`setPlaying`）
  都经 `IDLE_PROGRAM` 清掉它，新增会动播放的入口时也要清，否则过期的停顿会在别处接着放；跟读的录音对比（`record` 设置、`D` 键与「对比」按钮）接在同一套程序上：复述停顿由 `useTakes`（`features/media-player/lib/useTakes.ts`，被 `useMediaBinding` 调用）用 `recordPause` 录下来，`capturing` 说明有录音开着，停顿一结束 `planShadow` 就给 `compare`，store 的 `compare`（`original` 再 `take`，`then` 是 `program` 或 `stop`）先再放原句、再让一个共享的 `Audio` 放录音（`take-player.ts`，整页只有这一个录音元素，不是每遍新建：iOS 只让在手势里播放过的元素之后不经手势发声，所以 `primeTakeAudio` 要在开关、「对比」、播放、空格、`D` 与面板容器上的捕获监听这些手势里同步调用，浏览器拒绝了就保持未解锁、下次手势再试，释放一遍录音时保留元素），源媒体停在句首等着，所以那一个媒体元素仍是唯一的时间线；`compare` 也在 `IDLE_PROGRAM` 里，任何动播放的入口都会让录音停下、让录音播放停下。浏览器 API 全在 `lib/recorder.ts`（有假的 `MediaRecorder` 与 `getUserMedia` 可测），录完立刻停掉麦克风的轨道（iOS 会因为开着的麦克风压低播放音量），格式用 `isTypeSupported` 选。录音只在内存里，每句留最后一遍，随 `reset`、回首页和页面卸载丢掉并释放对象 URL，`takesEpoch` 防止关了集之后才录完的那一遍落进新一集；不写盘、不发 host、不打分。录音只存在于复述停顿之内：`mergeShadow` 保证 `record` 为真时停顿不是 `off`（打开开关会把关着的停顿设成「一句长」，关掉停顿开关也关）。麦克风用不了就关掉开关并经 `micNotice` 在页面顶部给一句话，程序照常跑；点词气泡把词写进备注的 `[word]`（`features/notes/lib/words.ts`），拖选或 `Shift` 点选的词组
  也是一个 `[her skirt]`，再点「已记下」就去掉，不新增笔记字段；复习（`features/review`）是练习页的一种模式，
  英文用跟读的同一套遮挡，复习期间不写听到哪里；
  听完小结靠 store 的 `finishCount`，卡片按次数关闭，不按剧集。`reset` **不能**清掉 `duration`，字幕
  通常晚于音频元数据读完，清掉进度条就废了。
- **耳机、AirPods 与锁屏按键走 Media Session，不走键盘**，决定与取舍见 `.agents/notes/implemented/feature/2026-10-14-shadowing-as-the-repeater-loop.md`。
  `useMediaSession`（`features/media-player/lib/`，页面在练习视图打开时调用）注册 `play`、`pause`、`stop`（按暂停算）、`previoustrack`、`nexttrack`，
  回首页或页面卸载就清掉处理函数、元数据与状态，没有开关：没有处理函数时浏览器会绕过 store 直接动媒体元素。几处别拆：
  **播放按钮、空格键与这些处理函数都调 `togglePlayback`**（`lib/transport.ts`，录音开着时先 `primeTakeAudio`，再 store 的 `toggle`），不要在哪一处再写一份；
  `play` 与 `pause` 带 `isRunning` 的条件，不是直接切换，因为复述停顿里媒体是暂停的而会话报告 `'playing'`，耳机发来的 `play` 不该把程序停掉。
  **不要注册 `seekbackward`、`seekforward`、`seekto`**（前两个明确设成 `null`）：iOS 一旦有 seek 处理函数，锁屏和 AirPods 就改成「跳过 N 秒」，上一首、下一首没了。
  上一首、下一首照页面的方向键映射：复习进行时是队列里往回和跳过，复习小结打开时不动；映射就是键盘那一份（`lib/keymap.ts` 的
  `headsetAction`，用同一个 `keyAction` 把只关乎焦点的状态关掉再问），不要在页面里再抄一遍。元数据由纯函数 `sessionMetadata` 算，
  标题复用 locale 的 `cueOf`，专辑复用 `appTitle`；浏览器那一半在 `media-session.ts` 的环境对象后面，用假 session 测，每次调用都包了 try/catch。
  没有真机验过，AirPods 与锁屏的实际表现见 note 里「To verify on a real iPad」那一条。
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

## 发版与 Release（2026-10-08 定，2026-10-15 改成一条命令）

```sh
npm run ship -- patch|minor|major [--no-wait] [--dry-run]   # 在 development 上：检查、抬版本、verify、推送、开 PR、等全绿、合并、同步回来
npm run ship -- --continue [--dry-run]                      # 接着走 --no-wait 留下的 PR：读一次检查，全绿就合并并同步
npm run deploy [-- --dry-run]                               # 服务器拉取、重启、确认 active
npm run release:notes [版本号]                               # 打印这一版的正文（GitHub Release 与 PR 正文用的就是它）
```

**运行 `ship -- patch|minor|major` 就是发版的决定**，之后只剩 `npm run deploy`。`ship` 必须在检出了 `development` 的那份
工作副本里跑（现在是主检出 `D:\source\personal\dsh-lingualab`，git 不允许同一个分支在两个 worktree 里检出）；
它落后于 origin 时先拉一下（检查本来就会拒绝落后的状态）。

**`ship` 做什么**（`scripts/ship.mjs`，规则在 `scripts/lib/release-plan.mjs`，带单测）：

1. 检查：在 `development`、工作区干净、fetch 后不落后于 origin/development、`gh auth status` 通过、
   两侧 CHANGELOG 的 Unreleased 都非空、目标版本的标签（本地和 origin）还没有、没有已开着的发版 PR、
   `package.json` 与 origin/main 同版本。所有问题一次列完，不是撞一个报一个。
2. 抬版本：调现成的 `scripts/release.mjs`（不重复它的逻辑），再跑完整的 `node scripts/verify.mjs`，推送 `development`。
3. 开 PR：`gh pr create --base main --head development`，标题 `chore(release): vX.Y.Z`，正文是 `release-notes.mjs` 的输出。
4. 等检查：`gh pr checks --watch --fail-fast`。
5. 合并：重新核对一遍现场，再 `gh pr merge --merge --subject "chore(release): vX.Y.Z (#n)"`。
6. 同步回来：fetch、`git merge --ff-only origin/main`、推送 `development`。

**`--no-wait` 与 `--continue`** 是两步的形式，给不该轮询 CI 的调用方（agent）用：`ship -- patch --no-wait` 开完 PR 就停；
CI 跑完之后 `ship -- --continue` 找到开着的 development 到 main 的 PR，**只读一次**检查，不轮询。还在跑退出码 3
（等一等再来）；有失败退出码 1 并点名；全绿才做第 5、6 步。状态一律从 git 和 gh 现查，没有状态文件。

**`--dry-run`**：检查是真跑的（它们只读），会改东西的命令（`release.mjs`、verify、push、`pr create`、`pr merge`、ssh）
只打印不执行。检查没过时 dry-run 只报告、继续演示计划，所以在功能分支上也能看全流程。

**为什么没有发布分支，也没有往 development 的 PR**：仓库是私有库、免费计划，`development` 没有分支保护，而推到
`development` 本来就会在 CI 里跑完整 verify，发布分支加 PR 只是多一轮同样的检查。往 `main` 的 PR 保留，它的
`version-bump` job 把关版本号有没有抬。合并用合并提交，不用 squash（squash 只是为 release-please 服务过）。

**标签不再本地打**：PR 合进 `main` 后，`.github/workflows/release.yml`（push 到 main，或手动触发）读
`package.json` 的版本，标签 `vX.Y.Z` 已存在就跳过，否则用 `release-notes.mjs` 生成正文，`gh release create --target $GITHUB_SHA`
一次建出标签与 GitHub Release。这一版的更新日志节找不到就让这次运行失败。人只做一个决定：运行 `ship`。
`release.mjs` 因此不再有 `--tag`。

**部署**（`scripts/deploy.mjs`）：目标从环境变量读，缺了会报并给出设置办法。

| 变量 | 含义 | 当前值（示例，不是秘密） |
|---|---|---|
| `LINGUALAB_DEPLOY_HOST` | ssh 主机（`~/.ssh/config` 别名） | `tencent-cloud` |
| `LINGUALAB_DEPLOY_PATH` | 远端仓库的绝对路径 | `/workspace/lingualab` |
| `LINGUALAB_DEPLOY_SERVICE` | 可选，systemd 服务 | `dsh-web.service`（缺省） |

**Git Bash 的坑**：它会把环境变量里的 `/data/...` 改写成 `C:/Program Files/Git/data/...`，部署路径就错了（脚本认得出来并报错）。
先 `export MSYS2_ENV_CONV_EXCL=LINGUALAB_DEPLOY_PATH`，或者把路径写成 `//data/...`，或者在 PowerShell 里设。

流程全走 `ssh -o BatchMode=yes`，参数用数组传，不拼本地 shell 字符串，Git Bash 与 PowerShell 都能跑：
`git pull --ff-only`；打印服务器上 `package.json` 的版本并与 origin/main 的对比（不一致只警告）；
`sudo -n systemctl restart`；等几秒后 `systemctl is-active` 必须是 `active`，否则退出码 1 并给出看日志的命令。
**部署只证明服务起来了，页面在浏览器里对不对仍然要自己看一眼**（宿主半边的改动尤其如此）。

**不变的规矩**：

- 版本号的唯一来源是 `package.json`。更新日志是中英一对文件（`CHANGELOG.md` 与 `CHANGELOG.zh.md`），
  `check-changelog` 对两侧都要求「最新的发行版标题跟版本号一致」且那一节非空；`release` 一次把
  两侧的 Unreleased 都挪成新版本节，漏掉一侧下次跑检查就会报出来。
- Release 正文两侧都带，先中文后英文，由 `release-notes.mjs` 合成。
- PR 到 `main` 时 CI 的 `version-bump` job 会比对 base 分支的版本，没抬高就合不进去。
- **不发 npm**，全仓没有 publish 步骤。
- 决策的来龙去脉在 `.agents/notes/implemented/process/2026-10-15-one-command-release.md`。

## 文档分工

**为什么** → `.agents/notes/`；**是什么** → README 与源码注释；**怎么干活** → 这份技能；
**每轮必读** → `AGENTS.md`。没有 `docs/INDEX.md`，README 加链接就是索引。
