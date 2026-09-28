import { defineConfig } from '@lingui/cli'
import { ALL_SUPPORTED_LOCALES, LOCALE_EN, LOCALE_PSEUDO_EN } from './src/locales'

export * from './src/locales'

export type LinguiConfig = Parameters<typeof defineConfig>[0]

// NOTE: do not move this file into "src" otherwise Storybook will attempt to execute "@lingui/cli" in the browser
export function createLinguiConfig(config: Partial<LinguiConfig> = {}): LinguiConfig {
  return defineConfig({
    locales: ALL_SUPPORTED_LOCALES,
    pseudoLocale: LOCALE_PSEUDO_EN,
    sourceLocale: LOCALE_EN,
    fallbackLocales: {
      [LOCALE_PSEUDO_EN]: LOCALE_EN,
    },
    ...config,
  })
}
