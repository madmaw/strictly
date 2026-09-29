import { createStorybookMainConfig } from '@strictly/storybook/main'
import { createRequire } from 'node:module'

export default createStorybookMainConfig(createRequire(import.meta.url))
