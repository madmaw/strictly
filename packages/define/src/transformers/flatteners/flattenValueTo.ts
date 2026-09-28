import { lookup, reduce, UnreachableError } from '@strictly/base'
import { type ReadonlyTypeOfType } from 'types/ReadonlyTypeOfType'
import {
  type StrictListTypeDef,
  type StrictObjectTypeDef,
  type StrictRecordTypeDef,
  type StrictType,
  type StrictTypeDef,
  type StrictUnionTypeDef,
} from 'types/StrictType'
import { type TypeDef, TypeDefType, type UnionTypeDef } from 'types/Type'
import { type ValueOfType } from 'types/ValueOfType'
import { valuePrototypeOf } from 'types/valuePrototypeOf'
import { jsonPath } from './jsonPath'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValueType = any
export type Setter<V> = (v: V) => void

export type Mapper<R> = (
  t: StrictTypeDef,
  v: AnyValueType,
  setter: Setter<AnyValueType>,
  typePath: string,
  valuePath: string,
) => R

type FlattenContext<M> = {
  readonly mapper: Mapper<M>
  readonly r: Record<string, M>
  readonly listIndicesToKeys: Record<string, number[]>
}

export function flattenValueTo<
  T extends StrictType,
  M,
  R extends Readonly<Record<string, M>>,
>(
  { definition }: T,
  v: ValueOfType<ReadonlyTypeOfType<T>>,
  setter: Setter<ValueOfType<T>>,
  mapper: Mapper<M>,
  // used to maintain keys when changing lists, note that the format for a list of three elements is
  // [key1, key2, key3, nextKey]
  // the final value always contains the next key
  listIndicesToKeys: Record<string, number[]> = {},
): R {
  const r: Record<string, AnyValueType> = {}
  internalFlattenValue('$', '$', definition, v, setter, {
    mapper,
    r,
    listIndicesToKeys,
  })
  return r as R
}

function internalFlattenValue<M>(
  valuePath: string,
  typePath: string,
  typeDef: StrictTypeDef,
  v: AnyValueType,
  setter: Setter<AnyValueType>,
  context: FlattenContext<M>,
) {
  context.r[valuePath] = context.mapper(typeDef, v, setter, typePath, valuePath)
  // assume undefined means the field is optional and not populated
  // TODO: actually capture if field is optional in typedef (or in builder for creating validator)
  if (v != null) {
    internalFlattenValueChildren(valuePath, typePath, typeDef, v, context)
  }
}

function internalFlattenValueChildren<M>(
  valuePath: string,
  typePath: string,
  typeDef: StrictTypeDef,
  v: AnyValueType,
  context: FlattenContext<M>,
) {
  switch (typeDef.type) {
    case TypeDefType.Literal:
      // no children
      break
    case TypeDefType.List:
      internalFlattenListChildren(valuePath, typePath, typeDef, v, context)
      break
    case TypeDefType.Record:
      internalFlattenRecordChildren(valuePath, typePath, typeDef, v, context)
      break
    case TypeDefType.Object:
      internalFlattenObjectChildren(valuePath, typePath, typeDef, v, context)
      break
    case TypeDefType.Union:
      internalFlattenUnionChildren(valuePath, typePath, typeDef, v, context)
      break
    default:
      throw new UnreachableError(typeDef)
  }
}

function internalFlattenListChildren<M>(
  valuePath: string,
  typePath: string,
  { elements }: StrictListTypeDef,
  v: AnyValueType[],
  context: FlattenContext<M>,
) {
  const { listIndicesToKeys } = context
  let indicesToKeys = lookup(listIndicesToKeys, valuePath)
  if (indicesToKeys == null) {
    indicesToKeys = [0]
    listIndicesToKeys[valuePath] = indicesToKeys
  }
  const keys = indicesToKeys

  const newTypePath = jsonPath(typePath, '*')
  v.forEach((e, index) => {
    const key = keys[index]
    // we have consumed the next id passively
    if (index === keys.length - 1) {
      // we have consumed the next key, so we need to add a new one
      keys.push(key + 1)
    }
    internalFlattenValue(
      jsonPath(valuePath, key),
      newTypePath,
      elements,
      e,
      (e: AnyValueType) => {
        v[index] = e
      },
      context,
    )
  })
}

function internalFlattenRecordChildren<M>(
  valuePath: string,
  typePath: string,
  { valueTypeDef }: StrictRecordTypeDef,
  v: Record<string, AnyValueType>,
  context: FlattenContext<M>,
) {
  const newTypePath = jsonPath(typePath, '*')
  Object.keys(v).forEach((k) => {
    internalFlattenValue(
      jsonPath(valuePath, k),
      newTypePath,
      valueTypeDef,
      v[k],
      (value: AnyValueType) => {
        v[k] = value
      },
      context,
    )
  })
}

function internalFlattenObjectChildren<M>(
  valuePath: string,
  typePath: string,
  { fields }: StrictObjectTypeDef,
  v: Record<string, AnyValueType>,
  context: FlattenContext<M>,
) {
  Object.keys(fields).forEach((k) => {
    const fieldTypeDef = fields[k]
    const fieldValue = v[k]
    internalFlattenValue(
      jsonPath(valuePath, k),
      jsonPath(typePath, k),
      fieldTypeDef,
      fieldValue,
      (value: AnyValueType) => {
        v[k] = value
      },
      context,
    )
  })
}

function internalFlattenUnionChildren<M>(
  valuePath: string,
  typePath: string,
  typeDef: StrictUnionTypeDef,
  v: AnyValueType,
  context: FlattenContext<M>,
) {
  const childTypeDef = getUnionTypeDef(typeDef, v)
  const qualifier =
    typeDef.discriminator == null ? '' : `:${v[typeDef.discriminator]}`
  internalFlattenValueChildren(
    `${valuePath}${qualifier}`,
    `${typePath}${qualifier}`,
    childTypeDef,
    v,
    context,
  )
}

export function getUnionTypeDef<T extends UnionTypeDef>(
  typeDef: T,
  v: ValueOfType<
    ReadonlyTypeOfType<{
      definition: T
    }>
  >,
) {
  if (typeDef.discriminator == null) {
    // find either a literal who's prototype we match, or assume that
    // we match the non-literal, or the literal value with no prototype, value
    return reduce<string, TypeDef, null | TypeDef>(
      typeDef.unions,
      (acc, _k, t) => {
        const valuePrototype =
          t.type === TypeDefType.Literal ? valuePrototypeOf(t) : null
        if (valuePrototype == null) {
          if (acc == null) {
            return t
          }
        } else if (valuePrototype.includes(v)) {
          return t
        }
        return acc
      },
      null,
    )
  }
  return typeDef.unions[v[typeDef.discriminator]]
}
