import { type TsconfigJson } from 'types'
import { type ViteUserConfig } from 'vitest/config'
// special case: loaded by vite config bundling, which does not resolve tsconfig baseUrl imports
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createTsconfigPathsPlugin } from '../plugins/tsconfigPaths'

export function createVitestUserConfig(tsconfigJson: TsconfigJson): ViteUserConfig {
  return {
    plugins: [createTsconfigPathsPlugin(tsconfigJson)],
    test: {
      include: ['**/specs/(*.)+(tests).[jt]s?(x)'],
      exclude: [
        '.out',
        'dist',
        // workspace packages are symlinked into node_modules and must not be scanned for tests
        '**/node_modules/**',
      ],
      globals: true,
    },
  }
}
