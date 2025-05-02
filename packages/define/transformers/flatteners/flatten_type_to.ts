import {
  reduce,
  UnreachableError,
} from '@strictly/base'
import {
  TypeDefType,
} from 'types/definitions'
import {
  type StrictListTypeDef,
  type StrictObjectTypeDef,
  type StrictRecordTypeDef,
  type StrictType,
  type StrictTypeDef,
  type StrictUnionTypeDef,
} from 'types/strict_definitions'
import { jsonPath } from './json_path'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValueType = any

export type Mapper<R> = (t: StrictTypeDef, key: string) => R

export function flattenTypeTo<M, R extends Readonly<Record<string, M>>>(
  { definition }: StrictType,
  mapper: Mapper<M>,
): R {
  const typeDefs = internalFlattenTypeDef('$', definition, {})
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return reduce(
    typeDefs,
    function (acc, key, typeDef) {
      acc[key] = mapper(typeDef, key)
      return acc
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as Record<string, M>,
  ) as R
}

function internalFlattenTypeDef(
  path: string,
  t: StrictTypeDef,
  r: Record<string, StrictTypeDef>,
): Record<string, StrictTypeDef> {
  r[path] = t
  return internalFlattenTypeDefChildren(path, '', t, r)
}

function internalFlattenTypeDefChildren(
  path: string,
  qualifier: string,
  t: StrictTypeDef,
  r: Record<string, StrictTypeDef>,
): Record<string, StrictTypeDef> {
  switch (t.type) {
    case TypeDefType.Literal:
      return r
    case TypeDefType.List:
      return internalFlattenedListTypeDefChildren(path, t, r)
    case TypeDefType.Record:
      return internalFlattenRecordTypeDefChildren(path, t, r)
    case TypeDefType.Object:
      return internalFlattenObjectTypeDefChildren(path, qualifier, t, r)
    case TypeDefType.Union:
      return internalFlattenUnionTypeDefChildren(path, qualifier, t, r)
    default:
      throw new UnreachableError(t)
  }
}

function internalFlattenedListTypeDefChildren(
  path: string,
  { elements }: StrictListTypeDef,
  r: Record<string, StrictTypeDef>,
): Record<string, StrictTypeDef> {
  return internalFlattenTypeDef(jsonPath(path, '*'), elements, r)
}

function internalFlattenRecordTypeDefChildren(
  path: string,
  { valueTypeDef }: StrictRecordTypeDef,
  r: Record<string, StrictTypeDef>,
): Record<string, StrictTypeDef> {
  return internalFlattenTypeDef(jsonPath(path, '*'), valueTypeDef, r)
}

function internalFlattenObjectTypeDefChildren(
  path: string,
  qualifier: string,
  { fields }: StrictObjectTypeDef,
  r: Record<string, StrictTypeDef>,
): Record<string, StrictTypeDef> {
  return reduce(
    fields,
    function (acc, fieldName, fieldTypeDef) {
      return internalFlattenTypeDef(
        jsonPath(path, fieldName, qualifier),
        fieldTypeDef,
        acc,
      )
    },
    r,
  )
}

function internalFlattenUnionTypeDefChildren(
  path: string,
  qualifier: string,
  {
    discriminator,
    unions,
  }: StrictUnionTypeDef,
  r: Record<string, StrictTypeDef>,
): Record<string, StrictTypeDef> {
  return reduce(
    unions,
    function (acc, key, typeDef: StrictTypeDef) {
      return internalFlattenTypeDefChildren(
        discriminator != null ? `${path}:${qualifier}` : path,
        key,
        typeDef,
        acc,
      )
    },
    r,
  )
}
