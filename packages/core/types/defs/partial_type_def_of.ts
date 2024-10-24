import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type NullableTypeDef,
  type PartialTypeDef,
  type ReadonlyTypeDef,
  type StructuredTypeDef,
  type TypeDef,
  type UnionTypeDef,
} from '.'

export type PartialTypeDefOf<T extends TypeDef> = InternalPartialAndNullableOf<T>

type InternalPartialAndNullableOf<T extends TypeDef> = {
  readonly toNullableTypeDef: InternalPartialOf<T>,
}

type InternalPartialOf<T extends TypeDef> = T extends LiteralTypeDef ? InternalPartialOfLiteral<T>
  : T extends ListTypeDef ? InternalPartialOfList<T>
  : T extends MapTypeDef ? InternalPartialOfMap<T>
  : T extends StructuredTypeDef ? InternalPartialOfStructured<T>
  : T extends UnionTypeDef ? InternalPartialOfUnion<T>
  : T extends PartialTypeDef ? InternalPartialOfPartial<T>
  : T extends ReadonlyTypeDef ? InternalPartialOfReadonly<T>
  : T extends NullableTypeDef ? InternalPartialOfNullable<T>
  : never

type InternalPartialOfLiteral<T extends LiteralTypeDef> = T

type InternalPartialOfList<T extends ListTypeDef> = {
  readonly elements: InternalPartialAndNullableOf<T['elements']>,
}

type InternalPartialOfMap<T extends MapTypeDef> = {
  readonly toPartialTypeDef: {
    readonly keyPrototype: T['keyPrototype'],
    readonly valueTypeDef: InternalPartialAndNullableOf<T['valueTypeDef']>,
  },
}

type InternalPartialOfStructured<T extends StructuredTypeDef> = T extends StructuredTypeDef<infer Fields> ? {
    readonly fields: {
      [K in keyof Fields]+?: InternalPartialAndNullableOf<Fields[K]>
    },
  }
  : never

type InternalPartialOfUnion<T extends UnionTypeDef> = T extends UnionTypeDef<infer Unions> ? {
    readonly unions: {
      [K in keyof Unions]: InternalPartialOf<Unions[K]>
    },
  }
  : never

type InternalPartialOfPartial<T extends PartialTypeDef> = InternalPartialOf<T['toPartialTypeDef']>

type InternalPartialOfReadonly<T extends ReadonlyTypeDef> = {
  readonly toReadonlyTypeDef: InternalPartialOf<T['toReadonlyTypeDef']>,
}

type InternalPartialOfNullable<T extends NullableTypeDef> = InternalPartialOf<T['toNullableTypeDef']>
