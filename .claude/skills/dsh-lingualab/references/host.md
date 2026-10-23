# 服务端：路由、请求信任与写盘

改 `src/host/` 或 `src/index.ts`、新增路由、碰到写素材目录的代码时读这份。

## 路由

- **路由路径只在一处定义**：`src/shared/protocol.ts` 里的路径常量。
  - 这些路径同时记在 `dsh-plugin.naming.json` 里，`check-host.mjs` 会核对两边，只改一边会被拦下。
  - 新增路由写在所属 feature 的 `src/host/features/<名字>/api/<名字>.route.ts`，从切片的 `index.ts` 导出，
    在 `src/index.ts` 里挂上，同时更新 naming 记录和 README 的路由表。
- **浏览只认 place id，不认路径**：页面传来的是 `ws_<哈希>` 或 `lib`，由服务端自己解析成绝对路径
  （`src/host/entities/place`，路径检查在 `src/host/shared/fs`）。
  - `/`、`/etc`、`/proc` 这类根目录一律拒绝。
  - `rel` 里有 `..` 或绝对路径时拒绝。
  - 每一步都先 `realpath`，再确认仍在根目录内。
  - **不要**为了某条路由方便就接受浏览器传来的路径。

## 请求信任

- 每一条路由都先经过宿主的请求信任（`src/host/shared/http/guard.ts`，`index.ts` 里的 `.map(guarded)`）。
  它调用 `ctx.get('connection').admit(req)`，检查三样：`Host` 是回环地址、`Origin` 匹配、会话 cookie 带有效签名。
  不满足就回 `401` 或 `403`；没有 connection 服务时一律回 `403`，不会放行。
- **访问控制靠的就是这一步。** 宿主的信任只覆盖 `/api` 与 RPC，插件自己注册的路由不在其中。漏了这一步，
  任何把主机名重新绑定到 127.0.0.1 的网页、本机任何进程都能调用这条路由。
- 新增路由不要绕开 `guarded`，只读的路由也一样。`x-lingualab-import` 请求头只是第二道检查，防不住上面两种情况。

## 写素材目录的六个地方

库扫描、浏览、打开全部只读。会写素材目录的只有下面六处，每一处的范围都很窄。

### 一、文件夹剧集的 `notes.md`

- 先写临时文件，再 `rename` 到位。
- 读取时返回内容哈希 `version`，保存时带上 `expect`；两者对不上就回 409、不写，页面重新读取。
- 路由不接受文件夹剧集里没有 `expect` 的保存。

### 二、进度文件 `.lingualab-progress.json`

- 位于媒体库根目录，是隐藏文件，代码在 `src/host/features/progress/model/progress.ts`，记录听到哪里和五步勾选。
- 分段的位置键是 `<集>::<段>`（`segmentKey`），五步勾选仍按集记。
- POST 按「每个键取 `updatedAt` 最新的一条」合并，不是整体覆盖。
- 先写临时文件再 `rename`，因为这个文件本来就是整份替换的。文件损坏时按空文件读。
- 不要把进度放回 `openState` 配置，否则每几秒一次的写入都会重写 profile。

### 三、导入：`src/host/features/import/model/import.ts`

接收用户拖进来的音频与字幕。导入的底线不能放松：

- **不覆盖已有文件**：同名文件已存在就报 `exists`。放到位用 `link`，卷不支持硬链接时退回 `COPYFILE_EXCL`。
  **不用 `rename`**，它在所有平台上都会替换目标文件。
- 只接收库扫描会读的扩展名，文件名由服务端清洗。
- 媒体目录不能是系统文件夹（`forbiddenReason`）。建好文件夹之后再确认一次仍在根目录内。
- 先写一个随机命名的隐藏 `.part` 文件再放到位；崩溃留下的旧 `.part` 在下次写这个文件夹时清掉。
- 同时最多两个上传，超出回 `429`。单个文件上限 2 GB，按实际流量计数，不信 `content-length`。
- 文件剧集的笔记仍然存在 profile 里，不要改成在音频旁边建文件。

见 `.agents/notes/implemented/feature/2026-10-09-home-first-and-drop-to-import.md`。

### 四、字幕时间：`src/host/features/timing/model/timing.ts`

把一句的开头和结尾写回媒体库里的字幕文件。

- 只替换这一句（以及被它推动的相邻句）的时间行，其余字节不动。同一文件里的几句，先在原文上一次找齐，再一起替换。
- 按 Latin-1 读写，所以 GBK 与 GB18030 原样保留；带 BOM 的 UTF-16 用 Node 自带的编码处理。
- 请求带上页面读到的字节的 SHA-256，对不上就回 `409`。
- 定位句子用文件里写的毫秒数和「同一时间范围里的第几句」，不用解析后的序号，因为解析器会排序、会丢掉一些块。
- 第一次写某个文件之前，复制一份 `<名>.bak`，只复制一次。
- 两个文件都检查通过才写。媒体库以外的文件剧集一律回 `403`。
- 页面把每句的出处记在 `Cue.origin` / `zhOrigin`。前端的计数规则必须和服务端一致，没有文本的块也要计数。

见 `.agents/notes/implemented/feature/2026-10-11-edit-subtitle-timing.md`。

### 五、视频缓存：`src/host/features/video/model/video-jobs.ts`

- 只写每集文件夹里的隐藏文件夹 `.lingualab/`：
  - `<词干>.mp4`：画面直接复制，声音转成立体声 AAC。
  - `<词干>.m4a`：只有声音。
  - `<词干>.smooth.mp4`：用户手动要求的流畅版，画面重新编码。
