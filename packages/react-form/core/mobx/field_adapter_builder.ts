import {
  chainAnnotatedFieldConverter,
  chainUnreliableFieldConverter,
} from 'field_converters/chain_field_converter'
import {
  annotatedIdentityConverter,
  unreliableIdentityConverter,
} from 'field_converters/identity_converter'
import { MaybeIdentityConverter } from 'field_converters/maybe_identity_converter'
import { prototypingFieldValueFactory } from 'field_value_factories/prototyping_field_value_factory'
import {
  type AnnotatedFieldConverter,
  type FieldValueFactory,
  type TwoWayFieldConverter,
  type TwoWayFieldConverterWithValueFactory,
  type UnreliableFieldConverter,
} from 'types/field_converters'
import { type FieldAdapter } from './field_adapter'

class FieldAdapterBuilder<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
> {
  constructor(
    readonly convert: AnnotatedFieldConverter<From, To, ValuePath, Context>,
    readonly create: FieldValueFactory<From, ValuePath, Context>,
    readonly revert?: UnreliableFieldConverter<To, From, E, ValuePath, Context>,
  ) {
  }

  chain<To2, E2 = E>(
    converter: AnnotatedFieldConverter<To, To2, ValuePath, Context>,
    reverter?: UnreliableFieldConverter<To2, To, E2, ValuePath, Context>,
  ): FieldAdapterBuilder<From, To2, E | E2, ValuePath, Context> {
    return new FieldAdapterBuilder(
      chainAnnotatedFieldConverter<
        From,
        To,
        To2,
        ValuePath,
        Context
      >(
        this.convert,
        converter,
      ),
      this.create,
      this.revert && reverter && chainUnreliableFieldConverter<
        To2,
        To,
        From,
        E2,
        E,
        ValuePath,
        Context
      >(
        reverter,
        this.revert,
      ),
    )
  }

  withReverter(reverter: UnreliableFieldConverter<
    To,
    From,
    E,
    ValuePath,
    Context
  >): FieldAdapterBuilder<
    From,
    To,
    E,
    ValuePath,
    Context
  > {
    return new FieldAdapterBuilder(
      this.convert,
      this.create,
      reverter,
    )
  }

  withIdentity(isFrom: (from: To | From) => from is From): FieldAdapterBuilder<
    From,
    To | From,
    E,
    ValuePath,
    Context
  > {
    const identityConverter = new MaybeIdentityConverter<From, To, E, ValuePath, Context>({
      convert: this.convert,
      // should never get called if null
      revert: this.revert!,
    }, isFrom)
    return new FieldAdapterBuilder(
      identityConverter.convert.bind(identityConverter),
      this.create,
      this.revert && identityConverter.revert.bind(identityConverter),
    )
  }

  get narrow(): FieldAdapter<From, To, E, ValuePath, Context> {
    return this
  }
}

export function adapter<
  From,
  To,
  ValuePath extends string,
  Context,
>(
  converter: AnnotatedFieldConverter<From, To, ValuePath, Context>,
  valueFactory: FieldValueFactory<From, ValuePath, Context>,
): FieldAdapterBuilder<From, To, never, ValuePath, Context>
export function adapter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
>(
  converter: AnnotatedFieldConverter<From, To, ValuePath, Context>,
  valueFactory: FieldValueFactory<From, ValuePath, Context>,
  reverter: UnreliableFieldConverter<To, From, E, ValuePath, Context>,
): FieldAdapterBuilder<From, To, E, ValuePath, Context>
export function adapter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
>(
  converter: AnnotatedFieldConverter<From, To, ValuePath, Context>,
  valueFactory: FieldValueFactory<From, ValuePath, Context>,
  reverter?: UnreliableFieldConverter<To, From, E, ValuePath, Context>,
): FieldAdapterBuilder<From, To, E, ValuePath, Context> {
  return new FieldAdapterBuilder(converter, valueFactory, reverter)
}

export function adapterFromTwoWayConverter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
>(
  converter: TwoWayFieldConverter<From, To, E, ValuePath, Context>,
  valueFactory: FieldValueFactory<From, ValuePath, Context>,
): FieldAdapterBuilder<From, To, E, ValuePath, Context>
export function adapterFromTwoWayConverter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
>(converter: TwoWayFieldConverterWithValueFactory<
  From,
  To,
  E,
  ValuePath,
  Context
>): FieldAdapterBuilder<
  From,
  To,
  E,
  ValuePath,
  Context
>
export function adapterFromTwoWayConverter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
>(
  converter: TwoWayFieldConverter<
    From,
    To,
    E,
    ValuePath,
    Context
  > | TwoWayFieldConverterWithValueFactory<
    From,
    To,
    E,
    ValuePath,
    Context
  >,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  valueFactory: FieldValueFactory<From, ValuePath, Context> = (converter as TwoWayFieldConverterWithValueFactory<
    From,
    To,
    E,
    ValuePath,
    Context
  >).create.bind(converter),
): FieldAdapterBuilder<From, To, E, ValuePath, Context> {
  return new FieldAdapterBuilder(
    converter.convert.bind(converter),
    valueFactory,
    converter.revert.bind(converter),
  )
}

export function adapterFromPrototype<
  From,
  To,
  ValuePath extends string,
  Context,
>(
  converter: AnnotatedFieldConverter<From, To, ValuePath, Context>,
  prototype: From,
): FieldAdapterBuilder<From, To, never, ValuePath, Context>
export function adapterFromPrototype<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
>(
  converter: TwoWayFieldConverter<From, To, E, ValuePath, Context>,
  prototype: From,
): FieldAdapterBuilder<From, To, E, ValuePath, Context>
export function adapterFromPrototype<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
>(
  converter: AnnotatedFieldConverter<
    From,
    To,
    ValuePath,
    Context
  > | TwoWayFieldConverter<
    From,
    To,
    E,
    ValuePath,
    Context
  >,
  prototype: From,
): FieldAdapterBuilder<From, To, E, ValuePath, Context> {
  const factory = prototypingFieldValueFactory<From, ValuePath, Context>(prototype)
  return typeof converter === 'function'
    ? new FieldAdapterBuilder(converter, factory)
    : new FieldAdapterBuilder(converter.convert.bind(converter), factory, converter.revert.bind(converter))
}

export function identityAdapter<
  V,
  ValuePath extends string,
  Context,
>(prototype: V, required?: boolean) {
  return new FieldAdapterBuilder(
    annotatedIdentityConverter<V, ValuePath, Context>(required),
    prototypingFieldValueFactory(prototype),
    unreliableIdentityConverter<V, ValuePath, Context>(),
  )
}

export function listAdapter<
  E,
  ValuePath extends string,
  Context,
>() {
  return new FieldAdapterBuilder<readonly E[], readonly E[], never, ValuePath, Context>(
    annotatedIdentityConverter<readonly E[], ValuePath, Context>(false),
    prototypingFieldValueFactory<readonly E[], ValuePath, Context>([]),
    unreliableIdentityConverter<readonly E[], ValuePath, Context>(),
  )
}
