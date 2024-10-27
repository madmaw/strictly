import { checkExists } from '@de/fine/util/preconditions'
import { install } from 'features/form/install'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

window.onload = function () {
  const elementId = 'root'
  const e = checkExists(
    document.getElementById(elementId),
    'unable to find element id {}',
    elementId,
  )
  const App = install()
  createRoot(e).render(
    (
      <StrictMode>
        <App />
      </StrictMode>
    ),
  )
}
