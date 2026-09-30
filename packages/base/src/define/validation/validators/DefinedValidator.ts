import { type AnnotatedValidator } from 'define/validation/validator'
import { bound } from 'util/bound'

export class DefinedValidator<V, E> implements AnnotatedValidator<
  V | null | undefined,
  E,
  never,
  never
> {
  constructor(private readonly error: E) {}

  @bound
  validate(v: V | null | undefined): E | null {
    if (v == null) {
      return this.error
    }
    return null
  }

  @bound
  annotations() {
    return {
      required: true,
      readonly: false,
    }
  }
}
