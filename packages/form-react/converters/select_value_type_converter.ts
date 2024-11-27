import {
  type TypeDefHolder,
  type UnionTypeDef,
  type ValueTypeOf,
} from '@de/fine'
import { copy } from '@de/fine/transformers/copies/copy'
import { type ValueTypesOfDiscriminatedUnion } from '@de/fine/types/value_types_of_discriminated_union'
import {
  type Conversion,
  ConversionResult,
  ValidatedConverter,
} from 'types/converter'
import { type FormField } from 'types/form_field'
import { type Validator } from 'types/validator'

export abstract class AbstractSelectValueTypeConverter<
  E,
  Fields extends Record<string, FormField>,
  T extends TypeDefHolder,
  Values extends Readonly<Record<string, ValueTypeOf<T>>>,
> extends ValidatedConverter<E, Fields, ValueTypeOf<T>, keyof Values> {
  constructor(
    defaultValue: ValueTypeOf<T>,
    protected readonly typeDef: T,
    protected readonly values: Values,
    validators: readonly Validator<E, Fields, keyof Values>[],
  ) {
    super(defaultValue, validators, [])
  }

  doConvert(from: keyof Values): Conversion<E, ValueTypeOf<T>> {
    const prototype = this.values[from]
    const value = copy(this.typeDef, prototype)
    return {
      type: ConversionResult.Success,
      value,
    }
  }

  abstract override revert(to: ValueTypeOf<T>): keyof Values
}

export class SelectDiscriminatedUnionConverter<
  E,
  Fields extends Record<string, FormField>,
  U extends UnionTypeDef,
> extends AbstractSelectValueTypeConverter<E, Fields, TypeDefHolder<U>, ValueTypesOfDiscriminatedUnion<U>> {
  constructor(
    defaultValueKey: keyof U['unions'],
    typeDef: TypeDefHolder<U>,
    values: ValueTypesOfDiscriminatedUnion<U>,
    validators: Validator<E, Fields, keyof ValueTypesOfDiscriminatedUnion<U>>[] = [],
  ) {
    super(
      values[defaultValueKey],
      typeDef,
      values,
      validators,
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
