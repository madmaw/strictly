/* eslint-env node */
import { type StorybookConfig } from '@storybook/react-vite'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
  stories: ['../**/*.stories.@(ts|tsx)'],
  // strip the `specs` path segment from auto-generated titles so it does not appear in the sidebar
  experimental_indexers: (existing) =>
    (existing ?? []).map((indexer) => ({
      ...indexer,
      createIndex: async (fileName, options) => {
        const entries = await indexer.createIndex(fileName, options)
        return entries.map((entry) => ({
          ...entry,
          title: options.makeTitle(entry.title).replace(/\/specs(?=\/|$)/g, ''),
        }))
      },
    })),

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@chromatic-com/storybook'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      builder: {
        viteConfigPath: './vitest.config.mts',
      },
    },
  },
}
export default config
