import {
  type AnnotatedValidator,
} from 'validation/validator'

export const MaximumStringLengthValidationErrorType = 'maximum_string_length'

export type MaximumStringLengthValidationError = {
  type: typeof MaximumStringLengthValidationErrorType,
  receivedLength: number,
  maximumLength: number,
}

export class MaximumStringLengthValidator
  implements AnnotatedValidator<string, MaximumStringLengthValidationError, never, unknown>
{
  constructor(private readonly maximumLength: number) {
  }

  validate(value: string): MaximumStringLengthValidationError | null {
    if (value.length > this.maximumLength) {
      return {
        type: MaximumStringLengthValidationErrorType,
        maximumLength: this.maximumLength,
        receivedLength: value.length,
      }
    }
    return null
  }

  annotations() {
    return {
      required: false,
      readonly: false,
    }
  }
}
