import {
  copy,
  type ReadonlyTypeOfType,
  type Type,
  type ValueOfType,
} from '@strictly/define'
import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverterWithValueFactory,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from 'types/field_converters'

export class NullableToBooleanConverter<
  T extends Type,
  E,
  ValuePath extends string,
  Context,
> implements TwoWayFieldConverterWithValueFactory<
  ValueOfType<ReadonlyTypeOfType<T>> | null,
  boolean,
  E,
  ValuePath,
  Context
> {
  readonly defaultValue: ValueOfType<ReadonlyTypeOfType<T>> | null

  constructor(
    private readonly typeDef: T,
    private readonly prototype: ValueOfType<ReadonlyTypeOfType<T>>,
    defaultToNull = true,
  ) {
    this.defaultValue = defaultToNull ? null : prototype
  }

  convert(from: ValueOfType<ReadonlyTypeOfType<T>> | null): AnnotatedFieldConversion<boolean> {
    return {
      value: from != null,
      required: false,
      disabled: false,
    }
  }

  revert(from: boolean): UnreliableFieldConversion<ValueOfType<ReadonlyTypeOfType<T>> | null, E> {
    if (from) {
      const value: ValueOfType<T> = copy(this.typeDef, this.prototype)
      return {
        type: UnreliableFieldConversionType.Success,
        value,
      }
    }
    return {
      type: UnreliableFieldConversionType.Success,
      value: null,
    }
  }

  create(): ValueOfType<ReadonlyTypeOfType<T>> | null {
    return this.defaultValue
  }
}
