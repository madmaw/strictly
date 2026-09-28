import { createReactViteConfig } from '@strictly/vite'
import tsconfig from './tsconfig.json'

export default createReactViteConfig(tsconfig, {
  base: '',
  lingui: true,
})
