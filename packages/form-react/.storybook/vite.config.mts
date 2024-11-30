import reactSupport from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import tsconfig from '../tsconfig.json'
// unfortunately, unlike vitest, vite cannot import this in its configuration
// const config: UserConfig = createViteUserConfig(tsconfig)
// export default config
export default defineConfig({
  plugins: [
    reactSupport({
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
