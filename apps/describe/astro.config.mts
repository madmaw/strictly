import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'

// https://astro.build/config
const x: ReturnType<typeof defineConfig<['en']>> = defineConfig({
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  integrations: [
    mdx({}),
    react({
      experimentalReactChildren: true,
    }),
  ],
})
export default x
