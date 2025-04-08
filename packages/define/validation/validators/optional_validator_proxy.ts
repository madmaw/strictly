import { type AnnotatedValidator } from 'validation/validator'

export class OptionalValidatorProxy<
  V,
  V1 extends V,
  E,
  ValuePath extends string,
  Context,
> implements AnnotatedValidator<
  V,
  E,
  ValuePath,
  Context
> {
  static createNullable<
    V,
    E,
    ValuePath extends string,
    Context,
  >(proxied: AnnotatedValidator<NonNullable<V>, E, ValuePath, Context>) {
    return new OptionalValidatorProxy(proxied, (v: V) => v != null)
  }

  static createNullableOrEmptyString<
    V extends string | null | undefined,
    E,
    ValuePath extends string,
    Context,
  >(proxied: AnnotatedValidator<NonNullable<V>, E, ValuePath, Context>) {
    return new OptionalValidatorProxy(proxied, (v: V): v is NonNullable<V> => v != null && v !== '')
  }

  constructor(
    private readonly proxied: AnnotatedValidator<V1, E, ValuePath, Context>,
    private readonly isRequired: (v: V) => v is V1,
  ) {
  }

  validate(v: V, valuePath: ValuePath, context: Context): E | null {
    if (this.isRequired(v)) {
      return this.proxied.validate(v, valuePath, context)
    }
    return null
  }

  annotations(valuePath: ValuePath, context: Context) {
    return {
      ...this.proxied.annotations(valuePath, context),
      required: false,
    }
  }
}
