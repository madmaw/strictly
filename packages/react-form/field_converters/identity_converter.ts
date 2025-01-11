import {
  type AnnotatedFieldConverter,
  UnreliableFieldConversionType,
  type UnreliableFieldConverter,
} from 'types/field_converters'

export function annotatedIdentityConverter<
  V,
  ValuePath extends string,
  Context,
>(required: boolean = false): AnnotatedFieldConverter<
  V,
  V,
  ValuePath,
  Context
> {
  return function (value: V) {
    return {
      value,
      required,
      readonly: false,
    }
  }
}

export function unreliableIdentityConverter<
  V,
  ValuePath extends string,
  Context,
>(): UnreliableFieldConverter<
  V,
  V,
  never,
  ValuePath,
  Context
> {
  return function (value: V) {
    return {
      type: UnreliableFieldConversionType.Success,
      value,
    }
  }
}
