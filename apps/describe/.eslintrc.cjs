/* eslint-env node */
/** @type {import('@types/eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['../../.eslintrc.cjs'],
  parserOptions: {
    project: [
      'tsconfig.json',
      'tsconfig.build.json',
    ],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: '2015',
  },
  overrides: [
    {
      // Define the configuration for `.astro` file.
      files: ['*.astro'],
      extends: ['plugin:astro/recommended'],
    },
    {
      files: ['*.mdx'],
      extends: ['plugin:mdx/recommended'],
      settings: {
        // causes problems if true, but we probably want it to be true
        'mdx/code-blocks': false,
      },
    },
  ],
  rules: {
    'no-relative-import-paths/no-relative-import-paths': [
      'warn',
      {
        allowSameFolder: true,
        rootDir: './src',
      },
    ],
    'import/no-extraneous-dependencies': [
      'warn',
      {
        packageDir: [
          '.',
          '../..',
        ],
      },
    ],
  },
}
