import { existsSync } from 'node:fs'
import path from 'node:path'

// NOTE: this file is loaded directly by oxlint via node's type stripping, so it must not use any typescript syntax that
// requires transformation (enums, namespaces, parameter properties, etc...)

type Restriction = {
  readonly message: string
  readonly selector: string
}

type NoRelativeImportPathsOptions = {
  readonly allowSameFolder?: boolean
  readonly allowedDepth?: number
  // the source folder, relative to the package (the nearest ancestor of the linted file holding a package.json)
  readonly srcFolder?: string
}

const packageRoots = new Map<string, string | null>()

// the directory of the nearest package.json above the given directory
function findPackageRoot(dir: string): string | null {
  if (packageRoots.has(dir)) {
    return packageRoots.get(dir) ?? null
  }
  const parent = path.dirname(dir)
  let root: string | null
  if (existsSync(path.join(dir, 'package.json'))) {
    root = dir
  } else if (parent === dir) {
    root = null
  } else {
    root = findPackageRoot(parent)
  }
  packageRoots.set(dir, root)
  return root
}

// oxlint doesn't ship `no-restricted-syntax`, so we implement the same behaviour as a JS plugin using esquery selectors
const restrictedSyntax = {
  meta: {
    schema: [{ type: 'array' }],
  },
  // oxlint-disable-next-line typescript/no-explicit-any -- oxlint does not export types for its plugin api
  create(context: any) {
    const restrictions: readonly Restriction[] = context.options[0] ?? []
    const listeners: Record<string, (node: unknown) => void> = {}
    for (const { selector, message } of restrictions) {
      listeners[selector] = (node) => {
        context.report({
          message,
          node,
        })
      }
    }
    return listeners
  },
}

function getRelativePathDepth(importPath: string) {
  let depth = 0
  let remaining = importPath
  while (remaining.startsWith('../')) {
    depth += 1
    remaining = remaining.substring(3)
  }
  return depth
}

// port of eslint-plugin-no-relative-import-paths that resolves the source root from the linted file's package, so one
// configuration serves every package in the workspace regardless of the working directory oxlint was launched from
const noRelativeImportPaths = {
  meta: {
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowSameFolder: { type: 'boolean' },
          allowedDepth: { type: 'number' },
          srcFolder: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },
  // oxlint-disable-next-line typescript/no-explicit-any -- oxlint does not export types for its plugin api
  create(context: any) {
    const {
      allowSameFolder = false,
      allowedDepth,
      srcFolder = 'src',
    }: NoRelativeImportPathsOptions = context.options[0] ?? {}
    const filename: string = context.filename ?? context.getFilename()
    const fileDir = path.dirname(filename)
    const packageRoot = findPackageRoot(fileDir)
    if (packageRoot == null) {
      return {}
    }
    const rootDir = path.join(packageRoot, srcFolder)
    const rootPrefix = rootDir + path.sep

    // oxlint-disable-next-line typescript/no-explicit-any -- oxlint does not export types for its plugin api
    function check(node: any, source: any) {
      const importPath: unknown = source?.value
      if (typeof importPath !== 'string') {
        return
      }
      const isSameFolder = importPath.startsWith('./')
      const isParentFolder = importPath.startsWith('../')
      if (!isSameFolder && !isParentFolder) {
        return
      }
      const absoluteImportPath = path.resolve(fileDir, importPath)
      const withinRoot =
        filename.startsWith(rootPrefix) &&
        absoluteImportPath.startsWith(rootPrefix)
      if (!withinRoot) {
        return
      }
      if (isSameFolder && allowSameFolder) {
        return
      }
      if (
        isParentFolder &&
        allowedDepth != null &&
        getRelativePathDepth(importPath) <= allowedDepth
      ) {
        return
      }
      const absoluteImport = path
        .relative(rootDir, absoluteImportPath)
        .split(path.sep)
        .join('/')
      context.report({
        message: 'import statements should have an absolute path',
        node,
        // oxlint-disable-next-line typescript/no-explicit-any -- oxlint does not export types for its plugin api
        fix(fixer: any) {
          return fixer.replaceText(source, `'${absoluteImport}'`)
        },
      })
    }

    return {
      // oxlint-disable-next-line typescript/no-explicit-any -- oxlint does not export types for its plugin api
      ExportAllDeclaration(node: any) {
        check(node, node.source)
      },
      // oxlint-disable-next-line typescript/no-explicit-any -- oxlint does not export types for its plugin api
      ExportNamedDeclaration(node: any) {
        if (node.source != null) {
          check(node, node.source)
        }
      },
      // oxlint-disable-next-line typescript/no-explicit-any -- oxlint does not export types for its plugin api
      ImportDeclaration(node: any) {
        check(node, node.source)
      },
    }
  },
}

// oxlint-disable-next-line import/no-default-export -- oxlint loads plugins via their default export
export default {
  meta: {
    name: 'strictly',
  },
  rules: {
    'no-relative-import-paths': noRelativeImportPaths,
    'restricted-syntax': restrictedSyntax,
  },
}
