import {
  type Conversion,
  ConversionResult,
  ValidatedConverter,
} from 'types/converter'
import { type FormField } from 'types/form_field'
import { type Validator } from 'types/validator'

export class PassThroughConverter<E, Fields extends Record<string, FormField>, V>
  extends ValidatedConverter<E, Fields, V, V>
{
  constructor(validators: readonly Validator<E, Fields, V>[] = []) {
    super(validators, [])
  }

  doConvert(from: V): Conversion<E, V> {
    return {
      type: ConversionResult.Success,
      value: from,
    }
  }

  revert(to: V): V {
    return to
  }
}
