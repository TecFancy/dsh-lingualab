---
name: lingualab-media-prep
description: 把视频剧集（mkv、mp4）转成 mp3、抽出内嵌字幕，并把字幕配好对。提到「转一下视频 / 把这集变成音频 / 准备新一集素材 / mkv 转 mp3 / 抽字幕」时加载。
---

# 给语言实验室准备素材

视频可以直接拖进首页导入：它和同名的音频归为一段，没有同名音频就自己算一段，播放前由页面在
`.lingualab/` 里准备缓存（见[视频剧集](../../notes/implemented/feature/2026-10-12-video-episodes.md)）。
所以多数时候不用先转。下面几种情况才用这份技能：

- 字幕只封装在视频里：插件不抽内嵌字幕，得先抽成 srt。
- 想要一份单独的 mp3（体积小，离开 dsh 也能听），或者人声被背景音乐盖住，要重混一版。
- 外挂字幕的名字跟视频或音频配不上对。

## 一条命令

本机已经用 winget 装了 ffmpeg（`winget install Gyan.FFmpeg`）。同目录的 `convert.ps1` 把整套做完：

```powershell
# 单集，mp3 写在视频旁边
./convert.ps1 "D:\Downloads\MDJT S01E01.mkv"
# 一整个文件夹，输出到别处，码率调高
./convert.ps1 D:\Downloads\MDJT -OutDir D:\Downloads\MDJT\audio -Bitrate 192
# 外挂字幕之外，也把内嵌字幕抽出来
./convert.ps1 "D:\Downloads\MDJT S01E01.mkv" -EmbeddedSubtitles
```

它做的事：

1. 有多条音轨时优先挑英语那条（`language=eng`），否则取第一条。
2. 混成立体声，编码成 160 kbps 的 mp3，文件名和视频同名（`<名字>.mp3`）。
3. 转完核对时长，跟视频差超过 1 秒就报警告。
4. 外挂字幕（按配对规则属于这一集的 srt vtt ass lrc）在输出到别处时一并复制；名字开头相同
   却配不上对的，报警告并给出建议的新名字。
5. 没有外挂字幕，或者加了 `-EmbeddedSubtitles`，就把内嵌的文字字幕抽成 `<名字>.<语言>.srt`。
   图像字幕（PGS、VobSub）转不成文字，只报警告。
6. **目标文件已存在就跳过，从不覆盖**，所以重跑一遍是安全的。

## 转完之后

- 把 mp3、视频和字幕拖进语言实验室首页，由 host 导入，导入时不覆盖已有文件。
- 素材不进任何 git 仓库。工作区里给它留的目录是 `notes/learning/english/media/`，自带 `.gitignore`。
- 在 [references/log.md](references/log.md) 的转换记录里加一行。

## 按需再读

- 字幕配不上对、双语字幕怎么放、外挂与内嵌对不上：读 [references/subtitles.md](references/subtitles.md)。
- 想手打 ffmpeg 命令、人声太小要重混，或者想知道为什么这么转：读 [references/audio.md](references/audio.md)。
