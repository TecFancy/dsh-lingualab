---
name: dsh-lingualab
description: 在 dsh-lingualab 仓库里干活时的操作手册——两个半边怎么分工、改完必须跑什么、lib/ 为什么要提交、哪些坑已经踩过。主人说「继续做语言实验室 / 改精听面板 / lingualab 出问题了」时加载。
---

# dsh-lingualab 操作手册

「语言实验室」是 dsh 的一个侧栏面板插件：读工作区里的音频与字幕，做逐句精听，笔记写回磁盘给
agent 读。仓库自带 git，默认分支 `development`，靠 PR 合进 `main` 出版本，**不发 npm**。

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

1. **路由路径只有一处定义**：`src/shared/protocol.ts` 的三个常量。它们同时写在
   `dsh-plugin.naming.json` 里，`check-host.mjs` 会把两边对上，改一边不改另一边会被拦下。
2. **笔记格式只有一处解析**：`src/shared/notes-format.ts`。面板和 host 都走它，别在任一侧
   写第二份正则。
3. **每集 7 条上限两端都拦**：格式模块定义 `MAX_PHRASES`，host 拒绝超长写入，面板负责问用户
   替换哪一条。见 `.agents/notes/implemented/feature/2026-10-08-seven-phrase-ceiling.md`。
4. **客户端按 FSD 分层**：`shared → entities → features → widgets → pages`，没有 `app` 层。
   跨切片导入一律走该切片的 `index.ts`，feature 之间不许互相导入，需要组合就在页面里做。
   `npm run lint:fsd` 会拦。
5. **快捷键挂在面板容器上**，不许挂 `window`：会话与面板共处一页，抢空格键是敌意行为。
6. **跨半边契约走两座桥**：`src/client/shared/protocol.ts` 与 `notes-format.ts`。
7. **每篇 note 是三件套**：`.md`、`.zh.md`、`.i18n.yaml`。中文那份是真翻译，不是英文副本。
   改了一侧就跑 `npm run bilingual:check -- --write` 重记哈希。

## 已经踩过的坑

- **TypeScript 钉在 6.0.2**：`typescript-eslint@8` 的 peer 范围还不接受 TS 7。升级前先确认。
- **`zod-validation-error` 直接钉在 4.x**：`eslint-plugin-react-hooks@7` 要
  `zod-validation-error/v4` 这个子路径，而 steiger 依赖的 3.x 会被 npm 提到顶层导致 ESLint
  起不来。根上放一份 4.x，steiger 自己那份嵌在它下面。
- **装依赖要指 registry 与缓存目录**：本机默认 registry 慢，用
  `--registry=https://registry.npmmirror.com --cache <可写目录>`。
- **素材不进 git**：剧集音频放在工作区的 `notes/learning/english/media/`，那个目录自带
  `.gitignore`。别把音频提交进任何仓库。
- **视频不做内嵌**，留在 NAS 上用外部播放器看，理由见
  `.agents/notes/implemented/simplification/2026-10-08-v1-without-waveform.md`。
- **改了源码要重启隔离实例并强刷安装副本**：宿主半边要重启才生效；而 profile 用 `file:` 装 tar 包时，
  版本号没变是不会换新文件的，得 `rm -rf node_modules/<包名> && npx pnpm@11.22.0 install --force`，
  否则你在浏览器里验的还是上一版。
- **只有真在浏览器里打开面板才能发现的 bug**：空列表返回新的 `[]` 会让页面的 reset 副作用每次渲染
  都跑一遍，React 报 #185。typecheck、ESLint、单测全绿也拦不住，所以改完客户端一定要在隔离实例里
  打开看一眼 console。

## 文档分工

**为什么** → `.agents/notes/`；**是什么** → README 与源码注释；**怎么干活** → 这份技能；
**每轮必读** → `AGENTS.md`。没有 `docs/INDEX.md`，README 加链接就是索引。
