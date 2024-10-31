import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  type UnionTypeDef,
} from './definitions'

export type ReadonlyTypeDefOf<T extends TypeDefHolder> = {
  readonly typeDef: InternalReadonlyTypeDefOf<T['typeDef']>,
}

type InternalReadonlyTypeDefOf<T extends TypeDef> = T extends LiteralTypeDef ? InternalReadonlyTypeDefOfLiteral<T>
  : T extends ListTypeDef ? InternalReadonlyTypeDefOfList<T>
  : T extends MapTypeDef ? InternalReadonlyTypeDefOfMap<T>
  : T extends StructuredTypeDef ? InternalReadonlyTypeDefOfStruct<T>
  : T extends UnionTypeDef ? InternalReadonlyTypeDefOfUnion<T>
  : never

type InternalReadonlyTypeDefOfLiteral<T extends LiteralTypeDef> = T

type InternalReadonlyTypeDefOfList<T extends ListTypeDef> = {
  readonly type: T['type'],
  readonly elements: InternalReadonlyTypeDefOf<T['elements']>,
  readonly readonly: true,
}

type InternalReadonlyTypeDefOfMap<T extends MapTypeDef> = {
  readonly type: T['type'],
  readonly keyPrototype: T['keyPrototype'],
  readonly valueTypeDef: undefined extends T['valueTypeDef'] ? InternalReadonlyTypeDefOf<
      Exclude<T['valueTypeDef'], undefined>
    > | undefined
    : InternalReadonlyTypeDefOf<T['valueTypeDef']>,
  readonly readonly: true,
}

type InternalReadonlyTypeDefOfStruct<T extends StructuredTypeDef> = T extends StructuredTypeDef<infer Fields> ? {
    readonly type: T['type'],
    readonly fields: {
      readonly [K in keyof Fields]: InternalReadonlyTypeDefOf<Fields[K]>
    },
  }
  : never

type InternalReadonlyTypeDefOfUnion<T extends UnionTypeDef> = T extends UnionTypeDef<infer D, infer Unions> ? {
    readonly type: T['type'],
    readonly discriminator: D,
    readonly unions: {
      readonly [K in keyof Unions]: InternalReadonlyTypeDefOf<Unions[K]>
    },
  }
  : never
