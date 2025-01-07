import {
  type AnnotatedValidator,
} from 'validation/validator'

export const MinimumStringLengthValidationErrorType = 'minimum_string_length'

export type MinimumStringLengthValidationError = {
  type: typeof MinimumStringLengthValidationErrorType,
  receivedLength: number,
  minimumLength: number,
}

export class MinimumStringLengthValidator<ValuePath extends string, Context>
  implements AnnotatedValidator<string, MinimumStringLengthValidationError, ValuePath, Context>
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
      required: true,
    }
  }
}
