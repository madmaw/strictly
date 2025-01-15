import { type IsFieldReadonly } from '@strictly/base'
import {
  type TypeDefType,
} from 'types/definitions'
import {
  type Rule,
  type ValidatingListTypeDef,
  type ValidatingLiteralTypeDef,
  type ValidatingObjectTypeDef,
  type ValidatingRecordTypeDef,
  type ValidatingTypeDef,
  type ValidatingUnionTypeDef,
} from './validating_definitions'

// doesn't work, loses
// export type ValidatingTypeDefWithError2<T extends ValidatingTypeDef, E2> = T extends ValidatingTypeDef<infer E1>
//   ? T & { rule: Rule<E1 | E2> }
//   : never

export type ValidatingTypeDefWithError<T extends ValidatingTypeDef, E> = T extends ValidatingLiteralTypeDef
  ? ValidatingLiteralTypeDefWithError<T, E>
  : T extends ValidatingListTypeDef ? ValidatingListTypeDefWithError<T, E>
  : T extends ValidatingRecordTypeDef ? ValidatingRecordTypeDefWithError<T, E>
  : T extends ValidatingObjectTypeDef ? ValidatingObjectTypeDefWithError<T, E>
  : T extends ValidatingUnionTypeDef ? ValidatingUnionTypeDefWithError<T, E>
  : never

type ValidatingLiteralTypeDefWithError<T extends ValidatingLiteralTypeDef, E2> = T extends
  ValidatingLiteralTypeDef<infer E1, infer V> ? {
    readonly type: TypeDefType.Literal,
    readonly valuePrototype: [V],
    readonly rule: Rule<E1 | E2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never

type ValidatingListTypeDefWithError<T extends ValidatingListTypeDef, E2> = T extends
  ValidatingListTypeDef<infer E1, infer E> ? IsFieldReadonly<T, 'elements'> extends true ? {
      readonly type: TypeDefType.List,
      readonly elements: E,
      readonly rule: Rule<E1 | E2>,
      readonly required: boolean,
      readonly readonly: boolean,
    }
  : {
    readonly type: TypeDefType.List,
    elements: E,
    readonly rule: Rule<E1 | E2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never

type ValidatingRecordTypeDefWithError<T extends ValidatingRecordTypeDef, E2> = T extends
  ValidatingRecordTypeDef<infer E1, infer K, infer V> ? IsFieldReadonly<T, 'valueTypeDef'> extends true ? {
      readonly type: TypeDefType.Record,
      readonly keyPrototype: K,
      readonly valueTypeDef: V,
      readonly rule: Rule<E1 | E2>,
      readonly required: boolean,
      readonly readonly: boolean,
    }
  : {
    readonly type: TypeDefType.Record,
    readonly keyPrototype: K,
    valueTypeDef: V,
    readonly rule: Rule<E1 | E2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never

type ValidatingObjectTypeDefWithError<T extends ValidatingObjectTypeDef, E2> = T extends
  ValidatingObjectTypeDef<infer E1, infer Fields> ? {
    readonly type: TypeDefType.Object,
    readonly fields: Fields,
    readonly rule: Rule<E1 | E2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never

type ValidatingUnionTypeDefWithError<T extends ValidatingUnionTypeDef, E2> = T extends
  ValidatingUnionTypeDef<infer E1, infer D, infer U> ? {
    readonly type: TypeDefType.Union,
    readonly discriminator: D,
    readonly unions: U,
    readonly rule: Rule<E1 | E2>,
    readonly required: boolean,
    readonly readonly: boolean,
  }
  : never
