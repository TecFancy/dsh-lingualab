/**
 * The practice view's right column: the subtitles, or the sentences kept from them, under one switch.
 *
 * The switch is drawn here because both columns carry it in their own header; which of the two shows is the page's
 * (the `N` key and the top bar's chip flip it too).
 */
import type { SubtitleZhMode } from '../../../entities/cue/index.ts'
import type { Translate } from '../../../context.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import type { NotesState } from '../../../features/notes/index.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import { Segmented } from '../../../shared/ui/Segmented.tsx'
import { NotesPanel } from '../../../widgets/notes-panel/index.ts'
import { SubtitlePanel } from '../../../widgets/subtitle-panel/index.ts'
import type { Column, StagePhrase } from '../lib/panel.ts'

export interface PracticeSidePaneProps {
  readonly t: Translate
  readonly library: LibraryState
  readonly notes: NotesState
  readonly column: Column
  readonly onColumn: (column: Column) => void
  /** The sentence the audio is inside, and the one the keyboard points at. */
  readonly activeIndex: number
  readonly selectedIndex: number
  readonly zhMode: SubtitleZhMode
  /** Cue indexes whose sentence is kept, so the list can mark them. */
  readonly notedIndexes: ReadonlySet<number>
  /** The list scrolls itself to the playing sentence. */
  readonly follow: boolean
  readonly onFollow: (follow: boolean) => void
  /** The kept phrase of the sentence on stage, whose card the kept column opens. */
  readonly stagePhrase: StagePhrase | null
  /** A review is running, so the kept column's review button reads as started. */
  readonly reviewing: boolean
  readonly onSelect: (index: number) => void
  /** Play the sentence at this index. */
  readonly onPlay: (index: number) => void
  readonly onKeep: (index: number) => void
  readonly onReplay: (phrase: NotePhrase) => void
  readonly onReview: () => void
}

export function PracticeSidePane({
  t,
  library,
  notes,
  column,
  onColumn,
  activeIndex,
  selectedIndex,
  zhMode,
  notedIndexes,
  follow,
  onFollow,
  stagePhrase,
  reviewing,
  onSelect,
  onPlay,
  onKeep,
  onReplay,
  onReview,
}: PracticeSidePaneProps) {
  const switcher = (
    <Segmented
      label={t('columnLabel')}
      value={column}
      onChange={onColumn}
      options={[
        { id: 'transcript', label: t('transcript'), count: library.cues.length },
        { id: 'kept', label: t('columnKept'), count: notes.phrases.length },
      ]}
    />
  )
  if (column === 'kept') {
    return (
      <NotesPanel
        t={t}
        notes={notes}
        segments={library.segments}
        switcher={switcher}
        currentIndex={stagePhrase?.index ?? null}
        onReplay={onReplay}
        onReview={onReview}
        reviewing={reviewing}
      />
    )
  }
  return (
    <SubtitlePanel
      t={t}
      switcher={switcher}
      cues={library.cues}
      loading={library.cuesLoading}
      activeIndex={activeIndex}
      selectedIndex={selectedIndex}
      zhMode={zhMode}
      notedIndexes={notedIndexes}
      follow={follow}
      onFollow={onFollow}
      onSelect={onSelect}
      onPlay={onPlay}
      onKeep={onKeep}
    />
  )
}
