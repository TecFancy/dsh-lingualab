# dsh-lingualab

[English](README.md) | 简体中文

「语言实验室」面板：**「应用」页上一张卡片，点开是中栏的一整页**，当前会话不动。这一页把已经放进
工作区的材料变成精听练习：一次一集，逐句来，笔记写回磁盘，Agent 读得到。

## 做什么

页面先落在**首页**：接着上次听的那一集、其余剧集（点一下就打开）、一个拖放区。打开一集就进入
**练习**视图，它的返回按钮回到首页。

**加素材就是拖进来。** 把音频和它的字幕拖到页面上，或者点「添加文件」。字幕按名字配对：文件名以音频
文件名开头的字幕属于它（`s01e01.mp3` 管着 `s01e01.en.srt` 和 `s01e01.zh.srt`），一个音频旁边孤零零一个
字幕，不论叫什么都算一对。也可以一次拖很多集。host 把每一集放进媒体目录下各自的文件夹，**绝不覆盖已经
存在的文件**，跳过了什么也会说清楚。库里什么都没有的时候，首页就只是一个拖放区，没人需要先弄懂什么叫
媒体目录。

素材根目录下，一集一个文件夹。文件夹里放音频、最多两份字幕，外加可选的 `notes.md`；导入出来的也是这个
结构：

```text
notes/learning/english/media/
  S01E01/
    audio.mp3
    S01E01.en.srt
    S01E01.zh.srt
    notes.md
```

扫描接受 `.mp3`、`.m4a`、`.wav`、`.ogg`、`.opus`、`.flac` 六种音频，`.mkv`、`.mp4`、`.webm`、`.mov` 四种视频，
以及 `.srt`、`.vtt`、`.lrc` 三种字幕。只有一个字幕文件、内容里带中文时，它同时算英文和中文两份，因为双语字幕本来就是
一个文件装两种语言。既没有音频也没有视频的文件夹照样列出来，只是放不了；根目录可以放一份 `manifest.json`，
用来指定播放顺序、改剧集标题，以及指定先打开哪一集。

一个文件夹里有**两个及以上音频**时，它仍然是一集，由多个分段组成：一个音频一段，按自然顺序排（`02` 在
`10` 前面）。每一段按名字配自己的字幕，音频名最长的那个说了算（`04_Dunphy家-Luke射击.srt` 不属于名叫
`04_Dunphy家` 的同级音频）。名字里带 `双语` 或 `bilingual` 的字幕（`01_Dunphy家的早晨_双语.srt`）是一个文件
装两种语言：其中的中文行就是中文轨，英文轨取标了英文的那份，没有就取唯一一份没标语言的，再没有就还是这个
文件。页面一次放一段，顶栏的按钮列出全部分段，一段听完会提议下一段；一集仍然只有一份 `notes.md`，每一段在
里面有一个 `## <分段名>` 标题。

