import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type OxlintConfig, type OxlintOverride } from 'oxlint'

// NOTE: this file is loaded directly by oxlint via node's type stripping, so it must not use any typescript syntax that
// requires transformation (enums, namespaces, parameter properties, etc...)

type TSConfigProject = Partial<{
  readonly compilerOptions: Partial<{
    readonly paths: {
      readonly '*'?: readonly string[]
    }
    readonly [_: string]: unknown
  }>
  readonly include: readonly string[]
  readonly exclude: readonly string[]
  readonly [_: string]: unknown
}>

type Restriction = {
  readonly message: string
  readonly selector: string
}

// NOTE: oxlint's config types are mutable, so these cannot be readonly
type RestrictedImportPath = {
  name: string
  message: string
  importNames?: string[]
  allowImportNames?: string[]
}

type RestrictedImportPattern = {
  regex: string
  message: string
}

type RestrictedImports = {
  paths: RestrictedImportPath[]
  patterns: RestrictedImportPattern[]
}

const PLUGIN_PATH = fileURLToPath(new URL('./plugin.ts', import.meta.url))

const TEST_GLOBALS = [
  'afterAll',
  'afterEach',
  'beforeAll',
  'beforeEach',
  'describe',
  'expect',
  'it',
  'test',
]

// https://eslint.org/docs/latest/rules/no-restricted-syntax
// https://eslint.org/docs/latest/extend/selectors
// https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Selectors
// https://explorer.eslint.org/
const NO_RESTRICTED_SYNTAX_RULES: readonly Restriction[] = [
  {
    message: 'useEffect must always be called with a list of dependencies',
    selector: "CallExpression[callee.name='useEffect'][arguments.length!=2]",
  },
  {
    message: 'useEffect must always return, consider adding a destructor',
    selector:
      "CallExpression[callee.name='useEffect'] > ArrowFunctionExpression:first-child > BlockStatement > *:last-child[type!=ReturnStatement]",
  },
  {
    message:
      'Use inline export instead. If you are re-exporting a value then use the `export from` syntax instead',
    selector: 'ExportNamedDeclaration[source=null][declaration=null]',
  },
  // === null
  {
    message: 'use == null instead',
    selector:
      'BinaryExpression[operator="==="][right.value=null][right.type=Literal]',
  },
  // == undefined (note that undefined values have no attributes in the AST)
  {
    message: 'use == null instead',
    selector:
      'BinaryExpression[operator="=="][right.value=undefined][right.name=undefined][right.type=Identifier]',
  },
  // === undefined (note that undefined values have no attributes in the AST)
  {
    message: 'use == null instead',
    selector:
      'BinaryExpression[operator="==="][right.value=undefined][right.name=undefined][right.type=Identifier]',
  },
  // ban Boolean
  {
    message: 'just use a boolean expression',
    selector: 'CallExpression[callee.name="Boolean"]',
  },
  // force switch default to always throw an unreachable error
  {
    message: 'always throw new UnreachableError in default case',
    selector:
      'SwitchCase[test=null][consequent.0.argument.callee.name!=UnreachableError]',
  },
  // disallow conditional hooks
  {
    message: 'conditional hook, this breaks rules of hooks',
    selector:
      '[type=/(IfStatement|SwitchStatement)/]:has(ReturnStatement,ThrowStatement) ~ * CallExpression[callee.name=/^use[A-Z].*/],[type=/(FunctionDeclaration|FunctionExpression)/]:not(:has(* [type=/(FunctionDeclaration|FunctionExpression)/])) [type=/(IfStatement|SwitchStatement|LogicalExpression)/] CallExpression[callee.name=/^use[A-Z].*/]',
  },
  // Every `<Trans>` must carry a `comment` to give translators context
  {
    message:
      '`<Trans>` must have a `comment` describing the string for translators',
    selector:
      "JSXOpeningElement[name.name='Trans']:not(:has(JSXAttribute[name.name='comment']))",
  },
  // Every `t({...})` macro call must carry a `comment` for translators
  {
    message:
      '`t({...})` must include a `comment` describing the string for translators',
    selector:
      "CallExpression[callee.name='t'] > ObjectExpression:not(:has(> Property[key.name='comment']))",
  },
  // The `t\`...\`` tagged-template form cannot carry a comment; use `t({ message, comment })` instead
  {
    message:
      'Use `t({ message, comment })` instead of the `t` tagged template so translators get a `comment`',
    selector: "TaggedTemplateExpression[tag.name='t']",
  },
  // `plural` on its own has no way to carry a `comment`; it must be enclosed in a
  // `t({...})` so translators get context
  {
    message:
      '`plural(...)` must be enclosed in `t({ comment, message: plural(...) })` so it has a `comment`',
    selector:
      "CallExpression[callee.name='plural']:not(CallExpression[callee.name='t'] CallExpression[callee.name='plural']):not(JSXElement[openingElement.name.name='Trans'] CallExpression[callee.name='plural'])",
  },
  // plural/select/selectOrdinal do not inline inside `<Trans>` in our lingui setup:
  // extraction emits a trivial `{0}` wrapper message and dumps the surrounding source
  // file into the `.po` placeholder comment. Extract into a `t({ comment, message })` helper.
  {
    message:
      "Don't use `plural`/`select`/`selectOrdinal` inside `<Trans>` — lingui won't inline it and dumps source into .po placeholder comments. Extract it into a `t({ comment, message: plural(...) })` helper instead.",
    selector:
      "JSXElement[openingElement.name.name='Trans'] JSXExpressionContainer > CallExpression[callee.name=/^(plural|select|selectOrdinal)$/]",
  },
  // React compiler will eagerly resolve translations if they are returned directly by a Component
  {
    message:
      'Components (functions starting with a capital) should use `<Trans>` rather than `t` or `msg`',
    selector:
      'FunctionDeclaration[id.name=/^[A-Z].*/]:not(:has(* [type=/(FunctionDeclaration|FunctionExpression)/])) > BlockStatement *[type=ReturnStatement] > *[type=CallExpression] > Identifier[name=/^(t)$/],FunctionDeclaration[id.name=/^[A-Z].*/]:not(:has(* [type=/(FunctionDeclaration|FunctionExpression)/])) > BlockStatement *[type=ReturnStatement] > *[type=TaggedTemplateExpression] > Identifier[name=/^(msg|t)$/]',
  },
  // Enforce the use of the name "styles" or "xStyles" for imported css modules
  {
    message: "use the name 'styles' for CSS module imports",
    selector:
      'ImportDeclaration[source.value=/^.*\\.module\\.css$/] > ImportDefaultSpecifier[local.name=/^.*(?<![Ss]tyles)$/]',
  },
  // alert import.meta.env destructuring
  {
    message:
      'destructuring import.meta.env will make your constants always have a value of undefined!',
    selector:
      "VariableDeclaration > VariableDeclarator[id.type='ObjectPattern'][init.property.name='env'][init.object.property.name='meta'][init.object.meta.name='import']",
  },
  // no dependency useCallbacks are suspicious
  {
    message:
      'useCallback without dependencies: can you move this function out of the render function?',
    selector:
      'CallExpression[callee.name=/^(useCallback)$/][arguments.1.elements.length=0]:not(CallExpression[callee.name=/^(useCallback|useMemo)$/] *):not(:has(Identifier[name=/^ref$|Ref$/]))',
  },
]

