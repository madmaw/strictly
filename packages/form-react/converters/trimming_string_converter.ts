import {
  type Conversion,
  ConversionResult,
  ValidatedConverter,
} from 'types/converter'
import { type FormField } from 'types/form_field'
import { type Validator } from 'types/validator'

export class TrimmingStringConverter<E, Fields extends Record<string, FormField>>
  extends ValidatedConverter<E, Fields, string, string>
{
  constructor(
    defaultValue = '',
    validators: readonly Validator<E, Fields, string>[] = [],
  ) {
    super(defaultValue, [], validators)
  }

  doConvert(from: string): Conversion<E, string> {
    return {
      type: ConversionResult.Success,
      value: from.trim(),
    }
  }

  revert(to: string): string {
    return to
  }
}
