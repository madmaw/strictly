import { type Field } from 'types/field'
import {
  type FieldConversion,
  FieldConversionResult,
  type FieldConverter,
} from 'types/field_converter'

export class TrimmingStringConverter<Fields extends Record<string, Field>>
  implements FieldConverter<never, Fields, string, string>
{
  constructor() {
  }

  convert(from: string): FieldConversion<never, string> {
    return {
      type: FieldConversionResult.Success,
      value: from.trim(),
    }
  }

  revert(to: string): string {
    return to
  }
}
