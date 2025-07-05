import {
  type AnnotatedValidator,
} from 'validation/validator'

export const MinimumStringLengthValidationErrorType = 'minimum_string_length'

export type MinimumStringLengthValidationError = {
  type: typeof MinimumStringLengthValidationErrorType,
  receivedLength: number,
  minimumLength: number,
}

export class MinimumStringLengthValidator
  implements AnnotatedValidator<string, MinimumStringLengthValidationError, never, unknown>
{
  constructor(private readonly minimumLength: number) {
  }

  validate(value: string): MinimumStringLengthValidationError | null {
    if (value.length < this.minimumLength) {
      return {
        type: MinimumStringLengthValidationErrorType,
        minimumLength: this.minimumLength,
        receivedLength: value.length,
      }
    }
    return null
  }

  annotations() {
    return {
      required: this.minimumLength > 0,
      readonly: false,
    }
  }
}
