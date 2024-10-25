import { createTsconfigPathsPlugin } from 'plugins/tsconfig_paths'
import { type TsconfigJson } from 'types'
import { defineConfig } from 'vite'

export function createViteUserConfig(tsconfig: TsconfigJson) {
  return defineConfig({
    plugins: [createTsconfigPathsPlugin(tsconfig)],
  })
}
