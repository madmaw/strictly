import {
  type ReadonlyTypeDefOf,
  type TypeDefHolder,
  type ValueTypeOf,
} from '@de/fine'
import { copy } from '@de/fine/transformers/copies/copy'
import { type Field } from 'types/field'
import {
  type FieldConversion,
  FieldConversionResult,
  type FieldConverter,
} from 'types/field_converter'
import { type FieldValueFactory } from 'types/field_value_factory'

export class NullableToBooleanConverter<E, T extends TypeDefHolder>
  implements FieldConverter<E, Record<string, Field>, ValueTypeOf<T> | null, boolean>,
    FieldValueFactory<Record<string, Field>, ValueTypeOf<T> | null>
{
  readonly defaultValue: ValueTypeOf<T> | null

  constructor(
    private readonly typeDef: T,
    private readonly prototype: ValueTypeOf<ReadonlyTypeDefOf<T>>,
    defaultToNull = true,
  ) {
    this.defaultValue = defaultToNull ? null : prototype
  }

  convert(from: boolean): FieldConversion<E, ValueTypeOf<T> | null> {
    if (from) {
      const value: ValueTypeOf<T> = copy(this.typeDef, this.prototype)
      return {
        type: FieldConversionResult.Success,
        value,
      }
    }
    return {
      type: FieldConversionResult.Success,
      value: null,
    }
  }

  revert(to: ValueTypeOf<T> | null): boolean {
    return to != null
  }

  create(): ValueTypeOf<T> | null {
    return this.defaultValue
  }
}
