import { ChainedFieldConverter } from 'field_converters/chained_field_converter'
import { ValidatingConverter } from 'field_converters/validating_converter'
import { PrototypingFieldValueFactory } from 'field_value_factories/prototyping_field_value_factory'
import { type Field } from 'types/field'
import { type FieldConverter } from 'types/field_converter'
import { type FieldValidator } from 'types/field_validator'
import { type FieldValueFactory } from 'types/field_value_factory'

class FieldAdapterBuilder<
  E,
  Fields extends Readonly<Record<string, Field>>,
  To,
  From,
> {
  constructor(
    readonly converter: FieldConverter<E, Fields, To, From>,
    readonly valueFactory: FieldValueFactory<Fields, To>,
  ) {
  }

  validateFrom(...validators: readonly FieldValidator<E, Fields, From>[]): FieldAdapterBuilder<E, Fields, To, From> {
    return new FieldAdapterBuilder<E, Fields, To, From>(
      new ChainedFieldConverter(
        new ValidatingConverter(validators),
        this.converter,
      ),
      this.valueFactory,
    )
  }
  validateTo<
    E2,
  >(...validators: readonly FieldValidator<E2, Fields, To>[]): FieldAdapterBuilder<E | E2, Fields, To, From> {
    return new FieldAdapterBuilder<E | E2, Fields, To, From>(
      new ChainedFieldConverter(
        this.converter,
        new ValidatingConverter<E | E2, Fields, To>(validators),
      ),
      this.valueFactory,
    )
  }

  chainFrom<From2>(converter: FieldConverter<E, Fields, From, From2>) {
    return new FieldAdapterBuilder<E, Fields, To, From2>(
      new ChainedFieldConverter(
        converter,
        this.converter,
      ),
      this.valueFactory,
    )
  }

  chainTo(converter: FieldConverter<E, Fields, To, To>) {
    return new FieldAdapterBuilder<E, Fields, To, From>(
      new ChainedFieldConverter(
        this.converter,
        converter,
      ),
      this.valueFactory,
    )
  }
}

export function adapter<
  E,
  Fields extends Readonly<Record<string, Field>>,
  To,
  From,
>(
  converter: FieldConverter<E, Fields, To, From>,
  valueFactory: FieldValueFactory<Fields, To>,
) {
  return new FieldAdapterBuilder(converter, valueFactory)
}

export function adapterFromConverter<
  E,
  Fields extends Readonly<Record<string, Field>>,
  To,
  From,
>(converter: FieldConverter<E, Fields, To, From> & FieldValueFactory<Fields, To>) {
  return new FieldAdapterBuilder(converter, converter)
}

export function adapterFromPrototype<
  E,
  Fields extends Readonly<Record<string, Field>>,
  To,
  From,
>(
  converter: FieldConverter<E, Fields, To, From>,
  prototype: To,
) {
  return new FieldAdapterBuilder(converter, new PrototypingFieldValueFactory(prototype))
}

export function identityAdapter<
  V,
>(prototype: V) {
  return new FieldAdapterBuilder(
    new ValidatingConverter<never, Readonly<Record<string, Field>>, V>(),
    new PrototypingFieldValueFactory(prototype),
  )
}
