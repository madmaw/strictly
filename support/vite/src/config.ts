// This file must only have bare package imports. Storybook loads vite configurations without the runner config
// loader, so this package gets handed to node directly rather than bundled, and node cannot resolve extensionless
// relative imports.
import { lingui } from '@lingui/vite-plugin'
import reactSupport from '@vitejs/plugin-react'
import { copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  defineConfig,
  type PluginOption,
} from 'vite'
import dts from 'vite-plugin-dts'
import tsconfigPaths from 'vite-tsconfig-paths'
import { type ViteUserConfig } from 'vitest/config'

export type TsconfigJson = {
  readonly references: readonly { path: string }[],
}

export type LibraryPackageJson = {
  readonly dependencies?: Readonly<Record<string, string>>,
  readonly peerDependencies?: Readonly<Record<string, string>>,
}

const DIST = 'dist'

export function createTsconfigPathsPlugin({
  references,
}: TsconfigJson) {
  return tsconfigPaths({
    // must specify projects otherwise we get configuration errors for unrelated projects
    projects: [
      '.',
      ...references.map(function ({ path }) {
        return path
      }),
    ],
  })
}

/**
 * React via babel so that mobx decorators and class fields are transformed consistently everywhere
 */
export function createReactPlugin({
  lingui: withLingui = false,
}: {
  readonly lingui?: boolean,
} = {}) {
  return reactSupport({
    babel: {
      plugins: [
        [
          '@babel/plugin-proposal-decorators',
          {
            version: '2023-05',
          },
        ],
        ['@babel/plugin-transform-class-static-block'],
        ['@babel/plugin-proposal-class-properties'],
        ...(withLingui ? [['@lingui/babel-plugin-lingui-macro']] : []),
      ],
      assumptions: {
        setPublicClassFields: false,
      },
    },
  })
}

/**
 * Configuration for react applications and storybooks
 */
export function createReactViteConfig(tsconfig: TsconfigJson, {
  base,
  lingui: withLingui = false,
}: {
  readonly base?: string,
  readonly lingui?: boolean,
} = {}) {
  return defineConfig({
    base,
    plugins: [
      createReactPlugin({ lingui: withLingui }),
      ...(withLingui ? [lingui()] : []),
      createTsconfigPathsPlugin(tsconfig),
    ],
  })
}

/**
 * Bundles a publishable package from `src/index.ts` into ESM and CJS outputs with rolled up type declarations.
 * Anything listed in dependencies or peerDependencies is left external.
 */
export function createViteLibraryConfig(tsconfig: TsconfigJson, packageJson: LibraryPackageJson, {
  react = false,
}: {
  readonly react?: boolean,
} = {}) {
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
        formats: [
          'es',
          'cjs',
        ],
      },
      minify: false,
      outDir: DIST,
      rollupOptions: {
        external: function (id) {
          return externals.some(function (external) {
            return id === external || id.startsWith(`${external}/`)
          })
        },
      },
    },
    plugins: [
      ...plugins,
      createTsconfigPathsPlugin(tsconfig),
      dts({
        afterBuild: async function () {
          // the CJS entry point needs its own declaration file
          await copyFile(join(DIST, 'index.d.ts'), join(DIST, 'index.d.cts'))
        },
        include: ['src'],
        // api extractor looks for lib.*.d.ts in the project typescript folder, but typescript 6 no longer ships
        // them there, so let it fall back to the compiler it bundles
        rollupOptions: {
          typescriptCompilerFolder: undefined,
        },
        rollupTypes: true,
      }),
    ],
  })
}

export function createVitestUserConfig(tsconfig: TsconfigJson): ViteUserConfig {
  return {
    plugins: [createTsconfigPathsPlugin(tsconfig)],
    test: {
      include: ['**/specs/(*.)+(tests).[jt]s?(x)'],
      exclude: [
        '.out',
        'dist',
        // workspace packages are symlinked into node_modules and must not be scanned for tests
        '**/node_modules/**',
      ],
      globals: true,
    },
  }
}
