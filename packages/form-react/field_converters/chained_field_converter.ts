import { UnreachableError } from '@de/base'
import { type Field } from 'types/field'
import {
  type FieldConversion,
  FieldConversionResult,
  type FieldConverter,
} from 'types/field_converter'

export class ChainedFieldConverter<
  E,
  Fields extends Readonly<Record<string, Field>>,
  To,
  Intermediate,
  From,
> implements FieldConverter<E, Fields, To, From> {
  constructor(
    private readonly from: FieldConverter<E, Fields, Intermediate, From>,
    private readonly to: FieldConverter<E, Fields, To, Intermediate>,
  ) {
  }

  convert(from: From, valuePath: keyof Fields, fields: Fields): FieldConversion<E, To> {
    const fromConversion = this.from.convert(from, valuePath, fields)
    switch (fromConversion.type) {
      case FieldConversionResult.Success:
        return this.to.convert(fromConversion.value, valuePath, fields)
      case FieldConversionResult.Failure:
        if (fromConversion.value != null) {
          const toConversion = this.to.convert(fromConversion.value[0], valuePath, fields)
          switch (toConversion.type) {
            case FieldConversionResult.Success:
              return {
                type: FieldConversionResult.Failure,
                error: fromConversion.error,
                value: [toConversion.value],
              }
            case FieldConversionResult.Failure:
              return {
                type: FieldConversionResult.Failure,
                error: fromConversion.error,
                value: toConversion.value,
              }
            default:
              throw new UnreachableError(toConversion)
          }
        } else {
          return {
            type: FieldConversionResult.Failure,
            error: fromConversion.error,
            value: null,
          }
        }
      default:
        throw new UnreachableError(fromConversion)
    }
  }

  revert(to: To): From {
    return this.from.revert(this.to.revert(to))
  }
}
