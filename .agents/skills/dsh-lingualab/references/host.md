# host 半边：路由、请求信任与写盘

改 `src/host/` 或 `src/index.ts`、新增路由、碰到写素材目录的代码时读这份。

## 约定

- **路由路径只有一处定义**：`src/shared/protocol.ts` 的路径常量。它们同时写在
   `dsh-plugin.naming.json` 里，`check-host.mjs` 会把两边对上，改一边不改另一边会被拦下。
   新增路由写在它那个 feature 的 `src/host/features/<名字>/api/<名字>.route.ts`，从切片的 `index.ts` 导出，
   在 `src/index.ts` 里挂上，同时改这份 naming 记录与 README 的路由表。
- **浏览只认 place id，不认路径**：页面传 `ws_<哈希>` 或 `lib`，由 host 自己解析成绝对路径
   （`src/host/entities/place`，路径检查在 `src/host/shared/fs`）。`/`、`/etc`、`/proc` 这类根一律拒绝，`rel` 拒绝 `..` 与绝对路径，
   每一步都 `realpath` 之后再确认仍在根内。**不要**为了让某条路由方便而接受浏览器传来的路径。
- **每一条路由都先过宿主的请求信任**（`src/host/shared/http/guard.ts`，`index.ts` 里 `.map(guarded)`）：它调
   `ctx.get('connection').admit(req)`，检查回环的 `Host`、匹配的 `Origin` 与签名的会话 cookie，不满足回
   `401`/`403`；没有 connection 服务时一律回 `403`，不是放行。**这才是访问控制。** 宿主的信任只罩 `/api`
   与 RPC，插件自己注册的路由不在其内，所以漏了这一步，任何把主机名重绑到 127.0.0.1 的页面、本机任何进程
   都能调。新增路由不要绕开 `guarded`，读路由也一样。`x-lingualab-import` 请求头只是第二道检查，防不住上面两种。
