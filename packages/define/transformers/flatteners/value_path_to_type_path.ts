import {
  assertEqual,
  assertExists,
  assertExistsAndReturn,
  PreconditionFailedError,
  reduce,
  UnreachableError,
} from '@de/base'
import {
  type TypeDef,
  type TypeDefHolder,
  TypeDefType,
} from 'types/definitions'

export function valuePathToTypePath<
  JsonPaths extends Record<string, string>,
  ValuePath extends keyof JsonPaths,
>(
  { typeDef }: TypeDefHolder,
  valuePath: ValuePath,
  allowMissingPaths: boolean = false,
): JsonPaths[ValuePath] {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const valueSteps = (valuePath as string).split(/\.|\[/g)
  assertEqual(valueSteps[0], '$')

  const typeSteps = internalJsonValuePathToTypePath(
    typeDef,
    valueSteps.slice(1),
    allowMissingPaths,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    valuePath as string,
  )
  typeSteps.unshift('$')
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return typeSteps.join('.') as JsonPaths[ValuePath]
}

function internalJsonValuePathToTypePath(
  typeDef: TypeDef,
  valueSteps: string[],
  allowMissingPaths: boolean,
  originalValuePath: string,
): string[] {
  if (valueSteps.length === 0) {
    return []
  }
  const [
    valueStep,
    ...remainingValueSteps
  ] = valueSteps
  switch (typeDef.type) {
    case TypeDefType.Literal:
      if (allowMissingPaths) {
        // fake it
        return valueSteps
      } else {
        throw new PreconditionFailedError(
          'literal should terminate path {} ({})',
          originalValuePath,
          valueStep,
        )
      }
    case TypeDefType.List:
      // TODO assert format of current step
      return [
        '*',
        ...internalJsonValuePathToTypePath(
          typeDef.elements,
          remainingValueSteps,
          allowMissingPaths,
          originalValuePath,
        ),
      ]
    case TypeDefType.Map:
      return [
        '*',
        ...internalJsonValuePathToTypePath(
          typeDef.valueTypeDef,
          remainingValueSteps,
          allowMissingPaths,
          originalValuePath,
        ),
      ]
    case TypeDefType.Structured:
      if (allowMissingPaths) {
        if (typeDef.fields[valueStep] == null) {
          // fake it
          return valueSteps
        }
      } else {
        assertExists(typeDef.fields[valueStep], 'missing field in {} ({})', originalValuePath, valueStep)
      }
      return [
        valueStep,
        ...internalJsonValuePathToTypePath(
          typeDef.fields[valueStep],
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
            valueSteps,
            allowMissingPaths,
            originalValuePath,
          )
        } else {
          // doesn't really matter
          return []
        }
      } else {
        const qualifierIndex = valueStep.indexOf(':')
        if (qualifierIndex < 0) {
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
        const qualifier = valueStep.substring(0, qualifierIndex)
        const remainder = valueStep.substring(qualifierIndex + 1)
        const union = assertExistsAndReturn(typeDef.unions[qualifier], 'missing union {}', qualifier)
        const [
          typeStep,
          ...remainingTypeSteps
        ] = internalJsonValuePathToTypePath(
          union,
          [
            remainder,
            ...remainingValueSteps,
          ],
          allowMissingPaths,
          originalValuePath,
        )
        return [
          `${qualifier}:${typeStep}`,
          ...remainingTypeSteps,
        ]
      }
    default:
      throw new UnreachableError(typeDef)
  }
}
