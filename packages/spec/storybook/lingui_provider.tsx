import {
  i18n,
  type Messages,
} from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import {
  type PropsWithChildren,
  useEffect,
} from 'react'

// provider to use with tests, automatically installed by storybook
export function StorybookLinguiProvider<LocaleMessages extends Readonly<Record<string, Messages>>>({
  children,
  localeMessages,
  labelsToLocales,
  locale = 'en',
}: PropsWithChildren<{
  localeMessages: LocaleMessages,
  labelsToLocales: Readonly<Record<string, keyof LocaleMessages>>,
  locale?: keyof LocaleMessages,
}>) {
  useEffect(function () {
    const messages = localeMessages[locale]
      // sadly, because the storybook arg labels and values are mixed up, the implementation of
      // @storybook/react supplies the label, not the value as 'locale'. For this reason
      // we fall back to looking up the value by label when the supplied value doesn't exist
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      || localeMessages[labelsToLocales[locale as string]]

    if (locale != null && messages != null) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      i18n.load(locale as string, messages)
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      i18n.activate(locale as string)
    }
  }, [
    locale,
    labelsToLocales,
    localeMessages,
  ])

  return (
    <I18nProvider i18n={i18n}>
      {children}
    </I18nProvider>
  )
}
