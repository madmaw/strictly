import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

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
})
export default x
