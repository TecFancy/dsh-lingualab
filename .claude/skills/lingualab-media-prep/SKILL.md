---
name: lingualab-media-prep
description: 把视频剧集（mkv、mp4）转成语言实验室能用的 mp3，并把字幕配好对。主人说「转一下视频 / 把这集变成音频 / 准备新一集素材 / mkv 转 mp3」时加载。
---

# 给语言实验室准备素材

语言实验室只吃音频（mp3 m4a wav ogg opus flac）和字幕（srt vtt lrc），视频不做内嵌（理由见
[v1 不做波形](../../notes/implemented/simplification/2026-10-08-v1-without-waveform.md)）。所以每拿到一集视频，
先把音轨抽成 mp3，再和字幕一起拖进首页的拖放区。这份技能记的是怎么转、为什么这么转、转过哪些。

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
4. 外挂字幕（按下面的配对规则属于这一集的 srt vtt ass lrc）在输出到别处时一并复制；名字开头相同
   却配不上对的，报警告并给出建议的新名字。
5. 没有外挂字幕，或者加了 `-EmbeddedSubtitles`，就把内嵌的文字字幕抽成 `<名字>.<语言>.srt`。
   图像字幕（PGS、VobSub）转不成文字，只报警告。
6. **目标文件已存在就跳过，从不覆盖**，所以重跑一遍是安全的。

只想手打命令的话，核心就这一行：

```powershell
ffmpeg -i "in.mkv" -map 0:a:0 -vn -ac 2 -c:a libmp3lame -b:a 160k "in.mp3"
```

## 为什么这么转

- **只抽音轨，不剪静音**。音频和视频的时间轴逐毫秒一致，字幕的时间戳才对得上。对白之间的长停顿
  会原样保留，但练习页是按句跳的，停顿不碍事。要是把静音剪掉，每一句字幕都会错位。
- **5.1 混成立体声**。原片常见 DTS 或 AC3 的 5.1 声道，浏览器不一定能放，体积也大。`-ac 2` 用
  ffmpeg 默认的混音，对白所在的中置声道会降 3 dB。
- **mp3 而不是 m4a**。两种都能放，mp3 拖进度条最稳，160 kbps 听对白足够，一集二十多分钟约 26 MB。
- **文件名和视频同名**。配对规则只有一处（`src/shared/stem.ts`）：字幕去掉扩展名后要么和音频同名，
  要么以音频名开头、紧跟一个 `.`、`_` 或 `-`。所以 `X.mp3` 会认领 `X.srt`、`X.en.srt`、`X_zh.srt`，
  但**不认领** `X 中英双语.srt`（空格不算分隔符），也不认领 `X2.srt`。

## 字幕要注意的

- 一行中文一行英文的双语字幕直接能用，练习页会把两种语言分行显示。
- 字幕里的 ASS 样式标签（比如 `{\fs16\an2\b0}`）解析时会自动去掉（`src/client/entities/cue/lib/decode.ts`），
  不用手动清理。
- 字幕组常给 `X 中英双语.srt` 这种带空格的名字，它配不上对。内容和 `X.srt` 一样就不用管它，
  不一样就改名成 `X.zh-en.srt` 再拖。拿不准是否一样，先比哈希：`Get-FileHash a.srt, b.srt`。
- 外挂字幕和内嵌字幕可能不是同一个版本，时间轴对不上时优先信内嵌的，它跟这个视频是一起封装的。

## 人声太小时

5.1 混成立体声后，背景音乐有时会盖住对白。可以换成加重中置声道的混音，再转一版（输出换个名字，
脚本不会覆盖原来那份）：

```powershell
ffmpeg -i "in.mkv" -map 0:a:0 -vn -af "pan=stereo|FL<1.0*FC+0.4*FL+0.3*BL|FR<1.0*FC+0.4*FR+0.3*BR" -c:a libmp3lame -b:a 160k "in.voice.mp3"
```

有的片源环绕声道叫 `SL`、`SR` 而不是 `BL`、`BR`，先用
`ffprobe -v error -show_entries stream=channel_layout in.mkv` 看一眼再改滤镜。

## 素材放哪

- 素材不进任何 git 仓库。工作区里给它留的目录是 `notes/learning/english/media/`，自带 `.gitignore`。
- 正常的路径是把 mp3 和字幕拖进语言实验室首页，由 host 导入，导入时不覆盖已有文件。
- 原视频留在下载目录或 NAS 上，用外部播放器看画面。

## 转换记录

每转一批记一行，方便以后知道片源的情况。

| 日期 | 剧集 | 片源 | 结果 | 备注 |
|---|---|---|---|---|
| 2026-10-11 | MDJT S01E01 | mkv，1.1 GB，H.264 加 DTS 5.1 英语音轨，内嵌中、英两条 srt | mp3 26 MB，22 分 59 秒，时长与视频一致 | 两份外挂字幕哈希相同，都是中英双语，只拖 `MDJT S01E01.srt`（另一份带空格配不上）；内嵌中文轨也是双语。507 句，10 秒以上的停顿只有 4 处，合计 53 秒 |
