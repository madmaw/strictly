import {
  validate,
  type Validator,
} from '@strictly/define'
import {
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
  type UnreliableFieldConverter,
} from 'types/FieldConverters'

// delete this?
export function validatingConverter<
  V,
  E,
  ValuePath extends string,
  Context,
>(validators: readonly Validator<V, E, ValuePath, Context>[] = []): UnreliableFieldConverter<
  V,
  V,
  E,
  ValuePath,
  Context
> {
  return function (value: V, valuePath: ValuePath, context: Context): UnreliableFieldConversion<V, E> {
    return validators.reduce<UnreliableFieldConversion<V, E>>(
      function (acc, validator) {
        if (acc.type === UnreliableFieldConversionType.Success) {
          const error = validate(validator, value, valuePath, context)
          if (error != null) {
            return {
              type: UnreliableFieldConversionType.Failure,
              error,
              value: [value],
            }
          }
        }
        return acc
      },
      {
        type: UnreliableFieldConversionType.Success,
        value,
      },
    )
  }
}