**视频是同一段的另一个来源。** 视频按字幕的规则跟音频文件配对（`MDJT S01E01.mkv` 归 `MDJT S01E01.mp3`，音频名最长的说了算），
没有音频文件认领的视频自成一段，声音取自视频，只有一个词干的文件夹仍然是一集一段。首页的卡片和分段列表上有一个小小的视频标记，
视频还没准备好时写成「视频 · 未准备」。浏览器本来就能放的视频（`mp4` 或 `webm`，画面是 H.264、VP9 或 AV1，声音是 AAC、Opus
或 MP3）直接放。其余的**在读者要的时候准备一次**（「准备视频」）：`ffmpeg` 原样复制画面，把声音转成立体声 AAC（取第一条英文音轨，
没有就取第一条），放进索引在最前面的 `mp4`，耗时跟读一遍文件差不多。浏览器解不了的画面（HEVC、MPEG-4 Part 2、10 位 H.264）不重新编码，
只把声音取成 `m4a`，所以没有音频文件的那一段照样能精听。准备好的文件放在隐藏的 `<剧集>/.lingualab/` 文件夹里，先写成 `.part` 再改名；
源文件从不被改动，删掉这个文件夹只意味着再准备一次。准备是 host 上一次一个的任务，有进度，也能「取消」，需要 `PATH` 里有 `ffmpeg`
和 `ffprobe`，或者在可选的 `ffmpegPath` 配置里指出来（放着两者的文件夹，或其中任一个的路径；它是 volatile 字段，插件页改了不用重启）。
没有它们时，`mp4` 和 `webm` 仍然直接放，其余的显示一张带安装命令的卡片。一段有了能放的视频，它就是播放器的来源，声音就是这次练习的声音
（隐藏画面时，有自己音频文件的段改播音频文件，不再下载视频）；
字幕、循环、收藏的句子、调整时间和复习都在这同一条时间线上照常工作。舞台上的画面有三个状态（显示、大画面、隐藏），和其他设置一起存在这个浏览器里：
`V` 和播放卡片里的按钮在三者之间循环，大画面里按 `R` 把当前句的英文盖在画面上，直到下一句开始。五步法只用它一次：开始盲看的计时会切到大画面
（带一条「撤销」提示），暂停计时或把这一步标记完成，画面回到之前的状态。视频只在媒体库里播放：从工作区别处选来的视频，只有不需要准备时才播放，
跟调整字幕时间划的是同一条界线。

文件放在哪，是首页底部安静的一行，旁边有「更改」。目录不用手打路径：这一层的主入口是「浏览已有的文件」——
走进目标目录点「用作媒体库」，路径由 host 自己解析。绝对路径输入框留着，给工作区之外、没有地方可以
走过去的挂载点用。保存会经 settings 服务写进插件的 profile 条目，所以这个值只有一个家，也不用重启。

一集不必是一个文件夹。媒体库根目录里的散装音频，或者任何可浏览位置下的音频文件，都能单独打开：
「浏览已有的文件」会列出它，按文件名配对字幕，host 记住这个文件，于是它的字节有人伺服、笔记有地方放。

练习的单位是句子，不是文件。运输条上只留每分钟都要用的：上一句、下一句、播放、变速、循环本句、中文显示和
星标；A-B 区间、重复次数、提前起播（每句提前一点开始播）和快捷键一览收在「更多」里。点字幕行跳过去并开始播，十档变速且不变调。双语字幕
无论源文件怎么排，英文恒在上、中文在下；中文那侧有四档显示模式，母语不会变成你在读的东西。页面会记住你在
每一集听到哪里、五步法勾了哪几步，首页拿听到的位置做「接着上次」。这份记忆存在 host 上，也就是媒体库根目录
里一个隐藏的 `.lingualab-progress.json`，和各集的 `notes.md` 放在一起；每个浏览器另有一份缓存。所以换一台设备、
开一个无痕窗口、清掉浏览器缓存，都能接着上次听。两台设备说法不一致时，最近一次停下的位置为准。
媒体库文件夹本身如果被同步（网盘、git 仓库），进度会跟着一起走。

练习视图是一个舞台加一栏字幕。舞台上是大号的当前句，前后句淡淡地放在两侧；右边那栏列出每一句，跟着
播放滚动（关掉「自动跟随」就不动），并标出收藏过的。几个细节每次练习都用得上：进度条横跨整集，每一句
的起点有一道细刻度，悬停时显示指针处的时间和那一句，拖动时只在松手那一下 seek。点英文单词可以复制，
或者记进那一句的备注，音频不会停；拖过几个词，或者按住 `Shift` 点第二个词，对两者之间的词组也一样，
再点一次「已记下」就去掉。**跟读**模式每句播完就停，英文被模糊遮住，你先说，再按 `R` 对答案。
听到结尾会出小结，附上下一集的入口；播放器下面的按键标签会为页面刚处理的那个键亮一下。系统设了
「减少动态效果」时，所有动效都关掉。

