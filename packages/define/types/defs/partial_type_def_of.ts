import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  type TypeDefType,
  type UnionTypeDef,
} from '.'

export type PartialTypeDefOf<T extends TypeDefHolder> = {
  readonly typeDef: InternalPartialAndNullableOf<T['typeDef']>,
}

type InternalPartialAndNullableOf<T extends TypeDef> = {
  readonly type: TypeDefType.Union,
  readonly unions: {
    readonly [0]: {
      readonly type: TypeDefType.Literal,
      readonly valuePrototype: null,
    },
    readonly [1]: InternalPartialOf<T>,
  },
}

type InternalPartialOf<T extends TypeDef> = T extends LiteralTypeDef ? InternalPartialOfLiteral<T>
  : T extends ListTypeDef ? InternalPartialOfList<T>
  : T extends MapTypeDef ? InternalPartialOfMap<T>
  : T extends StructuredTypeDef ? InternalPartialOfStructured<T>
  : T extends UnionTypeDef ? InternalPartialOfUnion<T>
  : never

type InternalPartialOfLiteral<T extends LiteralTypeDef> = T

type InternalPartialOfList<T extends ListTypeDef> = {
  readonly type: T['type'],
  readonly elements: InternalPartialAndNullableOf<T['elements']>,
  readonly readonly: T['readonly'],
}

type InternalPartialOfMap<T extends MapTypeDef> = {
  readonly type: T['type'],
  readonly keyPrototype: T['keyPrototype'],
  readonly valueTypeDef: InternalPartialAndNullableOf<T['valueTypeDef']> | undefined,
  readonly readonly: T['readonly'],
}

type InternalPartialOfStructured<T extends StructuredTypeDef> = T extends StructuredTypeDef<infer Fields> ? {
    readonly type: T['type'],
    readonly fields: {
      [K in keyof Fields]+?: InternalPartialAndNullableOf<Fields[K]>
    },
  }
  : never

type InternalPartialOfUnion<T extends UnionTypeDef> = T extends UnionTypeDef<infer Unions> ? {
    readonly type: T['type'],
    readonly unions: {
      [K in keyof Unions]: InternalPartialOf<Unions[K]>
    },
  }
  : never
