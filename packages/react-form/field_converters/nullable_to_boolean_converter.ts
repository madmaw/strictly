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
  NullType extends null | undefined,
> implements TwoWayFieldConverterWithValueFactory<
  ValueOfType<ReadonlyTypeOfType<T>> | NullType,
  boolean,
  E,
  ValuePath,
  Context
> {
  readonly defaultValue: ValueOfType<ReadonlyTypeOfType<T>> | NullType

  constructor(
    private readonly typeDef: T,
    private readonly prototype: ValueOfType<ReadonlyTypeOfType<T>>,
    private readonly nullType: NullType,
    defaultToNull = true,
  ) {
    this.defaultValue = defaultToNull ? this.nullType : prototype
  }

  convert(from: ValueOfType<ReadonlyTypeOfType<T>> | NullType): AnnotatedFieldConversion<boolean> {
    return {
      value: from !== this.nullType,
      required: false,
      readonly: false,
    }
  }

  revert(from: boolean): UnreliableFieldConversion<ValueOfType<ReadonlyTypeOfType<T>> | NullType, E> {
    if (from) {
      const value: ValueOfType<T> = copy(this.typeDef, this.prototype)
      return {
        type: UnreliableFieldConversionType.Success,
        value,
      }
    }
    return {
      type: UnreliableFieldConversionType.Success,
      value: this.nullType,
    }
  }

  create(): ValueOfType<ReadonlyTypeOfType<T>> | NullType {
    return this.defaultValue
  }
}
