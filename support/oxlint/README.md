# @strictly/oxlint

Shared [oxlint](https://oxc.rs/docs/guide/usage/linter) configuration for workspaces laid out like strictly: every package keeps its sources in `src`, with tests and stories in `specs` folders.

```sh
pnpm add -D @strictly/oxlint oxlint
```

`workspaceScope` is the npm scope of your workspace packages. Its `vitest` and `storybook` packages are treated as the test helpers, e.g. `@acme/vitest` and `@acme/storybook`.

```ts
// oxlint.config.ts
import { createOxlintConfig } from '@strictly/oxlint'

export default createOxlintConfig({ workspaceScope: '@acme' })
```

With [Vite+](https://viteplus.dev), spread it into `lint` and turn on type-aware linting:

```ts
// vite.config.ts
import { createOxlintConfig } from '@strictly/oxlint'
import { defineConfig } from 'vite-plus'

const lint = createOxlintConfig({ workspaceScope: '@acme' })

export default defineConfig({
  lint: {
    ...lint,
    options: {
      ...lint.options,
      typeAware: true,
    },
  },
})
```
