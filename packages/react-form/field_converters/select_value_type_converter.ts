import {
  type ExhaustiveArrayOfUnion,
  reverse,
  type StringKeyOf,
} from '@strictly/base'
import {
  copy,
  type LiteralTypeDef,
  type ReadonlyTypeOfType,
  type Type,
  type UnionTypeDef,
  type ValueOfType,
  type ValueTypesOfDiscriminatedUnion,
} from '@strictly/define'
import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverterWithValueFactory,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from 'types/field_converters'

export abstract class AbstractSelectValueTypeConverter<
  T extends Type,
  From extends ValueOfType<T> | undefined,
  To extends string | null,
  Values extends Readonly<Record<NonNullable<To>, From>>,
  NoSuchValueError,
  ValuePath extends string,
  Context,
> implements TwoWayFieldConverterWithValueFactory<
  From,
  To,
  NoSuchValueError,
  ValuePath,
  Context
> {
  constructor(
    protected readonly typeDef: T,
    protected readonly values: Values,
    private readonly defaultValueKey: keyof Values | null | undefined,
    private readonly noSuchValueError: NoSuchValueError | null,
    private readonly required: boolean,
  ) {
  }

  revert(from: To): UnreliableFieldConversion<From, NoSuchValueError> {
    const prototype: From = from == null ? null! : this.values[from]
    if (prototype == null && this.noSuchValueError != null) {
      return {
        type: UnreliableFieldConversionType.Failure,
        error: this.noSuchValueError,
        value: null,
      }
    }
    const value = prototype == null ? prototype : copy(this.typeDef, prototype)
    // TODO given we are dealing with strings, maybe we should have a check to make sure value is in the record
    // of values?
    return {
      type: UnreliableFieldConversionType.Success,
      value: value!,
    }
  }

  convert(from: From): AnnotatedFieldConversion<To> {
    const value = from == null ? from! : this.doConvert(from)
    return {
      value,
      required: this.required,
      disabled: false,
    }
  }

  protected abstract doConvert(from: NonNullable<ValueOfType<T>>): To

  create(): From {
    return this.defaultValueKey != null ? this.values[this.defaultValueKey] : null!
  }
}

export class SelectDiscriminatedUnionConverter<
  U extends UnionTypeDef,
  From extends ValueOfType<ReadonlyTypeOfType<Type<U>>> | (Required extends true ? never : undefined),
  To extends StringKeyOf<U['unions']> | null,
  ValuePath extends string,
  Context,
  Required extends boolean,
> extends AbstractSelectValueTypeConverter<
  Type<U>,
  From,
  To,
  ValueTypesOfDiscriminatedUnion<U>,
  never,
  ValuePath,
  Context
> {
  constructor(
    type: Type<U>,
    values: ValueTypesOfDiscriminatedUnion<U>,
    defaultValueKey: keyof U['unions'],
    required: Required,
  ) {
    super(
      type,
      values,
      defaultValueKey,
      null,
      required,
    )
  }

  protected override doConvert(from: NonNullable<ValueOfType<Type<U>>>) {
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
  From extends L | (Required extends true ? never : undefined),
  To extends string | null,
  Values extends Record<NonNullable<From>, NonNullable<To>>,
  NoSuchValueError,
  ValuePath extends string,
  Context,
  Required extends boolean,
> extends AbstractSelectValueTypeConverter<
  Type<LiteralTypeDef<L>>,
  From,
  To,
  Record<NonNullable<To>, NonNullable<From>>,
  NoSuchValueError,
  ValuePath,
  Context
> {
  constructor(
    typeDef: Type<LiteralTypeDef<L>>,
    private readonly valuesToStrings: Values,
    defaultValue: From,
    noSuchValueError: NoSuchValueError | null,
    required: Required,
  ) {
    super(
      typeDef,
      reverse(valuesToStrings),
      defaultValue && valuesToStrings[defaultValue],
      noSuchValueError,
      required,
    )
  }

  protected override doConvert(from: NonNullable<From>) {
    return this.valuesToStrings[from]
  }
}

export class SelectStringConverter<
  L extends string | null,
  From extends L | undefined,
  A extends readonly NonNullable<From>[],
  NoSuchValueError,
  ValuePath extends string,
  Context,
> extends AbstractSelectValueTypeConverter<
  Type<LiteralTypeDef<L>>,
  From,
  string | null,
  Record<string, From>,
  NoSuchValueError,
  ValuePath,
  Context
> {
  constructor(
    typeDef: Type<LiteralTypeDef<L>>,
    allowedValues: ExhaustiveArrayOfUnion<NonNullable<From>, A>,
    defaultValue: L | undefined,
    noSuchValueError: NoSuchValueError | null,
    required = false,
  ) {
    super(
      typeDef,
      allowedValues.reduce<Record<string, From>>(
        function (acc, value) {
          acc[value] = value
          return acc
        },
        {},
      ),
      defaultValue,
      noSuchValueError,
      required,
    )
  }

  protected override doConvert(from: NonNullable<L>) {
    return from
  }
}