**收藏一句就是点星标**，运输条上有，每一行字幕上也有，或者按 `S`。再点一次就取消。收藏的句子是右栏的另一个视图
「收藏」，和字幕并排（`N` 切换）：点一张卡片，那一句放上舞台循环播放；舞台上那一句的卡片展开，显示备注、
单词和评级；备注可以写多行（`Ctrl+Enter` 保存），卡片上的时间按钮可以播放和暂停这一句。每句收藏只有一个状态，按 `1`「记住了」、`2`「模糊」或 `3`「没记住」设定；评为「记住了」的句子
离开「还在练」视图但不会被删掉，所以工作集保持很短，靠的是你的选择，而不是一个上限。**复习**把还在练的句子
逐句过一遍，英文先遮住，按 `R` 揭晓，每句循环到评级为止；可以从「收藏」栏为这一集开始，也可以从首页的卡片
为整个库开始。文件夹剧集的笔记是 markdown，一条短语一个清单行（备注里的换行写成 `<br>`，一条短语始终占一行），编辑器里读得下去，
Agent 也 grep 得到，次日复习就靠它；文件剧集的笔记存在插件自己的 profile 里，因为这个插件除了加进你交给它
的文件之外，不往素材目录里写别的东西。

**设置**是首页和练习页顶栏最右边的滑块图标，点开是一个抽屉，只改变这一页，不改 dsh 本身：主题（「默认」「墨蓝」
「松绿」「纸张」「暮紫」「高对比」，各有浅色和深色两套配色）、明暗是跟随 dsh 还是固定一种、舞台上那一句的字号，
以及提前起播。主题的做法是在页面根元素上设置宿主自己的颜色令牌，所以页面以外的东西都不受影响。这些选择存在这个浏览器里，
换一台设备按默认来。

## 当前状态

两个半边都写完了：host 那边是库扫描、导入路由、带 `Range` 的媒体路由、可浏览的选择层、笔记读写与复习清单；
client 那边是页面本身：首页、练习视图、「收藏」栏与复习，以及浏览和设媒体目录两层浮层。

这一页**不在左栏占行**。它以 `main` 面板的形式注册在 `lingualab` 这个 key 上，入口是「应用」页上的
一张卡片，由 `dsh-apps-panel` 按自己的注册表画出来（`panel: lingualab`）。这是一次有意的取舍：
左栏不再每个插件长一行，代价是这个插件要有一个启动台才进得去。没有装 `dsh-apps-panel` 的 profile 里，
这一页注册着，但没有入口。

开发在 `development` 分支，靠合进 `main` 出版本，这里的东西不发 npm。

## 设计稿

