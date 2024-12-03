import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { type Preview } from '@storybook/react'
import { StrictMode } from 'react'

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
