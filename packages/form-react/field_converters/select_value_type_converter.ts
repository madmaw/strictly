import {
  type TypeDefHolder,
  type UnionTypeDef,
  type ValueTypeOf,
} from '@de/fine'
import { copy } from '@de/fine/transformers/copies/copy'
import { type ValueTypesOfDiscriminatedUnion } from '@de/fine/types/value_types_of_discriminated_union'
import {
  type FieldConversion,
  FieldConversionResult,
  type TwoWayFieldConverterWithValueFactory,
} from 'types/field_converters'

export abstract class AbstractSelectValueTypeConverter<
  T extends TypeDefHolder,
  Values extends Readonly<Record<string, ValueTypeOf<T>>>,
  ValuePath extends string,
> implements TwoWayFieldConverterWithValueFactory<ValueTypeOf<T>, keyof Values, never, ValuePath> {
  constructor(
    protected readonly typeDef: T,
    protected readonly values: Values,
    private readonly defaultValueKey: keyof Values,
  ) {
  }

  revert(from: keyof Values): FieldConversion<ValueTypeOf<T>, never> {
    const prototype = this.values[from]
    const value = copy(this.typeDef, prototype)
    // TODO given we are dealing with strings, maybe we should have a check to make sure value is in the record
    // of values?
    return {
      type: FieldConversionResult.Success,
      value,
    }
  }

  abstract convert(to: ValueTypeOf<T>): keyof Values

  create(): ValueTypeOf<T> {
    return this.values[this.defaultValueKey]
  }
}

export class SelectDiscriminatedUnionConverter<
  U extends UnionTypeDef,
  ValuePath extends string,
> extends AbstractSelectValueTypeConverter<TypeDefHolder<U>, ValueTypesOfDiscriminatedUnion<U>, ValuePath> {
  constructor(
    typeDef: TypeDefHolder<U>,
    values: ValueTypesOfDiscriminatedUnion<U>,
    defaultValueKey: keyof U['unions'],
  ) {
    super(
      typeDef,
      values,
      defaultValueKey,
    )
  }

  override convert(to: ValueTypeOf<TypeDefHolder<U>>) {
    const {
      typeDef: {
        discriminator,
      },
    } = this.typeDef
    return to[discriminator!]
  }
}
