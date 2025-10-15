import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { type Preview } from '@storybook/react'
import { configure } from 'mobx'
import { StrictMode } from 'react'

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
  decorators: [
    function (Story: React.ComponentType) {
      return (
        <MantineProvider>
          <StrictMode>
            <Story />
          </StrictMode>
        </MantineProvider>
      )
    },
  ],
}

export default preview
