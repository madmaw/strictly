import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverter,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from 'form/types/FieldConverters'

export class IntegerToStringConverter<
  E,
  ValuePath extends string,
  Context,
> implements TwoWayFieldConverter<number, string, E, ValuePath, Context> {
  constructor(
    private readonly isNanError: E,
    private readonly base = 10,
  ) {}

  convert(from: number): AnnotatedFieldConversion<string> {
    const value = Math.floor(from).toString()
    return {
      value,
      required: false,
      readonly: false,
    }
  }

  revert(from: string): UnreliableFieldConversion<number, E> {
    // oxlint-disable-next-line radix -- the base is supplied by the caller
    const value = Number.parseInt(from, this.base)
    if (Number.isNaN(value)) {
      return {
        type: UnreliableFieldConversionType.Failure,
        error: this.isNanError,
        value: null,
      }
    }
    return {
      type: UnreliableFieldConversionType.Success,
      value,
    }
  }
}
