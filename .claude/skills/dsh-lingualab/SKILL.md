---
name: dsh-lingualab
description: 在 dsh-lingualab 仓库里干活时的操作手册：两个半边怎么分工、改完必须跑什么、lib/ 为什么要提交、哪些坑已经踩过，细节按主题放在 references/。提到「继续做语言实验室 / 改精听面板 / lingualab 出问题了」时加载。
---

# dsh-lingualab 操作手册

「语言实验室」是 dsh 的一个整页面板插件：读工作区里的音频与字幕，做逐句精听，笔记写回磁盘给
agent 读。页面注册在 `main` 槽的 `lingualab` 键上，**入口是「应用」页上的卡片**：
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

前五条的全文与理由在 references 里，动到相关代码之前先读对应那份。

1. **路由路径只有一处定义**：`src/shared/protocol.ts` 的路径常量，同时记在 `dsh-plugin.naming.json`，
   `check-host.mjs` 会把两边对上。见 [host.md](references/host.md)。
2. **笔记格式只有一处解析**：`src/shared/notes-format.ts`，面板与 host 都走它，别在任一侧写第二份正则。
   见 [notes.md](references/notes.md)。
3. **浏览只认 place id，不认路径**，路径由 host 自己解析和检查。
   3a. **每一条路由都先过宿主的请求信任**（`guarded`），这才是访问控制，读路由也一样。见 [host.md](references/host.md)。
4. **写素材目录只有六处，都很窄**：`notes.md`、进度文件、导入、字幕时间、视频缓存、手选字幕。导入从不覆盖已有文件。
   见 [host.md](references/host.md)。
5. **笔记没有 7 条上限了**：短的工作集靠评级，不要再加回上限或「替换哪一条」的弹层。见 [notes.md](references/notes.md)。
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

## 每次都要记得的坑

- **素材不进 git**：剧集音频放在工作区的 `notes/learning/english/media/`，那个目录自带
  `.gitignore`。别把音频提交进任何仓库。视频转音频、字幕配对见技能 `lingualab-media-prep`。
- **只有真在浏览器里打开面板才能发现的 bug**：空列表返回新的 `[]` 会让页面的 reset 副作用每次渲染
  都跑一遍，React 报 #185。typecheck、ESLint、单测全绿也拦不住，所以改完客户端一定要在隔离实例里
  打开看一眼 console。
- **`layout.selectPanel` 之外的入口只有一处**：这一页由「应用」页的卡片打开，`panel` 字段写的是
  `lingualab`。改 `PANEL_ID` 就要同步改 `dsh-apps-panel` 的注册表，否则卡片点了没反应。

## 按需再读

| 要做的事 | 读这份 |
|---|---|
| 改 host、新增路由、碰写盘的代码，可选服务与 volatile 配置，重启隔离实例 | [references/host.md](references/host.md) |
| 改笔记格式、收藏上限与评级、收藏怎么匹配原句 | [references/notes.md](references/notes.md) |
| `betterer:ci` 报错、拆了大函数、`.betterer.results` 冲突 | [references/size-gate.md](references/size-gate.md) |
| 升级依赖、`npm ci` 失败、装依赖慢 | [references/toolchain.md](references/toolchain.md) |
| 视频准备、播放来源、流畅版、大画面 | [references/video.md](references/video.md) |
| 练习页布局、右栏、调时间模式、画面与卡片让位 | [references/layout.md](references/layout.md) |
| 快捷键、拖选、焦点、跟读与录音、复习、耳机按键 | [references/practice.md](references/practice.md) |
| 样式、颜色 token、主题、React Compiler 的 lint | [references/styling.md](references/styling.md) |
| 发版、往 `main` 的 PR、部署 | [references/release.md](references/release.md) |

## 分支与改动流程（2026-10-21 定）

- **不允许直接在 `main` 上修改。** `main` 只接从 `development` 来的发布 PR。
- **可以直接在 `development` 上修改。**
- 改动要基于 `origin/development` 时，按三步走：
  1. 先把本地 `development` 从 `origin/development` 更新同步，例如 `git fetch origin development:development`，
     或切到 `development` 后跑 `git pull --ff-only`。
  2. 基于本地 `development` 创建 worktree，改动都在 worktree 里做：
     `git worktree add -b <分支名> ../dsh-lingualab-<主题> development`。
  3. worktree 里改完，提交并推分支，开 PR 到 `development`。
- 主工作树留在 `main`：线上那台 dsh 用 `link:` 装到主工作树，只该跑发布版代码。worktree 在仓库目录之外，
  和它互不影响。PR 合了就删掉 worktree 和分支。

## 文档分工

**为什么** → `.agents/notes/`；**是什么** → README 与源码注释；**怎么干活** → 这份技能；
**每轮必读** → `AGENTS.md`。没有 `docs/INDEX.md`，README 加链接就是索引。

新规矩默认写进这份技能，其次写成一篇 note；`AGENTS.md` 只留每轮都要知道的事。它每轮都会注入上下文，
写得越长，每轮占的上下文越多，真正要紧的几条也会被挤淡。这份技能本身也一样：只在某类改动里才用得上的细节，
写进 `references/` 里对应的那份（没有合适的就新建一份），再在上面「按需再读」的表里加一行，不要堆在这里。
