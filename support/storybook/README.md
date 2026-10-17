# @strictly/storybook

Storybook configuration for React packages built with Mantine, MobX and Lingui, along with the type narrowing assertions from `@strictly/vitest`, backed by `storybook/test`.

```ts
// .storybook/main.ts
import { createStorybookMainConfig } from '@strictly/storybook/main'
import { createRequire } from 'node:module'

export default createStorybookMainConfig(createRequire(import.meta.url))
```

```tsx
// .storybook/preview.tsx
import { createStorybookPreview } from '@strictly/storybook'

// storybook statically parses this call, so always pass an object literal
export default createStorybookPreview({})
```

Every story renders inside a `MantineProvider` and `StrictMode`, with MobX's strict warnings turned on. `StorybookLinguiProvider` loads and activates a locale's messages for a decorator to wrap stories in.
