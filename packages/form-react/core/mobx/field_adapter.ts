import {
  type FieldConverter,
  type FieldValueFactory,
  type SafeFieldConverter,
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
> = {
  readonly convert: SafeFieldConverter<From, To, ValuePath>,
  readonly create: FieldValueFactory<From, ValuePath>,
  readonly revert?: FieldConverter<To, From, E, ValuePath>,
}

export type FromTypeOfFieldAdapter<C extends FieldAdapter> = C extends FieldAdapter<infer From> ? From
  : never

export type ToTypeOfFieldAdapter<C extends FieldAdapter> = C extends FieldAdapter<infer _F, infer To> ? To
  : never

export type ErrorTypeOfFieldAdapter<C extends FieldAdapter> = C extends FieldAdapter<infer _From, infer _To, infer E>
  ? NonNullable<E>
  : never
