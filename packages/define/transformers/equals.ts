import {
  UnreachableError,
} from '@strictly/base'
import {
  type ListTypeDef,
  type ObjectTypeDef,
  type RecordTypeDef,
  type Type,
  type TypeDef,
  TypeDefType,
  type UnionTypeDef,
} from 'types/Definitions'
import { type ValueOfType } from 'types/ValueOfType'

export function equals<T extends Type>({ definition }: T, o1: ValueOfType<T>, o2: ValueOfType<T>): boolean {
  return internalEquals(definition, o1, o2)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function internalEquals(typeDef: TypeDef, o1: any, o2: any): boolean {
  // get rid of optional values
  if (o1 === o2) {
    return true
  }
  if (o1 == null && o2 != null || o1 != null && o2 == null) {
    return false
  }
  switch (typeDef.type) {
    case TypeDefType.Literal:
      return o1 === o2
    case TypeDefType.List:
      return internalListEquals(typeDef, o1, o2)
    case TypeDefType.Record:
      return internalRecordEquals(typeDef, o1, o2)
    case TypeDefType.Object:
      return internalObjectEquals(typeDef, o1, o2)
    case TypeDefType.Union:
      return internalUnionEquals(typeDef, o1, o2)
    default:
      throw new UnreachableError(typeDef)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function internalListEquals({ elements }: ListTypeDef, o1: any[], o2: any[]) {
  return o1.length === o2.length && o1.every((v, i) => internalEquals(elements, v, o2[i]))
}

function internalRecordEquals(
  {
    valueTypeDef,
  }: RecordTypeDef,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o1: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o2: Record<string, any>,
) {
  const k1s = Object.keys(o1).sort()
  const k2s = Object.keys(o2).sort()
  return k1s.length === k2s.length && k1s.every((k1, i) => {
    const k2 = k2s[i]
    return k1 === k2 && internalEquals(valueTypeDef, o1[k1], o2[k2])
  })
}

function internalObjectEquals(
  {
    fields,
  }: ObjectTypeDef,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o1: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o2: Record<string, any>,
) {
  return Object.entries(fields).every(([
    key,
    typeDef,
  ]) => {
    return internalEquals(typeDef, o1[key], o2[key])
  })
}

function internalUnionEquals(
  {
    discriminator,
    unions,
  }: UnionTypeDef,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o1: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o2: any,
) {
  if (discriminator != null) {
    return o1[discriminator] === o2[discriminator] && internalEquals(unions[o1[discriminator]], o1, o2)
  }
  const allTypeDefs = Object.values<TypeDef>(unions)
  const variableTypeDefs = allTypeDefs.filter(function (typeDef: TypeDef) {
    return typeDef.type !== TypeDefType.Literal || typeDef.valuePrototype == null
  })
  return o1 === o2 || variableTypeDefs.length === 1 && internalEquals(variableTypeDefs[0], o1, o2)
}