const NO_RESTRICTED_IMPORTS: RestrictedImports = {
  paths: [
    {
      importNames: ['Trans'],
      message: 'You want to import `Trans` from `@lingui/react/macro`',
      name: '@lingui/react',
    },
    {
      importNames: ['Plural'],
      message:
        "Plural doesn't appear to work, use `plural` within a `Trans` instead",
      name: '@lingui/react/macro',
    },
    {
      importNames: ['t'],
      message: 'You want to import `t` from `@lingui/core/macro`',
      name: '@lingui/core',
    },
    {
      message: 'You want to import `action` from `storybook/actions`',
      name: 'storybook/internal/actions',
    },
    {
      message: 'You want to import `directly` from `storybook/test`',
      name: 'storybook/internal/test',
    },
  ],
  patterns: [
    {
      message: 'Are you sure you want to import a JS file?',
      regex: '.*\\.js$',
    },
    {
      message: 'Are you sure you want to import a non-source folder?',
      regex: '^((build)|(dist)|(node_modules)|(storybook-static))\\/.*$',
    },
    {
      message:
        "you can't import subfolders from workspace packages, export the file in the package instead",
      regex:
        '^(?!@strictly/[^\\/]*/((config)|(preview)))(@strictly)\\/[^\\/]*\\/.*$',
    },
    {
      message:
        'Underscores in path or package names are inconsistent with NPM naming standards. Use a hyphen.',
      regex: '^[^./].*_.*$',
    },
  ],
}

