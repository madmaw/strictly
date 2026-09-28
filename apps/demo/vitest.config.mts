import { createReactViteConfig } from '@strictly/vite/config'

export default createReactViteConfig({
  base: '',
  lingui: true,
  root: import.meta.dirname,
  storybook: true,
  unitTest: {
    test: {
      environment: 'jsdom',
    },
  },
})
