import {
  type AnnotatedValidator,
  type Annotations,
  annotations,
  validate,
  type Validator,
} from 'validation/validator'

export class CompositeValidator<V, E, ValuePath extends string, C> implements AnnotatedValidator<V, E, ValuePath, C> {
  private readonly validators: readonly Validator<V, E, ValuePath, C>[]
  constructor(...validators: readonly Validator<V, E, ValuePath, C>[]) {
    this.validators = validators
  }

  validate(v: V, valuePath: ValuePath, context: C) {
    return this.validators.reduce<E | null>((error, validator) => {
      if (error != null) {
        return error
      }
      return validate(validator, v, valuePath, context)
    }, null)
  }

  annotations(valuePath: ValuePath, context: C): Annotations {
    return this.validators.reduce<Annotations>(({
      required,
      readonly,
    }, validator) => {
      const {
        readonly: validatorReadonly,
        required: validatorRequired,
      } = annotations(validator, valuePath, context)
      return {
        required: required || validatorRequired,
        readonly: readonly || validatorReadonly,
      }
    }, {
      required: false,
      readonly: false,
    })
  }
}
