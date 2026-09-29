import {
  assertEqual,
  assertExists,
  assertExistsAndReturn,
  lookup,
  PreconditionFailedError,
  UnreachableError,
} from '@strictly/base'
import {
  nodeOf,
  optionsByDiscriminatorOf,
  type SchemaNode,
  variableOptionOf,
} from 'types/node'
import { type Type } from 'types/Type'

export function valuePathToTypePath<
  ValuePathsToTypePaths extends Record<string, string>,
  ValuePath extends keyof ValuePathsToTypePaths,
>(
  t: Type,
  valuePath: ValuePath,
  allowMissingPaths = false,
): ValuePathsToTypePaths[ValuePath] {
  const valueSteps = (valuePath as string).split(/\.|\[/g)
  const parts = valueSteps[0].split(':')
  const [first, ...qualifiers] = parts
  assertEqual(first, '$')

  const typeSteps = internalJsonValuePathToTypePath(
    nodeOf(t),
    qualifiers,
    valueSteps.slice(1),
    allowMissingPaths,
    valuePath as string,
  )
  typeSteps.unshift(valueSteps[0])
  return typeSteps.join('.') as ValuePathsToTypePaths[ValuePath]
}

function internalJsonValuePathToTypePath(
  node: SchemaNode,
  qualifiers: string[],
  valueSteps: string[],
  allowMissingPaths: boolean,
  originalValuePath: string,
): string[] {
  if (valueSteps.length === 0) {
    return []
  }
  const [nextValueStepAndQualifiersString, ...remainingValueSteps] = valueSteps
  const nextValueStepAndQualifiers = nextValueStepAndQualifiersString.split(':')
  const [valueStep, ...nextQualifiers] = nextValueStepAndQualifiers
  switch (node.kind) {
    case 'literal':
      if (allowMissingPaths) {
        // fake it
        return valueSteps
      }
      throw new PreconditionFailedError(
        'literal should terminate path {} ({})',
        originalValuePath,
        nextValueStepAndQualifiersString,
      )
    case 'wrapper':
      return internalJsonValuePathToTypePath(
        nodeOf(node.inner),
        qualifiers,
        valueSteps,
        allowMissingPaths,
        originalValuePath,
      )
    case 'list':
      // TODO assert format of current step
      return [
        ['*', ...nextQualifiers].join(':'),
        ...internalJsonValuePathToTypePath(
          nodeOf(node.element),
          nextQualifiers,
          remainingValueSteps,
          allowMissingPaths,
          originalValuePath,
        ),
      ]
    case 'record':
      return [
        ['*', ...nextQualifiers].join(':'),
        ...internalJsonValuePathToTypePath(
          nodeOf(node.value),
          nextQualifiers,
          remainingValueSteps,
          allowMissingPaths,
          originalValuePath,
        ),
      ]
    case 'object': {
      const field = lookup<string, Type>(node.fields, valueStep)
      if (allowMissingPaths) {
        if (field == null) {
          // fake it
          return valueSteps
        }
      } else {
        assertExists(
          field,
          'missing field in {} ({})',
          originalValuePath,
          valueStep,
        )
      }
      return [
        nextValueStepAndQualifiersString,
        ...internalJsonValuePathToTypePath(
          nodeOf(field),
          nextQualifiers,
          remainingValueSteps,
          allowMissingPaths,
          originalValuePath,
        ),
      ]
    }
    case 'union':
      if (node.discriminator == null) {
        if (remainingValueSteps.length > 0) {
          const option = variableOptionOf(node)
          assertExists(option, 'expected a complex union {}', originalValuePath)
          return internalJsonValuePathToTypePath(
            nodeOf(option),
            nextQualifiers,
            valueSteps,
            allowMissingPaths,
            originalValuePath,
          )
        }
        // doesn't really matter
        return []
      }
      if (qualifiers.length === 0) {
        if (allowMissingPaths) {
          return valueSteps
        }
        throw new PreconditionFailedError(
          'mismatched qualifiers in {} (at {})',
          originalValuePath,
          valueStep,
        )
      }
      {
        const [qualifier, ...remainingQualifiers] = qualifiers
        const option = assertExistsAndReturn(
          optionsByDiscriminatorOf(node)[qualifier],
          'missing union {}',
          qualifier,
        )
        return internalJsonValuePathToTypePath(
          nodeOf(option),
          remainingQualifiers,
          valueSteps,
          allowMissingPaths,
          originalValuePath,
        )
      }
    default:
      throw new UnreachableError(node)
  }
}
