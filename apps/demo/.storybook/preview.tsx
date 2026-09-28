import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { type Preview } from '@storybook/react'
import {
  type MetaArgsOf,
  StorybookLinguiProvider,
} from '@strictly/spec'
import { configure } from 'mobx'
import { StrictMode } from 'react'
// special case: .storybook is outside the tsconfig include, so baseUrl imports do not resolve here
import { messages as en } from '../src/locales/en'
import { messages as pseudo_en } from '../src/locales/pseudo_en'
// eslint-disable-next-line no-restricted-imports
import * as React from 'react'

const testMessages = {
  en,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pseudo_en,
}

const labelsToLocales = {
  English: 'en',
  Pseudo: 'pseudo_en',
} as const

const localeLabels = [...Object.keys(labelsToLocales)]

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
          <StorybookLinguiProvider
            labelsToLocales={labelsToLocales}
            locale={args?.locale}
            localeMessages={testMessages}
          >
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
