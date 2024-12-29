import { type TsconfigJson } from '@strictly/support-vite/types'
import tsconfigPaths from 'vite-tsconfig-paths'

export function createTsconfigPathsPlugin({
  references,
}: TsconfigJson) {
  return tsconfigPaths({
    // must specify projects otherwise we get configuration errors for unrelated projects
    projects: [
      '.',
      ...references.map(function ({ path }) {
        return path
      }),
    ],
  })
}
