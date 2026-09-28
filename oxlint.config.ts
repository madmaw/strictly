import { createOxlintConfig } from '@strictly/oxlint'
import buildProject from './tsconfig.build.json' with { type: 'json' }

export default createOxlintConfig({
  // the workspace root contains no source files, just configuration
  otherProjects: [buildProject],
  rootDir: import.meta.dirname,
})
