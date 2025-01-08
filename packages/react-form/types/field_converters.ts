import { type Maybe } from '@strictly/base'

export enum UnreliableFieldConversionType {
  Success = 0,
  Failure = 1,
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnreliableFieldConversion<V = any, E = any> = {
  type: UnreliableFieldConversionType.Success,
  value: V,
} | {
  type: UnreliableFieldConversionType.Failure,
  error: E,
  value: Maybe<V>,
}

// convert to the model type from the display type
// for example a text field that renders an integer would have
// a `from` type of `string`, and a `to` type of `number`

// TODO converter can also have the allowable value path as a parameter
export type UnreliableFieldConverter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
> = {
  (from: From, valuePath: ValuePath, context: Context): UnreliableFieldConversion<To, E>,
}

export type Annotation = {
  required: boolean,
  disabled: boolean,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnnotatedFieldConversion<V = any> = {
  value: V,
} & Annotation

export type AnnotatedFieldConverter<
  From,
  To,
  ValuePath extends string,
  Context,
> = {
  (from: From, valuePath: ValuePath, context: Context): AnnotatedFieldConversion<To>,
}

export type TwoWayFieldConverter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
> = {
  convert: AnnotatedFieldConverter<From, To, ValuePath, Context>,

  revert: UnreliableFieldConverter<To, From, E, ValuePath, Context>,
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