// helpers that only make sense in tests and stories
const TEST_HELPER_IMPORT_NAMES = [
  'expectDefined',
  'expectDefinedAndReturn',
  'expectEquals',
  'expectTruthy',
]

const PATH_REGEX = /^\.\/(.*)\/\*$/
function extractSrcFolder(project: TSConfigProject | undefined) {
  const src = project?.compilerOptions?.paths?.['*']?.[0]
  if (src == null) {
    return
  }
  const maybePath = PATH_REGEX.exec(src)
  if (maybePath == null || maybePath.length < 2) {
    return src
  }
  return maybePath[1]
}

function toGlobs(includes: readonly string[]) {
  return includes
    .flatMap((f) => {
      // assume it's a file with an extension
      if (f.includes('.')) {
        return [f]
      }
      const dir = f.endsWith('/') ? f : `${f}/`
      return [
        `${dir}**/*.ts`,
        `${dir}**/*.tsx`,
        `${dir}**/*.mts`,
        `${dir}**/*.astro`,
      ]
    })
    .filter(
      (f) =>
        f.endsWith('.ts') ||
        f.endsWith('.mts') ||
        f.endsWith('.tsx') ||
        f.endsWith('.astro'),
    )
}

export type CreateOxlintConfigOptions = {
  // the absolute path of the directory containing the oxlint config (and the tsconfigs)
  readonly rootDir: string
  readonly srcFolder?: string
  readonly mainProject?: TSConfigProject
  readonly otherProjects?: readonly TSConfigProject[]
  // regex of additional hooks to check for exhaustive dependencies
  readonly additionalHooks?: string
}

