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

export type ReadonlyTypeDefOf<T extends TypeDefHolder> = {
  readonly typeDef: InternalReadonlyTypeDefOf<T['typeDef']>,
}

type InternalReadonlyTypeDefOf<T extends TypeDef> = T extends LiteralTypeDef ? InternalReadonlyTypeDefOfLiteral<T>
  : T extends ListTypeDef ? InternalReadonlyTypeDefOfList<T>
  : T extends MapTypeDef ? InternalReadonlyTypeDefOfMap<T>
  : T extends StructuredTypeDef ? InternalReadonlyTypeDefOfStruct<T>
  : T extends UnionTypeDef ? InternalReadonlyTypeDefOfUnion<T>
  : T extends ReadonlyTypeDef ? InternalReadonlyTypeDefOfReadonly<T>
  : T extends NullableTypeDef ? InternalReadonlyTypeDefOfNullable<T>
  : never

type InternalReadonlyTypeDefOfLiteral<T extends LiteralTypeDef> = T

type InternalReadonlyTypeDefOfList<T extends ListTypeDef> = {
  readonly type: TypeDefType.Readonly,
  readonly toReadonlyTypeDef: {
    readonly type: T['type'],
    readonly elements: InternalReadonlyTypeDefOf<T['elements']>,
  },
}

type InternalReadonlyTypeDefOfMap<T extends MapTypeDef> = {
  readonly type: TypeDefType.Readonly,
  readonly toReadonlyTypeDef: {
    readonly type: T['type'],
    readonly keyPrototype: T['keyPrototype'],
    readonly valueTypeDef: undefined extends T['valueTypeDef'] ? InternalReadonlyTypeDefOf<
        Exclude<T['valueTypeDef'], undefined>
      > | undefined
      : InternalReadonlyTypeDefOf<T['valueTypeDef']>,
  },
}

type InternalReadonlyTypeDefOfStruct<T extends StructuredTypeDef> = T extends StructuredTypeDef<infer Fields> ? {
    readonly type: T['type'],
    readonly fields: {
      readonly [K in keyof Fields]: InternalReadonlyTypeDefOf<Fields[K]>
    },
  }
  : never

type InternalReadonlyTypeDefOfUnion<T extends UnionTypeDef> = T extends UnionTypeDef<infer Unions> ? {
    readonly type: T['type'],
    readonly unions: {
      readonly [K in keyof Unions]: InternalReadonlyTypeDefOf<Unions[K]>
    },
  }
  : never

type InternalReadonlyTypeDefOfNullable<T extends NullableTypeDef> = {
  readonly type: T['type'],
  readonly toNullableTypeDef: InternalReadonlyTypeDefOf<T['toNullableTypeDef']>,
}

type InternalReadonlyTypeDefOfReadonly<T extends ReadonlyTypeDef> = InternalReadonlyTypeDefOf<T['toReadonlyTypeDef']>
