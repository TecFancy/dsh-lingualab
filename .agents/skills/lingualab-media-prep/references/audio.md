# 音轨怎么转

## 手打命令

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
- **文件名和视频同名**。这样字幕按配对规则同时归视频和 mp3，规则见 [subtitles.md](subtitles.md)。

## 人声太小时

5.1 混成立体声后，背景音乐有时会盖住对白。可以换成加重中置声道的混音，再转一版（输出换个名字，
脚本不会覆盖原来那份）：

```powershell
ffmpeg -i "in.mkv" -map 0:a:0 -vn -af "pan=stereo|FL<1.0*FC+0.4*FL+0.3*BL|FR<1.0*FC+0.4*FR+0.3*BR" -c:a libmp3lame -b:a 160k "in.voice.mp3"
```

有的片源环绕声道叫 `SL`、`SR` 而不是 `BL`、`BR`，先用
`ffprobe -v error -show_entries stream=channel_layout in.mkv` 看一眼再改滤镜。
