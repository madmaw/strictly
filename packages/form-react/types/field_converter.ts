import { type Maybe } from '@de/base'
import { type Field } from './field'

export enum FieldConversionResult {
  Success = 0,
  Failure = 1,
}
export type FieldConversion<E, V> = {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  Fields extends Readonly<Record<string, Field>> = Readonly<Record<string, Field>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  To = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  From = any,
> = {
  convert?(from: From, valuePath: keyof Fields, fields: Fields): FieldConversion<E, To>,
  revert(to: To, valuePath: keyof Fields): From,
}
