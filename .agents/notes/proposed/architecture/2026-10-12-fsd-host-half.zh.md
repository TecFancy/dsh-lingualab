# Agent Note: host 半边也用 FSD，分三层

Status: proposed

## Problem

客户端半边从第一行代码起就按 FSD 分层，host 半边一直是平的。host 里只有扫描、笔记文件和媒体路由的
时候，这样很省事。如今 `src/host/` 一个文件夹里放着 21 个模块、4 个测试工具和 22 个测试文件，
`src/index.ts` 长到了 825 行，其中大半是 16 个路由函数。由此带来三个问题，现在没有任何检查能发现。

- **有循环依赖。** `library.ts` 从 `pairing.ts` 导入配对规则，`pairing.ts` 又从 `library.ts`
  导回 `compareIds`。手动选字幕又加了两个：`library.ts` 与 `subtitle-choice.ts` 互相导入，
  `state.ts` 经由 `subtitle-choice.ts` 绕回 `library.ts`。它们能跑，是因为 ES 模块容忍加载期间
  不读取值的循环，而这一点并不是谁选定的。
- **能力之间互相伸手。** `timing.ts` 为了 `resolveFileMedia` 导入 `open.ts`，为了
  `isSafeEpisodeId` 导入 `notes.ts`；`review.ts` 导入 `notes.ts`；`video.ts` 导入 `library.ts`；
  `subtitle-choice-route.ts` 导入了五个邻居。每一处导入在当时都是最短的路，合起来就是改任何一个
  文件都可能弄坏另一个。
- **路由离它的规则很远。** 一个能力的规则在 `src/host/`，路由在 `src/index.ts`，改一处要动两个
  相隔几百行的文件。`subtitle-choice-route.ts` 是第一个把某条路由的规则从 `index.ts` 拿出来的
  模块，靠的是习惯，不是规则。

## Proposal

**`src/host/` 采用 FSD 下面三层：`shared`、`entities`、`features`，由 Steiger 用客户端已经在用的
同一份配置检查。** 这也是 `dsh-plugin-framework` 的 host 一侧的结构。没有 `widgets`、`pages`、
`app` 三层：host 不组合任何界面，插件也不拥有自己的外壳。`src/index.ts` 只留 `Config` 的 schema
和 `apply()`，后者收集各个 feature 导出的路由。

| 层 | 切片或分段 | 来自 |
|---|---|---|
| `shared` | `http` | `media.ts`（内容类型、Range、JSON）、`guard.ts`，以及 `index.ts` 里的 `methodAllowed` 和 `refuseText` |
| | `fs` | `places.ts` 里管路径安全的那一半：`realPathOf`、`forbiddenReason`、`isInside`、`normalizeRel`、`parentOfRel`、`probeReadable` |
| | `ffmpeg` | `ffmpeg.ts` |
| | `config` | `config.ts` |
| | `lib` | 从 `library.ts` 拿出来的 `compareIds` |
| | `testing` | `test-dir.ts`、`test-listen.ts`、`test-ffmpeg.ts`、`test-scenes.ts` |
| `entities` | `episode` | `library.ts` 和 `pairing.ts`，加上 `notes.ts` 的 `isSafeEpisodeId` 与 `open.ts` 的 `resolveFileMedia` |
| | `open-state` | `state.ts` |
| | `subtitle-choice` | `subtitle-choice.ts` |
| | `video-cache` | `video-cache.ts` |
| | `place` | `places.ts` 里管位置的那一半：`listPlaces`、`findPlace`、`resolveInPlace`、`placesPayload` |
| | `notes` | `notes.ts` |
| `features` | `browse` | `browse.ts`，以及 places 和 browse 两条路由 |
| | `config` | config 路由 |
| | `import` | `import.ts` 和它的路由 |
| | `library` | library 路由 |
| | `media` | media 和 file-media 两条路由 |
| | `notes` | notes 路由 |
| | `open` | 去掉 `resolveFileMedia` 之后的 `open.ts`，和它的路由 |
| | `progress` | `progress.ts` 和它的路由 |
| | `review` | `review.ts` 和它的路由 |
| | `subtitle-choice` | `subtitle-choice-route.ts` 和它的路由 |
| | `timing` | `timing.ts` 和它的路由 |
| | `video` | `video.ts`、`video-jobs.ts`、`video-plan.ts` 和三条视频路由 |

- **切片内部按客户端的分段名拆。** `api/` 放路由函数，`model/` 放读写，`lib/` 放纯函数部分，
  比如视频方案。Steiger 要求每个切片至少有一个约定分段，`model/` 和 `lib/` 本来就是客户端在用的。
