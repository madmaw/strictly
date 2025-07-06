import {
  defineConfig,
  type Options,
} from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['index.ts'],
  tsconfig: './tsconfig.build.json',
  clean: false,
  dts: true,
  format: [
    'cjs',
    'esm',
  ],
  ...options,
}))
