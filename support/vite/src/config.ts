// This file must only have bare package imports. Storybook loads vite configurations without the runner config
// loader, so this package gets handed to node directly rather than bundled, and node cannot resolve extensionless
// relative imports.
import { lingui } from '@lingui/vite-plugin'
// oxlint-disable-next-line no-restricted-imports -- this package configures the storybook test runner
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import reactSupport from '@vitejs/plugin-react'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { copyFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { type PluginOption } from 'vite'
import dts from 'vite-plugin-dts'
import tsconfigPaths from 'vite-tsconfig-paths'
import {
  defineConfig,
  type TestProjectInlineConfiguration,
  type ViteUserConfig,
} from 'vitest/config'

export type TsconfigJson = {
  readonly references: readonly { path: string }[]
}

export type LibraryPackageJson = {
  readonly dependencies?: Readonly<Record<string, string>>
  readonly peerDependencies?: Readonly<Record<string, string>>
}

type TestProjectConfig = NonNullable<TestProjectInlineConfiguration['test']>

/**
 * `true` creates a single `<kind>/test` project, otherwise each key becomes a `<kind>/<key>` project with the
 * given overrides
 */
export type TestParameters =
  | Readonly<Record<string, Omit<Partial<TestProjectConfig>, 'name'>>>
  | boolean

const DIST = 'dist'
// babel resolves plugin names relative to the package being built, where these are not installed
const require = createRequire(import.meta.url)

export function createTsconfigPathsPlugin({ references }: TsconfigJson) {
  return tsconfigPaths({
    // must specify projects otherwise we get configuration errors for unrelated projects
    projects: ['.', ...references.map(({ path }) => path)],
  })
}

/**
 * React via babel so that mobx decorators and class fields are transformed consistently everywhere
 */
export function createReactPlugin({
  lingui: withLingui = false,
}: {
  readonly lingui?: boolean
} = {}) {
  return reactSupport({
    babel: {
      plugins: [
        [
          require.resolve('@babel/plugin-proposal-decorators'),
          {
            version: '2023-05',
          },
        ],
        [require.resolve('@babel/plugin-transform-class-static-block')],
        [require.resolve('@babel/plugin-proposal-class-properties')],
        ...(withLingui
          ? [[require.resolve('@lingui/babel-plugin-lingui-macro')]]
          : []),
      ],
      assumptions: {
        setPublicClassFields: false,
      },
    },
  })
}

/**
 * Configuration for react applications, storybooks and their tests. Storybook should point at the vitest
 * configuration created by this so the stories and the tests share one vite configuration.
 */
export function createReactViteConfig(
  tsconfig: TsconfigJson,
  {
    base,
    lingui: withLingui = false,
    unitTest = false,
    storybook = false,
  }: {
    readonly base?: string
    readonly lingui?: boolean
    readonly unitTest?: TestParameters
    readonly storybook?: TestParameters
  } = {},
) {
  return defineConfig({
    base,
    plugins: [
      createReactPlugin({ lingui: withLingui }),
      ...(withLingui ? [lingui()] : []),
      createTsconfigPathsPlugin(tsconfig),
    ],
    test: createTestConfig({
      unitTest,
      storybook,
    }),
  })
}

/**
 * Bundles a publishable package from `src/index.ts` into ESM and CJS outputs with rolled up type declarations.
 * Anything listed in dependencies or peerDependencies is left external.
 */
export function createViteLibraryConfig(
  tsconfig: TsconfigJson,
  packageJson: LibraryPackageJson,
  {
    react = false,
  }: {
    readonly react?: boolean
  } = {},
) {
  const externals = Object.keys({
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  })
  const plugins: PluginOption[] = react ? [createReactPlugin()] : []
  return defineConfig({
    build: {
      lib: {
        entry: 'src/index.ts',
        fileName: 'index',
        formats: ['es', 'cjs'],
      },
      minify: false,
      outDir: DIST,
      rollupOptions: {
        external(id) {
          return externals.some(
            (external) => id === external || id.startsWith(`${external}/`),
          )
        },
      },
    },
    plugins: [
      ...plugins,
      createTsconfigPathsPlugin(tsconfig),
      dts({
        async afterBuild() {
          // the CJS entry point needs its own declaration file
          await copyFile(join(DIST, 'index.d.ts'), join(DIST, 'index.d.cts'))
        },
        include: ['src'],
        // api extractor looks for lib.*.d.ts in the project typescript folder, but typescript 6 no longer ships
        // them there, so let it fall back to the compiler it bundles
        rollupOptions: {
          // oxlint-disable-next-line no-undefined -- undefined disables the folder lookup
          typescriptCompilerFolder: undefined,
        },
        rollupTypes: true,
      }),
    ],
  })
}

/**
 * Test only configuration for packages without a react entry point
 */
export function createVitestConfig(
  tsconfig: TsconfigJson,
  {
    unitTest = true,
  }: {
    readonly unitTest?: TestParameters
  } = {},
) {
  return defineConfig({
    plugins: [createTsconfigPathsPlugin(tsconfig)],
    test: createTestConfig({
      unitTest,
      storybook: false,
    }),
  })
}

function createTestConfig({
  unitTest,
  storybook,
}: {
  readonly unitTest: TestParameters
  readonly storybook: TestParameters
}): ViteUserConfig['test'] {
  if (unitTest === false && storybook === false) {
    // oxlint-disable-next-line no-undefined -- undefined disables vitest
    return undefined
  }
  return {
    exclude: EXCLUDE,
    passWithNoTests: true,
    projects: [
      ...computeUnitTests(unitTest),
      ...computeTests(createStorybookConfigurationBase, storybook),
    ],
  }
}

const EXCLUDE = [
  '.out',
  'dist',
  // workspace packages are symlinked into node_modules and must not be scanned for tests or stories
  '**/node_modules/**',
]

// installs the shared test plugins, if the package has one
const INSTALL_FILE = './.vitest/install.ts'
// installs the storybook preview annotations so stories can be composed in tests
const INSTALL_STORYBOOK_FILE = './.vitest/installStorybook.ts'

// matches the file names selected by the unit test include pattern
// **/specs/(*.)+(tests).[jt]s?(x)
const UNIT_TEST_FILE_NAME = /\.tests\.[jt]sx?$/

// files (relative to the working directory) under the unit test include pattern that reference Storybook
function findStorybookTestFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return []
  }
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) {
      return findStorybookTestFiles(path)
    }
    if (
      UNIT_TEST_FILE_NAME.test(entry.name) &&
      readFileSync(path, 'utf8').includes('@storybook/react')
    ) {
      return [path]
    }
    return []
  })
}

