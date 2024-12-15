import { type Maybe } from '@de/base'

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
> = {
  (from: From, valuePath: ValuePath): FieldConversion<To, E>,
}

export type SafeFieldConverter<
  From,
  To,
  ValuePath extends string,
> = {
  (from: From, valuePath: ValuePath): To,
}

export type TwoWayFieldConverter<
  From,
  To,
  E,
  ValuePath extends string,
> = {
  convert: SafeFieldConverter<From, To, ValuePath>,

  revert: FieldConverter<To, From, E, ValuePath>,
}

export type FieldValueFactory<V, ValuePath extends string> = {
  (valuePath: ValuePath): V,
}

export type TwoWayFieldConverterWithValueFactory<
  From,
  To,
  E,
  ValuePath extends string,
> = TwoWayFieldConverter<From, To, E, ValuePath> & {
  readonly create: FieldValueFactory<From, ValuePath>,
}
