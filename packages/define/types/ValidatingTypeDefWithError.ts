import { type IsFieldReadonly } from '@strictly/base'
import {
  type TypeDefType,
} from './Type'
import {
  type Rule,
  type ValidatingListTypeDef,
  type ValidatingLiteralTypeDef,
  type ValidatingObjectTypeDef,
  type ValidatingRecordTypeDef,
  type ValidatingTypeDef,
  type ValidatingUnionTypeDef,
} from './ValidatingType'

// doesn't work, loses
// export type ValidatingTypeDefWithError2<T extends ValidatingTypeDef, E2> = T extends ValidatingTypeDef<infer E1>
//   ? T & { rule: Rule<E1 | E2> }
//   : never

export type ValidatingTypeDefWithError<T extends ValidatingTypeDef, E, C> = T extends ValidatingLiteralTypeDef
  ? ValidatingLiteralTypeDefWithError<T, E, C>
  : T extends ValidatingListTypeDef ? ValidatingListTypeDefWithError<T, E, C>
  : T extends ValidatingRecordTypeDef ? ValidatingRecordTypeDefWithError<T, E, C>
  : T extends ValidatingObjectTypeDef ? ValidatingObjectTypeDefWithError<T, E, C>
  : T extends ValidatingUnionTypeDef ? ValidatingUnionTypeDefWithError<T, E, C>
  : never

type ValidatingLiteralTypeDefWithError<T extends ValidatingLiteralTypeDef, E2, C2> = T extends
  ValidatingLiteralTypeDef<infer E1, infer C1, infer V> ? {
    readonly type: TypeDefType.Literal,
    readonly valuePrototype: [V],
    readonly rule: Rule<E1 | E2, C1 & C2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never

type ValidatingListTypeDefWithError<T extends ValidatingListTypeDef, E2, C2> = T extends
  ValidatingListTypeDef<infer E1, infer C1, infer E> ? IsFieldReadonly<T, 'elements'> extends true ? {
      readonly type: TypeDefType.List,
      readonly elements: E,
      readonly rule: Rule<E1 | E2, C1 & C2>,
      readonly required: boolean,
      readonly readonly: boolean,
    }
  : {
    readonly type: TypeDefType.List,
    elements: E,
    readonly rule: Rule<E1 | E2, C1 & C2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never

type ValidatingRecordTypeDefWithError<T extends ValidatingRecordTypeDef, E2, C2> = T extends
  ValidatingRecordTypeDef<infer E1, infer C1, infer K, infer V> ? IsFieldReadonly<T, 'valueTypeDef'> extends true ? {
      readonly type: TypeDefType.Record,
      readonly keyPrototype: K,
      readonly valueTypeDef: V,
      readonly rule: Rule<E1 | E2, C1 & C2>,
      readonly required: boolean,
      readonly readonly: boolean,
    }
  : {
    readonly type: TypeDefType.Record,
    readonly keyPrototype: K,
    valueTypeDef: V,
    readonly rule: Rule<E1 | E2, C1 & C2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never

type ValidatingObjectTypeDefWithError<T extends ValidatingObjectTypeDef, E2, C2> = T extends
  ValidatingObjectTypeDef<infer E1, infer C1, infer Fields> ? {
    readonly type: TypeDefType.Object,
    readonly fields: Fields,
    readonly rule: Rule<E1 | E2, C1 & C2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never

type ValidatingUnionTypeDefWithError<T extends ValidatingUnionTypeDef, E2, C2> = T extends
  ValidatingUnionTypeDef<infer E1, infer C1, infer D, infer U> ? {
    readonly type: TypeDefType.Union,
    readonly discriminator: D,
    readonly unions: U,
    readonly rule: Rule<E1 | E2, C1 & C2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never
