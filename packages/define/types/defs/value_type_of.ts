import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type NullableTypeDef,
  type PartialTypeDef,
  type ReadonlyTypeDef,
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
  : F extends NullableTypeDef ? InternalValueTypeOfNullable<F, Extra>
  : F extends ListTypeDef ? InternalValueTypeOfList<F, Extra>
  : F extends MapTypeDef ? InternalValueTypeOfMap<F, Extra>
  : F extends ReadonlyTypeDef ? InternalValueTypeOfReadonly<F, Extra>
  : F extends PartialTypeDef ? InternalValueTypeOfPartial<F, Extra>
  : F extends StructuredTypeDef ? InternalValueTypeOfStruct<F, Extra>
  : F extends UnionTypeDef ? InternalValueTypeOfUnion<F, Extra>
  : never

type InternalValueTypeOfLiteral<F extends LiteralTypeDef> = F['valuePrototype']

type InternalValueTypeOfNullable<
  F extends NullableTypeDef,
  Extra,
> = InternalValueTypeOf<F['toNullableTypeDef'], Extra> | null

type InternalValueTypeOfList<F extends ListTypeDef, Extra> = InternalValueTypeOf<F['elements'], Extra>[] & Extra

type InternalValueTypeOfMap<
  F extends MapTypeDef,
  Extra,
> = Record<
  F['keyPrototype'],
  InternalValueTypeOf<
    F['valueTypeDef'],
    Extra
  >
> & Extra

type InternalValueTypeOfReadonly<F extends ReadonlyTypeDef, Extra> = Readonly<
  InternalValueTypeOf<F['toReadonlyTypeDef'], Extra>
>

type InternalValueTypeOfPartial<F extends PartialTypeDef, Extra> = Partial<
  InternalValueTypeOf<F['toPartialTypeDef'], Extra>
>

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
> = F extends UnionTypeDef<infer U> ? {
    [K in keyof U]: InternalValueTypeOf<U[K], Extra>
  }[keyof U]
  : never
