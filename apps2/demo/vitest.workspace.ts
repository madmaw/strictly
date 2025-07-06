import { createVitestUserConfig } from '@strictly/support-vite'
import {
  defineWorkspace,
} from 'vitest/config'
import viteConfig from './vite.config.mts'

import tsconfig from './tsconfig.json'

const config = createVitestUserConfig(tsconfig)
export default defineWorkspace([
  '.',
  {
    ...config,
    ...viteConfig,
    test: {
      ...(config.test || {}),
      environment: 'jsdom',
      setupFiles: [
        './.vitest/installDeterministicRandom.ts',
        // install storybook setup for unit tests that import stories directly
        './.vitest/installStorybookPreview.ts',
        './.vitest/matchMedia.ts',
        './.vitest/resizeObserver.ts',
      ],
    },
  },
] as const)
