import {
  FieldConversionResult,
  type FieldConverter,
  type SafeFieldConverter,
} from 'types/field_converters'

export function safeIdentityConverter<
  V,
  ValuePath extends string,
  Context,
>(): SafeFieldConverter<
  V,
  V,
  ValuePath,
  Context
> {
  return function (v: V) {
    return v
  }
}

export function identityConverter<
  V,
  ValuePath extends string,
  Context,
>(): FieldConverter<
  V,
  V,
  never,
  ValuePath,
  Context
> {
  return function (value: V) {
    return {
      type: FieldConversionResult.Success,
      value,
    }
  }
}
