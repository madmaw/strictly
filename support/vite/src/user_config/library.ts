import { copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import { type TsconfigJson } from 'types'
import {
  defineConfig,
  type PluginOption,
} from 'vite'
import dts from 'vite-plugin-dts'
// special case: loaded by vite config bundling, which does not resolve tsconfig baseUrl imports
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createTsconfigPathsPlugin } from '../plugins/tsconfigPaths'

export type LibraryPackageJson = {
  readonly dependencies?: Readonly<Record<string, string>>,
  readonly peerDependencies?: Readonly<Record<string, string>>,
}

const OUT_DIR = 'dist'

/**
 * Bundles a publishable package from `src/index.ts` into ESM and CJS outputs with rolled up type declarations.
 * Anything listed in dependencies or peerDependencies is left external.
 */
export function createViteLibraryConfig(
  tsconfig: TsconfigJson,
  packageJson: LibraryPackageJson,
  plugins: readonly PluginOption[] = [],
) {
  const externals = Object.keys({
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  })
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
      outDir: OUT_DIR,
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
          await copyFile(join(OUT_DIR, 'index.d.ts'), join(OUT_DIR, 'index.d.cts'))
        },
        include: ['src'],
        rollupTypes: true,
      }),
    ],
  })
}
