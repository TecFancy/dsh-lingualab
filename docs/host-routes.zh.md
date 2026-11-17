# 服务端路由

[English](host-routes.md) | 简体中文

这份文档列出 LinguaLab 服务端提供的 HTTP 路由，以及每条路由返回什么。修改路由或核对服务端与页面的接口约定时读它。

每一条路由，包括只读的，都只响应宿主放行的请求（`Host` 是回环地址、`Origin` 匹配、会话 cookie 带有效签名），否则回 `401` 或 `403`；部署环境里没有 connection 服务时一律回 `403`。

| 路由 | 类型 | 返回什么 |
|---|---|---|
| `GET /lingualab/library` | exact | 每个剧集文件夹与散落在根目录的音频、当前打开的剧集，以及笔记记了多少 |
| `GET`、`HEAD /lingualab/media/<剧集>/<文件>` | prefix | 文件夹剧集的音频、字幕和 `mp4`、`webm` 视频内容，也包括 `<剧集>/.lingualab/<文件>` 下的准备版、流畅版和纯音频文件（仅限 `mp4` 和 `m4a`）；带 `Range` 的请求返回 `206` |
| `GET`、`HEAD /lingualab/file-media/<id>/<文件>` | prefix | 文件剧集的同类内容，文件路径在选中该集时记录 |
| `GET`、`POST /lingualab/notes` | exact | 某一集的短语，整体读取或整体替换 |
| `GET /lingualab/review` | exact | 整个媒体库中所有尚未评为「记住了」的收藏句，先按媒体库顺序逐集排列，每集内部再按播放顺序排列；只读 |
| `GET`、`POST /lingualab/config` | exact | 媒体库的位置及修改方式：可以传路径，也可以传位置和相对目录 |
| `GET /lingualab/update` | exact | 当前运行的构建（版本号和短提交，均在宿主加载时读取），以及当前检出的远端所声明的最新 `vX.Y.Z` 发布标签；只读，不会 fetch、pull 或安装任何内容，`?refresh=1` 跳过缓存结果 |
| `GET /lingualab/places` | exact | 选择层可以浏览的根目录：每个工作区，加上媒体库本身 |
| `GET /lingualab/browse` | exact | 某个位置下的单个目录，包括子目录、音频、字幕，以及每个音频文件的字幕配对结果 |
| `POST /lingualab/open` | exact | 把一集设为当前剧集：可以是扫描到的文件夹（可带 `segment` 打开指定分段，省略时打开第一段），也可以是单个音频文件及其旁边的字幕 |
| `POST /lingualab/import` | exact | 把拖入的一个音频、视频或字幕文件收进剧集文件夹，绝不覆盖已有文件；必须带 `x-lingualab-import: 1` 请求头，并使用已获宿主放行的会话 |
| `POST /lingualab/subtitle-timing` | exact | 修改媒体库中某句字幕的开始和结束时间；如果这一改动推动了相邻句的共用边界，也一并修改。只改这些时间码所在行；如果文件已不是页面读取的版本，返回 `409`；首次写入前保存原文件的 `.bak` 备份 |
| `GET /lingualab/video` | exact | 返回服务端已知的某段视频状态（查询参数为 `episode`、`segment`）：`playable`（带 URL）、`prepare`、`preparing`（带进度）、`sound-only`、`sound-ready`、`unplayable`、`no-ffmpeg`（带安装命令）、`failed` 或 `none`；视频与音频时长相差超过一秒时，同时返回差值 |
| `POST /lingualab/video-prepare` | exact | 为某一段启动唯一的准备任务，参数是 `{ episode, segment?, mode: 'video' \| 'sound' \| 'smooth' \| 'original' }`，从不接受路径。`smooth` 会为流式播放重新编码画面，`original` 会删除流畅版，再按原方式准备视频。返回启动后的状态；如果没有启动，返回原因（`busy`、找不到 ffmpeg） |
| `POST /lingualab/video-cancel` | exact | 停止正在运行的准备任务并删除其 `.part` 文件；返回当时是否有任务在运行 |
| `GET`、`POST /lingualab/progress` | exact | 每集听到哪里，以及五步法勾了哪几步，保存在媒体库根目录的 `.lingualab-progress.json`；`POST` 会合并浏览器中的记录（每集取最新记录），并返回合并后的完整表 |
