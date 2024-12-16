import {
  type FieldConversion,
  FieldConversionResult,
  type TwoWayFieldConverter,
} from 'types/field_converters'

export class IntegerToStringConverter<E, ValuePath extends string, Context>
  implements TwoWayFieldConverter<number, string, E, ValuePath, Context>
{
  constructor(private readonly isNanError: E) {
  }

  convert(from: number): string {
    return Math.floor(from).toString()
  }

  revert(from: string): FieldConversion<number, E> {
    const value = parseInt(from, 10)
    if (Number.isNaN(value)) {
      return {
        type: FieldConversionResult.Failure,
        error: this.isNanError,
        value: null,
      }
    } else {
      return {
        type: FieldConversionResult.Success,
        value,
      }
    }
  }
}
