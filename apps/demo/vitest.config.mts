import { createReactViteConfig } from '@strictly/vite/config'

export default createReactViteConfig({
  base: '',
  lingui: true,
  storybook: true,
  unitTest: {
    test: {
      environment: 'jsdom',
    },
  },
})
