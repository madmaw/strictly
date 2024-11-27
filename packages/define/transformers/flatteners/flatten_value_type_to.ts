import {
  reduce,
  UnreachableError,
} from '@de/base'
import {
  type TypeDef,
  TypeDefType,
  type UnionTypeDef,
} from 'types/definitions'
import { type ReadonlyTypeDefOf } from 'types/readonly_type_def_of'
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
export type Setter<V> = (v: V) => void

export type Mapper<R> = (
  t: StrictTypeDef,
  v: AnyValueType,
  setter: Setter<AnyValueType>,
  typePath: string,
  valuePath: string,
) => R

export function flattenValueTypeTo<
  T extends StrictTypeDefHolder,
  M,
  R extends Readonly<Record<string, M>>,
>(
  { typeDef }: T,
  v: ValueTypeOf<T>,
  setter: Setter<ValueTypeOf<T>>,
  mapper: Mapper<M>,
): R {
  const r: Record<string, AnyValueType> = {}
  internalFlattenValue(
    '$',
    '$',
    typeDef,
    v,
    setter,
    mapper,
    r,
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
) {
  r[valuePath] = mapper(typeDef, v, setter, typePath, valuePath)
  return internalFlattenValueChildren(valuePath, typePath, '', typeDef, v, mapper, r)
}

function internalFlattenValueChildren<M>(
  valuePath: string,
  typePath: string,
  qualifier: string,
  typeDef: StrictTypeDef,
  v: AnyValueType,
  mapper: Mapper<M>,
  r: Record<string, M>,
) {
  switch (typeDef.type) {
    case TypeDefType.Literal:
      // no children
      return r
    case TypeDefType.List:
      return internalFlattenListChildren(valuePath, typePath, typeDef, v, mapper, r)
    case TypeDefType.Map:
      return internalFlattenMapChildren(valuePath, typePath, typeDef, v, mapper, r)
    case TypeDefType.Structured:
      return internalFlattenStructChildren(valuePath, typePath, qualifier, typeDef, v, mapper, r)
    case TypeDefType.Union:
      return internalFlattenUnionChildren(valuePath, typePath, qualifier, typeDef, v, mapper, r)
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
) {
  const newTypePath = jsonPath(typePath, '*')
  return v.reduce(function (r, e, i) {
    return internalFlattenValue(
      jsonPath(valuePath, i),
      newTypePath,
      elements,
      e,
      (e: AnyValueType) => {
        v[i] = e
      },
      mapper,
      r,
    )
  }, r)
}

function internalFlattenMapChildren<M>(
  valuePath: string,
  typePath: string,
  { valueTypeDef }: StrictMapTypeDef,
  v: Record<string, AnyValueType>,
  mapper: Mapper<M>,
  r: Record<string, M>,
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
      )
    },
    r,
  )
}

function internalFlattenStructChildren<M>(
  valuePath: string,
  typePath: string,
  qualifier: string,
  { fields }: StrictStructuredTypeDef,
  v: Record<string, AnyValueType>,
  mapper: Mapper<M>,
  r: Record<string, M>,
): Record<string, M> {
  return reduce(
    fields,
    function (r, k, fieldTypeDef) {
      const fieldValue = v[k]
      return internalFlattenValue(
        jsonPath(valuePath, k, qualifier),
        jsonPath(typePath, k, qualifier),
        fieldTypeDef,
        fieldValue,
        (value: AnyValueType) => {
          v[k] = value
        },
        mapper,
        r,
      )
    },
    r,
  )
}

function internalFlattenUnionChildren<M>(
  valuePath: string,
  typePath: string,
  qualifier: string,
  typeDef: StrictUnionTypeDef,
  v: AnyValueType,
  mapper: Mapper<M>,
  r: Record<string, M>,
): AnyValueType {
  const childTypeDef = getUnionTypeDef(typeDef, v)
  const newQualifier = typeDef.discriminator != null ? `${qualifier}${v[typeDef.discriminator]}:` : qualifier
  return internalFlattenValueChildren(
    valuePath,
    typePath,
    newQualifier,
    childTypeDef,
    v,
    mapper,
    r,
  )
  // const {
  //   unions,
  //   discriminator,
  // } = typeDef
  // if (discriminator == null) {
  //   const found = reduce(
  //     unions,
  //     function (found, _k, typeDef: StrictTypeDef) {
  //       if (
  //         !found
  //         && typeDef.type === TypeDefType.Literal
  //         && typeDef.valuePrototype != null
  //         && typeDef.valuePrototype.indexOf(v) >= 0
  //       ) {
  //         internalFlattenValueChildren(valuePath, typePath, qualifier, typeDef, v, mapper, r)
  //         return true
  //       }
  //       return false
  //     },
  //     false,
  //   )
  //   if (!found) {
  //     const complexUnions = Object.values(unions).filter(function (u: TypeDef) {
  //       return u.type !== TypeDefType.Literal
  //     })
  //     const complexUnion = checkUnary(
  //       complexUnions,
  //       'expected 1 complex union type, received {}',
  //       complexUnions.length,
  //     )
  //     internalFlattenValueChildren(
  //       valuePath,
  //       typePath,
  //       qualifier,
  //       complexUnion,
  //       v,
  //       mapper,
  //       r,
  //     )
  //   }
  //   return r
  // } else {
  //   const discriminatorValue = v[discriminator]
  //   return internalFlattenValueChildren(
  //     valuePath,
  //     typePath,
  //     `${qualifier}${discriminatorValue}:`,
  //     unions[discriminatorValue],
  //     v,
  //     mapper,
  //     r,
  //   )
  // }
}

export function getUnionTypeDef<T extends UnionTypeDef>(
  typeDef: T,
  v: ValueTypeOf<ReadonlyTypeDefOf<{
    typeDef: T,
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
