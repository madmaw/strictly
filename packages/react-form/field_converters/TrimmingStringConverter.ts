import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverter,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from 'types/FieldConverters'

export class TrimmingStringConverter<ValuePath extends string, Context>
  implements TwoWayFieldConverter<string, string, never, ValuePath, Context>
{
  constructor() {
  }

  convert(to: string): AnnotatedFieldConversion<string> {
    return {
      value: to.trim(),
      required: false,
      readonly: false,
    }
  }

  revert(from: string): UnreliableFieldConversion<string, never> {
    return {
      type: UnreliableFieldConversionType.Success,
      value: from.trim(),
    }
  }
}