首页、练习页、笔记与五步法抽屉的布局、配色和交互，先在 Figma 里出了稿：
[LinguaLab redesign](https://www.figma.com/design/kdmcHGX1TcLPj84v7rg1xY)。
画板有 `Practice / Light` 与 `Practice / Dark`、`Home / Light` 与 `Home / Dark`、
`Notes / Light` 和 `Five steps / Light`。这份稿是比例与层级的参照，不是取值的来源：稿里写死了十六进制色值和
Inter 字体，页面本身读宿主的 `--dsw-alias-*` 令牌和字体，所以会跟着主题走。在设置里选的主题，只在页面根元素上覆盖这些同样的令牌，别处不动。

## 发版

改动落在 `development`。往 `main` 开 PR 就是一次发版，版本号的抬高跟着 PR 一起走：

```sh
npm run release -- patch|minor|major   # bump, move Unreleased into a dated section, commit
```

`npm run verify` 会让更新日志的中英两侧与 manifest 保持一致，CI 里的 `version-bump` job 会把
没有抬高版本的 PR 拦在 `main` 外面。合并之后，在承载这次发版的提交上打标签：

```sh
git checkout main && git pull
git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z
```

标签推上去之后会建一个 GitHub Release，正文取自更新日志那一对文件里这一版的两段，先中文后
英文。打标签是唯一需要人做的动作，之后的都是机械的。这里不发 npm，插件从本地路径或 tar 包装，所以版本号标记的是
一个装过、用过的状态，而不是注册表上的一个包。

## 宿主路由

每一条路由，包括只读的，都只回应宿主放行的请求（回环的 `Host`、匹配的 `Origin`、签名的会话 cookie），否则回 `401` 或 `403`；部署里没有 connection 服务时一律回 `403`。

| 路由 | 类型 | 回答什么 |
|---|---|---|
| `GET /lingualab/library` | exact | 每个剧集文件夹与根目录里的散装音频、当前打开的那一集、笔记记了多少 |
| `GET`、`HEAD /lingualab/media/<剧集>/<文件>` | prefix | 文件夹剧集的音频、字幕和 `mp4`、`webm` 视频字节，以及 `<剧集>/.lingualab/<文件>` 下准备好的视频和声音（只有 `mp4` 和 `m4a`），带 Range 时回 `206` |
| `GET`、`HEAD /lingualab/file-media/<id>/<文件>` | prefix | 文件剧集的同类字节，来自打开时记下的路径 |
| `GET`、`POST /lingualab/notes` | exact | 某一集的短语，整体读出来或整体换掉 |
| `GET /lingualab/review` | exact | 整个库里还没评为「记住了」的收藏，按库的顺序一集一集列出，集内按播放顺序；只读 |
| `GET`、`POST /lingualab/config` | exact | 媒体库在哪、怎么改——可以给路径，也可以给位置与相对目录 |
| `GET /lingualab/places` | exact | 选择层可以浏览的根：每个工作区，加上媒体库自己 |
| `GET /lingualab/browse` | exact | 某个位置下的一个目录：子目录、音频、字幕，以及每个音频配到了哪些字幕 |
| `POST /lingualab/open` | exact | 把某一集设为当前：扫描到的文件夹剧集（可以带 `segment` 打开其中一段，不带就是第一段），或一个音频文件加旁边的字幕 |
| `POST /lingualab/import` | exact | 把拖进来的一个音频、视频或字幕文件收进某集的文件夹，从不覆盖；要带 `x-lingualab-import: 1` 请求头，并且会话被宿主放行 |
| `POST /lingualab/subtitle-timing` | exact | 把一句的开头和结尾写回媒体库里的字幕文件，连同被它推动的相邻句的那一端：只改这几句的时间行，文件和页面读到的不一样时回 `409`，第一次写之前留一份原文件的 `.bak` |
| `GET /lingualab/video` | exact | host 对某一段的视频知道什么（查询里带 `episode`、`segment`）：`playable`（带 URL）、`prepare`、`preparing`（带进度）、`sound-only`、`sound-ready`、`unplayable`、`no-ffmpeg`（带安装命令）、`failed` 或 `none`；视频和音频长度差超过一秒时带上差值 |
| `POST /lingualab/video-prepare` | exact | 为某一段开始那唯一的准备任务，`{ episode, segment?, mode: 'video' \| 'sound' }`，从不收路径；回开始之后的状态，或者没开始的原因（`busy`、没有 ffmpeg） |
| `POST /lingualab/video-cancel` | exact | 停掉正在跑的准备任务并删掉它的 `.part`；回答是否真有一个在跑 |
| `GET`、`POST /lingualab/progress` | exact | 听到哪里和五步法勾选，存在媒体库根目录的 `.lingualab-progress.json`；`POST` 把浏览器那份合并进来（每一集取最近的），并回整张合并后的表 |

## 仓库结构

```text
src/index.ts                 host half: the config, and mounting the routes
src/host-context.ts          the slice of the host plugin context we call
src/host/shared/             config, request trust and media serving, path rules,
                             the ffmpeg finder, test helpers
src/host/entities/           episode (the library scan), open state, places, notes
                             file, subtitle choice, video cache
src/host/features/           one slice per capability, its route in
                             api/<name>.route.ts beside its rules
src/shared/                  the wire contract and the notes markdown format
src/client/entities/cue/     subtitle parsing, decoding and bilingual line ordering
src/client/                  the page, its widgets, and the slot-free features (library,
                             import, notes, media player, resume, settings)
lib/                         tsdown output, committed: what the shell fetches
locale/                      the Plugins page display name and summary
cordis.patch.yml             bundle patch (loader row `lingualab`)
```