- 先写 `<名>.part` 再 `rename`，一次只跑一个任务。失败或取消时删掉 `.part`，崩溃或重启留下的在下次开始任务时清掉。
- 源视频从不改动。
- 路由只接收「哪一集哪一段」以及做什么：要画面、只要声音、流畅版，或改回原画质。路径和命令行全部由服务端
  根据自己的扫描算出，ffmpeg 用参数数组启动，不经过 shell。
- 流畅版一生成，就删掉同一词干的原尺寸 `<词干>.mp4`；「改回原画质」删掉流畅版，再走普通的准备流程。
  删除只在没有任务运行时发生。
- 缓存文件比源文件旧就作废。
- 只有媒体库里的文件夹剧集有视频，文件剧集没有。

见 `.agents/notes/implemented/feature/2026-10-12-video-episodes.md` 与 `.agents/notes/implemented/feature/2026-10-13-smooth-video.md`。

### 六、手选字幕：`src/host/entities/subtitle-choice/model/subtitle-choice.ts`

- 文件夹剧集的选择写在剧集文件夹里的隐藏文件 `.lingualab-subtitles.json`，按段记录，没有分段的记在 `folder` 下。
  先写临时文件再 `rename`；全部改回「按文件名」时删掉这个文件。
- 文件剧集的选择记在 `openState` 里它那条记录的 `subtitles` 字段，重新打开也不会被清掉。
- 英文、中文两路字幕各自选，选择只覆盖它指定的那一路，另一路照旧由 `pairing.ts` 配对。
- 选中的文件不在了，就退回按文件名配对，并在 `subtitleChoice.missing` 里报告，选择本身保留。
- 保存时，选中的文件必须是那个文件夹里现有的字幕文件。
- 配对规则不再增加新的标记，规则覆盖不到的命名交给手选。

见 `.agents/notes/implemented/feature/2026-10-12-choose-subtitles-by-hand.md`。

## 起一个隔离实例做真机验证

改了前端或服务端，想在真的 dsh web 里看一眼，又不想动本机平常用的 web profile（它的 `dsh-lingualab` 链接的是主检出）
和真实素材时，起一个用完就扔的实例。2026-10-23 在 dsh 0.2.1-rc.2 上这样验过调时间面板的上下句切换。

1. **找一个临时目录当 `DSH_HOME`**，比如会话的临时目录下的 `dshhome`，在里面建 profile 目录 `profiles/lt`。
2. **写三个文件**：
   - `package.json`：`dsh.profile.bundles` 只列 `@deepseek-ai/dsh-base`、`@deepseek-ai/dsh-web-app`、`dsh-lingualab`
     和 `dsh-apps-panel`（应用页上的入口卡片）。`dependencies` 照着写两个 `link:`，只是给人看的，不会去装。
   - `cordis.yml`：只有一行 `[]`。
   - `cordis.patch.yml`：把媒体库指到临时目录。

     ```yaml
     - id: lingualab
       name: dsh-lingualab
       config:
         libraryRoot: '<临时目录>\media'
     ```

3. **`node_modules/` 里只放两个 junction**：`dsh-lingualab` 指向要验的 worktree，`dsh-apps-panel` 指向
   `D:\source\personal\dsh-apps-panel`。`@deepseek-ai` 的几个包从全局装的 dsh 里解析，不用跑 pnpm。

   ```powershell
   New-Item -ItemType Junction -Path "<profile>\node_modules\dsh-lingualab" -Target "<worktree>"
   ```

4. **复制一集素材**到 `<临时目录>\media\<集名>\`（音频加字幕），保存字幕时间只会改这份副本，第一次写入前它自己会留 `.bak`。
5. **在 profile 目录里启动**，放到后台：

   ```sh
   DSH_HOME="<临时目录>/dshhome" dsh --profile lt --no-open --host 127.0.0.1 --port 4807
   ```

   输出的第一行是带 `?token=` 的地址，在浏览器里打开它。关掉预览说明和登录提示（面板用不到模型），
   从「应用」进「语言实验室」。这个实例的界面语言是英文。

用的时候注意：

- `npm run build` 之后前端自动热替换，刷新页面就是新版本；改了服务端要重启这个实例。用 junction 链接，不存在 tar 包换不掉的问题。
- 浏览器面板默认很小，验布局前先把视口设成要测的尺寸，比如 1400 乘 900。
- `dsh --profile lt --dump-config` 能先看组合出来的配置对不对，不用起服务。
- 用完停掉进程，临时目录可以直接删。不要往 `~/.dsh/profiles/web` 里加东西。

## 踩过的坑

- **可选服务一律用 `ctx.get(name)` 读取**：当成上下文属性读（`ctx.workspaceRegistry`），服务缺席时会抛错；
  路由里抛出的错误会被 web 服务转成一个**空的 400**，页面上看起来就是「什么都没有」。这个坑踩过一次，四条路由同时出错。
- **volatile 配置字段读出来是一个包装对象，不是值**：`z.string().default('').volatile()` 解析出来不是字符串，
  要调 `config.x.get()` 才拿到值；当成字符串读，路由同样全部出错。它的好处是 settings 服务可以在线修改，
  改完下一次读取就是新值，不用重启。
- **改了源码要重启隔离实例，并强制刷新安装的副本**：服务端的改动要重启才生效。profile 用 `file:` 安装 tar 包时，
  版本号不变就不会换成新文件，要执行 `rm -rf node_modules/<包名> && npx pnpm@11.22.0 install --force`，
  否则在浏览器里验证的还是上一版。按上一节用 junction 链接 worktree 时没有这个问题。
- **进度合并没有删除标记**：两端都是「每个键取最新」的并集。从 `.lingualab-progress.json` 删掉一条，
  任何见过它的浏览器缓存（`dsh-lingualab:progress` / `dsh-lingualab:steps`）下次同步时都会把它写回来。
  清理测试数据时，要连同测试用的浏览器缓存一起清。
