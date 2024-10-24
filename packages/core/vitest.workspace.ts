import { createViteUserConfig } from '@tscriptors/support-vitest/vitest.workspace'
import {
  defineWorkspace,
} from 'vitest/config'

import tsconfig from './tsconfig.json'

export default defineWorkspace([
  '.',
  createViteUserConfig(tsconfig),
] as const)
