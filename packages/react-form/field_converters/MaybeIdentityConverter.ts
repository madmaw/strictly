import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverter,
  type UnreliableFieldConversion,
} from 'types/FieldConverters'

export class MaybeIdentityConverter<From, To, E, ValuePath extends string, Context>
  implements TwoWayFieldConverter<From, From | To, E, ValuePath, Context>
{
  constructor(
    private readonly converter: TwoWayFieldConverter<From, To, E, ValuePath, Context>,
    private readonly isFrom: (to: From | To) => to is From,
  ) {
  }

  convert(from: From, valuePath: ValuePath, context: Context): AnnotatedFieldConversion<To | From> {
    return this.converter.convert(from, valuePath, context)
  }

  revert(from: To | From, valuePath: ValuePath, context: Context): UnreliableFieldConversion<From, E> {
    const value = this.isFrom(from)
      ? this.converter.convert(from, valuePath, context).value
      : from
    return this.converter.revert(value, valuePath, context)
  }
}
