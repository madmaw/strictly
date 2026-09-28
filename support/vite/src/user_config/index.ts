import { type TsconfigJson } from 'types'
import { defineConfig } from 'vite'
// special case: loaded by vite config bundling, which does not resolve tsconfig baseUrl imports
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createTsconfigPathsPlugin } from '../plugins/tsconfigPaths'

export function createViteUserConfig(tsconfig: TsconfigJson) {
  return defineConfig({
    plugins: [createTsconfigPathsPlugin(tsconfig)],
  })
}
