import tsconfigPaths from 'vite-tsconfig-paths'
import {
  defineWorkspace,
  type ViteUserConfig,
} from 'vitest/config'

import tsconfig from './tsconfig.json'

export function createViteUserConfig({
  references,
}: {
  references: readonly { path: string }[],
}): ViteUserConfig {
  return {
    plugins: [
      tsconfigPaths({
        // must specify projects otherwise we get configuration errors for unrelated projects
        projects: [
          '.',
          ...references.map(function ({ path }) {
            return path
          }),
        ],
      }),
    ],
    test: {
      include: ['**/specs/(*.)+(tests).[jt]s?(x)'],
      exclude: ['.out'],
      globals: true,
    },
  }
}

// example only
export default defineWorkspace([
  '.',
  createViteUserConfig(tsconfig),
])
