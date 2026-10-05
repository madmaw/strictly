import {
  type AnnotatedFieldConverter,
  type FieldValueFactory,
  type UnreliableFieldConverter,
} from 'form/types/FieldConverters'

export type FieldAdapter<
  // oxlint-disable-next-line typescript/no-explicit-any
  From = any,
  // oxlint-disable-next-line typescript/no-explicit-any
  To = any,
  // oxlint-disable-next-line typescript/no-explicit-any
  E = any,
  // oxlint-disable-next-line typescript/no-explicit-any
  ValuePath extends string = any,
  // oxlint-disable-next-line typescript/no-explicit-any
  Context = any,
> = {
  readonly convert: AnnotatedFieldConverter<From, To, ValuePath, Context>
  readonly create: FieldValueFactory<From, ValuePath, Context>
  readonly revert?: UnreliableFieldConverter<To, From, E, ValuePath, Context>
}

export type FromOfFieldAdapter<C extends FieldAdapter> =
  C extends FieldAdapter<infer From> ? From : never

export type ToOfFieldAdapter<C extends FieldAdapter> =
  C extends FieldAdapter<infer _F, infer To> ? To : never

export type ErrorOfFieldAdapter<C extends FieldAdapter> =
  C extends FieldAdapter<infer _From, infer _To, infer E>
    ? NonNullable<E>
    : never

export type ValuePathOfFieldAdapter<C extends FieldAdapter> =
  C extends FieldAdapter<infer _From, infer _To, infer _E, infer ValuePath>
    ? ValuePath
    : never

export type ContextOfFieldAdapter<F extends FieldAdapter> =
  F extends FieldAdapter<
    infer _From,
    infer _To,
    infer _E,
    infer _P,
    infer Context
  >
    ? Context
    : never
