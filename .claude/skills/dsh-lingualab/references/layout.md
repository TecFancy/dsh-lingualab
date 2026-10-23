# 练习页布局

改练习页的布局、右栏、调时间模式、画面或卡片怎么让位时读这份。

## 页面结构

- 页面有两个视图：
  - 首页：「接着上次」大卡片、剧集卡片网格、虚线框的拖放区。
  - 练习：顶栏高 48，下面分左右两栏。左栏是舞台（当前句、前后句、播放卡片、按键标签）；
    右栏是字幕栏，宽度 `--ll-side-w`（`clamp(300px,34cqw,440px)`），是页面里唯一的滚动区。
- 栏头的分段控件或 `N` 键把右栏换成「收藏」，宽度和滚动方式不变。
- 改布局时不要把整页变成滚动容器。舞台必须固定，否则「听这一句」又会跟着列表滚走。
- 播放卡片只放每分钟都要用的控件，不常用的收进「更多」。
- 设计稿在 Figma，链接在 README 与 AGENTS.md。稿里用的是写死的色值和 Inter 字体，实现时只用宿主 token。

## 右栏的三种状态

右栏有三种状态：收起、字幕、收藏。

- 「收起」是设置里的 `sideCollapsed`，按浏览器记住；「显示哪个视图」是页面本次打开的状态。两者分开存放
  （`pages/lingualab/lib/side-column.ts` 的纯函数与 `useSideColumn`）。
