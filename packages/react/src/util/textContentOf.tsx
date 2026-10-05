import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'

/**
 * Extracts the textual content of a `ReactNode`, useful for finding elements by the text of a label component
 */
export function textContentOf(children: ReactNode): string {
  const escapedString = renderToString(
    // oxlint-disable-next-line strictly/restricted-syntax -- rendering JSX to a string is the point of this helper
    <I18nProvider i18n={i18n}>{children}</I18nProvider>,
  )
  // unescape
  const parser = new DOMParser()
  const doc = parser.parseFromString(escapedString, 'text/html')
  return doc.body.textContent
}
