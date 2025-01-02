import { type Validator } from '@strictly/define'
import {
  type FieldConversion,
  FieldConversionResult,
  type FieldConverter,
} from 'types/field_converters'

// delete this?
export function validatingConverter<
  V,
  E,
  ValuePath extends string,
  Context,
>(validators: readonly Validator<V, E, ValuePath, Context>[] = []): FieldConverter<V, V, E, ValuePath, Context> {
  return function (value: V, valuePath: ValuePath, context: Context): FieldConversion<V, E> {
    return validators.reduce<FieldConversion<V, E>>(
      function (acc, validator) {
        if (acc.type === FieldConversionResult.Success) {
          const error = validator(value, valuePath, context)
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
