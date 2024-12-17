import reactSupport from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import babel from './babel.config'
import tsconfig from './tsconfig.json'
// unfortunately, unlike vitest, vite cannot import this in its configuration
// const config: UserConfig = createViteUserConfig(tsconfig)
// export default config
export default defineConfig({
  build: {
    outDir: './dist',
  },
  plugins: [
    reactSupport({
      babel: babel,
    }),
    tsconfigPaths({
      // must specify projects otherwise we get configuration errors for unrelated projects
      // NOTE we should use the packages rather than rely on project references
      projects: [
        '.',
        ...tsconfig.references.map(function ({ path }) {
          return path
        }),
      ],
    }),
  ],
})
