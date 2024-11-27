import {
  type Conversion,
  ConversionResult,
  ValidatedConverter,
} from 'types/converter'
import { type FormField } from 'types/form_field'
import { type Validator } from 'types/validator'

export class StringToIntegerConverter<E, Fields extends Record<string, FormField>>
  extends ValidatedConverter<E, Fields, number, string>
{
  constructor(
    private readonly isNanError: E,
    defaultValue: number = 0,
    preValidators: readonly Validator<E, Fields, string>[] = [],
    postValidators: readonly Validator<E, Fields, number>[] = [],
  ) {
    super(defaultValue, preValidators, postValidators)
  }

  doConvert(from: string): Conversion<E, number> {
    const value = parseInt(from, 10)
    if (Number.isNaN(value)) {
      return {
        type: ConversionResult.Failure,
        error: this.isNanError,
      }
    } else {
      return {
        type: ConversionResult.Success,
        value,
      }
    }
  }
  revert(to: number): string {
    return Math.floor(to).toString()
  }
}
