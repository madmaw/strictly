import {
  type FieldConversion,
  type TwoWayFieldConverter,
} from 'types/field_converters'

export class MaybeIdentityConverter<From, To, E, ValuePath extends string>
  implements TwoWayFieldConverter<From, From | To, E, ValuePath>
{
  constructor(
    private readonly converter: TwoWayFieldConverter<From, To, E, ValuePath>,
    private readonly isFrom: (to: From | To) => to is From,
  ) {
  }

  convert(from: From, valuePath: ValuePath): To | From {
    return this.converter.convert(from, valuePath)
  }

  revert(from: To | From, valuePath: ValuePath): FieldConversion<From, E> {
    const value = this.isFrom(from) ? this.converter.convert(from, valuePath) : from
    return this.converter.revert(value, valuePath)
  }
}
