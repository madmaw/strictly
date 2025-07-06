import {
  assertEqual,
  assertExists,
  assertExistsAndReturn,
  PreconditionFailedError,
  reduce,
  UnreachableError,
} from '@strictly/base'
import {
  type Type,
  type TypeDef,
  TypeDefType,
} from 'types/Type'

export function valuePathToTypePath<
  ValuePathsToTypePaths extends Record<string, string>,
  ValuePath extends keyof ValuePathsToTypePaths,
>(
  { definition: typeDef }: Type,
  valuePath: ValuePath,
  allowMissingPaths: boolean = false,
): ValuePathsToTypePaths[ValuePath] {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const valueSteps = (valuePath as string).split(/\.|\[/g)
  const parts = valueSteps[0].split(':')
  const [
    first,
    ...qualifiers
  ] = parts
  assertEqual(first, '$')

  const typeSteps = internalJsonValuePathToTypePath(
    typeDef,
    qualifiers,
    valueSteps.slice(1),
    allowMissingPaths,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    valuePath as string,
  )
  typeSteps.unshift(valueSteps[0])
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return typeSteps.join('.') as ValuePathsToTypePaths[ValuePath]
}

function internalJsonValuePathToTypePath(
  typeDef: TypeDef,
  qualifiers: string[],
  valueSteps: string[],
  allowMissingPaths: boolean,
  originalValuePath: string,
): string[] {
  if (valueSteps.length === 0) {
    return []
  }
  const [
    nextValueStepAndQualifiersString,
    ...remainingValueSteps
  ] = valueSteps
  const nextValueStepAndQualifiers = nextValueStepAndQualifiersString.split(':')
  const [
    valueStep,
    ...nextQualifiers
  ] = nextValueStepAndQualifiers
  switch (typeDef.type) {
    case TypeDefType.Literal:
      if (allowMissingPaths) {
        // fake it
        return valueSteps
      } else {
        throw new PreconditionFailedError(
          'literal should terminate path {} ({})',
          originalValuePath,
          nextValueStepAndQualifiersString,
        )
      }
    case TypeDefType.List:
      // TODO assert format of current step
      return [
        [
          '*',
          ...nextQualifiers,
        ].join(':'),
        ...internalJsonValuePathToTypePath(
          typeDef.elements,
          nextQualifiers,
          remainingValueSteps,
          allowMissingPaths,
          originalValuePath,
        ),
      ]
    case TypeDefType.Record:
      return [
        [
          '*',
          ...nextQualifiers,
        ].join(':'),
        ...internalJsonValuePathToTypePath(
          typeDef.valueTypeDef,
          nextQualifiers,
          remainingValueSteps,
          allowMissingPaths,
          originalValuePath,
        ),
      ]
    case TypeDefType.Object:
      if (allowMissingPaths) {
        if (typeDef.fields[valueStep] == null) {
          // fake it
          return valueSteps
        }
      } else {
        assertExists(typeDef.fields[valueStep], 'missing field in {} ({})', originalValuePath, valueStep)
      }
      return [
        nextValueStepAndQualifiersString,
        ...internalJsonValuePathToTypePath(
          typeDef.fields[valueStep],
          nextQualifiers,
          remainingValueSteps,
          allowMissingPaths,
          originalValuePath,
        ),
      ]
    case TypeDefType.Union:
      if (typeDef.discriminator == null) {
        if (remainingValueSteps.length > 0) {
          // find the non-literal typedef
          const union = reduce<string, TypeDef, null | TypeDef>(
            typeDef.unions,
            function (acc, _k, v) {
              if (v.type !== TypeDefType.Literal || v.type === TypeDefType.Literal && v.valuePrototype == null) {
                return v
              }
              return acc
            },
            null,
          )
          assertExists(union, 'expected a complex union {}', originalValuePath)
          return internalJsonValuePathToTypePath(
            union,
            nextQualifiers,
            valueSteps,
            allowMissingPaths,
            originalValuePath,
          )
        } else {
          // doesn't really matter
          return []
        }
      } else {
        if (qualifiers.length === 0) {
          if (allowMissingPaths) {
            return valueSteps
          } else {
            throw new PreconditionFailedError(
              'mismatched qualifiers in {} (at {})',
              originalValuePath,
              valueStep,
            )
          }
        }
        const [
          qualifier,
          ...remainingQualifiers
        ] = qualifiers
        const union = assertExistsAndReturn(typeDef.unions[qualifier], 'missing union {}', qualifier)
        return internalJsonValuePathToTypePath(
          union,
          remainingQualifiers,
          valueSteps,
          allowMissingPaths,
          originalValuePath,
        )
      }
    default:
      throw new UnreachableError(typeDef)
  }
}
