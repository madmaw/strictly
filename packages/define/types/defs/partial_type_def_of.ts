import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type NullableTypeDef,
  type ReadonlyTypeDef,
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
  readonly type: TypeDefType.Nullable,
  readonly toNullableTypeDef: InternalPartialOf<T>,
}

type InternalPartialOf<T extends TypeDef> = T extends LiteralTypeDef ? InternalPartialOfLiteral<T>
  : T extends ListTypeDef ? InternalPartialOfList<T>
  : T extends MapTypeDef ? InternalPartialOfMap<T>
  : T extends StructuredTypeDef ? InternalPartialOfStructured<T>
  : T extends UnionTypeDef ? InternalPartialOfUnion<T>
  : T extends ReadonlyTypeDef ? InternalPartialOfReadonly<T>
  : T extends NullableTypeDef ? InternalPartialOfNullable<T>
  : never

type InternalPartialOfLiteral<T extends LiteralTypeDef> = T

type InternalPartialOfList<T extends ListTypeDef> = {
  readonly type: T['type'],
  readonly elements: InternalPartialAndNullableOf<T['elements']>,
}

type InternalPartialOfMap<T extends MapTypeDef> = {
  readonly type: T['type'],
  readonly keyPrototype: T['keyPrototype'],
  readonly valueTypeDef: InternalPartialAndNullableOf<T['valueTypeDef']> | undefined,
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

type InternalPartialOfReadonly<T extends ReadonlyTypeDef> = {
  readonly type: T['type'],
  readonly toReadonlyTypeDef: InternalPartialOf<T['toReadonlyTypeDef']>,
}

type InternalPartialOfNullable<T extends NullableTypeDef> = InternalPartialOf<T['toNullableTypeDef']>
