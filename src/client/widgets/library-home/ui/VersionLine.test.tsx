// @vitest-environment node
/**
 * What the version line draws in each state, rendered to static markup: the build always, the status
 * next to it, and a retry only when the check could not answer.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { UpdateStatus } from '../../../features/update/index.ts'
import { VersionLine, type VersionLineProps } from './VersionLine.tsx'

const renderToStaticMarkup = render as (element: ReactElement) => string

/** A translator that shows the key and its parameters, so the markup says which string was asked for. */
const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined
    ? key
    : `${key}[${Object.entries(params)
        .map(([name, value]) => `${name}=${String(value)}`)
        .join(';')}]`

function markup(patch: Partial<VersionLineProps> = {}): string {
  return renderToStaticMarkup(
    <VersionLine t={t} label="v0.17.0 · 8609774" status={{ kind: 'latest' }} onRetry={() => undefined} {...patch} />,
  )
}

const statuses: readonly [UpdateStatus, string][] = [
  [{ kind: 'checking' }, 'updateChecking'],
  [{ kind: 'latest' }, 'updateLatest'],
  [{ kind: 'same-version' }, 'updateSameVersion'],
  [{ kind: 'available', version: '0.18.0' }, 'updateAvailable[version=0.18.0]'],
  [{ kind: 'ahead', version: '0.17.0' }, 'updateAhead[version=0.17.0]'],
  [{ kind: 'unknown' }, 'updateUnknown'],
]

describe('VersionLine', () => {
  it.each(statuses)('says %o next to the build', (status, text) => {
    const html = markup({ status })
    expect(html).toContain('v0.17.0 · 8609774')
    expect(html).toContain(text)
  })

  it('offers a retry only when the check could not answer', () => {
    expect(markup({ status: { kind: 'unknown' } })).toContain('retry')
    expect(markup({ status: { kind: 'latest' } })).not.toContain('retry')
  })

  it('still shows the status when the host did not give a version', () => {
    const html = markup({ label: '', status: { kind: 'unknown' } })
    expect(html).toContain('updateUnknown')
    expect(html).not.toContain('dsh-lingualab-build')
  })
})
