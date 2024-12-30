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
        './.vitest/install_deterministic_random.ts',
        // install storybook setup for unit tests that import stories directly
        './.vitest/install_storybook_preview.ts',
        './.vitest/match_media.ts',
        './.vitest/resize_observer.ts',
      ],
    },
  },
] as const)
