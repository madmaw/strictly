import reactSupport from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import tsconfig from '../tsconfig.json'
// unfortunately, unlike vitest, vite cannot import this in its configuration
// const config: UserConfig = createViteUserConfig(tsconfig)
// export default config
export default defineConfig({
  plugins: [
    reactSupport({
      babel: {
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            {
              version: '2023-05',
            },
          ],
          ['@babel/plugin-transform-class-static-block'],
          ['@babel/plugin-proposal-class-properties'],
        ],
        assumptions: {
          setPublicClassFields: false,
        },
      },
    }),
    tsconfigPaths({
      // must specify projects otherwise we get configuration errors for unrelated projects
      projects: [
        '.',
        ...tsconfig.references.map(function ({ path }) {
          return path
        }),
      ],
    }),
  ],
})
