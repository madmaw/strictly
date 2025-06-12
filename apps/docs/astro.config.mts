import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tsconfig from './tsconfig.json'

const {
  PUBLIC_BASE,
  PUBLIC_SITE,
} = loadEnv(process.env.NODE_ENV!, process.cwd(), '')
// https://astro.build/config
const x: ReturnType<typeof defineConfig<['en']>> = defineConfig({
  site: PUBLIC_SITE,
  base: PUBLIC_BASE,
  trailingSlash: 'ignore',
  redirects: {
    '/': `/${PUBLIC_BASE}/home`,
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  integrations: [
    react({
      experimentalReactChildren: true,
    }),
    mdx({}),
  ],
  build: {
    format: 'preserve',
  },
  vite: {
    plugins: [
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
  },
})
export default x
