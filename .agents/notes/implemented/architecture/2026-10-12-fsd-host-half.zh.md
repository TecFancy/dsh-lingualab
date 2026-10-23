# Agent Note: 服务端也用 FSD，分三层

Status: implemented

## Problem

前端（client）从第一行代码起就按 FSD 分层，服务端（host）却一直没有分层。服务端只有扫描、笔记文件和媒体路由的时候，
这样很省事。如今 `src/host/` 一个文件夹里放着 21 个模块、4 个测试工具和 22 个测试文件，
`src/index.ts` 长到了 825 行，其中大半是 16 个路由函数。由此带来三个问题，目前没有任何检查能发现：

- **存在循环依赖。** `library.ts` 从 `pairing.ts` 导入配对规则，`pairing.ts` 又从 `library.ts`
  导入 `compareIds`。手动选字幕又加了两个：`library.ts` 与 `subtitle-choice.ts` 互相导入，
  `state.ts` 经由 `subtitle-choice.ts` 绕回 `library.ts`。它们能运行，是因为 ES 模块允许加载期间
  不读取值的循环，而这并不是有意的设计。
- **能力之间互相导入。** `timing.ts` 为了 `resolveFileMedia` 导入 `open.ts`，为了
  `isSafeEpisodeId` 导入 `notes.ts`；`review.ts` 导入 `notes.ts`；`video.ts` 导入 `library.ts`；
  `subtitle-choice-route.ts` 导入了五个相邻模块。每一处导入在当时都是最短的路径，合在一起，
  就意味着改任何一个文件都可能弄坏另一个。
- **路由离它的规则很远。** 一个能力的规则在 `src/host/`，路由在 `src/index.ts`，改一处要动两个
  相隔几百行的文件。`subtitle-choice-route.ts` 是第一个把某条路由的规则从 `index.ts` 拿出来的
  模块，但这只是习惯，没有规则约束。

## Decision

**`src/host/` 采用 FSD 的下面三层：`shared`、`entities`、`features`，由 Steiger 用前端已经在用的
同一份配置检查。** `dsh-plugin-framework` 的服务端也是这个结构。没有 `widgets`、`pages`、
`app` 三层：服务端不组合任何界面，插件也不拥有自己的外壳。`src/index.ts` 只保留 `Config` 的 schema
和 `apply()`，后者收集各个 feature 导出的路由。

| 层 | 切片或分段 | 来源 |
|---|---|---|
| `shared` | `http` | `media.ts`（内容类型、Range、JSON）、`guard.ts`，以及 `index.ts` 里的 `methodAllowed` 和 `refuseText` |
| | `fs` | `paths.ts`，即 `places.ts` 里负责路径安全的那一半：`realPathOf`、`forbiddenReason`、`isInside`、`normalizeRel`、`parentOfRel`、`probeReadable` |
| | `ffmpeg` | `ffmpeg.ts` |
| | `config` | `config.ts` |
| | `lib` | 从 `library.ts` 拿出来的 `compareIds` |
| | `testing` | `test-dir.ts`、`test-listen.ts`、`test-ffmpeg.ts`、`test-scenes.ts` |
| `entities` | `episode` | `library.ts` 和 `pairing.ts`，加上 `notes.ts` 的 `isSafeEpisodeId` 与 `open.ts` 的 `resolveFileMedia` |
| | `open-state` | `state.ts` |
| | `subtitle-choice` | `subtitle-choice.ts` |
| | `video-cache` | `video-cache.ts` |
| | `place` | `places.ts` 里负责位置的另一半：`listPlaces`、`findPlace`、`resolveInPlace`、`placesPayload` |
| | `note` | `notes.ts` |
| `features` | `browse` | `browse.ts`，以及 places 和 browse 两条路由 |
| | `library-config` | config 路由 |
| | `import` | `import.ts` 和它的路由 |
| | `library` | library 路由 |
| | `media` | media 和 file-media 两条路由 |
| | `notes` | notes 路由 |
| | `open` | 去掉 `resolveFileMedia` 之后的 `open.ts`，和它的路由 |
| | `progress` | `progress.ts` 和它的路由 |
| | `review` | `review.ts` 和它的路由 |
| | `subtitle-choice` | `subtitle-choice-rules.ts`（第二步之前叫 `subtitle-choice-route.ts`）和它的路由 |
| | `timing` | `timing.ts` 和它的路由 |
| | `video` | `video.ts`、`video-jobs.ts`、`video-plan.ts` 和三条视频路由 |

- **切片内部按前端的分段名拆分。** `api/` 放路由函数，`model/` 放读写，`lib/` 放纯函数部分，
  比如视频方案。Steiger 要求每个切片至少有一个约定的分段，而 `model/` 和 `lib/` 前端本来就在用。
- **实体之间需要互相读取时，经过 `@x`。** 一共六处，每处经过一个以使用方命名的文件：
  - `episode` 读 `open-state`、`subtitle-choice` 和 `video-cache`。
  - `open-state` 读 `subtitle-choice`。
  - `note` 读 `episode`（为了 `scanSegments`）和 `open-state`。

  它们不构成循环：`subtitle-choice` 和 `video-cache` 不导入任何实体；`compareIds` 移进 `shared` 之后，
  上面说的三个循环也就没有了。
