import '@mantine/core/styles.css'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import {
  Box,
  createTheme,
  MantineProvider,
} from '@mantine/core'
import { assertExistsAndReturn } from '@strictly/base'
import { PetForm } from 'features/form/pet/mobx/PetForm'
import { type Pet } from 'features/form/pet/types'
import { messages as en } from 'locales/en'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

window.onload = function () {
  const elementId = 'root'
  const e = assertExistsAndReturn(
    document.getElementById(elementId),
    'unable to find element id {}',
    elementId,
  )
  const theme = createTheme({
    /** Put your mantine theme override here */
  })

  const value: Pet = {
    name: 'Delta',
    alive: true,
    tags: [
      'cute',
      'black',
      'nervous',
      'clever',
    ],
    species: {
      type: 'cat',
      meows: 1000,
    },
  }

  function onValueChange(value: Pet) {
    // eslint-disable-next-line no-console
    console.log(value)
  }

  i18n.load('en', en)
  i18n.activate('en')

  createRoot(e).render(
    (
      <StrictMode>
        <MantineProvider theme={theme}>
          <I18nProvider i18n={i18n}>
            <Box m='md'>
              <PetForm
                forceMutable={false}
                onValueChange={onValueChange}
                value={value}
              />
            </Box>
          </I18nProvider>
        </MantineProvider>
      </StrictMode>
    ),
  )
}
