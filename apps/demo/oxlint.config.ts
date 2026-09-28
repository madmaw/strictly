import { createOxlintConfig } from '@strictly/oxlint'
import buildProject from './tsconfig.build.json' with { type: 'json' }
import mainProject from './tsconfig.json' with { type: 'json' }

export default createOxlintConfig({
  mainProject,
  otherProjects: [buildProject],
  rootDir: import.meta.dirname,
})
