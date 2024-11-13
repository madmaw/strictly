import {
  type ReadonlyRecord,
  reduce,
  UnreachableError,
} from '@de/base'
import { literal } from 'types/builders'
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

export function flattenTypeDefTo<M, R extends ReadonlyRecord<string, M>>(
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
  return internalFlattenTypeDefChildren(path, t, r)
}

function internalFlattenTypeDefChildren(
  path: string,
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
      return internalFlattenStructTypeDefChildren(path, t, r)
    case TypeDefType.Union:
      return internalFlattenUnionTypeDefChildren(path, t, r)
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
  { fields }: StrictStructuredTypeDef,
  r: Record<string, StrictTypeDef>,
): Record<string, StrictTypeDef> {
  return reduce(
    fields,
    function (acc, fieldName, fieldTypeDef) {
      return internalFlattenTypeDef(jsonPath(path, fieldName), fieldTypeDef, acc)
    },
    r,
  )
}

function internalFlattenUnionTypeDefChildren(
  path: string,
  {
    discriminator,
    unions,
  }: StrictUnionTypeDef,
  r: Record<string, StrictTypeDef>,
): Record<string, StrictTypeDef> {
  if (discriminator != null) {
    // manufacture a typedef for discriminator
    r[jsonPath(path, discriminator)] = literal().typeDef /*Object.keys(unions)*/
  }
  return reduce(
    unions,
    function (acc, _key, typeDef: StrictTypeDef) {
      return internalFlattenTypeDefChildren(path, typeDef, acc)
    },
    r,
  )
}
