import {
  UnreachableError,
} from '@de/base'
import {
  type FieldConversion,
  FieldConversionResult,
  type FieldConverter,
  type SafeFieldConverter,
} from 'types/field_converters'

export function chainFieldConverter<
  From,
  Intermediate,
  To,
  E1,
  E2,
  ValuePath extends string,
  Context,
>(
  from: FieldConverter<From, Intermediate, E1, ValuePath, Context>,
  to: FieldConverter<Intermediate, To, E2, ValuePath, Context>,
): FieldConverter<From, To, E1 | E2, ValuePath, Context> {
  return function (value: From, valuePath: ValuePath, context: Context): FieldConversion<To, E1 | E2> {
    const fromConversion = from(value, valuePath, context)
    switch (fromConversion.type) {
      case FieldConversionResult.Success:
        return to(fromConversion.value, valuePath, context)
      case FieldConversionResult.Failure:
        if (fromConversion.value != null) {
          const toConversion = to(fromConversion.value[0], valuePath, context)
          switch (toConversion.type) {
            case FieldConversionResult.Success:
              return {
                type: FieldConversionResult.Failure,
                error: fromConversion.error,
                value: [toConversion.value],
              }
            case FieldConversionResult.Failure:
              return {
                type: FieldConversionResult.Failure,
                error: fromConversion.error,
                value: toConversion.value,
              }
            default:
              throw new UnreachableError(toConversion)
          }
        } else {
          return {
            type: FieldConversionResult.Failure,
            error: fromConversion.error,
            value: null,
          }
        }
      default:
        throw new UnreachableError(fromConversion)
    }
  }
}

export function chainSafeFieldConverter<
  From,
  Intermediate,
  To,
  ValuePath extends string,
  Context,
>(
  from: SafeFieldConverter<From, Intermediate, ValuePath, Context>,
  to: SafeFieldConverter<Intermediate, To, ValuePath, Context>,
): SafeFieldConverter<From, To, ValuePath, Context> {
  return function (value: From, valuePath: ValuePath, context: Context): To {
    const intermediate = from(value, valuePath, context)
    return to(intermediate, valuePath, context)
  }
}