- **feature 之间从不互相导入。** 现有的每一处跨 feature 导入都往下移一层：`resolveFileMedia` 和
  `isSafeEpisodeId` 移到 `entities/episode`，`readNotes` 留在 `entities/note`，`contentTypeOf` 放在
  `shared/http`。
- **`src/shared/` 位置不变。** 它是两端共用的契约，两端都针对它编译，不是服务端的 `shared` 层。
  服务端的任何一层都可以导入它，前端则通过 `src/client/shared/` 里的两个转发模块导入。`src/host-context.ts`
  也留在 `src/index.ts` 旁边。Steiger 不检查解析到被分析目录之外的导入，所以这两处都不需要设例外。
- **切片的测试留在代码旁边，只有五个往上移。** `routes.test.ts` 驱动 `apply()`；`host.test.ts`、
  `segments.test.ts`、`video-scan.test.ts` 和 `subtitle-choice.test.ts` 各自同时覆盖好几个切片。
  这五个移到 `src/`，放在 `index.ts` 旁边，因为它们测的是组装好的整个服务端。
- **`lint:fsd` 执行两遍 Steiger。** Steiger 的命令行只接受一个路径，所以脚本改成先检查 `src/client`，再检查
  `src/host`，`steiger.config.js` 的说明也写明两边都由它负责。

## Order of work

分三个提交，每个提交都保持 `npm run verify` 通过：

1. **原地解开依赖。** 趁文件夹还没分层，把 `compareIds`、`isSafeEpisodeId` 和 `resolveFileMedia`
   挪进各自的模块，让循环依赖和跨 feature 的导入在移动任何文件之前就消失。
2. **把路由挪到规则旁边。** 把每个路由函数从 `index.ts` 挪到它调用的规则旁边，目录仍然不分层。
3. **移进分层目录。** 只用 `git mv`，再加上修改导入路径和编写 barrel，行为不变。同时：
   - 加上第二遍 Steiger。
   - 更新 `AGENTS.md` 的目录表、技能（之后执行 `npm run skills:sync`）和两份 README。
   - 重建 `lib/`。
   - 这篇 note 在同一个提交里移到 `implemented/`。

## Settled details

搬迁照着上面的计划进行，计划是在搬迁之前写的。有四处细节计划里没有写，是按 Steiger 的规则定下来的：

- **两个切片改了名。** config 这个 feature 改名为 `library-config`，也就是前端给同一个能力起的名字，
  因为切片不能和 `shared` 里的分段同名（`fsd/ambiguous-slice-names`）。notes 这个实体改名为 `note`，
  因为实体的名字要么都用单数，要么都用复数（`fsd/inconsistent-naming`）。notes 这个 feature 保留原名。
- **`places.ts` 拆成两个文件。** 路径检查放在 `shared/fs/paths.ts`，位置放在
  `entities/place/model/places.ts`，测试也照这样拆开。
- **`shared` 里除了 `lib`，每个分段都有 `index.ts`。** `fsd/public-api` 只豁免 `lib` 和 `ui`，所以
  `config`、`ffmpeg`、`fs`、`http`、`testing` 都像切片一样，经过各自的 index 导入。
- **第五个往上移的测试。** `subtitle-choice.test.ts` 同时驱动 open 这个 feature 和手选字幕的规则，所以它和
  另外四个一起往上移，而不是让一个 feature 导入另一个。

## Alternatives considered

- **保持不分层。** 眼下不花任何成本。但循环依赖和跨模块导入会随每个新能力增加：光是手动选字幕就加了两个
  循环，还多了一个导入五个相邻模块的模块。
- **按主题分文件夹，不分层。** `video/`、`library/`、`http/` 这样的文件夹能让列表短一些，但没有
  任何东西阻止一个文件夹导入另一个，循环依赖会原样跟着搬过去。
- **用 ESLint 的 `no-restricted-paths` 分区代替 Steiger。** `dsh-plugin-framework` 就是这么做的，
  `eslint-plugin-import-x` 也已经装了。不采用：分区只知道层的上下顺序，同层导入、绕过 barrel 的导入
  和 `@x` 都要各写一套规则，而这些 Steiger 本来就有，前端也已经在用。
- **把分段信息作为参数传给 `readNotes`，不用 `@x`。** 能少一处实体之间的导入，但每个调用方（notes
  路由和复习）都得先自己扫描一遍。`@x` 正是 FSD 为这种情况定的惯例，而且能把这条依赖放在一个写明
  使用方的文件里。
- **照搬前端的五层。** `widgets` 和 `pages` 是为组合界面设计的，服务端不组合任何界面。

## Consequences

服务端每新增一个能力，就要新建一个带 `index.ts` 和 `api/` 分段的 feature 切片，比往不分层的文件夹里
加一个文件麻烦。换来的好处是：导入关系由检查守住，不靠记忆；一个能力的路由和规则也放在同一个文件夹里。

已经 implemented 的 note 里引用的 `src/host/...` 路径保持原样：一篇 note 记录的是写下它时的代码，
这些路径只是反引号里的名字，不是任何检查会去追踪的链接。

相关：[前端用 FSD 分层](2026-10-08-fsd-client-half.zh.md)、
[手动选择一集的字幕](../feature/2026-10-12-choose-subtitles-by-hand.zh.md)。
