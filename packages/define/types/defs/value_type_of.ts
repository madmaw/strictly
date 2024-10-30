import {
  type MaybePartial,
  type MaybeReadonly,
  type MaybeReadonlyArray,
} from 'types/lang'
import { type ReadonlyRecord } from 'util/record'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  type UnionTypeDef,
} from '.'

export type ValueTypeOf<
  T,
  Extra = {},
> = T extends TypeDefHolder ? InternalValueTypeOf<T['typeDef'], Extra> : never

export type InternalValueTypeOf<
  F extends TypeDef,
  Extra,
> = F extends LiteralTypeDef ? InternalValueTypeOfLiteral<F>
  : F extends ListTypeDef ? InternalValueTypeOfList<F, Extra>
  : F extends MapTypeDef ? InternalValueTypeOfMap<F, Extra>
  : F extends StructuredTypeDef ? InternalValueTypeOfStruct<F, Extra>
  : F extends UnionTypeDef ? InternalValueTypeOfUnion<F, Extra>
  : never

type InternalValueTypeOfLiteral<F extends LiteralTypeDef> = F['valuePrototype']

type InternalValueTypeOfList<F extends ListTypeDef, Extra> = MaybeReadonlyArray<
  InternalValueTypeOf<F['elements'], Extra>,
  F['readonly']
> & Extra

type InternalValueTypeOfMap<
  F extends MapTypeDef,
  Extra,
> = MaybeReadonly<
  MaybePartial<
    Record<
      F['keyPrototype'],
      InternalValueTypeOf<
        Exclude<F['valueTypeDef'], undefined>,
        Extra
      >
    >,
    // yes, this is necessary
    undefined extends F['valueTypeDef'] ? true : false
  >,
  F['readonly']
> & Extra

type InternalValueTypeOfStruct<
  F extends StructuredTypeDef,
  Extra,
> = F extends StructuredTypeDef<infer Fields> ? {
    [K in keyof Fields]: InternalValueTypeOf<
      Fields[K],
      Extra
    >
  } & Extra
  : never

type InternalValueTypeOfUnion<
  F extends UnionTypeDef,
  Extra,
> = F extends UnionTypeDef<infer D, infer U> ? D extends string ? {
      [K in keyof U]: InternalValueTypeOf<U[K], Extra> & ReadonlyRecord<D, K>
    }[keyof U]
  : {
    [K in keyof U]: InternalValueTypeOf<U[K], Extra>
  }[keyof U]
  : never
