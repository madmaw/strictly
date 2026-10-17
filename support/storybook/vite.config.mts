import { createViteLibraryConfig } from '@strictly/vite/config'
import packageJson from './package.json'

export default createViteLibraryConfig(packageJson, {
  entry: {
    index: 'src/index.ts',
    main: 'src/main.ts',
  },
  react: true,
  root: import.meta.dirname,
})
