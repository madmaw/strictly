import { LOCALE_EN, LOCALE_PSEUDO_EN } from '@strictly/lingui'
import { type MetaArgsOf, StorybookLinguiProvider } from '@strictly/spec'
import { createStorybookPreview } from '@strictly/storybook/preview'
// special case: .storybook is outside the tsconfig include, so baseUrl imports do not resolve here
import * as React from 'react'
import { messages as en } from '../src/locales/en.po'
import { messages as pseudo_en } from '../src/locales/pseudo_en.po'

const testMessages = {
  [LOCALE_EN]: en,
  [LOCALE_PSEUDO_EN]: pseudo_en,
}

const labelsToLocales = {
  English: LOCALE_EN,
  Pseudo: LOCALE_PSEUDO_EN,
} as const

const localeLabels = Object.keys(labelsToLocales)

export const testArgTypes = {
  locale: {
    options: localeLabels,
    mapping: labelsToLocales,
    control: {
      type: 'select',
    },
  },
} as const

export const testArgs: MetaArgsOf<typeof testArgTypes> = {
  locale: 'English',
}

export default createStorybookPreview({
  argTypes: testArgTypes,
  args: testArgs,
  decorators: [
    function (Story: React.ComponentType, { args }) {
      return (
        <StorybookLinguiProvider
          labelsToLocales={labelsToLocales}
          locale={args.locale}
          localeMessages={testMessages}
        >
          <Story />
        </StorybookLinguiProvider>
      )
    },
  ],
})
