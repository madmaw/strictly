import { createTsconfigPathsPlugin } from 'plugins/tsconfig_paths'
import { type TsconfigJson } from 'types'
import { type ViteUserConfig } from 'vitest/config'

export function createVitestUserConfig(tsconfigJson: TsconfigJson): ViteUserConfig {
  return {
    plugins: [createTsconfigPathsPlugin(tsconfigJson)],
    test: {
      include: ['**/specs/(*.)+(tests).[jt]s?(x)'],
      exclude: ['.out'],
      globals: true,
    },
  }
}