- 所以 `N` 仍然只切换视图，只有在收起时才直接展开到收藏。顶栏「收藏」旁边的开关和 `\` 键负责收起或展开，不改变视图。
- 收起后右栏完全不渲染（不留窄条），`.dsh-lingualab-body` 带上 `is-side-collapsed`：
  - 画面占满整个宽度（`--ll-pic-share:1`、`--ll-pic-w:100%`）。
  - 720px、405px、高度上限和 `is-picture-squeezed` 的规则不变。
- 展开和收起有 200ms 的过渡（`ui/PracticeSideSlot.tsx`，用 `usePresence`）：
  - 右栏包在 `.dsh-lingualab-side-slot` 里，过渡的是包装层的宽度和不透明度，舞台在同一个过渡里让出或收回宽度。
  - 里面的列表始终是完整宽度 `--ll-side-w`，由包装层裁掉，所以过渡中字幕行不会重新换行。
  - 收起时列表在 200ms 里还在，但已经点不到（`pointer-events:none`、`aria-hidden`），之后才卸载。
  - 画面跟着一起变：`styles-side.ts` 用 `@property` 注册了 `--ll-pic-share` 和 `--ll-pic-w`，它们的变化是过渡而不是跳变。
  - `SIDE_MS` 和样式里的 `.2s` 要一起改。系统开了「减少动态效果」时，页面的规则把过渡置零，`usePresence` 也不等。
- 展开时字幕列表重新挂载，`SubtitlePanel` 的 layout effect 让它直接定位到正在播放的那一句。

## 行窄时右栏是抽屉，没选过时默认收起

决定与取舍见 `.agents/notes/implemented/feature/2026-10-21-side-column-over-a-narrow-stage.md`。

- `.dsh-lingualab-body` 窄于 982px 就算窄（`side-column.ts` 的 `sideFloats`），由 `useSideFloating` 用 `ResizeObserver` 量。
  这个数是从侧栏的宽度（820px 以内 260px，以上 `clamp(300px,34cqw,440px)`）推出来的，改侧栏宽度时要一起改 `SIDE_FLOAT_BELOW`。
- 行窄时 body 一直带 `is-side-narrow`，包装层带 `is-floating`（看行宽，不看开没开）：侧栏绝对定位盖在舞台上，
  宽 360px，下面垫 `dsh-lingualab-side-scrim`。这样抽屉退场时还留在原位，不会掉回文档流。
  - 抽屉从右边滑进滑出，遮罩同时淡入淡出，都在包装层的 `is-open` 上过渡，200ms 后一起卸载。
  - 舞台的样式和收起时一样（`styles-side.ts` 里两组选择器并列），所以抽屉开合时舞台不变。
- 层级：遮罩 16、抽屉 17，在完成卡片（15）上面，五步抽屉（21、22）下面。
- `Esc` 的顺序是五步抽屉、浮着的侧栏、A-B 标记（`keymap.ts` 的 `escapeAction`，`sideFloating` 与 `close-side`）。
- `sideCollapsed` 是 `true`、`false`、`null` 三种值，`null` 表示没选过。页面实际的收起状态是
  「本次打开的临时状态，否则存下的选择，否则行窄不窄」（`collapseFor`）。
- 只有顶栏开关和 `\` 一定存下选择。没选过时，`N`、`showKept`、`Esc`、遮罩只改本次打开的临时状态（`collapseTarget`）。
- 行宽在第一次绘制前的 layout effect 里量到，所以没选过的设备在窄行里不会先闪一下展开。

## 顶栏

- 顶栏是名为 `ll-top` 的宽度容器。宽度不到 720px 时，「返回」和「收藏」两个按钮只显示图标（和计数）。
- 顶栏的按钮是 `flex:none`，空间不够时只压缩标题。
- 右侧按作用对象分两组（`.dsh-lingualab-top-group`，带 `role="group"` 和组名），中间一条 1px 的竖线：
  - 「右栏」组：收藏和右栏开关（`PracticeSideChips.tsx`）。
  - 「进度与设置」组：五步和设置，放在最右边（`PracticeProgressChips.tsx`）。
  - 组内间距仍是 8px，触屏 44px 点按区域就是按这个间距算的。组不定位也不裁剪，五步抽屉照旧相对页面定位。
- 触屏上按钮靠透明的 `::after` 把点按区域扩到 44px，外观不变。
- 这几条样式在 `shared/lib/styles-side.ts`，接在 `STYLES` 末尾（`styles.ts` 已到体量上限）。

## 下一步

已有两篇 proposed note：

- 在舞台上拖动来定位句子。
- 给右栏的展开收起加动画，并重新排列顶栏的按钮。

## 布局按练习栏的大小，不按窗口

决定与取舍见 `.agents/notes/implemented/architecture/2026-10-14-layout-answers-to-the-practice-column.md`。

- `.dsh-lingualab-practice` 是 `container:ll-practice/size`，响应式规则写成 `@container ll-practice (...)`，
  都放在 `styles.ts` 末尾那一段（它们要覆盖前面同等优先级的规则，所以放在最后）。
- 两个坑：
  - **容器查询量的是内容盒**：写进阈值的数，是栏宽减 48、栏高减 20。
  - 侧栏和字幕栏的存在，使窗口宽度几乎反映不了练习栏有多大，所以不要再写视口断点。样式表测试只放行浏览层的 640。
- 卡片以上的内容都在 `.dsh-lingualab-practice-main` 里，它是唯一的滚动容器，卡片留在它下面。
  句子是 `flex:1 0 auto`，不要改回可以收缩的写法。
- 触屏的规则看 `(hover:none) and (pointer:coarse)`，不看宽度。
- 想看改动效果，把真实组件渲染成静态标记，配上真实的样式表，在浏览器里按 iPad 的各个尺寸读高度。

## 调时间模式

- 调时间面板在场时，页面给练习栏加上 `is-timing`（用类名，不用 `:has()`）。「在场」指
  `usePresence(timing.session !== null || timing.moving, TIMING_EXIT_MS)` 的 `mounted`，比会话多保留退出动画那一小段时间；
  先存后切的那次重新读取期间（`moving`）会话已经结束，面板也留着。
- 布局跟着「在场」变，按键和舞台上的按钮跟着会话变。`mounted` 与 `shown` 由页面算出后传给 `TimingStrip`，
  面板自己不再带计时器，所以练习栏退出调时间模式和面板卸载发生在同一次提交里。
- 面板从第一帧起就占满高度，只有卡片淡入淡出。**不要**改回「长出一个网格行」的做法：
  那样画面会先跳到最大再缩小，关闭时布局要动两次。
- 这时播放卡片折叠成进度条加一行「变速 | 上一句、播放、下一句」。其余按钮、按键提示和菜单用类名隐藏，不卸载。
- 正在播放的画面是 `ll-video` 尺寸容器，占用剩余的高度。
- 剩余高度不到 120px 时，整个画面舞台收起，句子舞台改成 `flex:1 1 auto`，把句子居中：
  - 尺寸容器无法收起自己，所以由页面里的 `usePictureRoom`（开关是「面板在场」，不是会话）测量，给练习栏加上
    `is-picture-squeezed`；剩余高度回到 128px 才恢复。
  - 测量的是滚动容器的高度减去不随画面变化的部分，绝不读画面自己的尺寸，否则会自己追自己。
  - 不要再加回画面上的 `@container ll-video (max-height)` 规则。
- 栏宽不到 648px 或栏高不到 780px 时，调时间面板改用紧凑布局，每行调一个边界。
- 文字较长的按钮同时渲染长短两种文字（`dsh-lingualab-label-long` / `-short`），由样式表挑一种显示，完整文字留作 `aria-label` 与 `title`。
- 调时间时要新隐藏一样东西，就加进 `styles.ts` 末尾 `.is-timing` 那一段，不要写成对面板的 `:has()`。

## 不在调时间时，画面也会让位

- 正在播放的画面舞台（`:not(.is-timing) .videostage.is-shown.has-screen`）：
  - `flex-basis` 是画面原本的高度，取份额、720px、高度上限三者中最小的，用 `--ll-pic-share` 与 `--ll-pic-h` 表示，
    舞台和画面都要有这两个变量。
  - `flex-shrink:1`，是 `ll-video` 尺寸容器。
  - 舞台写了 `box-sizing:content-box`，不要删。宿主如果有全局的 border-box 重置，基准值会少 20px。
- 这时 `usePictureRoom` 的开关是「画面在显示状态下播放」，不再是面板在场。
- 不到 120px 就收起舞台的规则不带 `is-timing`，但句子舞台的 `flex:1 1 auto` 只在调时间时给；不在调时间时，句子不允许缩到比文字还矮。
- 画面不到 160px 时不画角落里的胶囊（`ll-video (max-height:159px)`，只影响画面上画什么）。

## 按真实 Safari 的可见高度测量

- iPad 的状态栏加工具栏占 74px（紧凑标签）到 110px（单独的标签栏），所以横屏的可见区域是：

  | 机型 | 宽 | 可见高度 |
  |---|---|---|
  | iPad mini | 1133 | 670 与 634 |
  | iPad Air 11 寸 | 1180 | 746 与 710 |
  | iPad Pro 11 寸 | 1194 | 760 与 724 |
  | iPad Pro 13 寸 | 1366 | 950 与 914 |

  不是整机分辨率。
- 滚动条按 iPad 的悬浮式滚动条算（桌面 Chrome 的 15px 滚动条会让文字多折一行）。

## 代替画面的卡片也会让位，而且分步

卡片是一段文字加几个按钮，高度取决于是哪一张卡片、带不带流畅版和本地文件，样式表算不出来，所以由页面逐步试。

- `useCardFit(practiceMain, card !== null && !videoPlays)` 每次都从完整的卡片开始，依次给滚动容器 `.dsh-lingualab-practice-main` 加上：
  1. `is-card-compact`：收紧间距。
  2. `is-card-lean`：去掉图标、说明、备注、流畅版与本地文件，正文最多两行。
  3. `is-card-line`：只剩一行。
  4. `is-card-hidden`：整个舞台不渲染。
- 每加一步就看 `scrollHeight` 是否仍大于 `clientHeight`，第一个不再滚动的就是结果。
  都不行就停在 `line`：藏起卡片也解决不了问题，而准备视频的入口必须留着。
- 选择与类名的逻辑是 `card-fit.ts` 里的纯函数，测试也在那里。
- 类名由 hook 直接设在这个元素上，React 从不写它的 class，所以不需要状态，也不会重新渲染。
- `VideoStage` 渲染卡片时给舞台加上 `has-card`，hook 靠它找到卡片。调时间期间舞台是 `display:none`，hook 就不测量。
- 每次都从头试，结果只取决于空间和卡片，与上一次无关，所以不需要滞回。
- 每一步各显示什么，写在 `styles.ts` 里 `.is-card-*` 那一段。给卡片新增内容时，要想好它在哪一步消失。
- 按钮的 44px 是 `min-height`，任何一步都不许改按钮的 `min-height`。
