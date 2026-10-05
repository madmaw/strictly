import {
  copy,
  type ExhaustiveArrayOfUnion,
  type ReadonlyTypeOfType,
  reverse,
  type StringKeyOf,
  type Type,
  type ValueOfType,
  type ValueTypesOfDiscriminatedUnion,
} from '@strictly/base'
import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverterWithValueFactory,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from 'form/types/FieldConverters'
import { type z } from 'zod'

// any schema whose values are the literal
type LiteralType<L> = z.core.$ZodType<L>

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
  ) {}

  revert(from: To): UnreliableFieldConversion<From, NoSuchValueError> {
    // oxlint-disable-next-line typescript/no-non-null-assertion -- whether null is allowed is encoded in the generic parameters
    const prototype: From = from == null ? null! : this.values[from]
    if (prototype == null && this.noSuchValueError != null) {
      return {
        type: UnreliableFieldConversionType.Failure,
        error: this.noSuchValueError,
        value: null,
      }
    }
    const value: From =
      prototype == null ? prototype : (copy(this.typeDef, prototype) as From)
    // TODO given we are dealing with strings, maybe we should have a check to make sure value is in the record
    // of values?
    return {
      type: UnreliableFieldConversionType.Success,
      // oxlint-disable-next-line typescript/no-non-null-assertion -- whether null is allowed is encoded in the generic parameters
      value: value!,
    }
  }

  convert(from: From): AnnotatedFieldConversion<To> {
    const value = from == null ? (from as unknown as To) : this.doConvert(from)
    return {
      value,
      required: this.required,
      readonly: false,
    }
  }

  protected abstract doConvert(from: NonNullable<ValueOfType<T>>): To

  create(): From {
    return this.defaultValueKey == null
      ? // oxlint-disable-next-line typescript/no-non-null-assertion -- whether null is allowed is encoded in the generic parameters
        null!
      : this.values[this.defaultValueKey]
  }
}

// the values of the union are the prototypes for the select, one per discriminator value
type DiscriminatedUnionValues<
  U extends Type,
  To extends string | null,
  From,
> = ValueTypesOfDiscriminatedUnion<U> & Readonly<Record<NonNullable<To>, From>>

export class SelectDiscriminatedUnionConverter<
  U extends z.ZodDiscriminatedUnion,
  From extends
    | ValueOfType<ReadonlyTypeOfType<U>>
    | (Required extends true ? never : undefined),
  To extends StringKeyOf<ValueTypesOfDiscriminatedUnion<U>> | null,
  ValuePath extends string,
  Context,
  Required extends boolean,
> extends AbstractSelectValueTypeConverter<
  U,
  From,
  To,
  DiscriminatedUnionValues<U, To, From>,
  never,
  ValuePath,
  Context
> {
  constructor(
    type: U,
    values: ValueTypesOfDiscriminatedUnion<U>,
    defaultValueKey: keyof ValueTypesOfDiscriminatedUnion<U>,
    required: Required,
  ) {
    super(
      type,
      values as DiscriminatedUnionValues<U, To, From>,
      defaultValueKey,
      null,
      required,
    )
  }

  protected override doConvert(from: NonNullable<ValueOfType<U>>) {
    const { discriminator } = this.typeDef.def
    return from[discriminator as keyof typeof from] as To
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
  LiteralType<L>,
  From,
  To,
  Record<NonNullable<To>, NonNullable<From>>,
  NoSuchValueError,
  ValuePath,
  Context
> {
  constructor(
    typeDef: LiteralType<L>,
    private readonly valuesToStrings: Values,
    defaultValue: From | null,
    noSuchValueError: NoSuchValueError | null,
    required: Required,
  ) {
    super(
      typeDef,
      reverse(valuesToStrings),
      defaultValue == null ? null : valuesToStrings[defaultValue],
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
  LiteralType<L>,
  From,
  string | null,
  Record<string, From>,
  NoSuchValueError,
  ValuePath,
  Context
> {
  constructor(
    typeDef: LiteralType<L>,
    allowedValues: ExhaustiveArrayOfUnion<NonNullable<From>, A>,
    defaultValue: L | null,
    noSuchValueError: NoSuchValueError | null,
    required = false,
  ) {
    super(
      typeDef,
      allowedValues.reduce<Record<string, From>>((acc, value) => {
        acc[value] = value
        return acc
      }, {}),
      defaultValue,
      noSuchValueError,
      required,
    )
  }

  protected override doConvert(from: NonNullable<L>) {
    return from
  }
}
