import { bound } from 'util/bound'
import { type AnnotatedValidator } from 'validation/validator'

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