// Unit tests that reference Storybook (e.g. via composeStories) need the Storybook project annotations installed,
// which is slow to import. Split them into a separate project so the remaining unit tests do not pay the Storybook
// setup cost.
function computeUnitTests(unitTest: TestParameters) {
  const projects = computeTests(createUnitTestConfigurationBase, unitTest)
  if (projects.length === 0 || !existsSync(INSTALL_STORYBOOK_FILE)) {
    return projects
  }
  const storybookTestFiles = findStorybookTestFiles('src')
  if (storybookTestFiles.length === 0) {
    return projects
  }
  return projects.flatMap((project) => [
    {
      ...project,
      test: {
        ...project.test,
        exclude: [...(project.test.exclude ?? EXCLUDE), ...storybookTestFiles],
      },
    },
    {
      ...project,
      test: {
        ...project.test,
        include: storybookTestFiles,
        name: `${project.test.name}/storybook`,
        setupFiles: [
          ...setupFilesOf(project.test.setupFiles),
          INSTALL_STORYBOOK_FILE,
        ],
      },
    },
  ])
}

function setupFilesOf(
  setupFiles: string | readonly string[] | undefined,
): readonly string[] {
  if (setupFiles == null) {
    return []
  }
  return typeof setupFiles === 'string' ? [setupFiles] : setupFiles
}

function computeTests(
  createBase: () => TestProjectInlineConfiguration,
  tests: TestParameters,
) {
  if (tests === false) {
    return []
  }
  const base = createBase()
  const prefix = base.test?.name
  // vitest also allows a labelled object as the name, but the bases only use strings
  const prefixes = typeof prefix === 'string' ? [prefix] : []
  const samples = tests === true ? { test: {} } : tests
  return Object.entries(samples).map(([name, projectConfig]) => ({
    ...base,
    test: {
      ...base.test,
      ...projectConfig,
      name: [...prefixes, name].join('/'),
    },
  }))
}

function createUnitTestConfigurationBase(): TestProjectInlineConfiguration {
  return {
    extends: true,
    test: {
      exclude: EXCLUDE,
      globals: true,
      include: ['**/specs/(*.)+(tests).[jt]s?(x)'],
      name: 'unit',
      setupFiles: existsSync(INSTALL_FILE) ? [INSTALL_FILE] : [],
    },
  }
}

// renders every story in a headless browser and runs its play function, so the stories double as tests. Must be
// created lazily as the storybook plugin loads the storybook configuration as soon as it is constructed
function createStorybookConfigurationBase(): TestProjectInlineConfiguration {
  return {
    extends: true,
    plugins: [storybookTest({})],
    test: {
      browser: {
        enabled: true,
        headless: true,
        instances: [{ browser: 'chromium' }],
        provider: 'playwright',
      },
      exclude: EXCLUDE,
      globals: true,
      name: 'storybook',
      setupFiles: [INSTALL_FILE, INSTALL_STORYBOOK_FILE],
      testTimeout: 30000,
    },
  }
}
