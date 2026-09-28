import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { type Preview } from '@storybook/react-vite'
import { LOCALE_EN, LOCALE_PSEUDO_EN } from '@strictly/lingui'
import { type MetaArgsOf, StorybookLinguiProvider } from '@strictly/spec'
import { configure } from 'mobx'
import { StrictMode } from 'react'
// special case: .storybook is outside the tsconfig include, so baseUrl imports do not resolve here
import * as React from 'react'
import { messages as en } from '../src/locales/en'
import { messages as pseudo_en } from '../src/locales/pseudo_en'

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

// turn on all useful mobx warnings in storybook to try to catch bad behavior
configure({
  enforceActions: 'observed',
  observableRequiresReaction: true,
  reactionRequiresObservable: true,
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  argTypes: testArgTypes,
  args: testArgs,
  decorators: [
    function (Story: React.ComponentType, { args }) {
      return (
        <MantineProvider>
          <StorybookLinguiProvider labelsToLocales={labelsToLocales} locale={args.locale} localeMessages={testMessages}>
            <StrictMode>
              <Story />
            </StrictMode>
          </StorybookLinguiProvider>
        </MantineProvider>
      )
    },
  ],
}

export default preview
