# 练习页的交互

改快捷键、拖选、焦点、跟读与录音、复习、耳机按键时读这份。

- **页面的键盘是数据（2026-10-15 起）**：`pages/lingualab/lib/keymap.ts` 的 `keyAction(按键, 上下文)` 是纯函数，返回一个动作
  （`toggle-play`、`step`、`review-back`……）或 `null`（不归面板）。按键怎么判是它的，判完做什么是 `key-actions.ts` 的一张表，
  事件怎么拦、哪个键帽亮是 `useKeyboard.ts`。新增快捷键就是三处各加一条：keymap 里的判定与它的测试、key-actions 里这个动作做什么
  （类型会提醒漏了哪个）、需要亮键帽就在 `flashOf` 里加。DOM 才答得了的两个问题（在输入框里、焦点在按钮上）由 `useKeyboard` 问好当布尔值传进去，
  所以 keymap 不碰 DOM。「更多」菜单的 Escape 是动作 `close-menu`，带着菜单没开时 Escape 的含义（`otherwise`），一次按键只关一层。
- **舞台上的拖选走指针事件，不走鼠标事件**：iOS 的手指在拖动时不发任何鼠标事件（只在点一下之后补发合成的），所以 `mousedown`、`mouseenter`、
  `mouseup` 的拖选在 iPad 上只剩单点能用；手指在滚动栏里拖是滚动，长按则是系统的文字选择。触摸指针还会被按下的那个元素隐式捕获，**别的单词永远收不到
  进入事件**，所以不能靠每个词上的 `onMouseEnter`，要在 `pointermove` 里用 `document.elementFromPoint` 按坐标找词。`touch-action` 对非替换的行内元素
  **不生效**（词是 `span`），所以写在整块英文 `.dsh-lingualab-stage-en:not(.is-masked)` 上，连同关掉文字选择与长按菜单；整句因此不能当滚动的起点，
  舞台其余部分仍可以。拖选的逻辑是 `widgets/practice-stage/lib/word-drag.ts` 里不依赖 React 的纯模块，用假的指针源在 node 里测；
  鼠标的 `mousedown` 仍要 `preventDefault`，否则文字选择会盖住选中的词组。点气泡外面关闭也挂在 `pointerdown` 上。
- **点过按钮空格还得管用，靠的是鼠标不把焦点留在按钮上**：Windows 上 Chrome 点按钮会把焦点给按钮，而点了就消失的按钮
  （大画面的「R 看一眼这句」、舞台上的「R」揭开）会把焦点丢给文档，落到面板容器外，快捷键就死到下次点页面。页面根的 `onMouseDown`
  对按钮 `preventDefault`（`shared/lib/focus.ts` 的 `holdsMouseFocus`，模态层与设置抽屉除外，它们自己读键盘），容器的 `onKeyDown`
  则让按钮上的空格与回车归按钮自己（`keepsKeyForTarget`，Tab 过去的人照常能按）。会在被按下时消失的按钮，点击里先
  `returnFocusToPage` 再改状态，键盘按下时焦点也不会丢。新加会自己消失的按钮照做。
