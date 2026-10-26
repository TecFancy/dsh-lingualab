---
name: dsh-lingualab
description: 在 dsh-lingualab 仓库里改代码时的操作手册：改完怎么生效、怎么验证、分支怎么开，各类改动的细节放在 references/，用到时再读。提到「继续做 LinguaLab / 改精听面板 / lingualab 出问题了」时加载。
---

# dsh-lingualab 操作手册

LinguaLab 是 dsh 的一个整页面板插件，把工作区里的音频与字幕变成逐句精听练习，笔记写回磁盘给
agent 读。默认分支是 `development`，合进 `main` 出版本，不发 npm。

## 改完怎么生效

插件的代码分两部分，生效方式不同：

| 部分 | 源码 | 构建产物 | 改完之后 |
|---|---|---|---|
| 服务端（host），跑在 dsh-web 进程里 | `src/index.ts`、`src/host/` | `lib/index.js` | 重启 dsh-web 才生效 |
| 前端（client），跑在浏览器里 | `src/client/` | `lib/client.js` | 自动热替换，dsh 每 500 毫秒检查一次这个文件 |

`lib/` 是提交进仓库的，改了源码就要重新构建。改完前端看不到变化，多半是忘了构建。

```sh
npm run watch                    # 开发时一直开着，改了就重新构建
npm run build                    # 构建一次
node scripts/verify.mjs --fast   # 快速检查，提交前钩子跑的就是它
npm run verify                   # 全部检查，开 PR 之前跑
```

`npm run build:check` 会重新构建一份，跟提交的 `lib/` 逐字节比较，`npm run verify` 里包含它。

## 改完怎么确认

- 提交前钩子会跑快速检查，开 PR 前自己跑一遍 `npm run verify`。
- **改了前端，一定要在浏览器里打开面板看一眼 console。** 有一类问题只在真的渲染时才出现：
  比如空列表每次都返回一个新的 `[]`，页面里的重置逻辑就会在每次渲染时都跑，React 报 #185。
  类型检查、ESLint、单测全过也拦不住它。
- 不想动本机的 web profile 和真实素材时，起一个隔离的 dsh web 实例来看，步骤见 [references/host.md](references/host.md)。

## 分支与改动流程（2026-10-21 定）

- `main` 只接从 `development` 来的发版 PR，不在 `main` 上直接改。
- 主检出停在 `development`：`ship` 在这里跑，本机 web profile 用 `link:` 装的也是这份，所以本机 dsh 跑的就是
  `development` 的代码。
- 小改动可以直接在 `development` 上提交。其余的按三步走：
  1. 在主检出里跑 `git pull --ff-only`，把 `development` 更新到 `origin/development`。
     它已经在主检出里检出了，`git fetch origin development:development` 会被 git 拒绝。
  2. 从 `development` 建 worktree，改动都在里面做：
     `git worktree add -b <分支名> ../dsh-lingualab-<主题> development`。
  3. 改完提交、推分支，开 PR 到 `development`。合并之后在主检出里拉一下（改了服务端再重启 dsh-web），
     然后删掉 worktree 和分支。

## 按需再读

| 要做的事 | 读这份 |
|---|---|
| 分层规则、两部分之间共用的代码、面板入口 | [references/architecture.md](references/architecture.md) |
| 改服务端、新增路由、写素材目录的代码，可选服务与 volatile 配置，起一个隔离实例做真机验证 | [references/host.md](references/host.md) |
| 改笔记格式、收藏上限与评级、收藏怎么对上原句 | [references/notes.md](references/notes.md) |
| `betterer:ci` 报错、拆了大函数、`.betterer.results` 冲突 | [references/size-gate.md](references/size-gate.md) |
| 升级依赖、`npm ci` 失败、装依赖慢 | [references/toolchain.md](references/toolchain.md) |
| 视频准备、播放来源、流畅版、大画面 | [references/video.md](references/video.md) |
| 练习页布局、右栏、调时间模式、画面与卡片让位 | [references/layout.md](references/layout.md) |
| 快捷键、拖选、焦点、跟读与录音、复习、耳机按键 | [references/practice.md](references/practice.md) |
| 样式、颜色 token、主题、React Compiler 的 lint | [references/styling.md](references/styling.md) |
| 写 note、改文档、新规矩该写在哪 | [references/docs.md](references/docs.md) |
| 发版、往 `main` 的 PR、部署 | [references/release.md](references/release.md) |
| 视频转音频、抽字幕、字幕配不上对 | 技能 `lingualab-media-prep` |
