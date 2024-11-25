import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { type Preview } from '@storybook/react'

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
