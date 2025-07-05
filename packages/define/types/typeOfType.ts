import {
  type IsFieldReadonly,
  map,
  UnreachableError,
} from '@strictly/base'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type ObjectFieldKey,
  type ObjectTypeDef,
  type RecordTypeDef,
  type Type,
  type TypeDef,
  TypeDefType,
  type UnionTypeDef,
} from 'types/Definitions'

// useful for turning annotated type to type (e.g. Removing validation from ValidatingDefinition)
export type TypeOfType<T extends Type> = T extends Type<infer D> ? {
    readonly definition: TypeDefOfTypeDef<D>,
  }
  : never

type TypeDefOfTypeDef<D extends TypeDef> = D extends LiteralTypeDef ? TypeDefOfLiteralTypeDef<D>
  : D extends ListTypeDef ? TypeDefOfListTypeDef<D>
  : D extends RecordTypeDef ? TypeDefOfRecordTypeDef<D>
  : D extends ObjectTypeDef ? TypeDefOfObjectTypeDef<D>
  : D extends UnionTypeDef ? TypeDefOfUnionTypeDef<D>
  : never

type TypeDefOfLiteralTypeDef<T extends LiteralTypeDef> = T extends LiteralTypeDef<infer V> ? {
    readonly type: TypeDefType.Literal,
    readonly valuePrototype: [V],
  }
  : never

type TypeDefOfListTypeDef<T extends ListTypeDef> = T extends ListTypeDef<infer E>
  ? IsFieldReadonly<T, 'elements'> extends true ? {
      readonly type: TypeDefType.List,
      readonly elements: TypeDefOfTypeDef<E>,
    }
  : {
    readonly type: TypeDefType.List,
    elements: TypeDefOfTypeDef<E>,
  }
  : never

type TypeDefOfRecordTypeDef<T extends RecordTypeDef> = T extends RecordTypeDef<infer K, infer V>
  ? undefined extends V ? IsFieldReadonly<T, 'valueTypeDef'> extends true ? {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: K,
        readonly valueTypeDef: TypeDefOfTypeDef<NonNullable<V>> | undefined,
      }
    : {
      readonly type: TypeDefType.Record,
      readonly keyPrototype: K,
      valueTypeDef: TypeDefOfTypeDef<NonNullable<V>> | undefined,
    }
  : IsFieldReadonly<T, 'valueTypeDef'> extends true ? {
      readonly type: TypeDefType.Record,
      readonly keyPrototype: K,
      readonly valueTypeDef: TypeDefOfTypeDef<NonNullable<V>>,
    }
  : {
    readonly type: TypeDefType.Record,
    readonly keyPrototype: K,
    valueTypeDef: TypeDefOfTypeDef<NonNullable<V>>,
  }
  : never

type TypeDefOfObjectTypeDef<T extends ObjectTypeDef> = T extends ObjectTypeDef<infer Fields> ? {
    readonly type: TypeDefType.Object,
    readonly fields: {
      [K in keyof Fields as K extends ObjectFieldKey ? K : never]: TypeDefOfTypeDef<NonNullable<Fields[K]>>
    },
  }
  : never

type TypeDefOfUnionTypeDef<T extends UnionTypeDef> = T extends UnionTypeDef<infer D, infer U> ? {
    readonly type: TypeDefType.Union,
    readonly discriminator: D,
    readonly unions: {
      [K in keyof U]: TypeDefOfTypeDef<U[K]>
    },
  }
  : never

export function typeOfType<T extends Type>({ definition }: T): TypeOfType<T> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    definition: typeDefOfTypeDef(definition),
  } as TypeOfType<T>
}

function typeDefOfTypeDef<T extends TypeDef>(t: T): TypeDefOfTypeDef<T> {
  switch (t.type) {
    case TypeDefType.Literal:
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return typeDefOfLiteralTypeDef(t) as TypeDefOfTypeDef<T>
    case TypeDefType.List:
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return typeDefOfListTypeDef(t) as TypeDefOfTypeDef<T>
    case TypeDefType.Record:
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return typeDefOfRecordTypeDef(t) as TypeDefOfTypeDef<T>
    case TypeDefType.Object:
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return typeDefOfObjectTypeDef(t) as TypeDefOfTypeDef<T>
    case TypeDefType.Union:
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return typeDefOfUnionTypeDef(t) as TypeDefOfTypeDef<T>
    default:
      throw new UnreachableError(t)
  }
}

function typeDefOfLiteralTypeDef<T extends LiteralTypeDef>({
  type,
  valuePrototype,
}: T): TypeDefOfLiteralTypeDef<T> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    type,
    valuePrototype,
  } as TypeDefOfLiteralTypeDef<T>
}

function typeDefOfListTypeDef<T extends ListTypeDef>({
  type,
  elements,
}: T): TypeDefOfListTypeDef<T> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    type,
    elements: typeDefOfTypeDef(elements),
  } as TypeDefOfListTypeDef<T>
}

function typeDefOfRecordTypeDef<T extends RecordTypeDef>({
  type,
  keyPrototype,
  valueTypeDef,
}: T): TypeDefOfRecordTypeDef<T> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    type,
    keyPrototype,
    valueTypeDef: typeDefOfTypeDef(valueTypeDef),
  } as TypeDefOfRecordTypeDef<T>
}

function typeDefOfObjectTypeDef<T extends ObjectTypeDef>({
  type,
  fields,
}: T): TypeDefOfObjectTypeDef<T> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    type,
    fields: map(fields, function (_k, v) {
      return typeDefOfTypeDef(v)
    }),
  } as TypeDefOfObjectTypeDef<T>
}

function typeDefOfUnionTypeDef<T extends UnionTypeDef>({
  type,
  discriminator,
  unions,
}: T): TypeDefOfUnionTypeDef<T> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    type,
    discriminator,
    unions: map(unions, function (_k, v) {
      return typeDefOfTypeDef(v)
    }),
  } as TypeDefOfUnionTypeDef<T>
}
