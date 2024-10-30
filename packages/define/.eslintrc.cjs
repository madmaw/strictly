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
    // the no-unsafe rules are not particularly compatible with the type definitions
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
  },
}
