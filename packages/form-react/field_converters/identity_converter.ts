import {
  FieldConversionResult,
  type FieldConverter,
  type SafeFieldConverter,
} from 'types/field_converters'

export function safeIdentityConverter<V, ValuePath extends string>(): SafeFieldConverter<V, V, ValuePath> {
  return function (v: V) {
    return v
  }
}

export function identityConverter<V, ValuePath extends string>(): FieldConverter<V, V, never, ValuePath> {
  return function (value: V) {
    return {
      type: FieldConversionResult.Success,
      value,
    }
  }
}
