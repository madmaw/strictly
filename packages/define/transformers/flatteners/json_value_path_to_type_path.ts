import {
  assertEqual,
  assertExists,
  assertExistsAndReturn,
  assertIs,
  assertState,
  reduce,
  UnreachableError,
} from '@de/base'
import {
  type LiteralTypeDef,
  type TypeDef,
  type TypeDefHolder,
  TypeDefType,
} from 'types/definitions'

export function jsonValuePathToTypePath<
  JsonPaths extends Record<string, string>,
  ValuePath extends keyof JsonPaths,
>(
  { typeDef }: TypeDefHolder,
  valuePath: ValuePath,
): JsonPaths[ValuePath] {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const valueSteps = (valuePath as string).split(/\.|\[/g)
  assertEqual(valueSteps[0], '$')

  const typeSteps = internalJsonValuePathToTypePath(
    typeDef,
    valueSteps.slice(1),
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
  originalValuePath: string,
): string[] {
  if (valueSteps.length === 0) {
    return []
  }
  const [
    valueStep,
    ...remainingValueSteps
  ] = valueSteps
  assertIs<TypeDef, Exclude<TypeDef, LiteralTypeDef>>(
    typeDef,
    function (v: TypeDef) {
      return v.type !== TypeDefType.Literal
    },
    'literal should terminate path {} ({})',
    originalValuePath,
    valueStep,
  )
  switch (typeDef.type) {
    case TypeDefType.List:
      // TODO assert format of current step
      return [
        '*',
        ...internalJsonValuePathToTypePath(
          typeDef.elements,
          remainingValueSteps,
          originalValuePath,
        ),
      ]
    case TypeDefType.Map:
      return [
        '*',
        ...internalJsonValuePathToTypePath(
          typeDef.valueTypeDef,
          remainingValueSteps,
          originalValuePath,
        ),
      ]
    case TypeDefType.Structured:
      return [
        valueStep,
        ...internalJsonValuePathToTypePath(
          assertExistsAndReturn(typeDef.fields[valueStep], 'missing field in {} ({})', originalValuePath, valueStep),
          remainingValueSteps,
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
            originalValuePath,
          )
        } else {
          // doesn't really matter
          return []
        }
      } else {
        const qualifierIndex = valueStep.indexOf(':')
        assertState(qualifierIndex >= 0, 'mismatched qualifiers in {} (at {})', originalValuePath, valueStep)
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
