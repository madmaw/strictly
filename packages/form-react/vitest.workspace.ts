import { createVitestUserConfig } from '@de/support-vite'
import {
  defineWorkspace,
} from 'vitest/config'

import tsconfig from './tsconfig.json'

const config = createVitestUserConfig(tsconfig)
export default defineWorkspace([
  '.',
  {
    ...config,
    test: {
      ...(config.test || {}),
      environment: 'jsdom',
    },
  },
] as const)
