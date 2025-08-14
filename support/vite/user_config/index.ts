// special case
// eslint-disable-next-line no-restricted-imports
import { createTsconfigPathsPlugin } from '@strictly/support-vite/plugins/tsconfigPaths'
import { type TsconfigJson } from 'types'
import { defineConfig } from 'vite'

export function createViteUserConfig(tsconfig: TsconfigJson) {
  return defineConfig({
    plugins: [createTsconfigPathsPlugin(tsconfig)],
  })
}
