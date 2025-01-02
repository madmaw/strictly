import {
  type IsFieldReadonly,
} from '@strictly/base'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type ObjectTypeDef,
  type RecordTypeDef,
  type Type,
  type TypeDef,
  type UnionTypeDef,
} from './definitions'

export type ValueOfType<
  T,
  Extra = {},
> = T extends Type ? InternalValueTypeOf<T['definition'], Extra> : never

export type InternalValueTypeOf<
  F extends TypeDef,
  Extra,
> = F extends LiteralTypeDef ? InternalValueTypeOfLiteral<F>
  : F extends ListTypeDef ? InternalValueTypeOfList<F, Extra>
  : F extends RecordTypeDef ? InternalValueTypeOfRecord<F, Extra>
  : F extends ObjectTypeDef ? InternalValueTypeOfObject<F, Extra>
  : F extends UnionTypeDef ? InternalValueTypeOfUnion<F, Extra>
  : never

type InternalValueTypeOfLiteral<F extends LiteralTypeDef> = F['valuePrototype'][number]

type InternalValueTypeOfList<F extends ListTypeDef, Extra> = IsFieldReadonly<F, 'elements'> extends true
  ? readonly InternalValueTypeOf<
    F['elements'],
    Extra
  >[] & Extra
  : InternalValueTypeOf<
    F['elements'],
    Extra
  >[] & Extra

type InternalValueTypeOfRecord<
  F extends RecordTypeDef,
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

type InternalValueTypeOfObject<
  F extends ObjectTypeDef,
  Extra,
> = F extends ObjectTypeDef<infer Fields> ? {
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
      [K in keyof U]: InternalValueTypeOf<U[K], Extra> & Readonly<Record<D, K>>
    }[keyof U]
  : {
    [K in keyof U]: InternalValueTypeOf<U[K], Extra>
  }[keyof U]
  : never
