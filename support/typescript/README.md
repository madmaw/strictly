# @strictly/typescript

Shared tsconfig bases for every workspace package, so packages extend by name rather than by relative path.

- `base.json` — compiler options for source projects (`tsconfig.json`). Set `outDir` in the consumer, as a relative `outDir` here would resolve against this package.
- `build.json` — `base.json` with emit and project references disabled, for the config-only projects (`tsconfig.build.json`) that type check vite, vitest and oxlint configs.
