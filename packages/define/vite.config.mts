import { createViteLibraryConfig } from '@strictly/vite'
import packageJson from './package.json'
import tsconfig from './tsconfig.json'

export default createViteLibraryConfig(tsconfig, packageJson)
