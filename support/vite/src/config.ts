// This file must only have bare package imports. Storybook loads vite configurations without the runner config
// loader, so this package gets handed to node directly rather than bundled, and node cannot resolve extensionless
// relative imports.
import { type PluginItem } from '@babel/core'
import { getConfig as getLinguiConfig } from '@lingui/conf'
import { lingui } from '@lingui/vite-plugin'
import babel from '@rolldown/plugin-babel'
// oxlint-disable-next-line no-restricted-imports -- this package configures the storybook test runner
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import reactSupport from '@vitejs/plugin-react'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { type PluginOption } from 'vite'
import dts from 'vite-plugin-dts'
import {
  defineConfig,
  type TestProjectInlineConfiguration,
  type ViteUserConfig,
} from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

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
// resolves the bare `paths` imports of every package, including workspace packages, from their own tsconfig
const RESOLVE = {
  tsconfigPaths: true,
} as const
// babel resolves plugin names relative to the package being built, where these are not installed
const require = createRequire(import.meta.url)

/**
 * Transforms decorators and class fields via babel so they behave the same in every package, react or not, e.g.
 * mobx decorators and the `bound` method decorator. The rolldown babel plugin configures babel's typescript parser
 * automatically, so this runs on raw `.ts` sources too. Extra babel plugins (e.g. the lingui macro) run afterwards.
 */
export function createDecoratorPlugin(
  extraPlugins: readonly PluginItem[] = [],
): PluginOption {
  return babel({
    plugins: [
      [
        require.resolve('@babel/plugin-proposal-decorators'),
        {
          version: '2023-11',
        },
      ],
      require.resolve('@babel/plugin-transform-class-static-block'),
      require.resolve('@babel/plugin-transform-class-properties'),
      ...extraPlugins,
    ],
    assumptions: {
      setPublicClassFields: false,
    },
  })
}

/**
 * React via babel so that mobx decorators and class fields are transformed consistently everywhere. Vite 8 dropped
 * the babel option from the react plugin, so babel runs as its own rolldown plugin after the react transform
 */
export function createReactPlugin({
  lingui: withLingui = false,
  root,
}: {
  readonly lingui?: boolean
  readonly root: string
}): PluginOption[] {
  const linguiPlugins: PluginItem[] = withLingui
    ? [
        [
          require.resolve('@lingui/babel-plugin-lingui-macro'),
          // the macro plugin otherwise searches the working directory for the lingui config
          { linguiConfig: getLinguiConfig({ cwd: root }) },
        ],
      ]
    : []
  return [reactSupport(), createDecoratorPlugin(linguiPlugins)]
}

/**
 * Configuration for react applications, storybooks and their tests. Storybook should point at the vitest
 * configuration created by this so the stories and the tests share one vite configuration.
 *
 * The root is the package directory (`import.meta.dirname`) so the configuration also works when loaded from
 * another directory, e.g. by a workspace task runner, as lingui otherwise looks for its config in the working directory
 */
export function createReactViteConfig({
  base,
  lingui: withLingui = false,
  root,
  unitTest = false,
  storybook = false,
}: {
  readonly base?: string
  readonly lingui?: boolean
  readonly root: string
  readonly unitTest?: TestParameters
  readonly storybook?: TestParameters
}) {
  return defineConfig({
    base,
    plugins: [
      ...createReactPlugin({ lingui: withLingui, root }),
      ...(withLingui ? [lingui({ cwd: root })] : []),
    ],
    resolve: RESOLVE,
    root,
    test: createTestConfig({
      root,
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
  packageJson: LibraryPackageJson,
  {
    react = false,
    root,
  }: {
    readonly react?: boolean
    readonly root: string
  },
) {
  const externals = Object.keys({
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  })
  const plugins: PluginOption[] = react
    ? createReactPlugin({ root })
    : [createDecoratorPlugin()]
  return defineConfig({
    build: {
      lib: {
        entry: 'src/index.ts',
        fileName: 'index',
        formats: ['es', 'cjs'],
      },
      minify: false,
      outDir: DIST,
      rolldownOptions: {
        external(id) {
          return externals.some(
            (external) => id === external || id.startsWith(`${external}/`),
          )
        },
      },
    },
    plugins: [
      ...plugins,
      dts({
        bundleTypes: {
          // api extractor looks for lib.*.d.ts in the project typescript folder, but typescript 6 no longer ships
          // them there, so let it fall back to the compiler it bundles
          invokeOptions: {
            // oxlint-disable-next-line no-undefined -- undefined disables the folder lookup
            typescriptCompilerFolder: undefined,
          },
        },
        include: ['src'],
        // the CJS entry point needs its own declaration file
        outDirs: [DIST, { dir: DIST, moduleFormat: 'cjs' }],
      }),
    ],
    resolve: RESOLVE,
    root,
  })
}

/**
 * Test only configuration for packages without a react entry point
 */
export function createVitestConfig({
  root,
  unitTest = true,
}: {
  readonly root: string
  readonly unitTest?: TestParameters
}) {
  return defineConfig({
    plugins: [createDecoratorPlugin()],
    resolve: RESOLVE,
    root,
    test: createTestConfig({
      root,
      unitTest,
      storybook: false,
    }),
  })
}

function createTestConfig({
  root,
  unitTest,
  storybook,
}: {
  readonly root: string
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
      ...computeUnitTests(root, unitTest),
      ...computeTests(() => createStorybookConfigurationBase(root), storybook),
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
const INSTALL_FILE = '.vitest/install.ts'
// installs the storybook preview annotations so stories can be composed in tests
const INSTALL_STORYBOOK_FILE = '.vitest/installStorybook.ts'

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
function computeUnitTests(root: string, unitTest: TestParameters) {
  const projects = computeTests(
    () => createUnitTestConfigurationBase(root),
    unitTest,
  )
  const installStorybookFile = join(root, INSTALL_STORYBOOK_FILE)
  if (projects.length === 0 || !existsSync(installStorybookFile)) {
    return projects
  }
  const storybookTestFiles = findStorybookTestFiles(join(root, 'src'))
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
          installStorybookFile,
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

function createUnitTestConfigurationBase(
  root: string,
): TestProjectInlineConfiguration {
  const installFile = join(root, INSTALL_FILE)
  return {
    extends: true,
    test: {
      exclude: EXCLUDE,
      globals: true,
      include: ['**/specs/(*.)+(tests).[jt]s?(x)'],
      name: 'unit',
      setupFiles: existsSync(installFile) ? [installFile] : [],
    },
  }
}

// renders every story in a headless browser and runs its play function, so the stories double as tests. Must be
// created lazily as the storybook plugin loads the storybook configuration as soon as it is constructed
function createStorybookConfigurationBase(
  root: string,
): TestProjectInlineConfiguration {
  return {
    extends: true,
    plugins: [storybookTest({ configDir: join(root, '.storybook') })],
    test: {
      browser: {
        enabled: true,
        headless: true,
        instances: [{ browser: 'chromium' }],
        provider: playwright(),
      },
      exclude: EXCLUDE,
      globals: true,
      name: 'storybook',
      setupFiles: [
        join(root, INSTALL_FILE),
        join(root, INSTALL_STORYBOOK_FILE),
      ],
      testTimeout: 30000,
    },
  }
}
