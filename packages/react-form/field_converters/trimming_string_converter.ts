import {
  type FieldConversion,
  FieldConversionResult,
  type TwoWayFieldConverter,
} from 'types/field_converters'

export class TrimmingStringConverter<ValuePath extends string, Context>
  implements TwoWayFieldConverter<string, string, never, ValuePath, Context>
{
  constructor() {
  }

  convert(to: string): string {
    return to.trim()
  }

  revert(from: string): FieldConversion<string, never> {
    return {
      type: FieldConversionResult.Success,
      value: from.trim(),
    }
  }
}
