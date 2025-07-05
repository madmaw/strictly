// special case
// eslint-disable-next-line no-restricted-imports
import { createTsconfigPathsPlugin } from '@strictly/support-vite/plugins/tsconfigPaths'
// special case
// eslint-disable-next-line no-restricted-imports
import { type TsconfigJson } from '@strictly/support-vite/Types'
import { type ViteUserConfig } from 'vitest/config'

export function createVitestUserConfig(tsconfigJson: TsconfigJson): ViteUserConfig {
  return {
    plugins: [createTsconfigPathsPlugin(tsconfigJson)],
    test: {
      include: ['**/specs/(*.)+(tests).[jt]s?(x)'],
      exclude: [
        '.out',
        'dist',
      ],
      globals: true,
    },
  }
}
