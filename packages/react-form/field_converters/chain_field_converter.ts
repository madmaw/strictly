import {
  UnreachableError,
} from '@strictly/base'
import {
  type AnnotatedFieldConversion,
  type AnnotatedFieldConverter,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
  type UnreliableFieldConverter,
} from 'types/field_converters'

export function chainUnreliableFieldConverter<
  From,
  Intermediate,
  To,
  E1,
  E2,
  ValuePath extends string,
  Context,
>(
  from: UnreliableFieldConverter<From, Intermediate, E1, ValuePath, Context>,
  to: UnreliableFieldConverter<Intermediate, To, E2, ValuePath, Context>,
): UnreliableFieldConverter<From, To, E1 | E2, ValuePath, Context> {
  return function (value: From, valuePath: ValuePath, context: Context): UnreliableFieldConversion<To, E1 | E2> {
    const fromConversion = from(value, valuePath, context)
    switch (fromConversion.type) {
      case UnreliableFieldConversionType.Success:
        return to(fromConversion.value, valuePath, context)
      case UnreliableFieldConversionType.Failure:
        if (fromConversion.value != null) {
          const toConversion = to(fromConversion.value[0], valuePath, context)
          switch (toConversion.type) {
            case UnreliableFieldConversionType.Success:
              return {
                type: UnreliableFieldConversionType.Failure,
                error: fromConversion.error,
                value: [toConversion.value],
              }
            case UnreliableFieldConversionType.Failure:
              return {
                type: UnreliableFieldConversionType.Failure,
                error: fromConversion.error,
                value: toConversion.value,
              }
            default:
              throw new UnreachableError(toConversion)
          }
        } else {
          return {
            type: UnreliableFieldConversionType.Failure,
            error: fromConversion.error,
            value: null,
          }
        }
      default:
        throw new UnreachableError(fromConversion)
    }
  }
}

export function chainAnnotatedFieldConverter<
  From,
  Intermediate,
  To,
  ValuePath extends string,
  Context,
>(
  from: AnnotatedFieldConverter<From, Intermediate, ValuePath, Context>,
  to: AnnotatedFieldConverter<Intermediate, To, ValuePath, Context>,
): AnnotatedFieldConverter<From, To, ValuePath, Context> {
  return function (value: From, valuePath: ValuePath, context: Context): AnnotatedFieldConversion {
    const {
      required: intermediateRequired,
      readonly: intermediateReadonly,
      value: intermediateValue,
    } = from(value, valuePath, context)
    const {
      required: finalRequired,
      readonly: finalReadonly,
      value: finalValue,
    } = to(intermediateValue, valuePath, context)
    return {
      value: finalValue,
      required: intermediateRequired || finalRequired,
      readonly: intermediateReadonly || finalReadonly,
    }
  }
}
