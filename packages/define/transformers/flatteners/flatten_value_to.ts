import {
  reduce,
  UnreachableError,
} from '@strictly/base'
import {
  type TypeDef,
  TypeDefType,
  type UnionTypeDef,
} from 'types/definitions'
import { type ReadonlyTypeOfType } from 'types/readonly_type_of_type'
import {
  type StrictListTypeDef,
  type StrictObjectTypeDef,
  type StrictRecordTypeDef,
  type StrictType,
  type StrictTypeDef,
  type StrictUnionTypeDef,
} from 'types/strict_definitions'
import { type ValueOfType } from 'types/value_of_type'
import { jsonPath } from './json_path'

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

export function flattenValueTo<
  T extends StrictType,
  M,
  R extends Readonly<Record<string, M>>,
>(
  { definition }: T,
  v: ValueOfType<T>,
  setter: Setter<ValueOfType<T>>,
  mapper: Mapper<M>,
  // used to maintain keys when changing lists, note that the format for a list of three elements is
  // [key1, key2, key3, nextKey]
  // the final value always contains the next key
  listIndicesToKeys: Record<string, number[]> = {},
): R {
  const r: Record<string, AnyValueType> = {}
  internalFlattenValue(
    '$',
    '$',
    definition,
    v,
    setter,
    mapper,
    r,
    listIndicesToKeys,
  )
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return r as R
}

function internalFlattenValue<M>(
  valuePath: string,
  typePath: string,
  typeDef: StrictTypeDef,
  v: AnyValueType,
  setter: Setter<AnyValueType>,
  mapper: Mapper<M>,
  r: Record<string, M>,
  listIndicesToKeys: Record<string, number[]>,
) {
  r[valuePath] = mapper(typeDef, v, setter, typePath, valuePath)
  // assume undefined means the field is optional and not populated
  // TODO: actually capture if field is optional in typedef (or in builder for creating validator)
  if (v !== undefined) {
    return internalFlattenValueChildren(valuePath, typePath, typeDef, v, mapper, r, listIndicesToKeys)
  }
  return r
}

function internalFlattenValueChildren<M>(
  valuePath: string,
  typePath: string,
  typeDef: StrictTypeDef,
  v: AnyValueType,
  mapper: Mapper<M>,
  r: Record<string, M>,
  listIndicesToKeys: Record<string, number[]>,
) {
  switch (typeDef.type) {
    case TypeDefType.Literal:
      // no children
      return r
    case TypeDefType.List:
      return internalFlattenListChildren(valuePath, typePath, typeDef, v, mapper, r, listIndicesToKeys)
    case TypeDefType.Record:
      return internalFlattenRecordChildren(valuePath, typePath, typeDef, v, mapper, r, listIndicesToKeys)
    case TypeDefType.Object:
      return internalFlattenObjectChildren(valuePath, typePath, typeDef, v, mapper, r, listIndicesToKeys)
    case TypeDefType.Union:
      return internalFlattenUnionChildren(valuePath, typePath, typeDef, v, mapper, r, listIndicesToKeys)
    default:
      throw new UnreachableError(typeDef)
  }
}

function internalFlattenListChildren<M>(
  valuePath: string,
  typePath: string,
  { elements }: StrictListTypeDef,
  v: AnyValueType[],
  mapper: Mapper<M>,
  r: Record<string, M>,
  listIndicesToKeys: Record<string, number[]>,
) {
  let indicesToKeys = listIndicesToKeys[valuePath]
  if (indicesToKeys == null) {
    indicesToKeys = [0]
    listIndicesToKeys[valuePath] = indicesToKeys
  }

  const newTypePath = jsonPath(typePath, '*')
  return v.reduce(function (r, e, index) {
    const key = indicesToKeys[index]
    // we have consumed the next id passively
    if (index === indicesToKeys.length - 1) {
      // we have consumed the next key, so we need to add a new one
      indicesToKeys.push(key + 1)
    }
    return internalFlattenValue(
      jsonPath(valuePath, key),
      newTypePath,
      elements,
      e,
      (e: AnyValueType) => {
        v[index] = e
      },
      mapper,
      r,
      listIndicesToKeys,
    )
  }, r)
}

function internalFlattenRecordChildren<M>(
  valuePath: string,
  typePath: string,
  { valueTypeDef }: StrictRecordTypeDef,
  v: Record<string, AnyValueType>,
  mapper: Mapper<M>,
  r: Record<string, M>,
  listIndicesToKeys: Record<string, number[]>,
): Record<string, M> {
  const newTypePath = jsonPath(typePath, '*')
  return reduce(
    v,
    function (r, k, value) {
      return internalFlattenValue(
        jsonPath(valuePath, k),
        newTypePath,
        valueTypeDef,
        value,
        (value: AnyValueType) => {
          v[k] = value
        },
        mapper,
        r,
        listIndicesToKeys,
      )
    },
    r,
  )
}

function internalFlattenObjectChildren<M>(
  valuePath: string,
  typePath: string,
  { fields }: StrictObjectTypeDef,
  v: Record<string, AnyValueType>,
  mapper: Mapper<M>,
  r: Record<string, M>,
  listIndicesToKeys: Record<string, number[]>,
): Record<string, M> {
  return reduce(
    fields,
    function (r, k, fieldTypeDef) {
      const fieldValue = v[k]
      return internalFlattenValue(
        jsonPath(valuePath, k),
        jsonPath(typePath, k),
        fieldTypeDef,
        fieldValue,
        (value: AnyValueType) => {
          v[k] = value
        },
        mapper,
        r,
        listIndicesToKeys,
      )
    },
    r,
  )
}

function internalFlattenUnionChildren<M>(
  valuePath: string,
  typePath: string,
  typeDef: StrictUnionTypeDef,
  v: AnyValueType,
  mapper: Mapper<M>,
  r: Record<string, M>,
  listIndicesToKeys: Record<string, number[]>,
): AnyValueType {
  const childTypeDef = getUnionTypeDef(typeDef, v)
  const qualifier = typeDef.discriminator != null ? `:${v[typeDef.discriminator]}` : ''
  return internalFlattenValueChildren(
    `${valuePath}${qualifier}`,
    `${typePath}${qualifier}`,
    childTypeDef,
    v,
    mapper,
    r,
    listIndicesToKeys,
  )
}

export function getUnionTypeDef<T extends UnionTypeDef>(
  typeDef: T,
  v: ValueOfType<ReadonlyTypeOfType<{
    definition: T,
  }>>,
) {
  if (typeDef.discriminator == null) {
    // find either a literal who's prototype we match, or assume that
    // we match the non-literal, or the literal value with no prototype, value
    return reduce<string, TypeDef, null | TypeDef>(
      typeDef.unions,
      function (acc, _k, t) {
        if (t.type === TypeDefType.Literal && t.valuePrototype) {
          if (t.valuePrototype.indexOf(v) >= 0) {
            return t
          }
        } else {
          if (acc == null) {
            return t
          }
        }
        return acc
      },
      null,
    )
  }
  return typeDef.unions[v[typeDef.discriminator]]
}
