import {
  type TypeDefHolder,
  type UnionTypeDef,
  type ValueTypeOf,
} from '@de/fine'
import { copy } from '@de/fine/transformers/copies/copy'
import { type ValueTypesOfDiscriminatedUnion } from '@de/fine/types/value_types_of_discriminated_union'
import { type Field } from 'types/field'
import {
  type FieldConversion,
  FieldConversionResult,
  type FieldConverter,
} from 'types/field_converter'
import { type FieldValueFactory } from 'types/field_value_factory'

export abstract class AbstractSelectValueTypeConverter<
  Fields extends Record<string, Field>,
  T extends TypeDefHolder,
  Values extends Readonly<Record<string, ValueTypeOf<T>>>,
> implements FieldConverter<never, Fields, ValueTypeOf<T>, keyof Values>, FieldValueFactory<Fields, ValueTypeOf<T>> {
  constructor(
    protected readonly typeDef: T,
    protected readonly values: Values,
    private readonly defaultValueKey: keyof Values,
  ) {
  }

  convert(from: keyof Values): FieldConversion<never, ValueTypeOf<T>> {
    const prototype = this.values[from]
    const value = copy(this.typeDef, prototype)
    return {
      type: FieldConversionResult.Success,
      value,
    }
  }

  abstract revert(to: ValueTypeOf<T>): keyof Values

  create(): ValueTypeOf<T> {
    return this.values[this.defaultValueKey]
  }
}

export class SelectDiscriminatedUnionConverter<
  Fields extends Record<string, Field>,
  U extends UnionTypeDef,
> extends AbstractSelectValueTypeConverter<Fields, TypeDefHolder<U>, ValueTypesOfDiscriminatedUnion<U>> {
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

  override revert(to: ValueTypeOf<TypeDefHolder<U>>) {
    const {
      typeDef: {
        discriminator,
      },
    } = this.typeDef
    return to[discriminator!]
  }
}
