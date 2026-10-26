# AGENTS.md — dsh-lingualab

LinguaLab：dsh 的一个整页面板插件，把工作区里的音频与字幕变成逐句精听练习。页面注册在 `main`
槽的 `lingualab` 键上，入口是左栏「更多」菜单里的第一行（本插件自己注册进 `sidebar.panellist.actions`），
左栏没有它自己的一行。每次会话先读这份，细节在 `.agents/skills/dsh-lingualab/SKILL.md`，
决策理由在 `.agents/notes/`。

## 三件每轮都要知道的事

1. **代码分服务端和前端两部分**：服务端（host）入口在 `src/index.ts`，改完要重启 dsh-web；前端（client）入口在
   `src/client/index.tsx`，自动热替换。`lib/` 是提交进仓库的产物，改完源码必须重建。
2. **验证只有一条命令**：`npm run verify`。提交前钩子跑的是 `node scripts/verify.mjs --fast`，
   它不含需要构建的产物检查。
3. **不许抢宿主的键盘**：快捷键挂在面板容器上，不挂 `window`。

设计稿在 Figma：<https://www.figma.com/design/kdmcHGX1TcLPj84v7rg1xY>（比例与层级的参照，
色值与字体以宿主令牌为准）。

## 目录

```text
src/index.ts            服务端入口：配置，并挂上各个 feature 导出的路由
src/host/               服务端，FSD 的下三层，没有 widgets、pages、app 层
  shared/               config（库根解析）、http（请求信任、媒体伺服带 Range、JSON）、fs（路径检查）、
                        ffmpeg（查找与起进程）、lib、testing（只给测试用）；除 lib 外每段都有 `index.ts`
  entities/             episode（库扫描：一个文件夹有两个及以上音频或视频词干就是一集多段，视频按字幕的规则归音频词干；
                        文件剧集能伺服哪些文件）、open-state（打开的剧集与文件剧集记录）、place（可浏览的位置）、note（笔记读写）、
                        subtitle-choice（手选字幕的存取与覆盖规则）、video-cache（缓存路径）；实体之间只经 `@x/<读者>.ts` 互读
  features/             一个能力一个切片，路由在 `api/<名字>.route.ts`，挨着它调用的规则：browse、library-config、
                        import（不覆盖）、library、media（含 `.lingualab/` 缓存里的 mp4 与 m4a）、notes、open、progress（进度文件）、
                        review（跨集复习清单，只读）、subtitle-choice、timing（字幕时间）、update（版本快照与发布标签检查，只读）、
                        video（`lib/video-plan` 纯规划、`video-jobs` 一次一个的任务、`video` 状态）；
                        写素材目录只有导入、notes.md、进度文件、字幕时间、手选字幕文件与视频缓存
src/shared/             两端共用的协议、笔记格式与文件名配对（最长词干归属），只有这一份
src/client/             前端，FSD 分层，没有 app 层
  shared/               桥、请求、格式化、样式
  entities/cue/         字幕解析与双语分行
  features/             library（读一集或其中一段）、media-player（播放与循环、跟读程序、耳机与锁屏按键）、notes（收藏，无 7 条上限，按段分组）、
                        import-media（拖入分组与上传）、resume（听到哪里按集或按段存，五步的定义与按集的勾选：浏览器缓存加 host 同步）、
                        review（复习队列：本集或整个库，逐句评级）、
                        subtitle-choice（读写一集或一段手选的字幕文件）、
                        settings（主题、明暗、舞台字号、「中文显示」、画面状态与右栏是否收起，存浏览器；主题是覆盖宿主 token 的调色板）、
                        update（首页页脚的版本行与发布检查）、video（一段的视频状态、准备任务与哪张卡片，决定播放器放视频还是音频文件）
  widgets/              library-home（首页练习台：舞台与五步、复习、加一集、剧集表，与拖放区）、control-bar（含「字幕」弹层）、subtitle-panel、notes-panel（右栏的「收藏」）、
                        episode-picker（只剩浏览）、media-folder、step-tracker、segment-picker（分段按钮与列表）、
                        timing-editor（舞台下面调整一句开头和结尾的横栏）、review-strip（复习横栏与结束卡片）、
                        settings-panel（右侧「设置」抽屉：主题卡片、明暗、舞台字号、提前起播）、
                        video-stage（舞台顶部的画面或代替它的卡片，与提示条）
  pages/lingualab/      页面，首页与练习两个视图，负责组合各 feature。`ui/LinguaLabPage.tsx` 只放状态、接线与组合，
                        视图（HomeView、PracticeView 与它的顶栏和两个面板）也在 `ui/`；页面自己的 hook 与纯函数在 `lib/`：
                        keymap 与 useKeyboard（键盘）、useResume、useOpening、useReplay（听到哪里与打开）、useReviewRun、
                        useSideColumn（右栏的视图与收起）、useStageNotes、useRetime、useVideoSource、useVideoNotices，每个带单测
.agents/notes/          决策记录，一篇三件套（.md / .zh.md / .i18n.yaml）
.agents/skills/         仓库自带技能，dsh 原生扫描，`.claude/skills` 是生成的镜像
scripts/                检查脚本，入口是 verify.mjs
```

## 检查表

`node scripts/verify.mjs --list` 打出全部。轻档含 typecheck、ESLint、Steiger 的 FSD 规则、单测、
notes 树与链接（各带自测）、docs、全仓链接、中英配对与它的自测、中文语体、技能镜像；全档再加体量门（`betterer:ci`，约 20 秒，
不进提交前钩子）、两个产物能否解析、包名与 Loader 行与路由是否一致、`lib/` 是否与新构建逐字节相同。

## 写东西的规矩

- 中文文档按 `docs` 缺省语体写：全角标点，中英之间一个空格，别用箭头当连词。
- 每篇 note 三件套，中文那份是真翻译。改一侧就跑
  `npm run bilingual:check -- --write` 重记哈希。
- 两端共用的新类型放 `src/shared/`，前端经 `src/client/shared/` 里的转发文件导入；新增能力新建切片并给它写 `index.ts`。
- 新逻辑进切片自己 `lib/` 里带测试的 hook 或纯函数，不往页面或组件里堆；一个组件或函数要过 80 行就拆开，不要记进
  `.betterer.results` 的 baseline。体量门怎么用见 `.agents/skills/dsh-lingualab/references/size-gate.md`。
- 素材（音频、视频）不进仓库，放在工作区的 `notes/learning/english/media/`（自带 `.gitignore`），准备素材见技能 `lingualab-media-prep`。
