# Agent Note: 一集分成多段

Status: implemented

## Problem

学习素材按电视剧一集一个文件夹存放，每集切成若干场景。`S01E01` 里有十段，每段是三个同名的文件：

```text
01_Dunphy家的早晨.mp3
01_Dunphy家的早晨.srt         English only
01_Dunphy家的早晨_双语.srt    Chinese line above English, with {\fs16\an2\b0} style tags
02_足球场.mp3
02_足球场.srt
02_足球场_双语.srt
...
10_尾声.mp3
```

库扫描把一个文件夹当作一个音频文件。`pickAudioFile` 按目录顺序取第一个音频，而不按词干（stem）的配对会把文件夹里所有字幕都当作候选，
于是取第一个含中文的文件和第一个不含中文的文件，不管它们属于哪一段。实际用起来是这样：

- 作为剧集只能打开第一段。其余九段只能在「浏览已有的文件」里一个个打开，成为以原始文件名为标题的文件剧集，
  收藏也存进插件的 profile，而不是文件夹里的 `notes.md`。
- 十段里听完一段，结束卡片就说「这一集听完了」，也没有继续往下听的入口。
- `双语` 不是语言标记，所以每段都有两个没有标记的字幕，单看文件名配不出来；选择器把十行都标成「字幕待确认」，却没有地方可以确认。

## Decision

**一个文件夹里有两个或更多音频时，它是一集，由若干段组成。** 一段就是一个音频词干。段的顺序沿用库扫描已有的自然顺序
（`compareIds`），所以 `02` 排在 `10` 前面。只有一个音频的文件夹和所有文件剧集都不分段，行为和原来完全一样。

**每段按词干配对自己的字幕，取最长的词干。**

- 一个字幕归到 `sameStem` 接受它的那些词干中最长的那一段，所以 `04_Dunphy家-Luke射击.srt` 不会被归到同一文件夹里叫
  `04_Dunphy家` 的另一段。
- 导入在给一次拖入的文件分组时已经用这条规则。现在规则收进一个函数 `owningStem`，导入分组、库扫描、选择器和打开都调用它，
  所以在「一个字幕属于哪一段」这件事上不会各说各话。

**`双语` 和 `bilingual` 是第三种标记：一个文件里有两种语言。** 有这样的文件时：

- 它是中文的来源（页面本来就只取它的中文行）。
- 英文轨取带英文标记的文件；没有就取唯一一个没有标记的文件；再没有就取这个双语文件本身。
- 这一步只看文件名，所以选择器不读任何内容就能显示「中英字幕」，这种文件布局也不会再出现「字幕待确认」。

**协议多一个列表和一个可选字段。**

```ts
export interface EpisodeSegment {
  /** The audio stem, unique within the episode: `01_Dunphy家的早晨`. */
  readonly id: string
  /** 1-based position in natural order. */
  readonly index: number
  /** Display title: the stem without a leading number and separator, `Dunphy家的早晨`. */
  readonly title: string
  readonly audio: string
  readonly audioBytes: number | null
  readonly subtitleEn: string | null
  readonly subtitleZh: string | null
}

// EpisodeEntry: segments in order; empty unless the folder holds two or more audio files.
// The entry's own audio and subtitle fields mirror the first segment.
readonly segments: readonly EpisodeSegment[]

// OpenRequest: with episodeId, which segment to open. Omitted means the first one.
readonly segment?: string

// OpenPayload: the segment that was opened, null for an episode without segments.
readonly segment: string | null
```

媒体地址不变：`/lingualab/media/<episode>/<file>` 本来就能提供文件夹里的任何文件。

接着听哪一段不由服务端（host）决定：

- 服务端知道的不比进度文件多，而页面本来就掌握用户听到的位置，所以由页面确定「继续」指向哪一段（即下面说的最新一段），
  并在请求里明确写出段的 id；没有写时，服务端按第一段处理。
- 剧集里没有的段 id 会被拒绝并附上原因，绝不悄悄换成第一段，否则位置和笔记就会记到错误的音频上。

**练习页同时显示集和段，并能在段之间切换。**

