// This file must only have bare package imports. Storybook loads main.ts with its own loader rather than the vite
// runner, so node cannot resolve extensionless relative imports here.
// oxlint-disable-next-line no-restricted-imports -- this package exists to configure storybook
import { type StorybookConfig } from '@storybook/react-vite'
import { dirname, join } from 'node:path'

// path segments removed from auto-generated titles so they do not become groups in the sidebar
const HIDDEN_TITLE_SEGMENTS = ['specs']

const hiddenSegmentPattern = new RegExp(
  `/(?:${HIDDEN_TITLE_SEGMENTS.join('|')})(?=/|$)`,
  'g',
)

/**
 * Creates the storybook main configuration for a package. The caller must pass its own `require` so packages resolve
 * relative to the calling package rather than this one
 */
export function createStorybookMainConfig(
  require: NodeJS.Require,
  {
    stories = ['../**/*.stories.@(ts|tsx)'],
    viteConfigPath = './vitest.config.mts',
  }: {
    // relative to the caller's .storybook folder
    readonly stories?: string[]
    // relative to the caller's package root
    readonly viteConfigPath?: string
  } = {},
): StorybookConfig {
  /**
   * This function is used to resolve the absolute path of a package.
   * It is needed in projects that use Yarn PnP or are set up within a monorepo.
   */
  function getAbsolutePath(value: string) {
    return dirname(require.resolve(join(value, 'package.json')))
  }

  return {
    stories,
    experimental_indexers: (existing) =>
      (existing ?? []).map((indexer) => ({
        ...indexer,
        createIndex: async (fileName, options) => {
          const entries = await indexer.createIndex(fileName, options)
          return entries.map((entry) => ({
            ...entry,
            title: options
              .makeTitle(entry.title)
              .replace(hiddenSegmentPattern, ''),
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
          viteConfigPath,
        },
      },
    },
  }
}
