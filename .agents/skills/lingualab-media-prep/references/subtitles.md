# 字幕配对与注意事项

## 配对规则

配对规则只有一处（`src/shared/stem.ts`）：字幕去掉扩展名后要么和音频同名，要么以音频名开头、紧跟一个
`.`、`_` 或 `-`。所以 `X.mp3` 会认领 `X.srt`、`X.en.srt`、`X_zh.srt`，但**不认领** `X 中英双语.srt`
（空格不算分隔符），也不认领 `X2.srt`。几个名字都配得上时，最长的那个音频名赢。视频按同一条规则归音频。

规则管不到的命名，不用改名也行：在练习页的「字幕」弹层里手选，见
[手选字幕](../../../notes/implemented/feature/2026-10-12-choose-subtitles-by-hand.md)。

## 要注意的

- 一行中文一行英文的双语字幕直接能用，练习页会把两种语言分行显示。
- 字幕里的 ASS 样式标签（比如 `{\fs16\an2\b0}`）解析时会自动去掉（`src/client/entities/cue/lib/decode.ts`），
  不用手动清理。
- 字幕组常给 `X 中英双语.srt` 这种带空格的名字，它配不上对。内容和 `X.srt` 一样就不用管它，
  不一样就改名成 `X.zh-en.srt` 再拖，或者导入后手选。拿不准是否一样，先比哈希：`Get-FileHash a.srt, b.srt`。
- 插件只认 srt、vtt、lrc（`src/shared/protocol.ts` 的 `SUBTITLE_EXTENSIONS`），`.ass` 拖进来没有反应。
  `convert.ps1` 会把它转成同名 `.srt`；手动转是 `ffmpeg -n -i X.ass X.srt`。转出来的时间不变，`Comment`
  行和定位标签丢掉，斜体、字号变成 `<i>`、`<font>`，页面解析时会去掉。带 OP、ED 卡拉 OK 或屏幕注释的
  `.ass` 转完要看一眼，这些也会变成句子，删掉那几块再拖。
- 外挂字幕和内嵌字幕可能不是同一个版本，时间轴对不上时优先信内嵌的，它跟这个视频是一起封装的。
