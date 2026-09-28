import { createViteLibraryConfig } from '@strictly/vite'
import reactSupport from '@vitejs/plugin-react'
import babel from './babel.config'
import packageJson from './package.json'
import tsconfig from './tsconfig.json'

export default createViteLibraryConfig(tsconfig, packageJson, [
  reactSupport({
    babel,
  }),
])
