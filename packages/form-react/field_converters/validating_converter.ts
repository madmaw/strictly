import {
  type FieldConversion,
  FieldConversionResult,
  type FieldConverter,
} from 'types/field_converters'
import { type FieldValidator } from 'types/field_validator'

export function validatingConverter<
  V,
  E,
  ValuePath extends string,
>(validators: readonly FieldValidator<V, E, ValuePath>[] = []): FieldConverter<V, V, E, ValuePath> {
  return function (value: V, valuePath: ValuePath): FieldConversion<V, E> {
    return validators.reduce<FieldConversion<V, E>>(
      function (acc, validator) {
        if (acc.type === FieldConversionResult.Success) {
          const error = validator(value, valuePath)
          if (error != null) {
            return {
              type: FieldConversionResult.Failure,
              error,
              value: [value],
            }
          }
        }
        return acc
      },
      {
        type: FieldConversionResult.Success,
        value,
      },
    )
  }
}
