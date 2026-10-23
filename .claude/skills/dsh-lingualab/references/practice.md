# 练习页的交互

改快捷键、拖选、焦点、跟读与录音、复习、耳机按键时读这份。

## 快捷键挂在面板容器上，不挂 `window`

- 会话和面板在同一个页面里。面板如果在 `window` 上监听空格键，会话的输入框就没法输入空格了。
- 浮层打开时，容器把键盘交给浮层（页面里 `layer` 那个提前返回）。收藏不是浮层，是右栏的另一个视图。
- 复习时 `1` 到 `3` 是评级，`←` `→` 在复习队列里前后移动，不在句子之间移动。
- 带 Ctrl、Cmd、Alt 的组合键一律不处理，留给浏览器和 dsh。
- **复选框不算「正在输入」**：`isTypingTarget` 以前把所有 `input` 都当输入框，打勾后焦点留在复选框上，
  `Esc` 和快捷键全部失效。现在只拦文本类输入框。

## 键盘映射是数据

2026-10-15 起，按键的处理拆成三处：

- **判断按键**：`pages/lingualab/lib/keymap.ts` 的 `keyAction(按键, 上下文)` 是纯函数，返回一个动作
  （`toggle-play`、`step`、`review-back`……），或者返回 `null` 表示这个键不归面板管。
- **执行动作**：`key-actions.ts` 里的一张表。
- **拦截事件、点亮键帽**：`useKeyboard.ts`。

新增快捷键就在这三处各加一条：keymap 里的判断和它的测试；key-actions 里这个动作做什么（类型会提示漏了哪个）；
需要点亮键帽的，在 `flashOf` 里加。

- 只有 DOM 才能回答的两个问题（焦点是否在输入框里、是否在按钮上），由 `useKeyboard` 先查好，作为布尔值传进去，所以 keymap 不碰 DOM。
- 「更多」菜单的 Escape 对应动作 `close-menu`，并带上菜单没开时 Escape 原本的含义（`otherwise`），所以按一次只关一层。
  倍速选择框和「字幕」弹层也由同一个 `closeMenu()` 关。控制栏再加弹层时，用 `widgets/control-bar/lib/usePopover.ts`
  （在外面按下就关、`escapeToClose`、`focusButton`），并把它加进 `closeMenu()`。
- 一个键有没有事可做取决于 store 的状态时（`V` 要有视频，`=` 要有可回去的倍速），由 `useKeyboard` 算成布尔值放进上下文
  （`hasVideo`、`canResetSpeed`），无事可做时 keymap 返回 `null`，按键留给浏览器，不要吃掉它。

## 舞台上的拖选用指针事件，不用鼠标事件

- iOS 上手指拖动时不发任何鼠标事件，只在点一下之后补发合成的鼠标事件。所以基于 `mousedown`、`mouseenter`、`mouseup` 的拖选
  在 iPad 上只剩点单个词能用；手指在滚动栏里拖是滚动，长按则是系统的文字选择。
- 触摸指针会被按下的那个元素隐式捕获，**其他单词永远收不到进入事件**。所以不能靠每个词上的 `onMouseEnter`，
  要在 `pointermove` 里用 `document.elementFromPoint` 按坐标找到词。
- `touch-action` 对非替换的行内元素**不生效**（词是 `span`），所以它写在整块英文 `.dsh-lingualab-stage-en:not(.is-masked)` 上，
  同时关掉文字选择和长按菜单。因此整句不能作为滚动的起点，舞台的其余部分仍然可以。
- 拖选的逻辑在 `widgets/practice-stage/lib/word-drag.ts`，是不依赖 React 的纯模块，用假的指针源在 node 里测试。
- 鼠标的 `mousedown` 仍要 `preventDefault`，否则文字选择会盖住选中的词组。
- 点气泡外面关闭气泡，也挂在 `pointerdown` 上。

## 点过按钮之后空格键仍然管用

做法是不让鼠标把焦点留在按钮上：

- 问题：Windows 上的 Chrome 点按钮会把焦点给按钮；而点了就消失的按钮（大画面的「R 看一眼这句」、舞台上用「R」揭开）
  会把焦点丢给文档，落到面板容器外面，快捷键就一直失效，直到下次点页面。
- 页面根元素的 `onMouseDown` 对按钮调用 `preventDefault`（`shared/lib/focus.ts` 的 `holdsMouseFocus`）。
  模态层与设置抽屉除外，它们自己处理键盘。
- 容器的 `onKeyDown` 把按钮上的空格与回车留给按钮自己（`keepsKeyForTarget`），用 Tab 切过去的人照常能按。
- 会在按下时消失的按钮，在点击处理里先调 `returnFocusToPage` 再改状态，这样用键盘按下时焦点也不会丢。
  新加会自己消失的按钮也照这样做。

## 练习页的几个行为各有出处，不要拆

### 进度条与跟读

