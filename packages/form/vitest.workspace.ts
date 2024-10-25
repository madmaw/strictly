import { createViteUserConfig } from '@tscriptors/support-vitest/vitest.workspace'
import {
  defineWorkspace,
} from 'vitest/config'

import tsconfig from './tsconfig.json'

const config = createViteUserConfig(tsconfig)
export default defineWorkspace([
  '.',
  {
    ...config,
    test: {
      ...config.test,
      environment: 'jsdom',
    },
  },
] as const)