- **写素材目录只有六处，都很窄**：一是文件夹剧集里的 `notes.md`（先写临时文件再 `rename`；读时回内容哈希 `version`，存时带 `expect`，对不上回 409 不写，页面重读；路由不收没有 `expect` 的文件夹剧集保存）；二是媒体库根目录的隐藏文件
   `.lingualab-progress.json`（`src/host/features/progress/model/progress.ts`，听到哪里与五步勾选；分段的位置键是
   `<集>::<段>`（`segmentKey`），五步仍按集；POST 按「每个键取最新 `updatedAt`」合并而不是覆盖，先写临时文件再 `rename`，因为这个文件本来就是要被替换的；坏文件按空读；
   不要把进度塞回 `openState` 配置，那会让每几秒一次的写入去重写 profile）；三是 `src/host/features/import/model/import.ts`，
   收用户拖进来的音频与字幕。库扫描、浏览、打开仍然全部只读。导入的底线不许松：**不覆盖已有文件**
   （名字在就报 `exists`，放到位用 `link`，不支持硬链接的卷退回 `COPYFILE_EXCL`，**不用 `rename`**，它在
   所有平台上都会替换目标）、只收扫描读的扩展名、名字在 host 清洗、媒体目录不能是系统文件夹
   （`forbiddenReason`）、建好文件夹后再确认仍在根内、先写随机命名的隐藏 `.part` 再放到位、崩溃留下的旧
   `.part` 下次写这个文件夹时清掉、同时最多两个上传（超了回 `429`）、单个文件 2 GB（流式限额，不信
   `content-length`）。文件剧集的笔记仍然落在 profile 里，不要改成在音频旁边建文件。
   见 `.agents/notes/implemented/feature/2026-10-09-home-first-and-drop-to-import.md`。
   四是 `src/host/features/timing/model/timing.ts`，把一句的开头和结尾写回媒体库里的字幕文件：只换那一句（和被它推动的相邻句）的时间行，同一文件的几句在原文上一遍找齐再替换，其余字节不动（按 Latin-1
   读写，GBK 与 GB18030 因此原样保留，UTF-16 带 BOM 的走 Node 自带编码）；请求带页面读到的字节的 SHA-256，
   对不上回 `409`；按文件里写的毫秒和「同一范围里的第几句」找句子，不按解析后的序号（解析器会排序、丢块）；第一次写某个文件前
   复制一份 `<名>.bak`，只复制一次；两个文件都检查通过才写；媒体库以外的文件剧集一律 `403`。页面的出处记在 `Cue.origin` /
   `zhOrigin`，客户端的计数规则必须和 host 一致（没有文本的块也要计数）。
   见 `.agents/notes/implemented/feature/2026-10-11-edit-subtitle-timing.md`。
   五是视频缓存，`src/host/features/video/model/video-jobs.ts`：只写每集文件夹里自己的隐藏文件夹 `.lingualab/`（`<词干>.mp4` 是画面复制加声音转成立体声 AAC，
   `<词干>.m4a` 只是声音，`<词干>.smooth.mp4` 是读者手动要的流畅版，画面重新编码），先写 `<名>.part` 再 `rename`，一次只跑一个任务，失败或取消删掉 `.part`，崩溃或重启留下的在下次起任务时清掉；
   源视频从不被改。路由只收「哪一集哪一段、要画面、只要声音、流畅版，还是改回原画质」，路径、命令行全由 host 自己的扫描算出来，ffmpeg 用参数数组起，不过 shell。
   流畅版一到位就删掉同一词干的原尺寸 `<词干>.mp4`，「改回原画质」删掉流畅版再走普通的准备（删除只发生在没有任务在跑的时候）。
   缓存文件比源文件旧就不算数。只有媒体库里的文件夹剧集有视频，文件剧集没有。
   见 `.agents/notes/implemented/feature/2026-10-12-video-episodes.md` 与 `.agents/notes/implemented/feature/2026-10-13-smooth-video.md`。
   六是手选字幕，`src/host/entities/subtitle-choice/model/subtitle-choice.ts`：文件夹剧集的选择写在剧集文件夹里隐藏的 `.lingualab-subtitles.json`（按段记，没有分段的记在 `folder`），
   先写临时文件再 `rename`，全部改回「按文件名」时删掉这个文件；文件剧集的选择记在 `openState` 里它那条记录的 `subtitles`，重新打开不会冲掉。
   选择只覆盖它点名的槽，其余照旧走 `pairing.ts`；选的文件不在了就按文件名配对，并在 `subtitleChoice.missing` 里报出来，选择本身保留。
   存的时候选的文件必须是那个文件夹里现有的字幕文件。配对规则不再加新标记，规则管不到的命名交给手选。
   见 `.agents/notes/implemented/feature/2026-10-12-choose-subtitles-by-hand.md`。

## 踩过的坑

- **可选服务一律用 `ctx.get(name)` 读**：当成上下文属性读（`ctx.workspaceRegistry`）在服务缺席时会抛错，
  而路由里抛错会被 web 服务兜成一个**空的 400**，页面上看起来就是「什么都没有」。这个坑吃过一次，
  四条路由全中。
- **volatile 的配置字段是盒子**：`z.string().default('').volatile()` 解析出来不是字符串，要 `config.x.get()`
  才是值；写错的话路由同样全炸。它的好处是 settings 服务能在线改，改完下次读就是新值，不用重启。
- **改了源码要重启隔离实例并强刷安装副本**：宿主半边要重启才生效；而 profile 用 `file:` 装 tar 包时，
  版本号没变是不会换新文件的，得 `rm -rf node_modules/<包名> && npx pnpm@11.22.0 install --force`，
  否则你在浏览器里验的还是上一版。
- **进度合并没有删除记号**：两边都是「每个键取最新」的并集，所以从 `.lingualab-progress.json` 删掉一条，
  任何见过它的浏览器缓存（`dsh-lingualab:progress` / `dsh-lingualab:steps`）下次同步都会把它写回来。
  清测试数据要连同测试用的浏览器缓存一起清。