- **练习页的几个行为各有出处，别拆**：进度条（`Scrubber`）拖动期间只在松手时 seek 一次；
  跟读模式（store 的 `pauseAfterSentence` 与 `revealed`）在 `onTime` 里判断，只对刚播完的那一句生效，
  有循环时让循环管结尾；播完之后做什么交给纯函数 `planShadow`（`features/media-player/lib/shadow.ts`），复述停顿是
  store 里的 `shadowWait` 状态，计时器在 `useMediaBinding` 里，读者的任何操作（`toggle`、`seek`、切句、循环、`setPlaying`）
  都经 `IDLE_PROGRAM` 清掉它，新增会动播放的入口时也要清，否则过期的停顿会在别处接着放；跟读的录音对比（`record` 设置、`D` 键与「对比」按钮）接在同一套程序上：复述停顿由 `useTakes`（`features/media-player/lib/useTakes.ts`，被 `useMediaBinding` 调用）用 `recordPause` 录下来，`capturing` 说明有录音开着，停顿一结束 `planShadow` 就给 `compare`，store 的 `compare`（`original` 再 `take`，`then` 是 `program` 或 `stop`）先再放原句、再让一个共享的 `Audio` 放录音（`take-player.ts`，整页只有这一个录音元素，不是每遍新建：iOS 只让在手势里播放过的元素之后不经手势发声，所以 `primeTakeAudio` 要在开关、「对比」、播放、空格、`D` 与面板容器上的捕获监听这些手势里同步调用，浏览器拒绝了就保持未解锁、下次手势再试，释放一遍录音时保留元素），源媒体停在句首等着，所以那一个媒体元素仍是唯一的时间线；`compare` 也在 `IDLE_PROGRAM` 里，任何动播放的入口都会让录音停下、让录音播放停下。浏览器 API 全在 `lib/recorder.ts`（有假的 `MediaRecorder` 与 `getUserMedia` 可测），录完立刻停掉麦克风的轨道（iOS 会因为开着的麦克风压低播放音量），格式用 `isTypeSupported` 选。录音只在内存里，每句留最后一遍，随 `reset`、回首页和页面卸载丢掉并释放对象 URL，`takesEpoch` 防止关了集之后才录完的那一遍落进新一集；不写盘、不发 host、不打分。录音只存在于复述停顿之内：`mergeShadow` 保证 `record` 为真时停顿不是 `off`（打开开关会把关着的停顿设成「一句长」，关掉停顿开关也关）。麦克风用不了就关掉开关并经 `micNotice` 在页面顶部给一句话，程序照常跑；点词气泡把词写进备注的 `[word]`（`features/notes/lib/words.ts`），拖选或 `Shift` 点选的词组
  也是一个 `[her skirt]`，再点「已记下」就去掉，不新增笔记字段；复习（`features/review`）是练习页的一种模式，
  英文用跟读的同一套遮挡，复习期间不写听到哪里；
  听完小结靠 store 的 `finishCount`，卡片按次数关闭，不按剧集。`reset` **不能**清掉 `duration`，字幕
  通常晚于音频元数据读完，清掉进度条就废了。
- **耳机、AirPods 与锁屏按键走 Media Session，不走键盘**，决定与取舍见 `.agents/notes/implemented/feature/2026-10-14-shadowing-as-the-repeater-loop.md`。
  `useMediaSession`（`features/media-player/lib/`，页面在练习视图打开时调用）注册 `play`、`pause`、`stop`（按暂停算）、`previoustrack`、`nexttrack`，
  回首页或页面卸载就清掉处理函数、元数据与状态，没有开关：没有处理函数时浏览器会绕过 store 直接动媒体元素。几处别拆：
  **播放按钮、空格键与这些处理函数都调 `togglePlayback`**（`lib/transport.ts`，录音开着时先 `primeTakeAudio`，再 store 的 `toggle`），不要在哪一处再写一份；
  `play` 与 `pause` 带 `isRunning` 的条件，不是直接切换，因为复述停顿里媒体是暂停的而会话报告 `'playing'`，耳机发来的 `play` 不该把程序停掉。
  **不要注册 `seekbackward`、`seekforward`、`seekto`**（前两个明确设成 `null`）：iOS 一旦有 seek 处理函数，锁屏和 AirPods 就改成「跳过 N 秒」，上一首、下一首没了。
  上一首、下一首照页面的方向键映射：复习进行时是队列里往回和跳过，复习小结打开时不动；映射就是键盘那一份（`lib/keymap.ts` 的
  `headsetAction`，用同一个 `keyAction` 把只关乎焦点的状态关掉再问），不要在页面里再抄一遍。元数据由纯函数 `sessionMetadata` 算，
  标题复用 locale 的 `cueOf`，专辑复用 `appTitle`；浏览器那一半在 `media-session.ts` 的环境对象后面，用假 session 测，每次调用都包了 try/catch。
  没有真机验过，AirPods 与锁屏的实际表现见 note 里「To verify on a real iPad」那一条。
- **复选框不算「正在输入」**：`isTypingTarget` 把 `input` 一律当输入框，打勾后焦点留在复选框上，
  `Esc` 和快捷键全部失效。现在只有文本类输入才拦。
