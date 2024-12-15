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
>(
  from: FieldConverter<From, Intermediate, E1, ValuePath>,
  to: FieldConverter<Intermediate, To, E2, ValuePath>,
): FieldConverter<From, To, E1 | E2, ValuePath> {
  return function (value: From, valuePath: ValuePath): FieldConversion<To, E1 | E2> {
    const fromConversion = from(value, valuePath)
    switch (fromConversion.type) {
      case FieldConversionResult.Success:
        return to(fromConversion.value, valuePath)
      case FieldConversionResult.Failure:
        if (fromConversion.value != null) {
          const toConversion = to(fromConversion.value[0], valuePath)
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
>(
  from: SafeFieldConverter<From, Intermediate, ValuePath>,
  to: SafeFieldConverter<Intermediate, To, ValuePath>,
): SafeFieldConverter<From, To, ValuePath> {
  return function (value: From, valuePath: ValuePath): To {
    const intermediate = from(value, valuePath)
    return to(intermediate, valuePath)
  }
}
