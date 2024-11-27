import {
  reduce,
  UnreachableError,
} from '@de/base'
import {
  TypeDefType,
} from 'types/definitions'
import {
  type StrictListTypeDef,
  type StrictMapTypeDef,
  type StrictStructuredTypeDef,
  type StrictTypeDef,
  type StrictTypeDefHolder,
  type StrictUnionTypeDef,
} from 'types/strict_definitions'
import { jsonPath } from './json_path'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValueType = any

export type Mapper<R> = (t: StrictTypeDef) => R

export function flattenTypeDefTo<M, R extends Readonly<Record<string, M>>>(
  { typeDef }: StrictTypeDefHolder,
  mapper: Mapper<M>,
): R {
  const typeDefs = internalFlattenTypeDef('$', typeDef, {})
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return reduce(
    typeDefs,
    function (acc, key, typeDef) {
      acc[key] = mapper(typeDef)
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
    case TypeDefType.Map:
      return internalFlattenMapTypeDefChildren(path, t, r)
    case TypeDefType.Structured:
      return internalFlattenStructTypeDefChildren(path, qualifier, t, r)
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

function internalFlattenMapTypeDefChildren(
  path: string,
  { valueTypeDef }: StrictMapTypeDef,
  r: Record<string, StrictTypeDef>,
): Record<string, StrictTypeDef> {
  return internalFlattenTypeDef(jsonPath(path, '*'), valueTypeDef, r)
}

function internalFlattenStructTypeDefChildren(
  path: string,
  qualifier: string,
  { fields }: StrictStructuredTypeDef,
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
        path,
        discriminator != null ? `${qualifier}${key}:` : qualifier,
        typeDef,
        acc,
      )
    },
    r,
  )
}
