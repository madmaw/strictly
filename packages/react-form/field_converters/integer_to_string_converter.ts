import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverter,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from 'types/field_converters'

export class IntegerToStringConverter<E, ValuePath extends string, Context>
  implements TwoWayFieldConverter<number, string, E, ValuePath, Context>
{
  constructor(private readonly isNanError: E, private readonly base = 10) {
  }

  convert(from: number): AnnotatedFieldConversion<string> {
    const value = Math.floor(from).toString()
    return {
      value,
      required: false,
    }
  }

  revert(from: string): UnreliableFieldConversion<number, E> {
    const value = parseInt(from, this.base)
    if (Number.isNaN(value)) {
      return {
        type: UnreliableFieldConversionType.Failure,
        error: this.isNanError,
        value: null,
      }
    } else {
      return {
        type: UnreliableFieldConversionType.Success,
        value,
      }
    }
  }
}
