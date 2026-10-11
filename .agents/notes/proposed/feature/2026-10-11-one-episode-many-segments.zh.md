# Agent Note: 一集多段

Status: proposed

## Problem

学习素材按电视剧的一集一个文件夹来放，每集切成若干场景。`S01E01` 里有十段，每段是三个同名的文件：

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

扫描把一个文件夹当作一个音频文件。`pickAudioFile` 按目录顺序取第一个音频，而不带 stem 的配对会把文件夹里所有字幕都当候选，
于是第一个含中文的文件和第一个不含中文的文件胜出，不管它们属于哪一段。实际用起来是这样：

- 作为剧集只能打开第一段。其余九段只能从「浏览已有的文件」里一个个打开，成了以原始文件名为标题的文件剧集，
  收藏也存进插件的配置，而不是文件夹里的 `notes.md`。
- 结束卡片在十段里听完一段时就说「这一集听完了」，也没有往下走的入口。
- `双语` 不是语言标记，所以每段都有两个没有标记的字幕，单看名字配不出来，选择器把十行都标成「字幕待确认」，却没有可以确认的地方。

## Decision

**一个文件夹里有两个或更多音频时，它是一集，由若干段组成。** 一段就是一个音频 stem。段的顺序沿用扫描已有的自然顺序
（`compareIds`），所以 `02` 排在 `10` 前面。只有一个音频的文件夹和所有文件剧集没有分段，行为和现在完全一样。

**每段按 stem 配自己的字幕，取最长的 stem。** 一个字幕属于 `sameStem` 接受它的那些 stem 中最长的那一段，所以
`04_Dunphy家-Luke射击.srt` 不会被一个叫 `04_Dunphy家` 的兄弟段认领。导入在处理一次拖入时已经用这条规则，
现在扫描和选择器在文件夹内部也用它。

**`双语` 和 `bilingual` 是第三种标记：一个文件里两种语言都有。** 有这样一个文件时，它是中文的来源（页面本来就只取它的中文行），
英文轨取带英文标记的文件，没有就取唯一一个没有标记的文件，再没有就取这个双语文件本身。这一步只看名字，
所以选择器不读任何内容就能写「中英字幕」，这种排布也不会再出现「字幕待确认」。

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

// OpenRequest: with episodeId, which segment to open. Omitted means the one to continue.
readonly segment?: string

// OpenPayload: the segment that was opened, null for an episode without segments.
readonly segment: string | null
```

媒体地址不变：`/lingualab/media/<episode>/<file>` 本来就能提供文件夹里的任何文件。

**练习页同时显示集和段，并能在段之间移动。** 顶栏是剧集标题，下面一行是 `01 · Dunphy家的早晨`，一个分段按钮打开全部段的列表，
听完的段带一个标记。一段听完而它不是最后一段时，结束卡片说这一段听完了，第一个动作是「下一段：足球场」，并且获得焦点。
只有最后一段才说「这一集听完了」。首页卡片写「S01E01 · 3 / 10 段」，「继续练习」打开最近听过的那一段。

**笔记仍然是每集一份 `notes.md`，按段分组，每段一个标题。** 收藏行的格式不变；一组行上方的 `## <segment id>` 标题说明它们属于哪一段：

```markdown
# S01E01 笔记

## 01_Dunphy家的早晨

- [ ] 00:01 | Kids, breakfast! | 孩子们 吃早饭了 | | #review

## 02_足球场

- [ ] 00:09 | He tripped him, Jay. | 他绊倒他了 杰 | |
```

前言在第一个段标题或第一条收藏行处结束，取先出现的那个。`NotePhrase` 多一个可选的 `segment`，两条收藏只有段也相同才算同一句。
抽屉按段给卡片分组，从另一段的卡片重播时先打开那一段，再跳到那个时间。

**听到的位置按段记，五步仍然按集记。** 一段的位置存在 `<episode id>::<segment id>` 这个键下。一集各段记录中最新的那条，
就是「继续」要去的地方；一段存下的位置离它的时长不到一秒，就算听完。五步描述的是看完整的一集（22 分钟是一集的长度，不是一个场景），
所以它们仍用剧集 id 作键。`MAX_PROGRESS_ENTRIES` 从 100 提到 1000，因为一集现在可能占十条。

**不在这次范围内：** 把各段连起来当一条音轨播放、按段的五步、在页面里给段改名或排序，以及对导入和文件剧集的任何改动。

## Alternatives considered

- **把文件夹里的每个音频都列成一集，在首页按文件夹分组。** 工作量大约一半，扫描也保持扁平。但它丢掉了素材被切成这样的两个用处：
  收藏会散在十个地方，而不是一份复习清单；一个场景听完也没有下一个场景可以接。
- **把各段拼成一条虚拟音轨。** 一条时间线能让现有的剧集模型原样适用，但各段是独立的文件，字幕时钟也各自独立，
  每一次跳转、每一个收藏时间戳和每一个句子序号都要查一张偏移表，中间少一个文件，后面的全部错位。
- **在每条收藏行里加一列写段。** 解析起来简单，但它改的是读者会手工编辑、旧文件也没有的行格式。标题是一个人本来就会写的东西，
  没有标题的文件照样能读。
- **让读者确认哪个字幕是哪种语言。** 这种排布有规律，看名字就能定，为十个一模一样的情况各确认一次是负担，不是选择。

## Consequences

- 原来打开第一个音频的文件夹，现在按分段打开。里面已有的收藏没有标题；它们是对着第一段记下的，读取时算作第一段，
  下一次保存时写到它的标题下。
- 存在裸剧集 id 下的旧位置，在第一段写出自己的记录之前，都当作第一段的位置来读。
- 主机的字幕分类多了 `both` 标记，这也会改变选择器给分段文件夹之外其他 `_双语` 文件的标注，而且是往好的方向。
- `keptSentenceKey` 和 `sameKeptSentence` 把段也算进去，所以两个都在 00:02 以「Kids?」开头的场景不再共用一颗星。
- 五步的时长保持不变；让它们跟着媒体长度走是另一项改动。
