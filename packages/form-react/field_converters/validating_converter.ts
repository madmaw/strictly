import { type Field } from 'types/field'
import {
  type FieldConversion,
  FieldConversionResult,
  type FieldConverter,
} from 'types/field_converter'
import { type FieldValidator } from 'types/field_validator'

export class ValidatingConverter<E, Fields extends Record<string, Field>, V>
  implements FieldConverter<E, Fields, V, V>
{
  constructor(private readonly validators: readonly FieldValidator<E, Fields, V>[] = []) {
  }

  convert(from: V, valuePath: keyof Fields, fields: Fields): FieldConversion<E, V> {
    return this.validators.reduce<FieldConversion<E, V>>(
      function (acc, validator) {
        if (acc.type === FieldConversionResult.Success) {
          const error = validator(from, valuePath, fields)
          if (error != null) {
            return {
              type: FieldConversionResult.Failure,
              error,
              value: [from],
            }
          }
        }
        return acc
      },
      {
        type: FieldConversionResult.Success,
        value: from,
      },
    )
  }

  revert(to: V): V {
    return to
  }
}
