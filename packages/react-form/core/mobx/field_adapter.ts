import {
  type AnnotatedFieldConverter,
  type FieldValueFactory,
  type UnreliableFieldConverter,
} from 'types/field_converters'

export type FieldAdapter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  From = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  To = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValuePath extends string = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any,
> = {
  readonly convert: AnnotatedFieldConverter<From, To, ValuePath, Context>,
  readonly create: FieldValueFactory<From, ValuePath, Context>,
  readonly revert?: UnreliableFieldConverter<To, From, E, ValuePath, Context>,
}

export type FromTypeOfFieldAdapter<C extends FieldAdapter> = C extends FieldAdapter<infer From> ? From
  : never

export type ToTypeOfFieldAdapter<C extends FieldAdapter> = C extends FieldAdapter<infer _F, infer To> ? To
  : never

export type ErrorTypeOfFieldAdapter<C extends FieldAdapter> = C extends FieldAdapter<infer _From, infer _To, infer E>
  ? NonNullable<E>
  : never
