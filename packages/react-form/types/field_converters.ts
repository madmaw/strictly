import { type Maybe } from '@strictly/base'

export enum FieldConversionResult {
  Success = 0,
  Failure = 1,
}
export type FieldConversion<V, E> = {
  type: FieldConversionResult.Success,
  value: V,
} | {
  type: FieldConversionResult.Failure,
  error: E,
  value: Maybe<V>,
}

// convert to the model type from the display type
// for example a text field that renders an integer would have
// a `from` type of `string`, and a `to` type of `number`

// TODO converter can also have the allowable value path as a parameter
export type FieldConverter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
> = {
  (from: From, valuePath: ValuePath, context: Context): FieldConversion<To, E>,
}

export type SafeFieldConverter<
  From,
  To,
  ValuePath extends string,
  Context,
> = {
  (from: From, valuePath: ValuePath, context: Context): To,
}

export type TwoWayFieldConverter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
> = {
  convert: SafeFieldConverter<From, To, ValuePath, Context>,

  revert: FieldConverter<To, From, E, ValuePath, Context>,
}

export type FieldValueFactory<V, ValuePath extends string, Context> = {
  (valuePath: ValuePath, context: Context): V,
}

export type TwoWayFieldConverterWithValueFactory<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
> = TwoWayFieldConverter<From, To, E, ValuePath, Context> & {
  readonly create: FieldValueFactory<From, ValuePath, Context>,
}
