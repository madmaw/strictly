import {
  type ListTypeDef,
  type LiteralTypeDef,
  type ObjectTypeDef,
  type RecordTypeDef,
  type Type,
  type TypeDef,
  type TypeDefType,
  type UnionTypeDef,
} from './Type'

// TODO rename to PartialOfType

// converts a type def to have nullable values and partial record fields
export type PartialTypeOfType<T extends Type> = {
  readonly typeDef: InternalPartialAndNullableOf<T['definition']>,
}

type InternalPartialAndNullableOf<T extends TypeDef> = {
  readonly type: TypeDefType.Union,
  readonly discriminator: null,
  readonly unions: {
    readonly [0]: InternalPartialOf<T>,
    readonly [1]: {
      readonly type: TypeDefType.Literal,
      readonly valuePrototype: [null],
    },
  },
}

type InternalPartialOf<T extends TypeDef> = T extends LiteralTypeDef ? InternalPartialOfLiteral<T>
  : T extends ListTypeDef ? InternalPartialOfList<T>
  : T extends RecordTypeDef ? InternalPartialOfRecord<T>
  : T extends ObjectTypeDef ? InternalPartialOfObject<T>
  : T extends UnionTypeDef ? InternalPartialOfUnion<T>
  : never

type InternalPartialOfLiteral<T extends LiteralTypeDef> = T

type InternalPartialOfList<T extends ListTypeDef> = {
  readonly type: T['type'],
  readonly elements: InternalPartialAndNullableOf<T['elements']>,
}

type InternalPartialOfRecord<T extends RecordTypeDef> = {
  readonly type: T['type'],
  readonly keyPrototype: T['keyPrototype'],
  readonly valueTypeDef: InternalPartialAndNullableOf<T['valueTypeDef']> | undefined,
}

type InternalPartialOfObject<T extends ObjectTypeDef> = T extends ObjectTypeDef<infer Fields> ? {
    readonly type: T['type'],
    readonly fields: {
      [K in keyof Fields]+?: InternalPartialAndNullableOf<Fields[K]>
    },
  }
  : never

type InternalPartialOfUnion<T extends UnionTypeDef> = T extends UnionTypeDef<infer D, infer Unions> ? {
    readonly type: T['type'],
    readonly discriminator: D,
    readonly unions: {
      [K in keyof Unions]: InternalPartialOf<Unions[K]>
    },
  }
  : never
