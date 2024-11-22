import {
  type ReadonlyTypeDefOf,
  type TypeDefHolder,
  type ValueTypeOf,
} from '@de/fine'
import { copy } from '@de/fine/transformers/copies/copy'
import {
  type Conversion,
  ConversionResult,
  type Converter,
} from 'types/converter'
import { type FormField } from 'types/form_field'

export class NullableToBooleanConverter<E, T extends TypeDefHolder>
  implements Converter<E, Record<string, FormField>, ValueTypeOf<T> | null, boolean>
{
  constructor(private readonly typeDef: T, private readonly prototype: ValueTypeOf<ReadonlyTypeDefOf<T>>) {
  }

  convert(from: boolean): Conversion<E, ValueTypeOf<T> | null> {
    if (from) {
      const value: ValueTypeOf<T> = copy(this.typeDef, this.prototype)
      return {
        type: ConversionResult.Success,
        value,
      }
    }
    return {
      type: ConversionResult.Success,
      value: null,
    }
  }

  revert(to: ValueTypeOf<T> | null): boolean {
    return to != null
  }
}
