import {
  type ListTypeDef,
  type LiteralTypeDef,
  type ObjectTypeDef,
  type RecordTypeDef,
  type Type,
  type TypeDef,
  type UnionTypeDef,
} from './Definitions'

// TODO rename to ReadonlyOfType
export type ReadonlyTypeOfType<T extends Type> = {
  readonly definition: ReadonlyOfTypeDef<T['definition']>,
}

export type ReadonlyOfTypeDef<T extends TypeDef> = T extends LiteralTypeDef ? ReadonlyOfLiteralTypeDef<T>
  : T extends ListTypeDef ? ReadonlyOfListTypeDef<T>
  : T extends RecordTypeDef ? ReadonlyOfRecordTypeDef<T>
  : T extends ObjectTypeDef ? ReadonlyOfObjectTypeDef<T>
  : T extends UnionTypeDef ? ReadonlyOfUnionTypeDef<T>
  : never

type ReadonlyOfLiteralTypeDef<T extends LiteralTypeDef> = T

type ReadonlyOfListTypeDef<T extends ListTypeDef> = {
  readonly type: T['type'],
  readonly elements: ReadonlyOfTypeDef<T['elements']>,
}

type ReadonlyOfRecordTypeDef<T extends RecordTypeDef> = {
  readonly type: T['type'],
  readonly keyPrototype: T['keyPrototype'],
  readonly valueTypeDef: undefined extends T['valueTypeDef'] ? ReadonlyOfTypeDef<
      Exclude<T['valueTypeDef'], undefined>
    > | undefined
    : ReadonlyOfTypeDef<T['valueTypeDef']>,
}

type ReadonlyOfObjectTypeDef<T extends ObjectTypeDef> = T extends ObjectTypeDef<infer Fields> ? {
    readonly type: T['type'],
    readonly fields: {
      readonly [K in keyof Fields]: ReadonlyOfTypeDef<Fields[K]>
    },
  }
  : never

type ReadonlyOfUnionTypeDef<T extends UnionTypeDef> = T extends UnionTypeDef<infer D, infer Unions> ? {
    readonly type: T['type'],
    readonly discriminator: D,
    readonly unions: {
      readonly [K in keyof Unions]: ReadonlyOfTypeDef<Unions[K]>
    },
  }
  : never