- 进度条（`Scrubber`）在拖动期间只在松手时跳转一次。
- 跟读模式（store 的 `pauseAfterSentence` 与 `revealed`）在 `onTime` 里判断，只对刚播完的那一句生效；有循环时由循环负责句尾。
- 一句播完之后做什么，交给纯函数 `planShadow`（`features/media-player/lib/shadow.ts`）决定。
- 复述停顿是 store 里的 `shadowWait` 状态，计时器在 `useMediaBinding` 里。
- 用户的任何操作（`toggle`、`seek`、切句、循环、`setPlaying`）都通过 `IDLE_PROGRAM` 清掉停顿。
  新增会改变播放的入口时也要清，否则过期的停顿会在别处接着播放。

### 录音对比

跟读的录音对比（`record` 设置、`D` 键与「对比」按钮）接在同一套程序上：

- 复述停顿期间由 `useTakes`（`features/media-player/lib/useTakes.ts`，由 `useMediaBinding` 调用）用 `recordPause` 录音，
  `capturing` 表示有录音正在进行。
- 停顿一结束，`planShadow` 就返回 `compare`。store 的 `compare`（先 `original` 再 `take`，`then` 是 `program` 或 `stop`）
  先重放原句，再让一个共享的 `Audio` 元素播放录音。源媒体停在句首等着，所以那一个媒体元素仍然是唯一的时间线。
- 播放录音的 `Audio` 在 `take-player.ts` 里，整页只有这一个，不是每次新建：
  - iOS 只允许在用户手势里播放过的元素，之后不经手势也能出声。
  - 所以 `primeTakeAudio` 要在这些手势里同步调用：开关、「对比」、播放、空格、`D`，以及面板容器上的捕获监听。
  - 浏览器拒绝了就保持未解锁状态，下次手势再试。释放一遍录音时保留这个元素。
- `compare` 也在 `IDLE_PROGRAM` 里，任何改变播放的入口都会让录音停止、录音的播放停止。
- 浏览器 API 全部放在 `lib/recorder.ts`（有假的 `MediaRecorder` 与 `getUserMedia`，可以测试）。
  录完立刻停掉麦克风轨道（iOS 在麦克风开着时会压低播放音量）。录音格式用 `isTypeSupported` 选。
- 录音只存在内存里，每句只留最后一遍：
  - 随 `reset`、回首页和页面卸载丢弃，并释放对象 URL。
  - `takesEpoch` 防止关掉一集之后才录完的那一遍落进新的一集。
  - 不写盘、不发给服务端、不打分。
- 录音只发生在复述停顿里：`mergeShadow` 保证 `record` 为真时停顿不是 `off`。打开录音开关会把关着的停顿设成「一句长」，
  关掉停顿开关也会关掉录音。
- 麦克风不可用时，关掉录音开关，并通过 `micNotice` 在页面顶部显示一句提示，程序照常运行。

### 记词、复习与小结

- 点词气泡会把词写进备注的 `[word]`（`features/notes/lib/words.ts`）。拖选或 `Shift` 点选的词组也是一条，如 `[her skirt]`。
  再点「已记下」就去掉，不新增笔记字段。
- 复习（`features/review`）是练习页的一种模式，英文用跟读的同一套遮挡，复习期间不记录听到哪里。
- 听完的小结靠 store 的 `finishCount`，卡片按次数关闭，不按剧集。
- `reset` **不能**清掉 `duration`：字幕通常比音频元数据晚读完，清掉的话进度条就不能用了。

## 耳机、AirPods 与锁屏按键走 Media Session，不走键盘

决定与取舍见 `.agents/notes/implemented/feature/2026-10-14-shadowing-as-the-repeater-loop.md`。

- `useMediaSession`（`features/media-player/lib/`，页面在练习视图打开时调用）注册 `play`、`pause`、`stop`（按暂停处理）、
  `previoustrack`、`nexttrack`。
- 回首页或页面卸载时，清掉处理函数、元数据和状态。它没有开关：没有处理函数时，浏览器会绕过 store 直接操作媒体元素。

下面几处不要拆：

- **播放按钮、空格键和这些处理函数都调用 `togglePlayback`**（`lib/transport.ts`：录音开着时先 `primeTakeAudio`，再调 store 的 `toggle`），
  不要在别处再写一份。
- `play` 与 `pause` 带 `isRunning` 条件，不是直接切换。复述停顿期间媒体是暂停的，而会话报告的是 `'playing'`，
  耳机发来的 `play` 不应该把程序停掉。
- **不要注册 `seekbackward`、`seekforward`、`seekto`**（前两个明确设成 `null`）。iOS 上只要有跳转处理函数，
  锁屏和 AirPods 就会改成「跳过 N 秒」，上一首、下一首就没了。
- 上一首、下一首按页面方向键的映射处理：复习进行中是在队列里后退和跳过，复习小结打开时不动。
  映射直接用键盘那一份（`lib/keymap.ts` 的 `headsetAction`：关掉只与焦点有关的状态后，再问同一个 `keyAction`），不要在页面里再抄一遍。
- 元数据由纯函数 `sessionMetadata` 计算，标题复用 locale 的 `cueOf`，专辑复用 `appTitle`。
- 浏览器相关的部分放在 `media-session.ts` 的环境对象后面，用假的 session 测试，每次调用都包了 try/catch。
- 还没有在真机上验证过。AirPods 与锁屏的实际表现，见 note 里「To verify on a real iPad」那一条。
