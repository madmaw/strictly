import { createVitestUserConfig } from '@de/support-vite'
import {
  defineWorkspace,
} from 'vitest/config'

import tsconfig from './tsconfig.json'

export default defineWorkspace([
  '.',
  createVitestUserConfig(tsconfig),
] as const)
