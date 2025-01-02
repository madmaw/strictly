import { type Validator } from 'validation/validator'

export const MinimumStringLengthValidationErrorType = 'minimum_string_length'

export type MinimumStringLengthValidationError = {
  type: typeof MinimumStringLengthValidationErrorType,
  receivedLength: number,
  minimumLength: number,
}

export function minimumStringLengthValidatorFactory<
  ValuePath extends string,
  Context,
>(minimumLength: number): Validator<
  string,
  MinimumStringLengthValidationError,
  ValuePath,
  Context
> {
  return function (value: string) {
    if (value.length < minimumLength) {
      return {
        type: MinimumStringLengthValidationErrorType,
        minimumLength,
        receivedLength: value.length,
      }
    }
    return null
  }
}
