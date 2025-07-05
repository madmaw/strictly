// special case
// eslint-disable-next-line no-restricted-imports
import { type TsconfigJson } from '@strictly/support-vite/Types'
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
