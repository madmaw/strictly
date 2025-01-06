// special case
// eslint-disable-next-line no-restricted-imports
import { createTsconfigPathsPlugin } from '@strictly/support-vite/plugins/tsconfig_paths'
// special case
// eslint-disable-next-line no-restricted-imports
import { type TsconfigJson } from '@strictly/support-vite/types'
import { defineConfig } from 'vite'

export function createViteUserConfig(tsconfig: TsconfigJson) {
  return defineConfig({
    plugins: [createTsconfigPathsPlugin(tsconfig)],
  })
}
