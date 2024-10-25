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
  T extends TypeDefHolder,
> = InternalValueTypeOf<T['typeDef']>

export type InternalValueTypeOf<
  F extends TypeDef,
> = F extends LiteralTypeDef ? InternalValueTypeOfLiteral<F>
  : F extends NullableTypeDef ? InternalValueTypeOfNullable<F>
  : F extends ListTypeDef ? InternalValueTypeOfList<F>
  : F extends MapTypeDef ? InternalValueTypeOfMap<F>
  : F extends ReadonlyTypeDef ? InternalValueTypeOfReadonly<F>
  : F extends PartialTypeDef ? InternalValueTypeOfPartial<F>
  : F extends StructuredTypeDef ? InternalValueTypeOfStruct<F>
  : F extends UnionTypeDef ? InternalValueTypeOfUnion<F>
  : never

type InternalValueTypeOfLiteral<F extends LiteralTypeDef> = F['valuePrototype']

type InternalValueTypeOfNullable<
  F extends NullableTypeDef,
> = InternalValueTypeOf<F['toNullableTypeDef']> | null

type InternalValueTypeOfList<F extends ListTypeDef> = InternalValueTypeOf<F['elements']>[]

type InternalValueTypeOfMap<
  F extends MapTypeDef,
> = Record<
  F['keyPrototype'],
  InternalValueTypeOf<
    F['valueTypeDef']
  >
>

type InternalValueTypeOfReadonly<F extends ReadonlyTypeDef> = Readonly<
  InternalValueTypeOf<F['toReadonlyTypeDef']>
>

type InternalValueTypeOfPartial<F extends PartialTypeDef> = Partial<
  InternalValueTypeOf<F['toPartialTypeDef']>
>

type InternalValueTypeOfStruct<
  F extends StructuredTypeDef,
> = F extends StructuredTypeDef<infer Fields> ? {
    [K in keyof Fields]: InternalValueTypeOf<
      Fields[K]
    >
  }
  : never

type InternalValueTypeOfUnion<
  F extends UnionTypeDef,
> = F extends UnionTypeDef<infer U> ? {
    [K in keyof U]: InternalValueTypeOf<U[K]>
  }[keyof U]
  : never
