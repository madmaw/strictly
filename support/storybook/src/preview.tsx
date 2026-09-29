import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
// oxlint-disable-next-line no-restricted-imports -- this package exists to configure storybook
import { type Decorator, type Preview } from '@storybook/react-vite'
import { configure } from 'mobx'
import { type ComponentType, StrictMode } from 'react'

/**
 * Creates the storybook preview configuration for a package. Every story renders inside mantine and strict mode.
 * Storybook applies decorators innermost first, so the supplied decorators run inside the shared providers.
 *
 * Storybook statically parses the preview file and only understands a default export that is a call whose first
 * argument is an object literal, so callers must always pass one, even if it is empty
 */
export function createStorybookPreview({
  args,
  argTypes,
  decorators = [],
}: Pick<Preview, 'args' | 'argTypes'> & {
  readonly decorators?: readonly Decorator[]
}): Preview {
  // turn on all useful mobx warnings in storybook to try to catch bad behavior
  configure({
    enforceActions: 'observed',
    observableRequiresReaction: true,
    reactionRequiresObservable: true,
  })

  return {
    parameters: {
      controls: {
        matchers: {
          color: /(background|color)$/i,
          date: /Date$/i,
        },
      },
    },
    argTypes,
    args,
    decorators: [
      ...decorators,
      function (Story: ComponentType) {
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
}
