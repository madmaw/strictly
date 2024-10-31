import { UnexpectedImplementationError } from 'errors/unexpected_implementation'
import { UnreachableError } from 'errors/unreachable'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type StructuredFieldKey,
  type StructuredTypeDef,
  type StructuredTypeDefFields,
  type TypeDef,
  type TypeDefHolder,
  TypeDefType,
  type UnionKey,
  type UnionTypeDef,
} from 'types/defs'
import { type ReadonlyTypeDefOf } from 'types/defs/readonly_type_def_of'
import { type ValueTypeOf } from 'types/defs/value_type_of'
import {
  map,
  reduce,
} from 'util/record'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValueType = any

export type Copier<R> = (v: AnyValueType, t: TypeDef) => R

export function copy<
  T extends TypeDefHolder,
  R,
>(
  { typeDef }: T,
  value: ValueTypeOf<ReadonlyTypeDefOf<T>>,
  copier: Copier<R>,
): R {
  return internalCopy(
    typeDef,
    // TODO simplify types in a way where this doesn't happen
    // @ts-expect-error ignore the complaint about the infinitely deep type
    value,
    copier,
  )
}

/**
 * Creates a copy of the supplied value
 * @param def description of the object to create
 * @param value the value to populate the object from
 * @returns a copy of the supplied value
 */
function internalCopy<R>(
  typeDef: TypeDef,
  value: AnyValueType,
  copier: Copier<R>,
): R {
  switch (typeDef.type) {
    case TypeDefType.Literal:
      return copyLiteral(
        typeDef,
        value,
        copier,
      )
    case TypeDefType.List:
      return copyList(
        typeDef,
        value,
        copier,
      )
    case TypeDefType.Map:
      return copyMap(
        typeDef,
        value,
        copier,
      )
    case TypeDefType.Structured:
      return copyStruct(
        typeDef,
        value,
        copier,
      )
    case TypeDefType.Union:
      return copyUnion(
        typeDef,
        value,
        copier,
      )
    default:
      throw new UnreachableError(typeDef)
  }
}

function copyLiteral<
  R,
>(
  typeDef: LiteralTypeDef,
  value: ValueTypeOf<{ typeDef: LiteralTypeDef }>,
  copier: Copier<R>,
): R {
  // mutable and immutable literals should be the same type
  return copier(value, typeDef)
}

function copyList<
  R,
>(
  typeDef: ListTypeDef,
  arr: AnyValueType[],
  copier: Copier<R>,
): R {
  const {
    elements,
  } = typeDef
  const list = arr.map(function (value) {
    return internalCopy(elements, value, copier)
  })
  return copier(
    list,
    typeDef,
  )
}

function copyMap<
  R,
>(
  typeDef: MapTypeDef,
  value: AnyValueType,
  copier: Copier<R>,
): R {
  const {
    valueTypeDef,
  } = typeDef
  const record = map(
    value,
    function (_key, value) {
      return internalCopy(valueTypeDef, value, copier)
    },
  )
  return copier(
    record,
    typeDef,
  )
}

function copyStructFields<
  R,
  Extra extends Record<string, UnionKey>,
>(
  fields: StructuredTypeDefFields,
  value: Record<StructuredFieldKey, AnyValueType>,
  copier: Copier<R>,
  extra: Extra,
): Record<StructuredFieldKey, AnyValueType> {
  const record = reduce(fields, function (acc, key, field: TypeDef) {
    const fieldValue = value[key]
    if (fieldValue != null) {
      acc[key] = internalCopy(field, fieldValue, copier)
    }
    return acc
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  }, extra as Record<string | number | symbol, AnyValueType>)
  return record
}

function copyStruct<
  R,
>(
  typeDef: StructuredTypeDef,
  value: AnyValueType,
  copier: Copier<R>,
): R {
  const {
    fields,
  } = typeDef
  const record = copyStructFields(fields, value, copier, {})
  return copier(record, typeDef)
}

function copyUnion<
  R,
>(
  typeDef: UnionTypeDef,
  value: AnyValueType,
  copier: Copier<R>,
): R {
  const {
    discriminator,
    unions,
  } = typeDef

  // is it a `<constant1> | <constant2> | X`? We can handle that
  // a good example is when we `| null` something
  const allTypeDefs = Object.values<TypeDef>(unions)
  const variableTypeDefs = allTypeDefs.filter(function (typeDef: TypeDef) {
    // eslint-disable-next-line no-undefined
    return typeDef.type !== TypeDefType.Literal || typeDef.valuePrototype === undefined
  })
  if (variableTypeDefs.length > 1) {
    // can handle up to one non-constant value
    const targetTypeDef = allTypeDefs.find(function (typeDef) {
      return typeDef.type === TypeDefType.Literal && typeDef.valuePrototype === value
    }) || variableTypeDefs[0]
    return internalCopy(targetTypeDef, value, copier)
  }

  // is it a discriminated union with a struct?
  if (discriminator != null) {
    const discriminatorValue = value[discriminator]
    const discriminatingUnion = internalCopy(
      unions[discriminatorValue],
      value,
      copier,
    )
    return copier(discriminatingUnion, typeDef)
  }
  // oh dear!
  throw new UnexpectedImplementationError(
    'unions must specify a discriminator or be unions with literal constants to be copied',
  )
}
