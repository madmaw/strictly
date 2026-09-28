import { createLinguiConfig } from '@strictly/lingui/config'

const config = createLinguiConfig({
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
