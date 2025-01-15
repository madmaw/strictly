import { type IsFieldReadonly } from '@strictly/base'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type ObjectFieldKey,
  type ObjectTypeDef,
  type RecordTypeDef,
  type Type,
  type TypeDef,
  type TypeDefType,
  type UnionTypeDef,
} from 'types/definitions'

// useful for turning annotated type to type (e.g. Removing validation from ValidatingDefinition)
export type TypeOfType<T extends Type> = T extends Type<infer D> ? {
    readonly definition: TypeOfTypeDef<D>,
  }
  : never

type TypeOfTypeDef<D extends TypeDef> = D extends LiteralTypeDef ? TypeOfLiteralTypeDef<D>
  : D extends ListTypeDef ? TypeOfListTypeDef<D>
  : D extends RecordTypeDef ? TypeOfRecordTypeDef<D>
  : D extends ObjectTypeDef ? TypeOfObjectTypeDef<D>
  : D extends UnionTypeDef ? TypeOfUnionTypeDef<D>
  : never

type TypeOfLiteralTypeDef<T extends LiteralTypeDef> = T extends LiteralTypeDef<infer V> ? {
    readonly type: TypeDefType.Literal,
    readonly valuePrototype: [V],
  }
  : never

type TypeOfListTypeDef<T extends ListTypeDef> = T extends ListTypeDef<infer E>
  ? IsFieldReadonly<T, 'elements'> extends true ? {
      readonly type: TypeDefType.List,
      readonly elements: TypeOfTypeDef<E>,
    }
  : {
    readonly type: TypeDefType.List,
    elements: TypeOfTypeDef<E>,
  }
  : never

type TypeOfRecordTypeDef<T extends RecordTypeDef> = T extends RecordTypeDef<infer K, infer V>
  ? undefined extends V ? IsFieldReadonly<T, 'valueTypeDef'> extends true ? {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: K,
        readonly valueTypeDef: TypeOfTypeDef<NonNullable<V>> | undefined,
      }
    : {
      readonly type: TypeDefType.Record,
      readonly keyPrototype: K,
      valueTypeDef: TypeOfTypeDef<NonNullable<V>> | undefined,
    }
  : IsFieldReadonly<T, 'valueTypeDef'> extends true ? {
      readonly type: TypeDefType.Record,
      readonly keyPrototype: K,
      readonly valueTypeDef: TypeOfTypeDef<NonNullable<V>>,
    }
  : {
    readonly type: TypeDefType.Record,
    readonly keyPrototype: K,
    valueTypeDef: TypeOfTypeDef<NonNullable<V>>,
  }
  : never

type TypeOfObjectTypeDef<T extends ObjectTypeDef> = T extends ObjectTypeDef<infer Fields> ? {
    readonly type: TypeDefType.Object,
    readonly fields: {
      [K in keyof Fields as K extends ObjectFieldKey ? K : never]: TypeOfTypeDef<NonNullable<Fields[K]>>
    },
  }
  : never

type TypeOfUnionTypeDef<T extends UnionTypeDef> = T extends UnionTypeDef<infer D, infer U> ? {
    readonly type: TypeDefType.Union,
    readonly discriminator: D,
    readonly unions: {
      [K in keyof U]: TypeOfTypeDef<U[K]>
    },
  }
  : never
