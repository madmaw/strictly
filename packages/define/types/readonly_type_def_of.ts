import {
  type ListTypeDef,
  type LiteralTypeDef,
  type ObjectTypeDef,
  type RecordTypeDef,
  type Type,
  type TypeDef,
  type UnionTypeDef,
} from './definitions'

export type ReadonlyTypeDefOf<T extends Type> = {
  readonly definition: InternalReadonlyTypeDefOf<T['definition']>,
}

type InternalReadonlyTypeDefOf<T extends TypeDef> = T extends LiteralTypeDef ? InternalReadonlyTypeDefOfLiteral<T>
  : T extends ListTypeDef ? InternalReadonlyTypeDefOfList<T>
  : T extends RecordTypeDef ? InternalReadonlyTypeDefOfRecord<T>
  : T extends ObjectTypeDef ? InternalReadonlyTypeDefOfObject<T>
  : T extends UnionTypeDef ? InternalReadonlyTypeDefOfUnion<T>
  : never

type InternalReadonlyTypeDefOfLiteral<T extends LiteralTypeDef> = T

type InternalReadonlyTypeDefOfList<T extends ListTypeDef> = {
  readonly type: T['type'],
  readonly elements: InternalReadonlyTypeDefOf<T['elements']>,
}

type InternalReadonlyTypeDefOfRecord<T extends RecordTypeDef> = {
  readonly type: T['type'],
  readonly keyPrototype: T['keyPrototype'],
  readonly valueTypeDef: undefined extends T['valueTypeDef'] ? InternalReadonlyTypeDefOf<
      Exclude<T['valueTypeDef'], undefined>
    > | undefined
    : InternalReadonlyTypeDefOf<T['valueTypeDef']>,
}

type InternalReadonlyTypeDefOfObject<T extends ObjectTypeDef> = T extends ObjectTypeDef<infer Fields> ? {
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
