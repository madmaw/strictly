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
} from './Type'

export type ValueOfType<
  T,
  Extra = {},
> = T extends Type ? ValueOfTypeDef<T['definition'], Extra> : never

export type ValueOfTypeDef<
  F extends TypeDef,
  Extra = {},
> = F extends LiteralTypeDef ? ValueOfLiteralTypeDef<F>
  : F extends ListTypeDef ? ValueOfListTypeDef<F, Extra>
  : F extends RecordTypeDef ? ValueOfRecordTypeDef<F, Extra>
  : F extends ObjectTypeDef ? ValueOfObjectTypeDef<F, Extra>
  : F extends UnionTypeDef ? ValueOfUnionTypeDef<F, Extra>
  : never

type ValueOfLiteralTypeDef<F extends LiteralTypeDef> = F['valuePrototype'][number]

type ValueOfListTypeDef<F extends ListTypeDef, Extra> = IsFieldReadonly<F, 'elements'> extends true
  ? readonly ValueOfTypeDef<
    F['elements'],
    Extra
  >[] & Extra
  : ValueOfTypeDef<
    F['elements'],
    Extra
  >[] & Extra

type ValueOfRecordTypeDef<
  F extends RecordTypeDef,
  Extra,
> = undefined extends F['valueTypeDef']
  // partial
  ? IsFieldReadonly<F, 'valueTypeDef'> extends true
    // readonly
    ? {
      readonly [k in F['keyPrototype']]?: ValueOfTypeDef<F['valueTypeDef'], Extra>
    }
  : {
    [k in F['keyPrototype']]?: ValueOfTypeDef<F['valueTypeDef'], Extra>
  }
  // complete
  : IsFieldReadonly<F, 'valueTypeDef'> extends true
  // readonly
    ? {
      readonly [k in F['keyPrototype']]: ValueOfTypeDef<F['valueTypeDef'], Extra>
    }
  : {
    [k in F['keyPrototype']]: ValueOfTypeDef<F['valueTypeDef'], Extra>
  }

type ValueOfObjectTypeDef<
  F extends ObjectTypeDef,
  Extra,
> = F extends ObjectTypeDef<infer Fields> ? {
    [K in keyof Fields]: ValueOfTypeDef<
      Fields[K],
      Extra
    >
  } & Extra
  : never

type ValueOfUnionTypeDef<
  F extends UnionTypeDef,
  Extra,
> = F extends UnionTypeDef<infer D, infer U> ? D extends string ? {
      [K in keyof U]: ValueOfTypeDef<U[K], Extra> & Readonly<Record<D, K>>
    }[keyof U]
  : {
    [K in keyof U]: ValueOfTypeDef<U[K], Extra>
  }[keyof U]
  : never
