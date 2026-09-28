import { createReactViteConfig } from '@strictly/vite/config'

export default createReactViteConfig({
  storybook: true,
  unitTest: {
    test: {
      environment: 'jsdom',
    },
  },
})
