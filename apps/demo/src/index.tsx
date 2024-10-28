import '@mantine/core/styles.css'

import { checkExists } from '@de/fine/util/preconditions'
import {
  createTheme,
  MantineProvider,
} from '@mantine/core'
import { install } from 'features/form/pet/install'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

window.onload = function () {
  const elementId = 'root'
  const e = checkExists(
    document.getElementById(elementId),
    'unable to find element id {}',
    elementId,
  )
  const theme = createTheme({
    /** Put your mantine theme override here */
  })

  const App = install()
  createRoot(e).render(
    (
      <StrictMode>
        <MantineProvider theme={theme}>
          <App />
        </MantineProvider>
      </StrictMode>
    ),
  )
}
