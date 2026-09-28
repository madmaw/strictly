import { createReactViteConfig } from '@strictly/vite'
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import tsconfig from '../tsconfig.json'

export default createReactViteConfig(tsconfig)
