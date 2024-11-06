import {
  checkUnary,
  type ReadonlyRecord,
  reduce,
  UnreachableError,
} from '@de/base'
import { string } from 'types/builders'
import {
  type TypeDef,
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
import { type ValueTypeOf } from 'types/value_type_of'
import { jsonPath } from './json_path'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValueType = any

export type Mapper<R> = (v: AnyValueType, t: StrictTypeDef) => R

export function flattenValue<
  T extends StrictTypeDefHolder,
  M,
  R extends ReadonlyRecord<string, M>,
>(
  { typeDef }: T,
  v: ValueTypeOf<T>,
  mapper: Mapper<M>,
): R {
  const r: Record<string, AnyValueType> = {}
  internalFlattenValue('$', typeDef, v, mapper, r)
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return r as R
}

function internalFlattenValue<M>(
  path: string,
  typeDef: StrictTypeDef,
  v: AnyValueType,
  mapper: Mapper<M>,
  r: Record<string, M>,
) {
  r[path] = mapper(v, typeDef)
  switch (typeDef.type) {
    case TypeDefType.Literal:
      // no children
      return r
    case TypeDefType.List:
      return internalFlattenListChildren(path, typeDef, v, mapper, r)
    case TypeDefType.Map:
      return internalFlattenMapChildren(path, typeDef, v, mapper, r)
    case TypeDefType.Structured:
      return internalFlattenStructChildren(path, typeDef, v, mapper, r)
    case TypeDefType.Union:
      return internalFlattenUnionChildren(path, typeDef, v, mapper, r)
    default:
      throw new UnreachableError(typeDef)
  }
}

function internalFlattenListChildren<M>(
  path: string,
  { elements }: StrictListTypeDef,
  v: AnyValueType[],
  mapper: Mapper<M>,
  r: Record<string, M>,
) {
  return v.reduce(function (r, e, i) {
    return internalFlattenValue(jsonPath(path, i), elements, e, mapper, r)
  }, r)
}

function internalFlattenMapChildren<M>(
  path: string,
  { valueTypeDef }: StrictMapTypeDef,
  v: Record<string, AnyValueType>,
  mapper: Mapper<M>,
  r: Record<string, M>,
): Record<string, M> {
  return reduce(
    v,
    function (r, k, v) {
      return internalFlattenValue(jsonPath(path, k), valueTypeDef, v, mapper, r)
    },
    r,
  )
}

function internalFlattenStructChildren<M>(
  path: string,
  { fields }: StrictStructuredTypeDef,
  v: Record<string, AnyValueType>,
  mapper: Mapper<M>,
  r: Record<string, M>,
): Record<string, M> {
  return reduce(
    fields,
    function (r, k, fieldTypeDef) {
      const fieldValue = v[k]
      return internalFlattenValue(jsonPath(path, k), fieldTypeDef, fieldValue, mapper, r)
    },
    r,
  )
}

function internalFlattenUnionChildren<M>(
  path: string,
  {
    unions,
    discriminator,
  }: StrictUnionTypeDef,
  v: AnyValueType,
  mapper: Mapper<M>,
  r: Record<string, M>,
): AnyValueType {
  if (discriminator == null) {
    const found = reduce(
      unions,
      function (found, _k, typeDef: StrictTypeDef) {
        if (
          !found
          && typeDef.type === TypeDefType.Literal
          && typeDef.valuePrototype != null
          && typeDef.valuePrototype.indexOf(v) >= 0
        ) {
          internalFlattenValue(path, typeDef, v, mapper, r)
          return true
        }
        return false
      },
      false,
    )
    if (!found) {
      const complexUnions = Object.values(unions).filter(function (u: TypeDef) {
        return u.type !== TypeDefType.Literal
      })
      const complexUnion = checkUnary(
        complexUnions,
        'expected 1 complex union type, received {}',
        complexUnions.length,
      )
      internalFlattenValue(
        path,
        complexUnion,
        v,
        mapper,
        r,
      )
    }
    return r
  } else {
    const discriminatorValue = v[discriminator]
    // manufacture a typedef for discriminator
    r[jsonPath(path, discriminator)] = mapper(discriminatorValue, string.typeDef)
    return internalFlattenValue(
      path,
      unions[discriminatorValue],
      v,
      mapper,
      r,
    )
  }
}