export function createOxlintConfig({
  rootDir,
  mainProject,
  srcFolder = extractSrcFolder(mainProject) ?? '.',
  otherProjects = [],
  additionalHooks = '(usePartialComponent|usePartialObserverComponent|useWhen|useReaction|useAutorun|useObserverComponent|useConstant|useDeferredConstant)',
}: CreateOxlintConfigOptions): OxlintConfig {
  const allProjects = [
    ...(mainProject == null ? [] : [mainProject]),
    ...otherProjects,
  ]

  const ignorePatterns = [
    ...allProjects.flatMap(({ exclude }) => exclude ?? []),
    '**/.out/**',
    '**/dist/**',
    '**/node_modules/**',
    '**/storybook-static/**',
    // generated
    '**/*.d.ts',
  ]

  const mainFiles = toGlobs(mainProject?.include ?? [])
  const sourceFiles =
    srcFolder === '.'
      ? mainFiles
      : mainFiles.filter((f) => f.startsWith(srcFolder))
  const specsFiles = [
    `${srcFolder}/**/specs/*.ts`,
    `${srcFolder}/**/specs/*.tsx`,
  ]
  const storybookFiles = [`${srcFolder}/**/specs/*.stories.tsx`]
  const testFiles = [
    `${srcFolder}/**/specs/*.tests.ts`,
    `${srcFolder}/**/specs/*.tests.tsx`,
  ]
  const absoluteSrcFolder = path.resolve(rootDir, srcFolder)

  function noRestrictedImports(
    paths: readonly RestrictedImportPath[],
    patterns: readonly RestrictedImportPattern[],
  ): ['error', RestrictedImports] {
    return [
      'error',
      {
        paths: [...paths, ...NO_RESTRICTED_IMPORTS.paths],
        patterns: [...patterns, ...NO_RESTRICTED_IMPORTS.patterns],
      },
    ]
  }

  const testGlobals = Object.fromEntries(
    TEST_GLOBALS.map((name) => [name, 'readonly'] as const),
  )

  const overrides: OxlintOverride[] = [
    // lint source files
    {
      files: sourceFiles,
      excludeFiles: specsFiles,
      rules: {
        'strictly/no-relative-import-paths': [
          'error',
          {
            allowSameFolder: true,
            rootDir: absoluteSrcFolder,
          },
        ],
        'import/no-default-export': 'error',
        'no-restricted-imports': noRestrictedImports(
          [
            // ban testing imports
            {
              importNames: TEST_HELPER_IMPORT_NAMES,
              message: "Don't use test imports in production code",
              name: '@strictly/base',
            },
            {
              message: "Don't use test imports in production code",
              name: 'storybook',
            },
            {
              message:
                "Don't use test imports in production code. Importing this here will break Vite!",
              name: 'vitest',
            },
            {
              message:
                "Don't use test imports in production code. Importing this here will break Vite!",
              name: 'vitest-mock-extended',
            },
          ],
          [
            {
              message: "Don't use test imports in production code",
              regex: '^(@?storybook)\\/.*$',
            },
            {
              message: "Don't use test imports in production code",
              regex: '^(@testing-library)\\/.*$',
            },
          ],
        ),
        'no-restricted-properties': [
          'error',
          {
            message:
              'Avoid using toFixed(). Use an appropriately typed label instead.',
            property: 'toFixed',
          },
        ],
        'strictly/restricted-syntax': [
          'error',
          [
            ...NO_RESTRICTED_SYNTAX_RULES,
            // disallow JSX in non-capitalized functions
            {
              message:
                'JSX should only appear in hooks (functions starting with "use") or Components (functions starting with a capital) or factories (functions starting with "create" or "install")',
              selector:
                'FunctionDeclaration[id.name=/^(?!use.*|create.*|install.*)[a-z].*/] * JSXElement',
            },
          ],
        ],
        // don't use undefined as a constant in source files
        'no-undefined': 'error',
        'prefer-destructuring': 'error',
      },
    },
    // lint storybook and vitest files separately
    {
      files: specsFiles,
      globals: testGlobals,
      rules: {
        'strictly/no-relative-import-paths': [
          'error',
          {
            // let storybook and unit tests reference their parents relatively to make moving the files around easier
            allowedDepth: 1,
            allowSameFolder: true,
            rootDir: absoluteSrcFolder,
          },
        ],
        'strictly/restricted-syntax': [
          'error',
          [
            ...NO_RESTRICTED_SYNTAX_RULES,
            // ban synchronous test functions (always use asynchronous)
            ...[
              'Text',
              'PlaceholderText',
              'LabelText',
              'AltText',
              'DisplayValue',
              'Role',
              'Title',
            ].flatMap((by) => [
              {
                message: `Asynchronous stories and unit tests are safer. Use findBy${by} instead.`,
                selector: `CallExpression[callee.property.name='getBy${by}']`,
              },
              {
                message: `Asynchronous stories and unit tests are safer. Use findAllBy${by} instead.`,
                selector: `CallExpression[callee.property.name='getAllBy${by}']`,
              },
            ]),
            // ban usage of test-id entirely
            ...[
              'getByTestId',
              'findByTestId',
              'queryByTestId',
              'getAllByTestId',
              'findAllByTestId',
              'queryAllByTestId',
            ].map((method) => ({
              message: 'Test id is an anti-pattern, find a better way',
              selector: `CallExpression[callee.property.name='${method}']`,
            })),
          ],
        ],
      },
    },
    // vitest files
    {
      files: testFiles,
      rules: {
        'no-restricted-imports': noRestrictedImports(
          [
            // ban storybook imports
            {
              message: "Don't use storybook imports in unit tests",
              name: 'storybook',
            },
            {
              importNames: TEST_GLOBALS,
              message: "you don't need to explicitly import 'vitest' globals",
              name: 'vitest',
            },
          ],
          [
            {
              message:
                "Don't use storybook imports in unit tests. There should be an @testing-library equivalent to whatever you are trying to import.",
              regex: '^(storybook)\\/.*$',
            },
          ],
        ),
      },
    },
    // storybook files
    {
      files: storybookFiles,
      rules: {
        // storybook requires default exports for the meta
        'import/no-default-export': 'off',
        'no-restricted-imports': noRestrictedImports(
          [
            // ban vitest imports
            {
              message:
                "Don't use test imports in storybook code. Importing this will give incomprehensible errors in Storybook!",
              name: 'vitest',
            },
            {
              message:
                "Don't use test imports in storybook code. Importing this will give incomprehensible errors in Storybook!",
              name: 'vitest-mock-extended',
            },
          ],
          [
            {
              message:
                "Don't use test imports in storybook code. There should be a storybook/test equivalent to whatever you are trying to import.",
              regex: '^(@testing-library)\\/.*$',
            },
          ],
        ),
      },
    },
    // lint configuration and other supporting files
    {
      files: ['**/*'],
      excludeFiles: sourceFiles,
      env: {
        node: true,
      },
      globals: {
        NodeJS: 'readonly',
      },
    },
  ]

  return defineConfig({
    ignorePatterns,
    jsPlugins: [
      {
        name: 'strictly',
        specifier: PLUGIN_PATH,
      },
      {
        name: 'stylistic',
        specifier: '@stylistic/eslint-plugin',
      },
    ],
    plugins: [
      'import',
      'jsx-a11y',
      'oxc',
      'react',
      'typescript',
      'unicorn',
      'vitest',
    ],
    env: {
      browser: true,
      es2024: true,
    },
    globals: {
      JSX: 'readonly',
      React: 'readonly',
    },
    settings: {
      react: {
        version: '19.1.0',
      },
    },
    categories: {
      correctness: 'error',
      perf: 'error',
      suspicious: 'error',
    },
    options: {
      reportUnusedDisableDirectives: 'error',
      respectEslintDisableDirectives: true,
    },
    rules: {
      // -- typescript --
      'typescript/array-type': 'error',
      'typescript/ban-ts-comment': [
        'error',
        {
          'ts-check': false,
          'ts-expect-error': true,
          'ts-ignore': true,
          'ts-nocheck': true,
        },
      ],
      'typescript/class-literal-property-style': 'error',
      'typescript/consistent-generic-constructors': 'error',
      // the type-level code in this repository relies on index signatures where `Record` would break the compiler
      'typescript/consistent-indexed-object-style': 'off',
      'typescript/consistent-type-assertions': [
        'error',
        {
          arrayLiteralTypeAssertions: 'allow',
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
      'typescript/no-empty-interface': 'error',
      'typescript/no-explicit-any': 'error',
      'typescript/no-inferrable-types': 'error',
      'typescript/prefer-as-const': 'error',
      'typescript/prefer-enum-initializers': 'error',
      'typescript/prefer-for-of': 'error',
      'typescript/prefer-function-type': 'error',
      // -- typescript (type aware) --
      'typescript/await-thenable': 'error',
      'typescript/dot-notation': 'error',
      'typescript/no-array-delete': 'error',
      'typescript/no-base-to-string': 'error',
      'typescript/no-duplicate-type-constituents': 'error',
      'typescript/no-floating-promises': [
        'error',
        {
          // make it cover cancellable promises too
          checkThenables: true,
        },
      ],
      'typescript/no-for-in-array': 'error',
      'typescript/no-implied-eval': 'error',
      'typescript/no-misused-promises': 'error',
      'typescript/no-misused-spread': 'error',
      'typescript/no-redundant-type-constituents': 'error',
      'typescript/no-unnecessary-boolean-literal-compare': 'error',
      // no-constant-condition only covers one aspect of this, so we prefer the type-aware check
      'typescript/no-unnecessary-condition': [
        'error',
        {
          allowConstantLoopConditions: 'only-allowed-literals',
          checkTypePredicates: true,
        },
      ],
      'typescript/no-unnecessary-type-assertion': 'error',
      // the no-unsafe-* rules generate a lot of false positives in the type-level code in this repository and are
      // largely redundant with the TS settings, so they are disabled
      'typescript/no-unsafe-argument': 'off',
      'typescript/no-unsafe-assignment': 'off',
      'typescript/no-unsafe-call': 'off',
      'typescript/no-unsafe-enum-comparison': 'error',
      'typescript/no-unsafe-member-access': 'off',
      'typescript/no-unsafe-return': 'off',
      'typescript/no-unsafe-unary-minus': 'error',
      'typescript/only-throw-error': 'error',
      'typescript/prefer-find': 'error',
      'typescript/prefer-includes': 'error',
      'typescript/prefer-nullish-coalescing': 'error',
      'typescript/prefer-optional-chain': 'error',
      // not an issue, causes other linting errors
      'typescript/prefer-promise-reject-errors': 'off',
      'typescript/prefer-regexp-exec': 'error',
      'typescript/prefer-string-starts-ends-with': 'error',
      'typescript/require-await': 'error',
      'typescript/restrict-plus-operands': 'error',
      'typescript/restrict-template-expressions': 'error',
      'typescript/strict-boolean-expressions': [
        'error',
        {
          allowNullableBoolean: true,
        },
      ],
      // we reference a lot of unbound methods in unit tests due to mocks and
      // mobx has an annotation called @action.bound that eslint doesn't understand
      'typescript/unbound-method': 'off',
      // -- eslint --
      'arrow-body-style': ['error', 'as-needed'],
      complexity: [
        'error',
        {
          max: 20,
        },
      ],
      curly: ['error', 'all'],
      'default-case': 'error',
      'default-param-last': 'error',
      eqeqeq: [
        'error',
        'always',
        {
          null: 'ignore',
        },
      ],
      'max-params': [
        'error',
        {
          max: 6,
        },
      ],
      'no-console': [
        'error',
        {
          allow: ['error', 'warn'],
        },
      ],
      'no-duplicate-imports': 'error',
      'no-else-return': [
        'error',
        {
          allowElseIf: false,
        },
      ],
      // eslint doesn't understand typescript overloading
      'no-redeclare': 'off',
      'no-restricted-imports': noRestrictedImports([], []),
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          varsIgnorePattern: '^_',
        },
      ],
      'object-shorthand': ['error', 'always'],
      'one-var': ['error', 'never'],
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'require-await': 'error',
      // oxfmt orders the import declarations, this orders the members within them
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
      'strictly/restricted-syntax': ['error', NO_RESTRICTED_SYNTAX_RULES],
      // -- unicorn --
      'unicorn/no-negated-condition': 'error',
      'unicorn/no-useless-undefined': [
        'error',
        {
          // an explicit undefined argument is meaningful (e.g. a prototype value)
          checkArguments: false,
        },
      ],
      'unicorn/prefer-number-properties': 'error',
      // -- react --
      'react/exhaustive-deps': [
        'error',
        {
          additionalHooks,
        },
      ],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-no-useless-fragment': 'error',
      'react/no-array-index-key': 'error',
      'react/preserve-manual-memoization': 'error',
      // the new JSX transform doesn't require React in scope
      'react/react-in-jsx-scope': 'off',
      // covered by the conditional hook restricted syntax
      'react/rules-of-hooks': 'off',
      'react/self-closing-comp': 'error',
      // -- rules from the default categories that are not part of the compass ruleset --
      'import/no-unassigned-import': 'off',
      'no-await-in-loop': 'off',
      'no-shadow': 'off',
      // project standard is trailing underscore indicates it is non-production code
      'no-underscore-dangle': 'off',
      // creating new objects in map callbacks is intentional in this repository
      'oxc/no-map-spread': 'off',
      'oxc/no-this-in-exported-function': 'off',
      'react/capitalized-calls': 'error',
      // dependency injection requires us to be able to do nested component definitions
      'react/static-components': 'off',
      'typescript/consistent-return': 'off',
      'typescript/no-unnecessary-template-expression': 'off',
      'typescript/no-unnecessary-type-arguments': 'off',
      'typescript/no-unnecessary-type-parameters': 'off',
      'typescript/no-unsafe-type-assertion': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-sort': 'off',
      'vitest/no-commented-out-tests': 'off',
      'vitest/require-mock-type-parameters': 'off',
      // -- equivalents of the biome recommended rules that oxlint does not enable by default --
      'default-case-last': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
      'no-array-constructor': 'error',
      'no-case-declarations': 'error',
      // covered by the type-aware no-unnecessary-condition
      'no-constant-condition': 'off',
      'no-extra-label': 'error',
      'no-fallthrough': 'error',
      'no-label-var': 'error',
      'no-lone-blocks': 'error',
      'no-prototype-builtins': 'error',
      'no-return-assign': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-template-curly-in-string': 'error',
      'oxc/no-const-enum': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-regex-literals': 'error',
      'prefer-rest-params': 'error',
      'prefer-template': 'error',
      radix: 'error',
      'react/button-has-type': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-danger': 'error',
      'typescript/adjacent-overload-signatures': 'error',
      'typescript/consistent-type-exports': 'error',
      'typescript/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      'typescript/no-non-null-assertion': 'error',
      'typescript/no-unsafe-function-type': 'error',
      'typescript/prefer-literal-enum-member': 'error',
      'unicorn/no-document-cookie': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-static-only-class': 'error',
      'unicorn/no-useless-switch-case': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'no-new-wrappers': 'error',
      'unicorn/no-array-method-this-argument': 'error',
      // template literals without expressions should be plain strings
      'stylistic/quotes': [
        'error',
        'single',
        {
          allowTemplateLiterals: 'never',
          avoidEscape: true,
        },
      ],
      // -- import --
      'import/no-duplicates': 'error',
      'import/no-self-import': 'error',
    },
    overrides,
  })
}
