import { type AnnotatedValidator } from 'validation/validator'

export class DefinedValidator<V, E> implements AnnotatedValidator<V | null | undefined, E, never, never> {
  constructor(private readonly error: E) {
  }

  validate(v: V | null | undefined): E | null {
    if (v == null) {
      return this.error
    }
    return null
  }

  annotations() {
    return {
      required: true,
      readonly: false,
    }
  }
}
