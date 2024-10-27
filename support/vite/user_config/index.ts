import { createTsconfigPathsPlugin } from '@de/support-vite/plugins/tsconfig_paths'
import { type TsconfigJson } from '@de/support-vite/types'
import { defineConfig } from 'vite'

export function createViteUserConfig(tsconfig: TsconfigJson) {
  return defineConfig({
    plugins: [createTsconfigPathsPlugin(tsconfig)],
  })
}
