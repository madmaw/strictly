import { createReactViteConfig } from '@strictly/vite/config'

export default createReactViteConfig({
  root: import.meta.dirname,
  storybook: true,
  unitTest: {
    test: {
      environment: 'jsdom',
    },
  },
})
