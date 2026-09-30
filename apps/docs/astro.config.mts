import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import { createDecoratorPlugin } from '@strictly/vite/config'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

const { PUBLIC_BASE, PUBLIC_SITE } = loadEnv(
  // oxlint-disable-next-line typescript/no-non-null-assertion -- astro always sets the mode
  process.env.NODE_ENV!,
  process.cwd(),
  '',
)
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
    // base's validators use decorators (e.g. the `bound` method decorator); transform them so the
    // prerender build can load the @strictly/base barrel imported by the README route
    plugins: [createDecoratorPlugin()],
    resolve: {
      tsconfigPaths: true,
    },
  },
})
export default x
