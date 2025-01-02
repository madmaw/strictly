import {
  copy,
  type ReadonlyTypeOfType,
  type Type,
  type ValueOfType,
} from '@strictly/define'
import {
  type FieldConversion,
  FieldConversionResult,
  type TwoWayFieldConverterWithValueFactory,
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

  convert(from: ValueOfType<ReadonlyTypeOfType<T>> | null): boolean {
    return from != null
  }

  revert(from: boolean): FieldConversion<ValueOfType<ReadonlyTypeOfType<T>> | null, E> {
    if (from) {
      const value: ValueOfType<T> = copy(this.typeDef, this.prototype)
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

  create(): ValueOfType<ReadonlyTypeOfType<T>> | null {
    return this.defaultValue
  }
}
