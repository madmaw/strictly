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

export type ReadonlyTypeDefOf<T extends TypeDefHolder> = InternalReadonlyTypeDefOf<T['typeDef']>

type InternalReadonlyTypeDefOf<T extends TypeDef> = T extends LiteralTypeDef ? InternalReadonlyTypeDefOfLiteral<T>
  : T extends ListTypeDef ? InternalReadonlyTypeDefOfList<T>
  : T extends MapTypeDef ? InternalReadonlyTypeDefOfMap<T>
  : T extends StructuredTypeDef ? InternalReadonlyTypeDefOfStruct<T>
  : T extends UnionTypeDef ? InternalReadonlyTypeDefOfUnion<T>
  : T extends PartialTypeDef ? InternalReadonlyTypeDefOfPartial<T>
  : T extends ReadonlyTypeDef ? InternalReadonlyTypeDefOfReadonly<T>
  : T extends NullableTypeDef ? InternalReadonlyTypeDefOfNullable<T>
  : never

type InternalReadonlyTypeDefOfLiteral<T extends LiteralTypeDef> = T

type InternalReadonlyTypeDefOfList<T extends ListTypeDef> = {
  readonly toReadonlyTypeDef: {
    readonly elements: InternalReadonlyTypeDefOf<T['elements']>,
  },
}

type InternalReadonlyTypeDefOfMap<T extends MapTypeDef> = {
  readonly toReadonlyTypeDef: {
    readonly keyPrototype: T['keyPrototype'],
    readonly valueTypeDef: InternalReadonlyTypeDefOf<T['valueTypeDef']>,
  },
}

type InternalReadonlyTypeDefOfStruct<T extends StructuredTypeDef> = T extends StructuredTypeDef<infer Fields> ? {
    readonly fields: {
      readonly [K in keyof Fields]: InternalReadonlyTypeDefOf<Fields[K]>
    },
  }
  : never

type InternalReadonlyTypeDefOfUnion<T extends UnionTypeDef> = T extends UnionTypeDef<infer Unions> ? {
    readonly unions: {
      readonly [K in keyof Unions]: InternalReadonlyTypeDefOf<Unions[K]>
    },
  }
  : never

type InternalReadonlyTypeDefOfNullable<T extends NullableTypeDef> = {
  readonly toNullableTypeDef: InternalReadonlyTypeDefOf<T['toNullableTypeDef']>,
}

type InternalReadonlyTypeDefOfPartial<T extends PartialTypeDef> = {
  readonly toPartialTypeDef: InternalReadonlyTypeDefOf<T['toPartialTypeDef']>,
}

type InternalReadonlyTypeDefOfReadonly<T extends ReadonlyTypeDef> = InternalReadonlyTypeDefOf<T['toReadonlyTypeDef']>
