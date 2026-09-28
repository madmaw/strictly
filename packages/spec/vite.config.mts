// vite cannot bundle workspace package imports in its configuration, so reach into the support package directly
import { createViteLibraryConfig } from '../../support/vite/src/user_config/library'
import packageJson from './package.json'
import tsconfig from './tsconfig.json'

export default createViteLibraryConfig(tsconfig, packageJson)
