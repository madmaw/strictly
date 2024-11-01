import {
  type IsFieldReadonly,
  type ReadonlyRecord,
} from '@de/base'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  type UnionTypeDef,
} from './definitions'

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

type InternalValueTypeOfList<F extends ListTypeDef, Extra> = IsFieldReadonly<F, 'elements'> extends true
  ? readonly InternalValueTypeOf<
    F['elements'],
    Extra
  >[] & Extra
  : InternalValueTypeOf<
    F['elements'],
    Extra
  >[] & Extra

type InternalValueTypeOfMap<
  F extends MapTypeDef,
  Extra,
> = undefined extends F['valueTypeDef']
  // partial
  ? IsFieldReadonly<F, 'valueTypeDef'> extends true
    // readonly
    ? {
      readonly [k in F['keyPrototype']]?: InternalValueTypeOf<F['valueTypeDef'], Extra>
    }
  : {
    [k in F['keyPrototype']]?: InternalValueTypeOf<F['valueTypeDef'], Extra>
  }
  // complete
  : IsFieldReadonly<F, 'valueTypeDef'> extends true
  // readonly
    ? {
      readonly [k in F['keyPrototype']]: InternalValueTypeOf<F['valueTypeDef'], Extra>
    }
  : {
    [k in F['keyPrototype']]: InternalValueTypeOf<F['valueTypeDef'], Extra>
  }

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
