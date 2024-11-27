import { type FormField } from './form_field'
import { type Validator } from './validator'

export enum ConversionResult {
  Success = 0,
  Failure = 1,
}
export type Conversion<E, V> = {
  type: ConversionResult.Success,
  value: V,
} | {
  type: ConversionResult.Failure,
  error: E,
}

// convert to the model type from the display type
// for example a text field that renders an integer would have
// a `from` type of `string`, and a `to` type of `number`

export type Converter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  Fields extends Readonly<Record<string, FormField>> = Readonly<Record<string, FormField>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  To = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  From = any,
> = {
  convert(from: From, valuePath: keyof Fields, fields: Fields): Conversion<E, To>,
  revert(to: To): From,
  readonly defaultValue: To,
}

export type ErrorTypeOfConverter<C extends Converter> = C extends Converter<infer E> ? E : never

export type FromTypeOfConverter<C extends Converter> = ReturnType<C['revert']>

export type ToTypeOfConverter<C extends Converter> = C extends Converter<infer _E, infer _F, infer To> ? To : never

export abstract class ValidatedConverter<E, Fields extends Readonly<Record<string, FormField>>, To, From>
  implements Converter<E, Fields, To, From>
{
  constructor(
    readonly defaultValue: To,
    private readonly preValidators: readonly Validator<E, Fields, From>[],
    private readonly postValidators: readonly Validator<E, Fields, To>[],
  ) {
  }

  private validate<V>(
    validators: readonly Validator<E, Fields, V>[],
    value: V,
    valuePath: keyof Fields,
    fields: Fields,
  ): E | null {
    return validators.reduce<E | null>(function (acc, validator) {
      return acc || validator(value, valuePath, fields)
    }, null)
  }

  convert(from: From, valuePath: keyof Fields, fields: Fields): Conversion<E, To> {
    const preError = this.validate(this.preValidators, from, valuePath, fields)
    if (preError != null) {
      return {
        type: ConversionResult.Failure,
        error: preError,
      }
    }
    const conversion = this.doConvert(from, valuePath, fields)
    if (conversion.type === ConversionResult.Failure) {
      return conversion
    }
    const postError = this.validate(this.postValidators, conversion.value, valuePath, fields)
    if (postError != null) {
      return {
        type: ConversionResult.Failure,
        error: postError,
      }
    }
    return conversion
  }

  protected abstract doConvert(from: From, valuePath: keyof Fields, fields: Fields): Conversion<E, To>

  abstract revert(to: To): From
}
