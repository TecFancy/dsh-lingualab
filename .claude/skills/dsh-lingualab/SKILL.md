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
   新增路由要同时改 `src/index.ts` 的注册、这份 naming 记录与 README 的路由表。
2. **笔记格式只有一处解析**：`src/shared/notes-format.ts`。面板与 host 都走它，别在任一侧
   写第二份正则。文件剧集（`file.` 开头的 id）的笔记不走文件，存在插件 profile 的 `openState` 里。
3. **浏览只认 place id，不认路径**：页面传 `ws_<哈希>` 或 `lib`，由 host 自己解析成绝对路径
   （`src/host/places.ts`）。`/`、`/etc`、`/proc` 这类根一律拒绝，`rel` 拒绝 `..` 与绝对路径，
   每一步都 `realpath` 之后再确认仍在根内。**不要**为了让某条路由方便而接受浏览器传来的路径。
3a. **每一条路由都先过宿主的请求信任**（`src/host/guard.ts`，`index.ts` 里 `.map(guarded)`）：它调
   `ctx.get('connection').admit(req)`，检查回环的 `Host`、匹配的 `Origin` 与签名的会话 cookie，不满足回
   `401`/`403`；没有 connection 服务时一律回 `403`，不是放行。**这才是访问控制。** 宿主的信任只罩 `/api`
   与 RPC，插件自己注册的路由不在其内，所以漏了这一步，任何把主机名重绑到 127.0.0.1 的页面、本机任何进程
   都能调。新增路由不要绕开 `guarded`，读路由也一样。`x-lingualab-import` 请求头只是第二道检查，防不住上面两种。
4. **写素材目录只有四处，都很窄**：一是文件夹剧集里的 `notes.md`；二是媒体库根目录的隐藏文件
   `.lingualab-progress.json`（`src/host/progress.ts`，听到哪里与五步勾选；分段的位置键是
   `<集>::<段>`（`segmentKey`），五步仍按集；POST 按「每个键取最新 `updatedAt`」合并而不是覆盖，先写临时文件再 `rename`，因为这个文件本来就是要被替换的；坏文件按空读；
   不要把进度塞回 `openState` 配置，那会让每几秒一次的写入去重写 profile）；三是 `src/host/import.ts`，
   收用户拖进来的音频与字幕。库扫描、浏览、打开仍然全部只读。导入的底线不许松：**不覆盖已有文件**
   （名字在就报 `exists`，放到位用 `link`，不支持硬链接的卷退回 `COPYFILE_EXCL`，**不用 `rename`**，它在
   所有平台上都会替换目标）、只收扫描读的扩展名、名字在 host 清洗、媒体目录不能是系统文件夹
   （`forbiddenReason`）、建好文件夹后再确认仍在根内、先写随机命名的隐藏 `.part` 再放到位、崩溃留下的旧
   `.part` 下次写这个文件夹时清掉、同时最多两个上传（超了回 `429`）、单个文件 2 GB（流式限额，不信
   `content-length`）。文件剧集的笔记仍然落在 profile 里，不要改成在音频旁边建文件。
   见 `.agents/notes/implemented/feature/2026-10-09-home-first-and-drop-to-import.md`。
   四是 `src/host/timing.ts`，把一句的开头和结尾写回媒体库里的字幕文件：只换那一句的时间行，其余字节不动（按 Latin-1
   读写，GBK 与 GB18030 因此原样保留，UTF-16 带 BOM 的走 Node 自带编码）；请求带页面读到的字节的 SHA-256，
   对不上回 `409`；按文件里写的毫秒和「同一范围里的第几句」找句子，不按解析后的序号（解析器会排序、丢块）；第一次写某个文件前
   复制一份 `<名>.bak`，只复制一次；两个文件都检查通过才写；媒体库以外的文件剧集一律 `403`。页面的出处记在 `Cue.origin` /
   `zhOrigin`，客户端的计数规则必须和 host 一致（没有文本的块也要计数）。
   见 `.agents/notes/implemented/feature/2026-10-11-edit-subtitle-timing.md`。
5. **笔记没有 7 条上限了**：`MAX_PHRASES` 是 500，只防失控的客户端，host 拒绝超长写入。
   「短的工作集」靠笔记抽屉的「还在练 / 已记住」视图，不靠上限。**不要**再加回弹层询问用户
   替换哪一条。旧的取舍记在 `.agents/notes/implemented/feature/2026-10-08-seven-phrase-ceiling.md`，
   那是当时的决定，不要改它。**收藏的句子按「段 + 整秒 + 文本」匹配**（`keptSentenceKey`），因为 `notes.md`
   只存整秒；别改回比较原始浮点时间。重播收藏也走这把钥匙找回原句（页面的 `keptCueStart`），
   直接 seek 到整秒会落进前一句后面的空隙。段写在 `notes.md` 的 `## <段 id>` 标题里，不进收藏行。
6. **客户端按 FSD 分层**：`shared → entities → features → widgets → pages`，没有 `app` 层。
   跨切片导入一律走该切片的 `index.ts`，feature 之间不许互相导入，需要组合就在页面里做。
   `npm run lint:fsd` 会拦。
7. **快捷键挂在面板容器上**，不许挂 `window`：会话与面板共处一页，抢空格键是敌意行为。
   浮层打开时，除笔记抽屉外，容器把键盘让给浮层（页面里那个 `layer` 的提前返回）；带 Ctrl/Cmd/Alt 的组合键
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
- **视频不做内嵌**，留在 NAS 上用外部播放器看，理由见
  `.agents/notes/implemented/simplification/2026-10-08-v1-without-waveform.md`。
- **改了源码要重启隔离实例并强刷安装副本**：宿主半边要重启才生效；而 profile 用 `file:` 装 tar 包时，
  版本号没变是不会换新文件的，得 `rm -rf node_modules/<包名> && npx pnpm@11.22.0 install --force`，
  否则你在浏览器里验的还是上一版。
- **只有真在浏览器里打开面板才能发现的 bug**：空列表返回新的 `[]` 会让页面的 reset 副作用每次渲染
  都跑一遍，React 报 #185。typecheck、ESLint、单测全绿也拦不住，所以改完客户端一定要在隔离实例里
  打开看一眼 console。
- **页面有两个视图**：首页（接着上次大卡片、剧集卡片网格、虚线拖放区）与练习。练习视图是顶栏 48，
  下面左右分栏：左边是舞台（当前句、前后句、播放卡片、按键标签），右边是字幕栏（唯一滚动区，
  宽度 `clamp(300px,34%,440px)`）。改布局时不要把整页变成滚动容器：舞台必须钉住，否则「听这一句」
  又要跟着列表滚走。播放卡片只放每分钟都用的控件，低频的收进「更多」。设计稿在 Figma，链接在 README
  与 AGENTS.md，稿里是写死的色值和 Inter，落地只用宿主 token。
- **练习页的几个行为各有出处，别拆**：进度条（`Scrubber`）拖动期间只在松手时 seek 一次；
  跟读模式（store 的 `pauseAfterSentence` 与 `revealed`）在 `onTime` 里判断，只对刚播完的那一句生效，
  有循环时让循环管结尾；点词气泡把词写进备注的 `[word]`（`features/notes/lib/words.ts`），不新增笔记字段；
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
