import {
  reverse,
  type StringKeyOf,
} from '@strictly/base'
import {
  copy,
  type LiteralTypeDef,
  type Type,
  type UnionTypeDef,
  type ValueTypeOf,
  type ValueTypesOfDiscriminatedUnion,
} from '@strictly/define'
import {
  type FieldConversion,
  FieldConversionResult,
  type TwoWayFieldConverterWithValueFactory,
} from 'types/field_converters'

export abstract class AbstractSelectValueTypeConverter<
  T extends Type,
  To extends string | null,
  Values extends Readonly<Record<NonNullable<To>, ValueTypeOf<T>>>,
  NoSuchValueError,
  ValuePath extends string,
  Context,
> implements TwoWayFieldConverterWithValueFactory<
  ValueTypeOf<T>,
  keyof Values | null,
  NoSuchValueError,
  ValuePath,
  Context
> {
  constructor(
    protected readonly typeDef: T,
    protected readonly values: Values,
    private readonly defaultValueKey: keyof Values | null,
    private readonly noSuchValueError: NoSuchValueError | null,
  ) {
  }

  revert(from: keyof Values | null): FieldConversion<ValueTypeOf<T>, NoSuchValueError> {
    const prototype: ValueTypeOf<T> | null = from == null ? null : this.values[from]
    if (prototype == null && this.noSuchValueError != null) {
      return {
        type: FieldConversionResult.Failure,
        error: this.noSuchValueError,
        value: null,
      }
    }
    const value = prototype == null ? null : copy(this.typeDef, prototype)
    // TODO given we are dealing with strings, maybe we should have a check to make sure value is in the record
    // of values?
    return {
      type: FieldConversionResult.Success,
      value: value!,
    }
  }

  convert(from: ValueTypeOf<T>): To {
    if (from == null) {
      return null!
    }
    return this.doConvert(from)
  }

  protected abstract doConvert(from: ValueTypeOf<T>): To

  create(): ValueTypeOf<T> {
    return this.defaultValueKey != null ? this.values[this.defaultValueKey] : null!
  }
}

export class SelectDiscriminatedUnionConverter<
  U extends UnionTypeDef,
  To extends StringKeyOf<U['unions']> | null,
  ValuePath extends string,
  Context,
> extends AbstractSelectValueTypeConverter<
  Type<U>,
  To,
  ValueTypesOfDiscriminatedUnion<U>,
  never,
  ValuePath,
  Context
> {
  constructor(
    typeDef: Type<U>,
    values: ValueTypesOfDiscriminatedUnion<U>,
    defaultValueKey: keyof U['unions'],
  ) {
    super(
      typeDef,
      values,
      defaultValueKey,
      null,
    )
  }

  protected override doConvert(from: ValueTypeOf<Type<U>>) {
    const {
      definition: {
        discriminator,
      },
    } = this.typeDef
    return from[discriminator!]
  }
}

export class SelectLiteralConverter<
  L extends string | number | null,
  To extends string | null,
  Values extends Record<NonNullable<L>, NonNullable<To>>,
  NoSuchValueError,
  ValuePath extends string,
  Context,
> extends AbstractSelectValueTypeConverter<
  Type<LiteralTypeDef<L>>,
  To,
  Record<NonNullable<To>, L>,
  NoSuchValueError,
  ValuePath,
  Context
> {
  constructor(
    typeDef: Type<LiteralTypeDef<L>>,
    private readonly valuesToStrings: Values,
    defaultValue: L | null,
    noSuchValueError: NoSuchValueError | null,
  ) {
    super(
      typeDef,
      reverse(valuesToStrings),
      defaultValue && valuesToStrings[defaultValue],
      noSuchValueError,
    )
  }

  protected override doConvert(from: L) {
    return from && this.valuesToStrings[from]
  }
}
