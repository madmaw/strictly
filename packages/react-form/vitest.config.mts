import { createReactViteConfig } from '@strictly/vite/config'
import tsconfig from './tsconfig.json'

export default createReactViteConfig(tsconfig, {
  storybook: true,
  unitTest: {
    test: {
      environment: 'jsdom',
    },
  },
})
