import { type Field } from 'types/field'
import {
  type FieldConversion,
  FieldConversionResult,
  type FieldConverter,
} from 'types/field_converter'

export class StringToIntegerConverter<E, Fields extends Record<string, Field>>
  implements FieldConverter<E, Fields, number, string>
{
  constructor(private readonly isNanError: E) {
  }

  convert(from: string): FieldConversion<E, number> {
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
  revert(to: number): string {
    return Math.floor(to).toString()
  }
}
