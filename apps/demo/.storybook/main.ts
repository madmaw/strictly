/* eslint-env node */
import { type StorybookConfig } from '@storybook/react-vite'
import {
  dirname,
  join,
} from 'path'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
  stories: ['../**/*.stories.@(ts|tsx)'],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-interactions'),
  ],
  core: {
    builder: {
      name: getAbsolutePath('@storybook/builder-vite'),
      options: {
        viteConfigPath: './vite.config.mts',
      }
    },
  },
  framework: {
    // NOTE: the documentation says this should be @storybook/react-vite, which fails completely
    // https://storybook.js.org/docs/get-started/frameworks/react-vite
    name: getAbsolutePath('@storybook/react'),
    options: {
    },
  },
}
export default config
