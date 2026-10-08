# dsh-lingualab

[English](README.md) | 简体中文

「语言实验室」面板：**「应用」页上一张卡片，点开是中栏的一整页**，当前会话不动。这一页把已经放进
工作区的材料变成精听练习：一次一集，逐句来，笔记写回磁盘，Agent 读得到。

## 做什么

素材根目录下，一集一个文件夹。文件夹里放音频、最多两份字幕，外加可选的 `notes.md`：

```text
notes/learning/english/media/
  S01E01/
    audio.mp3
    S01E01.en.srt
    S01E01.zh.srt
    notes.md
```

扫描接受 `.mp3`、`.m4a`、`.wav`、`.ogg`、`.opus`、`.flac` 六种音频，以及 `.srt`、`.vtt`、
`.lrc` 三种字幕。只有一个字幕文件、内容里带中文时，它同时算英文和中文两份，因为双语字幕本来就是
一个文件装两种语言。没有音频的文件夹照样列出来，只是放不了；根目录可以放一份 `manifest.json`，
用来指定播放顺序、改剧集标题，以及指定先打开哪一集。

目录可以在页面上配，而且不用手打路径：顶栏「···」打开媒体目录这一层，主入口是选择层的「浏览」
页——走进目标目录点「用作媒体库」，路径由 host 自己解析。绝对路径输入框留着，给工作区之外、
没有地方可以走过去的挂载点用。保存会经 settings 服务写进插件的 profile 条目，所以这个值只有一个家，
也不用重启。

一集不必是一个文件夹。媒体库根目录里的散装音频，或者任何可浏览位置下的音频文件，都能单独打开：
选择层会列出它，按文件名配对字幕，host 记住这个文件，于是它的字节有人伺服、笔记有地方放。
上一版答不出的两个问题就是这两个——「我刚拷进来的音频在哪」和「为什么只能从一个下拉里挑」。

练习的单位是句子，不是文件：点字幕行跳过去并开始播，循环当前句，标出 A-B 区间反复听，
十档变速且不变调。双语字幕无论源文件怎么排，英文恒在上、中文在下；中文那侧有四档显示模式，
母语不会变成你在读的东西。

笔记按这套方法的设计走：**每集最多 7 条**。写满了，第 8 条必须先替换掉一条，这正是重点，上限是
逼你取舍的装置，不是存储限制。文件夹剧集的笔记是 markdown，一条短语一个清单行，编辑器里读得下去，
Agent 也 grep 得到，次日复习就靠它；文件剧集的笔记存在插件自己的 profile 里，因为这个插件不往
素材目录里写东西。

## 当前状态

两个半边都写完了：host 那边是库扫描、带 `Range` 的媒体路由、可浏览的选择层与笔记读写；
client 那边是页面本身——四条横带、当前句的舞台、字幕列表，以及选剧集、记笔记、设媒体目录三层浮层。

这一页**不在左栏占行**。它以 `main` 面板的形式注册在 `lingualab` 这个 key 上，入口是「应用」页上的
一张卡片，由 `dsh-apps-panel` 按自己的注册表画出来（`panel: lingualab`）。这是一次有意的取舍：
左栏不再每个插件长一行，代价是这个插件要有一个启动台才进得去。没有装 `dsh-apps-panel` 的 profile 里，
这一页注册着，但没有入口。

开发在 `development` 分支，靠合进 `main` 出版本，这里的东西不发 npm。

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

| 路由 | 类型 | 回答什么 |
|---|---|---|
| `GET /lingualab/library` | exact | 每个剧集文件夹与根目录里的散装音频、当前打开的那一集、笔记记了多少 |
| `GET`、`HEAD /lingualab/media/<剧集>/<文件>` | prefix | 文件夹剧集的音频与字幕字节，带 Range 时回 `206` |
| `GET`、`HEAD /lingualab/file-media/<id>/<文件>` | prefix | 文件剧集的同类字节，来自打开时记下的路径 |
| `GET`、`POST /lingualab/notes` | exact | 某一集的短语，整体读出来或整体换掉 |
| `GET`、`POST /lingualab/config` | exact | 媒体库在哪、怎么改——可以给路径，也可以给位置与相对目录 |
| `GET /lingualab/places` | exact | 选择层可以浏览的根：每个工作区，加上媒体库自己 |
| `GET /lingualab/browse` | exact | 某个位置下的一个目录：子目录、音频、字幕，以及每个音频配到了哪些字幕 |
| `POST /lingualab/open` | exact | 把某一集设为当前：扫描到的文件夹剧集，或一个音频文件加旁边的字幕 |

## 仓库结构

```text
src/index.ts                 host half: the routes and the config
src/host-context.ts          the slice of the host plugin context we call
src/host/                    library scan, places and path rules, browsing, opening,
                             media serving, notes read/write, remembered state
src/shared/                  the wire contract and the notes markdown format
src/client/entities/cue/     subtitle parsing, decoding and bilingual line ordering
src/client/                  the page, its widgets, and the two slot-free features
lib/                         tsdown output, committed: what the shell fetches
locale/                      the Plugins page display name and summary
cordis.patch.yml             bundle patch (loader row `lingualab`)
```
