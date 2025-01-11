import { type AnnotatedValidator } from 'validation/validator'

export class DefinedValidator<V, E, ValuePath extends string, Context>
  implements AnnotatedValidator<V | null | undefined, E, ValuePath, Context>
{
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
