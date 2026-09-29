import { createOxlintConfig } from '@strictly/oxlint'
import { defineConfig } from 'vite-plus'

const lint = createOxlintConfig()

export default defineConfig({
  lint: {
    ...lint,
    jsPlugins: [
      ...(lint.jsPlugins ?? []),
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
    ],
    options: {
      ...lint.options,
      typeAware: true,
      // tsc -b already type checks every package
      typeCheck: false,
    },
    rules: {
      ...lint.rules,
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
  },
  fmt: {
    ignorePatterns: [
      '**/.astro/**',
      '**/.out/**',
      '**/dist/**',
      '**/locales/**',
      '**/storybook-static/**',
      'pnpm-lock.yaml',
    ],
    jsxSingleQuote: true,
    printWidth: 80,
    semi: false,
    singleAttributePerLine: true,
    singleQuote: true,
    sortImports: {
      groups: [
        ['builtin', 'external', 'internal', 'subpath', 'unknown'],
        ['parent', 'sibling', 'index'],
      ],
      newlinesBetween: false,
    },
    sortPackageJson: false,
    trailingComma: 'all',
  },
})
