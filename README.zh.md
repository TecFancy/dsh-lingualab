# dsh-lingualab

[English](README.md) | 简体中文

「语言实验室」面板：**左栏一行，点开是中栏的一整页**，当前会话不动。这一页把已经放进工作区的
材料变成精听练习：一次一集，逐句来，笔记写回磁盘，Agent 读得到。

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

练习的单位是句子，不是文件：点字幕行跳过去，循环当前句，拖出 A-B 区间反复听，十档变速且不变调。
双语字幕无论源文件怎么排，英文恒在上、中文在下；中文那侧有四档显示模式，母语不会变成你在读的东西。

笔记按这套方法的设计走：**每集最多 7 条**。写满了，第 8 条必须先替换掉一条，这正是重点，上限是
逼你取舍的装置，不是存储限制。文件是 markdown，一条短语一个清单行，编辑器里读得下去，Agent 也
grep 得到，次日复习就靠它。

## 当前状态

**host 半边写完并测过**：库扫描、带 `Range` 的媒体路由、笔记读写，配 43 个单测覆盖纯逻辑与路由。
**客户端半边正在写**，它依赖的实体与格式模块已经就位，面板本身是下一步。

插件还没装进任何 profile。开发在 `development` 分支，靠合进 `main` 出版本，这里的东西不发 npm。

## 宿主路由

| 路由 | 类型 | 回答什么 |
|---|---|---|
| `GET /lingualab/library` | exact | 每个剧集文件夹、里面的文件、笔记记了多少 |
| `GET`、`HEAD /lingualab/media/<剧集>/<文件>` | prefix | 音频与字幕的字节，带 Range 时回 `206` |
| `GET`、`POST /lingualab/notes` | exact | 某一集的短语，整体读出来或整体换掉 |

## 仓库结构

```text
src/index.ts                 host half: the three routes and the config
src/host-context.ts          the slice of the host plugin context we call
src/host/                    library scan, media serving, notes read/write
src/shared/                  the wire contract and the notes markdown format
src/client/entities/cue/     subtitle parsing, decoding and bilingual line ordering
src/client/                  the panel (in progress)
lib/                         tsdown output, committed: what the shell fetches
locale/                      the Plugins page display name and summary
cordis.patch.yml             bundle patch (loader row `lingualab`)
```