- 顶栏显示剧集标题，下面一行是 `01 · Dunphy家的早晨`（数字取文件名里写的那个，没有就取位置）。
- 一个分段按钮打开全部段的列表，听完的段带一个标记。
- 一段听完而它不是最后一段时，结束卡片说这一段听完了，第一个动作是「下一段：足球场」，并且获得焦点。
  只有最后一段才说「这一集听完了」。
- 首页卡片显示「S01E01 · 3 / 10 段」。「继续练习」打开最近听过的那一段；那一段已经听到结尾时，
  打开下一个还没听完的段（卡片上写「下一段」，而不是停在哪个时间）。

**笔记仍然是每集一份 `notes.md`，按段分组，每段一个标题。** 收藏行的格式不变；一组行上方的 `## <segment id>` 标题说明它们属于哪一段：

```markdown
# S01E01 笔记

## 01_Dunphy家的早晨

- [ ] 00:01 | Kids, breakfast! | 孩子们 吃早饭了 | | #review

## 02_足球场

- [ ] 00:09 | He tripped him, Jay. | 他绊倒他了 杰 | |
```

- 开头说明在第一个段标题或第一条收藏行处结束，取先出现的那个。标题下面紧跟收藏行才算段标题，
  所以有人在开头说明里当批注写的 `## 备注` 仍然算开头说明。
- 服务端把文件夹里各段的顺序交给写入函数，所以不管收藏以什么顺序到达，文件都按播放顺序排列；500 条的上限仍然按整个文件计算。
- `NotePhrase` 多一个可选的 `segment`，两条收藏只有段也相同时才算同一句。
- 抽屉按段给卡片分组；从另一段的卡片重播时，先打开那一段，再跳到那个时间。

**听到的位置按段记录，五步仍然按集记录。**

- 一段的位置存在 `<episode id>::<segment id>` 这个键下。一集各段的记录中最新的那条，就是「继续」要去的地方；
  一段记下的位置离它的时长不到一秒，就算听完。
- 五步说的是看完整的一集（22 分钟是一集的长度，不是一个场景的长度），所以五步仍用剧集 id 作键。
- `MAX_PROGRESS_ENTRIES` 从 100 提到 1000，因为一集现在可能占十条；接受的最长键从 300 个字符提到 520 个，
  因为段的键里有两个文件名。

**不在这次范围内：** 把各段连起来当一条音轨播放、按段记录五步、在页面里给段改名或排序，以及对导入和文件剧集的任何改动。

## Alternatives considered

- **把文件夹里的每个音频都列成一集，在首页按文件夹分组。** 工作量大约一半，库扫描也保持扁平。但这样就失去了把素材切成这样的两个用处：
  收藏会分散在十个地方，而不是一份复习清单；一个场景听完，也没有下一个场景可以接着听。
- **把各段拼成一条虚拟音轨。** 只有一条时间线，现有的剧集模型就能原样适用。但各段是独立的文件，字幕的时间也各自独立，
  每一次跳转、每一个收藏时间戳和每一个句子序号都要查一张偏移表；中间少一个文件，后面的全部错位。
- **在每条收藏行里加一列写段。** 解析起来简单，但这改动了用户会手工编辑、旧文件里也没有的行格式。标题是人本来就会写的东西，
  没有标题的文件照样能读。
- **让用户确认哪个字幕是哪种语言。** 这种文件布局很有规律，看文件名就能判断；为十个一模一样的情况各确认一次是负担，不是选择。

## Consequences

- 原来只打开第一个音频的文件夹，现在按分段打开。里面已有的收藏没有标题；它们是在第一段上记下的，读取时算作第一段，
  下一次保存时写到第一段的标题下。
- 存在裸剧集 id 下的旧位置，在第一段写出自己的记录之前，都当作第一段的位置读取。
- 服务端的字幕分类多了 `both` 标记，这也会改变选择器对分段文件夹之外其他 `_双语` 文件的标注，而且是变得更准确。
- `keptSentenceKey` 和 `sameKeptSentence` 把段也算进去，所以两个都在 00:02 以「Kids?」开头的场景不再共用一个星标。
- 五步的时长保持不变；让它们跟随媒体长度是另一项改动。