- **实体之间互相需要时走 `@x`。** 一共六处，每处经过一个以使用方命名的文件：`episode` 读
  `open-state`、`subtitle-choice` 和 `video-cache`；`open-state` 读 `subtitle-choice`；`notes` 读
  `episode`（为了 `scanSegments`）和 `open-state`。它们不成环：`subtitle-choice` 和 `video-cache`
  不导入任何实体，`compareIds` 进了 `shared` 之后，上面三个循环也就没了。
- **feature 之间从不互相导入。** 现有的每一处跨 feature 导入都往下挪一层：`resolveFileMedia` 和
  `isSafeEpisodeId` 去 `entities/episode`，`readNotes` 留在 `entities/notes`，`contentTypeOf` 在
  `shared/http`。
- **`src/shared/` 原地不动。** 它是两个半边一起编译的契约，不是 host 的 `shared` 层；host 的任何
  一层都可以导入它，客户端则通过它的两个桥模块导入。`src/host-context.ts` 也留在 `src/index.ts`
  旁边。Steiger 不追究解析到被分析目录之外的导入，所以两者都不需要例外。
- **切片的测试留在代码旁边，有四个往上挪。** `routes.test.ts` 驱动 `apply()`，`host.test.ts`、
  `segments.test.ts`、`video-scan.test.ts` 各自同时覆盖好几个切片。这四个搬到 `src/`，放在
  `index.ts` 旁边，因为它们测的是装配好的整个 host。
- **`lint:fsd` 跑两遍 Steiger。** 它的命令行只收一个路径，所以脚本改成先跑 `src/client` 再跑
  `src/host`，`steiger.config.js` 的说明也写明两边都归它管。

## Order of work

分三个提交，每个都让 `npm run verify` 保持通过：

1. **原地解开。** 趁文件夹还是平的，把 `compareIds`、`isSafeEpisodeId` 和 `resolveFileMedia`
   挪进各自的模块，让循环和跨 feature 的导入在移动任何东西之前就消失。
2. **路由回家。** 把每个路由函数从 `index.ts` 挪到它调用的规则旁边，目录依旧是平的。
3. **搬进分层。** 只用 `git mv`，加上改导入路径和写 barrel，行为不变；加上第二遍 Steiger；更新
   `AGENTS.md` 的目录表、技能（之后跑 `npm run skills:sync`）和两份 README；重建 `lib/`。这篇
   note 在同一个提交里移到 `implemented/`。

## Alternatives considered

- **保持平铺。** 眼下不花一分钱。循环和跨模块导入会随每个新能力增长：光是手动选字幕就加了两个
  循环，外加一个导入五个邻居的模块。
- **按主题分文件夹，不分层。** `video/`、`library/`、`http/` 这样的文件夹能让列表短一些，但没有
  东西拦着一个文件夹导入另一个，循环会原样跟着搬过去。
- **用 ESLint 的 `no-restricted-paths` 分区代替 Steiger。** `dsh-plugin-framework` 就是这么做的，
  `eslint-plugin-import-x` 也已经装了。否掉：分区只认识层的上下顺序，同层导入、绕过 barrel 的导入
  和 `@x` 都得各写一套规则，而这些 Steiger 本来就有，客户端也已经在跑。
- **把分段信息作为参数传给 `readNotes`，不用 `@x`。** 能少一处实体之间的导入，但每个调用方（notes
  路由和复习）都得先自己扫描一遍。`@x` 正是 FSD 为这种情况定的惯例，并且把这条依赖放在一个写明
  使用方的文件里。
- **照搬客户端的五层。** `widgets` 和 `pages` 是为组合界面而设的，host 不组合任何界面。

## Consequences

host 新增一个能力，就是新建一个带 `index.ts` 和 `api/` 分段的 feature 切片，比往平铺的文件夹里
加一个文件麻烦。换来的是导入关系由检查守着而不是靠记忆，一个能力的路由和规则也待在同一个文件夹里。

已经 implemented 的 note 里引用的 `src/host/...` 路径保持原样：一篇 note 记录的是它写下时的代码，
那些路径是反引号里的名字，不是任何检查会去跟的链接。

相关：[客户端半边用 FSD](../../implemented/architecture/2026-10-08-fsd-client-half.zh.md)、
[手动选择一集的字幕](../../implemented/feature/2026-10-12-choose-subtitles-by-hand.zh.md)。
