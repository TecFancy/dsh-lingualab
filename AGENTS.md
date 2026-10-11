# AGENTS.md — dsh-lingualab

「语言实验室」：dsh 的一个整页面板插件，把工作区里的音频与字幕变成逐句精听练习。页面注册在 `main`
槽的 `lingualab` 键上，入口是「应用」页上的卡片（`dsh-apps-panel` 的注册表里 `panel: lingualab`），
左栏没有它自己的一行。每次会话先读这份，细节在 `.agents/skills/dsh-lingualab/SKILL.md`，
决策理由在 `.agents/notes/`。

## 三件每轮都要知道的事

1. **两个半边**：host 在 `src/index.ts`（改完要重启 dsh-web），client 在 `src/client/index.tsx`
   （自动热替换）。`lib/` 是提交进仓库的产物，改完源码必须重建。
2. **验证只有一条命令**：`npm run verify`。提交前钩子跑的是 `node scripts/verify.mjs --fast`，
   它不含需要构建的产物检查。
3. **不许抢宿主的键盘**：快捷键挂在面板容器上，不挂 `window`。

设计稿在 Figma：<https://www.figma.com/design/kdmcHGX1TcLPj84v7rg1xY>（比例与层级的参照，
色值与字体以宿主令牌为准）。

## 目录

```text
src/index.ts            host 半边：路由与配置
src/host/               库扫描（一个文件夹有两个及以上音频就是一集多段）、导入（不覆盖）、媒体伺服（带 Range）、
                        笔记读写、进度文件、字幕时间（写素材目录只有导入、notes.md、进度文件与字幕时间）
src/shared/             跨半边契约、笔记格式与文件名配对（最长词干归属），只有这一份
src/client/             客户端半边，FSD 分层，没有 app 层
  shared/               桥、请求、格式化、样式
  entities/cue/         字幕解析与双语分行
  features/             library（读一集或其中一段）、media-player（播放与循环）、notes（收藏，无 7 条上限，按段分组）、
                        import-media（拖入分组与上传）、resume（听到哪里按集或按段存，五步勾选按集：浏览器缓存加 host 同步）
  widgets/              library-home（首页与拖放区）、control-bar、subtitle-panel、notes-panel（抽屉）、
                        episode-picker（只剩浏览）、media-folder、step-tracker、segment-picker（分段按钮与列表）、
                        timing-editor（舞台下面调整一句开头和结尾的横栏）
  pages/lingualab/      页面，首页与练习两个视图，负责组合各 feature
.agents/notes/          决策记录，一篇三件套（.md / .zh.md / .i18n.yaml）
.agents/skills/         仓库自带技能，dsh 原生扫描，`.claude/skills` 是生成的镜像
scripts/                检查脚本，入口是 verify.mjs
```

## 检查表

`node scripts/verify.mjs --list` 打出全部。轻档含 typecheck、ESLint、Steiger 的 FSD 规则、单测、
notes 树与链接（各带自测）、docs、全仓链接、中英配对与它的自测、中文语体、技能镜像；全档再加两个产物能否解析、包名与
Loader 行与路由是否一致、`lib/` 是否与新构建逐字节相同。

## 写东西的规矩

- 中文文档按 `docs` 缺省语体写：全角标点，中英之间一个空格，别用箭头当连词。
- 每篇 note 三件套，中文那份是真翻译。改一侧就跑
  `npm run bilingual:check -- --write` 重记哈希。
- 新增跨半边形状放 `src/shared/`，客户端通过桥导入；新增能力新建切片并给它写 `index.ts`。
- 素材（音频、视频）不进仓库，见 `.agents/skills/dsh-lingualab/SKILL.md` 的踩坑一节。
