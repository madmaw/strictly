import { defineConfig } from '@lingui/cli'

const config = defineConfig({
  locales: [
    'en',
    'pseudo_en',
  ],
  pseudoLocale: 'pseudo_en',
  sourceLocale: 'en',
  fallbackLocales: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pseudo_en: 'en',
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}',
      // NOTE we intentionally only include "features" in the localization
      // because your generic components should not contain text (should be supplied
      // as a prop by the calling feature in the instances where you need to display text
      // in a generic/shared component)
      include: ['<rootDir>/src/features/'],
    },
  ],
})

export default config
