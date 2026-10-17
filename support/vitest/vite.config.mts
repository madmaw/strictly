import { createViteLibraryConfig } from '@strictly/vite/config'
import packageJson from './package.json'

export default createViteLibraryConfig(packageJson, {
  root: import.meta.dirname,
})
