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
  rules: {
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
