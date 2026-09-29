import { createWorkspaceOxlintConfig } from '@strictly/oxlint'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite-plus'
import rootBuildProject from './tsconfig.build.json' with { type: 'json' }

const rootDir = import.meta.dirname

function readProject(file: string) {
  if (!existsSync(file)) {
    return
  }
  return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
}

// every workspace package with a tsconfig gets its own lint overrides, as vite plus ignores nested lint configs
const packages = ['apps', 'packages', 'support']
  .flatMap((group) =>
    readdirSync(join(rootDir, group), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `${group}/${entry.name}`),
  )
  .filter((dir) => existsSync(join(rootDir, dir, 'tsconfig.json')))
  .map((dir) => ({
    dir,
    mainProject: readProject(join(rootDir, dir, 'tsconfig.json')),
    otherProjects: [
      readProject(join(rootDir, dir, 'tsconfig.build.json')),
    ].filter((project) => project != null),
  }))

const lint = createWorkspaceOxlintConfig({
  packages,
  rootDir,
  rootProjects: [rootBuildProject],
})

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
