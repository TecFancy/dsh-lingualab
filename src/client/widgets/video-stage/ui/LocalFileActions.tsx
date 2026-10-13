/**
 * The controls for playing the picture from a file on the reader's own disk: choose one, go on with the one
 * remembered, forget it, or stop using it.
 *
 * Where the browser has `showOpenFilePicker` the choice is a button that opens it (that is what makes the file
 * rememberable); elsewhere it is a `<label>` around a hidden file input, the same way the home's file chooser is, since the
 * React Compiler's lint does not let a ref's `.click()` be passed around. Everything here is a small, quiet control: the
 * picture (or a card) is what the stage is about.
 */
import type { ChangeEvent } from 'react'
import { returnFocusToPage } from '../../../shared/lib/focus.ts'
import type { Translate } from '../../../context.ts'

/** What the stage needs to offer a local file, and what it does with the answers. */
export interface LocalFileProps {
  /** The name of the file in use, or `null` when the served source plays. */
  readonly name: string | null
  /** The name of the file kept from an earlier visit, which one click plays again, or `null`. */
  readonly remembered: string | null
  /** The browser has a file picker that hands out handles, so a choice can be remembered. */
  readonly canPick: boolean
  /** Open that picker; called straight from the click. */
  readonly onPick: () => void
  /** A file came from the plain file input or from a drop. */
  readonly onFile: (file: File) => void
  /** Play the remembered file; called straight from the click, as the browser asks for permission there. */
  readonly onResume: () => void
  /** Forget the remembered file. */
  readonly onForget: () => void
  /** Stop using the file in use. */
  readonly onStop: () => void
}

/** Where the controls sit: over the corner of the picture, or at the foot of a card. */
export type LocalFileVariant = 'picture' | 'card'

/** The class of one control in a place. */
function buttonClass(variant: LocalFileVariant): string {
  return variant === 'picture' ? 'dsh-lingualab-picture-local-btn' : 'dsh-lingualab-btn is-small'
}

interface PickProps {
  readonly t: Translate
  readonly local: LocalFileProps
  readonly variant: LocalFileVariant
}

/** 「用本地文件播放」: the picker button, or the label around the file input. */
function PickControl({ t, local, variant }: PickProps) {
  const hint = t('localFileHint')
  if (local.canPick) {
    return (
      <button type="button" className={buttonClass(variant)} title={hint} onClick={local.onPick}>
        {t('localFileUse')}
      </button>
    )
  }
  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    // The label goes away once a file is playing, and with the focus on its input the document would get it.
    returnFocusToPage(event.target)
    // Clearing the value lets the same file be chosen again.
    event.target.value = ''
    if (file !== undefined) local.onFile(file)
  }
  return (
    <label className={`${buttonClass(variant)} is-file`} title={hint}>
      {t('localFileUse')}
      <input
        type="file"
        accept="video/*,.mkv"
        onChange={onChange}
        className="dsh-lingualab-visually-hidden"
        data-testid="lingualab-local-input"
      />
    </label>
  )
}

export interface LocalFileActionsProps extends PickProps {
  /** Whether the line about which formats work is written out (on a card); on the picture it is the tooltip. */
  readonly withHint: boolean
}

/**
 * What can be done while no local file plays: go on with the remembered one (and forget it), or choose one.
 * @param props - the translator, the local file's state and callbacks, where it sits, and whether to write out the hint.
 */
export function LocalFileActions({ t, local, variant, withHint }: LocalFileActionsProps) {
  return (
    <div className={`dsh-lingualab-localactions is-${variant}`}>
      <div className="dsh-lingualab-localactions-row">
        {local.remembered === null ? null : (
          <>
            <button
              type="button"
              className={`${buttonClass(variant)} is-name`}
              title={local.remembered}
              onClick={(event) => {
                // The button is replaced by the badge once the file plays, so the page takes the focus first.
                returnFocusToPage(event.currentTarget)
                local.onResume()
              }}
            >
              {t('localFileResume', { name: local.remembered })}
            </button>
            <button type="button" className={buttonClass(variant)} onClick={local.onForget}>
              {t('localFileForget')}
            </button>
          </>
        )}
        <PickControl t={t} local={local} variant={variant} />
      </div>
      {withHint ? <div className="dsh-lingualab-videocard-note">{t('localFileHint')}</div> : null}
    </div>
  )
}

export interface LocalFileBadgeProps {
  readonly t: Translate
  /** The file's name; the tooltip of the label. */
  readonly name: string
  readonly variant: LocalFileVariant
  readonly onStop: () => void
}

/**
 * The label that says a local file plays, with the way to stop using it.
 * @param props - the translator, the file's name, where it sits, and what stopping does.
 */
export function LocalFileBadge({ t, name, variant, onStop }: LocalFileBadgeProps) {
  return (
    <div className={`dsh-lingualab-localbadge is-${variant}`}>
      <span className="dsh-lingualab-localbadge-label" title={name}>
        {t('localFileBadge')}
      </span>
      <button
        type="button"
        className={buttonClass(variant)}
        onClick={(event) => {
          // The badge is replaced by the choice it came from, so the page takes the focus first.
          returnFocusToPage(event.currentTarget)
          onStop()
        }}
      >
        {t('localFileStop')}
      </button>
    </div>
  )
}
