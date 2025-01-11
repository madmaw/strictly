/* eslint-env node */
/** @type {import('@types/eslint').Linter.Config} */
module.exports = {
  overrides: [
    // JSON
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
      extends: 'plugin:jsonc/recommended-with-json',
      rules: {
        'jsonc/array-bracket-newline': 'warn',
        'jsonc/array-bracket-spacing': 'warn',
        'jsonc/array-element-newline': 'warn',
        'jsonc/indent': [
          'warn',
          2,
        ],
        'jsonc/key-spacing': 'warn',
        'jsonc/object-curly-newline': 'warn',
        'jsonc/object-curly-spacing': 'warn',
        'jsonc/object-property-newline': 'warn',
        'jsonc/sort-array-values': [
          'warn',
          {
            // exclude JSON paths as required
            pathPattern: '^((?!\\.dependsOn).)*$',
            order: {
              type: 'asc',
              natural: true,
            },
            minValues: 2,
          },
        ],
        'jsonc/sort-keys': [
          'warn',
          {
            pathPattern: '.*',
            order: {
              type: 'asc',
              natural: true,
            },
            allowLineSeparatedGroups: true,
            minKeys: 2,
          },
        ],
      },
    },
    // YAML
    {
      files: [
        '*.yaml',
        '*.yml',
      ],
      parser: 'yaml-eslint-parser',
      extends: 'plugin:yml/standard',
      rules: {
        'no-multiple-empty-lines': [
          'warn',
          {
            max: 1,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            maxBOF: 0,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            maxEOF: 1,
          },
        ],
        'yml/quotes': [
          'warn',
          {
            prefer: 'single',
            avoidEscape: true,
          },
        ],
      },
    },

    // Typescript/Javascript
    {
      files: [
        '*.ts',
        '*.tsx',
        '*.js',
        '*.cjs',
        '*.mts',
      ],
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': [
            '.ts',
            '.tsx',
            '.mts',
          ],
        },
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
            project: 'tsconfig.json',
          },
        },
        react: {
          version: 'detect',
        },
      },
      plugins: [
        '@typescript-eslint',
        'css-modules',
        'dprint-integration2',
        'import-newlines',
        'import',
        'no-autofix',
        'no-only-tests',
        'no-relative-import-paths',
        'unused-imports',
      ],
      extends: [
        'eslint:recommended',
        'plugin:@eslint-community/eslint-comments/recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:css-modules/recommended',
        'plugin:dprint-integration2/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/typescript',
      ],
      parser: '@typescript-eslint/parser',
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
        '@eslint-community/eslint-comments/no-unused-disable': 'warn',
        '@typescript-eslint/await-thenable': 'warn',
        '@typescript-eslint/consistent-type-assertions': [
          'warn',
          {
            assertionStyle: 'never',
          },
        ],
        '@typescript-eslint/consistent-type-definitions': [
          'warn',
          'type',
        ],
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'default',
            format: [
              'strictCamelCase',
              'StrictPascalCase',
            ],
          },
          {
            selector: [
              'typeLike',
              'enumMember',
            ],
            format: ['StrictPascalCase'],
          },
          {
            selector: ['objectLiteralProperty'],
            format: [
              'strictCamelCase',
              'StrictPascalCase',
            ],
          },
          {
            selector: 'parameter',
            format: [
              'strictCamelCase',
              'StrictPascalCase',
            ],
            leadingUnderscore: 'allow',
          },
          {
            selector: 'variable',
            modifiers: ['const'],
            format: [
              'strictCamelCase',
              'StrictPascalCase',
              'UPPER_CASE',
            ],
            leadingUnderscore: 'allow',
          },
          {
            selector: [
              'classProperty',
              'objectLiteralProperty',
              'typeProperty',
              'accessor',
            ],
            format: null,
            modifiers: ['requiresQuotes'],
          },
        ],
        '@typescript-eslint/no-empty-object-type': [
          'warn',
          {
            allowObjectTypes: 'always',
          },
        ],
        '@typescript-eslint/no-floating-promises': [
          // incredibly slow rule!
          process.env.NODE_ENV === 'production' ? 'warn' : 'off',
          {
            ignoreVoid: false,
            checkThenables: true,
          },
        ],
        // very slow rule
        '@typescript-eslint/no-misused-promises': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        // seems to generate a lot of false positives and be redundant with TS settings
        '@typescript-eslint/no-unsafe-argument': 'off',
        // seems to generate a lot of false positives and be redundant with TS settings
        '@typescript-eslint/no-unsafe-assignment': 'off',
        // seems to generate a lot of false positives and be redundant with TS settings
        '@typescript-eslint/no-unsafe-call': 'off',
        // seems to generate a lot of false positives and be redundant with TS settings
        '@typescript-eslint/no-unsafe-member-access': 'off',
        // seems to generate a lot of false positives and be redundant with TS settings
        '@typescript-eslint/no-unsafe-return': 'off',
        // disable in favour of unused-imports/no-unused-vars as it gives more control
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/prefer-readonly': 'warn',
        '@typescript-eslint/switch-exhaustiveness-check': 'warn',
        // dprint handles this
        'array-bracket-newline': [
          'warn',
          {
            multiline: true,
            minItems: 2,
          },
        ],
        'array-element-newline': [
          'warn',
          {
            multiline: true,
            minItems: 2,
          },
        ],
        // handled by dprint
        'comma-dangle': ['off'],
        'default-case': 'warn',
        'dprint-integration2/dprint': [
          'warn',
          {},
          {
            typescript: {
              'functionExpression.spaceBeforeParentheses': true,
              'importDeclaration.sortNamedImports': 'caseInsensitive',
              'jsx.bracketPosition': 'nextLine',
              'jsx.forceNewLinesSurroundingContent': true,
              'jsx.multiLineParens': 'always',
              'module.sortExportDeclarations': 'caseInsensitive',
              'module.sortImportDeclarations': 'caseInsensitive',
              'parameters.preferHanging': 'onlySingleItem',
              preferHanging: true,
              preferSingleLine: false,
              quoteProps: 'asNeeded',
              quoteStyle: 'alwaysSingle',
              semiColons: 'asi',
              trailingCommas: 'onlyMultiLine',
              'typeLiteral.separatorKind': 'comma',
            },
          },
        ],
        eqeqeq: [
          'warn',
          'always',
          {
            null: 'never',
          },
        ],
        'func-style': [
          'warn',
          'declaration',
        ],
        'import/extensions': [
          'warn',
          'never',
          {
            json: 'always',
            svg: 'always',
            js: 'ignorePackages',
            mts: 'always',
            config: 'always',
            gql: 'always',
            html: 'always',
            'module.css': 'always',
          },
        ],
        // very slow rule
        'import/no-cycle': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'import/no-extraneous-dependencies': 'warn',
        // handled better by no-relative-import-paths/no-relative-import-paths
        'import/no-relative-packages': ['off'],
        'import/no-self-import': 'warn',
        // doesn't work with complex project structures
        'import/no-unresolved': 'off',
        // has collisions with DPrint and is also handled by DPrint anyway
        'import-newlines/enforce': ['off'],
        'no-alert': 'warn',
        // consistent type imports conflicts with dprint import ordering, so we
        // disable the auto-fixing and just make it a manual process :(
        'no-autofix/@typescript-eslint/consistent-type-imports': [
          'warn',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
          },
        ],
        'no-autofix/prefer-const': 'warn',
        'no-autofix/unused-imports/no-unused-imports': 'warn',
        'no-console': 'warn',
        'no-debugger': 'warn',
        'no-duplicate-imports': 'warn',
        'no-multi-spaces': 'warn',
        'no-multiple-empty-lines': [
          'warn',
          {
            max: 1,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            maxBOF: 0,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            maxEOF: 1,
          },
        ],
        'no-only-tests/no-only-tests': 'warn',
        'no-relative-import-paths/no-relative-import-paths': [
          'warn',
          {
            allowSameFolder: true,
            rootDir: '.',
          },
        ],
        'no-restricted-syntax': [
          'warn',
          {
            selector: 'TSEnumDeclaration:not([const=false])',
            message: 'do not use const enum instead in a monorepo',
          },
        ],
        // causes problems
        'no-undefined': 'off',
        // disable in favour of unused-imports/no-unused-vars as it gives more control
        'no-unused-vars': 'off',
        'object-curly-newline': [
          'warn',
          {
            multiline: true,
            minProperties: 2,
            consistent: true,
          },
        ],
        'object-property-newline': [
          'warn',
          {
            allowMultiplePropertiesPerLine: false,
          },
        ],
        // annoying to have const auto-fixed when you're in the middle of coding with a let
        'prefer-const': 'off',
        'prefer-destructuring': [
          'warn',
          {
            array: true,
            object: true,
          },
        ],
        'react/display-name': ['off'],
        'react/jsx-boolean-value': [
          'warn',
          'always',
        ],
        'react/jsx-closing-bracket-location': ['off'],
        'react/jsx-first-prop-new-line': [
          'warn',
          'multiline-multiprop',
        ],
        'react/jsx-indent-props': [
          'warn',
          2,
        ],
        'react/jsx-max-props-per-line': [
          'warn',
          {
            maximum: 1,
          },
        ],
        'react/jsx-one-expression-per-line': [
          'warn',
          { allow: 'non-jsx' },
        ],
        'react/jsx-sort-props': [
          'warn',
          {},
        ],
        'react/no-unknown-property': ['warn'],
        // handled by dprint
        'react/prop-types': ['off'],
        'react/react-in-jsx-scope': ['off'],
        'react-hooks/exhaustive-deps': [
          'warn',
          {
            additionalHooks:
              '(usePartialComponent|usePartialObserverComponent|useWhen|useReaction|useAutorun|useObserverComponent|useConstant|useDeferredConstant)',
          },
        ],
        // handled by dprint
        semi: 'off',
        'sort-keys': [
          'warn',
          'asc',
          {
            caseSensitive: true,
            natural: true,
            minKeys: 10,
          },
        ],
        // annoying to have unused imports deleted prematurely
        'unused-imports/no-unused-imports': 'off',
        // typescript does this more correctly anyway
        'unused-imports/no-unused-vars': 'off',
      },
    },
    // test files
    {
      files: ['*.tests.*'],
      rules: {
        // interferes with expect(my.method).toHaveBeenCalledOnce() etc...
        '@typescript-eslint/unbound-method': 'off',
        // TODO is there a vitest equivalent?
        // 'jest/unbound-method': 'error',
      },
    },
    // TSX only
    {
      files: ['*.tsx'],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              {
                group: ['@strictly/*/*'],
                message: 'you can\'t import subfolders from workspace packages, export the file in the package instead',
              },
            ],
            paths: [
              {
                name: 'react',
                importNames: ['default'],
                message: 'you don\'t need to explicitly import \'React\' in .tsx files',
              },
              // TODO can this be moved to a common place instead of duplicating?
              {
                name: 'vitest',
                importNames: [
                  'afterAll',
                  'afterEach',
                  'beforeAll',
                  'beforeEach',
                  'describe',
                  'expect',
                  'it',
                  'test',
                ],
                message: 'you don\'t need to explicitly import \'vitest\' functions',
              },
            ],
          },
        ],
      },
    },
    // non TSX source files
    {
      files: [
        '*.ts',
        '*.js',
        '*.cjs',
      ],
      rules: {
        'no-restricted-globals': [
          'warn',
          {
            name: 'React',
            message:
              'You cannot reference the global "React" in .ts (only .tsx) files. You must "import React from \'react\'" or you will get a runtime error',
          },
        ],
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              {
                group: ['@strictly/*/*'],
                message: 'you can\'t import subfolders from workspace packages, export the file in the package instead',
              },
            ],
            paths: [
              {
                name: 'vitest',
                importNames: [
                  'afterAll',
                  'afterEach',
                  'beforeAll',
                  'beforeEach',
                  'describe',
                  'expect',
                  'it',
                  'test',
                ],
                message: 'you don\'t need to explicitly import \'vitest\' functions',
              },
            ],
          },
        ],
      },
    },
    // CSS
    {
      files: ['*.css'],
      parser: 'eslint-parser-plain',
      plugins: ['dprint-integration2'],
      rules: {
        'dprint-integration2/dprint': [
          'warn',
          {},
          {
            malva: {
              declarationOrder: 'alphabetical',
              preferSingleLine: true,
              blockSelectorLinebreak: 'always',
              quotes: 'alwaysSingle',
            },
          },
        ],
      },
    },
  ],
  rules: {
    'eol-last': [
      'warn',
      'always',
    ],
    'no-multiple-empty-lines': [
      'warn',
      {
        max: 1,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        maxBOF: 0,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        maxEOF: 0,
      },
    ],
    'no-trailing-spaces': ['warn'],
  },
  ignorePatterns: [
    '!.vitest',
    '!.vscode',
    '!.github',
    '!.storybook',
    '**/dist/**',
    '**/.out/**',
    '**/*.d.ts',
    '**/locales/*.ts',
    'node_modules',
    'package.release.json',
    'storybook-static',
  ],
}
